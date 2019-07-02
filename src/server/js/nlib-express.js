const nlib = require('./nlib-core');

const expressServer = {
    getAppName: function() {
        return nlib.Config.get('app.name');
    }
}


module.exports = exports = expressServer;