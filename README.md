# tellMeY
**Tiny runtime type check utility for _plain JavaScript_.**
<p align="center">
  <img src="assets/tellMeY.png" alt="Project Logo" width="500"/>
</p>

> Because of a  
> **_“JavaScript : WHY?!”_**  
> at a runtime crash, with a sad clown face.

---
## 📦 Why Not TypeScript?
This library is **intentionally runtime-only** and **plain JS-oriented**.  
No build step. No annotations. No decorators.
Just simple, human-friendly _runtime_ sanity checks and readable error responses.

---

## ✨ Features

- 🧠 Concise type aliases (run `tYpeNicks()` to list them)
- 🔥 Runtime type validation — not compile-time
- ⚡ Lightweight, zero dependencies
- 💬 Human-readable errors, structured by position
- 🏕️ Works in minimal environments (Node, browsers, embedded VMs)
- 🧱 Supports:
  - Nested objects
  - Typed arrays
  - Tuple-style array and object checks
  - Custom Classes instance validation
  - Function wrapping with automatic argument validation

---

## 📘 Usage
The functions provided:  
 -  in their strict version either return the checked value on success, or throw an indexed `TypeAssertionError`;
 -  in their loose version (ending with "_L") will log a readable warning but return the value anyhow;  
 > As opposed to returning a boolean( i.e. `Array.isArray(val)`), this simplifies passing on the checked output to to other functions.  

..from simple to complex:  
### 🔒 Basic strict usage (throws on fail)
```js
tY1(42, 'int');     // ✅ OK , returns 42
tY1(42.5, 'int');   // ❌ TypeAssertionError: Expected Integer, got Number
```
### 🌿 Loose mode (logs warning, returns value anyway)
```js
tY1_L(42.5, 'int'); // ⚠️ Warning in console, returns 42.5 unmodified
```
### 🎛️ Multiple arguments: tY and tY_L
`tY` ad `tY_L` accept an array of [value, type] pairs  and return the array of checked values.
```js
const [a, b] = tY([[42, 'int'], ['hello', 'str']]);  // ✅ returns [42, 'hello']

tY([[true, 'numb'], [42, 'int']]);  // ❌ TypeAssertionError: In argument 0: Expected Number, got Boolean
tY_L([[true, 'numb']],[42, 'int']); // ⚠️ Logs warning, returns `[true, 42]`
```
> Take notice of the structure of `TypeAssertionError` (more below)- it will help you identify the issue ('tellMe whY?').
### 🔗 Inline use
... you may want to:
```js
function someFunction(a,b,c,d){ -yourLogic-};
function someOtherFunction(x,y,z){-yourLogic-};

someFunction(a, ...tY([[b, 'f32arr'], [c, 'uint8arr']]), d); //strict variant
someOtherFn(x, ...tY_L([[y, 'regexp'], [z, 'date']])); // loose variant
```
---
## 🧪 Advanced Types
### 🔁 Homogeneous array
```js
tY1([1, 2, 3], ['int']); // ✅ Every element is an int, returns checked array
tY1([1, 2, 'x'], ['int']); // ❌ TypeAssertionError: At index 2: Expected Integer, got String
```
### 📦 Typed Tuple
```js
tY1(['abc', 123, true], ['str', 'int', 'bool']); // ✅ returns checked array
```
### 🧱 Object shape
```js
tY1({ name: 'Alice', age: 30 }, { name: 'str', age: 'int' }); // ✅ returns checked object
```

### 💡 If your structure is deep, you can define the schema outside and reuse:
```js
const shape = { x: ['int', 'int'], meta: { name: 'str' } };
tY1({ x: [1, 2], meta: { name: 'ok' } }, shape);
```

### 🔁 Nested Structures
```js
const user = {
  name: 'Bob',
  stats: {
    age: 'thirty',
    score: 9001
  }
};

const schema = {
  name: 'str',
  stats: {
    age: 'int',
    score: 'int'
  }
};

tY1(user, schema); 
// ❌ TypeAssertionError: In key 'stats': In key 'age': Expected Integer, got String
```
## 🔥 Notes on Custom Object and Tuple Type Definition / Behavior
 - For arrays with multiple types (tuples): only the first N items are checked (N = type.length). Extra values are left untouched/ignored. 
 - For typed objects: only the keys defined in the type schema are checked. Extra keys are left untouched/ignored.
```
tY1(['abc', 123, true, 'rainy'], ['str', 'int', 'bool']);
// ✅ checks the first 3 elements, passes the 4th untouched, returns the array

tY1({ name: 'Alice', age: 30 , status:'becoming chubby'}, { name: 'str', age: 'int' });
// ✅ checks name and age, passes status untouched, returns the object
```
> This makes tY composable and safe to apply even in loosely structured data pipelines.


## ⚙️ Function Wrapping
### 🔒 Strict: tY_F
```js
const addInts = tY_F(['int', 'int'], (a, b) => a + b);
addInts(2, 3); // ✅
addInts(2, 3.1); // ❌ TypeAssertionError: In tY_F(addInts): In argument 1: Expected Integer, got Number
```
### 🌿 Loose: tY_F_L
```js
const greet = tY_F_L(['str', 'int'], function(name, age) {
  return `Hi ${name}, you're ${age}`;
});
greet("Alice", "not a number"); // ⚠️ Logs warning, still runs
```
### ⏳ Works with async functions too
```js
const waitAndGreet = tY_F(['str', 'int'], async function(name, age) {
  await new Promise(r => setTimeout(r, 100));
  return `Hi ${name}, you're ${age}`;
});
waitAndGreet("Alice", 30).then(console.log); // ✅
```

### 🧩 Custom Class Checking
```js
class Moustache {}
const prime = new Moustache();
instanceOf(prime, Moustache); // ✅

instanceOf(casey , Moustache); 
// ❌ TypeAssertionError: Expected instance of Moustache, got casey
```
### 🔍 Supported Types
You can run tYpeNicks() at any time to list all available types' nicknames, however:
```js
["str", "numb", "int", "float", "bool", "bigint", "symb", "func", "arr", 
 "int8arr", "uint8arr", "uint8clamparr", "int16arr", "int32arr", "uint32arr",
 "f32arr", "f64arr", "obj", "regexp", "date", "map", "set", "weakmap",
 "weakset", "promise", "err", "arraybuffer", "dataview", "math"]
```

### ⚠️ Performance Considerations
Like any runtime validation, using tY comes with a computational cost — albeit small in most cases.
If you find that "tell me Y" significantly impacts your system's performance (e.g. in tight loops or hot paths), 
consider relocating type checks closer to the data source (e.g., input sanitation, API layers, or serialization boundaries).

__This library is a non-intrusive helper, not a replacement for good engineering practices.__  
__You can use it selectively, wherever runtime guarantees are helpful__  
__skip it where needed to run Blazingly Fast and articualte weighted middle grounds.__  

It does NOT modify JavaScript, neither expands it, nor overrides any native behaviour!  
It simply exposes and organizes some of JavaScript’s built-in type checking logic that is hidden in  
`Object.prototype.toString.call(yourValue)` in a more accessible way (IMO, ofc).

## 🤹‍♀️ Philosophy
ChatGPT suggested:  
“tell me Y” — because good code asks good questions."  
:rofl: ...i wanted answers! :rofl:

## License
MIT - free use
