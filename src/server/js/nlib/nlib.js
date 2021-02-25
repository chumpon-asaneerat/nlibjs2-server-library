/** @module server/nlib */

const path = require('path');
const fs = require('fs');

// setup root path. only call once when module load (require).
process.env['ROOT_PATHS'] = path.dirname(require.main.filename);
const rootPath = process.env['ROOT_PATHS'];

// default config file name.
let cfgFile = path.join(rootPath, 'nlib.config.json');

// init logger
const logger = require('./nlib-logger').logger;

//#region NLib

/**
 * The NLib Class.
 * 
 * @exports server/nlib
 * 
 * @example <caption>Usage of NLib Core Library.</caption>
 * const nlib = require("./src/server/js/nlib/nlib");
 * 
 */
const NLib = class {
    //#region constructor

    /**
     * The NLib class is used internally. So not need to create instance of 
     * NLib class before used.
     * @ignore
     */
    constructor() {
        this._config = new Configuration(cfgFile);
        /** The commmon paths for nlib. */
        this.paths = {
            /** The project root path. */
            root: rootPath,
            /** The project root of routes path. */
            routes: path.join(rootPath, 'routes'),
            /** The project root of views path. */
            views: path.join(rootPath, 'views')
        }
        // write logger.
        logger.info('NLib ' + NLib.version + ' init.');
    }

    //#endregion

    //#region public methods

    //#region object management methods
    
    /**
     * Assign value to target Object's property.
     * 
     * @param {Object} obj Target Object.
     * @param {String} property The Object's property name.
     * @param {Object} value The value to apply on object.
     */
    assignTo(obj, property, value) { Objects.assignTo(obj, property, value); }
    /** 
     * Create New object with clone all properties with supports ignore case sensitive. 
     *    
     * @param {Object} o The Target Object.
     * @param {Boolean} caseSensitive The true for checks property with case sensitive.
     */
    clone(o, caseSensitive) { return Objects.clone(o, caseSensitive); }
    /** 
     * Set dest object's properties that match src object's property with case insensitive.
     * If dest property not exist in src obj and overwrite flag is set so null value is assigned
     * otherwise if overwrite flag is not set the original dest property will not changed.
     * 
     * @param {Object} dest The Target Object.
     * @param {Object} src The Source Object.
     * @param {Boolean} overwrite The true to overwrite value if property match.
     */
    setValues(dest, src, overwrite) { Objects.setValues(dest, src, overwrite); }

    //#endregion

    //#endregion

    //#region public properties

    /** Gets the application config. */
    get Config() { return this._config; }

    //#endregion

    //#region method for export classes

    /** 
     * The Objects class 
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
     * The TimeSpan class.
     * @ignore
     */
    get TimeSpan() { return TimeSpan; }
    /** 
     * The DateTime class. Provide various methods and property to work with Date and Time.
     * @ignore
     */
    get DateTime() { return DateTime; }
    /** 
     * The NPM class. Provide node package management (npm) related functions.
     * @ignore
     */
    get NPM() { return NPM; }
    /** 
     * The NResult class. Provide node package management (npm) related functions.
     * @ignore
     */
    get NResult() { return NResult; }
    /** 
     * The NRandom class. Provide random generator related functions.
     * @ignore
     */
    get NRandom() { return NRandom; }

    //#endregion

    //#region static methods and properties

    /**
     * Gets class version.
     */
    static get version() { return "2.0.0"; }

    //#endregion
}

//#endregion

//#region Objects

/**
 * The Objects management and utilities class. 
 */
