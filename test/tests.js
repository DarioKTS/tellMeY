// test/tests.js

import {
    tYpeNicks,
    tY1,
    tY1_L,
    tY,
    tY_L,
    tY_F,
    tY_F_L,
    instanceOf,
    TypeAssertionError
} from '../src/index.js';

console.log('Running tellMeY test suite...');

// Helper for catching exceptions
function assertThrows(fn, expectedMessage) {
    try {
        fn();
        console.assert(false, 'Expected error but none was thrown');
    } catch (e) {
        console.assert(e instanceof TypeAssertionError, 'Error is not TypeAssertionError');
        if (expectedMessage) {
            console.assert(e.message.includes(expectedMessage), `Unexpected message: ${e.message}`);
        }
    }
}

// tYpeNicks
console.assert(Array.isArray(tYpeNicks()), 'tYpeNicks should return an array');
console.assert(tYpeNicks().includes('str'), 'tYpeNicks should include "str"');

// tY1 - primitives
console.assert(tY1("hello", "str") === "hello", 'tY1 string failed');
console.assert(tY1(42, "int") === 42, 'tY1 int failed');
console.assert(tY1(3.14, "float") === 3.14, 'tY1 float failed');
console.assert(tY1(true, "bool") === true, 'tY1 bool failed');

// tY1 - special objects
console.assert(tY1([], "arr").length === 0, 'tY1 array failed');
console.assert(tY1(new Map(), "map") instanceof Map, 'tY1 map failed');
console.assert(tY1(new Date(), "date") instanceof Date, 'tY1 date failed');

// tY1 - tuples
console.assert(tY1([1, "hi", false], ["int", "str", "bool"]).length === 3, 'tY1 tuple failed');

// tY1 - homogeneous array
console.assert(tY1([1, 2, 3], ["int"]).length === 3, 'tY1 homogeneous array failed');

// tY1 - nested object
console.assert(tY1({a: 1, b: "hi"}, {a: "int", b: "str"}).a === 1, 'tY1 object type failed');

// tY1 - object null rejection
assertThrows(() => tY1(null, { a: "int" }), 'Expected Object');

// tY1 - wrong type
assertThrows(() => tY1(3.14, "int"), 'Expected Integer');

// tY1 - unknown type
assertThrows(() => tY1("x", "foobar"), 'Unknown assertion');

// tY1_L - should not throw
tY1_L("x", "int"); // warns but does not throw

// tY
console.assert(tY([
    ["x", "str"],
    [123, "int"]
]).length === 2, 'tY failed');

// tY - type mismatch
assertThrows(() => tY([
    ["x", "str"],
    [123.5, "int"]
]), 'In argument 1');

// tY_L - logs but passes through
const vals = tY_L([
    ["x", "str"],
    [123.5, "int"]
]);
console.assert(vals[1] === 123.5, 'tY_L should return unmodified on error');

// tY_F - strict wrapper
const wrappedFn = tY_F(["int", "str"], (a, b) => b + a);
console.assert(wrappedFn(2, "x") === "x2", 'tY_F wrapper failed');

// tY_F - throws on mismatch
assertThrows(() => wrappedFn("bad", "x"), 'In tY_F');

// tY_F_L - loose wrapper
const looseWrapped = tY_F_L(["int", "str"], (a, b) => [a, b]);
const result = looseWrapped("oops", 123);
console.assert(Array.isArray(result), 'tY_F_L did not return result');

// instanceOf
console.assert(instanceOf(new Error("x"), Error) instanceof Error, 'instanceOf failed');

// instanceOf - should throw
assertThrows(() => instanceOf({}, Error), 'Expected instance of');

// TypeAssertionError manual check
try {
    throw new TypeAssertionError("manual test");
} catch (e) {
    console.assert(e instanceof TypeAssertionError, 'Manual TypeAssertionError failed');
    console.assert(e.message === "manual test", 'Error message mismatch');
}

console.log('✅ All tellMeY tests passed.');
