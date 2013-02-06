var parse = require('./parser')

var f = parse("10 + y = 10 + 10 + 10 + x + 10 + 10")
f('y', 100)

var f = parse("10 + y*(2*(3)*((4))) = 10 + 10 + 10 + x + 10 + 10")
f('y', 100)

var f = parse('9*c = 5 * (f - 32)')
f('f', 79)
f('c', 20)

//console.log('idx : ' + parse.findNextIndex('-', '10-y'))
//var idx = parse.findNextIndex('-', '10-y')
//console.log('10-y'.slice(0, idx))
//console.log('10-y'.slice(idx+1))