const Objects = class {
    //#region constructor

    /**
     * The Objects class has only static method(s). So not need to create instance of 
     * Objects class before used.
     */
    constructor() {}

    //#endregion

    //#region static methods and properties

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
     * Create New object with clone all properties with supports ignore case sensitive.     
     * @param {Object} o The Target Object.
     * @param {Boolean} caseSensitive The true for checks property with case sensitive.
     * @return {Object} Returns new object that clone al source properties with specificed caseSensitive.
     */
    static clone(o, caseSensitive) {
        let result = {}
        let ignoreCase = (caseSensitive) ? false : true;
        let keys = Object.keys(o);
        keys.forEach((key) => { result[(ignoreCase) ? key.toLowerCase() : key] = o[key]; });        
        return result;
    }
    /** 
     * Set dest object's properties that match src object's property with case insensitive.
     * If dest property not exist in src obj and overwrite flag is set so null value is assigned
     * otherwise if overwrite flag is not set the original dest property will not changed.
     * @param {Object} dest The Target Object.
     * @param {Object} src The Source Object.
     * @param {Boolean} overwrite The true to overwrite value if property match.
     */
    static setValues(dest, src, overwrite) {
        let keys = Object.keys(dest);
        keys.forEach(key => {
            let dKey = key.toLowerCase();
            dest[key] = (!src[dKey]) ? (!overwrite) ? dest[key] : null : src[dKey];
        });
    }
    static getValue(obj, property) {
        let props = property.split('.')
        let prop
        let ref = obj
        while (props.length > 0 && ref) {
            prop = props.shift()
            ref = (ref[prop]) ? ref[prop] : null
        }
        return ref;
    }
    static setValue(obj, property, value) {
        let props = property.split('.')
        let prop
        let ref = obj
        let iCnt = 0
        let iMax = props.length
        while (props.length > 0 && ref) {
            prop = props.shift()        
            iCnt++
            if (iCnt < iMax) {
                ref = (ref[prop]) ? ref[prop] : null
            }
            else {
                ref[prop] = value
            }
        }
    }
    /**
     * Gets class version.
     */
    static get version() { return "2.0.0"; }

    //#endregion
}

//#endregion

//#region JSONFile

/**
 * The JSONFile Class. Provide methods to save and load json object.
 */
const JSONFile = class {
    //#region constructor

    /**
     * The JSONFile class has only static method(s). So not need to create instance of 
     * JSONFile class before used.
     */
    constructor() {}

    //#endregion

    //#region static methods and properties

    /**
     * Save object to json file.
     * @param {String} fileName Target File Name.
     * @param {Object} obj Object to save.
     * @return {Boolean} Returns true if file is successfully saved.
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
    /**
     * Gets class version.
     */
    static get version() { return "2.0.0"; }

    //#endregion
}

//#endregion

//#region Configuration

/**
 * The Configuration file manipulation Class.
 * 
 * @example <caption>Usage of Application Configuration.</caption>
 * 
 * // nlib load module.
 * const nlib = require("./src/server/js/nlib/nlib");
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
    //#region constructor

    /**
     * Create new instace of Configuration class.
     * @param {String} fileName The Configuration File Name.
     */
    constructor(fileName) {
        this._fileName = fileName;
        this._data = {};
        this.load();
    }

    //#endregion

    //#region public methods

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

    //#endregion

    //#region public properties

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

    //#endregion

    //#region static methods and properties

    /**
     * Gets class version.
     */
    static get version() { return "2.0.0"; }

    //#endregion
}

//#endregion

//#region Timespan

/** 
 * The TimeSpan class. 
 */
const TimeSpan = class {
    //#region constructor

    /**
     * Create new instace of Timespoan class.
     */
    constructor() {
        let len = arguments.length;
        let plens = TimeSpan.constructors.map((item) => item.length);
        let idx = plens.indexOf(len);
        if (idx === -1) {
            throw ("No constructor of TimeSpan supports " + len + " arguments");
        }
        // local variables
        this.ticks = 0; // total milliseconds elapsed from January 1, 1970
        // init variable by arguments.
        TimeSpan.constructors[idx].init(this, ...arguments);
    }

    //#endregion

    //#region public methods

    /**
     * Checks is TimeSpan is equals.
     * @param {TimeSpan} timespan The TimeSpan object to compare.
     */
    equals(timespan) { return this.ticks === timespan.ticks; }
    /**
     * Gets duration in milliseconds.
     */
    duration() { return new TimeSpan(Math.abs(this.ticks)); }
    /**
     * Gets string of current TimeSpan object.
     */
    toString() {
        let sign = (this.ticks < 0 ? "-" : "");
        let dy = (Math.abs(this.days) ? Math.abs(this.days) + "." : "0.");
        let hr = TimeSpan.pad(Math.abs(this.hours));
        let min = TimeSpan.pad(Math.abs(this.minutes));
        let sec = TimeSpan.pad(Math.abs(this.seconds));
        let ms = TimeSpan.pad(Math.abs(this.milliseconds), 3);
        return sign + dy + hr + ":" + min + ":" + sec + "." + ms;
    }
    /**
     * Add timespan.
     * @param {TimeSpan} timespan The TimeSpan object to add.
     */
    add(timespan) { return new TimeSpan(this.ticks + timespan.ticks); }
    /**
     * Subtract timespan.
     * @param {TimeSpan} timespan The TimeSpan object to subtract.
     */
    subtract(timespan) { return new TimeSpan(this.ticks - timespan.ticks); }

    //#endregion

    //#region public properties

    /**
     * Gets days part.
     */
    get days() { return Math.floor(this.ticks / (24 * 3600 * 1000)); }
    /**
     * Gets hours part.
     */
    get hours() { return Math.floor((this.ticks % (24 * 3600 * 1000)) / (3600 * 1000)); }
    /**
     * Gets minutes part.
     */
    get minutes() { return Math.floor((this.ticks % (3600 * 1000)) / (60 * 1000)); }
    /**
     * Gets seconds part.
     */
    get seconds() { return Math.floor((this.ticks % 60000) / 1000); }
    /**
     * Gets milliseconds part.
     */
    get milliseconds() { return Math.floor(this.ticks % 1000); }
    /**
     * Gets total days.
     */
    get totalDays() { return this.ticks / (24 * 3600 * 1000); }
    /**
     * Gets total hours.
     */
    get totalHours() { return this.ticks / (3600 * 1000); }
    /**
     * Gets total minutes.
     */
    get totalMinutes() { return this.ticks / (60 * 1000); }
    /**
     * Gets total seconds.
     */
    get totalSeconds() { return this.ticks / 1000; }
    /**
     * Gets total milliseconds.
     */
    get totalMilliseconds() { return this.ticks; }

    //#endregion

    //#region static methods and properties

    /**
     * Create new TimeSpan from specificed days.
     * @param {Number} days The days value.
     */
    static fromDays(days) { return new TimeSpan(days, 0); }
    /**
     * Create new TimeSpan from specificed hours.
     * @param {Number} hours The hours value.
     */
    static fromHours(hours) { return new TimeSpan(0, hours); }
    /**
     * Create new TimeSpan from specificed minutes.
     * @param {Number} hours The minutes value.
     */
    static fromMinutes(minutes) { return new TimeSpan(0, minutes, 0); }
    /**
     * Create new TimeSpan from specificed seconds.
     * @param {Number} hours The seconds value.
     */
    static fromSeconds(seconds) { return new TimeSpan(0, 0, seconds); }

    /**
     * Gets class version.
     */
    static get version() { return "2.0.0"; }

    //#endregion
}

