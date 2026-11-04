import { useEffect, useReducer, useState } from "react";
import {
  Cpu,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Timer,

} from "lucide-react";
import Architecture from "./components/Architecture";
import MemoryEditor from "./components/MemoryEditor";
import Output from "./components/Output";
import Toast from "./components/Toast";
import HelpMenu from "./components/HelpMenu";
import { initialPlayback, playbackReducer } from "./simulator/playback";
import { instructionTemplate, parseProgram } from "./simulator/program";

export default function App() {
  const [model, dispatch] = useReducer(playbackReducer, undefined, () =>
    initialPlayback(),
  );
  const [cells, setCells] = useState<string[]>(instructionTemplate);
  const [loadedCells, setLoadedCells] = useState<string[]>(Array(16).fill(""));
  const [loadedMemory, setLoadedMemory] = useState<number[]>(Array(16).fill(0));
  const [loaded, setLoaded] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [design, setDesign] = useState("blue");
  useEffect(() => {
    document.documentElement.dataset.design = design;
    return () => { delete document.documentElement.dataset.design; };
  }, [design]);
  const [inputError, setInputError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 4500);
    return () => window.clearTimeout(timer);
  }, [message]);
  const { cpu, mode } = model;
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
          <span>{design === "pink" ? "LIFE IN BITS" : "IT’S BIT TIME!"}</span>
          <span className="brand-machine">SAP-1</span>
        </div>
        <div className="compact-themes" aria-label="Workspace theme">{[ ["blue", "Ben 10"], ["pink", "Barbie"] ].map(([id, name]) => <button key={id} aria-pressed={design === id} onClick={() => setDesign(id)}>{name}</button>)}</div>
        <div className="top-meta">
          <span>
            <i className="dot" />
            BROWSER SIMULATION
          </span>
          <span>GROUP 05 / SAP-1</span>
        </div>
      <HelpMenu />
      </header>

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
          Speed
          <input
            aria-label="Clock speed"
            type="range"
            min="0.5"
            step="0.5"
            max="20"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
          <output>{speed} Hz · {(1 / speed).toFixed(2)}s / clock</output>
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
        <p className="control-hint">
          {!loaded
            ? "Start with the program editor below. Load a program to enable Run, Step and Clock."
            : cpu.halted
              ? "Execution stopped. Reset to replay, or edit and load a new program."
              : "Step instruction completes one instruction Â· Clock advances one microcycle Â· Reset restores loaded memory."}
        </p>
      </section>
      <div className="toast-stack">
        {(model.notice || message) && <Toast key={model.notice || message} message={model.notice || message} />}
        {cpu.error && <Toast key={cpu.error} message={cpu.error} error />}
        {dirty && loaded && <Toast key="draft-changed" message="Draft changed. Execution uses loaded RAM until you click Load program." />}
      </div>
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
            setCells(instructionTemplate());
            setInputError("");
            setMessage(
              "Sample instructions and data (25H, 05H, 23H) inserted. Click Load program to begin.",
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
        <Architecture cpu={cpu} design={design} speed={speed} />
        <Output cpu={cpu} />
      </main>

      <footer>
        <span>BUILT TO UNDERSTAND, ONE CLOCK AT A TIME.</span>
        <span>SAP-1 / COMPUTER ARCHITECTURE & ORGANIZATION</span>
      </footer>
    </div>
  );
}
