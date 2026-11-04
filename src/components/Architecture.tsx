import { Flag, CircuitBoard, Radio } from "lucide-react";
import type { CSSProperties } from "react";
import DreamIcon from "./DreamIcon";
import {
  binary,
  decode,
  hex,
  type ComponentId,
  type CpuState,
} from "../simulator/cpu";
const SIGNALS: Record<string, string> = {
  CP: "Increment program counter",
  EP: "Enable PC onto bus",
  LM: "Load memory address",
  CE: "Enable RAM onto bus",
  LI: "Load instruction register",
  EI: "Enable IR operand onto bus",
  LA: "Load accumulator",
  EA: "Enable accumulator onto bus",
  SU: "Select subtraction",
  EU: "Enable ALU onto bus",
  LB: "Load B register",
  LO: "Load output register",
  HLT: "Stop clock",
};
const STATIONS: Record<ComponentId, string> = { PC: "Launch pad", MAR: "Address gate", RAM: "Memory vault", IR: "Decode station", A: "Energy bank", B: "Supply depot", ALU: "Math forge", OUT: "Finish beacon" };
const DREAM_STATIONS: Record<ComponentId, string> = { PC: "Planner", MAR: "Room finder", RAM: "Dream closet", IR: "Design card", A: "Design desk", B: "Supply shelf", ALU: "Creation studio", OUT: "Showcase" };
const POSITIONS: Record<ComponentId, [number, number]> = { PC: [25, 0], MAR: [25, 1], RAM: [25, 2], IR: [25, 3], A: [75, 0], ALU: [75, 1], B: [75, 2], OUT: [75, 3] };
function Register({
  id,
  label,
  value,
  bits = 8,
  side,
  row,
  cpu,
  design,
}: {
  id: ComponentId;
  label: string;
  value: number;
  bits?: number;
  side: "left" | "right";
  row: number;
  cpu: CpuState;
  design: string;
}) {
  const active =
    cpu.bus?.source === id ||
    cpu.bus?.target === id ||
    (id === "PC" && cpu.signals.includes("CP"));
  return (
    <div
      className={
        "register " +
        side +
        (active ? " active" : "") +
        (id === "ALU" ? " alu" : "")
      }
      style={{ gridRow: row }}
      data-testid={"register-" + id}
    >
      <span className="chip-wall chip-wall-bottom" aria-hidden="true" />
      <span className="chip-wall chip-wall-right" aria-hidden="true" />
      <span className="chip-pins" aria-hidden="true" /><div className="register-top">
        <span>{label}</span>
        <b>{id}</b>
      </div>
      <span className="station-name">{(design === "pink" ? DREAM_STATIONS : STATIONS)[id]} {cpu.bus?.source === id ? "· SENDING" : cpu.bus?.target === id ? "· RECEIVED" : ""}</span>
      <div className="register-value">
        {hex(value, bits / 4)}
        <small>H</small>
      </div>
      <div className="register-binary">
        {id === "IR"
          ? binary(value >> 4, 4) + " · " + binary(value & 15, 4)
          : binary(value, bits)}
      </div>
    </div>
  );
}
export default function Architecture({ cpu, design, speed }: { cpu: CpuState; design: string; speed: number }) {
  const pink = design === "pink";
  const destination = cpu.bus?.target ?? (cpu.halted && !cpu.error ? "OUT" : "PC");
  const source = cpu.bus?.source ?? destination;
  const [sx, sy] = POSITIONS[source];
  const [tx, ty] = POSITIONS[destination];
  const journeyStyle = { "--from-x": `${sx}%`, "--to-x": `${tx}%`, "--from-y": `${sy * 25 + 2}%`, "--to-y": `${ty * 25 + 2}%` } as CSSProperties;
  const subtract = cpu.ir >> 4 === 2;
  const transferringAlu = cpu.bus?.source === "ALU";
  const alu = transferringAlu
    ? cpu.bus!.value
    : (cpu.a + (subtract ? -cpu.b : cpu.b)) & 255;
  return (
    <div className="center-column">
      <section className="panel live-signal-strip" aria-label="Live control signals">
        <div className="panel-head">
          <h2>
            <Radio />
            Control signals
          </h2>
          <span className="panel-index">LIVE</span>
        </div>
        <div className="signals">
          {Object.entries(SIGNALS).map(([name, label]) => (
            <span
              key={name}
              title={label}
              tabIndex={0}
              data-description={label}
              aria-label={
                label +
                ": " +
                (cpu.signals.includes(name) ? "active" : "inactive")
              }
              className={"signal" + (cpu.signals.includes(name) ? " on" : "")}
            >
              {name}
            </span>
          ))}
        </div>
      </section>
      <section
        className="panel"
        id="architecture"
        aria-label="SAP-1 architecture"
      >
        <div className="panel-head">
          <h2>
            <CircuitBoard />
            Architecture / {pink ? "Barbie Dream Lab" : "Ben 10 Alien Lab"}
          </h2>
          <span className="badge">SAP-1 / 8-BIT</span>
        </div>
        <div className="board-caption"><strong className={cpu.halted ? "completion-label" : ""}>{cpu.error ? "MISSION INTERRUPTED" : cpu.halted ? "MISSION COMPLETE" : pink ? "DREAM BIG · BUILD IN BITS" : "IT’S HERO TIME · POWER THE CORE"}</strong><span>{cpu.bus ? `${cpu.bus.source} → ${cpu.bus.target} · carrying ${hex(cpu.bus.value)}H` : "Clock to explore · Run to travel"}</span></div>
        <div className="architecture-stage">
        <div className="board-edge board-edge-bottom" aria-hidden="true" />
        <div className="board-edge board-edge-right" aria-hidden="true" />
        <div className="diagram-wrapper">
          <div className="diagram">
            <div key={cpu.clocks} className={"board-courier " + (cpu.bus ? "travelling" : "") + (cpu.halted ? " courier-stopped" : "")} style={{ ...journeyStyle, animationDuration: `${Math.min(.8, .8 / speed)}s` }} aria-hidden="true"><span>{cpu.halted && !cpu.error ? <Flag /> : pink ? <span className="dream-token"><DreamIcon /></span> : <svg className="omnitrix-token" viewBox="0 0 48 48"><path d="M17 2h14l3 10v24l-3 10H17l-3-10V12Z" fill="#263932" stroke="#0b1812" strokeWidth="2"/><circle cx="24" cy="24" r="19" fill="#111d17" stroke="#82988a" strokeWidth="2"/><circle cx="24" cy="24" r="14" fill="#a2f43e" stroke="#d8ff9a" strokeWidth="2"/><path d="M14 13h20L27 24l7 11H14l7-11Z" fill="#142018"/><path d="M16 10a16 16 0 0 1 16 0" fill="none" stroke="#ffffff" strokeOpacity=".6" strokeWidth="2"/><g fill="#b5ff62"><circle cx="24" cy="6" r="2"/><circle cx="42" cy="24" r="2"/><circle cx="24" cy="42" r="2"/><circle cx="6" cy="24" r="2"/></g></svg>}</span><small>{cpu.bus ? hex(cpu.bus.value) + "H" : cpu.halted ? (cpu.error ? "ERROR" : "DONE") : pink ? "DREAM" : "HERO"}</small></div>
            <div
              className={"wbus" + (cpu.bus ? " active" : "")}
              aria-hidden="true"
            />
            <div
              className="bus-label"
              title={
                cpu.bus
                  ? cpu.bus.source +
                    " → " +
                    cpu.bus.target +
                    ": " +
                    hex(cpu.bus.value) +
                    "H"
                  : "Bus idle"
              }
            >
              W-BUS
            </div>
            <Register
              id="PC"
              label="Program counter"
              value={cpu.pc}
              bits={4}
              side="left"
              row={1}
              cpu={cpu} design={design}
            />
            <Register
              id="MAR"
              label="Memory address"
              value={cpu.mar}
              bits={4}
              side="left"
              row={2}
              cpu={cpu} design={design}
            />
            <Register
              id="RAM"
              label={"RAM [" + hex(cpu.mar) + "]"}
              value={cpu.ram[cpu.mar]}
              side="left"
              row={3}
              cpu={cpu} design={design}
            />
            <Register
              id="IR"
              label="Instruction register"
              value={cpu.ir}
              side="left"
              row={4}
              cpu={cpu} design={design}
            />
            <Register
              id="A"
              label="Accumulator"
              value={cpu.a}
              side="right"
              row={1}
              cpu={cpu} design={design}
            />
            <Register
              id="ALU"
              label={
                transferringAlu
                  ? "ALU · transferred"
                  : subtract
                    ? "ALU · A − B"
                    : "ALU · A + B"
              }
              value={alu}
              side="right"
              row={2}
              cpu={cpu} design={design}
            />
            <Register
              id="B"
              label="B register"
              value={cpu.b}
              side="right"
              row={3}
              cpu={cpu} design={design}
            />
            <Register
              id="OUT"
              label="Output register"
              value={cpu.out}
              side="right"
              row={4}
              cpu={cpu} design={design}
            />
          </div>
          <div className="bus-legend">
            <span>
              <i className="live" />
              Active transfer
            </span>
            <span>
              <i />
              Inactive connection
            </span>
            <span>
              {cpu.bus ? hex(cpu.bus.value) + "H on bus" : "Bus idle"}
            </span>
          </div>
        </div>
        </div>
        <div className="cycle-area">
          <div className="mission-console">
            <span className="mission-emblem" aria-hidden="true">{pink ? <DreamIcon /> : "10"}</span>
            <div><span className="mission-kicker">{pink ? "DREAM STUDIO / LIVE STORY" : "MISSION CONTROL / LIVE STORY"}</span><h3>{cpu.error ? "Check your program" : cpu.halted ? "Mission accomplished" : !cpu.clocks ? "Ready for your first move" : cpu.phase <= 2 ? "Find the next instruction" : cpu.phase === 3 ? "Read the instruction" : "Carry out the instruction"}</h3><p>{cpu.bus ? `${(pink ? DREAM_STATIONS : STATIONS)[cpu.bus.source]} (${cpu.bus.source}) sends ${hex(cpu.bus.value)}H to ${(pink ? DREAM_STATIONS : STATIONS)[cpu.bus.target]} (${cpu.bus.target}).` : cpu.error ? cpu.error : cpu.halted ? "The CPU reached HLT. Your output stays visible until Reset." : cpu.clocks ? cpu.description : "Load your program, then use Clock for one move or Run for the full journey."}</p></div>
          </div>
          <div className="cycle-header">
            <span>CONTROLLER / SEQUENCER</span>
            <b>{cpu.clocks >= 3 ? decode(cpu.ir) : "AWAITING FETCH"}</b>
          </div>
          <div className="cycles">
            {[1, 2, 3, 4, 5, 6].map((phase) => (
              <div
                key={phase}
                className={"cycle" + (cpu.phase === phase ? " active" : "")}
                aria-current={cpu.phase === phase ? "step" : undefined}
              >
                T{phase}
              </div>
            ))}
          </div>
          <div className="cycle-labels">
            <span>FETCH</span>
            <span>EXECUTE</span>
          </div>
          <p className="micro-description">{cpu.description}</p>
        </div>
        <div className="stats">
          <span>
            <b data-testid="instruction-count">{cpu.instructions}</b>
            instructions
          </span>
          <span>
            <b>{cpu.clocks}</b>clock pulses
          </span>
          <span>
            PC <b>{hex(cpu.pc, 1)}H</b>
          </span>
        </div>
      </section>

    </div>
  );
}
