const path = require('path');
const fs = require('fs');

// setup root path. only call once when module load (require).
process.env['ROOT_PATHS'] = path.dirname(require.main.filename);
const rootPath = process.env['ROOT_PATHS'];

// default config file name.
let cfgFile = path.join(rootPath, 'nlib.config.json');

class JSONFile {
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

module.exports.JSONFile = exports.JSONFile = JSONFile;

class NConfig {
    /**
     * Create new instance of NConfig.
     * @param {Object} parent The Parent Object.
     * @param {String} propertyName The Property Name.
     */
    constructor(parent, propertyName) {
        this._parent = parent;
        this._propertyName = propertyName;
        this._cfg = (parent) ? this._parent[this._propertyName] : NConfig.default;
    }
    /**
     * Gets default config object.
     * @return {Object} Returns default config object.
     */
    static get default() { return {}; }
    /**
     * Gets parent object.
     */
    get parent() { return this._parent; }
    /**
     * Gets property name.
     */
    get property() { return this._propertyName; }
    /**
     * Gets config object.
     */
    get config() { return this._cfg; }
}

module.exports.NConfig = exports.NConfig = NConfig;

class NAppConfig extends NConfig {
    /**
     * Create new instance of NAppConfig.
     * @param {Object} parent The Parent Object.
     * @param {String} propertyName The Property Name.
     */
    constructor(parent, propertyName) {
        super(parent, propertyName)
    }
    /**
     * Gets default config object.
     * @return {Object} Returns default config object.
     */
    static get default() { 
        return {
            name: 'Defaule App', 
            version: '1.0.0', 
            updated: '2019-07-01 14:30'
        };
    }
}

module.exports.NAppConfig = exports.NAppConfig = NAppConfig;

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
        if (!fs.existsSync(cfgFile)) saveConfig({});
        this._cfg = loadConfig();
        if (!this._cfg) this._cfg = {};
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
