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

const clone = (pObj, caseSensitive) => {
    return (pObj) ? nlib.clone(pObj, caseSensitive) : {}
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

const getSqlType = (p) => {
    return (p.type) ? parse(p.type) : null;
}

const getDefaultValue = (p) => {
    return (p && p.default) ? p.default : null;
}
const getValue = (p, name, pObj) => {
    val = (pObj && (name in pObj || pObj.name)) ? pObj[name] : getDefaultValue(p);
    return val;
}

const formatValue = (sqlType, value) => {
    // to implements.
    return value;
}

const assignInput = (rq, p, pObj) => {
    let name = p.name.toLowerCase();
    let tsqltype = getSqlType(p);
    let val = getValue(p, name, pObj);
    if (tsqltype)
        rq.input(name, tsqltype, formatValue(tsqltype, val));
    else rq.input(name, val);
}

const assignOutput = (rq, p, pObj) => {
    let name = p.name.toLowerCase();
    let tsqltype = getSqlType(p);
    let val = getValue(p, name, pObj);
    if (tsqltype)
        rq.output(name, tsqltype, formatValue(tsqltype, val));
    else rq.output(name, val);
}

const prepareInputs = (rq, pObj, inputs) => {
    if (rq) {
        if (checkInputs(inputs)) {
            inputs.forEach(p => {
                assignInput(rq, p, pObj);
            });
        }
    }
}

const prepareOutputs = (rq, pObj, outputs) => {
    if (rq) {
        if (checkOutputs(outputs)) {
            outputs.forEach(p => {
                assignOutput(rq, p, pObj);
            });
        }
    }
}

const prepare = (rq, pObj, inputs, outputs) => {
    prepareInputs(rq, pObj, inputs);
    prepareOutputs(rq, pObj, outputs);
}

const createResult = () => {
    return {
        multiple: false,
        data: null,
        datasets: null,
        errors: {
            hasError: false,
            ErrMsg: ''
        } 
    };
}

const hasRecordSets = (dbResult) => {
    return (dbResult && dbResult.recordsets && dbResult.recordsets.length > 0);
}

const updateResult = (result, dbResult) => {
    if (hasRecordSets(dbResult)) {
        let recordsets = dbResult.recordsets;
        if (recordsets.length > 1) {
            result.multiple = true;
            result.datasets = recordsets;
        }
        else {
            result.multiple = false;
            result.data = recordsets[0];
        }
    }
}

const getOutputValue = (rq, p, output) => {
    let p1 = rq.parameters[p.name.toLowerCase()];
    let p2 = output[p.name.toLowerCase()];
    // note:
    // for newer version the parameter value always null but keep code for reference.
    // So use Result.output[name] to get data instead of req.paramters[name].value.
    let v1 = (p1) ? p1.value : null; 
    let v2 = (p2) ? p2 : null;
    let ret = (v2) ? v2 : v1;
    return ret;
}

const readOutputs = (rq, outputs, dbResult) => {
    let ret = {}
    if (rq) {
        if (checkOutputs(outputs)) {
            outputs.forEach(p => {
                ret[p.name] = getOutputValue(rq, p, dbResult.output);
            });
        }
    }
    return ret;
}

const prepareStatement = async (ps, text) => {
    let isPrepared = false;
    await ps.prepare(text); // let its error if something invalid.
    isPrepared = true;
    return isPrepared;
}

const unprepareStatement = async (ps, isPrepared) => {
    if (isPrepared) await ps.unprepare();
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
    async query(text, pObj, inputs, outputs) {
        let ret = createResult();
        if (this.connected) {
            let ps = new mssql.PreparedStatement(this.connection);
            
            let o = clone(pObj);
            prepare(ps, o, inputs, outputs);
            let isPrepared = false;

            try {
                isPrepared = await prepareStatement(ps, text);
                let dbResult = await ps.execute(o);
                updateResult(ret, dbResult);
                ret.out = readOutputs(ps, outputs, dbResult);
            }
            catch (err) {
                ret.errors.hasError = true;
                ret.errors.ErrMsg = err.message;
            }
            finally {
                await unprepareStatement(ps, isPrepared);
            }
        }

        return ret;
    }
    /**
     * Execute Stored Procedure.
     */
    async execute(name, pObj, inputs, outputs) {
        let ret = createResult();
        if (this.connected) {
            let req = new mssql.Request(this.connection);

            let o = clone(pObj);
            prepare(req, o, inputs, outputs);

            try {
                let dbResult = await req.execute(name);
                updateResult(ret, dbResult);
                ret.out = readOutputs(req, outputs, dbResult);
            }
            catch (err) {
                ret.errors.hasError = true;
                ret.errors.ErrMsg = err.message;
            }
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
