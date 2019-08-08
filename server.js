const path = require("path");

const nlib = require("./src/server/js/nlib/nlib");

const WebServer = require('./src/server/js/nlib/nlib-express');
let wsvr = new WebServer();

const routes = {
    /** @type {WebServer.RequestHandler} */
    home: (req, res) => {
        //res.status(200).send(`It's work from home 2!!!`);
        res.sendFile(__dirname + '/index.html')
    }
}

//wsvr.app.get('/', wsvr.home);
//wsvr.get('/', (req, res, next) => { res.status(200).send(`It's work from custom home!!!`); })
wsvr.get('/', routes.home)

let svr = wsvr.listen();
if (svr) {
    console.log('Create server success.');
}

