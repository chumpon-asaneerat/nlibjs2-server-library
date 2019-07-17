const SqlServer = require('./src/server/js/nlib/nlib-mssql');
const schema = require('./schema/TestDb7x3.schema.json');

const TestDb7x3Db = class extends SqlServer {
    constructor() {
        super();
        // should match with nlib.config.json
        //this.database = 'default'
        this.database = 'testdb7x3'
    }

    async connect() {
        return await super.connect(this.database);
    }

    async GetRandomHexCode(pObj) {
        let name = 'GetRandomHexCode';
        let proc = schema[name];
        return await this.execute(name, pObj, proc.parameter.inputs, proc.parameter.outputs);
    }

    async GetErrorMsg(pObj) {
        let name = 'GetErrorMsg';
        let proc = schema[name];
        return await this.execute(name, pObj, proc.parameter.inputs, proc.parameter.outputs);
    }
}

module.exports = exports = TestDb7x3Db;