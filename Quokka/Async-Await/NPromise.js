// sample 1:
/*
const maybeCow = (cow) => new Promise((success, failure) =>
    (cow === `cow`) ? success(`it is cow`) : failure(`it's not a cow it is: ${cow}`)
);

const go = async () => {
    let result = await maybeCow(`cow ssss`);
    console.log(result);
}

go()
*/

// sample 2:
/*
const maybeCow = (cow) => new Promise((success) =>
    (cow === `cow`) ? success({ok: true, data:`it is cow`}) : success({ok: false, data: new Error(`it's not a cow it is: ${cow}`)})
);

const go = async () => {
    let result = await maybeCow(`cow ssss`);
    console.log(result);
}

go()
*/
// sample 3:
const NPromise = promise => 
    promise
    .then(result => ({ok: true, result}))
    .catch(error => Promise.resolve({ ok: false, error}));
const maybeCow = (cow) => new Promise((success, failure) =>
    (cow === `cow`) ? success(`it is cow`) : failure(new Error(`it's not a cow it is: ${cow}`))
);

const go = async () => {
    //let result = await NPromise(maybeCow(`cows`));
    let { ok, result, error } = await NPromise(maybeCow(`cow`));
    console.log(ok);
    console.log(result);
    console.log(error);
};

go()
    