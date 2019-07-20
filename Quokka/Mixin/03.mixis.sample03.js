// mixins 1: functional mixin
const shared = Symbol("shared");
function FunctionalMixin(behaviour) {
    const instanceKeys = Reflect.ownKeys(behaviour)
        .filter(key => key !== shared);
    const sharedBehaviour = behaviour[shared] || {};
    const sharedKeys = Reflect.ownKeys(sharedBehaviour);
    const typeTag = Symbol("isA");

    function mixin(target) {
        for (let property of instanceKeys)
            Object.defineProperty(target, property, { value: behaviour[property] });
        target[typeTag] = true;
        return target;
    }
    for (let property of sharedKeys)
        Object.defineProperty(mixin, property, {
            value: sharedBehaviour[property],
            enumerable: sharedBehaviour.propertyIsEnumerable(property)
        });
    Object.defineProperty(mixin, Symbol.hasInstance, { value: (instance) => !!instance[typeTag] });
    return mixin;
}

FunctionalMixin.shared = shared;

const Coloured = FunctionalMixin({
    setColourRGB({ r, g, b }) {
        this.colourCode = { r, g, b };
        return this;
    },
    getColourRGB() {
        return this.colourCode;
    },
    [FunctionalMixin.shared]: {
        RED: { r: 255, g: 0, b: 0 },
        GREEN: { r: 0, g: 255, b: 0 },
        BLUE: { r: 0, g: 0, b: 255 },
    }
});

class Todo {
    constructor(name) {
        this.name = name || Todo.DEFAULT_NAME;
        this.done = false;
    }
    do() {
        this.done = true;
        return this;
    }
    undo() {
        this.done = false;
        return this;
    }
}

Todo.DEFAULT_NAME = 'Untitled';

Coloured(Todo.prototype)

const urgent = new Todo("finish blog post");
urgent.setColourRGB(Coloured.RED);

console.log(urgent.getColourRGB())

console.log(urgent instanceof Todo)
console.log(urgent instanceof Coloured)
