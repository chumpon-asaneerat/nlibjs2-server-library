const nlib = require('./nlib');

//#region Internal methods

const check_modules = () => {
    if (!nlib.NPM.exists('mssql')) {
        nlib.NPM.install('mssql'); // install if required.
    }
}
// check if node module installed.
check_modules();

const mssql = require('mssql'); // assume install successfully.
const mssqlCfg = {
    default: {
        server: 'localhost',
        database: 'master',
        user: 'sa',
        password: 'winnt123',
        pool: {
            max: 10,
            min: 0,
            timeout: 1000
        }
    }
}

const check_config = (name = 'default') => {
    let dbCfg;
    let cfg = nlib.Config;
    if (!cfg.exists()) {
        cfg.set('mssql', mssqlCfg);
        // save to file.
        cfg.update();
    }

    let sName = name.trim().toLowerCase();
    if (!cfg.get('mssql.' + sName)) {
        cfg.set('mssql.' + sName, mssqlCfg.default);
        cfg.update();
    }

    return cfg.get('mssql.' + sName);
}

const get_type = (sStr, sidx) => {
    return (sidx !== -1) ? sStr.substring(0, sidx).trim() : sStr.trim();
}

const get_params = (sStr, sidx, eidx) => {
    return (sidx !== -1 && eidx !== -1) 
        ? sStr.substring(sidx + 1, eidx).split(',').map(p => Number(p))
        : null;
}

const extract = (str) => {
    let sStr = str.trim().toLowerCase();
    let sidx = sStr.indexOf('(');
    let eidx = sStr.indexOf(')');
    let result = {};
    // get type name only (in string)
    result.type = get_type(sStr, sidx);
    // split all parameters
    result.params = get_params(sStr, sidx, eidx)

    return result;
}

/**
 * Mapped Type Convert functions.
 */
const Convert = {
    "nvarchar": mssql.NVarChar,
    "nchar": mssql.NChar,
    "varchar": mssql.VarChar,
    "char": mssql.Char,
    "ntext": mssql.NText,
    "text": mssql.Text,

    "bigint": mssql.BigInt,
    "int": mssql.Int,
    "smallint": mssql.SmallInt,
    "tinyint": mssql.TinyInt,

    "numeric": mssql.Numeric,
    "decimal": mssql.Decimal,
    "float": mssql.Float,
    "real": mssql.Real,
    "money": mssql.Money,
    "smallmoney": mssql.SmallMoney,

    "bit": mssql.Bit,
    "varbinary": mssql.VarBinary,
    "binary": mssql.Binary,
    "image": mssql.Image,

    "datetime": mssql.DateTime,
    "date": mssql.Date,
    "time": mssql.Time,
    "smalldatetime": mssql.SmallDateTime,
    "datetime2": mssql.DateTime2,
    "datetimeoffset": mssql.DateTimeOffset,

    "guid": mssql.UniqueIdentifier,
    "UniqueIdentifier": mssql.UniqueIdentifier
}

const get_1_params = (tObj) => { 
    return (tObj.params && tObj.params.length >= 1) ? tObj.params[0] : null;
}

const get_2_params = (tObj) => { 
    return (tObj.params && tObj.params.length >= 2) ? tObj.params[1] : null;
}

const parse = (str) => {
    let tObj = extract(str);
    let sType = tObj.type;
    let p1 = get_1_params(tObj);
    let p2 = get_2_params(tObj);
    return (p1) ? (p2) ? Convert[sType](p1, p2) : Convert[sType](p1) : Convert[sType]();
}

const checkInputs = (inputs) => {
    let ret = true;
    if (!inputs || inputs.length <= 0) ret = false;
    return ret;
}
const checkOutputs = (outputs) => {
    let ret = true;
    if (!outputs || outputs.length <= 0) ret = false;
    return ret;
}

const prepareInputs = (rq, inputs) => {
    if (rq) {
        if (checkInputs(inputs)) {
            inputs.forEach(p => {
                req.input(p.name, parse(p.type), p.value);
            });
        }
    }
}
const prepareOutputs = (rq, outputs) => {
    if (rq) {
        if (checkOutputs(inputs)) {
            outputs.forEach(p => {
                req.input(p.name, parse(p.type), p.value);
            });
        }
    }
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
    async connect(name = 'default') {
        let ret;
        if (!mssql) ret = false;
        let cfg = check_config(name);

        this.connection = new mssql.ConnectionPool(cfg);
        try {
            await this.connection.connect();
        }
        catch (err) {
            //console.log(err)
            this.connection = null;
        }
        
        ret = this.connected;
        return ret;
    }
    /**
     * Run Query.
     */
    async query(opts, pObj) {
        let ret = {};
        if (this.connected) {
            let ps = new mssql.PreparedStatement(this.connection);

            prepareInputs(ps, opts.inputs);
            prepareOutputs(ps, opts.outputs);

            await ps.prepare(opts.text);
            ret = await ps.execute(opts.value);
            await ps.unprepare();
        }

        return ret;
    }
    /**
     * Execute Stored Procedure.
     */
    async execute(opts, pObj) {
        let ret = {};
        if (!this.connected) {
            let req = new mssql.Request(this.connection);

            prepareInputs(req, opts.inputs);
            prepareOutputs(req, opts.outputs);

            ret = await req.execute(opts.name);
        }

        return ret;
    }
    /**
     * Disconnect from database.
     */
    async disconnect() {
        if (this.connected) {
            await this.connection.close();
            this.connection = null;
            //console.log('database is disconnected.');
        }        
    }

    //#endregion

    //#region public properties

    /**
     * Checks is connected to target database server.
     */
    get connected() {
        return (mssql && this.connection && this.connection.connected);
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
