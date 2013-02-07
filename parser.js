var restraints = require('./restraints')
  , debug = require('./debug')

function makeInterface(equation) {
  //interface to module
  var propNames = Object.getOwnPropertyNames
    , hash = parseStatement(equation)

  function set(propOrHash, val) {
    if (propOrHash === 'forget') {
      hash = parseStatement(equation) //forget old values
      updatePropertiesOnSet()
      return
    }

    var setters
    if (val) {
      setters = {}
      setters[propOrHash] = val //its a single setter
    } else {
      setters = propOrHash //it's a hash
    }
    propNames(setters)
      .filter(function(prop) { //only properties that hash has
        return prop in hash
      })
      .forEach(function(prop) {
        setVariableInHash(prop, hash, setters[prop])
      })

    updatePropertiesOnSet()
  }

  function updatePropertiesOnSet() { //attach hash properties to set
    propNames(hash)
      .forEach(function(prop) {
        set[prop] = getVariableValueInHash(prop, hash)
      })
  }

  set.watch = function(prop, string) {
    restraints.watch(hash[prop], string || equation)
  }

  return set
}
module.exports = makeInterface


var restraintFunctions = {
   division : restraints.divider
  , multiplication : restraints.multiplier
  , addition : restraints.adder
  , subtraction : restraints.subtractor
  , exponentiation : restraints.exponent
}
function parseStatement(originalInput) {
  var hash = {}
    , lh
    , rh

  function parse(input) {
    //reverse pemdas -> sadmep
    //find the least precedent order of operation first, they will be our top nodes in our recursive descending parser
    //this is how the parser performs its transformations
    //  3 + 4 * x = 10 + y -> ((3) + ((4) * (x))) = ((10) + (y)) -> each set of parens indicates another call to parse
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
      operation = 'exponentiation'
    } else if (isParen(input)) {                  //p
      return parse(textOfParen(input))
    } else if (isConstant(input)) { //no need to recurse further. these our the primitives.
      return restraints.constant(constantValue(input))
    } else if (isVariable(input)) { //no need to recurse further. these our the primitives.
      var vName = variableName(input)
        , ret = addVariableToHash(vName, hash)

      debug('parsed variable named -> ' + vName)
      debug(function() {
        restraints.watch(ret, 'debugging variable ' + vName) //this is for testing
      })

      return ret
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
    connectionFunc = restraintFunctions[operation]
    connectionFunc(parse(lh), parse(rh), topNode)
    return topNode
  }

  originalInput = originalInput.replace(/\s/g, '') //remove white space
  lh = parse(originalInput.split('=')[0])
  rh = parse(originalInput.split('=')[1])
  restraints.equate(lh, rh) //lh=rh

  return hash
}

//functions to identify syntax
var operationCharacters = {
    division : '/'
  , multiplication : '*'
  , addition : '+'
  , subtraction : '-'
  , exponentiation : '^'
}

function leftHand(operation, input) {
  return input.slice(0, findNextIndex(operationCharacters[operation], input))
}
function rightHand(operation, input) {
  return input.slice(findNextIndex(operationCharacters[operation], input) + 1)
}

function isOpGeneric(type, input) {
  return findNextIndex(operationCharacters[type], input) !== -1
}
function isSubtraction(input) {
  return isOpGeneric('subtraction', input)
}
function isAddition(input) {
  return isOpGeneric('addition', input)
}
function isDivision(input) {
  return isOpGeneric('division', input)
}
function isMultiplication(input) {
  return isOpGeneric('multiplication', input)
}
function isExponent(input) {
  return isOpGeneric('exponentiation', input)
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

//dealing w/ our hash
function addVariableToHash(name, hash) {
  var conn = restraints.makeConnector()
  if (!hash[name]) hash[name] = []
  hash[name].push(conn)

  return conn
}
function setVariableInHash(name, hash, val) {
  hash[name].forEach(function(connector) {
    connector.value = val
  })
}
function getVariableValueInHash(name, hash) {
  return hash[name][0].value //all values should be same
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











