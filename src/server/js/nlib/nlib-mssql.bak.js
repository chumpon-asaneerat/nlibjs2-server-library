/** @module server/nlib-mssql */

const nlib = require('./nlib');
const path = require('path');
const fs = require('fs');
const dot = require('dot');
dot.templateSettings.strip = false; // preserve space.

const beautify = require('js-beautify').js

//#region Internal variable and methods

// The newline character.
const newline = '\r\n';

//#region file and path

const isDir = (pathName) => {
    try {
        return fs.lstatSync(pathName).isDirectory();
    } 
    catch {
        return false;
    }
}
const checkDir = (pathName) => {
    let dirname = path.normalize(pathName).split(path.sep);
    dirname.forEach((sdir, index) => {
        var pathInQuestion = dirname.slice(0, index+1).join(path.sep);
        if ((!isDir(pathInQuestion)) && pathInQuestion) fs.mkdirSync(pathInQuestion);
    });
}

//#endregion

//#region common queries

const queries = {}
// get stored procedures and functions list.
queries.getProcedures = () => {
    let ret = '';

    ret = ret + "SELECT ROUTINE_NAME AS name" + newline;
    ret = ret + "     , ROUTINE_TYPE AS type" + newline;
    ret = ret + "     , CREATED AS created" + newline;
    ret = ret + "     , LAST_ALTERED AS updated" + newline;
    ret = ret + ", ROUTINE_DEFINITION AS code" + newline;
    ret = ret + "  FROM INFORMATION_SCHEMA.ROUTINES" + newline;
    ret = ret + " WHERE ROUTINE_NAME NOT LIKE 'sp_%'" + newline;
    ret = ret + "   AND ROUTINE_NAME NOT LIKE 'fn_%'" + newline;
    ret = ret + " ORDER BY LAST_ALTERED" + newline;

    return ret;
}

queries.getProcedureParameters = (name) => {
    let ret = '';

    ret = ret + "SELECT ORDINAL_POSITION AS No" + newline;
    ret = ret + "     , PARAMETER_NAME AS name" + newline;
    ret = ret + "     , DATA_TYPE AS type" + newline;
    ret = ret + "     , PARAMETER_MODE AS mode" + newline;
    ret = ret + "     , CHARACTER_MAXIMUM_LENGTH AS size" + newline;
    ret = ret + "     , NUMERIC_PRECISION AS precision" + newline;
    ret = ret + "     , NUMERIC_SCALE AS scale" + newline;
    ret = ret + "  FROM INFORMATION_SCHEMA.PARAMETERS" + newline;
    ret = ret + " WHERE SPECIFIC_NAME = '" + name + "'" + newline;
    ret = ret + " ORDER BY ORDINAL_POSITION" + newline;

    return ret;
};

//#endregion

//#region Stoded Procedure parameter parser related methods

queries.parseParameters = async (params, defaultValue) => {
    let ret = {
        inputs: [],
        outputs: []
    };

    let p, o;
    for (let i = 0; i < params.length; i++) {
        p = params[i];
        o = queries.parseParameter(p, defaultValue)
        
        if (queries.isInput(p)) ret.inputs.push(o);
        if (queries.isOutput(p)) ret.outputs.push(o);
    }

    return ret;
}

queries.isInput = (param) => {
    return (param.mode === 'IN');
    //return (param.mode.indexOf('IN') !== -1);
}

queries.isOutput = (param) => {
    return (param.mode.indexOf('OUT') !== -1);
}
queries.parseParameter = (param, defaultValue) => {
    let o = {};

    if (param.name && param.name.length > 0)
        o.name = param.name.substring(1, param.name.length)
    else o.name = '__ret'
    o.type = param.type;
    // sqlserver not keep default value so need parse from source code.
    // If the value is not correct required to manual edit json file.
    o.default = queries.getDefaultValue(param, defaultValue);
    queries.checkParameterType(param, o);

    return o;
}
queries.getDefaultValue = (param, defaultValue) => {
    let names = defaultValue.parameters.map(p => '@' + p.name);
    let idx = names.indexOf(param.name);
    return (idx === -1) ? undefined : defaultValue.parameters[idx].value;
}
queries.checkParameterType = (param, o) => {
    if (param.size) {
        // max
        if (param.size === -1) o.type = o.type + '(max)';
        else o.type = o.type + '(' + param.size.toString() + ')';
    }
    if (param.scale) {
        o.type = o.type + '(' + param.precision.toString() + ', '+ param.scale.toString() + ')';
    }
}

