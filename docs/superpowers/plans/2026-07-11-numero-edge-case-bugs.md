# Numero Edge-Case Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the grammatical edge-case bugs in `numero.js` Spanish number generation, driven by a corrected, rule-organized test suite.

**Architecture:** Rebuild `numero.test.js` into rule-grouped tests whose assertions encode correct Spanish (RAE). This produces a red baseline where the failing tests are exactly the known bugs. Then fix `numero.js` one root cause at a time until green. No DOM or generator-distribution changes.

**Tech Stack:** Vanilla ES modules, Jest 29 (run via `npm test`, which invokes `node --experimental-vm-modules node_modules/jest/bin/jest.js`).

## Global Constraints

- Spanish output must be grammatically correct per RAE rules. A test asserting wrong Spanish is a defect, not a fixture.
- Supported range is `0`–`9 999 999 999` (below `10¹²`); no long-scale `billón`.
- `numberToWords(number, gender)` returns words the learner must type *before* the noun, including a trailing `"de"` for exact million/thousand-million multiples (e.g. `"un millón de"`).
- The count before `millón/millones` is always masculine (`millón` is a masculine noun); the count before `mil` agrees with the counted noun's gender.
- No changes to `numeroDOM.js` or to `#generateGoodNumber`'s distribution.
- Run the full suite with: `npm test`

---

### Task 1: Rebuild the test suite as a rule-grouped red baseline

**Files:**
- Modify (full rewrite): `numero.test.js`

**Interfaces:**
- Consumes: `Numero` from `./numero.js` — methods `generateOutputSet()`, `validateWords(input, number, gender)`, `numberToWords(number, gender)`.
- Produces: a test suite that passes for all currently-correct behavior and fails only on the three known bug groups (`cien/ciento`, millions-multiplier gender, `"de"` rule). Later tasks turn those groups green without editing this file.

- [ ] **Step 1: Write the full rewritten test file**

Replace the entire contents of `numero.test.js` with:

