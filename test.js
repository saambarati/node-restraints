var parse = require('./parser')
  , assert = require('assert')

var f = parse('10 + y = 10 + 10 + 10 + x + 10 + 10')
f('y', 100)
assert(f.x === 60)

var f = parse('10 + y*(2*(3)*((4))) = x + 5')
f('y', 100)
assert(f.x === 2405)

var f = parse('9*c = 5 * (f - 32)')
f('f', 80)
f('forget') //forget value
f('c', 25)
assert(f.f === 77)


var f = parse('x^y = z')
f('x', 2)
f('y', 2)
assert(f.z === 4)
f('forget')
f('x', 2)
f('z', 4)
assert(f.y === 2)

var f = parse('x^y = z')
f('y', 2)
f('z', 4)

var f = parse('x^(1/2) = z')
f('x', 9)
f('forget')

var f = parse('x^y = z')
f({x:10, y:2})
f('forget')
assert(!f.y)
f({x : 2, z : 8})
assert(f.y === 3)


var f = parse('2*x^(1/2) = z + 10 - 5')
f({x : 4})
assert(f.z === -1)

var f = parse('y = x^(1/2)')
f({x : -4})
assert(!f.y) //NaN

var f = parse('y = y + x')
f({y : 10})
assert(f.x === 0)

var f = parse('y = .5*y + x')
f({y : 10})
assert(f.x === 5)

var f = parse('y = (2*x)^2 + 10*x + 5')
f({x : 2})
assert(f.y === 41)
var f = parse('y = 2*x^2 + 10*x + 5')
f({x : 2})
assert(f.y === 33)

var f = parse('y = 2*x^2 + 10*x + 5')
f({y : 0})
assert(f.x === null) //does not yet solve quadratics







