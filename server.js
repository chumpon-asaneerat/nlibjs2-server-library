const path = require("path");

const nlib = require("./src/server/js/nlib/nlib");

const WebServer = require('./src/server/js/nlib/nlib-express');
let wsvr = new WebServer();

const routes = {
    /** @type {WebServer.RequestHandler} */
    home: (req, res) => {
        //res.status(200).send(`It's work from home 2!!!`);
        res.sendFile(__dirname + '/socket.html')
    }
}

//wsvr.app.get('/', wsvr.home);
//wsvr.get('/', (req, res, next) => { res.status(200).send(`It's work from custom home!!!`); })
wsvr.get('/', routes.home)

wsvr.listen();

wsvr.io.on('connection', function (socket) {
    socket.broadcast.emit('news arrived from server', { hello: 'world' });
    socket.on('data from client', function (data) {
        console.log(data);
        socket.broadcast.emit('news arrived from server', { msg: 'new item', data: data.my });
    });
});
