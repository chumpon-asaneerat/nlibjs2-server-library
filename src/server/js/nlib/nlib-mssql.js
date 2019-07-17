/** @module server/nlib-mssql */

const nlib = require('./nlib');
const path = require('path');
const fs = require('fs');

//#region Internal variable and methods

// The newline character.
const newline = '\r\n';

// file and path.
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

// common queries.
const queries = {}
// get stored procedures and functions list.
queries.getProcedures = () => {
    let ret = '';

    ret = ret + "SELECT TOP 1 ROUTINE_NAME AS name" + newline;
    ret = ret + "     , ROUTINE_TYPE AS type" + newline;
    ret = ret + "     , CREATED AS created" + newline;
    ret = ret + "     , LAST_ALTERED AS updated" + newline;
    ret = ret + ", ROUTINE_DEFINITION AS code" + newline;
    ret = ret + "  FROM INFORMATION_SCHEMA.ROUTINES" + newline;
    ret = ret + " WHERE ROUTINE_NAME NOT LIKE 'sp_%'" + newline;
    ret = ret + "   AND ROUTINE_NAME NOT LIKE 'fn_%'" + newline;
    ret = ret + "   AND ROUTINE_NAME = 'GetBranchs'" + newline;    
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

queries.parseParameters = async (params) => {
    let ret = {
        inputs: [],
        outputs: []
    };

    let p, o;
    for (let i = 0; i < params.length; i++) {
        p = params[i];
        o = queries.parseParameter(p)
        
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

queries.parseParameter = (param) => {
    let o = {};

    if (param.name && param.name.length > 0)
        o.name = param.name.substring(1, param.name.length)
    else o.name = '__ret'
    o.type = param.type;
    // sqlserver not keep default value so need to manually edit json file.
    //o.default = undefined;
    queries.checkParameterType(param, o);

    return o;
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
    return (p && p.default) ? p.default : undefined;
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
     * Generate database schema file.
     * 
     * @param {String} name The database reference name in nlib.config.json (default is 'default')
     * @param {String} outPath The output path (default is 'schema') 
     */
    static async generateSchema(name = 'default', outPath = 'schema') {
        let sqldb = new SqlServer();
        await sqldb.connect(name);
        let dbRet;
        let ret = {};
        dbRet = await sqldb.query(queries.getProcedures());
        let procs = dbRet.data;
        let procCnt = procs.length;
        for (let i = 0; i < procCnt; i++) {
            let sp = procs[i];
            ret[sp.name] = {
                //name: sp.name,
                type: sp.type,
                //created: sp.created,
                updated: sp.updated
            }

            let code = sp.code.toUpperCase();
            let ucode = sp.code.toUpperCase();
            
            let idx1, idx2, idx3, idx4, idx5, idx6, idx7, idx8;
            let lf, rg, name, value;
            idx1 = code.indexOf('CREATE ');
            code = code.substring(idx1 + 'CREATE '.length, code.length);
            if (sp.type === 'PROCEDURE') {
                // procedure.
                idx1 = code.indexOf(' PROCEDURE ');
                code = code.substring(idx1 + ' PROCEDURE '.length, code.length);
            }
            else {
                // function.
                idx1 = code.indexOf(' FUNCTION ');
                code = code.substring(idx1 + ' FUNCTION '.length, code.length);
            }            
            idx2 = code.indexOf('AS');
            code = code.substring(0, idx2);

            idx3 = code.indexOf('@');            
            let pList = [];
            let pItem, sItem;
            while (idx3 !== -1) {
                code = code.substring(idx3 + 1, code.length)
                idx4 = code.indexOf('@') // find next param position
                if (idx4 === -1)
                    pItem = code
                else pItem = code.substring(0, idx4)
                
                if (pItem.indexOf('=') !== -1) {
                    idx5 = ucode.indexOf(pItem);
                    sItem = sp.code.substring(idx5, idx5 + pItem.length);
                    idx6 = sItem.indexOf('=');
                    lf = sItem.substring(0, idx6)
                    idx7 = lf.indexOf(' ');
                    name = lf.substring(0, idx7);
                    rg = sItem.substring(idx6 + 1, sItem.length)
                    idx8 = rg.indexOf(',')
                    if (idx8 === -1) idx8 = rg.indexOf(')')
                    if (idx8 === -1) idx8 = rg.length;
                    
                    value = rg.substring(0, idx8);

                    pList.push({ name: name.trim(), value: value.trim() })
                }

                idx3 = idx4;
            }

            console.log(pList);

            dbRet = await sqldb.query(queries.getProcedureParameters(sp.name));
            let param = dbRet.data;            
            ret[sp.name].parameter = (param) ? 
                await queries.parseParameters(param) : 
                { inputs:[], output: [] };
        }

        await sqldb.disconnect();

        // write file.
        let cfg = check_config(name);
        let dbName = (cfg) ? cfg.database : name; // get database name.
        let pathName = path.join(nlib.paths.root, outPath);
        checkDir(pathName);
        let file = path.join(pathName, dbName + '.schema.json');        
        fs.writeFileSync(file, JSON.stringify(ret, null, 4), 'utf8', )
    }

    //#endregion
}

//#endregion

module.exports = exports = SqlServer;