//#region TimeSpan Internal consts and methods

/** This constant array is for internal used. @ignore */
TimeSpan.constructors = [
    {
        length: 0,
        init: (ts) => {
            ts.ticks = 0;
        }
    },
    {
        length: 1,
        init: (ts, milliseconds) => {
            ts.ticks = milliseconds;
        }
    },
    {
        length: 2,
        init: (ts, days, hours) => {
            ts.ticks = (days * 86400 + hours * 3600) * 1000;
            console.log(ts.ticks)
        }
    },
    {
        length: 3,
        init: (ts, hours, minutes, seconds) => {
            ts.ticks = (hours * 3600 + minutes * 60 + seconds) * 1000;
        }
    },
    {
        length: 4,
        init: (ts, days, hours, minutes, seconds) => {
            ts.ticks = (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000;
        }
    },
    {
        length: 5,
        init: (ts, days, hours, minutes, seconds, milliseconds) => {
            ts.ticks = (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
        }
    }
];
/** This function is for internal used. @ignore */
TimeSpan.pad = (number, len = 2) => String(number).padStart(len, "0")

//#endregion

//#endregion

//#region DateTime

/** 
 * The DateTime class. Provide various methods and property to work with Date and Time.
 * 
 * @example
 * // nlib load module.
 * const nlib = require("./src/server/js/nlib/nlib");
 * // create new DateTime instance.
 * let dt = new nlib.DateTime();
 * // show current DateTime.
 * console.log(dt.toString());
 */
const DateTime = class  {
    //#region constructor

    /**
     * Create new instace of DateTime class.
     */
    constructor() {
        let len = arguments.length;
        let plens = DateTime.constructors.map((item) => item.length);
        let idx = plens.indexOf(len);

        if (idx === -1) {
            throw ("No constructor of DateTime supports " + len + " arguments");
        }

        // local variables.
        this.span = new TimeSpan();
        // init variable by arguments.
        DateTime.constructors[idx].init(this, ...arguments);
        // keep Date object value.
        this.value = new Date(this.span.ticks);
    }

    //#endregion

    //#region public methods

    /**
     * Add timespan to current DateTime object.
     * @param {TimeSpan} timespan The TimeSpan object.
     * @return {DateTime} Returns new DateTime object that add the specificed parameter.
     */
    add(timespan) {
        return new DateTime(this.span.ticks + timespan.ticks);
    }
    /**
     * Add year(s) to current DateTime object.
     * @param {Number} years The number of years (can be both positive and negative value).
     * @return {DateTime} Returns new DateTime object that add the specificed parameter.
     */
    addYears(years) {
        return new DateTime(this.year + years, this.month, this.day,
            this.hour, this.minute, this.second, this.millisecond);
    }
    /**
     * Add month(s) to current DateTime object.
     * @param {Number} months The number of months (can be both positive and negative value).
     * @param {Boolean} autoCalcDays. True to calculate exact math day in each month to add or substract.
     * @return {DateTime} Returns new DateTime object that add the specificed parameter.
     */
    addMonths(months, autoCalcDays) {
        let y = this.year;
        let m = this.month;
        let r = DateTime.calcAddMonthDays(y, m, months);
        let ret;
        if (autoCalcDays) {
            ret = this.addDays(r.days);
        }
        else {
            let endOfMonth = DateTime.daysInMonth(r.year, r.month);
            let newday = (this.isEndOfMonth) ? endOfMonth : this.day;

            ret = new DateTime(
                r.year, r.month, newday,
                this.hour, this.minute, this.second,
                this.millisecond);
        }
        return ret;
    }
    /**
     * Add day(s) to current DateTime object.
     * @param {Number} days The number of days (can be both positive and negative value).
     * @return {DateTime} Returns new DateTime object that add the specificed parameter.
     */
    addDays(days) {
        return new DateTime(this.span.ticks + ((days * 86400) * 1000));
    }
    /**
     * Add hour(s) to current DateTime object.
     * @param {Number} hours The number of hours (can be both positive and negative value).
     * @return {DateTime} Returns new DateTime object that add the specificed parameter.
     */
    addHours(hours) {
        return new DateTime(this.span.ticks + ((hours * 3600) * 1000));
    }
    /**
     * Add second(s) to current DateTime object.
     * @param {Number} minutes The number of minutes (can be both positive and negative value).
     * @return {DateTime} Returns new DateTime object that add the specificed parameter.
     */
    addMinutes(minutes) {
        return new DateTime(this.span.ticks + ((minutes * 60) * 1000));
    }
    /**
     * Add second(s) to current DateTime object.
     * @param {Number} seconds The number of seconds (can be both positive and negative value).
     * @return {DateTime} Returns new DateTime object that add the specificed parameter.
     */
    addSeconds(seconds) {
        return new DateTime(this.span.ticks + (seconds * 1000));
    }
    /**
     * Add millisecond(s) to current DateTime object.
     * @param {Number} milliseconds The number of milliseconds (can be both positive and negative value).
     * @return {DateTime} Returns new DateTime object that add the specificed parameter.
     */
    addMilliseconds(milliseconds) {
        return new DateTime(this.span.ticks + milliseconds);
    }

    /**
     * Format Current DateTime object with specificed format's mask.
     */
    format(mask, locale = DateTime.LocaleSettings) {
        const token = /d{1,4}|M{1,4}|y{1,4}|([Hhms])\1?|tt|[Ll]|"[^"]*"|'[^']*'/g
        const d = this.day;
        const D = this.dayOfWeek;
        const M = this.month;
        const y = this.year;
        const H = this.hour;
        const m = this.minute;
        const s = this.second;
        const L = this.millisecond;
        const flags = {
            d,
            dd: DateTime.pad(d),
            ddd: locale.abbreviatedDayNames[D],
            dddd: locale.dayNames[D],
            M,
            MM: DateTime.pad(M),
            MMM: locale.abbreviatedMonthNames[M - 1],
            MMMM: locale.monthNames[M - 1],
            y: Number(String(y).slice(2)),
            yy: String(y).slice(2),
            yyy: DateTime.pad(y, 3),
            yyyy: DateTime.pad(y, 4),
            h: H % 12 || 12,
            hh: DateTime.pad(H % 12 || 12),
            H,
            HH: DateTime.pad(H),
            m,
            mm: DateTime.pad(m),
            s,
            ss: DateTime.pad(s),
            l: DateTime.pad(L, 3),
            L: DateTime.pad(L > 99 ? Math.round(L / 10) : L),
            tt: H < 12 ? "AM" : "PM",
        };
        return mask.replace(token, ($0) => {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1)
        });
    }
    /**
     * Gets valueOf current object.
     */
    valueOf() {
        return this.span.ticks;
    }
    /**
     * Gets string that represents current DateTime Object.
     * @param {String} format The format string.
     */
    toString(format = "yyyy-MM-dd HH:mm:ss.l") {
        let fmt = (format) ? format : "yyyy-MM-dd HH:mm:ss.l";
        return this.format(fmt);
    }

    //#endregion

    //#region public properties

    /**
     * Gets the year part.
     */
    get year() { return this.value.getFullYear(); }
    /**
     * Gets the month part.
     */
    get month() { return this.value.getMonth() + 1; }
    /**
     * Gets the day part.
     */
    get day() { return this.value.getDate(); }
    /**
     * Gets the day of week value (0-sunday, 1-monday, ...).
     */
    get dayOfWeek() { return this.value.getDay(); }
    /**
     * Gets the hour part.
     */
    get hour() { return this.value.getHours(); }
    /**
     * Gets the minute part.
     */
    get minute() { return this.value.getMinutes(); }
    /**
     * Gets the second part.
     */
    get second() { return this.value.getSeconds(); }
    /**
     * Gets the millisecond part.
     */
    get millisecond() { return this.value.getMilliseconds(); }
    /**
     * Checks current day is end of month.
     */
    get isEndOfMonth() {
        let ret = (DateTime.daysInMonth(this.year, this.month) === this.day);
        return ret;
    }
    /**
     * Gets Current DateTime.
     * @return {DateTime} Returns the DateTime object of current time.
     */
    get now() { return DateTime.now; }
    /**
     * Gets Elapsed TimeSpan.
     * @return {TimeSpan} Returns the TimeSpan object from Now - Current DateTime (self).
     */
    get elapsed() {
        return new TimeSpan(DateTime.now.span.ticks - this.span.ticks);
    }

    //#endregion

    //#region static methods and properties

    /**
     * Gets Current DateTime.
     * @return {DateTime} Returns the DateTime object of current time.
     */
    static get now() { return new DateTime(Date.now()) }
    /**
     * Checks is leap year.
     * 
     * @param {Number} year The year value.
     */
    static isLeapYear(year) {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
    }
    /**
     * Checks is month is betweeen 1 to 12.
     * 
     * @param {Number} month The month value.
     */
    static isValidMonth(month) { return (month > 0 && month <= 12); }
    /**
     * Checks is specificed parameters is valid day in month/year.
     * 
     * @param {Number} year The year value.
     * @param {Number} month The month value.
     * @param {Number} day The day value.
     */
    static isValidDayInMonth(year, month, day) {
        let ret = true;
        let maxDay = DateTime.daysInMonth(year, month);
        if (day <= 0 || day > maxDay) ret = false;
        return ret;
    }
    /**
     * Gets number of days in specificed year/month.
     */
    static daysInMonth(year, month) {
        let leap = DateTime.isLeapYear(year);
        let ret = DateTime.monthDays[month - 1];
        if (month === 2 && leap) ret = 29; // leap year Feb has 29 days.
        return ret;
    }
    /**
     * Gets class version.
     */
    static get version() { return "2.0.0"; }

    //#endregion
}

