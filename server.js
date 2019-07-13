const path = require("path");

const nlib = require("./src/server/js/nlib/nlib");

//#region DateTime and TimeSpan Test
/*
let dt = new nlib.DateTime();
console.log('DateTime Now:', dt.toString());

let d1 = new Date(2019, 6, 5); // 2019-07-05 
let d2 = Date.now();
let ts = new nlib.TimeSpan(d2 - d1);
console.log('Timespan (Now - Begin of Day):', ts.toString());
console.log('Total Days:', ts.totalDays);
console.log('Total Hours:', ts.totalHours);
console.log('Total Minutes:', ts.totalMinutes);
console.log('Total Seconds:', ts.totalSeconds);
console.log('Total Milliseconds:', ts.totalMilliseconds);
*/
let dt = new nlib.DateTime();
setTimeout(() => {
    console.log('elapse (ms):', dt.elapsed.totalMilliseconds);
}, 250);


//#endregion

//#region package.json test
/*
let file = path.join(nlib.paths.root, 'package.json');
let pjson = require(file);
//console.log('devDependencies', pjson.devDependencies);
//console.log('dependencies', pjson.dependencies);
if (!pjson.dependencies['mssql']) {
    console.log('no package installed.');
    pjson.dependencies['mssql'] = '^5.1.0'
    let fs = require('fs');
    fs.writeFileSync(file, JSON.stringify(pjson, null, 4), 'utf8')
    console.log('package.json is updated.');
    console.log('please run `npm install` to install required package(s).');
}
else {
    console.log('package.json is already updated.');
    let r = require;
    try { 
        let o = r.resolve('mssql')
        if (o) {
            console.log('package found. Now nlib library should work properly.');
        }
    }
    catch {
        console.log('package not found.');
        console.log('please run `npm install` to install required package(s).');
    }
}
*/
//#endregion

//#region SqlServer test
/*
const SqlServer = require('./src/server/js/nlib/nlib-mssql');

let getSchema = (async() =>{
    SqlServer.getSchema();
})

getSchema();
*/
//#endregion

//#region WebServer test

// const WebServer = require('./src/server/js/nlib/nlib-express');
// let wsvr = new WebServer();

// // add middleware(s) here!!
// //wsvr.app.use(XXXXXX);

// // add route(s) here!!
// const routes = {
//     /** @type {WebServer.RequestHandler} */
//     home: (req, res) => {
//         res.status(200).send(`It's work from home 2!!!`);
//     }
// }

// //wsvr.app.get('/', wsvr.home);
// //wsvr.get('/', (req, res, next) => { res.status(200).send(`It's work from custom home!!!`); })
// wsvr.get('/', routes.home)

// let svr = wsvr.listen();
// if (svr) {
//     console.log('Create server success.');
// }

//#endregion
