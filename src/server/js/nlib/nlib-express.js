const nlib = require('./nlib');
// common middlewares.
const express = require("express");

const helmet = require("helmet");
const morgan = require("morgan");
const cookieparser = require("cookie-parser");
const bodyparser = require("body-parser");

const defaultApp = { 
    name:'NLib Web Server Application', 
    version:'2.0.0', 
    updated: '2019-07-07 11:00' 
};
const defaultWSvr = { 
    port: 3000,
    cookies: {
        secret: 'YOUR_SECURE_KEY@123'
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

const init_middlewares = (app, cfg) => {
    //? load common middlewares.
    //! be careful the middleware order is matter.
    init_helmet(app);
    init_logger(app);
    init_cookie_parser(app, cfg);
    init_body_parser(app);
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
 */
module.exports.RequestHandler = exports.RequestHandler = express.RequestHandler;