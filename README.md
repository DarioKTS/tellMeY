# tellMeY
**Tiny runtime type assertion utility for _plain JavaScript_.**

> Think `assert`, but for types — without TypeScript, decorators, annotations or classes.

> “tell me Y” – because we all yell _“WHY?!”_ at a runtime crash, like melodramatic clowns.

---

## 📦 Why Not TypeScript?

This library is **intentionally runtime-only** and **plain JS-oriented**.  
No build step. No annotations. No decorators.
Just simple, human-friendly _runtime_ sanity checks.

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
  - Tuple-style array checks
  - Custom instance validation
  - Function wrapping with automatic argument validation

---

## 📘 Usage

### 🔒 Basic strict usage (throws on fail)

```js
import { tY1 } from './tY.js';

tY1(42, 'int');     // ✅ OK
tY1(42.5, 'int');   // ❌ TypeAssertionError: Expected Integer, got Number
