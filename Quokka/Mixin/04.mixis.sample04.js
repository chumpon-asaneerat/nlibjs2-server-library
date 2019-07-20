// mixin 01: check class name.
/*
class Hello {} // ES6 class declaration

function Hello2() {} // Plain js class declaration

let x = new Hello();
let y = new Hello2();

// Dictionary class.
const classes = {
    Hello: Hello,
    Hello2: Hello2,
}

// Find constructor name. Not reliable.
console.log(typeof Hello);
console.log(Hello.toString());
console.log(x.constructor.name);

console.log(typeof Hello2);
console.log(Hello2.toString());
console.log(y.constructor.name);

let str = 'a';
let strI = str.constructor.name;
console.log(strI);

// Create class from string (dictionary class required).
let z = classes['Hello'];
console.log(z);
console.log(new z());
*/

// mixin 02: Using Object.assign
// Extend class method via Object.assign.
/*
class Car {
    constructor(name) {
        this._name = name;
        this._running = false;
    }
    get status() { 
        let status = (this._running) ? 'running' : 'stop'
        let result = `${this._name} is ${status}.`;
        return result;
    }

    get name() { return this._name; }
    get start() { return this._running; }
    set start(value) { this._running = value; }
}

let myCar = new Car('my toyota');
console.log(myCar.status);
myCar.start = true;
console.log(myCar.status);

const Brake = function() {
    this.start = false;
}

Object.assign(Car.prototype, { Brake });
myCar.Brake();
console.log(myCar.status);
*/

// mixin 03: Replace class method.
// Replace class method.
// Note. this method cannot used with property.
class Car {
    constructor(name) {
        this._name = name;
        this._running = false;
    }
    status() { 
        let status = (this._running) ? 'running' : 'stop'
        let result = `${this._name} is ${status}.`;
        return result;
    }

    get name() { return this._name; }
    get start() { return this._running; }
    set start(value) { this._running = value; }
}

let myCar = new Car('my toyota');
console.log(myCar.status());
myCar.start = true;
console.log(myCar.status());

const mystatus = function() {
    console.log('new function');
    let status = (this._running) ? 'still running' : 'full stop'
    let result = `${this._name} car is ${status}.`;
    return result;
}

myCar.status = mystatus;
// or
//myCar['status'] = mystatus;

console.log(myCar.status());
