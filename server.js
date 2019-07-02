//const path = require("path");

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
console.log('DateTime Now:', dt.Now);
let ts = new nlib.Timespan();
console.log('Timespan Now:', ts.Now);

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