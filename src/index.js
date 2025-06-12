// src/index.js

class TypeAssertionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TypeAssertionError';
    }
}

const nicks = {
    str: "String",
    numb: "Number",
    int: "Integer",
    float: "Float",
    bool: "Boolean",
    bigint: "BigInt",
    symb: "Symbol",
    func: "Function",
    arr: "Array",
    int8arr: "Int8Array",
    uint8arr: "Uint8Array",
    uint8clamparr: "Uint8ClampedArray",
    int16arr: "Int16Array",
    int32arr: "Int32Array",
    uint32arr: "Uint32Array",
    f32arr: "Float32Array",
    f64arr: "Float64Array",
    obj: "Object",
    regexp: "RegExp",
    date: "Date",
    map: "Map",
    set: "Set",
    weakmap: "WeakMap",
    weakset: "WeakSet",
    promise: "Promise",
    err: "Error",
    arraybuffer: "ArrayBuffer",
    dataview: "DataView",
    math: "Math"
};

const typeOfMap = {
    bool: 'boolean',
    symb: 'symbol',
    func: 'function',
    str: 'string',
};

function getTag(val) {
    return Object.prototype.toString.call(val).slice(8, -1);
}

function tYpeNicks() {
    return Object.keys(nicks);
}

//Strict validation single value/type pair
function tY1(value, type) {
    if (Array.isArray(type)) {
        if (!Array.isArray(value)) throw new TypeAssertionError(`Expected Array, got ${getTag(value)}`);
        if (type.length === 0) throw new TypeAssertionError(`Empty type array: Provide at least one type`);

        // Typed tuple / per-index check
        if (type.length > 1) {
            if (!Array.isArray(value)) throw new TypeAssertionError(`Expected Array, got ${getTag(value)}`);
            return value.map((item, i) => {
                if (i >= type.length) return item;
                try {
                    return tY1(item, type[i]);
                } catch (e) {
                    throw new TypeAssertionError(`At index ${i}: ${e.message}`);
                }
            });
        }

        // Homogeneous array type
        return value.map((item, i) => {
            try {
                return tY1(item, type[0]);
            } catch (e) {
                throw new TypeAssertionError(`At index ${i}: ${e.message}`);
            }
        });
    }


    if (getTag(type) === 'Object') {
        if (getTag(value) !== 'Object' || value === null) throw new TypeAssertionError(`Expected Object, got ${getTag(value)}`);
        for (const [key, expectedType] of Object.entries(type)) {
            if (!(key in value)) throw new TypeAssertionError(`Missing key '${key}' in object`);
            try {
                tY1(value[key], expectedType);
            } catch (e) {
                throw new TypeAssertionError(`In key '${key}': ${e.message}`);
            }
        }
        return value;
    }

    if (!Object.prototype.hasOwnProperty.call(nicks, type)) {
        throw new TypeAssertionError(`Unknown assertion: ${type} (or, needs to be a string). Run tYpeNicks() for accepted tYpes.`);
    }

    switch (type) {
        case 'str':
        case 'bool':
        case 'symb':
        case 'func':
            if (typeof value !== typeOfMap[type]) throw new TypeAssertionError(`Expected ${nicks[type]}, got ${getTag(value)}`);
            return value;
        case 'numb':
            if (typeof value !== 'number' || isNaN(value)) throw new TypeAssertionError(`Expected Number, got ${getTag(value)}`);
            return value;
        case 'int':
            if (typeof value !== 'number' || isNaN(value) || !Number.isInteger(value)) throw new TypeAssertionError(`Expected Integer, got ${getTag(value)}`);
            return value;
        case 'float':
            if (typeof value !== 'number' || isNaN(value) || Number.isInteger(value)) throw new TypeAssertionError(`Expected Float, got ${getTag(value)}`);
            return value;
        case 'arr':
            if (!Array.isArray(value)) throw new TypeAssertionError(`Expected Array, got ${getTag(value)}`);
            return value;
        default:
            if (getTag(value) !== nicks[type]) throw new TypeAssertionError(`Expected ${nicks[type]}, got ${getTag(value)}`);
            return value;
    }
}

// Loose wrapper multiple pairs: logs instead of throwing
function tY1_L(value, type) {
    try {
        return tY1(value, type);
    } catch (e) {
        console.warn(e.message);
        return value;
    }
}
// Strict validation wrapper: multiple value/type pairs
function tY(typedArgs) {
    return typedArgs.map(([value, type], i) => {
        try {
            return tY1(value, type);
        } catch (e) {
            if (e instanceof Error) throw new TypeAssertionError(`In argument ${i}: ${e.message}`);
            throw e;
        }
    });
}

// Loose wrapper multiple pairs: logs instead of throwing
function tY_L(typedArgs) {
    return typedArgs.map(([value, type], i) => {
        try {
            return tY1(value, type);
        } catch (e) {
            console.warn(`tY_L: In argument ${i}: ${e.message}`);
            return value;
        }
    });
}

// Strict typed whole function wrapper
function tY_F(typeList, fn) {
    return function (...args) {
        if (args.length !== typeList.length) throw new TypeAssertionError(`Expected ${typeList.length} arguments, got ${args.length}`);
        try {
            const checkedArgs = tY(args.map((val, i) => [val, typeList[i]]));
            return fn.apply(this, checkedArgs);
        } catch (e) {
            if (e instanceof TypeAssertionError) throw new TypeAssertionError(`In tY_F(${fn.name || 'anonymous'}): ${e.message}`);
            throw e;
        }
    };
}

// Loose typed whole function wrapper
function tY_F_L(typeList, fn) {
    return function (...args) {
        const checkedArgs = tY_L(args.map((val, i) => [val, typeList[i]]));
        return fn.apply(this, checkedArgs);
    };
}

// instanceOf helper: use for checking against custom classes only.
function instanceOf(val, cls, msg) {
    if (!(val instanceof cls)) throw new TypeAssertionError(msg || `Expected instance of ${cls.name}, got ${getTag(val)}`);
    return val;
}

export {
    tYpeNicks,
    tY1,
    tY1_L,
    tY,
    tY_L,
    tY_F,
    tY_F_L,
    instanceOf,
    TypeAssertionError
};

export default tY;
