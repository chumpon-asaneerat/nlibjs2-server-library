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
//#endregion

//#region NPM test

// installed.
/*
if (!nlib.NPM.exists('mssql')) {
    if (nlib.NPM.install('mssql')) console.log('mssql is installed.');
    else console.log('mssql cannot install.');
}
else {
    console.log('mssql is already installed');
}
*/
// uninstalled.
/*
if (nlib.NPM.exists('mssql')) {
    if (nlib.NPM.uninstall('mssql')) console.log('mssql is uninstalled');
    else console.log('mssql cannot uninstall. restart server may requured.');
}
else {
    console.log('mssql is not installed');
}
*/

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

//#region NLib module related methods test.

const WebServer = require('./src/server/js/nlib/nlib-express');
let wsvr = new WebServer();

wsvr.app.get('/', (req, res) => {
    res.status(200).send(`It's work!!!`);
});

wsvr.listen();

const mssqlSvr = require('./src/server/js/nlib/nlib-mssql');
console.log(mssqlSvr.getAppName())

//#endregion

//#region Original Express seting code
/*
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cookieparser("YOUR_SECURE_KEY@123"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send(`It's work!!!`);
});

const server = app.listen(nlib.config.webserver.port, () => {
    console.log(`${nlib.config.app.name} listen on port: ${nlib.config.webserver.port}`);
});
*/
//#endregion