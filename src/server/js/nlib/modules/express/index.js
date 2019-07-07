const nlib = require('./../../nlib');
const express = require('express');
let app = express();

const expressServer = {
    /** Gets the express server name. */
    getAppName: function() {
        return 'Express Server';
    },    
    app : function() {
        return app;
    }
}
module.exports = exports = expressServer;
