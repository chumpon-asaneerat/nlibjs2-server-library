// mixin 1: simple concept.

let mydetails = {}
let firstname = { firstname: "Nnamdi" }
let surname = { surname: "Chidume" }
let occupation = { occupation: "Software Developer" }
let nationality = { nationality: "Nigerian" }

console.log(mydetails)
Object.assign(mydetails, surname, firstname, occupation, nationality);
console.log(mydetails)

// mixin 2: Implementing our own Object.assign
Object.prototype.assign = function assign(dest, ...src) {
    if (typeof dest == 'object') {
        for (let s of src) {
            if (typeof s == 'object') {
                for (prp of Object.keys(s)) {
                    dest[prp] = s[prp]
                }
            }
        }
    }
}

mydetails = {}
firstname = { firstname: "Nnamdi" }
surname = { surname: "Chidume" }
occupation = { occupation: "Software Developer" }
nationality = { nationality: "Nigerian" }
Object.assign(mydetails, surname, firstname, occupation, nationality);
console.log(mydetails)

// mixin 3: Mixing Classes
class Car { 
    constructor() {
        console.log('car');
    }
}
class Wheel {
    drive() {
        console.log('  drive');
    }
}
class Tyre {
    brake() {
        console.log('  brake');
    }
}
class Steering {
    steer(x, y) {
        console.log('  steer:', x, ',', y);
    }
}
class Wiper {
    wipe(speed) {
        console.log('  wipe:', speed);
    }
}
class Engine {
    start() {
        console.log('  start');
    }
}

function classMixin(cls, ...src) {
    for (let _cl of src) {
        for (var key of Object.getOwnPropertyNames(_cl.prototype)) {
            cls.prototype[key] = _cl.prototype[key]
        }
    }
}

classMixin(Car, Wheel, Tyre, Steering, Wiper, Engine)
let car = new Car()
car.brake() // brake
car.wipe(30) // wipe
car.start() // start
car.drive() // drive
car.steer(2, 3) // steer

// mixin 4: Mixin and Inheritance
class NewEngine {
    sayBaseEngine() {
        return `BaseEngine`
    }
}
class ToyotaEngine extends NewEngine {
    sayEngine() {
        return `From Toyota: ${super.sayBaseEngine()}`
    }
}

class Brake {
    constructor() {
        console.log('   Brake installed.');
    }
}
class Drive {
    constructor() {
        console.log('   Drive installed.');
    }
}

// make a Toyota car
class Toyota extends Car {
} 
// apply our classMixin
classMixin(Toyota, Brake, Drive, ToyotaEngine);
let toyota = new Toyota();
console.log(toyota.sayEngine())

