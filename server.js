const path = require("path");

const nlib = require("./src/server/js/nlib-core");
const expSvr = require("./src/server/js/nlib-express");

let cfg = nlib.Config;
if (!cfg.exists()) {
    cfg.set('app', { 
        name:'NLib Web Application', 
        version:'2.0.0', 
        updated: '2019-07-01 19:30' 
    });
    cfg.set('webserver', { 
        port: 3000 
    });
    cfg.update();
}

cfg.set('app.name', 'NLib Express Server Application');

console.log('paths:', nlib.paths);

console.log('App:', expSvr.getAppName());

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

let cfg2 = new nlib.Configuration(path.join(nlib.paths.root, 'custom.json'));
cfg2.set('db', {
    type: 'sqlserver',
    host: 'localhost',
    database: 'TestDb7x3',
    user: 'sa',
    pwd: 'winnt'
})
cfg2.update();

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