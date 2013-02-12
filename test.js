var restraints = require('./parser')
  , assert = require('assert')

var f = restraints('10 + y = 10 + 10 + 10 + x + 10 + 10')
f({'y': 100})
assert(f.x === 60)

var f = restraints('10 + y*(2*(3)*((4))) = x + 5')
f({'y': 100})
assert(f.x === 2405)

var f = restraints('9*c = 5 * (f - 32)')
f({'f': 80})
f('forget') //forget value
f({'c': 25})
assert(f.f === 77)


var f = restraints('x^y = z')
f({'x' : 2})
f({'y' : 2})
assert(f.z === 4)
f('forget')
f({'x': 2})
f({'z' : 4})
assert(f.y === 2)

var f = restraints('x^y = z')
f({'y' : 2})
f({'z' : 4})

var f = restraints('x^(1/2) = z')
f({x : 9})
f('forget')

var f = restraints('x^y = z')
f({x:10, y:2})
f('forget')
assert(!f.y)
f({x : 2, z : 8})
assert(f.y === 3)


var f = restraints('2*x^(1/2) = z + 10 - 5')
f({x : 4})
assert(f.z === -1)

var f = restraints('y = x^(1/2)')
f({x : -4})
assert(!f.y) //NaN

var f = restraints('y = y + x')
f({y : 10})
assert(f.x === 0)

var f = restraints('y = .5*y + x')
f({y : 10})
assert(f.x === 5)

var f = restraints('y = (2*x)^2 + 10*x + 5')
f({x : 2})
assert(f.y === 41)
var f = restraints('y = 2*x^2 + 10*x + 5')
f({x : 2})
assert(f.y === 33)

var f = restraints('y = 2*x^2 + 10*x + 5')
f({y : 0})
assert(f.x === null) //does not yet solve quadratics

var f = restraints('x = y = z')
f({x:10})
assert(f.y === 10)
assert(f.z === 10)

var f = restraints('x = y^2 = z^3')
f({y : 10})
assert(f.x === Math.pow(10, 2))
assert(f.z === Math.pow(10, 2/3))
assert(Math.sqrt(f.x) === 10)

var f = restraints('x = y + 10 = z^2 - 20')
f({z : 10})
assert(f.x === (10*10 - 20)); assert(f.x === (f.z*f.z - 20))
assert(f.z === Math.sqrt(f.x + 20))
assert(f.y === 10*10 - 30); assert(f.y === f.z*f.z-30)
assert(f.z === Math.sqrt(f.y + 30))






