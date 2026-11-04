# SAP-1 Workbench

A graphical SAP-1 computer simulator for Computer Architecture and Organization. Built from the supplied project brief with React, TypeScript and Vite.

## Run locally

Use **Node.js 24 LTS** and npm (Node 22.12+ is also supported).

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

Build output is in `dist/`. Preview serves the production build. Simulation runs entirely in the browser; no database, server API or account is required. Google Fonts is optional visual enhancement; local fonts are used if unavailable. Programs are session-only and are cleared on browser refresh.

## First calculation

1. Click **Instruction template**. This fills the sample instructions and data:
   - 00: LDA 9H
   - 01: ADD AH
   - 02: SUB BH
   - 03: OUT
   - 04: HLT
2. Enter **25H**, **05H**, **23H** at addresses **09**, **0A**, **0B**.
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

Run pauses after 256 instructions to make missing-HLT programs manageable; pressing Run resumes. Trace retains the latest 80 microcycles. Unknown opcodes halt with an explanatory error.

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

Each instruction fetches using T1 PC→MAR, T2 increment PC, T3 RAM→IR. Ordinary instructions occupy six T states, with unused states idle. HLT completes at T4. OUT/HLT ignore the operand nibble; their mnemonic encodings are EF/FF, matching the assignment sample.

The supplied brief references Unit 2, but that teaching material was not provided. This explicit six-state timing model is an implementation assumption. Control labels represent **logical assertions**, not physical active-low pin voltage. This is a register-transfer simulator, not a gate-level electronics model.

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

Tests launch Vite automatically unless it is already serving port 5173. Failure traces and screenshots are saved in ignored `test-results/`. Custom `test-results-*` directories and `playwright-report/` are ignored too. Browser tests include live arithmetic history and confirm that LEDs latch only on OUT.

## Interface and themes

Choose **Sky Blue** (default) or **Rose Pink**. Both are light themes; changing the palette preserves your loaded program, registers and playback. The architecture uses a fixed CSS perspective board with visible chip sides, edge pins and highlighted W-Bus transfers. It is a browser-based register-transfer visualization with CSS depth effects, not a rotatable WebGL or gate-level electronics model.

- Graphical PC, MAR, RAM, IR, accumulator, ALU, B and output modules display live values.
- Raised native buttons provide Run/Pause, Step instruction, Clock, Reset and Load program.
- Eight green output LEDs show bits D7 through D0, left to right, with binary values and ON/OFF labels. Read the bit values and ON/OFF labels to distinguish each output state.
- The live calculation panel shows the latest ADD/SUB, plus the accumulator in hexadecimal, decimal and binary.
- Calculation history lists arithmetic and OUT events within the latest **80 clocks** of the current run. Older events expire; Reset, Load and page refresh clear the history.
- Output LEDs latch only when **OUT** executes. Intermediate arithmetic changes the accumulator without changing the output LEDs.
- A three-step guide, section navigation and sticky desktop controls help navigation. Mobile layouts stack the panels; keyboard focus, input error messages and reduced-motion support are included.

`src/styles.css` defines the base layout. `src/hardware.css`, loaded afterward, defines the light palettes, depth effects and LEDs. Customize its semantic CSS variables such as `--primary`, `--accent`, `--bg` and `--panel`. The pink palette overrides the default blue tokens through `:root[data-design="pink"]`; output LEDs stay green independently of the palette.

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
- `src/simulator/playback.ts`: playback reducer, safety limits and trace.
- `src/App.tsx`: editor state, timer lifecycle and controls.
- `src/components/`: architecture diagram, RAM editor, output and trace.
- `src/styles.css`: base layout and responsive styling.
- `src/hardware.css`: light blue/pink palettes, CSS board geometry and green LEDs.
- `tests/simulator.spec.ts`: browser workflows, arithmetic history, LED latching and mobile overflow checks.

## Suggested five-member responsibilities

1. CPU/microcycles and architecture verification.
2. Program input and RAM viewer.
3. Register diagram, bus and signals.
4. Controls, LEDs, responsive interface and accessibility.
5. Tests, README, GitHub preparation and demonstration recording.

These are suggested roles, not claims of authorship. Each group member should understand the whole simulator before presenting.

## Submission


The source is ready for your group's GitHub repository. Create the repository under the intended account and push this project; no remote repository has been published automatically. Review the design assumptions against your Unit 2 notes.


## Complete setup on another computer

1. Install a Node.js version supported by `package.json` and npm.
2. Clone your repository, or extract the submitted source ZIP, and open a terminal in the folder containing `package.json`.
3. Run `npm ci` to install the exact dependencies from `package-lock.json`.
4. Run `npm run dev` and open the URL printed in the terminal.
5. Open **Tutorial & reference** for the built-in usage, architecture and instruction guide. Use Clock to explain individual transfers and Run to demonstrate a complete calculation.
6. Stop the development server with Ctrl+C. For a production check, run `npm run build`, then `npm run preview` and open its printed URL.

Internet access is needed to install dependencies initially. No API keys or environment variables are required. Keep `package-lock.json` in the submission so the dependencies can be reproduced.

### Command reference

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the locked dependencies; requires the supplied lockfile |
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check and generate the production site in `dist/` |
| `npm run preview` | Serve the existing production build locally |
| `npm test` | Run simulator unit tests once |
| `npm run test:watch` | Re-run unit tests during development |
| `npm run test:e2e` | Run Playwright browser workflows |

### Troubleshooting setup and execution

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

## Repository safety and professor review

Commit the application source, tests, scripts, HTML entry point, package manifest and lockfile, TypeScript/Vite/Playwright configuration, README, and relevant demonstration documentation. Record a demonstration separately if required by your professor.

The `.gitignore` excludes dependency folders, generated builds, test reports, coverage, caches, temporary recordings, local editor/assistant settings, environment files, cloud credential folders and common private-key files. Do not put passwords or tokens in source files. If an example environment file is ever needed, use placeholder values only in `.env.example`.

Ignoring a file does **not** remove an already tracked file or delete earlier copies from Git history. Before submitting, inspect the actual staged changes:

```powershell
git status --short
git diff --check
git diff --cached --stat
git diff --cached
```

Stage the intended project files, review them, then commit. Keep design and verification notes accurate; review any assignment-specific documentation against your professor's submission requirements. Do not claim tests or demonstrations were run unless you ran them.

Suggested final verification:

```powershell
npm test
npm run build
npm run test:e2e
```

Confirm all three sample outputs, demonstrate Clock and Step instruction, explain the fetch sequence and OUT latch, and check the submitted repository can be installed using `npm ci`. Include your actual group names, course details and repository URL if required by the assignment. This guide does not assert that those submission-specific details have been provided.
