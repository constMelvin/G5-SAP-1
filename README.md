# SAP-1 Workbench

A graphical SAP-1 computer simulator for Computer Architecture and Organization. Built from the supplied project brief with React, TypeScript and Vite.

## Run locally

Use **Node.js 24 LTS** and npm (Node 22.12+ is also supported).

```powershell
npm install
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

1. Click **Instruction template**. This inserts instructions only:
   - 00: LDA 9H
   - 01: ADD AH
   - 02: SUB BH
   - 03: OUT
   - 04: HLT
2. Enter **25H**, **05H**, **23H** at addresses **09**, **0A**, **0B**.
3. Click **Load program**. Verify RAM shows 25, 05, 23.
4. Click **Run**, or use **Clock** and **Step instruction**.
5. At HLT the output is **07H**, binary **00000111**.

Operand values are always entered through the editor. The template does not preload example data.

## Controls and input

| Control          | Behavior                                                         |
| ---------------- | ---------------------------------------------------------------- |
| Load program     | Validate all 16 draft rows, copy into RAM, reset registers       |
| Clock            | Execute exactly one microcycle                                   |
| Step instruction | Animate remaining microcycles of one instruction                 |
| Run / Pause      | Execute continuously / stop at current microcycle                |
| Reset            | Stop timers, zero registers/counters, restore last loaded memory |
| Clear draft      | Clear editor only; does not alter loaded RAM                     |
| Clock slider     | 1–20 microcycles per second                                      |

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

Tests launch Vite automatically unless it is already serving port 5173. Failure traces and screenshots are saved in ignored `test-results/`.

## Interface and theme

The interface uses navy surfaces and blue accents, with a three-step getting-started guide, section navigation, a desktop toolbar that stays visible while scrolling, and the program editor first on mobile. Control signals expose explanations on hover or keyboard focus. Invalid memory fields are marked and linked to their error message.

Customize the palette through the `:root` CSS variables in `src/styles.css`: `--primary` controls action buttons, `--accent` controls bus/signal highlights, and `--bg`/`--panel` control surfaces. Amber is reserved for halted/warning states; red identifies errors.

## Source map

- `src/simulator/cpu.ts`: pure immutable machine transitions and formatted values.
- `src/simulator/program.ts`: memory input validation and instruction encoding.
- `src/simulator/playback.ts`: playback reducer, safety limits and trace.
- `src/App.tsx`: editor state, timer lifecycle and controls.
- `src/components/`: architecture diagram, RAM editor, output and trace.
- `src/styles.css`: responsive visual design.
- `docs/DEMO.md`: three-case recording walkthrough.
- `docs/superpowers/`: design, implementation plan and verification notes.

## Suggested five-member responsibilities

1. CPU/microcycles and architecture verification.
2. Program input and RAM viewer.
3. Register diagram, bus and signals.
4. Controls, LEDs, responsive interface and accessibility.
5. Tests, README, GitHub preparation and demonstration recording.

These are suggested roles, not claims of authorship. Each group member should understand the whole simulator before presenting.

## Submission

The [silent demonstration video](docs/demo/three-calculations.webm) shows all three required calculations using values entered through the interface. See [the walkthrough](docs/DEMO.md) to add your group's explanation or regenerate the recording.

The source is ready for your group's GitHub repository. Create the repository under the intended account and push this project; no remote repository has been published automatically. Review the design assumptions against your Unit 2 notes. Use `docs/DEMO.md` for your group's presentation and explanation.
