//#region NLib Utils

/**
 * module: NLib Utils.
 * version  1.0.8
 * required: none.
 */
; (function () {
    /**
     * Constructor.
     */
    function Utils() { };
    /**
     * Checks is object is null or undefined.
     *
     * @param {any} value The object to checks is null or undefined.
     * @returns {boolean} Returns true if value is null otherwist returns false.
     */
    Utils.prototype.isNull = function(value) {
        // Note. Empty string is evaluate is null.
        //return (value === null || value === 'undefined' || typeof value === 'undefined');
        return (!value || value === 'undefined');
    };
    /**
     * Checks is specificed string has white space.
     *
     * @param {string} value The object to checks is null or undefined.
     * @returns {boolean} Returns true if value is contains one or more whitespace otherwise returns false.
     */
    Utils.prototype.hasWhiteSpace = function (value) {
        if (value === null || value === 'undefined' || typeof value === 'undefined')
            return false;
        return value.indexOf(' ') >= 0;
    };
    /**
     * Checks is valid email address text.
     * 
     * @param {string} value The object to checks is null or undefined.
     * @returns {boolean} Returns true if value is valid email format otherwist returns false.
     */
    Utils.prototype.isValidEmail = function (value) {
        if (!value || value === 'undefined')
            return false;
        var r = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
        return (value.match(r) == null) ? false : true;
    };
    /**
     * get expired date from current date by specificed expired day(s).
     * if nothing assigned 1 day returns.
     * 
     * @param {Number} value The number of expires days start from today.
     * @returns {Date} Returns expired date. If no expiredDays assigned. one day will used.
     */
    Utils.prototype.getExpiredDate = function (expiredDays) {
        var date = new Date();

        var day = expiredDays;
        if (expiredDays === null || expiredDays === 'undefined' || typeof expiredDays === 'undefined')
            day = 1;

        if (day < 1) day = 1;
        var seconds = 60 * 60 * 24 * day;

        date.setTime(date.getTime() + (seconds * 1000));
        return date;
    };
    /**
     * Generate new Unique Id.
     */
    Utils.prototype.newUId = function() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    };

    // declare namespace. If not exists create new one with assigned factory.
    if (!nlib.utils) {
        nlib.utils = nlib.create(Utils);
    }
    else nlib.utils = nlib.utils;
})();

//#endregion