//#region DateTime Internal consts and methods

/** This constant array is for internal used. @ignore */
DateTime.constructors = [
    {
        length: 0,
        init: (dt) => { 
            dt.span = new TimeSpan(Date.now());
        }
    },
    {
        length: 1,
        init: (dt, millisecond) => { dt.span = new TimeSpan(millisecond); }
    },
    {
        length: 3,
        init: (dt, year, month, day) => {
            if (!DateTime.isValidMonth(month) ||
                !DateTime.isValidDayInMonth(year, month, day)) {
                throw (`Invalid Date in ctor(3): (year: ${year}, month: ${month}, day: ${day})`);
            }
            let d = new Date(year, month - 1, day);
            dt.span = new TimeSpan(d.getTime());
        }
    },
    {
        length: 6,
        init: (dt, year, month, day, hour, minute, second) => {
            if (!DateTime.isValidMonth(month) ||
                !DateTime.isValidDayInMonth(year, month, day)) {
                throw (`Invalid Date in ctor(6): (year: ${year}, month: ${month}, day: ${day})`);
            }
            let d = new Date(year, month - 1, day, hour, minute, second);
            dt.span = new TimeSpan(d.getTime());
        }
    },
    {
        length: 7,
        init: (dt, year, month, day, hour, minute, second, millisecond) => {
            if (!DateTime.isValidMonth(month) ||
                !DateTime.isValidDayInMonth(year, month, day)) {
                throw (`Invalid Date in ctor(7): (year: ${year}, month: ${month}, day: ${day})`);
            }
            let d = new Date(year, month - 1, day, hour, minute, second, millisecond);
            dt.span = new TimeSpan(d.getTime());
        }
    }
]

