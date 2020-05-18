//#region nlib (core)

class NLib {
    static ctor(factory) {
        let obj = {};
        if (!obj.prototype) obj.prototype = {};
        NLib.setCreateMethod(obj, factory);
        return obj;
    }
    static setCreateMethod(obj) {
        obj.create = (factory) => {
            let result;
            if (!factory) {
                result = {};
                result.prototype = Object.create(Object.prototype);
            }
            else {
                result = new factory();
                result.prototype = Object.create(factory.prototype);
            }
            return result;
        }
    }
}

/** internal nlib instance variables. @ignore */
NLib.instance = null;
NLib.version = '2.0.2';

nlib = (() => {
    let _instance = null;
    _getInstance = () => {
        if (!_instance)
            _instance = NLib.ctor();
        return _instance;
    }
    return { getInstance: _getInstance };
})().getInstance();

//#endregion

//#region nlib (utils)

class NUtils {
    /**
     * Checks is object is null or undefined.
     *
     * @param {any} value The object to checks is null or undefined.
     * @returns {boolean} Returns true if value is null otherwist returns false.
     */
    isNull(value) {
        // Note. Empty string is evaluate is null.
        return (!value || value === 'undefined');
    }
    /**
     * get expired date from current date by specificed expired day(s).
     * if nothing assigned 1 day returns.
     * 
     * @param {Number} value The number of expires days start from today.
     * @returns {Date} Returns expired date. If no expiredDays assigned. one day will used.
     */
    getExpiredDate(expiredDays) {
        let date = new Date();
        let day = expiredDays;
        if (!expiredDays) day = 1;
        if (day < 1) day = 1;
        let seconds = 60 * 60 * 24 * day;
        date.setTime(date.getTime() + (seconds * 1000));
        return date;
    }
    /** Generate new Unique Id. */
    newUId() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    getValue(obj, property) {
        let props = property.split('.')
        let prop
        let ref = obj
        while (props.length > 0 && ref) {
            prop = props.shift()
            ref = (ref[prop]) ? ref[prop] : null
        }
        return ref;
    }
    setValue(obj, property, value) {
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
    assign(dst, src, propertyName) {
        let set = nlib.utils.setValue
        let get = nlib.utils.getValue
        let val = get(src, propertyName)
        if (val) set(dst, propertyName, val)
    }
    assigns(dst, src, ...propertyNames) {
        let fn = nlib.utils.assign
        propertyNames.forEach(propertyName => fn(dst, src, propertyName))
    }
    clone(src) { return JSON.parse(JSON.stringify(src)) }
    equals(src, dst) {
        let o1 = JSON.stringify(src);
        let o2 = JSON.stringify(dst);
        return (o1 === o2);
    }
    /** init class prototype to nlib */
    static init() {
        if (!nlib.utils) {
            nlib.utils = nlib.create(NUtils);
        }
        else nlib.utils = nlib.utils;
    }
}
// init NUtils to nlib.
NUtils.init();

//#endregion

//#region nlib (cookie)

/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
class NCookie {
    set(key, value, attributes) {
        NCookie.api.set(key, value, attributes);
    }
    get(key) {
        return NCookie.api.get(key, false);
    }
    getJson(key) {
        return NCookie.api.get(key, true);
    }
    remove(key, attributes) {
        NCookie.api.set(key, '', NCookie.api.extend(attributes, { expires: -1 }));
    }
    /** init class prototype to nlib */
    static init() {
        if (!nlib.cookie) {
            nlib.cookie = nlib.create(NCookie);
        }
        else nlib.cookie = nlib.cookie;
    }
    static test() {
        console.log('Test Cookies.');
        let cookie1;
        console.log('Remove Cookies.');
        cookie1 = nlib.cookie.remove('key1');
        cookie1 = nlib.cookie.remove('key2');
        cookie1 = nlib.cookie.remove('key3');
        
        cookie1 = nlib.cookie.get('key1');
        console.log('Read Cookies value : ', cookie1);
    
        console.log('Test Write Cookies and read back.');
        nlib.cookie.set('key1', 'joe1', { expires: 1 });
        nlib.cookie.set('key2', 'joe2', { expires: 1 });
        nlib.cookie.set('key3', { name: 'a', age: 30 }, { expires: 1 });
        cookie1 = nlib.cookie.get('key1');
        console.log('Read Cookies value : ', cookie1);
    
        let json_cookies1 = nlib.cookie.getJson();
        console.log('Read Cookies in json : ', json_cookies1);
    }
}
// The NCookie api.
NCookie.api = class {
    static extend() {
        let result = {};
        for (let i = 0; i < arguments.length; i++) {
            let attributes = arguments[i];
            for (let key in attributes) {
                result[key] = attributes[key];
            }
        }
        return result;
    }
    static decode(s) {
        let expr = /(%[0-9A-Z]{2})+/g;
        return s.replace(expr, decodeURIComponent);
    }
    static get hasDocument() { 
        return (typeof document !== 'undefined');
    }
    static getExpiredDate(attributes) {
        if (typeof attributes.expires === 'number') {
            attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
        }
        // We're using "expires" because "max-age" is not supported by IE
        return attributes.expires ? attributes.expires.toUTCString() : '';
    }
    static getWriteValue(value) {
        let ret = value;
        try {
            let result = JSON.stringify(value);
            let expr = /^[\{\[]/;
            if (expr.test(result)) {
                ret = result;
            }
        }
        catch (e) {
            console.error(e);
        }
        let expr = /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g;
        return encodeURIComponent(String(ret)).replace(expr, decodeURIComponent);
    }
    static getWriteKey(key) {
        let expr1 = /%(23|24|26|2B|5E|60|7C)/g;
        let key1 = encodeURIComponent(String(key)).replace(expr1, decodeURIComponent);
        let expr2 = /[\(\)]/g;
        let key2 = key1.replace(expr2, escape);
        return key2;
    }
    static stringifiedAttributes(attributes) {
        let ret = '';
        for (let attributeName in attributes) {
            if (!attributes[attributeName]) {
                continue;
            }
            ret += '; ' + attributeName;
            if (attributes[attributeName] === true) {
                continue;
            }
            // Considers RFC 6265 section 5.2:
            // ...
            // 3.  If the remaining unparsed-attributes contains a %x3B (";")
            //     character:
            // Consume the characters of the unparsed-attributes up to,
            // not including, the first %x3B (";") character.
            // ...
            ret += '=' + attributes[attributeName].split(';')[0];
        }
        return ret;
    }
    static set(key, value, attributes) {
        if (NCookie.api.hasDocument) {
            attributes = NCookie.api.extend({ path: '/' }, NCookie.api.defaults, attributes);
            attributes.expires = NCookie.api.getExpiredDate(attributes);
            value = NCookie.api.getWriteValue(value);
            key = NCookie.api.getWriteKey(key);
            let stringifiedAttributes = NCookie.api.stringifiedAttributes(attributes);
            // update document cookie.
            document.cookie = key + '=' + value + stringifiedAttributes;
        }
    }
    static getDocumentCookies() {
        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all.
        return document.cookie ? document.cookie.split('; ') : [];
    }
    static getData(cookie, json) {
        let ret = cookie;
        if (json) {
            try {
                let idx = cookie.indexOf('{');
                let val = cookie;
                if (idx == -1) {
                    val = JSON.stringify({ data: cookie })
                }
                else if (idx > 0) {
                    val = cookie.substring(idx, cookie.length)
                }
                ret = JSON.parse(val);
            } 
            catch (e) { 
                //console.error('cookie:', cookie, 'error:', e);
            }
        }
        return ret;
    }
    static decodeCookie(parts, cookie, jar, json) {
        let dcookie = cookie;
        if (!json && dcookie.charAt(0) === '"') {
            dcookie = dcookie.slice(1, -1);
        }
        try {
            let name = NCookie.api.decode(parts[0]);
            dcookie = NCookie.api.decode(dcookie);
            dcookie = NCookie.api.getData(dcookie, json);
            jar[name] = dcookie;
        }
        catch (e) {
            console.error(e);
        }
    }
    static extractCookies(key, cookies, jar, json) {
        for (let i = 0; i < cookies.length; i++) {
            let parts = cookies[i].split('=');
            let cookie = parts.slice(1).join('=');
            NCookie.api.decodeCookie(parts, cookie, jar, json)
            if (key === name) break;
        }
    }
    static get(key, json) {
        let ret;
        if (NCookie.api.hasDocument) {
            let jar = {};
            let cookies = NCookie.api.getDocumentCookies();
            NCookie.api.extractCookies(key, cookies, jar, json);
            ret = (key) ? jar[key] : jar;
        }
        return ret;
    }
}
NCookie.api.defaults = {};
// init NCookie to nlib.
NCookie.init();
// Run Test
//NCookie.test();

//#endregion

//#region nlib (navigator)

class NNavigator {
    /**
     * Goto specificed url with supports assigned query string object.
     * 
     * @param {string} url The url to navigate.
     * @param {any} queryObject The object that all properties used as query string.
     */
    gotoUrl(url, queryObject) {
        let queryString = this.getQueryString(queryObject);
        //console.log(queryString);
        let newUrl = url + queryString;
        //console.log(newUrl);
        document.location.replace(newUrl);
    }
    /** Refresh url (force reload). */
    refresh() {
        document.location.reload(true);
    }
    /**
     * Checks Object contains one or more property.
     * @param {Object} obj The object that all properties used as query string.
     * @returns {Boolean} Returns true if Query Object contains one or more property.
     */
    hasHasProperties(obj) {
        return (obj && Object.keys(obj).length > 0);
    }
    /**
     * Checks key is exist in target object.
     * @param {Object} obj The Target Object instace to checks.
     * @param {String} key The property name.
     * @returns {Boolean} Returns true if Object contains key (property name).
     */
    hasProperty(obj, key) {
        return (obj && obj.hasOwnProperty(key));
    }
    /**
     * Gets Query string from specificed object.
     * @param {Object} obj The object that all properties used as query string.
     * @returns {String} Returns true if Object contains key (property name).
     */
    getQueryString(obj) {
        let queryString = '';
        if (this.hasHasProperties(obj)) {
            queryString = queryString + '?';
            let prefix = '';
            for (let key in obj) {
                if (this.hasProperty(obj, key)) {
                    let paramStr = key.toString() + '=' + obj[key].toString();
                    queryString = queryString + prefix + paramStr;
                    prefix = '&';
                }
            }
        }
        return queryString;
    }
    /** Clear query string from url. (call when page loaded). */
    clearQueryString() {
        var href = window.location.href;
        var newUrl = href.substring(0, href.indexOf('?'));
        window.history.replaceState({}, document.title, newUrl);
    }
    /** init class prototype to nlib */
    static init() {
        if (!nlib.nav) {
            nlib.nav = nlib.create(NNavigator);
        }
        else nlib.nav = nlib.nav;
    }
}
// init NNavigator to nlib.
NNavigator.init();

//#endregion

//#region nlib (extension methods)

// NLib.Extension namespace.
NLib.Extension = class {}

//#region String

NLib.Extension.String = class {
    /** String.format - The C# like format. */
    static format(value, ...args) {
        // Usage:
        // let a = "welcome {0} to {1}";
        // a.format('Joe', 'My world');
        let a = value;
        for (let k in args) {
            a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), args[k]);
        }
        return a
    }
    /** Repeat character by specificed number. */
    static repeat(chr, count) {
        let str = "";
        for (var x = 0; x < count; x++) { str += chr };
        return str;
    }
    /** Pad Left by specificed number. */
    static padL(value, width, pad) {
        let api = NLib.Extension.String.api;
        let ret = value;
        if (width && width > 0) {
            let v = api.verify(pad, width, value.length)
            ret = api.formatL(v, value, width);
        }
        return ret;
    }
    /** Pad Right by specificed number. */
    static padR(value, width, pad) {
        let api = NLib.Extension.String.api;
        let ret = value;
        if (width && width > 0) {
            let v = api.verify(pad, width, value.length)
            ret = api.formatR(v, value, width);
        }
        return ret;
    }
    /**
     * Checks is specificed string has white space.
     *
     * @param {string} value The object to checks is null or undefined.
     * @returns {boolean} Returns true if value is contains one or more whitespace otherwise returns false.
     */
    static hasWhiteSpace(value) {
        let ret = false;
        if (value) ret = value.indexOf(' ') >= 0;
        return ret;
    }
    /**
     * Checks is valid email address text.
     * 
     * @param {string} value The object to checks is null or undefined.
     * @returns {boolean} Returns true if value is valid email format otherwist returns false.
     */
    static isValidEmail(value) {
        let ret = false;
        if (value) {
            let expr = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
            var r = new RegExp(expr);
            ret = (value.match(r) == null) ? false : true;
        }
        return ret;
    }
}
NLib.Extension.String.api = class {
    static verify(pad, width, length) {
        return { pad: (!pad) ? " " : pad, length: width - length }
    }
    static formatL(v, src, width) {
        let ret;
        if (v.length < 1) {
            ret = src.substr(0, width);
        }
        else {
            ret = (NLib.Extension.String.repeat(v.pad, v.length) + src).substr(0, width);
        }
        return ret;
    }
    static formatR(v, src, width) {
        let ret;
        if (v.length < 1) {
            ret = src.substr(0, width);
        }
        else {
            ret = (src + NLib.Extension.String.repeat(v.pad, v.length)).substr(0, width);
        }
        return ret;
    }
}
/** String.format - The C# like format. */
String.prototype.format = function() {
    // Usage:
    // let a = "welcome {0} to {1}";
    // a.format('Joe', 'My world');
    return NLib.Extension.String.format(this, ...arguments);
}
/** Repeat character by specificed number. */
String.repeat = function(chr, count) {
    return NLib.Extension.String.repeat(chr, count);
};
/** Pad Left by specificed number. */
String.prototype.padL = function (width, pad) {
    return NLib.Extension.String.padL(this, width, pad);

};
/** Pad Right by specificed number. */
String.prototype.padR = function (width, pad) {
    return NLib.Extension.String.padR(this, width, pad);
};
/**
 * Checks is specificed string has white space.
 *
 * @returns {boolean} Returns true if value is contains one or more whitespace otherwise returns false.
 */
String.prototype.hasWhiteSpace = function() {
    return NLib.Extension.String.hasWhiteSpace(this);
}
/**
 * Checks is valid email address text.
 * 
 * @returns {boolean} Returns true if value is valid email format otherwist returns false.
 */
String.prototype.isValidEmail = function() {
    return NLib.Extension.String.isValidEmail(this);
}

//#endregion

//#region Date

// Date.format Extension Methods.
NLib.Extension.Date = class {
    /** Date.format - The C# like DateTime.format. */
    static format(date, format) {
        // Usage:
        // let d = new Date();
        // d.format();
        // d.format('yyyy-MM-dd');
        // The avaliable format:
        //   yyyy : year (4 digits)
        //     yy : year (2 digits)
        //     MM : month (1-12)
        //     dd : date (1-31)
        //      t : pm/am
        //     HH : hour (0-23)
        //     hh : hour (1-12)
        //     mm : minute (0-59)
        //     ss : second (0-59)
        //    fff : milliseconds (0-999)
        let api = NLib.Extension.Date.api;
        if (!format) format = "yyyy-MM-dd HH-mm-ss.fff";

        let month = date.getUTCMonth() + 1;
        let year = date.getUTCFullYear();
        // year.
        format = api.formatYears(format, year);
        // month
        format = format.replace("MM", month.toString().padL(2, "0"));          
        // date.
        format = format.replace("dd", date.getUTCDate().toString().padL(2, "0"));
        // hour - am/pm.
        let hours = date.getUTCHours();
        format = api.formatAMPM(format, hours);
        // hour.
        format = api.formatHours(format, hours);
        // minute.
        format = api.formatMinutes(format, date);
        // second.
        format = api.formatSeconds(format, date);
        // millisecond.
        format = api.formatMilliseconds(format, date);

        return format;
    }
}
NLib.Extension.Date.api = class {
    static formatYears(format, year) {
        if (format.indexOf("yyyy") > -1)
            format = format.replace("yyyy", year.toString());
        else if (format.indexOf("yy") > -1)
            format = format.replace("yy", year.toString().substr(2, 2));
        return format;
    }
    static formatAMPM(format, hours) {
        if (format.indexOf("t") > -1) {
            if (hours > 11)
                format = format.replace("t", "pm")
            else
                format = format.replace("t", "am")
        }
        return format;
    }
    static format24Hour(format, hours) {
        if (format.indexOf("HH") > -1)
            format = format.replace("HH", hours.toString().padL(2, "0"));
        return format;
    }
    static format12Hour(format, hours) {
        if (format.indexOf("hh") > -1) {
            if (hours > 12) hours - 12;
            if (hours == 0) hours = 12;
            format = format.replace("hh", hours.toString().padL(2, "0"));
        }
        return format;
    }
    static formatHours(format, hours) {
        let api = NLib.Extension.Date.api;
        format = api.format12Hour(format, hours);
        format = api.format24Hour(format, hours);
        return format;
    }
    static formatMinutes (format, date) {
        if (format.indexOf("mm") > -1)
            format = format.replace("mm", date.getUTCMinutes().toString().padL(2, "0"));
        return format;
    }
    static formatSeconds(format, date) {
        if (format.indexOf("ss") > -1)
            format = format.replace("ss", date.getUTCSeconds().toString().padL(2, "0"));
        return format;
    }
    static formatMilliseconds(format, date) {
        if (format.indexOf("fff") > -1) {
            format = format.replace("fff", date.getUTCMilliseconds().toString().padL(3, "0"));
        }
        return format;
    }
}
/** Date.format - The C# like DateTime.format. */
Date.prototype.format = function(format) {
    // Usage:
    // let a = new Date();
    // d.format();
    // d.format('yyyy-MM-dd');
    // The avaliable format:
    //   yyyy : year (4 digits)
    //     yy : year (2 digits)
    //     MM : month (1-12)
    //     dd : date (1-31)
    //      t : pm/am
    //     HH : hour (0-23)
    //     hh : hour (1-12)
    //     mm : minute (0-59)
    //     ss : second (0-59)
    //    fff : milliseconds (0-999)
    let date = this;
    return NLib.Extension.Date.format(date, format);
};

//#endregion

//#endregion

//#region nlib (Delegate and Event classes)

/** NDelegate class. The .NET like delegate. */
class NDelegate {
    constructor() {
        this._locked = false;
        this._events = [];
    };
    //-- public methods.
    isFunction(value) {
        return (value && value instanceof Function);
    }
    indexOf(value) {
        let ret = -1;
        if (this.isFunction(value))
            ret = this._events.indexOf(value);
        return ret;
    };
    add(value) {
        if (this.isFunction(value)) {
            let index = this.indexOf(value);
            if (index === -1)
                this._events.push(value); // append.
            else this._events[index] = value; // replace.
        }
    };
    remove(value) {
        if (this.isFunction(value)) {
            let index = this.indexOf(value);
            if (index >= 0 && index < this._events.length) {
                this._events.splice(index, 1); // delete.
            }
        }
    };
    locked() { this._locked = true; };
    unlocked() { this._locked = false; };
    get isLocked() { return this._locked; };
    invoke(...args) {
        if (this._locked) return;
        let evtDataObj = this.createEventData(args);
        this._events.forEach((evt) => { this.raiseEvent(evt, evtDataObj); });
    };
    createEventData(...args) { return args; };
    raiseEvent(evt, evtDataObj) { evt(evtDataObj) };
};
/** EventHandler class. The .NET like EventHandler. */
class EventHandler extends NDelegate {
    //-- overrides
    getArgValue(arg, index) {
        let ret = null;
        if (arg && arg.length >= index + 1) ret = arg[index];
        return ret;
    }
    createEventData(...args) {
        let sender = null;
        let evtData = null;
        if (args && args.length >= 1) {
            sender = this.getArgValue(args[0], 0);
            evtData = this.getArgValue(args[0], 1);
            if (!evtData) { evtData = { sender: null, handled: false }; }
        }
        return { "sender": sender, "evtData": evtData }
    };
    raiseEvent(evt, evtDataObj) {
        let evtData = (!evtDataObj) ? { sender: null, handled: false } : evtDataObj.evtData;
        if (!evtData) { evtData = { handled: false }; }
        if (!evtData.handled) evtData.handled = false;
        if (!evtData.handled) { evt(evtDataObj.sender, evtData); }
    };
};
/** The Event Args class. The .NET like EventArgs. */
class EventArgs { static get Empty() { return null; } };

//#endregion

//#region nlib (local)Storage (reimplements required)

/**
 * name: NLib (local)Storage.
 * version: 1.0.8
 * required: none.
 * Source: simpleStorage.js (0.2.1) from https://github.com/ZaDarkSide/simpleStorage
 */
; (function () {
    //---- Begin local methods.
    var VERSION = '0.2.1';
    /* This is the object, that holds the cached values */
    var _storage = false;
    /* How much space does the storage take */
    var _storage_size = 0;

    var _storage_available = false;
    var _ttl_timeout = null;
    /* Status */
    var _lsStatus = 'OK';
    /* Error Code */
    var LS_NOT_AVAILABLE = 'LS_NOT_AVAILABLE';
    var LS_DISABLED = 'LS_DISABLED';
    var LS_QUOTA_EXCEEDED = 'LS_QUOTA_EXCEEDED';
    /**
     * This method might throw as it touches localStorage and doing so
     * can be prohibited in some environments
     */
    function _init() {
        //console.log('Execute local storage init code....');
        // this method throws if localStorage is not usable, otherwise returns true
        _storage_available = _checkAvailability();
        // Load data from storage
        _loadStorage();
        // remove dead keys
        _handleTTL();
        // start listening for changes
        _setupUpdateObserver();
        // handle cached navigation
        if ('addEventListener' in window) {
            window.addEventListener('pageshow', function (event) {
                if (event.persisted) {
                    _reloadData();
                }
            }, false);
        }
        _storage_available = true;
    }
    /**
     * Sets up a storage change observer
     */
    function _setupUpdateObserver() {
        if ('addEventListener' in window) {
            window.addEventListener('storage', _reloadData, false);
        } else {
            document.attachEvent('onstorage', _reloadData);
        }
    }
    /**
     * Reload data from storage when needed
     */
    function _reloadData() {
        try {
            _loadStorage();
        } catch (E) {
            _storage_available = false;
            return;
        }
        _handleTTL();
    }
    /**
     * Load.
     */
    function _loadStorage() {
        var source = localStorage.getItem('jsStorage');

        try {
            _storage = JSON.parse(source) || {};
        } catch (E) {
            _storage = {};
        }

        _storage_size = _get_storage_size();
    }
    /**
     * Save.
     */
    function _save() {
        try {
            localStorage.setItem('jsStorage', JSON.stringify(_storage));
            _storage_size = _get_storage_size();
        } catch (E) {
            return _formatError(E);
        }
        return true;
    }
    /**
     * Gets Storage Size.
     */
    function _get_storage_size() {
        var source = localStorage.getItem('jsStorage');
        return source ? String(source).length : 0;
    }
    /**
     * Handle TTL.
     */
    function _handleTTL() {
        var curtime, i, len, expire, keys, nextExpire = Infinity,
            expiredKeysCount = 0;

        clearTimeout(_ttl_timeout);

        if (!_storage || !_storage.__jsStorage_meta || !_storage.__jsStorage_meta.TTL) {
            return;
        }

        curtime = +new Date();
        keys = _storage.__jsStorage_meta.TTL.keys || [];
        expire = _storage.__jsStorage_meta.TTL.expire || {};

        for (i = 0, len = keys.length; i < len; i++) {
            if (expire[keys[i]] <= curtime) {
                expiredKeysCount++;
                delete _storage[keys[i]];
                delete expire[keys[i]];
            } else {
                if (expire[keys[i]] < nextExpire) {
                    nextExpire = expire[keys[i]];
                }
                break;
            }
        }

        // set next check
        if (nextExpire !== Infinity) {
            _ttl_timeout = setTimeout(_handleTTL, Math.min(nextExpire - curtime, 0x7FFFFFFF));
        }

        // remove expired from TTL list and save changes
        if (expiredKeysCount) {
            keys.splice(0, expiredKeysCount);

            _cleanMetaObject();
            _save();
        }
    }
    /**
     * Set TTL.
     */
    function _setTTL(key, ttl) {
        var curtime = +new Date(),
            i, len, added = false;

        ttl = Number(ttl) || 0;

        // Set TTL value for the key
        if (ttl !== 0) {
            // If key exists, set TTL
            if (_storage.hasOwnProperty(key)) {

                if (!_storage.__jsStorage_meta) {
                    _storage.__jsStorage_meta = {};
                }

                if (!_storage.__jsStorage_meta.TTL) {
                    _storage.__jsStorage_meta.TTL = {
                        expire: {},
                        keys: []
                    };
                }

                _storage.__jsStorage_meta.TTL.expire[key] = curtime + ttl;

                // find the expiring key in the array and remove it and all before it (because of sort)
                if (_storage.__jsStorage_meta.TTL.expire.hasOwnProperty(key)) {
                    for (i = 0, len = _storage.__jsStorage_meta.TTL.keys.length; i < len; i++) {
                        if (_storage.__jsStorage_meta.TTL.keys[i] === key) {
                            _storage.__jsStorage_meta.TTL.keys.splice(i);
                        }
                    }
                }

                // add key to keys array preserving sort (soonest first)
                for (i = 0, len = _storage.__jsStorage_meta.TTL.keys.length; i < len; i++) {
                    if (_storage.__jsStorage_meta.TTL.expire[_storage.__jsStorage_meta.TTL.keys[i]] > (curtime + ttl)) {
                        _storage.__jsStorage_meta.TTL.keys.splice(i, 0, key);
                        added = true;
                        break;
                    }
                }

                // if not added in previous loop, add here
                if (!added) {
                    _storage.__jsStorage_meta.TTL.keys.push(key);
                }
            } else {
                return false;
            }
        } else {
            // Remove TTL if set
            if (_storage && _storage.__jsStorage_meta && _storage.__jsStorage_meta.TTL) {

                if (_storage.__jsStorage_meta.TTL.expire.hasOwnProperty(key)) {
                    delete _storage.__jsStorage_meta.TTL.expire[key];
                    for (i = 0, len = _storage.__jsStorage_meta.TTL.keys.length; i < len; i++) {
                        if (_storage.__jsStorage_meta.TTL.keys[i] === key) {
                            _storage.__jsStorage_meta.TTL.keys.splice(i, 1);
                            break;
                        }
                    }
                }

                _cleanMetaObject();
            }
        }
        // schedule next TTL check
        clearTimeout(_ttl_timeout);
        if (_storage && _storage.__jsStorage_meta && _storage.__jsStorage_meta.TTL && _storage.__jsStorage_meta.TTL.keys.length) {
            _ttl_timeout = setTimeout(_handleTTL, Math.min(Math.max(_storage.__jsStorage_meta.TTL.expire[_storage.__jsStorage_meta.TTL.keys[0]] - curtime, 0), 0x7FFFFFFF));
        }

        return true;
    }
    /**
     * Clear Meta Object.
     */
    function _cleanMetaObject() {
        var updated = false,
            hasProperties = false,
            i;

        if (!_storage || !_storage.__jsStorage_meta) {
            return updated;
        }

        // If nothing to TTL, remove the object
        if (_storage.__jsStorage_meta.TTL && !_storage.__jsStorage_meta.TTL.keys.length) {
            delete _storage.__jsStorage_meta.TTL;
            updated = true;
        }

        // If meta object is empty, remove it
        for (i in _storage.__jsStorage_meta) {
            if (_storage.__jsStorage_meta.hasOwnProperty(i)) {
                hasProperties = true;
                break;
            }
        }

        if (!hasProperties) {
            delete _storage.__jsStorage_meta;
            updated = true;
        }

        return updated;
    }
    /**
     * Checks if localStorage is available or throws an error
     */
    function _checkAvailability() {
        var err;
        var items = 0;

        // Firefox sets localStorage to 'null' if support is disabled
        // IE might go crazy if quota is exceeded and start treating it as 'unknown'
        if (window.localStorage === null || typeof window.localStorage === 'unknown') {
            err = new Error('localStorage is disabled');
            err.code = LS_DISABLED;
            throw err;
        }

        // There doesn't seem to be any indication about localStorage support
        if (!window.localStorage) {
            err = new Error('localStorage not supported');
            err.code = LS_NOT_AVAILABLE;
            throw err;
        }

        try {
            items = window.localStorage.length;
        } catch (E) {
            throw _formatError(E);
        }

        try {
            // we try to set a value to see if localStorage is really usable or not
            window.localStorage.setItem('__jsStorageInitTest', (+new Date).toString(16));
            window.localStorage.removeItem('__jsStorageInitTest');
        } catch (E) {
            if (items) {
                // there is already some data stored, so this might mean that storage is full
                throw _formatError(E);
            } else {
                // we do not have any data stored and we can't add anything new
                // so we are most probably in Private Browsing mode where
                // localStorage is turned off in some browsers (max storage size is 0)
                err = new Error('localStorage is disabled');
                err.code = LS_DISABLED;
                throw err;
            }
        }

        return true;
    }
    /**
     * Format Error.
     */
    function _formatError(E) {
        var err;
        // No more storage:
        // Mozilla: NS_ERROR_DOM_QUOTA_REACHED, code 1014
        // WebKit: QuotaExceededError/QUOTA_EXCEEDED_ERR, code 22
        // IE number -2146828281: Out of memory
        // IE number -2147024882: Not enough storage is available to complete this operation
        if (E.code === 22 || E.code === 1014 || [-2147024882, -2146828281, -21474675259].indexOf(E.number) > 0) {
            err = new Error('localStorage quota exceeded');
            err.code = LS_QUOTA_EXCEEDED;
            return err;
        }

        // SecurityError, localStorage is turned off
        if (E.code === 18 || E.code === 1000) {
            err = new Error('localStorage is disabled');
            err.code = LS_DISABLED;
            return err;
        }

        // We are trying to access something from an object that is either null or undefined
        if (E.name === 'TypeError') {
            err = new Error('localStorage is disabled');
            err.code = LS_DISABLED;
            return err;
        }

        return E;
    };
    /**
     * Sets value for _lsStatus
     */
    function _checkError(err) {
        if (!err) {
            _lsStatus = 'OK';
            return err;
        }

        switch (err.code) {
            case LS_NOT_AVAILABLE:
            case LS_DISABLED:
            case LS_QUOTA_EXCEEDED:
                _lsStatus = err.code;
                break;
            default:
                _lsStatus = err.code || err.number || err.message || err.name;
        }

        return err;
    };
    //---- End local methods.

    //---- Begin of Local Storage Class.
    /**
     * Constructor.
     */
    function LocalStorage() {
        this.version = VERSION;
        this.status = _lsStatus;
    };
    /**
     * Checks can use local storage.
     */
    LocalStorage.prototype.canUse = function () {
        return _lsStatus === 'OK' && !!_storage_available;
    };
    /**
     * Sets Value to specificed key.
     */
    LocalStorage.prototype.set = function (key, value, options) {
        if (key === '__jsStorage_meta')
            return false;
        if (!_storage)
            return false;
        // undefined values are deleted automatically
        if (typeof value === 'undefined')
            return this.deleteKey(key);

        options = options || {};
        // Check if the value is JSON compatible (and remove reference to existing objects/arrays)
        try {
            value = JSON.parse(JSON.stringify(value));
        } catch (E) {
            return _formatError(E);
        }

        _storage[key] = value;
        _setTTL(key, options.TTL || 0);
        return _save();
    };
    /**
     * Checks specificed key is exists.
     */
    LocalStorage.prototype.hasKey = function (key) {
        return !!this.get(key);
    };
    /**
     * Gets Value by specificed key.
     */
    LocalStorage.prototype.get = function (key) {
        if (!_storage)
            return false;

        if (_storage.hasOwnProperty(key) && key !== '__jsStorage_meta') {
            // TTL value for an existing key is either a positive number or an Infinity
            if (this.getTTL(key)) {
                return _storage[key];
            }
        }
    };
    /**
     * Delete key.
     */
    LocalStorage.prototype.deleteKey = function (key) {
        if (!_storage)
            return false;

        if (key in _storage) {
            // delete from array.
            delete _storage[key];
            // update TTL to 0.
            _setTTL(key, 0);
            // Save to storage.
            return _save();
        }

        return false;
    };
    /**
     * Sets TTL value to specificed key.
     */
    LocalStorage.prototype.setTTL = function (key, ttl) {
        if (!_storage)
            return false;

        _setTTL(key, ttl);

        return _save();
    };
    /**
     * Gets TTL value from specificed key.
     */
    LocalStorage.prototype.getTTL = function (key) {
        var ttl;
        if (!_storage)
            return false;

        if (_storage.hasOwnProperty(key)) {
            if (_storage.__jsStorage_meta &&
                _storage.__jsStorage_meta.TTL &&
                _storage.__jsStorage_meta.TTL.expire &&
                _storage.__jsStorage_meta.TTL.expire.hasOwnProperty(key)) {

                ttl = Math.max(_storage.__jsStorage_meta.TTL.expire[key] - (+new Date()) || 0, 0);

                return ttl || false;
            } else {
                return Infinity;
            }
        }

        return false;
    };
    /**
     * Flush all data.
     */
    LocalStorage.prototype.flush = function () {
        if (!_storage)
            return false;

        _storage = {};
        try {
            localStorage.removeItem('jsStorage');
            return true;
        } catch (E) {
            return _formatError(E);
        }
    };
    /**
     * Retrieve all used keys as an array.
     */
    LocalStorage.prototype.index = function () {
        if (!_storage)
            return false;

        var index = [], i;
        for (i in _storage) {
            if (_storage.hasOwnProperty(i) && i !== '__jsStorage_meta') {
                index.push(i);
            }
        }
        return index;
    };
    /**
     * Gets storage size.
     */
    LocalStorage.prototype.storageSize = function () {
        return _storage_size;
    };
    /*
    // Run Test.
    LocalStorage.prototype.runTest = function () {
        console.log('Supports Local Storage: ', this.canUse());
        console.log('Set key1 to joe1');
        this.set('key1', 'joe1', { TTL: 100000 });
        this.set('key2', 'joe2', { TTL: 100000 });
        this.set('key3', 'joe3', { TTL: 100000 });
        console.log('Has key1: ', this.hasKey('key1'))
        var data1 = this.get('key1')
        console.log('Data for key1: ', data1);
        var keys = this.index();
        console.log('All index: ', keys);
    };
    */
    //---- End of Local Storage Class.

    // declare namespace. If not exists create new one with assigned factory.
    if (!nlib.storage) {
        try {
            _init();
        } catch (E) {
            _checkError(E);
        }            
        nlib.storage = nlib.create(LocalStorage);
    }
    else nlib.storage = nlib.storage; // re-assigned.
})();

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

//#region XMLHttpRequest

// Reference:
// New Tricks in XMLHttpRequest2: https://www.html5rocks.com/en/tutorials/file/xhr2/

class XHR {
    static get(url, data, callback) {
        let xhr = new XMLHttpRequest();

        xhr.open("GET", url, true);
        
        XHR.setGetReadyHandler(xhr, callback);
        XHR.setTimeoutHandler(xhr, callback);
        XHR.setErrorHandler(xhr, callback);

        let sJson = JSON.stringify(data);
        xhr.send(sJson);
    }
    static getFile(url, data, callback) {
        let xhr = new XMLHttpRequest();

        xhr.open("GET", url, true);
        xhr.responseType = 'blob';
        XHR.setGetLoadHandler(xhr, callback);
        XHR.setTimeoutHandler(xhr, callback);
        XHR.setErrorHandler(xhr, callback);

        let sJson = JSON.stringify(data);
        xhr.send(sJson);
    }
    static postJson(url, data, callback) {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        XHR.setPostJsonReadyHandler(xhr, callback);
        XHR.setTimeoutHandler(xhr, callback);
        XHR.setErrorHandler(xhr, callback);

        let sJson = JSON.stringify(data);
        xhr.send(sJson);
    }
    static sendFiles(url, files, progresssCB, completedCB) {
        let formData = new FormData();
        for (let i = 0, file; file = files[i]; ++i) {
            formData.append(file.name, file);
        }

        let xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        XHR.setPostFilesLoadHandler(xhr, completedCB);
        XHR.setTimeoutHandler(xhr, completedCB);
        XHR.setErrorHandler(xhr, completedCB);
        XHR.setPostProgressHandler(xhr, progresssCB);

        xhr.send(formData);
    }
}

XHR.executeCallback = (xhr, callback, value) => {
    if (callback) {
        let data = { xhr: xhr, result: value }
        callback(data);
    }
}
// MINE TYPES
XHR.minetypes = [
    { 
        type:"application/json",        
        parse: (xhr) => { 
            return JSON.parse(xhr.responseText);
        }
    },
    { 
        type:"text/plain", 
        parse: (xhr) => { return xhr.responseText; }
    },
    { 
        type:"text/css", 
        parse: (xhr) => { return xhr.responseText; }
    },
    { 
        type:"text/html", 
        parse: (xhr) => { return xhr.responseText; }
    },
    { 
        type:"text/javascript", 
        parse: (xhr) => { return xhr.responseText; }
    },
    { 
        type:"text/ecmascript", 
        parse: (xhr) => { return xhr.responseText; }
    },
    { 
        type:"application/javascript", 
        parse: (xhr) => { return xhr.responseText; }
    },
    { 
        type:"application/ecmascript", 
        parse: (xhr) => { return xhr.responseText; }
    }
];
XHR.parseValueByContentType = (xhr, contentType) => {
    let ret;    
    let type = contentType.split(';')[0]
    //console.log(type)
    let types = XHR.minetypes.map((mine) => mine.type)
    let idx = types.indexOf(type);
    if (idx !== -1) {
        ret = XHR.minetypes[idx].parse(xhr);
    }
    else {
        ret = xhr.response;
    }
    return ret;
}
XHR.setGetReadyHandler = (xhr, callback) => {
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let contentType = xhr.getResponseHeader("Content-Type");
            let val = XHR.parseValueByContentType(xhr, contentType);
            XHR.executeCallback(xhr, callback, val);
        }
    }
}
XHR.setTimeoutHandler = (xhr, callback) => {
    xhr.ontimeout = () => {
        if (callback) {
            let data = { xhr: xhr, result: 'timeout' }
            callback(data);
        }
    }
}
XHR.setErrorHandler = (xhr, callback) => {
    xhr.onerror = () => {
        if (callback) {
            let data = { xhr: xhr, result: 'error' }
            callback(data);
        }
    }
}
XHR.setGetLoadHandler = (xhr, callback) => {
    xhr.onload = (e) => {
        //console.log(e) // the ProgressEvent
        if (/*xhr.readyState === 4 && */xhr.status === 200) {
            // Note: .response instead of .responseText
            let data = { xhr: xhr, result: xhr.response }
            callback(data);
        }
    }
}
XHR.setPostJsonReadyHandler = (xhr, callback) => {
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let contentType = xhr.getResponseHeader("Content-Type");
            let val = XHR.parseValueByContentType(xhr, contentType);
            XHR.executeCallback(xhr, callback, val);
        }
    }
}
XHR.setPostFilesLoadHandler = (xhr, callback) => {
    xhr.onload = (e) => {
        if (xhr.status == 200) {
            //console.log('onload');
            //console.log(xhr.response);
            let data = { xhr: xhr, result: xhr.response }
            callback(data);
        }
    }
}
XHR.setPostProgressHandler = (xhr, callback) => {
    xhr.upload.onprogress = (e) => {
        //console.log('onprogress');
        if (e.lengthComputable) {
            let data = { xhr: xhr, result: (e.loaded / e.total) * 100 }
            callback(data)
        }
    }
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
 * // create new DateTime instance.
 * let dt = new DateTime();
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

//#region NDOM and related classes

//#region NDOM

NDOM = class {
    constructor(elem) {
        this.elem = elem;
        this.class = new NDOM.Class(this);
        this.event = new NDOM.Event(this);
        this.styles = new NDOM.Style(this);
        this.attrs = new NDOM.Attribute(this);
        this.selector = new NDOM.Selector(this);
    };
    // attribute
    attr(name, value) {
        let ret;
        if (this.elem && arguments) {
            if (arguments.length === 0) {
                ret = this.attrs;
            }
            else if (arguments.length === 1) {
                ret = this.attrs.get(name);
            }
            else if (arguments.length === 2) {
                this.attrs.set(name, value);
            }
        }
        return ret;
    };
    // style
    style(name, value) {
        let ret;
        if (this.elem && arguments) {
            if (arguments.length === 0) {
                ret = this.styles;
            }
            else if (arguments.length === 1) {
                ret = this.styles.get(name);
            }
            else if (arguments.length === 2) {
                this.styles.set(name, value);
            }
        }
        return ret;
    };
    // query selector
    query(selector) { 
        let ret = null;
        if (this.elem && arguments) {
            ret = (arguments.length === 0) ? this.selector : this.selector.gets(selector);
        }
        return ret;
    };
    // element information.
    get tagName() {
        let ret = ''
        if (this.elem) {
            ret = this.elem.tagName;
        }
        return ret;
    }
    get text() {
        let ret = ''
        if (this.elem) {
            ret = this.elem.textContent;
        }
        return ret;
    }
    set text(value) {
        if (this.elem) {
            if (this.elem.textContent != value) {
                this.elem.textContent = value;
            }
        }
    }
    get html() {
        let ret = '';
        if (this.elem) {
            ret = this.elem.innerHTML;
        }
        return ret;
    }
    set html(value) {
        if (this.elem) {
            if (this.elem.innerHTML != value) {
                this.elem.innerHTML = value;
            }
        }
    }
    // parent/child access.
    get parent() {
        let ret = null;
        if (this.elem && this.elem.parentElement) {
            ret = new NDOM(this.elem.parentElement);
        }
        return ret;
    }
    get children() {
        let results = [];
        if (this.elem) {
            let el = this.elem;
            let celems = el.children;
            if (celems && celems.length > 0) {
                let iMax = celems.length;
                for (let i = 0; i < iMax; i++) {
                    let celem = celems[i];
                    results.push(new NDOM(celem));
                }
            }
        }
        return results;
    }
    // child node management.
    addChild(dom) {
        if (!this.elem || !dom || !dom.elem) return;
        this._elem.appendChild(dom.elem);
    };
    removeChild(dom) {
        if (!this.elem || !dom || !dom.elem) return;
        this.elem.removeChild(dom.elem);
    };
    clearChildren() {
        if (!this.elem) return;
        while (this.elem.firstChild) {
            this.elem.removeChild(this.elem.firstChild);
        }
    };
    // offset
    get offsetLeft() {
        if (!this.elem) return undefined
        return this.elem.offsetLeft;
    }
    get offsetTop() { 
        if (!this.elem) return undefined
        return this.elem.offsetTop;
    }
    get offsetWidth() {
        if (!this.elem) return undefined
        return this.elem.offsetWidth;
    }
    get offsetHeight() {
        if (!this.elem) return undefined
        return this.elem.offsetHeight;
    }
    // behavior
    focus() { 
        if (!this.elem) return;
        this.elem.focus();
    };
    // static
    static create(tagName, options) {
        return new NDOM(document.createElement(tagName, options));
    };
};

//#endregion

//#region NDOM.Class

NDOM.Class = class {
    constructor(dom) { this.dom = dom; };
    add(...classNames) {
        if (!this.hasElement) return;
        let el = this._dom.elem;
        el.classList.add(...classNames);
    };
    remove(...classNames) {
        if (!this.hasElement) return;
        this.elem.classList.remove(...classNames);
    };
    toggle(className, force) {
        if (!this.hasElement || !this.isValidName(className)) return;
        return this.elem.classList.toggle(className, force);
    };
    has(className) {
        if (!this.hasElement || !this.isValidName(className)) return;
        return this.elem.classList.contains(className);
    };
    replace(oldClassName, newClassName) {
        if (!this.hasElement || 
            !this.isValidName(oldClassName) || 
            !this.isValidName(newClassName)) return;
        this.elem.classList.replace(oldClassName, newClassName);
    };
    isValidName(name) { return (name && name.trim() !== ''); }
    get hasElement() { return this.dom && this.dom.elem; }
    get elem() { return (this.dom && this.dom.elem) ? this.dom.elem : null; }
};

//#endregion

//#region NDOM.Event

NDOM.Event = class {
    constructor(dom) { this.dom = dom; };
    // event
    add(eventName, handler, options) {
        if (this.hasElement && this.isValidName(eventName) && handler) {
            this.elem.addEventListener(eventName, handler, options);
        }
    };
    remove(eventName, handler, options) {
        if (!this.hasElement) return;
        if (!this.isValidName(eventName)) return;
        this.elem.removeEventListener(eventName, handler, options);
    };
    isValidName(name) { return (name && name.trim() !== ''); }
    get hasElement() { return this.dom && this.dom.elem; }
    get elem() { return (this.dom && this.dom.elem) ? this.dom.elem : null; }
};

//#endregion

//#region NDOM.Attribute

NDOM.Attribute = class {
    constructor(dom) { this.dom = dom; };
    get(name) {
        let ret;
        if (this.hasElement && this.isValidName(name)) {
            ret = this.elem.getAttribute(name);
        }
        return ret;
    };
    set(name, value) {
        if (this.hasElement && this.isValidName(name)) {
            this.elem.setAttribute(name, value);
        }
    };
    remove(name) {
        if (this.hasElement && this.isValidName(name)) {
            this.elem.removeAttribute(name);
        }
    };
    has(name) {
        let ret = false;
        if (this.hasElement && this.isValidName(name)) {
            ret = this.elem.hasAttribute(name);
        }
        return ret;
    };
    toggle(name, value) {
        if (this.hasElement && this.isValidName(name)) {
            if (this.has(name)) this.remove(name);
            else {
                this.set(name, this.formatValue(value));
            }
        }
    };
    formatValue(value) { return (value) ? value : ''; }
    isValidName(name) { return (name && name.trim() !== ''); }
    get hasElement() { return this.dom && this.dom.elem; }
    get elem() { return (this.dom && this.dom.elem) ? this.dom.elem : null; }
};

//#endregion

//#region NDOM.Style

NDOM.Style = class {
    constructor(dom) {
        this.dom = dom;
        this.margins = new NDOM.Margin(dom);
        this.paddings = new NDOM.Padding(dom);
    };
    get(name) {
        let ret;
        if (this.hasElement && this.isValidName(name)) {
            ret = this.elem.style[name];
        }
        return ret;
    };
    set(name, value) {
        if (this.hasElement && this.isValidName(name)) {
            this.elem.style[name] = value;
        }
    };
    remove(name) {
        if (this.hasElement && this.isValidName(name)) {
            this.elem.style[name] = undefined;
        }
    };
    has(name) {
        let ret = false;
        if (this.hasElement && this.isValidName(name)) {
            ret = (this.elem.style[name] !== undefined && this.elem.style[name] !== '');
        }
        return ret;
    };
    margin() {
        let ret;
        if (this.margins) {
            ret = (!arguments || arguments.length === 0) ? 
                this.margins.val() : this.margins.val(...arguments);
        }
        return ret;
    };
    // padding
    padding() {
        let ret;
        if (this.paddings) {
            ret = (!arguments || arguments.length === 0) ? 
                this.paddings.val() : this.paddings.val(...arguments);
        }
        return ret;
    };
    isValidName(name) { return (name && name.trim() !== ''); }
    get hasElement() { return this.dom && this.dom.elem; }
    get elem() { return (this.dom && this.dom.elem) ? this.dom.elem : null; }
};

//#endregion

//#region NDOM.Style (wrapper)

//#region BlockStyle (common style)

NDOM.BlockStyle = class {
    constructor(dom) {
        this.dom = dom;
        this.prefix = '';
    };
    val() {
        let ret;
        if (this.hasElement)
        {
            if (arguments) {
                if (arguments.length === 1) {
                    let value = arguments[0];
                    this.dom.style(this.prefix, value);
                }
                else if (arguments.length === 2) {
                    let value = 
                        arguments[0] + // top-bottom
                        ' ' +
                        arguments[1];  // right-left
                    this.dom.style(this.prefix, value);
                }
                else if (arguments.length === 3) {
                    let value = 
                        arguments[0] + // top
                        ' ' + 
                        arguments[1] + // right-left
                        ' ' +
                        arguments[2];  // bottom
                    this.dom.style(this.prefix, value);
                }
                else if (arguments.length === 4) {
                    let value = 
                        arguments[0] + // top
                        ' ' + 
                        arguments[1] + // right-left
                        ' ' +
                        arguments[2] + // bottom
                        ' ' + 
                        arguments[3];  // left
                    this.dom.style(this.prefix, value);
                }
                else {
                    ret = this.dom.style(this.prefix);
                }
            }
            else {
                ret = this.dom.style(this.prefix);
            }
        }
        return ret;
    }
    get left() {
        return (this.hasElement) ? this.dom.style(this._prefix + '-left') : undefined;
    }
    set left(value) {
        return (this.hasElement) ? this.dom.style(this._prefix + '-left', value) : undefined;
    }
    get right() {
        return (this.hasElement) ? this.dom.style(this._prefix + '-right') : undefined;
    }
    set right(value) {
        return (this.hasElement) ? this.dom.style(this._prefix + '-right', value) : undefined;
    }
    get top() {
        return (this.hasElement) ? this.dom.style(this._prefix + '-top') : undefined;
    }
    set top(value) {
        return (this.hasElement) ? this.dom.style(this._prefix + '-top', value) : undefined;
    }
    get bottom() {
        return (this.hasElement) ? this.dom.style(this._prefix + '-bottom') : undefined;
    }
    set bottom(value) {
        return (this.hasElement) ? this.dom.style(this._prefix + '-bottom', value) : undefined;
    }
    isValidName(name) { return (name && name.trim() !== ''); }
    get hasElement() { return this.dom && this.dom.elem; }
    get elem() { return (this.dom && this.dom.elem) ? this.dom.elem : null; }
};

//#endregion

//#region Margin

NDOM.Margin = class extends NDOM.BlockStyle {
    constructor(dom) {
        super(dom);
        this.prefix = 'margin';
    };
};

//#endregion

//#region Padding

NDOM.Padding = class extends NDOM.BlockStyle {
    constructor(dom) {
        super(dom);
        this.prefix = 'padding';
    };
};

//#endregion

//#endregion

//#region NDOM.Selector

NDOM.Selector = class {
    constructor(dom) { this.dom = dom; };
    // returns the first child element that matches a specified CSS selector(s).
    // of an element. If not found null returns.
    get(selector) {
        let ret = null;
        if (this.hasElement && this.isValidName(selector)) {
            let element = this.elem.querySelector(selector);
            ret = (element) ? element : null;
        }
        return ret;
    };
    // returns a collection of an element's child elements that match a specified 
    // CSS selector(s), as a static NodeList object. If not found empty array returns.
    gets(selector) {
        let results = [];
        if (this.hasElement && this.isValidName(selector)) {
            let elements = this.elem.querySelectorAll(selector);
            if (elements) {
                elements.forEach(element => {
                    let edom = new NDOM(element);
                    results.push(edom);
                })
            }
        }
        return results;
    };
    isValidName(name) { return (name && name.trim() !== ''); }
    get hasElement() { return this.dom && this.dom.elem; }
    get elem() { return (this.dom && this.dom.elem) ? this.dom.elem : null; }
};

//#endregion

//#endregion

//#region NRuntime

class NRuntime {
    /** init class prototype to nlib */
    static init() {
        if (!nlib.runtime) {
            nlib.runtime = nlib.create(NRuntime);
        }
        else nlib.runtime = nlib.runtime;
    }
}
NRuntime.File = class {
    /** Get extension from url. */
    getExtension(url) { return url.split('.').pop() }
    async load(...urls) {
        let mine = this.extractByFileTypes(urls)
        return new Promise((resolve, reject) => {
            let state = { count: 0, max: 0 }
            if (urls) {
                state.count = 0
                state.max = urls.length;
                let completed = (type_state) => { 
                    state.count += type_state.count
                    if (state.count === state.max) {
                        resolve(state)
                    }
                }
                this.loadcssFiles(mine, completed)
                this.loadjsFiles(mine, completed)
            }
            else {
                resolve(state)
            }
        })
    }
    extractByFileTypes(urls) {
        let ret = {}
        let self = this
        if (urls) {
            urls.forEach(url => {
                let type = self.getExtension(url)
                if (!ret[type]) ret[type] = []
                ret[type].push(url)
            })
        }
        return ret;
    }
    loadcssFiles(mine, completed) {
        if (mine && mine.css && mine.css.length > 0) {
            nlib.runtime.css.load(...mine.css).then(completed)
        }
        else {
            NRuntime.File.raise(completed, { type:'css', count: 0, max: 0 })
        }
    }
    loadjsFiles(mine, completed) {
        if (mine && mine.js && mine.js.length > 0) {
            nlib.runtime.js.load(...mine.js).then(completed)
        }
        else {
            NRuntime.File.raise(completed, { type:'js', count: 0, max: 0 })
        }
    }
    static raise(callback, ...args) {
        if (callback) callback(...args)
    }
    /** init class prototype to nlib */
    static init() {
        if (!nlib.runtime) NRuntime.init()
        if (!nlib.runtime.file) {
            nlib.runtime.file = nlib.create(NRuntime.File);
        }
        else nlib.runtime.file = nlib.runtime.file;
    }
}
NRuntime.File.css = class {
    async load(...urls) {
        return new Promise((resolve, reject) => {
            let state = { type:'css', count: 0, max: 0 }
            if (urls) {
                state.count = 0
                state.max = urls.length
                let completed = () => { 
                    state.count++
                    if (state.count === state.max) {
                        resolve(state)
                    }
                }
                NRuntime.File.css.loadFiles(urls, completed)
            }
            else {
                resolve(state)
            }
        })
    }
    static raise(callback, ...args) {
        if (callback) callback(...args)
    }
    static exists(url) {
        let found = false
        let target = url.toLowerCase()
        let collection = document.getElementsByTagName('link')
        let links = (collection) ? [...collection] : []
        let map = links.map(link => link.href.toLowerCase() )
        let filter = map.filter(src => src.endsWith(target) )
        found = filter.length > 0
        return found
    }
    static loadFile(url, completed) {
        let head = document.getElementsByTagName('head')[0]
        let link = document.createElement('link')
        //link.setAttribute('href', url)
        //link.setAttribute('type', 'text/css')
        //link.setAttribute('rel', 'stylesheet')
        link.href = url.toLowerCase()
        link.type = 'text/css'
        link.rel = 'stylesheet'
        link.onload = () => { NRuntime.File.css.raise(completed) }
        // append to end of head tag to start load.
        head.appendChild(link)
    }
    static loadFiles(urls, completed) {
        let exists = NRuntime.File.css.exists
        let load = NRuntime.File.css.loadFile
        if (urls && urls.length > 0) {
            urls.forEach(url => {
                if (!exists(url)) {
                    load(url, completed)
                }
                else {
                    NRuntime.File.css.raise(completed)
                }
            })
        }
        else {
            NRuntime.File.css.raise(completed)
        }
    }
    /** init class prototype to nlib */
    static init() {
        if (!nlib.runtime) NRuntime.init()
        if (!nlib.runtime.css) {
            nlib.runtime.css = nlib.create(NRuntime.File.css);
        }
        else nlib.runtime.css = nlib.runtime.css;
    }
}
NRuntime.File.js = class {
    async load(...urls) {
        return new Promise((resolve, reject) => {
            let state = { type:'js', count: 0, max: 0 }
            if (urls && urls.length > 0) {
                state.count = 0
                state.max = urls.length
                let completed = () => { 
                    state.count++
                    if (state.count === state.max) {
                        resolve(state)
                    }
                }
                NRuntime.File.js.loadFiles(urls, completed)
            }
            else {
                resolve(state)
            }
        })
    }
    static raise(callback, ...args) {
        if (callback) callback(...args)
    }
    static exists(url) {
        let found = false
        let target = url.toLowerCase()
        let collection = document.getElementsByTagName('script')
        let scripts = (collection) ? [...collection] : []
        let map = scripts.map(script => script.src.toLowerCase() )
        let filter = map.filter(src => src.endsWith(target) )
        found = filter.length > 0
        return found
    }
    static checkReadyState(script) {
        return (!script.readyState || script.readyState === 'loaded' || script.readyState === 'complete')
    }
    static loadFile(url, completed) {
        let body = document.getElementsByTagName('body')[0]
        let done = false
        let script = document.createElement('script')
        //script.setAttribute('src', url)
        //script.setAttribute('type', 'text/javascript')
        script.src = url.toLowerCase()
        script.type = 'text/javascript'
        script.async = false
        script.onload = script.onreadystatechange = (e) => {
            if (!done && NRuntime.File.js.checkReadyState(script)) {
                done = true
                // cleans up a little memory
                script.onload = script.onreadystatechange = null
                // to avoid douple loading.
                // comment out because cannot check file name to ignore reload
                //body.removeChild(script)
                // execute callback
                NRuntime.File.js.raise(completed)
            }
        }
        // append to end of body tag to start load.
        body.appendChild(script)
        done = false // reset flag
    }
    static loadFiles(urls, completed) {
        let exists = NRuntime.File.js.exists
        let load = NRuntime.File.js.loadFile
        if (urls && urls.length > 0) {
            urls.forEach(url => {
                if (!exists(url)) {
                    load(url, completed)
                }
                else {
                    NRuntime.File.js.raise(completed)
                }
            })
        }
        else {
            NRuntime.File.js.raise(completed)
        }
    }
    /** init class prototype to nlib */
    static init() {
        if (!nlib.runtime) NRuntime.init()
        if (!nlib.runtime.js) {
            nlib.runtime.js = nlib.create(NRuntime.File.js);
        }
        else nlib.runtime.js = nlib.runtime.js;
    }
}

NRuntime.init()
NRuntime.File.init()
NRuntime.File.css.init()
NRuntime.File.js.init()

//#endregion

console.log('nlib loaded.')
