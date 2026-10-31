# Verification record — 2026-10-31

## Result
- Production build: `npm run build` passed (TypeScript and Vite).
- Unit tests: `npm test` — 39 passed.
- Browser tests: `PLAYWRIGHT_CHANNEL=msedge npm run test:e2e` — 8 passed.
- Dependency audit: zero reported vulnerabilities after updating Vitest.
- Desktop and 390px mobile screenshots inspected; no page-level horizontal overflow.
- Local preview served HTTP 200 at http://127.0.0.1:5173/.
- Silent three-case demonstration recorded at `docs/demo/three-calculations.webm`; script checked outputs 07, 15 and 30.

## Review and corrections
An independent reviewer checked architecture, input parsing and playback. The reviewer identified a misleading ALU value during a transfer: rendering recalculated with the updated accumulator. Browser tests reproduced ADD showing 2F instead of 2A and SUB showing E4 instead of 07. The view now displays the captured bus value during that transfer and labels it “transferred”; both regression tests pass. README was completed alongside review.

CPU tests were first run against unimplemented interfaces and failed before implementation. Playback tests similarly failed before the reducer existed. Browser sample failed before the controls were built. Reset tests verify queued ticks cannot run after reset; run-limit tests verify 256-instruction pause and bounded trace.

## Decisions
- User's “yes and go built” was treated as authorization to proceed with React/TypeScript/Vite and sensible remaining decisions.
- Existing folder was empty; keep the requested local workspace. No cloud service or account is needed.
- No Unit 2 handout was provided; six-state timing and logical signal conventions are documented.
- Video capture uses a separate output directory so test-run cleanup cannot remove recording files.
- GitHub publication remains outstanding: no remote repository/account was selected.
- Automatic approval review blocked launching the app URL with Start-Process, citing “blocked by policy.” Local serving and browser testing succeeded; the user can open the URL directly.
