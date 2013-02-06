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

function watch(name, c) {
  function print() {
    if (c.value === null) return
    console.log('connector: ' + name + '.  value: ' + c.value)
  }
  c.on('update', print)
  c.on('forgot', print)
}
exports.watch = watch


var f = makeConnector()
  , c = makeConnector()
watch('fahrenheit', f)
watch('celsius', c)

//

function celsiusFahrenheitConverter(c, f) {
  // 9*c = bridge = 5 * (f - 32)
  var c9 = constant(9)
    , c5 = constant(5)
    , c32 = constant(32)
    , sub = makeConnector()
    , bridge = makeConnector()

  subtractor(f, c32, sub)
  multiplier(c9, c, bridge)
  multiplier(c5, sub, bridge)
}

celsiusFahrenheitConverter(c, f)
c.value = 0
c.forget()
f.value = 75
f.forget()
c.value = 25















