import { decode, hex, type CpuState } from "../simulator/cpu";

export default function Sequencer({ cpu }: { cpu: CpuState }) {
  return (
    <section className="panel sequencer-panel" aria-label="Controller and sequencer">
      <div className="sequencer-heading">
        <h2>Controller / Sequencer</h2>
        <span className={"sequencer-state" + (cpu.halted ? " stopped" : "")}>
          {cpu.error ? "Error" : cpu.halted ? "Halted" : cpu.clocks ? "Active" : "Ready"}
        </span>
      </div>
      <div className="sequencer-instruction">
        <span>INSTRUCTION</span>
        <strong>{cpu.clocks >= 3 ? decode(cpu.ir) : "Awaiting fetch"}</strong>
      </div>
      {["Fetch", "Execute"].map((group, index) => (
        <div className="sequencer-group" key={group}>
          <span className="sequencer-group-label">{group}</span>
          <div className="cycles">
            {[1, 2, 3].map((step) => {
              const phase = step + index * 3;
              return (
                <div key={phase} className={"cycle" + (cpu.phase === phase ? " active" : "")}
                  aria-current={cpu.phase === phase ? "step" : undefined}>
                  T{phase}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <p className="micro-description">{cpu.description}</p>
      <div className="stats">
        <span><b data-testid="instruction-count">{cpu.instructions}</b><small>Instructions</small></span>
        <span><b>{cpu.clocks}</b><small>Clocks</small></span>
        <span><b>{hex(cpu.pc, 1)}H</b><small>PC</small></span>
      </div>
    </section>
  );
}
// Live sequencer follows the current CPU phase.
