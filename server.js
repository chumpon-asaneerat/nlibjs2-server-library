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

//#region MSSqlServer test.
/*
const SqlServer = require('./src/server/js/nlib/nlib-mssql');
console.log('SqlServer class version:', SqlServer.version)
let testSQL = async () => {
    let mssqlSvr = new SqlServer();
    if (await mssqlSvr.connect()) {
        console.log('database is connected.');
    }
    else {
        console.log('database connect failed.');
    }

    // GetCustomers
    // let sp1 = {
    //     name: 'GetCustomers',
    //     inputs: [
    //         { name: "langId", type: "nvarchar(3)", default: null },
    //         { name: "customerId", type: "nvarchar(30)", default: null },
    //         { name: "enabled", type: "bit", default: null }
    //     ],
    //     outputs: []
    // }
    // let pObj1 = { langId: 'TH' };
    // //let pObj1 = {}
    // let ret1 = await mssqlSvr.execute(sp1.name, pObj1, sp1.inputs, sp1.outputs);
    // console.log(ret1);

    // GetVoteSummaries
    // let sp2 = {
    //     name: 'GetVoteSummaries',
    //     inputs: [
    //         { name: "customerId", type: "nvarchar(30)", default: null },
    //         { name: "qSetId", type: "nvarchar(30)", default: null },
    //         { name: "qSeq", type: "int", default: null },
    //         { name: "beginDate", type: "datetime", default: null },
    //         { name: "endDate", type: "datetime", default: null },
    //         { name: "orgId", type: "nvarchar(30)", default: null },
    //         { name: "deviceId", type: "nvarchar(30)", default: null },
    //         { name: "userId", type: "nvarchar(30)", default: null }
    //     ],
    //     outputs: [
    //         { name: "errNum", type: "int", default: null },
    //         { name: "errMsg", type: "nvarchar(max)", default: null }
    //     ]
    // }
    // let pObj2 = { customerId: 'EDL-C2018080001', qSetId: null, qSeq: null };
    // let pObj2 = { customerId: 'EDL-C2018080001', qSetId: 'QS00001', qSeq: 1 };
    // let ret2 = await mssqlSvr.execute(sp2.name, pObj2, sp2.inputs, sp2.outputs);
    // console.log(ret2);
    
    // simple query with input/output    
    // let qr3 = {
    //     text: 'select @inVal as value; select @outVal = 10',
    //     inputs: [
    //         { name: "inVal", type: "int", default: 0 }
    //     ],
    //     outputs: [
    //         { name: "outVal", type: "int", default: 0 }
    //     ]
    // }
    // let pObj3 = { inVal: 1234 }
    // let ret3 = await mssqlSvr.query(qr3.text, pObj3, qr3.inputs, qr3.outputs);
    // console.log(ret3);

    // simple query
    // let qr4 = {
    //     text: 'select 10 as Item'
    // }
    // let ret4 = await mssqlSvr.query(qr4.text);
    // console.log(ret4);

    // simple query with date
    // let qr5 = {
    //     text: 'select @inDate as currdate',
    //     inputs: [
    //         { name: "inDate", type: "datetime", default: null }
    //     ]
    // }
    // let pObj5 = {
    //     inDate: new Date(2019, 6, 31, 13, 45, 22, 879) // js date (month is zero based).
    //     //inDate: '2019-07-31 13:45:22.878'
    //     //inDate: '2019-07-31 13.45.22.877'
    //     //inDate: '2019-07-31'
    //     //inDate: null
    // }
    // let ret5 = await mssqlSvr.query(qr5.text, pObj5, qr5.inputs);
    // console.log(ret5);

    await mssqlSvr.disconnect();
    console.log('database is disconnected.');
};
testSQL();
*/

//#endregion

//#region WebServer test.

const WebServer = require('./src/server/js/nlib/nlib-express');
let wsvr = new WebServer();

// add middleware(s) here!!
//wsvr.app.use(XXXXXX);

// add route(s) here!!
const routes = {
    /** @type {WebServer.RequestHandler} */
    home: (req, res) => {
        res.status(200).send(`It's work from home 2!!!`);
    }
}

//wsvr.app.get('/', wsvr.home);
//wsvr.get('/', (req, res, next) => { res.status(200).send(`It's work from custom home!!!`); })
wsvr.get('/', routes.home)

let svr = wsvr.listen();
if (svr) {
    console.log('Create server success.');
}

//#endregion