/** This constant array is for internal used. @ignore */
DateTime.monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** This function is for internal used. @ignore */
DateTime.getAddedDays = (currYear, currMonth, addMonths) => {
    let yr = currYear;
    let mn = currMonth;
    let months = addMonths;
    let days = 0;
    for (let i = 0; i < months; i++) {
        if (mn + 1 > 12) {
            mn = 1;
            yr++;
        }
        days += DateTime.daysInMonth(yr, mn);
        mn++;
    }
    let r = { year: yr, month: mn, days: days };
    return r;
}
/** This function is for internal used. @ignore */
DateTime.getRemovedDays = (currYear, currMonth, removeMonths) => {
    let yr = currYear;
    let mn = currMonth;
    let months = -1 * removeMonths;
    let days = 0;
    for (let i = 0; i < months; i++) {
        if (mn - 1 <= 0) {
            mn = 12;
            yr--;
        }
        days += DateTime.daysInMonth(yr, mn);
        mn--;
    }
    let r = { year: yr, month: mn, days: -1 * days };
    return r;
}
/** This function is for internal used. @ignore */
DateTime.calcAddMonthDays = (currYear, currMonth, months) => {
    let add = DateTime.getAddedDays;
    let rem = DateTime.getRemovedDays;
    let y = currYear;
    let m = currMonth;
    let r = (months >= 0) ? add(y, m, months) : rem(y, m, months);
    return r;
}
/** This function is for internal used. @ignore */
DateTime.pad = (number, len = 2) => String(number).padStart(len, "0")

