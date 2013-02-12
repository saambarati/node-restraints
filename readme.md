#restraints

## use
`npm install restraints`

## example - Fahrenheit to Celcius -- Celcius to Farhenheit

    var restraints = require('restraints')
       , converter = restraints('9 * c = 5 * (f - 32)')
    //when either the value for 'c' or 'f' are updated, their value will be attached to converter

    converter({c : 21})
    converter.f === 69.8
    converter('forget') //all values are forgotten
    converter({f : 80})
    converter.c === 26.66666

## another example
restraints is useful for creating a set of mathematical equations:

    var equation = restraints('x^y = z')
    equation({x:10, y:2})
    equation.z === 100 //10^2=100

    equation('forget') //all values are forgetten

    equation({x:2, z:8})
    equation.y === 3 //2^3=8

## string of equations

    var f = parse('x = y = z')
    f({x:10})
    assert(f.y === 10)
    assert(f.z === 10)

    var f = parse('x = y^2 = z^3')
    f({y : 10})
    assert(f.x === Math.pow(f.y, 2))
    assert(f.z === Math.pow(f.y, 2/3))
    assert(f.z === Math.pow(f.x, 1/3))

