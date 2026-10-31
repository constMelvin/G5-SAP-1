import { useEffect, useReducer, useState } from "react";
import {
  Cpu,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Timer,
  ArrowUpRight,
} from "lucide-react";
import Architecture from "./components/Architecture";
import MemoryEditor from "./components/MemoryEditor";
import Output from "./components/Output";
import { initialPlayback, playbackReducer } from "./simulator/playback";
import { instructionTemplate, parseProgram } from "./simulator/program";

export default function App() {
  const [model, dispatch] = useReducer(playbackReducer, undefined, () =>
    initialPlayback(),
  );
  const [cells, setCells] = useState<string[]>(Array(16).fill(""));
  const [loadedCells, setLoadedCells] = useState<string[]>(Array(16).fill(""));
  const [loadedMemory, setLoadedMemory] = useState<number[]>(Array(16).fill(0));
  const [loaded, setLoaded] = useState(false);
  const [speed, setSpeed] = useState(4);
  const [inputError, setInputError] = useState("");
  const [message, setMessage] = useState("");
  const { cpu, mode, trace } = model;
  const busy = mode !== "idle";
  const dirty = cells.some((cell, index) => cell !== loadedCells[index]);
  const status = cpu.error
    ? "Error"
    : cpu.halted
      ? "Halted"
      : busy
        ? mode === "step"
          ? "Stepping"
          : "Running"
        : cpu.clocks
          ? "Paused"
          : "Ready";
  useEffect(() => {
    if (mode === "idle") return;
    const timer = window.setTimeout(
      () => dispatch({ type: "TICK" }),
      1000 / speed,
    );
    return () => window.clearTimeout(timer);
  }, [mode, cpu.clocks, speed]);
  const load = () => {
    try {
      const memory = parseProgram(cells);
      setLoadedMemory(memory);
      setLoadedCells([...cells]);
      setLoaded(true);
      setInputError("");
      setMessage(
        "Program loaded. Registers reset. Ready to execute your memory image.",
      );
      dispatch({ type: "RESET", memory });
    } catch (error) {
      setInputError((error as Error).message);
      setMessage("");
    }
  };
  const edit = (address: number, value: string) => {
    setCells((previous) =>
      previous.map((cell, index) => (index === address ? value : cell)),
    );
    setInputError("");
    setMessage("");
  };
  const start = (nextMode: "step" | "run") => {
    setMessage("");
    dispatch({ type: "START", mode: nextMode });
  };
  const reset = () => {
    dispatch({ type: "RESET", memory: loadedMemory });
    setInputError("");
    setMessage(
      loaded
        ? "Reset complete. Registers cleared; last loaded program restored."
        : "Registers cleared. Enter and load a program to begin.",
    );
  };
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">
            <Cpu />
          </span>
          ARCHITECTURE LAB
        </div>
        <div className="top-meta">
          <span>
            <i className="dot" />
            BROWSER SIMULATION
          </span>
          <span>GROUP 05 / SAP-1</span>
        </div>
      </header>
      <section className="intro">
        <div>
          <div className="eyebrow">Simple as possible. Made visible.</div>
          <h1>
            SAP-1 Workbench<span>.</span>
          </h1>
          <p>Load a program. Follow the bits. See how a computer thinks.</p>
        </div>
        <div className="intro-aside">
          <b>8-bit architecture</b>
          <br />
          16 bytes of possibility.
        </div>
      </section>
      <section className="toolbar" aria-label="Simulator controls">
        <div className="control-group">
          {busy ? (
            <button
              className="primary"
              onClick={() => dispatch({ type: "PAUSE" })}
            >
              <Pause />
              Pause
            </button>
          ) : (
            <button
              className="primary"
              onClick={() => start("run")}
              disabled={!loaded || cpu.halted}
            >
              <Play />
              Run
            </button>
          )}
          <button
            onClick={() => start("step")}
            disabled={!loaded || busy || cpu.halted}
          >
            <SkipForward />
            Step instruction
          </button>
          <button
            onClick={() => {
              setMessage("");
              dispatch({ type: "CLOCK" });
            }}
            disabled={!loaded || busy || cpu.halted}
            title="Execute one microcycle"
          >
            <Timer />
            Clock
          </button>
          <span className="separator" />
          <button className="quiet" onClick={reset}>
            <RotateCcw />
            Reset
          </button>
        </div>
        <label className="speed">
          Clock
          <input
            aria-label="Clock speed"
            type="range"
            min="1"
            max="20"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
          <output>{speed} Hz</output>
        </label>
        <span
          role="status"
          data-testid="cpu-status"
          className={
            "status " +
            (cpu.halted ? "halted " : "") +
            (cpu.error ? "error" : "")
          }
        >
          <i className="dot" />
          {status}
        </span>
      </section>
      {(model.notice || message) && (
        <div className="notice" role="status">
          {model.notice || message}
        </div>
      )}
      {cpu.error && (
        <div className="error-message" role="alert">
          {cpu.error}
        </div>
      )}
      {dirty && loaded && (
        <div className="notice">
          Your draft has changes. Execution uses the RAM column until you click
          Load program.
        </div>
      )}
      <main className="workbench">
        <MemoryEditor
          cells={cells}
          ram={cpu.ram}
          accessed={cpu.accessed}
          busy={busy}
          dirty={dirty}
          error={inputError}
          onChange={edit}
          onTemplate={() => {
            setCells((previous) => {
              const next = [...previous];
              next.splice(0, 5, ...instructionTemplate().slice(0, 5));
              return next;
            });
            setInputError("");
            setMessage(
              "Instructions inserted at 00–04. Enter your three data values at 09, 0A and 0B, then Load program.",
            );
          }}
          onClear={() => {
            setCells(Array(16).fill(""));
            setInputError("");
            setMessage(
              "Draft cleared. Loaded RAM is unchanged until you load again.",
            );
          }}
          onLoad={load}
        />
        <Architecture cpu={cpu} />
        <Output cpu={cpu} trace={trace} />
      </main>
      <details className="panel reference">
        <summary>
          Instruction reference & getting started{" "}
          <ArrowUpRight
            size={12}
            style={{ verticalAlign: "middle", marginLeft: 5 }}
          />
        </summary>
        <div className="reference-grid">
          {[
            ["LDA", "0000", "Load a memory byte into the accumulator."],
            ["ADD", "0001", "Add a memory byte to the accumulator."],
            ["SUB", "0010", "Subtract a memory byte using two’s complement."],
            ["OUT", "1110", "Copy the accumulator to the output LEDs."],
            ["HLT", "1111", "Stop the clock and hold all values."],
          ].map(([name, opcode, description]) => (
            <div key={name} className="reference-item">
              <strong>{name}</strong>
              <code>{opcode}</code>
              <p>{description}</p>
            </div>
          ))}
        </div>
        <div className="help-text">
          <p>
            <strong>Start here:</strong> Insert the instruction template, type
            your own values at 09, 0A and 0B, then click Load program. The
            template computes A + B − C. For the assignment example, manually
            enter 25H, 05H and 23H; expect 07H.
          </p>
          <p>
            <strong>Input:</strong> Bare numbers are hexadecimal: 25 means 25H
            (37 decimal). Use 0x25 or 25H for clarity. Binary is exactly eight
            bits, such as 00100101 or 0010 0101. Blank cells load as 00. LDA,
            ADD and SUB take one address from 0 to F.
          </p>
          <p>
            <strong>Controls:</strong> Clock advances one T-state. Step
            instruction plays the remaining cycles of one instruction. Run
            continues until HLT, an error, Pause, or a 256-instruction safety
            pause. Reset zeros registers and restores the last loaded program.
            Clear draft affects only the editor.
          </p>
          <p>
            <strong>Timing:</strong> T1–T3 fetch; T4–T6 execute, with HLT
            stopping at T4. Inactive cycles preserve registers. Signal
            highlights represent logical activation, not physical pin polarity.
            Eight-bit arithmetic wraps modulo 256. The PC wraps from FH to 0H.
          </p>
        </div>
      </details>
      <footer>
        <span>BUILT TO UNDERSTAND, ONE CLOCK AT A TIME.</span>
        <span>SAP-1 / COMPUTER ARCHITECTURE & ORGANIZATION</span>
      </footer>
    </div>
  );
}