//#endregion

//#region DateTime.LocaleSettings

/**
 * The default Locale Setting (EN).
 */
DateTime.LocaleSettings = {
    dateCompsOrder: "mdy",
    minSupportedDate: "0000-01-01T00:00:00.000Z",
    maxSupportedDate: "9999-12-31T23:59:59.999Z",
    abbreviatedDayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
    ],
    monthNames: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ],
    abbreviatedMonthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    dayNames: [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    ],
    shortDateTimePattern: "M/d/yyyy h:mm tt",
    abbreviatedDatePattern: "d MMM yyyy",
    abbreviatedShortDatePattern: "d MMM yyyy",
    shortDatePattern: "M/d/yyyy",
    shortestDatePattern: "M/d/yy",
    abbreviatedMonthDayPattern: "d MMM",
    shortMonthDayPattern: "M/d",
    shortTimePattern: "h:mm tt",
    twoDigitYearMax: 2029,

    humanizeFormats: {
        full: {
            dateDaysAgo: "{0} days|ago",
            dateInDays: "in {0}|days",
            dateInWeek: "in a|week",
            dateTimeAndZone: "{0} ({1})",
            dateTimeCombined: "{0}, {1}",
            dateToday: "today",
            dateTomorrow: "tomorrow",
            dateWeekAgo: "a week|ago",
            dateYesterday: "yesterday",
            dimeInSeconds: "in {0}|seconds",
            timeHourAgo: "an hour|ago",
            timeHoursAgo: "{0} hours|ago",
            timeInHour: "in an|hour",
            timeInHours: "in {0}|hours",
            timeInMinute: "in a|minute",
            timeInMinutes: "in {0}|minutes",
            timeInSecond: "in a|second",
            timeInSeconds: "in {0}|seconds",
            timeMinuteAgo: "a minute|ago",
            timeMinutesAgo: "{0} minutes|ago",
            timeSecondAgo: "a second|ago",
            timeSecondsAgo: "{0} seconds|ago",
        },

        short: {
            dateDaysAgo: "{0}d|ago",
            dateInDays: "in|{0}d",
            dateInWeek: "in a|week",
            dateTimeAndZone: "{0} ({1})",
            dateTimeCombined: "{0}, {1}",
            dateToday: "today",
            dateTomorrow: "tomorrow",
            dateWeekAgo: "a week|ago",
            dateYesterday: "yesterday",
            timeHourAgo: "1h|ago",
            timeHoursAgo: "{0}h|ago",
            timeInHour: "in|1h",
            timeInHours: "in|{0}h",
            timeInMinute: "in|1m",
            timeInMinutes: "in|{0}m",
            timeInSecond: "in|1s",
            timeInSeconds: "in|{0}s",
            timeMinuteAgo: "1m|ago",
            timeMinutesAgo: "{0}m|ago",
            timeSecondAgo: "1s|ago",
            timeSecondsAgo: "{0}s|ago",
        },
    },

    rangeFormats: {
        dateTimeFromFormat: "from {0} {1}",
        dateTimeToFormat: "to {0} {1}",
        dateTimeRangeFormat: "from {0} to {1} {2}",
        timeFromFormat: "from {0} {1}",
        timeToFormat: "to {0} {1}",
        timeRangeFormat: "from {0} to {1} {2}",
    },
}

