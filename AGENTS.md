# AGENTS.md

Guidance for agents working in this repository. This file is not loaded automatically; read it explicitly before making changes.

## Project

Smart Campus Room Availability checker. A single-page React app where a user selects one room, enters a start and end time in minutes, and sees whether the requested interval is Available or Unavailable.

- Fictional fixtures only. No backend, auth, database, external API, analytics, saved bookings, or new features.
- Fixed current time: 540 minutes (9:00 AM). It is supplied as a constant, not read from the clock.
- Checking availability never saves or confirms a booking. Fixtures must never be mutated.

## Structure

```
index.html
package.json              scripts: dev, build, lint, preview, test, typecheck
vite.config.ts
tsconfig.json, tsconfig.app.json, tsconfig.node.json
eslint.config.js
tailwind.config.js, postcss.config.js
docs/
  practice-09.md          submission report for the refactoring checkpoint
src/
  main.tsx                React entry point
  App.tsx                 fixtures, CURRENT_TIME, and all UI components
  index.css               Tailwind entry styles
  vite-env.d.ts
  lib/
    availability.ts       pure booking rules: evaluate, parseMinutes, toTime, Room, Decision
    availability.test.mjs regression tests (Node built-in test runner and assert)
.bolt/config.json
```

`src/App.tsx` imports the rules from `@/lib/availability`. Fixtures stay in `App.tsx`; tests define their own frozen copies.

## Commands

Run from the project root:

- `npm test`: `node --test src/lib/availability.test.mjs`. Verified on Node v22.23.1 in this Bolt environment, which imports the TypeScript module directly without flags. Other Node versions are not verified.
- `npm run build`: `vite build`
- `npm run lint`: `eslint .`
- `npm run typecheck`: `tsc --noEmit -p tsconfig.app.json`

Do not claim tests were run unless a test command was actually executed and its output reviewed.

Do not start a dev server from the shell.

## Booking rules (must be preserved)

- AC1: Inputs must be strict whole decimal minute values. Rejected: empty, signs, decimals, exponents, letters, and leading zeros (except "0"). Valid requests satisfy 0 <= start < end <= 1440 and start strictly greater than the current time (540).
- AC2: Duration (end - start) must be at most 120 minutes.
- AC3: A blocked room is unavailable.
- AC4: Overlaps use half-open intervals `[start, end)`. Touching endpoints are allowed.
- AC5: Initial state is idle with no decision shown. Each completed request shows a clear Available or Unavailable result with reasons. Bookings are never mutated.
- AC6: Feedback is clear on both desktop and mobile layouts.
- Display: 1440 is shown as `24:00 (end of day)`.

Preserve the repaired Practice #08 behavior and the existing responsive layout. Keep raw input rejection and the leading-zero policy unchanged.

## Working rules

- Prefer pure functions for rules. Keep changes minimal.
- Use the `@/` alias for `src/` imports.
- At most two justified patterns; zero is acceptable.
- Never weaken or delete existing assertions to get a passing result.
- Report every changed file, the rationale, and the exact commands run with their results. State limitations plainly.
