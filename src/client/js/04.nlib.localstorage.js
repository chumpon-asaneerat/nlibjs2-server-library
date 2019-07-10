//#region NLib (local)Storage

/**
 * module: NLib (local)Storage.
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
