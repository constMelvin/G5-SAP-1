import { Braces, Download, Eraser, FileCode2 } from "lucide-react";
import { hex } from "../simulator/cpu";
interface Props {
  cells: string[];
  ram: number[];
  accessed: number | null;
  busy: boolean;
  dirty: boolean;
  error: string;
  onChange: (address: number, value: string) => void;
  onTemplate: () => void;
  onClear: () => void;
  onLoad: () => void;
}
export default function MemoryEditor({
  cells,
  ram,
  accessed,
  busy,
  dirty,
  error,
  onChange,
  onTemplate,
  onClear,
  onLoad,
}: Props) {
  return (
    <section
      className="panel memory-panel"
      id="program"
      aria-label="Program and memory editor"
    >
      <div className="panel-head">
        <h2>
          <Braces />
          Program & memory
        </h2>
        <span className="badge">16 × 8</span>
      </div>
      <div className="memory-tools">
        <button
          onClick={onTemplate}
          disabled={busy}
          aria-label="Insert instruction template"
        >
          <FileCode2 />
          Instruction template
        </button>
        <button
          onClick={onClear}
          disabled={busy}
          title="Clear draft"
          aria-label="Clear draft"
        >
          <Eraser />
        </button>
      </div>
      <p className="memory-hint">
        Hex bytes, 8 binary bits, or instructions.
        <br />
        Default data: 25H, 05H, 23H at 09, 0A and 0B. Edit as needed.
      </p>
      <div className="memory-table-scroll" tabIndex={0} aria-label="Memory values"><table className="memory-table">
        <thead>
          <tr>
            <th scope="col">ADDR</th>
            <th scope="col">DRAFT / INPUT</th>
            <th scope="col">LOADED</th>
          </tr>
        </thead>
        <tbody>
          {cells.map((cell, index) => (
            <tr
              key={index}
              className={
                (accessed === index ? "accessed " : "") +
                (index >= 9 && index <= 11 ? "data-row" : "")
              }
            >
              <td>{hex(index)}</td>
              <td>
                <input
                  aria-label={"Memory " + hex(index)}
                  aria-invalid={
                    error.startsWith("Address " + hex(index) + ":") || undefined
                  }
                  aria-describedby={
                    error.startsWith("Address " + hex(index) + ":")
                      ? "memory-error"
                      : undefined
                  }
                  value={cell}
                  disabled={busy}
                  placeholder={index >= 9 && index <= 11 ? "data · hex" : "00"}
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(event) => onChange(index, event.target.value)}
                />
              </td>
              <td data-testid={"loaded-" + hex(index)}>{hex(ram[index])}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <div className="memory-foot">
        <div className="draft-state">
          <span className={dirty ? "dirty" : ""}>
            {dirty ? "● Unloaded edits" : "● Draft matches RAM"}
          </span>
          <span>HEX / BIN</span>
        </div>
        {error && (
          <div className="error-message" id="memory-error" role="alert">
            {error}
          </div>
        )}
        <button className="primary" onClick={onLoad} disabled={busy}>
          <Download />
          Load program
        </button>
      </div>
    </section>
  );
}

