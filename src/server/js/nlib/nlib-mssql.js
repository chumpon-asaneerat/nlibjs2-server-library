const nlib = require('./nlib');
let mssql;
let mssql_module_name = 'mssql';

//#region Internal methods

const check_modules = () => {
    if (!nlib.NPM.exists(mssql_module_name)) {
        nlib.NPM.install(mssql_module_name); // install if required.
    }
}
// check if node module installed.
check_modules();

if (nlib.NPM.exists(mssql_module_name)) {
    mssql = require(mssql_module_name)
}

//#endregion

//#region SqlServer

/**
 * The SqlServer class. Provide data access for microsoft sql server database.
 */
const SqlServer = class {
    //#region public methods

    /**
     * Create new instance of Microsoft Sql Server data access.
     */
    constructor() {
        // init local variables.
        /** The mssql connection. */
        this.connection = null;
    }

    //#endregion

    //#region public methods

    /**
     * Connect to database.
     * 
     * @return {Boolean} Return true if database server is connected.
     */
    connect() {
        let ret;
        if (!mssql) ret = false;

        return ret;
    }
    /**
     * Run Query.
     */
    query() {
        let ret;
        if (!this.connected) ret = false;
        return ret;
    }
    /**
     * Execute Stored Procedure.
     */
    execute() {
        let ret;
        if (!this.connected) ret = false;
        return ret;
    }
    /**
     * Disconnect from database.
     */
    disconnect() {
        if (this.connected) {
            this.connection = null;
        }
    }

    //#endregion

    //#region public properties

    /**
     * Checks is connected to target database server.
     */
    get connected() {
        return (!mssql && this.connection);
    }

    //#endregion

    //#region static methods and properties

    /**
     * Gets SqlServer class version.
     */
    static get version() { return "2.0.0"; }

    //#endregion
}

//#endregion

module.exports = exports = SqlServer;