//#endregion

//#region Parse stored procedure source code for default value

const defaultvalues = {}

defaultvalues.parse = (sp) => {
    let o = {
        codeUpr: sp.code.toUpperCase(),
        current: sp.code.toUpperCase(),
        parameters: []
    }
    defaultvalues.fiterDeclareBlock(sp, o);
    defaultvalues.filterParameterList(sp, o);
    return o;
}
defaultvalues.fiterDeclareBlock = (sp, o) => {
    let idx = o.current.indexOf('CREATE ');
    o.current = o.current.substring(idx + 'CREATE '.length, o.current.length);
    if (sp.type === 'PROCEDURE') {
        // procedure.
        idx = o.current.indexOf(' PROCEDURE ');
        o.current = o.current.substring(idx + ' PROCEDURE '.length, o.current.length);
    }
    else {
        // function.
        idx = o.current.indexOf(' FUNCTION ');
        o.current = o.current.substring(idx + ' FUNCTION '.length, o.current.length);
    }            
    idx = o.current.indexOf('AS');
    o.current = o.current.substring(0, idx);
}
defaultvalues.filterParameterList = (sp, o) => {
    let idx = o.current.indexOf('@');
    let idx2, pItem;
    while (idx !== -1) {
        o.current = o.current.substring(idx + 1, o.current.length)
        idx2 = o.current.indexOf('@') // find next param position
        if (idx2 === -1)
            pItem = o.current
        else pItem = o.current.substring(0, idx2)
        
        if (pItem.indexOf('=') !== -1) {
            let result = defaultvalues.parseNameValue(sp, o, pItem);
            o.parameters.push(result)
        }
        idx = idx2;
    }
}
defaultvalues.parseNameValue = (sp, o, pItem) => {
    let idx = o.codeUpr.indexOf(pItem);
    let sItem = sp.code.substring(idx, idx + pItem.length);
    idx = sItem.indexOf('=');
    let lf = sItem.substring(0, idx);
    let rg = sItem.substring(idx + 1, sItem.length);
    idx = lf.indexOf(' ');
    let name = lf.substring(0, idx);
    idx = rg.indexOf(',')
    if (idx === -1) idx = rg.indexOf(')');
    if (idx === -1) idx = rg.length;
    let value = rg.substring(0, idx);
        
    idx = value.toUpperCase().indexOf('OUT');
    if (idx !== -1) value = value.substring(0, idx);

    return { name: name.trim(), value: value.trim() };
}

//#endregion

//#region Check is mssql npm package is installed if not auto install it

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

//#endregion

//#region SqlServer config

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

//#endregion

