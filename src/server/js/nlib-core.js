/** 
 * The NLib Core library.
 * @namespace NLib
 */

const path = require('path');
const fs = require('fs');

// setup root path. only call once when module load (require).
process.env['ROOT_PATHS'] = path.dirname(require.main.filename);
const rootPath = process.env['ROOT_PATHS'];

// default config file name.
let cfgFile = path.join(rootPath, 'nlib.config.json');

/**
 * The NLib Class.
 * @example
 * const nlib = require("./src/server/js/nlib-core");
 */
class NLib {
    constructor() {
        this._config = new Configuration();
        /** The commmon paths for nlib. */
        this.paths = {
            /** The project root path. */
            root: rootPath
        }
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
    /** 
     * The JSON File class 
     * @ignore
     */
    get JSONFile() { return JSONFile; }
    /** 
     * The DateTime class. 
     * @return {DateTime} The DateTime class.
     * @ignore
     */
    get DateTime() { return DateTime; }
    /** 
     * The Timespan class.
     * @return {Timespan} The Timespan class.
     * @ignore
     */
    get Timespan() { return Timespan; }
}

/**
 * The JSON File Class.
 */
JSONFile = class {
    /**
     * Save object to json file.
     * @param {String} fileName Target File Name.
     * @param {Object} obj Object to save.
     * @return {Boolean} Returns true if save success.
     */
    static save(fileName, obj) {
        return fs.writeFileSync(fileName, JSON.stringify(obj, null, 2), 'utf8');
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

/**
 * The Configuration Class.
 * @example <caption>Example usage of Application Configuration.</caption>
 * 
 * // nlib load module.
 * const nlib = require("./src/server/js/nlib-core");
 * // Set variable to access application configuration.
 * const cfg = nlib.Config;
 * // To set app.name to 'App1'
 * // 1. direct assign to target property
 * cfg.set('app.name', 'App1');
 * // 2. set an object
 * cfg.set('app', { name:'App1' });
 * // then update to file.
 * cfg.update();
 */
Configuration = class {
    /**
     * Create new instace of DateTime class.
     */
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
        return JSONFile.exists(cfgFile);
    }
    /**
     * Load configuration data from file.
     */
    load() {
        if (this.exists()) {
            this._data = JSONFile.load(cfgFile);
        }
    }
    /** 
     * Update configuration data to file.
     */
    update() {
        return JSONFile.save(cfgFile, this._data);
    }
}

/** 
 * DateTime class.
 * @example
 * // nlib load module.
 * const nlib = require("./src/server/js/nlib-core");
 * // create new DateTime instance.
 * let dt = new nlib.DateTime();
 * // show current DateTime.
 * console.log(dt.Now);
 */
DateTime = class  {
    /**
     * Create new instace of DateTime class.
     */
    constructor() {
        console.log('New DateTime instance created.');
    }
    /** Gets current datetime. */
    get Now() { return new Date(); }
}

/** 
 * The Timespan class. 
 */
Timespan = class {
    /**
     * Create new instace of Timespoan class.
     */
    constructor() {
        console.log('New Timespan instance created.');
    }
    /**
     * Gets current datetime.
     */
    get Now() { return new Date(); }
}

let nlib = new NLib();

module.exports = exports = nlib;

//module.exports.Configuration = exports.Configuration = Configuration;
//module.exports.DateTime = exports.DateTime = DateTime;
//module.exports.Timespan = exports.Timespan = Timespan;