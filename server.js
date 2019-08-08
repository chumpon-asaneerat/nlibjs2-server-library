const path = require("path");
//const nlib = require("./src/server/js/nlib/nlib");
const WebServer = require('./src/server/js/nlib/nlib-express');
let wsvr = new WebServer();

const routes = {
    /** @type {WebServer.RequestHandler} */
    home: (req, res) => {
        //res.status(200).send(`It's work from home 2!!!`);
        //res.sendFile(__dirname + '/socket.html')
        res.sendFile(__dirname + '/index.html')
    }
}

//wsvr.app.get('/', wsvr.home);
//wsvr.get('/', (req, res, next) => { res.status(200).send(`It's work from custom home!!!`); })
wsvr.get('/', routes.home)

//#region example route with swagger

/**
 * @swagger
 * /test:
 *   post:
 *     description: Login 123
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: test
 *         description: Items list array
 *         in: formData
 *         required: false
 *         type: array
 *         collectionFormat: multi
 *         items:
 *            type: "integer"
 *       - name: profileId
 *         description: Password
 *         in: formData
 *         required: true
 *         type: string
 *       - name: file
 *         description: File To Upload
 *         in: formData
 *         required: false
 *         type: file
 *     responses:
 *       200:
 *         description: OK result in json object.
 */
wsvr.post('/test', function(req, res) {
	console.log('req', req)
	res.status(200).json({ status: 'OK'});
});
/**
 * @swagger
 * /bar:
 *   get:
 *     description: home get api
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: result in json object.
 */
wsvr.get('/bar', function(req, res, next) { 
    res.status(200).json({ status: 'OKISH'}); 
});

//#endregion

wsvr.listen();

/*
wsvr.io.on('connection', function (socket) {
    socket.broadcast.emit('news arrived from server', { hello: 'world' });
    socket.on('data from client', function (data) {
        console.log(data);
        socket.broadcast.emit('news arrived from server', { msg: 'new item', data: data.my });
    });
});
*/