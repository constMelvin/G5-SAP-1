# SAP-1 Workbench

A graphical SAP-1 computer simulator for Computer Architecture and Organization. Built with React, TypeScript and Vite.

## Run locally

Use **Node.js 24** and npm. The supported Node ranges in `package.json` are `^22.12.0 || ^24.0.0 || >=26.0.0`.

```powershell
npm ci
npm run dev
```

Open the Local URL printed by Vite, normally http://127.0.0.1:5173.
Use `npm ci` instead of `npm install` for an exact lockfile install.

```powershell
npm run build
npm run preview
npm test
```

Build output is in `dist/`. Preview serves the production build. Simulation runs entirely in the browser; no database, server API or account is required. Google Fonts is optional visual enhancement; local fonts are used if unavailable. The draft starts with the sample program, but it must be loaded before execution. Loaded memory, edits, registers and theme selection are not persisted across page refreshes. No API keys or environment variables are required.

## First calculation

1. Click **Instruction template**. This fills the sample instructions and data:
   - 00: LDA 9H
   - 01: ADD AH
   - 02: SUB BH
   - 03: OUT
   - 04: HLT
2. Verify the prefilled data: **25H**, **05H**, **23H** at addresses **09**, **0A**, **0B**. No additional entry is needed for the sample.
3. Click **Load program**. Verify RAM shows 25, 05, 23.
4. Click **Run**, or use **Clock** and **Step instruction**.
5. At HLT the output is **07H**, binary **00000111**.

The template preloads 25H, 05H and 23H at 09, 0A and 0B. Edit these values in the draft to try another calculation, then load again.

## Controls and input

| Control          | Behavior                                                         |
| ---------------- | ---------------------------------------------------------------- |
| Load program     | Validate all 16 draft rows, copy into RAM, reset registers       |
| Clock            | Execute exactly one microcycle                                   |
| Step instruction | Animate remaining microcycles of one instruction                 |
| Run / Pause      | Execute continuously / stop at current microcycle                |
| Reset            | Stop timers, zero registers/counters, restore last loaded memory |
| Clear draft      | Clear editor only; does not alter loaded RAM                     |
| Clock slider     | 0.5–20 microcycles per second                                      |

Bare numbers are **hexadecimal**, not decimal. Accepted examples: `25`, `25H`, `0x25`, `00100101`, `0010 0101`, `0b00100101`, `LDA 9H`. Blank cells become 00. Binary requires exactly eight bits. Instruction addresses range from 0 to F. The RAM column always shows what the CPU will execute; edits do not apply until loaded. Validation failures preserve the current RAM and CPU state.

Each Run pauses after up to 256 additional instructions to make missing-HLT programs manageable; pressing Run resumes. Unknown opcodes halt with an explanatory error.

## Architecture and timing assumptions

- RAM: sixteen 8-bit bytes.
- PC and MAR: 4 bits; PC wraps F→0.
- IR: 8 bits, upper nibble opcode and lower nibble operand.
- A, B and OUT: 8 bits.
- ADD wraps modulo 256. SUB uses `A + (~B & 255) + 1`, retaining eight bits.
- OUT latches A; changing A later does not change the LEDs until another OUT.
- During an ALU→A transfer, the ALU panel shows the captured result (labeled “transferred”). Otherwise it reflects the current A/B inputs; the combinational value can change after A is latched.

| Instruction | Opcode | Execute phase                         |
| ----------- | ------ | ------------------------------------- |
| LDA         | 0000   | T4 IR→MAR, T5 RAM→A                   |
| ADD         | 0001   | T4 IR→MAR, T5 RAM→B, T6 ALU→A         |
| SUB         | 0010   | T4 IR→MAR, T5 RAM→B, T6 ALU→A with SU |
| OUT         | 1110   | T4 A→OUT                              |
| HLT         | 1111   | Stop at T4                            |

Each instruction fetches using T1 PC→MAR, T2 increment PC, T3 RAM→IR. Ordinary instructions occupy six T states, with unused states idle. HLT completes at T4. OUT/HLT ignore the operand nibble; their mnemonic encodings are EF/FF, as defined by the program parser.

The simulator uses the six-state timing model described above. Register values show the state after the displayed T state completes. Control labels represent **logical assertions**, not physical active-low pin voltage. Arithmetic retains eight bits; no carry or overflow flags are modeled.

## Why this stack?

React keeps all panels synchronized with a single machine state. TypeScript makes byte/register and playback interfaces explicit. Vite provides a small development/build setup. Plain CSS renders a responsive block diagram with a shared bus; Lucide supplies interface icons. Vitest tests the pure engine without a browser, and Playwright verifies actual interface workflows. No backend service is necessary.

## Tests

`npm test` covers CPU fetch/execute, three formulas, arithmetic wrapping, PC wrap, HLT, unknown opcodes, input validation, pause/reset behavior and the safety limit.

For browser tests:

```powershell
npx playwright install chromium
npm run test:e2e
```