//#endregion

//#endregion

//#region NPM

/**
 * The NPM class. Provide node package management (npm) related functions.
 */
const NPM = class  {
    //#region constructor

    /**
     * The NPM class has only static method(s). So not need to create instance of NPM class
     * before used.
     */
    constructor() {}

    //#endregion

    //#region static methods and properties

    /**
     * Checks is package is exists.
     * 
     * @param {String} pkg The package name (include version see npm document for more information).
     * 
     * @example <caption>Usage of exists method.</caption>
     * 
     * const nlib = require("./src/server/js/nlib/nlib");
     * 
     * // check mssql package is exists.
     * if (nlib.NPM.exists('mssql')) {
     *     console.log('mssql is already installed');
     * }
     * 
     */
    static exists(pkg) {
        let r = require;
        let ret = false;
        let o;
        try {
            o = r.resolve(pkg) 
            //console.log(`"${pkg}" has been installed.`);
        }
        catch {
            //console.log(`"${pkg}" not installed.`);
        }
        ret = (o) ? true : false;
        return ret;
    }
    /**
     * Install npm package.
     * 
     * @param {String} pkg The package name (include version see npm document for more information).
     * @param {Boolean} dev True if package is used for development.
     * 
     * @example <caption>Usage of install method.</caption>
     * 
     * const nlib = require("./src/server/js/nlib/nlib");
     * 
     * // check mssql package is exists.
     * if (!nlib.NPM.exists('mssql')) {
     *     if (nlib.NPM.install('mssql')) 
     *         console.log('mssql is installed.');
     *     else console.log('mssql cannot install.');
     * }
     * else {
     *     console.log('mssql is already installed');
     * }
     * 
     */
    static install(pkg, dev = false) {
        let ret = NPM.exists(pkg);
        if (!ret) {
            let r = require;
            let cmd = (dev) ? `npm install ${pkg} --save-dev` : `npm install ${pkg} --save`;            
            console.log(`installing: "${pkg}" please wait.`);
            //console.log('execute:' + cmd);
            r('child_process').execSync(cmd, { stdio: 'ignore' });
            //setImmediate(() => { });
            ret = NPM.exists(pkg);
        }
        return ret;
    }
    /** 
     * Uninstall npm package.
     * 
     * @param {String} pkg The package name (include version see npm document for more information).
     * 
     * @example <caption>Usage of install method.</caption>
     * 
     * const nlib = require("./src/server/js/nlib/nlib");
     * 
     * // check mssql package is exists.
     * if (nlib.NPM.exists('mssql')) {
     *     if (nlib.NPM.uninstall('mssql')) 
     *         console.log('mssql is uninstalled');
     *     else console.log('mssql cannot uninstall. restart server may requured.');
     * }
     * else {
     *     console.log('mssql is not installed');
     * }
     * 
     */
    static uninstall(pkg) {
        let ret = NPM.exists(pkg);
        if (ret) {
            let r = require;
            let cmd = `npm uninstall ${pkg} --save`;            
            console.log(`uninstalling: "${pkg}" please wait.`);
            //console.log('execute:' + cmd);
            r('child_process').execSync(cmd, { stdio: 'ignore' });
            //setImmediate(() => { });            
            ret = NPM.exists(pkg);
        }
        return ret;
    }
    /**
     * Gets class version.
     */
    static get version() { return "2.0.0"; }

    //#endregion
}

//#endregion

//#region NResult

/**
 * The NResult class. Provide Result Object creation related functions.
 */
const NResult = class {
    //#region static public methods

    /**
     * Create empty result object.
     */
    static empty() {
        let ret = {
            data: null,
            errors: {
                hasError: false,
                errNum: 0,
                errMsg: ''
            }
        }
        return ret;
    }
    /**
     * Create result object with data.
     * 
     * @param {Object} obj The objet to attach to result object.
     */
    static data(obj) {
        let ret = NResult.empty();
        ret.data = obj;
        return ret;
    }
    /**
     * Create result object with error number and error message.
     * 
     * @param {Number} errNum The error number.
     * @param {String} errMsg The error message.
     */
    static error(errNum, errMsg) {
        let ret = NResult.empty();
        ret.errors.hasError = true;
        ret.errors.errNum = errNum;
        ret.errors.errMsg = errMsg;
        return ret;
    }

    //#endregion
}

//#endregion

//#region NRandom and related functions

//#region Helper functions for NRandom class

const bitsToInt = (...bits) => {
    let val = 0;
    if (bits) bits.forEach(bit => val = (val << 1) | bit);
    return val;
}

