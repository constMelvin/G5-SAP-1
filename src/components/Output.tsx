import { Lightbulb } from "lucide-react";
import DreamIcon from "./DreamIcon";
import { binary, hex, type CpuState } from "../simulator/cpu";
export default function Output({ cpu }: { cpu: CpuState }) {
  return (
    <aside className="right-column">
      <section className="panel" id="output" aria-label="Output display">
        <div className="panel-head">
          <h2>
            <Lightbulb />
            Output display
          </h2>
          <span className="panel-index">OUT</span>
        </div>
        <div className="output-body">
          <div className="display-bezel" aria-hidden="true"><i /><span>8-BIT OUTPUT MODULE</span><i /></div>
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
            role="img"
            aria-label={"Binary output " + binary(cpu.out)}
          >
            {binary(cpu.out)
              .split("")
              .map((bit, index) => (
                <div key={index} className="led-bit" aria-label={"D" + (7-index) + ": " + (bit === "1" ? "ON" : "OFF")}>
                  <div className={"led omnitrix-led" + (bit === "1" ? " on" : " off")}>
                    <svg viewBox="0 0 40 48" aria-hidden="true">
                      <path d="M13 1h14l3 11v24l-3 11H13l-3-11V12Z" fill="#26372e" stroke="#0b1812" strokeWidth="2" />
                      <circle cx="20" cy="24" r="18" fill="#15241c" stroke="#82988a" strokeWidth="2" />
                      <circle className="omnitrix-lens" cx="20" cy="24" r="13" />
                      <path d="M11 14h18l-6 10 6 10H11l6-10Z" fill="#102017" />
                      <path d="M12 10a16 16 0 0 1 16 0" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
                      <g className="omnitrix-markers"><circle cx="20" cy="7" r="1.5" /><circle cx="37" cy="24" r="1.5" /><circle cx="20" cy="41" r="1.5" /><circle cx="3" cy="24" r="1.5" /></g>
                    </svg>
                    <svg className="barbie-bit-icon" viewBox="0 0 40 48" aria-hidden="true">
                      <path d="M12 3h16l5 7-3 8H10l-3-8Z" fill="#f7bddc" stroke="#a64b7e" strokeWidth="1.5" />
                      <path d="m10 10 5-7 5 7 5-7 5 7M10 10h20l-10 8Z" fill="none" stroke="#fff5fc" strokeWidth="1.5" />
                      <circle cx="20" cy="30" r="15" fill="#fff0f9" stroke="#d084ad" strokeWidth="2" />
                      <circle className="omnitrix-lens" cx="20" cy="30" r="11" />
                      <g transform="translate(9 19) scale(.55)" color="#c21875"><DreamIcon /></g>
                      <path d="m34 18 1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5Z" fill="#b7518c" />
                    </svg>
                  </div>
                  <span>D{7 - index}</span>
                  <span className="bit-value">{bit}</span>
                  <small className={"led-state " + (bit === "1" ? "lit" : "")}>{bit === "1" ? "ON" : "OFF"}</small>
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
    </aside>
  );
}
