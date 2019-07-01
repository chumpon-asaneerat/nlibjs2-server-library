const path = require('path');
const fs = require('fs');

// setup root path. only call once when module load (require).
process.env['ROOT_PATHS'] = path.dirname(require.main.filename);
const rootPath = process.env['ROOT_PATHS'];

// default config file name.
let cfgFile = path.join(rootPath, 'nlib.config.json');

class NLib {
    doA() {}
    doB() {}
}

let nlib = new NLib();

module.exports = exports = nlib;

NLib.JSON = class {
    /**
     * Save object to json file.
     * @param {String} fileName Target File Name.
     * @param {Object} obj Object to save.
     * @return {Boolean} Returns true if save success.
     */
    static save(fileName, obj) {
        return fs.writeFileSync(fileName, JSON.stringify(obj, null, 4), 'utf8');
    }
    /**
     * Load object from json file.
     * @param {String} fileName Target File Name.
     * @return {Object} Returns json object that load from file. Null returns if error occur.
     */
    static load(fileName) {
        let sJson = fs.readFileSync(fileName, 'utf8');
        try { return JSON.parse(sJson); }
        catch { return null; }
    }
    /**
     * Checks file exists.
     * @param {String} fileName 
     * @return {Boolean} Returns true if file is already exists.
     */
    static exists(fileName) {
        return fs.existsSync(fileName);
    }
}

module.exports.JSON = exports.JSON = NLib.JSON;

NLib.Config = class {
    /**
     * Create new instance of NConfig.
     * @param {Object} parent The Parent Object.
     * @param {String} propertyName The Parent Object's property name.
     */
    constructor(parent, propertyName, defaultConfig) {
        this._parent = parent;
        this._propertyName = propertyName;
        this._default = (defaultConfig) ? defaultConfig : {}
        this.init();
    }
    /**
     * Initialize the config object (internal call only).
     */
    init() {
        if (!this._parent || !this._propertyName) {
            this._data = this.default;
        }
        else {
            if (!this._parent[this._propertyName]) {
                this._parent[this._propertyName] = this.default;
            }
            this._data = this._parent[this._propertyName];
        }
    }
    /**
     * Gets default config object.
     * @return {Object} Returns default config object.
     */
    get default() { return this._default; }
    /**
     * Gets parent object.
     */
    get parent() { return this._parent; }
    /**
     * Gets data object's property name.
     */
    get property() { return this._propertyName; }
    /**
     * Gets current config data object.
     */
    get data() { return this._data; }
}

module.exports.Config = exports.Config = NLib.Config;

/*
class NLib {
    constructor() {
        this._cfg = null;
        this.initialize();
    }
    initialize() {
        if (!fs.existsSync(cfgFile)) saveConfig({});
        this._cfg = loadConfig();
        if (!this._cfg) this._cfg = {};
    }
    get config() {
        if (!this._cfg) this.initialize();
        return this._cfg;
    }
    update() { saveConfig(this._cfg); }
}

let nlib = new NLib();

exports = module.exports = nlib;
*/
