// Constructor and extends
class Creature {
    constructor(name) {
        this.name = name;
    }
    shout() {
        console.log(`I'm ${this.name}! Oorah!!`);
    }
}

class Dwarf extends Creature {
    constructor(name) {
        super(name);
        this.tall = false;
    }
    hitWithMaze() {
        console.log("Smash!");
    }
}

class Wizard extends Creature {
    castASpell() {
        console.log("You shall not pass!");
    }
}

let dwarf = new Dwarf('Thorin');
let wizard = new Wizard('Gandalf');

dwarf.hitWithMaze(); // "Smash!"
wizard.castASpell(); //  "You shall not pass!"

// mixin - Let’s assign a new move to our Dwarf.
const Weaponry = {
    hitWithSword() {
        console.log("Swoosh!");
    }
};
Object.assign(Dwarf.prototype, Weaponry);
dwarf.hitWithSword(); // "Swoosh!"

// Functional Mixin: A better approach implies turning mixins into functions 
// into which constructor can be injected.
const Armed = (target) =>
    Object.assign(target, {
        hitWith2Sword() {
            console.log("Swoosh! Swoosh!");
        }
    });
Armed(Dwarf.prototype);
dwarf.hitWith2Sword(); // "Swoosh! Swoosh!"

// Factory function.
const proto = {
    shotAnArrow() {
        console.log("Sling!");
    }
};
const archerFactory = (name) => Object.assign(Object.create(proto), {
    name
});
let archer = archerFactory('Legolas');
archer.shotAnArrow(); // "Sling!"

// Classes can be used as a statement and an expression as well and 
// (since an expression can return a new class when it’s evaluated) 
// we can use them like factories.
//
// Using this approch, the same behaviour delegation is achieved and:
// 1. prototypes are not directly mutated
// 2. super keyword still works inside methods of the subclass and the mixins
// 3. composition is preserved even when two mixins define the same method

let Magic = (superclass) => class extends superclass {
    shout() {
        if (super.shout) super.shout();
        console.log('Power and wisdom.');
    }
};
let Fighting = (superclass) => class extends superclass {
    shout() {
        if (super.shout) super.shout();
        console.log('Strength an courage.');
    }
};
class DwarfWizard extends Fighting(Magic(Creature)) {
    /*
    courseObjects(object = {}) {
        object.curse = true;
        return object;
    }
    */
}
let dwarfWizard = new DwarfWizard('Thordalf');
dwarfWizard.shout(); // "I'm Thordalf! Oorah!! Power and wisdom. Strength an courage."

// The Decorator pattern dynamically adds behaviour to existing classes
function badassery(creature) {
    let fn = creature.hitWithMaze;
    creature.hitWithMaze = () => {
        creature.shout();
        fn();
    };
}
badassery(dwarf);
dwarf.hitWithMaze(); // "I'm Thorin! Oorah!! Swish!"

// Python-style implementation of Decorators in ECMAScript - not supports yet.
// Decorator becomes a function or an expression returning a function that takes a class 
// to be modified as an argument. It can be applied by prefixing it with “@” character 
// and placing it on top of the constructor we want to be the target of our decorator.
/*
function healing(creature) {
  creature.healPower = true;
}
@healing
class Wizard2 { }
*/