```javascript
import { Numero } from './numero.js'

describe('Numero', () => {
  let numero

  beforeEach(() => {
    numero = new Numero()
  })

  describe('generateOutputSet', () => {
    test('returns valid number, noun, gender and emoji', () => {
      const [number, noun, gender, emoji] = numero.generateOutputSet()

      expect(number).toBeGreaterThanOrEqual(100)
      expect(number).toBeLessThanOrEqual(9999999999)
      expect(noun).not.toBe('')
      expect(['m', 'f']).toContain(gender)
      expect(emoji).not.toBe('')
    })
  })

  describe('numberToWords', () => {
    // Rule: exactly 100 in any position is "cien"; 101–199 is "ciento …".
    describe('cien vs ciento', () => {
      test.each([
        [100, 'm', 'cien'],
        [105, 'm', 'ciento cinco'],
        [110, 'm', 'ciento diez'],
        [199, 'm', 'ciento noventa y nueve'],
        [100000, 'm', 'cien mil'],
        [101000, 'm', 'ciento un mil'],
        [101000, 'f', 'ciento una mil'],
        [100100, 'm', 'cien mil cien'],
        [1100000, 'm', 'un millón cien mil'],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })

    // Rule: apocope and unit gender agree with the counted noun.
    describe('apocope and unit gender', () => {
      test.each([
        [1, 'm', 'un'],
        [1, 'f', 'una'],
        [121, 'm', 'ciento veintiún'],
        [121, 'f', 'ciento veintiuna'],
        [721000, 'm', 'setecientos veintiún mil'],
        [721000, 'f', 'setecientas veintiuna mil'],
        [502000, 'f', 'quinientas dos mil'],
        [551515, 'f', 'quinientas cincuenta y una mil quinientas quince'],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })

    // Rule: the count before "millones" is always masculine, regardless of noun.
    describe('millions multiplier is always masculine', () => {
      test.each([
        [2000000, 'm', 'dos millones de'],
        [2000000, 'f', 'dos millones de'],
        [21000000, 'm', 'veintiún millones de'],
        [21000000, 'f', 'veintiún millones de'],
        [500000000, 'm', 'quinientos millones de'],
        [500000000, 'f', 'quinientos millones de'],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })

    // Rule: append "de" iff the number is an exact million/thousand-million multiple.
    describe('the "de" rule', () => {
      test.each([
        [1000000, 'm', 'un millón de'],
        [1000000, 'f', 'un millón de'],
        [5000000, 'f', 'cinco millones de'],
        [1000000000, 'm', 'mil millones de'],
        [2000000000, 'f', 'dos mil millones de'],
        // non-exact multiples take no "de"
        [5000005, 'm', 'cinco millones cinco'],
        [1234567, 'm', 'un millón doscientos treinta y cuatro mil quinientos sesenta y siete'],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })

    // Rule: "y" appears only between tens and units.
    describe('"y" placement', () => {
      test.each([
        [30, 'm', 'treinta'],
        [35, 'm', 'treinta y cinco'],
        [3666, 'm', 'tres mil seiscientos sesenta y seis'],
        [3606, 'm', 'tres mil seiscientos seis'],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })

    describe('boundaries and previously-correct values', () => {
      test.each([
        [0, 'm', 'cero'],
        [1000, 'm', 'mil'],
        [123, 'm', 'ciento veintitrés'],
        [1983, 'f', 'mil novecientas ochenta y tres'],
        [2012, 'f', 'dos mil doce'],
        [20300, 'm', 'veinte mil trescientos'],
        [20354, 'm', 'veinte mil trescientos cincuenta y cuatro'],
        [102000, 'f', 'ciento dos mil'],
        [120000, 'm', 'ciento veinte mil'],
        [135000, 'm', 'ciento treinta y cinco mil'],
        [135000, 'f', 'ciento treinta y cinco mil'],
        [444000, 'm', 'cuatrocientos cuarenta y cuatro mil'],
        [967000, 'm', 'novecientos sesenta y siete mil'],
        [967000, 'f', 'novecientas sesenta y siete mil'],
        [5000005, 'm', 'cinco millones cinco'],
        [
          5002853367,
          'm',
          'cinco mil dos millones ochocientos cincuenta y tres mil trescientos sesenta y siete',
        ],
        [
          6007617498,
          'm',
          'seis mil siete millones seiscientos diecisiete mil cuatrocientos noventa y ocho',
        ],
        [
          9999999999,
          'f',
          'nueve mil novecientos noventa y nueve millones novecientas noventa y nueve mil novecientas noventa y nueve',
        ],
      ])('%i (%s) -> %s', (n, g, want) => {
        expect(numero.numberToWords(n, g)).toBe(want)
      })
    })
  })

  describe('validateWords', () => {
    test('validates simple numbers correctly', () => {
      expect(numero.validateWords('ciento veintitrés', 123, 'm')).toBe(true)
      expect(numero.validateWords('ciento veinte', 123, 'm')).toBe(false)
    })

    test('normalizes case and whitespace', () => {
      expect(numero.validateWords('UN', 1, 'm')).toBe(true)
      expect(numero.validateWords('  ciento   veintitrés ', 123, 'm')).toBe(true)
    })

    test('accepts masculine or feminine hundreds for feminine nouns', () => {
      expect(numero.validateWords('cuatrocientos', 400, 'f')).toBe(true)
      expect(numero.validateWords('cuatrocientas', 400, 'f')).toBe(true)
      expect(numero.validateWords('novecientos una', 901, 'f')).toBe(true)
      expect(numero.validateWords('novecientas una', 901, 'f')).toBe(true)
      expect(numero.validateWords('quinientos dos mil', 502000, 'f')).toBe(true)
    })

    // Guard: the shared hundreds regex must not carry state across calls.
    test('is stable when called repeatedly with the same input', () => {
      for (let i = 0; i < 5; i++) {
        expect(numero.validateWords('cuatrocientos', 400, 'f')).toBe(true)
      }
    })
  })
})
```

