import { Lightbulb, List } from "lucide-react";
import { binary, hex, type CpuState } from "../simulator/cpu";
import type { TraceEntry } from "../simulator/playback";
export default function Output({
  cpu,
  trace,
}: {
  cpu: CpuState;
  trace: TraceEntry[];
}) {
  return (
    <aside className="right-column">
      <section className="panel" aria-label="Output display">
        <div className="panel-head">
          <h2>
            <Lightbulb />
            Output display
          </h2>
          <span className="panel-index">OUT</span>
        </div>
        <div className="output-body">
          <span className="output-label">HEXADECIMAL</span>
          <div
            className="big-output"
            aria-label={"Output " + hex(cpu.out) + " hexadecimal"}
          >
            <span data-testid="output-hex">{hex(cpu.out)}</span>
            <small>H</small>
          </div>
          <div
            className="led-row"
            aria-label={"Binary output " + binary(cpu.out)}
          >
            {binary(cpu.out)
              .split("")
              .map((bit, index) => (
                <div key={index} className="led-bit">
                  <div className={"led" + (bit === "1" ? " on" : "")} />
                  <span>D{7 - index}</span>
                  <span className="bit-value">{bit}</span>
                </div>
              ))}
          </div>
          <div className="output-meta">
            <span>
              DEC <b>{cpu.out}</b>
            </span>
            <span>
              SIGNED <b>{cpu.out > 127 ? cpu.out - 256 : cpu.out}</b>
            </span>
          </div>
          <p className="output-note">
            Latched by OUT. The LEDs retain their value until the next OUT or
            Reset.
          </p>
        </div>
      </section>
      <section className="panel" aria-label="Execution trace">
        <div className="panel-head">
          <h2>
            <List />
            Execution trace
          </h2>
          <span className="badge">LATEST FIRST</span>
        </div>
        <div className="trace">
          {!trace.length ? (
            <p className="trace-empty">
              Every clock has a story.
              <br />
              Load your program and press Clock, Step instruction or Run to see
              it here.
            </p>
          ) : (
            trace.map((entry) => (
              <div key={entry.clock} className="trace-entry">
                <b>T{entry.phase}</b>
                <div>
                  {entry.description}
                  <br />
                  <span>Clock {entry.clock}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
  );
}