If Microsoft Edge is already installed, use it without downloading Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
```

Playwright starts Vite on port 5173 or reuses a server at the configured URL. Failure traces and explicitly captured desktop/mobile screenshots are saved in ignored `test-results/`.

**Browser test maintenance:** `tests/simulator.spec.ts` still contains a calculation-history test and a mobile heading assertion for UI elements that are no longer rendered. These checks need updating before the full browser suite can serve as a reliable verification of the current interface.

## Interface and themes

Choose **Ben 10** (default) or **Barbie** using the header buttons. Both use light workspace palettes, with a dark output display in Ben 10. Changing themes preserves your loaded program, registers and playback. Internally, the themes use the `blue` and `pink` design keys.

- Graphical PC, MAR, RAM, IR, accumulator, ALU, B and output modules display live values. Highlighted W-Bus transfers and a moving character token show bytes travelling between modules.
- The architecture is a browser-based register-transfer visualization with CSS chip sides, edge pins and depth effects. The compact desktop layout flattens the board to fit the workspace; it is not a rotatable WebGL or gate-level electronics model.
- Native buttons provide Run/Pause, Step instruction, Clock, Reset and Load program.
- Eight themed output icons show bits **D7 through D0**, left to right. **Green means 1 / ON; red means 0 / OFF** in both themes. Binary values and ON/OFF labels distinguish states without relying only on color. The output also shows hexadecimal, decimal and signed decimal values.
- Output icons latch only when **OUT** executes. Intermediate arithmetic changes the accumulator without changing the output. Reset or loading a program clears the output register.
- A live story panel explains the current transfer or execution phase, while control signals and cycle indicators help follow instruction timing. Register values are shown in hexadecimal and binary.
- **Tutorial & reference** provides How to use, How it works and Instructions tabs. On large desktops, controls remain above independently scrolling workbench columns. Smaller layouts stack the panels; keyboard focus, input error messages and reduced-motion support are included.

`src/styles.css` defines the base layout. Styles load afterward in this order: `src/hardware.css`, `src/components/BoardQuest.css`, `src/compact.css`, `src/output-signals.css`, `src/barbie.css`, `src/tutorial.css` and `src/controls.css`. Customize semantic variables such as `--primary`, `--accent`, `--bg` and `--panel`, accounting for later overrides. Theme selectors use `:root[data-design="blue"]` and `:root[data-design="pink"]`. `src/output-signals.css` defines the shared green ON / red OFF icon colors; `src/barbie.css` supplies the pink theme's icon artwork.

## More calculations and troubleshooting

Keep the instruction template at addresses 00–04. Enter each set below at **09**, **0A** and **0B**, then click **Load program → Run**:

| Data at 09 | Data at 0A | Data at 0B | Calculation (decimal) | Output | Lit LEDs |
| --- | --- | --- | --- | --- | --- |
| 25H | 05H | 23H | 37 + 5 − 35 = 7 | 07H / 00000111 | D2–D0 |
| 0AH | 08H | 03H | 10 + 8 − 3 = 15 | 0FH / 00001111 | D3–D0 |
| 14H | 0AH | 05H | 20 + 10 − 5 = 25 | 19H / 00011001 | D4, D3, D0 |

The five-instruction sample takes **28 microcycles**, approximately **7 seconds at 4 Hz**, excluding browser scheduling delays. At 1 Hz it takes about 28 seconds. Step instruction animates the remaining cycles of one instruction; Clock advances just one cycle.

If execution keeps repeating, pause and check the loaded RAM, not just the draft: addresses 00–04 must contain **09, 1A, 2B, EF, FF**. Click Instruction template and Load program if necessary. If entering a program manually, include the instructions as well as the data. A missing HLT allows the PC to wrap from F to 0; the safety limit pauses Run after 256 instructions. Reload edits before executing them.

## Source map

- `src/simulator/cpu.ts`: pure immutable machine transitions and formatted values.
- `src/simulator/program.ts`: memory input validation and instruction encoding.
- `src/simulator/playback.ts`: playback reducer, safety limits and an internal trace capped at 80 microcycles (not displayed).
- `src/App.tsx`: editor state, timer lifecycle and controls.
- `src/components/`: architecture diagram, RAM editor, output icons, tutorial menu, themed artwork and toast notifications.
- `src/styles.css`: base layout and responsive styling.
- `src/main.tsx`: application entry point and stylesheet import order.
- `src/hardware.css`: base light palettes and CSS board geometry; later stylesheets customize the themes and layout.
- `src/output-signals.css` and `src/barbie.css`: output state colors and themed artwork.
- `src/simulator/*.test.ts`: unit tests for CPU behavior, input parsing and playback.
- `tests/simulator.spec.ts`: browser workflow tests; see the maintenance note under Tests.

## Command reference

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the locked dependencies; requires the supplied lockfile |
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check and generate the production site in `dist/` |
| `npm run preview` | Serve the existing production build locally |
| `npm test` | Run simulator unit tests once |
| `npm run test:watch` | Re-run unit tests during development |
| `npm run test:e2e` | Run Playwright browser workflows |

## Troubleshooting

| Symptom | Action |
| --- | --- |
| `npm` is not recognized | Install Node.js and reopen the terminal. Check `node --version` and `npm --version`. |
| Dependency installation fails | Check the supported Node version and network connection, then run `npm ci` again. |
| Port 5173 is occupied | Use the actual Local URL printed by Vite. Browser tests use their configured port. |
| Preview does not show the latest edits | Run `npm run build` again before `npm run preview`. |
| Browser tests cannot find a browser | Run `npx playwright install chromium`, or select installed Edge as described above. |
| Result does not change after editing | Click Load program to apply the draft, then Run. |
| Output stays zero during arithmetic | OUT must execute before the output register changes. Check A for intermediate results. |
| A subtraction produces a large byte | Arithmetic wraps modulo 256; for example 00H minus 01H becomes FFH. |
| Progress is slow | Increase Clock speed. At 0.5 Hz each microcycle takes about two seconds. |
