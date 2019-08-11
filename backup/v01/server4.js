const TestDb7x3 = require('./TestDb7x3.db');
const db = new TestDb7x3();
let ret;
let getHexCode = async () => {
    let connected = await db.connect();
    if (connected) {
        ret = await db.GetRandomHexCode({ length: 3 });
        await db.disconnect();
    }
    console.log(ret);
};

let getErrMsg = async () => {
    let connected = await db.connect();
    if (connected) {
        ret = await db.GetErrorMsg({ errCode: 103 });
        await db.disconnect();
    }
    console.log(ret);
};

//getHexCode();
getErrMsg();
