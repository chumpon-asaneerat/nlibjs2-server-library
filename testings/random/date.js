const nlib = require('../.././src/server/js/nlib/nlib');
const rand = nlib.NRandom;

let beginDate = new Date('2020-01-01')
//console.log(beginDate)
let endDate = new Date('2020-12-31')
//console.log(endDate)
let ret = rand.date(beginDate, endDate, 3)
console.log(JSON.stringify(ret))
