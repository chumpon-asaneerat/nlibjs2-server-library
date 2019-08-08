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
     * Checks is specificed string has white space.
     *
     * @param {string} value The object to checks is null or undefined.
     * @returns {boolean} Returns true if value is contains one or more whitespace otherwise returns false.
     */
    hasWhiteSpace(value) {
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
    isValidEmail(value) {
        let ret = false;
        if (value) {
            let expr = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
            var r = new RegExp(expr);
            ret = (value.match(r) == null) ? false : true;
        }
        return ret;
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
                ret = JSON.parse(cookie);
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

//#region TODO Local Storage

// Local Storage
(() => {
})();

//#endregion

//#region XMLHttpRequest

// Reference:
// New Tricks in XMLHttpRequest2: https://www.html5rocks.com/en/tutorials/file/xhr2/

class XHR {
    static get(url, callback) {
        let xhr = new XMLHttpRequest();

        xhr.open("GET", url, true);
        
        XHR.setGetReadyHandler(xhr, callback);
        XHR.setTimeoutHandler(xhr, callback);
        XHR.setErrorHandler(xhr, callback);

        xhr.send();
    }
    static getFile(url, callback) {
        let xhr = new XMLHttpRequest();

        xhr.open("GET", url, true);
        xhr.responseType = 'blob';
        XHR.setGetLoadHandler(xhr, callback);
        XHR.setTimeoutHandler(xhr, callback);
        XHR.setErrorHandler(xhr, callback);

        xhr.send();
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
XHR.setGetReadyHandler = (xhr, callback) => {
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            XHR.executeCallback(xhr, callback, xhr.responseText);
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
            XHR.executeCallback(xhr, callback, xhr.responseText);
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

console.log('nlib loaded.')