const random_ints = [
    { id: 3, fn: (max, min) => {
        // [min, max].
        return min + Math.floor(Math.random() * (max - min + 1));
    }},
    { id: 2, fn: (max, min) => {
        // (min, max].
        return min + Math.ceil(Math.random() * (max - min));
    }},
    { id: 1, fn: (max, min) => {
        // [min, max).
        return min + Math.floor(Math.random() * (max - min));
    }},
    { id: 0, fn: (max, min) => {
        // (min, max).
        return min + Math.ceil(Math.random() * (max - min - 1));
    }}
]

const random_ints_maps = random_ints.map(item => item.id)

const getRandomIntMethod = (id) => {
    let idx = random_ints_maps.indexOf(id)
    return (idx === -1) ? random_ints[0] : random_ints[idx]
}
const prepareInt = (val) => { return val || 0 }
const prepareIntMinMaxOpt = (opt) => {
    let ret = { max: true, min: true }
    if (opt) {
        ret.min = (opt.min) ? true : false;
        ret.max = (opt.max) ? true : false;
    }
    return ret
}

//#endregion

//#region NRandom

/**
 * The NRandom class. Provide random generator related functions.
 */
const NRandom = class {
    /**
     * Gets random item from array.
     * 
     * @param {Array} items The source array.
     */
    static array(items) {
        let ret;
        if (items && items.length > 0) {
            ret = items[Math.floor(Math.random() * items.length)]
        }
        return ret;
    }
    /**
     * Gets random number between min and max (include min/max value)
     * 
     * @param {Number} max The max integer value.
     * @param {Number} min The min integer value.
     * @param {Object} opt The include option default is { min: true. max: true }.
     */
    static int(max, min, opt) {
        let imax = prepareInt(max)
        let imin = prepareInt(min)
        let rOpts = prepareIntMinMaxOpt(opt)
        let id = 3; // [min, max]
        if (opt) {
            id = bitsToInt(rOpts.max, rOpts.min)
        }
        return getRandomIntMethod(id).fn(imax, imin)
    }
    /**
     * Gets array of random date between begin/end year.
     * 
     * @param {Number} begin The Begin Year.
     * @param {Number} end The End Year.
     * @param {Number} sampleSize The sample size.
     */
    static year(begin, end, sampleSize) {
        let ret = [];
        let imax = (sampleSize) ? sampleSize : 1;
        let dt1 = new DateTime(begin, 0, 1)
        let dt2 = new DateTime(end, 11, 31, 23, 59, 59)
        let yr, mt, dayInMonth, dy, hr, mn, sc, ms;
        let dt;
        let opts = { min: true, max: true }
        for (let i = 0; i < imax; i++) {
            // get random year
            yr = NRandom.int(dt2.year, dt1.year, opts)
            // get random month
            mt = NRandom.int(12, 1, opts)
            // get random day (in year-month)
            dayInMonth = DateTime.daysInMonth(yr, mt)
            dy = NRandom.int(dayInMonth, 1, opts)
            // get random time.
            hr = NRandom.int(23, 0, opts)
            mn = NRandom.int(59, 0, opts)
            sc = NRandom.int(59, 0, opts)
            ms = NRandom.int(999, 0, opts)
            dt = new Date(yr, mt - 1, dy, hr, mn, sc, ms)
            // remove timezone offset.
            dt = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60 * 1000))
            ret.push(dt)
        }
        // sort date.
        ret.sort((a, b) => a - b)
        return ret;
    }
    /**
     * Gets array of random date between begin/end date.
     * 
     * @param {Date} begin The Begin Date.
     * @param {Date} end The End Date.
     * @param {Number} sampleSize The sample size.
     */
    static date(begin, end, sampleSize) {
        let ret = [];
        let imax = (sampleSize) ? sampleSize : 1;
        let dt1 = new Date(begin.getFullYear(), begin.getMonth(), begin.getDate(), 0, 0, 0)
        let dt2 = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
        // remove timezone part.
        //let v1 = dt1.getTime() - (dt1.getTimezoneOffset() * 60 * 1000)
        //let v2 = dt2.getTime() - (dt2.getTimezoneOffset() * 60 * 1000)
        let v1 = dt1.getTime()
        let v2 = dt2.getTime()
        let dt;
        let opts = { min: true, max: true }
        for (let i = 0; i < imax; i++) {
            dt = new Date(NRandom.int(v2, v1, opts))
            ret.push(dt)
        }
        // sort date.
        ret.sort((a, b) => a - b)
        return ret;
    }
}

//#endregion

//#endregion

let nlib = new NLib();

module.exports = exports = nlib;
