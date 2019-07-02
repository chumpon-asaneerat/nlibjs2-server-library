const path = require('path');
const fs = require('fs');

// setup root path. only call once when module load (require).
process.env['ROOT_PATHS'] = path.dirname(require.main.filename);
const rootPath = process.env['ROOT_PATHS'];

// default config file name.
let cfgFile = path.join(rootPath, 'nlib.config.json');

/**
 * The NLib Class.
 * @module NLib
 * @namespace NLib
 * 
 * @example <caption>Usage of NLib Core Library.</caption>
 * const nlib = require("./src/server/js/nlib-core");
 */
const NLib = class {
    constructor() {
        this._config = new Configuration(cfgFile);
        /** The commmon paths for nlib. */
        this.paths = {
            /** The project root path. */
            root: rootPath
        }
    }
    /** Gets the application config. */
    get Config() { return this._config; }

    /** 
     * The Objects management and utilities class.
     * @ignore
     */
    get Objects() { return Objects; }
    /** 
     * The JSON File class 
     * @ignore
     */
    get JSONFile() { return JSONFile; }
    /** 
     * The Configuration file manipulation class 
     * @ignore
     */
    get Configuration() { return Configuration; }
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
 * The Objects management and utilities class.
 * @module NLib
 * @namespace NLib
 */
const Objects = class {
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
 * @module NLib
 * @namespace NLib
 */
const JSONFile = class {
    /**
     * Save object to json file.
     * @param {String} fileName Target File Name.
     * @param {Object} obj Object to save.
     * @return {Boolean} Returns true if file is successfully saved.
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
 * The Configuration file manipulation Class.
 * @module NLib
 * @namespace NLib
 * 
 * @example <caption>Usage of Application Configuration.</caption>
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
const Configuration = class {
    /**
     * Create new instace of Configuration class.
     * @param {String} fileName The Configuration File Name.
     */
    constructor(fileName) {
        this._fileName = fileName;
        this._data = {};
        this.load();
    }
    /**
     * gets property value.
     * @param {String} property The nested object property in string.
     * @return {Object} Returns object property's value.
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
                Objects.assignTo(obj, pName, value);
            }
        }
    }
    /** 
     * Gets configuration object.
     * @return {Object} Returns configuration object.
     */
    get data() { return this._data; }
    /** 
     * Gets configuration file name.
     * @return {String} Returns configuration file name.
     */
    get fileName() { return this._fileName; }
    /**
     * Checks is configuration file exists.
     * @return {Boolean} Returns true if file is already exists.
     */
    exists() {
        return JSONFile.exists(this._fileName);
    }
    /**
     * Load configuration data from file.
     */
    load() {
        if (this.exists()) {
            this._data = JSONFile.load(this._fileName);
        }
    }
    /** 
     * Update configuration data to file.
     * @return {Boolean} Returns true if file is successfully updated.
     */
    update() {
        return JSONFile.save(this._fileName, this._data);
    }
}

/** 
 * DateTime class.
 * @module NLib
 * @namespace NLib
 * 
 * @example
 * // nlib load module.
 * const nlib = require("./src/server/js/nlib-core");
 * // create new DateTime instance.
 * let dt = new nlib.DateTime();
 * // show current DateTime.
 * console.log(dt.Now);
 */
const DateTime = class  {
    /**
     * Create new instace of DateTime class.
     */
    constructor() {
        console.log('New DateTime instance created.');
    }
    /**
     * Gets current datetime.
     */
    get Now() { return new Date(); }
}

/** 
 * The Timespan class. 
 * @module NLib
 * @namespace NLib
 */
const Timespan = class {
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
