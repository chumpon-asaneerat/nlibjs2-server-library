//$=========================================================
//! Note:
//? required to manual set require path for nlib-mssql.
//$=========================================================

const SqlServer = require('./src/server/js/nlib/nlib-mssql');

let getSchema = (async() =>{
    console.log('begin generate schema..');

    console.log('1. generate schema configuration..');
    await SqlServer.generateSchemaConfig();
    console.log('2. generate schema parameters..');
    await SqlServer.generateSchema();
    console.log('3. database js file..');
    await SqlServer.generateSchemaJavascriptFile();

    console.log('end generate schema..');
})
getSchema();
