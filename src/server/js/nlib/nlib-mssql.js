/** @module server/nlib-mssql */

const nlib = require('./nlib');

//#region Internal methods

// check is mssql npm package is installed if not auto install it.
const check_modules = () => {
    // node-mssql
    if (!nlib.NPM.exists('mssql')) {
        // install if required.
        nlib.NPM.install('mssql');
    }
    // moment.js
    if (!nlib.NPM.exists('moment')) {
        // install if required.
        nlib.NPM.install('moment');
    }
}
// check if node module installed.
check_modules();

// assume install package(s) successfully.
const moment = require('moment');
const mssql = require('mssql');
// default config.
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
// extract datatype information from string.
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
// Mapped Type Convert functions.
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
const formatBit = (value) => {
    let ret = null;
    if (value) {
        let val = String(value).toLocaleUpperCase();
        let valList = [
            { code: '1', value: true },
            { code: 'TRUE', value: true },
            { code: 'YES', value: true },
            { code: 'Y', value: true },
            { code: '0', value: false },
            { code: 'FALSE', value: false },
            { code: 'NO', value: false },
            { code: 'N', value: false },
            { code: 'NULL', value: null }
        ]
        let idx = valList.indexOf(val);
        if (idx !== -1) {
            ret = valList[idx];
        }
        else {
            console.log('no match boolean string. value is :', value);
            ret = value;
        }
    }
    return ret;
}
// The moment custom date formats.
const dateFormats = [
    'YYYY-MM-DD HH.mm.ss.SSS',
    'YYYY/MM/DD HH.mm.ss.SSS',
    'YYYY-MM-DD HH:mm:ss.SSS',
    'YYYY/MM/DD HH:mm:ss.SSS'
]
const formatDateTime = (value) => {
    let ret = null;
    try {
        let dt = moment(value, dateFormats);
        //ret = (dt.isValid()) ? new Date(dt.utc()) : null;
        ret = (dt.isValid()) ? dt.toDate() : null;
        //console.log('OTHER DATE (try to used moment.js):', ret);
    }
    catch (ex) {
        console.log(ex);
        console.log('OTHER DATE (try to used moment.js): failed.');
    }

    return ret;
}
// value formatter array.
const ValueFormatters = [
    { type: mssql.Bit, format: formatBit },
    { type: mssql.Date, format: formatDateTime },
    { type: mssql.DateTime, format: formatDateTime },
    { type: mssql.DateTime2, format: formatDateTime },
    { type: mssql.DateTimeOffset, format: formatDateTime }
];
const formatValue = (sqlType, value) => {
    let types = ValueFormatters.map(fmt => { return fmt.type; })
    let idx = types.indexOf(sqlType.type);
    let ret = value;
    if (idx !== -1) {
        ret = ValueFormatters[idx].format(value);
    }
    return ret;
}
const assignInput = (rq, p, pObj) => {
    let name = p.name.toLowerCase();
    let tsqltype = getSqlType(p);
    let val = getValue(p, name, pObj);
    if (tsqltype) {
        let newVal = formatValue(tsqltype, val);
        rq.output(name, tsqltype, newVal);
        // update value back to proper type required for new version of node-mssql.
        pObj[name] = newVal;
    }
    else rq.input(name, val);
}
const assignOutput = (rq, p, pObj) => {
    let name = p.name.toLowerCase();
    let tsqltype = getSqlType(p);
    let val = getValue(p, name, pObj);
    if (tsqltype) {
        let newVal = formatValue(tsqltype, val);
        rq.output(name, tsqltype, newVal);
        // update value back to proper type required for new version of node-mssql.
        pObj[name] = newVal;
    }
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
// prepare
const prepare = (rq, pObj, inputs, outputs) => {
    prepareInputs(rq, pObj, inputs);
    prepareOutputs(rq, pObj, outputs);
}
// create result object.
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
// prepare statement
const prepareStatement = async (ps, text) => {
    let isPrepared = false;
    await ps.prepare(text); // let its error if something invalid.
    isPrepared = true;
    return isPrepared;
}
// unprepare statement
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
     * Execute Query.
     * 
     * @param {String} text The query text.
     * @param {Object} pObj The parameter object.
     * @param {Array} inputs The input parameter information array.
     * @param {Array} outputs The output parameter information array.
     * 
     * @example <caption>Run Query Example 1 (simple query).</caption>
     * 
     * const SqlServer = require('./src/server/js/nlib/nlib-mssql');
     * let runSP = async () => {
     *     let mssqlSvr = new SqlServer();
     *     if (await mssqlSvr.connect()) {
     *         console.log('database is connected.');
     *         let qry = {
     *             text: text: 'select 10 as Item'
     *         }
     *         let pObj = { inVal: 1234 };
     *         let ret = await mssqlSvr.query(qry.text);
     *         console.log(ret);
     * 
     *         await mssqlSvr.disconnect();
     *         console.log('database is disconnected.');
     *     }
     * }
     * 
     * runSP();
     * 
     * @example <caption>Run Query Example 2 (query with input/output parameter(s)).</caption>
     * 
     * const SqlServer = require('./src/server/js/nlib/nlib-mssql');
     * let runSP = async () => {
     *     let mssqlSvr = new SqlServer();
     *     if (await mssqlSvr.connect()) {
     *         console.log('database is connected.');
     *         let qry = {
     *             text: 'select @inVal as value; select @outVal = 10',
     *             inputs: [
     *                 { name: "inVal", type: "int", default: 0 }
     *             ],
     *             outputs: [
     *                 { name: "outVal", type: "int", default: 0 }
     *             ],
     *         }
     *         let pObj = { inVal: 1234 };
     *         let ret = await mssqlSvr.query(qry.text, pObj, qry.inputs, qry.outputs);
     *         console.log(ret);
     * 
     *         await mssqlSvr.disconnect();
     *         console.log('database is disconnected.');
     *     }
     * }
     * 
     * runSP();
     * 
     * 
     * @example <caption>Run Query Example 3 (query with date parameter).</caption>
     * 
     * const SqlServer = require('./src/server/js/nlib/nlib-mssql');
     * let runSP = async () => {
     *     let mssqlSvr = new SqlServer();
     *     if (await mssqlSvr.connect()) {
     *         console.log('database is connected.');
     *         let qry = {
     *             text: 'select @inDate as currdate',
     *             inputs: [
     *                 { name: "inDate", type: "datetime", default: null }
     *             ]
     *         }
     *         let pObj = { 
     *             inDate: new Date(2019, 6, 31, 13, 45, 22, 879) // js date (month is zero based)
     *             //inDate: '2019-07-31 13:45:22.878' // The date in string that match supports date format.
     *             //inDate: '2019-07-31 13.45.22.877' // The date in string that match supports date format.
     *             //inDate: '2019-07-31' // The date in string that match supports date format.
     *             //inDate: null // The date is null
     *         }
     * 
     *         let ret = await mssqlSvr.query(qry.text, pObj, qry.inputs);
     *         console.log(ret);
     * 
     *         await mssqlSvr.disconnect();
     *         console.log('database is disconnected.');
     *     }
     * }
     * 
     * runSP();
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
     * 
     * @param {String} name The Stored Procedure name.
     * @param {Object} pObj The parameter object.
     * @param {Array} inputs The input parameter information array.
     * @param {Array} outputs The output parameter information array.
     * 
     * @example <caption>Execute Stored Procedure Example 1 (sp without output parameter).</caption>
     * 
     * const SqlServer = require('./src/server/js/nlib/nlib-mssql');
     * let runSP = async () => {
     *     let mssqlSvr = new SqlServer();
     *     if (await mssqlSvr.connect()) {
     *         console.log('database is connected.');
     *         let sp = {
     *             name: 'GetCustomers',
     *             inputs: [
     *                 { name: "langId", type: "nvarchar(3)", default: null },
     *                 { name: "customerId", type: "nvarchar(30)", default: null },       
     *                 { name: "enabled", type: "bit", default: null }
     *             ],
     *             outputs: []
     *         }
     *         let pObj = { langId: 'TH' };
     *         let ret = await mssqlSvr.execute(sp.name, pObj, sp.inputs, sp.outputs);
     *         console.log(ret);
     * 
     *         await mssqlSvr.disconnect();
     *         console.log('database is disconnected.');
     *     }
     * }
     * 
     * runSP();
     * 
     * @example <caption>Execute Stored Procedure Example 2 (sp with output parameters).</caption>
     * const SqlServer = require('./src/server/js/nlib/nlib-mssql');
     * let runSP = async () => {
     *     let mssqlSvr = new SqlServer();
     *     if (await mssqlSvr.connect()) {
     *         console.log('database is connected.');
     *         let sp = {
     *             name: 'GetVoteSummaries',
     *             inputs: [
     *                 { name: "customerId", type: "nvarchar(30)", default: null },
     *                 { name: "qSetId", type: "nvarchar(30)", default: null },
     *                 { name: "qSeq", type: "int", default: null },
     *                 { name: "beginDate", type: "datetime", default: null },
     *                 { name: "endDate", type: "datetime", default: null },
     *                 { name: "orgId", type: "nvarchar(30)", default: null },
     *                 { name: "deviceId", type: "nvarchar(30)", default: null },
     *                 { name: "userId", type: "nvarchar(30)", default: null }
     *             ],
     *             outputs: [
     *                 { name: "errNum", type: "int", default: null },
     *                 { name: "errMsg", type: "nvarchar(max)", default: null }
     *             ]
     *         }
     * 
     *         // All required parameters is set so result should return data from database.
     *         let pObj = { customerId: 'EDL-C2018080001', qSetId: 'QS00001', qSeq: 1 };
     * 
     *         // Some required parameters is set not set so errNum and errMsg will
     *         // returns from stored procedure (out paramter).
     *         //let pObj = { customerId: 'EDL-C2018080001', qSetId: null, qSeq: null };
     * 
     *         let ret = await mssqlSvr.execute(sp.name, pObj, sp.inputs, sp.outputs);
     *         console.log(ret);
     * 
     *         await mssqlSvr.disconnect();
     *         console.log('database is disconnected.');
     *     }
     * }
     * 
     * runSP();
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

    /**
     * Gets schema of database.
     */
    static async getSchema(name = 'default') {
        let sqldb = new SqlServer();
        console.log('connect to:', name);
        await sqldb.connect(name);

        console.log('do someting....');

        await sqldb.disconnect();
        console.log('close connection');
    }

    //#endregion
}

//#endregion

module.exports = exports = SqlServer;