- [ ] **Step 2: Run the suite to establish the red baseline**

Run: `npm test`

Expected: FAIL. Exactly these assertions fail (all others pass):
- `cien vs ciento`: `101000 (m)`, `101000 (f)`, `100100 (m)`, `1100000 (m)`
- `millions multiplier is always masculine`: `21000000 (f)`, `500000000 (f)`
- `the "de" rule`: `1000000000 (m)`, `2000000000 (f)`
- `boundaries and previously-correct values`: `9999999999 (f)`

If any *other* test fails, stop and reconcile the expected string before proceeding — the point of this baseline is that failures map 1:1 to known bugs.

- [ ] **Step 3: Commit the red baseline**

```bash
git add numero.test.js
git commit -m "test: rebuild numero suite as rule-grouped correct-Spanish baseline"
```

**CHECKPOINT — human spot-check:** Before continuing, a human reviews the expected strings for the large composed numbers (`5002853367`, `6007617498`, `9999999999`) and the `cien/ciento` group. These are easy to get subtly wrong. Only proceed once confirmed.

---

### Task 2: Fix `cien` vs `ciento` in composed numbers

**Files:**
- Modify: `numero.js` (`#getNumberPart`, hundreds block)

**Interfaces:**
- Consumes: `#getNumberPart(n, gender)` internal helper.
- Produces: `#getNumberPart` returns `"cien"` only when the hundreds digit is 1 and there is no remainder; `"ciento …"` for 101–199.

- [ ] **Step 1: Confirm the failing group**

Run: `npm test -- -t "cien vs ciento"`
Expected: FAIL on `101000 (m)`, `101000 (f)`, `100100 (m)`, `1100000 (m)`.

- [ ] **Step 2: Fix the hundreds special-case**

In `numero.js`, inside `#getNumberPart`, change the hundreds condition so `cien` fires on an exact hundred instead of on `x01`:

```javascript
    if (hundred > 0) {
      if (hundred === 1 && remainder === 0) {
        words += 'cien '
      } else if (gender === 'f') {
        words += hundreds[hundred].replace(this.#matchMasculineHundreds, this.#replaceFeminineHundreds) + ' '
      } else {
        words += hundreds[hundred] + ' '
      }
    }
```

(The only change is `remainder === 1` → `remainder === 0`.)

- [ ] **Step 3: Run the group to verify it passes**

Run: `npm test -- -t "cien vs ciento"`
Expected: PASS.

- [ ] **Step 4: Run the full suite (guard against regressions)**

Run: `npm test`
Expected: only the `millions multiplier`, `"de" rule`, and `9999999999 (f)` assertions remain failing.

- [ ] **Step 5: Commit**

```bash
git add numero.js
git commit -m "fix: use cien only for exact hundreds, ciento for 101-199"
```

---

### Task 3: Fix the gender of the millions multiplier

**Files:**
- Modify: `numero.js` (`numberToWords`, thousand-millions and millions branches)

**Interfaces:**
- Consumes: `numberToWords(number, gender)`.
- Produces: the count preceding `millones`/`mil millones` is generated with masculine gender regardless of the `gender` argument.

- [ ] **Step 1: Confirm the failing group**

Run: `npm test -- -t "millions multiplier is always masculine"`
Expected: FAIL on `21000000 (f)` and `500000000 (f)`.

- [ ] **Step 2: Force masculine for the millions count**

In `numero.js`, in the four `#getNumberPart(..., gender)` calls that build the millions count, replace the `gender` argument with the literal `'m'`.

Thousand-millions branch:

```javascript
      words += thousandMillions === 1 ? 'mil ' : this.#getNumberPart(thousandMillions, 'm') + ' mil '

      // Thousand millions remainder
      if (thousandMillionsRemainder > 0) {
        words += this.#getNumberPart(thousandMillionsRemainder, 'm') + ' '
      }
```

Millions branch:

```javascript
      if (thousands === 0 && remainder === 0) {
        words += millions === 1 ? 'un millón de ' : this.#getNumberPart(millions, 'm') + ' millones de '
      } else {
        words += millions === 1 ? 'un millón ' : this.#getNumberPart(millions, 'm') + ' millones '
      }
```

