const path = require("path");

const express = require("express");

const morgan = require("morgan");
const helmet = require("helmet");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const favicon = require("serve-favicon");

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const APPNAME = "Express Project";
const PORT = 3000;

const app = express();

const useStatusMonitor = () => {
app.use(require('express-status-monitor')({
        title: APPNAME + ' Status', // Default title
        //theme: 'default.css',     // Default styles
        path: '/status',
        //socketPath: '/socket.io', // In case you use a custom path
        //websocket: existingSocketIoInstance,
        spans: [{
            interval: 1,            // Every second
            retention: 60           // Keep 60 data points in memory
        }, {
            interval: 5,            // Every 5 seconds
            retention: 60
        }, {
            interval: 15,           // Every 15 seconds
            retention: 60
        }],
        chartVisibility: {
            cpu: true,
            mem: true,
            load: true,
            responseTime: true,
            rps: true,
            statusCodes: true
        },
        //ignoreStartsWith: '/admin',
        healthChecks: []
    }));
};

const sendDummyRequest = () => {
    let request = require('request');
    let requestUrl = `http://localhost:${PORT}/`;
    let interval = 50;
    let sendRequestHomeUrl = () => {
        setTimeout(() => {
            const code = 200 + Math.random() * 399;
            request.get(`${requestUrl}`);
            sendRequestHomeUrl();
          }, interval);
    };
    sendRequestHomeUrl();
};

//## [ Status Monitor ] ===================================================##
//
// useStatusMonitor function need to call first before another middlewares.
//
// comment out this line in production.
//
//useStatusMonitor(); // tell app express app to use status monitor.
//
//
//## [ Status Monitor ] ===================================================##

app.use(helmet());
app.use(morgan("dev"));

app.use(cookieparser("YOUR_SECURE_KEY@123"));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

const iconpath = path.join(__dirname, "public", "favicon.ico");
app.use(favicon(iconpath));

const distPath = path.join(__dirname, 'public', 'dist');
//const distMaxAge = { maxage: '1d' };
const distMaxAge = { maxage: '15s' };
//const libMaxAge = { maxage: '15s' };
const dist_libs = [
    /* jQuery */
    { "route": "/dist/js", "path": "jquery-3.3.1" },
    /* jQuery UI */
    { "route": "/dist", "path": "jquery-ui-1.12.1" },
    /* bootstrap 4.x */
    { "route": "/dist/js", "path": "popperjs-1.15.0" },
    { "route": "/dist/js", "path": "tooltipjs-1.3.2" },
    { "route": "/dist", "path": "bootstrap-4.2.1" },
    /* font-awesome 5.x */
    { "route": "/dist", "path": "font-awesome-5.9.0" },
    /* emoji-symbols */
    { "route": "/dist/css", "path": "emoji-symbols-1.0.0" },
    /* flag-icon-css 3.x */
    { "route": "/dist", "path": "flag-icon-css-3.1.0" },
    /* moment */
    { "route": "/dist/js", "path": "moment-2.22.2" },
    /* riotjs */
    { "route": "/dist/js", "path": "riotjs-4.2.0" },
];

function dist_lib(app, exportRoute, localPath) {
    console.log('publish "' + localPath + '"');
    app.use(exportRoute, express.static(path.join(distPath, localPath), distMaxAge));
};

// dist paths.
dist_libs.forEach(element => {
    dist_lib(app, element.route, element.path);
});

app.get("/", (req, res) => {
    res.status(200).send(`It's work!!!`);
});

app.get("/:file", (req, res, next) => {
    if (req.params.file === 'index.html') {
        res.sendFile(path.join(__dirname, req.params.file));
    }
    else {
        next();
    }
});

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
app.post('/test', function(req, res) {
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
app.get('/bar', function(req, res) { 
    res.status(200).json({ status: 'OKISH'}); 
});

// set swagger (used jsdoc)
const swaggerSpec = swaggerJSDoc({
    swaggerDefinition: {
        info: {
            title: 'My App API',
            version: '1.0.0'
        }
    },
    //apis: ['./routes/index.js']
    apis: ['./server.js']
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// set swagger (used external json)
/*
const swaggerDocument = require('./swagger.json');
let swaggerOpts = { explorer: false };
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOpts));
*/

const server = app.listen(PORT, () => {
    console.log(`${APPNAME} listen on port: ${PORT}`);
});

//## [ Status Monitor ] ===================================================##
// Code for test express status monitor.
//
// comment out if not used.
//
//sendDummyRequest(); // make a fake request.
//
//## [ Status Monitor ] ===================================================##
