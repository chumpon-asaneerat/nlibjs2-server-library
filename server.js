//const path = require("path");

const nlib = require("./src/server/js/nlib-core");

let rootCfg = nlib.Config;
rootCfg.set('app.name', 'Example');
rootCfg.set('app', { version:'1.0.0', updated: '2019-07-01 16:00' });

rootCfg.set('webserver', { port: 3000 });
rootCfg.set('webserver.port', 3001 );

console.log(rootCfg.data);
let appObj = rootCfg.get('app');
console.log(appObj);
let appNoName = rootCfg.get('app.noname');
console.log('app.noname:', appNoName);
let appDataName = rootCfg.get('app.data.name');
console.log('app.data.name:', appDataName);

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