
var restraints = require('./restraints')
  , debug = require('./debug')


var connections = {
   division : restraints.divider
  , multiplication : restraints.multiplier
  , addition : restraints.adder
  , subtraction : restraints.subtractor
}
function parseStatement(originalInput) {
  var hash = {}
    , lh
    , rh

  function parse(input) {
    //reverse pemdas -> sadmep
    //find the least precedent order of operation first, they will be our top nodes
    var operation

    if (isSubtraction(input)) {                   //s
      operation = 'subtraction'
    } else if (isAddition(input)) {               //a
      operation = 'addition'
    } else if (isDivision(input)) {               //d
      operation = 'division'
    } else if (isMultiplication(input)) {         //m
      operation = 'multiplication'
    } else if (isExponent(input)) {               //e
      operation = 'exponent'
    } else if (isParen(input)) {                  //p
      return parse(textOfParen(input))
    } else if (isConstant(input)) { //no need to recurse further. these our the primitives.
      return restraints.constant(constantValue(input))
    } else if (isVariable(input)) { //no need to recurse further. these our the primitives.
      var vName = variableName(input)
      debug('parsed variable named -> ' + vName)
      hash[vName] = restraints.makeConnector()
      restraints.watch('debugging variable ' + vName, hash[vName]) //this is for testing
      return hash[vName]
    } else {
      throw new Error('unrecognized input type to parse function : ' + input)
    }

    var connectionFunc
      , topNode = restraints.makeConnector()
      , lh
      , rh

    lh = leftHand(operation, input)
    rh = rightHand(operation, input)
    debug('lh -> ' + lh)
    debug('rh -> ' + rh)
    connectionFunc = connections[operation]
    connectionFunc(parse(lh), parse(rh), topNode)
    return topNode
  }

  originalInput = originalInput.replace(/\s/g, '') //remove white space
  lh = parse(originalInput.split('=')[0])
  rh = parse(originalInput.split('=')[1])
  restraints.equate(lh, rh) //lh+0=rh

  //interface to outside
  function set(name, val) {
    hash[name].value = val
  }
  set.hash = hash
  return set
}
parseStatement.findNextIndex = findNextIndex
module.exports = parseStatement


//functions to identify syntax
var operationCharacters = {
    division : '/'
  , multiplication : '*'
  , addition : '+'
  , subtraction : '-'
  , exponent : '^'
}

function leftHand(operation, input) {
  return input.slice(0, findNextIndex(operationCharacters[operation], input))
}
function rightHand(operation, input) {
  return input.slice(findNextIndex(operationCharacters[operation], input) + 1)
}

function isOpGeneric(op, input) {
  return findNextIndex(op, input) !== -1
}
function isSubtraction(input) {
  return isOpGeneric(operationCharacters.subtraction, input)
}
function isAddition(input) {
  return isOpGeneric(operationCharacters.addition, input)
}
function isDivision(input) {
  return isOpGeneric(operationCharacters.division, input)
}
function isMultiplication(input) {
  return isOpGeneric(operationCharacters.multiplication, input)
}
function isExponent(input) {
  return isOpGeneric(operationCharacters.exponent, input)
}
function isParen(input) {
  return input[0] === '('
}
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
var isConstant = isNumber

function constantValue(input) {
  return parseFloat(input, 10) //base 10
}
function textOfParen(input) {
  return input.slice(1, input.length - 1)
}
var variableRegex = /^[A-Za-z]+$/
function isVariable(input) {
  return variableRegex.test(input)
}
function variableName(input) {
  return input
}

function findNextIndex(searchingFor, input) { //ignores parentheses
  var idx = 0
  , lParen = 0
  , rParen = 0
  , cur

  while (idx < input.length) {
    cur = input.charAt(idx)
    if (cur === '(') lParen += 1
    else if (cur === ')') rParen += 1
    else if (cur === searchingFor && lParen === rParen) return idx

    idx += 1
  }

  return -1
}











