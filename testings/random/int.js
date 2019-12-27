const nlib = require('../.././src/server/js/nlib/nlib');
const rand = nlib.NRandom;

let run = (min, max, num_tests, opt) => {
    let obj = {}
    // init counter(s)
    for (let i = min; i <= max; i++) obj['v' + i.toString()] = 0;
    // loop
    for (let i = 0; i < num_tests; i++) {
        let rd;
        rd = rand.int(max, min, opt)
        // init counter if not exists
        if (!obj['v' + rd.toString()]) obj['v' + rd.toString()] = 0;
        // increase counter value
        obj['v' + rd.toString()]++;
    }
    return obj;
}

let min = 10;
let max = 15;
let num_tests = 10000;

let opt;
opt = { min: true, max: true }

let obj;
console.log('default [min, max]')
opt = undefined; // default
obj = run(min, max, num_tests, opt)
console.log(obj)

console.log('[min, max]')
opt = { min: true, max: true }
obj = run(min, max, num_tests, opt)
console.log(obj)

console.log('(min, max]')
opt = { min: false, max: true }
obj = run(min, max, num_tests, opt)
console.log(obj)

console.log('[min, max)')
opt = { min: true, max: false }
obj = run(min, max, num_tests, opt)
console.log(obj)

console.log('(min, max)')
opt = { min: false, max: false }
obj = run(min, max, num_tests, opt)
console.log(obj)