(Leave the `thousands` and `remainder` calls in the rest of the method as `gender` — those agree with the noun.)

- [ ] **Step 3: Run the group to verify it passes**

Run: `npm test -- -t "millions multiplier is always masculine"`
Expected: PASS.

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: only the `"de" rule` group (`1000000000`, `2000000000`) still fails. Note `9999999999 (f)` should now PASS (its millions count became masculine).

- [ ] **Step 5: Commit**

```bash
git add numero.js
git commit -m "fix: millions multiplier is always masculine"
```

---

### Task 4: Fix the missing `"de"` in the thousand-millions branch

**Files:**
- Modify: `numero.js` (`numberToWords`, thousand-millions branch)

**Interfaces:**
- Consumes: `numberToWords(number, gender)`; local vars `thousands` and `remainder` (already computed near the top of the method).
- Produces: exact thousand-million multiples append `"de"`, matching the existing millions-branch behavior.

- [ ] **Step 1: Confirm the failing group**

Run: `npm test -- -t "the \"de\" rule"`
Expected: FAIL on `1000000000 (m)` and `2000000000 (f)`.

- [ ] **Step 2: Append "de" for exact thousand-million multiples**

In `numero.js`, in the thousand-millions branch, add the `"de"` append right after the `'millones '` line:

```javascript
      words += 'millones '

      // “de” before the noun when the millions are an exact multiple
      if (thousands === 0 && remainder === 0) {
        words += 'de '
      }
```

- [ ] **Step 3: Run the group to verify it passes**

Run: `npm test -- -t "the \"de\" rule"`
Expected: PASS.

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS (all groups green).

- [ ] **Step 5: Commit**

```bash
git add numero.js
git commit -m "fix: append de for exact thousand-million multiples"
```

---

### Task 5: Defensive cleanup of the stateful hundreds regex

**Files:**
- Modify: `numero.js` (`validateWords`)

**Interfaces:**
- Consumes: `validateWords(input, number, gender)`.
- Produces: identical behavior with no `/g`-regex `.test()` call; the "is stable when called repeatedly" guard test continues to pass.

- [ ] **Step 1: Confirm the guard test currently passes**

Run: `npm test -- -t "is stable when called repeatedly"`
Expected: PASS (this is a guard, not a red test — the statefulness does not manifest today, but we remove the anti-pattern so future edits stay safe).

- [ ] **Step 2: Remove the stateful `.test()`**

In `numero.js`, replace the body of `validateWords`:

```javascript
  validateWords(input, number, gender) {
    input = input.toLowerCase().trim().replace(/\s+/g, ' ')
    const correctWords = this.numberToWords(number, gender)

    if (input === correctWords) return true

    // handle both genders as correct for hundreds (“cuatrocientos casas” o “cuatrocientas casas”)
    if (gender === 'f') {
      return input.replace(this.#matchMasculineHundreds, this.#replaceFeminineHundreds) === correctWords
    }

    return false
  }
```

- [ ] **Step 3: Run the validateWords tests**

Run: `npm test -- -t "validateWords"`
Expected: PASS (all `validateWords` tests, including the repeat-call guard).

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS (everything green).

- [ ] **Step 5: Commit**

```bash
git add numero.js
git commit -m "refactor: drop stateful global-regex test from validateWords"
```

---

## Notes for the implementer

- `numberToWords` retains its top-level special cases (`number === 100`, `=== 100000`, `=== 1000000`). After Task 2 the first two are redundant but harmless; leaving them keeps the diff minimal. Do not remove them.
- Jest's `test.each` row title `'%i (%s) -> %s'` interpolates the number, gender, and expected string, so a failing row is self-describing in the output.
- If a `test.each` row throws instead of asserting (e.g. `Number too large`), that indicates a real regression in `#getNumberPart`'s `n > 99999` guard — stop and investigate rather than adjusting the test.
