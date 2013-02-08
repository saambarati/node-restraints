var EventEmitter = require('events').EventEmitter
  , debug = require('./debug')

function adder(a1, a2, sum) { //a1 + a2 = sum
  function update(connector) {
    var v, toSet
    if (a1.hasValue && a2.hasValue) {
      sum.value = a1.value + a2.value
    } else if (a1.hasValue && sum.hasValue) { //a2=sum-a1
      a2.value = sum.value - a1.value
    } else if (a2.hasValue && sum.hasValue) { //a1=sum-a2
      a1.value = sum.value - a2.value
    }
  }

  var connectors = [a1, a2, sum]
  connect(connectors, 'update', update)
  connect(connectors, 'forgot', makeForgot(connectors))
}
exports.adder = adder


function subtractor(a1, a2, sum) { //a1 - a2 = sum -> sum + a2 = a1
  adder(sum, a2, a1)
}
exports.subtractor = subtractor

function multiplier(p1, p2, product) { //p1*p2 = product
  function update(connector) {
    if ((p1.hasValue && p1.value === 0) || (p2.hasValue && p2.value === 0)) {
      product.value = 0
    } else if (p1.hasValue && p2.hasValue) {      //p1*p2=product
      product.value = p1.value * p2.value
    } else if (p1.hasValue && product.hasValue) { //p2=product/p1
      p2.value = product.value / p1.value
    } else if (p2.hasValue && product.hasValue) { //p1=product/p2
      p1.value = product.value / p2.value
    }
  }

  var connectors = [p1, p2, product]
  connect(connectors, 'update', update)
  connect(connectors, 'forgot', makeForgot(connectors))
}
exports.multiplier = multiplier

function divider(d1, d2, div) { //d1/d2=div -> d2*div=d1
  multiplier(d2, div, d1)
}
exports.divider = divider

function exponent(base, power, result) {
  var pow = Math.pow
    , ln = Math.log
  function update(connector) {
    if (power.hasValue && power.value === 0 && base.value !== 0) { //base^0 = 1
      result.value = 1
    } else if (base.hasValue && base.value === 0) {
      result.value = 0
    } else if (base.hasValue && power.hasValue) {   //base^power = result
      result.value = pow(base.value, power.value)
    } else if (result.hasValue && power.hasValue) { //base = result^(1/power)
      base.value = pow(result.value, 1/power.value)
    } else if (base.hasValue && result.hasValue) {  //power = log base 'base' w/ argument result
      //log change of base formula
      power.value = ln(result.value)/ln(base.value)
    }
  }

  var connectors = [base, power, result]
  connect(connectors, 'update', update)
  connect(connectors, 'forgot', makeForgot(connectors))
}
exports.exponent = exponent

function makeForgot(connectors) {
  function forgot(conn) {
    connectors.filter(function (itm) {
      return itm !== conn
    }).forEach(function (itm) {
      itm.forget()
    })
  }
  return forgot
}

function constant(value) {
  var connector = makeConnector()
    , lock = false

  function set(v) {
    if (lock) return
    lock = true
    debug('attempting to change a constant value to : ' + v)
    connector.emit('update', connector)
    lock = false
  }
  Object.defineProperty(connector, 'value', {
      set : set
    , get : function() { return value }
    , configurable : false
    , enumerable : true
  })
  Object.defineProperty(connector, 'hasValue', {
      value : true
    , configurable : false
    , enumerable : true
  })

  return connector
}
exports.constant = constant

function equate(a, b) {
  var c0 = constant(0)
  adder(a, c0, b) //a+0=b
}
exports.equate = equate

function connect(connectors, eventName, f) {
  connectors.forEach(function (c) {
    c.on(eventName, f)
  })
}

//connector data structure
function makeConnector() {
  var connector = new EventEmitter()
    , value = null //this is our only state we are worried about
    , lock = false

  connector.on('newListener', function(evName, listener) {
    if (connector.hasValue) connector.emit('update')
  })

  connector.forget = function() {
    if (lock) return
    lock = true
    value = null
    connector.emit('forgot', connector)
    lock = false
  }

  function setter(val) {
    if (lock) return //prevent infinite recursion
    //debug('setting value of connector to : ' + val)
    lock = true
    value = val
    connector.emit('update', connector)
    lock = false
  }

  Object.defineProperty(connector, 'value', {
      set : setter
    , get : function() { return value }
    , enumerable : true
    , configurable : true
  })
  Object.defineProperty(connector, 'hasValue', {
      get : function () { return connector.value !== null }
    , set : function () { throw new Error('cant set hasValue') }
    , configurable : true
    , enumerable : true
  })

  return connector
}
exports.makeConnector = makeConnector

function watch(c, name) {
  function print() {
    if (c.value === null) return
    console.log('connector: ' + name + '.  value: ' + c.value)
  }
  c.on('update', print)
  c.on('forgot', print)

}
exports.watch = watch

