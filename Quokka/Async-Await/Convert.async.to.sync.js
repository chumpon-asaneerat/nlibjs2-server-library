function wait(second) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ Text: 'completed: ' + second + ' second(s).', Finished: new Date() });
        }, second * 1000);
    });
}

async function call1() {
    console.log('call 1');
    var result = await wait(2);
    console.log(result);
    // expected output: 'resolved'
}

async function call2() {
    console.log('call 2');
    var result = await wait(0.5);
    console.log(result);
    // expected output: 'resolved'
}

(async() => {
    await call1();
    await call2();
})();

