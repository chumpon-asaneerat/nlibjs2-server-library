//$=========================================================
//! Note:
//? required to manual set require path for nlib-mssql.
//$=========================================================

const SqlServer = require('./src/server/js/nlib/nlib-mssql');

let getSchema = (async() =>{
    console.log('begin generate schema..');

    await SqlServer.generateSchemaConfig();
    await SqlServer.generateSchema();

    console.log('end generate schema..');
})
getSchema();
