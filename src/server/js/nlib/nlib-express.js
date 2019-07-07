const nlib = require('./nlib');
// common middlewares.
const express = require("express");

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
    const helmet = require("helmet");
    app.use(helmet());
}

const init_logger = (app) => {    
    console.info('use "logger (morgan)".');
    const morgan = require("morgan");
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

    const cookieparser = require("cookie-parser");
    app.use(cookieparser(secret));
}

const init_body_parser = (app) => {
    console.info('use "body parser".');
    const bodyparser = require("body-parser");

    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({ extended: true }));
}

const init_middlewares = (app, cfg) => {
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