//#region Stored Procedure prepare datatype and default value parser

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
    return (p && p.default !== undefined) ? p.default : undefined;
}
const getValue = (p, name, pObj) => {
    val = (pObj && (name in pObj || pObj.name)) ? pObj[name] : getDefaultValue(p);
    return val;
}
const formatBit = (value) => {
    let ret = null;
    if (value !== 'undefined') {
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
        let codeList = valList.map(val => val.code);
        let idx = codeList.indexOf(val);
        if (idx !== -1) {
            ret = valList[idx].value;
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
        // fixed timezone offset (need to check if has problem)
        ret = new Date(ret.getTime() - (ret.getTimezoneOffset() * 60 * 1000))
        //console.log('OTHER DATE (try to used moment.js):', ret);
    }
    catch (ex) {
        console.log(ex);
        console.log('OTHER DATE (try to used moment.js): failed.');
    }

    return ret;
}
/**
 * formatBuffer.
 * 
 * @param {String} value The string that represents base64 data.
 */
const formatBuffer = value => {
    let ret = null;
    try {
        if (value) {
            ret = Buffer.from(value)
        }
    }
    catch (ex) {
        console.log(ex);
    }

    return ret;
}
// value formatter array.
const ValueFormatters = [
    { type: mssql.Bit, format: formatBit },
    { type: mssql.Date, format: formatDateTime },
    { type: mssql.DateTime, format: formatDateTime },
    { type: mssql.DateTime2, format: formatDateTime },
    { type: mssql.DateTimeOffset, format: formatDateTime },
    { type: mssql.VarBinary, format: formatBuffer },
    { type: mssql.Binary, format: formatBuffer },
    { type: mssql.Image, format: formatBuffer }
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
        rq.input(name, tsqltype, newVal);
        // update value back to proper type required for new version of node-mssql.
        pObj[name] = newVal;
    }
    else {
        rq.input(name, val);
    }
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
    else {
        rq.output(name, val);
    }
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

//#endregion

//#region Result related methods

// error codes constant.
const errorCodes = {
    UNKNOWN: -100,
    CONNECT_ERROR: -101,
    EXECUTE_ERROR: -102,
    QUERY_ERROR: -103,
    NO_DATA_ERROR: -104
}
// create result object.
const createResult = () => {
    let ret = nlib.NResult.empty();
    // append properties.
    ret.multiple = false;
    ret.datasets = null;
    return ret;
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
    let v1 = (p1 !== undefined) ? p1.value : null; 
    let v2 = (p2 !== undefined) ? p2 : null;
    let ret = (v2 !== undefined) ? v2 : v1;
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

//#endregion

//#region Prepare/Unprepare

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

//#endregion

//#region SqlServer

/**
 * The SqlServer class. Provide data access for microsoft sql server database.
 */
const SqlServer = class {
    //#region constructor

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
                ret.errors.errNum = errorCodes.QUERY_ERROR;
                ret.errors.errMsg = err.message;
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
                ret.errors.errNum = errorCodes.EXECUTE_ERROR;
                ret.errors.errMsg = err.message;
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

    //#region error related methods and properties

    /**
     * Gets error numbers constant for error code. The default value are 
     * UNKNOWN: -100, 
     * CONNECT_ERROR: -101, 
     * EXECUTE_ERROR: -102, 
     * QUERY_ERROR: -103, 
     * NO_DATA_ERROR: -104
     */
    get errorNumbers() { return errorCodes; }
    /**
     * Create new Result Object with specificed error number and error message.
     * 
     * @param {Number} errNum The error number or error code.
     * @param {String} errMsg The error message.
     * @return {Object} returns the object that contains error number and error message
     * that has same structure of another error in execute method and query method.
     */
    error(errNum, errMsg) {
        let ret = createResult();
        ret.errors.hasError = true;
        ret.errors.errNum = errNum;
        ret.errors.errMsg = errMsg;
        return ret
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

    static getSchemaConfigFileName(name = 'default', outPath = 'schema') {
        let cfg = check_config(name);
        let dbName = (cfg) ? cfg.database : name; // get database name.
        let pathName = path.join(nlib.paths.root, outPath);
        checkDir(pathName);
        let file = path.join(pathName, dbName + '.schema.config.json');
        return file;
    }
    static getSchemaFileName(name = 'default', outPath = 'schema') {
        let cfg = check_config(name);
        let dbName = (cfg) ? cfg.database : name; // get database name.
        let pathName = path.join(nlib.paths.root, outPath);
        checkDir(pathName);
        let file = path.join(pathName, dbName + '.schema.json');
        return file;
    }
    static getSchemaConfig(name = 'default', outPath = 'schema') {
        let file = SqlServer.getSchemaConfigFileName(name, outPath);
        let ret;
        if (fs.existsSync(file)) ret = require(file);
        if (!ret) ret = {}
        return ret;
    }
    static async generateSchemaConfig(name = 'default', outPath = 'schema') {
        let file = SqlServer.getSchemaConfigFileName(name, outPath);
        let sqldb = new SqlServer();
        await sqldb.connect(name);
        if (sqldb.connected) {
            let dbRet;
            let ret = SqlServer.getSchemaConfig(name, outPath);
            dbRet = await sqldb.query(queries.getProcedures());
            let procs = dbRet.data;
            let procCnt = procs.length;
            for (let i = 0; i < procCnt; i++) {
                let sp = procs[i];
                if (!ret[sp.name]) ret[sp.name] = false            
            }
            // write file.
            fs.writeFileSync(file, JSON.stringify(ret, null, 4), 'utf8', )
        }
        await sqldb.disconnect();
    }
    /**
     * Generate database schema file.
     * 
     * @param {String} name The database reference name in nlib.config.json (default is 'default')
     * @param {String} outPath The output path (default is 'schema') 
     */
    static async generateSchema(name = 'default', outPath = 'schema') {
        let sqldb = new SqlServer();
        await sqldb.connect(name);
        if (sqldb.connected) {
            let dbRet;
            let schemaCfg = SqlServer.getSchemaConfig(name, outPath);
            let ret = {};
            dbRet = await sqldb.query(queries.getProcedures());
            let procs = dbRet.data;
            let procCnt = procs.length;
            for (let i = 0; i < procCnt; i++) {
                let sp = procs[i];
                if (!schemaCfg[sp.name]) continue; // skip generate.                
                ret[sp.name] = {
                    type: sp.type,
                    //created: sp.created,
                    updated: sp.updated
                }
                let defaultValue = defaultvalues.parse(sp);

                dbRet = await sqldb.query(queries.getProcedureParameters(sp.name));
                let param = dbRet.data;
                ret[sp.name].parameter = (param) ? 
                    await queries.parseParameters(param, defaultValue) : 
                    { inputs:[], output: [] };
            }
            // write file.
            let file = SqlServer.getSchemaFileName(name, outPath);
            fs.writeFileSync(file, JSON.stringify(ret, null, 4), 'utf8', )
        }
        await sqldb.disconnect();
    }

    static async generateSchemaJavascriptFile(name = 'default', outPath = 'schema') {
        let cfg = nlib.Config;
        let file = SqlServer.getSchemaFileName(name, outPath);
        let schema = require(file);        
        let db = {
            name: name,
            databaseName: cfg.get('mssql.' + name + ".database"),
            procedures: []
        }

        for (let key in schema) {
            db.procedures.push({
                name: key,
                parameter: schema[key].parameter
            })
        }
        
        let tmpl = `
        // required to manual set require path for nlib-mssql.
        const SqlServer = require('./src/server/js/nlib/nlib-mssql');
        const schema = require('./schema/{{=it.databaseName}}.schema.json');

        const {{=it.databaseName}} = class extends SqlServer {
            constructor() {
                super();
                // should match with nlib.config.json
                this.database = '{{=it.name}}'
            }
            async connect() { return await super.connect(this.database); }
            async disconnect() { await super.disconnect(); }
            {{~it.procedures :value:index}}
            async {{=value.name}}(pObj) {
                let name = '{{=value.name}}';
                let proc = schema[name];
                return await this.execute(name, pObj, proc.parameter.inputs, proc.parameter.outputs);
            }
            {{~}}
        }

        module.exports = exports = {{=it.databaseName}};
        `;
        let tmplFn = dot.template(tmpl.toString());
        let compileTmpl = tmplFn(db);
        let jsText = beautify(compileTmpl, { indent_size: 4, space_in_empty_paren: true });
        let jsFile = path.join(nlib.paths.root, db.databaseName + '.db.js');
        fs.writeFileSync(jsFile, jsText + '\n');
    }

    //#endregion
}

//#endregion

module.exports = exports = SqlServer;
