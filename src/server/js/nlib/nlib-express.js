/** @module server/nlib-express */

const path = require('path');
const nlib = require('./nlib');
// common middlewares.
const express = require("express");
const http = require('http');
const socket = require('socket.io');
const statusMon = require('express-status-monitor');

const helmet = require("helmet");
const morgan = require("morgan");
const cookieparser = require("cookie-parser");
const bodyparser = require("body-parser");
const favicon = require("serve-favicon");

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const defaultApp = { 
    name:'NLib Web Server Application', 
    version:'2.0.0', 
    updated: '2019-08-08 09:30' 
};
const defaultWSvr = { 
    port: 3000,
    websocket: { enable: false },
    monitor: { enable: false },
    swagger: { enable: false, apis: [ "./server.js" ] },
    cookies: { secret: 'YOUR_SECURE_KEY@123' },
    favicon : { path: "public", fileName: "favicon.ico" },
    public: {
        paths: [
            { route: "/public", path: "public", maxAge: "30s", enable: true },
            { route: "/dist/js", path: "public/dist/jquery-3.3.1", maxAge: "15s", enable: true },
            { route: "/dist/css", path: "public/dist/jquery-ui-1.12.1", maxAge: "15s", enable: true },
            { route: "/dist/js", path: "public/dist/jquery-ui-1.12.1", maxAge: "15s", enable: true },
            { route: "/dist/js", path: "public/dist/popperjs-1.15.0", maxAge: "15s", enable: true },
            { route: "/dist/js", path: "public/dist/tooltipjs-1.3.2", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/bootstrap-4.2.1", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/font-awesome-5.9.0", maxAge: "15s", enable: true },
            { route: "/dist/css", path: "public/dist/emoji-symbols-1.0.0", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/flag-icon-css-3.1.0", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/animate-css-3.7.2", maxAge: "15s", enable: true },
            { route: "/dist/js", path: "public/dist/moment-2.24.0", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/chart-js-2.8.0", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/chart-js-plugin-datalabels-0.6.0", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/chart-js-plugin-piechart-outlabels-0.1.4", maxAge: "15s", enable: true },
            { route: "/dist/js", path: "public/dist/howler-2.1.2", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/jquery-org-chart-2.1.3", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/tabulator-4.3.0", maxAge: "15s", enable: true },
            { route: "/dist/js", path: "public/dist/ace-1.4.5", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/simplebar-4.1.0", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/overlay-scrollbars-1.9.1", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/socket.io-2.2.0", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/reveal-3.8.0", maxAge: "15s", enable: false },
            { route: "/dist/js", path: "public/dist/riotjs-3.13.2", maxAge: "15s", enable: true },
            { route: "/components", path: "dist/component/riot", maxAge: "15s", enable: true }
        ]
    }
};
const loadconfig = () => {
    console.log('load configuration.');
    let cfg = nlib.Config;
    if (!cfg.exists()) {
        // Set the default app config.
        cfg.set('app', defaultApp);
        // Set the default webserver config.
        cfg.set('webserver', defaultWSvr);
        // save to file.
        cfg.update();
    }
    return cfg;
};
const init_statusMonitor = (app, io, cfg) => {
    let usedMonitor = cfg.get('webserver.monitor.enable');
    if (!usedMonitor) return; // disable.
    console.info('use "express-status-monitor".');
    let appName = nlib.Config.get('app.name');
    let options = {
        title: appName + ' Status', // Default title
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
    }

    if (io) options.websocket = io; // set exists socket io.

    app.use(statusMon(options));
};
const init_helmet = (app) => {
    console.info('use "helmet".');
    app.use(helmet());
};
const init_logger = (app) => {
    console.info('use "logger (morgan)".');    
    app.use(morgan("dev"));
};
const init_cookie_parser = (app, cfg) => {
    console.info('use "cookie parser".');    
    // check config.
    let secret = cfg.get('webserver.cookies.secret');
    if (!secret || String(secret).length <= 0) {
        secret = 'YOUR_SECURE_KEY@123'
        cfg.set('webserver.cookies.secret', secret)
        cfg.update();
    }
    
    app.use(cookieparser(secret));
};
const init_body_parser = (app) => {
    console.info('use "body parser".');
    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({ extended: true }));
};
const init_fav_icon = (app, cfg) => {
    console.info('use "serve-favicon".');
    let icocfg = cfg.get('webserver.favicon');
    let iconpath = path.join(nlib.paths.root, icocfg.path, icocfg.fileName);
    app.use(favicon(iconpath));
};
const init_public_paths = (app, cfg) => {
    console.info('Setup static routes for public access.');
    let paths = cfg.get('webserver.public.paths');    
    paths.forEach(info => {
        if (info.enable) {
            let localPath = path.join(nlib.paths.root, info.path);
            console.log('publish "' + info.path + '"');
            //console.log('publish "' + localPath + '"');
            app.use(info.route, express.static(localPath, { maxage: info.maxAge }));
        }
    })
};
const init_swagger_doc = (app, cfg) => {
    let enableSwagger = cfg.get('webserver.swagger.enable');
    if (!enableSwagger) return;
    console.info('use "swagger-ui-express" and "swagger-jsdoc".');
    let appName = nlib.Config.get('app.name');
    let appVer = nlib.Config.get('app.version');
    let apis = cfg.get('webserver.swagger.apis');
    console.log('apis:', apis)
    let swaggerSpec = swaggerJSDoc({
        swaggerDefinition: { info: { title: appName + ' APIs', version: appVer } },
        apis: apis
    });
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
const init_middlewares = (app, io, cfg) => {
    //? load common middlewares.
    //! be careful the middleware order is matter.
    init_statusMonitor(app, io, cfg);
    init_helmet(app);
    init_logger(app);
    init_cookie_parser(app, cfg);
    init_body_parser(app);
    init_fav_icon(app, cfg);
    init_public_paths(app, cfg);
    init_swagger_doc(app, cfg);
};

/**
 * The Web Server (express.js) class.
 */
const WebServer = class {
    /**
     * Create new instance of WebServer class.
     */
    constructor() {
        // load config.
        let cfg = loadconfig();
        /** The Express Application instance.*/
        this.app = express();
        console.log('Express app instance created.');
        this.server = http.Server(this.app);
        console.log('HTTP server instance created.');
        this.enableWebSocket = cfg.get('webserver.websocket.enable');
        
        this.io = (this.enableWebSocket) ? socket(this.server) : null;
        if (this.io) console.log('Websocket instance created.');
        
        // init middlewares.
        init_middlewares(this.app, this.io, cfg);
    }
    /**
     * home route.
     * @param {Request} req The express request instance.
     * @param {Response} res The express response instance.
     */
    home(req, res) {
        // this is sample to make function supports intellisense for Express Type.
        res.status(200).send(`It's work from local home!!!`);
    }
    /**
     * get
     * @param {string | RegExp | Array<string | RegExp>} path The path.
     * @param {express.RequestHandler[]} handlers The handlers.
     */
    get(path, ...handlers) { this.app.get(path, ...handlers); }
    /**
     * post
     * @param {string | RegExp | Array<string | RegExp>} path The path.
     * @param {express.RequestHandler[]} handlers The handlers.
     */
    post(path, ...handlers) { this.app.post(path, ...handlers); }
    /**
     * all
     * @param {string | RegExp | Array<string | RegExp>} path The path.
     * @param {express.RequestHandler[]} handlers The handlers.
     */
    all(path, ...handlers) { this.app.all(path, ...handlers); }    
    /**
     * Start the web server to listen request.
     */
    listen() {
        let port = nlib.Config.get('webserver.port');
        let name = nlib.Config.get('app.name');
        
        this.server.listen(port);
        console.log(`${name} listen on port: ${port}`)
    }
}

module.exports = exports = WebServer;

/**
 * export Express RequestHandler type definition.
 * @type {express.RequestHandler}
 * @ignore
 */
module.exports.RequestHandler = exports.RequestHandler = express.RequestHandler;

