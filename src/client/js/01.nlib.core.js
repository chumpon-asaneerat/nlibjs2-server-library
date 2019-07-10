//#region NLib Core

/**
 * module: NLib Core.
 * version: 1.0.8
 * required: none.
 */
nlib = function () {
    //---- Begin of Helper Class.
    /**
     * Constructor.
     * 
     * @param {any} nlib_instance The instance of nlib.
     */
    function _helpersClass(nlib_instance) {
        this._nlib = nlib_instance;
        this.ModuleName = 'Helpers';
    }
    /**
     * Register code add-in.
     * 
     * @param {any} instance
     * @param {string} addInName
     * @param {method} getMethod
     */
    _helpersClass.prototype.registerCodeAddIn = function (instance, addInName, getMethod) {
        if (!instance) {
            console.log('instance is null.');
            return;
        }
        //console.log("Module Name: " + addInName);
        Object.defineProperty(instance, addInName, {
            configurable: true,
            get: getMethod
        });
    };
    //---- End of Helper Class.

    //------------------------------------------------------
    // [==== NLib Helper register code add-in.         ====]
    //------------------------------------------------------
    var _instance = null; // for singelton instance.
    var _helpers = null; // for helper instance.

    /**
     * Constructor.
     */
    function _ctor() {
        // class definition
        var obj = {};
        if (!obj.prototype) obj.prototype = {};
        /**
         * Create new object with specificed factory. If factory is null new object returns.
         */
        obj.create = function (factory) {
            var result;
            if (!factory) {
                result = {};
                result.prototype = Object.create(Object.prototype);
            }
            else {
                result = new factory();
                result.prototype = Object.create(factory.prototype);
            } 
            return result;
        };
        /**
         * Get Type Name of specificed object.
         */
        obj.typeName = function(obj) {
            return (!obj || !obj.constructor) ? 'undefined' : obj.constructor.name;
        };
        // define helpers
        Object.defineProperty(obj, 'helpers', {
            get: function () {
                if (!_helpers)
                    _helpers = new _helpersClass(obj);
                return _helpers;
            }
        });
        // returns created instance.
        return obj;
    };
    /**
     * Gets Instance.
     * 
     * @returns {any} new instance if no exists instance otherwise returns exists instance.
     */
    function _getInstance() {
        if (!_instance)
            _instance = _ctor(); // Again no new keyword;
        return _instance;
    };

    // return new object that contains getInsance method to execute immediately.    
    return {
        getInstance: _getInstance
    };
}().getInstance();

//#endregion
