const path = require("path");
//const nlib = require("./src/server/js/nlib/nlib");
const WebServer = require('./src/server/js/nlib/nlib-express');

const TestDb7x3 = require('./TestDb7x3.db');
let wsvr = new WebServer();

const routes = {
    /** @type {WebServer.RequestHandler} */
    randomCode: (req, res, next) => {
        let db = new TestDb7x3();
        (async() => {
            let connected = await db.connect();
            if (connected) {
                let data = await db.GetRandomHexCode({ length: 3 });
                await db.disconnect();
                WebServer.sendJson(req, res, data);
            }
            else {
                let result = db.error(db.errorNumbers.NO_DATA_ERROR, 'No data returns');
                WebServer.sendJson(req, res, result);
            }
        })()
    }
}

wsvr.get('/randomcode', routes.randomCode)

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
