const path = require('path');
const fs = require('fs');

// setup root path. only call once when module load (require).
process.env['ROOT_PATHS'] = path.dirname(require.main.filename);
const rootPath = process.env['ROOT_PATHS'];

// default config file name.
let cfgFile = path.join(rootPath, 'nlib.config.json');

/**
 * The NLib Class.
 */
class NLib {
    constructor() {
        this._config = new NLib.Configuration();
    }
    /** Gets the application config. */
    get Config() { return this._config; }
    /**
     * Assign value to target Object's property.
     * @param {Object} obj Target Object.
     * @param {String} property The Object's property name.
     * @param {Object} value The value to apply on object.
     */
    static assignTo(obj, property, value) {
        if (value instanceof Object) {
            if (!obj[property]) obj[property] = {};
            let keys = Object.keys(value);
            keys.forEach((key) => {
                obj[property][key] = value[key];
            });
        }
        else {
            obj[property] = value;
        }
    }
}

/**
 * The JSON File Class.
 */
NLib.JSONFile = class {
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

module.exports.JSON = exports.JSON = NLib.JSONFile;

/**
 * The Configuration Class.
 */
NLib.Configuration = class {
    constructor() {
        this._data = {};
        this.load();
    }
    /**
     * gets property value.
     * @param {String} property The nested object property in string.
     */
    get(property) {
        let props = property.toLowerCase().split(".");
        let len = props.length;
        let obj = this._data;
        for (let i = 0; i < len; ++i) {
            let pName = props[i];
            if (!obj[pName]) return obj[pName]; // not found.
            obj = obj[pName];
        }        
        return obj;
    }
    /**
     * set property value.
     * @param {String} property The nested object property in string.
     * @param {Object} value The Property's Value.
     */
    set(property, value) {
        let props = property.toLowerCase().split(".");
        let len = props.length;
        let obj = this._data;
        for (let i = 0; i < len; ++i) {
            let pName = props[i];
            if (i < len - 1) {
                if (!obj[pName]) obj[pName] = {}
                obj = obj[pName];
            }
            else {
                NLib.assignTo(obj, pName, value);
            }
        }
    }
    get data() { return this._data; }
    /**
     * Checks is configuration file exists.
     */
    exists() {
        return NLib.JSONFile.exists(cfgFile);
    }
    /**
     * Load configuration data from file.
     */
    load() {
        if (this.exists()) {
            this._data = NLib.JSONFile.load(cfgFile);
        }
    }
    /** 
     * Update configuration data to file.
     */
    update() {
        return NLib.JSONFile.save(cfgFile, this._data);
    }
}

module.exports.Configuration = exports.Configuration = NLib.Configuration;

let nlib = new NLib();

module.exports = exports = nlib;
