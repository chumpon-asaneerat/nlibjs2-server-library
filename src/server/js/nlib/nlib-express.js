/** @module server/nlib-express */

const path = require('path');
const nlib = require('./nlib');
// common middlewares.
const express = require("express");

const helmet = require("helmet");
const morgan = require("morgan");
const cookieparser = require("cookie-parser");
const bodyparser = require("body-parser");
const favicon = require("serve-favicon");

const defaultApp = { 
    name:'NLib Web Server Application', 
    version:'2.0.0', 
    updated: '2019-07-07 11:00' 
};
const defaultWSvr = { 
    port: 3000,
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
            { route: "/dist/js", path: "public/dist/howler-2.1.2", maxAge: "15s", maxAge: true },
            { route: "/dist", path: "public/dist/jquery-org-chart-2.1.3", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/tabulator-4.3.0", maxAge: "15s", enable: true },
            { route: "/dist/js", path: "public/dist/ace-1.4.5", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/simplebar-4.1.0", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/overlay-scrollbars-1.9.1", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/socket.io-2.2.0", maxAge: "15s", enable: true },
            { route: "/dist", path: "public/dist/reveal-3.8.0", maxAge: "15s", enable: false },
            { route: "/dist/js", path: "public/dist/riotjs-3.13.2", maxAge: "15s", enable: true },
            { route: "/components", path: "../../dist/component/riot", maxAge: "15s", enable: true }
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
}

const init_helmet = (app) => {
    console.info('use "helmet".');
    app.use(helmet());
}

const init_logger = (app) => {
    console.info('use "logger (morgan)".');    
    app.use(morgan("dev"));
}

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
}

const init_body_parser = (app) => {
    console.info('use "body parser".');
    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({ extended: true }));
}

const init_fav_icon = (app, cfg) => {
    console.info('use "serve-favicon".');
    let icocfg = cfg.get('webserver.favicon');
    let iconpath = path.join(nlib.paths.root, icocfg.path, icocfg.fileName);
    app.use(favicon(iconpath));
}

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
}

const init_middlewares = (app, cfg) => {
    //? load common middlewares.
    //! be careful the middleware order is matter.
    init_helmet(app);
    init_logger(app);
    init_cookie_parser(app, cfg);
    init_body_parser(app);
    init_fav_icon(app, cfg);
    init_public_paths(app, cfg);
}

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
        // init middlewares.
        init_middlewares(this.app, cfg);
        /** The Express Server instance. */
        this.server = null;
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
     * @param {String} path The path.
     * @param {express.RequestHandler} handler The handler.
     */
    get(path, handler) {
        // this is sample to make function supports intellisense for Express Type.
        this.app.get(path, handler);
    }
    /**
     * Start the web server to listen request.
     */
    listen() {
        let port = nlib.Config.get('webserver.port');
        let name = nlib.Config.get('app.name');
        
        this.server = this.app.listen(port, () => {
            console.log(`${name} listen on port: ${port}`)
        });

        return this.server;
    }
}

module.exports = exports = WebServer;

/**
 * export Express RequestHandler type definition.
 * @type {express.RequestHandler}
 * @ignore
 */
module.exports.RequestHandler = exports.RequestHandler = express.RequestHandler;