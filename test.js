var parse = require('./parser')
  , assert = require('assert')

var f = parse("10 + y = 10 + 10 + 10 + x + 10 + 10")
f('y', 100)

var f = parse("10 + y*(2*(3)*((4))) = 10 + 10 + 10 + x + 10 + 10")
f('y', 100)

var f = parse('9*c = 5 * (f - 32)')
f('f', 80)
console.log('f -> 80   c -> ' + f.c)
f('forget') //forget value
f('c', 21)
console.log('c -> 21   f -> ' + f.f)


var f = parse('x^y = z')
f('x', 2)
f('y', 2)
var f = parse('x^y = z')
f('x', 2)
f('z', 4)
var f = parse('x^y = z')
f('y', 2)
f('z', 4)
var f = parse('x^(1/2) = z')
f('x', 9)
f('forget')
console.log('\n\n\n')
var f = parse('x^y = z')
f({x:10, y:2})
console.log('z ----> ' + f.z)
f('forget')
assert(!f.y)
f({x : 2, z : 8})
assert(f.y === 3)
console.log('y ----> ' + f.y)


var f = parse('2*x^(1/2) = z + 10 - 5')
f({x : 4})
assert(f.z === -1)
console.log('z ----> ' + f.z)

var f = parse('y = x^(1/2)')
f({x : -4})
assert(!f.y) //NaN

var f = parse('y = y + x')
f({y : 10})
console.log('x should be zero ---> ' + f.x)
assert(f.x === 0)

var f = parse('y = .5*y + x')
f({y : 10})
assert(f.x === 5)
console.log(f.x)


