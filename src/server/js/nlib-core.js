const path = require('path');
const fs = require('fs');

// setup root path. only call once when module load (require).
process.env['ROOT_PATHS'] = path.dirname(require.main.filename);
const rootPath = process.env['ROOT_PATHS'];

// default config file name.
let cfgFile = path.join(rootPath, 'nlib.config.json');
// The default config object.
let defCfg = {
    app: { 
        name: "NLib Web Application.",
        version: "2.0.0",
        updated: "2019-07-01 10:30"
    },
    webserver: {
        port: 3000
    }
};

// save config file.
let saveConfig = (cfg) => {
    fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 4), 'utf8');
};
// load config file.
let loadConfig = () => {
    let sJson = fs.readFileSync(cfgFile, 'utf8');
    try { return JSON.parse(sJson); }
    catch { return null; }
};

/**
 * The NLib Class.
 */
class NLib {
    /** create new instance of NConfig class. */
    constructor() {
        this._cfg = null;
        this.initialize();
    }
    /** initialize configuration. */
    initialize() {
        if (!fs.existsSync(cfgFile)) saveConfig(defCfg);        
        this._cfg = loadConfig();
        if (!this._cfg) this._cfg = defCfg;
    }
    /** get configuration. */
    get config() {
        if (!this._cfg) this.initialize();
        return this._cfg;
    }
    /** update current configuration to file. */
    update() { saveConfig(this._cfg); }
}

let nlib = new NLib();

exports = module.exports = nlib;
