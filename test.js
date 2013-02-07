var parse = require('./parser')

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
f({x : 10, y : 2})
console.log('z ----> ' + f.z)
f('forget')
console.log('y ----> ' + f.y)
f({x : 2, z : 8})
console.log('y ----> ' + f.y)



//console.log('idx : ' + parse.findNextIndex('-', '10-y'))
//var idx = parse.findNextIndex('-', '10-y')
//console.log('10-y'.slice(0, idx))
//console.log('10-y'.slice(idx+1))
