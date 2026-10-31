import { CircuitBoard, Radio } from "lucide-react";
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
function Register({
  id,
  label,
  value,
  bits = 8,
  side,
  row,
  cpu,
}: {
  id: ComponentId;
  label: string;
  value: number;
  bits?: number;
  side: "left" | "right";
  row: number;
  cpu: CpuState;
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
      <div className="register-top">
        <span>{label}</span>
        <b>{id}</b>
      </div>
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
export default function Architecture({ cpu }: { cpu: CpuState }) {
  const subtract = cpu.ir >> 4 === 2;
  const transferringAlu = cpu.bus?.source === "ALU";
  const alu = transferringAlu
    ? cpu.bus!.value
    : (cpu.a + (subtract ? -cpu.b : cpu.b)) & 255;
  return (
    <div className="center-column">
      <section className="panel" aria-label="SAP-1 architecture">
        <div className="panel-head">
          <h2>
            <CircuitBoard />
            Architecture
          </h2>
          <span className="badge">SAP-1 / 8-BIT</span>
        </div>
        <div className="diagram-wrapper">
          <div className="diagram">
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
              cpu={cpu}
            />
            <Register
              id="MAR"
              label="Memory address"
              value={cpu.mar}
              bits={4}
              side="left"
              row={2}
              cpu={cpu}
            />
            <Register
              id="RAM"
              label={"RAM [" + hex(cpu.mar) + "]"}
              value={cpu.ram[cpu.mar]}
              side="left"
              row={3}
              cpu={cpu}
            />
            <Register
              id="IR"
              label="Instruction register"
              value={cpu.ir}
              side="left"
              row={4}
              cpu={cpu}
            />
            <Register
              id="A"
              label="Accumulator"
              value={cpu.a}
              side="right"
              row={1}
              cpu={cpu}
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
              cpu={cpu}
            />
            <Register
              id="B"
              label="B register"
              value={cpu.b}
              side="right"
              row={3}
              cpu={cpu}
            />
            <Register
              id="OUT"
              label="Output register"
              value={cpu.out}
              side="right"
              row={4}
              cpu={cpu}
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
        <div className="cycle-area">
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
      <section className="panel">
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
        <p className="signal-note">
          Highlighted signals are logically asserted. Hover for their function.
        </p>
      </section>
    </div>
  );
}
