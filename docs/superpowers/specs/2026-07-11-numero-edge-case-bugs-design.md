# Numero edge-case bug fixes — design

**Date:** 2026-07-11
**Status:** Approved design, pending implementation plan

## Context

`numero.js` converts integers to Spanish words for a language-practice app. The
learner is shown a number and a plural noun (e.g. `2 000 000 aviones`) and must
type the number in words *plus the noun*. `NumeroDOM.handleInput` strips the
trailing noun and passes the rest to `Numero.validateWords`, which compares it
to `Numero.numberToWords`. Therefore any word `numberToWords` produces — including
a trailing `"de"` (`"un millón de"`) — is exactly what the learner must type.

The core generation mostly works, but several edge cases produce grammatically
incorrect Spanish, and a few existing tests lock those incorrect outputs in as
"expected". This effort fixes the bugs, driven by a corrected test suite.

## Guiding decision

**Tests encode grammatically correct Spanish (per RAE rules).** Any existing
assertion that reflects a bug is corrected; the corrected assertion becomes a
failing test that defines the fix. A test asserting wrong Spanish is worse than
no test, because the app's purpose is teaching correct Spanish.

## Known bugs (each becomes at least one failing test)

1. **`cien` vs `ciento` in composed numbers.** `#getNumberPart` only handles the
   hundred place correctly via the top-level `number === 100` special case.
   - `getNumberPart(100)` returns `"ciento"` — should be `"cien"`.
     → `1 100 000` → *"un millón **ciento** mil"* (want *cien mil*).
   - `getNumberPart(101)` returns `"cien un"` — should be `"ciento un"`.
     → `101 000` → *"**cien** un mil"* (want *ciento un mil*).
   - Rule: exactly 100 in any position → `cien`; `101–199` → `ciento …`.

2. **Stateful-regex Heisenbug.** `#matchMasculineHundreds` carries the `/g` flag
   and is used with `.test()` in `validateWords` (line 34). `RegExp.prototype.test`
   on a global regex advances `lastIndex` and the instance is reused across calls,
   so the same input can validate differently on alternating attempts.

3. **Gender of the millions multiplier.** `millón/millones` is a masculine noun,
   so the count before it is *always* masculine regardless of the counted noun:
   `21 000 000 manzanas` = *"veint**iún** millones de manzanas"*. Code passes the
   noun's gender, producing *"veintiuna millones"*. Same for `500 000 000` →
   *"quinientas millones"* (want *quinientos*). Note: the count before `mil`
   *does* agree with the counted noun (`quinientas dos mil`), so only the
   millions multiplier is affected.

4. **Missing `"de"` in the thousand-millions branch.** Exact multiples in the
   `≥ 10⁹` branch never append `"de"`: `1 000 000 000` → *"mil millones"*,
   `2 000 000 000` → *"dos mil millones"*. The learner types "…de aviones", so
   validation breaks. Rule: append `"de"` iff the number is an exact multiple of
   a million (millions or thousand-millions) with zero lower remainder.

5. **Loose `generateOutputSet` range test.** Asserts `number ≤ 9 999 999`, but
   `#generateGoodNumber` can return up to `9 999 999 999`. Correct the bound.

## Test suite structure

Rebuild `numero.test.js` as table-driven tests organized by grammar rule, so a
failure names the rule it broke. Groups:

1. **`cien` vs `ciento`** — `100`→cien; `101`,`110`,`199`→ciento…; composed:
   `100000`→"cien mil", `101000`→"ciento un mil", `100100`→"cien mil cien",
   `1100000`→"un millón cien mil".
2. **Apocope & unit gender** — `un/una`, `veintiún/veintiuna`, `treinta y un/una`,
   in hundreds and thousands positions.
3. **Millions multiplier always masculine** — `21 000 000` f → "veintiún millones de",
   `500 000 000` f → "quinientos millones de".
4. **The `"de"` rule** — exact million/thousand-million multiples get `"de"`;
   `5 000 005` (non-exact) does not.
5. **`y` placement** — only between tens and units (`treinta y cinco`), never elsewhere.
6. **Boundaries** — `0`→cero, `1`, `100`, `1000`, `10⁶`, `10⁹`, `9 999 999 999`.
7. **`validateWords`** — accepts both hundred genders; plus an explicit regression
   test that calls it twice in a row with the same input to catch the stateful-`/g` bug.
8. **`generateOutputSet`** — corrected range assertion (`≤ 9 999 999 999`).

Each corrected assertion that currently reflects a bug becomes a failing test.

## Workflow

1. **Tests first (this pass).** Flip/add all assertions to correct Spanish and run
   to get a **red baseline** — the failing set *is* the verified bug list.
2. **Human spot-check.** Reviewer verifies the expected strings for the large
   composed numbers before code is touched (the test file is itself reviewed).
3. **Fix `numero.js` rule-by-rule** until green. Sequence highest-impact first:
   the stateful-regex bug and `cien`/`ciento`, then millions gender, then the
   `"de"` rule, then the range test.

## Out of scope

- No new number ranges (long-scale `billón` and above): the app maxes at
  `9 999 999 999`, below `10¹²`.
- No DOM/UI changes; `NumeroDOM` behavior is unchanged.
- No refactor of `#generateGoodNumber`'s distribution logic.
