import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

export default function HelpMenu() {
  const container = useRef<HTMLDetailsElement>(null);
  const [page, setPage] = useState("start");
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) container.current.open = false;
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const dismiss = () => {
    if (!container.current) return;
    container.current.open = false;
    container.current.querySelector("summary")?.focus();
  };
  return <details ref={container} className="panel reference header-reference" onKeyDown={event => { if (event.key === "Escape") dismiss(); }}>
    <summary>Tutorial & reference <ChevronDown size={14} /></summary>
    <div className="header-reference-content tutorial-content">
      <div className="tutorial-heading"><strong>Your SAP-1 field guide</strong><button aria-label="Close tutorial" onClick={dismiss}><X size={16} /></button></div>
      <nav className="tutorial-nav" aria-label="Help topics">{[["start", "How to use"], ["works", "How it works"], ["reference", "Instructions"]].map(([id, label]) => <button key={id} aria-pressed={page === id} onClick={() => setPage(id)}>{label}</button>)}</nav>
      <div className="tutorial-page">
        {page === "start" ? <><h3>Your first run</h3><ol>
          <li><strong>Insert the sample.</strong> Click Instruction template. It fills LDA, ADD, SUB, OUT and HLT plus 25H, 05H and 23H at addresses 09, 0A and 0B.</li>
          <li><strong>Load program.</strong> This copies the draft into RAM and resets the CPU. Editing a cell alone does not change loaded memory.</li>
          <li><strong>Follow one move.</strong> Click Clock for one microcycle. Watch the token carry a byte between the highlighted registers.</li>
          <li><strong>Play an instruction or the whole program.</strong> Step instruction finishes the current instruction. Run continues until HLT; Pause freezes execution.</li>
          <li><strong>Read the result.</strong> The sample outputs <b>07H = 7 decimal = 00000111</b>. The three rightmost output icons turn green.</li>
        </ol><p className="tutorial-tip">Try 0.5 Hz for two seconds per clock. Reset replays the loaded program; Load program applies your edits.</p></> : page === "works" ? <><h3>Fetch → decode → execute</h3><ol>
          <li><strong>T1: find the address.</strong> PC sends the next instruction address to MAR.</li>
          <li><strong>T2: prepare the next address.</strong> PC increments while the other registers hold their values.</li>
          <li><strong>T3: read and decode.</strong> RAM sends the instruction to IR. Its upper four bits identify the operation; its lower four bits select an operand address.</li>
          <li><strong>T4–T6: do the work.</strong> LDA loads A. ADD and SUB fetch a value into B, then the ALU updates A. OUT copies A to the output. HLT stops at T4.</li>
        </ol><p>The W-BUS is the shared data path. The moving token shows the transferred byte; highlighted control signals identify the actions enabled during that clock.</p><p className="tutorial-tip">Output is latched: changing A does not change the output icons until OUT executes. Green means 1; red means 0. Eight-bit arithmetic wraps between 00H and FFH.</p></> : <><h3>Instruction reference</h3><dl className="tutorial-instructions">{[["LDA 9H", "Load RAM address 09 into A."], ["ADD AH", "Add RAM address 0A to A."], ["SUB BH", "Subtract RAM address 0B from A."], ["OUT", "Copy A to the output display."], ["HLT", "Stop execution and keep the result."]].map(([code, text]) => <div key={code}><dt><code>{code}</code></dt><dd>{text}</dd></div>)}</dl><p>Addresses run from 0 to F (16 memory slots). Enter data as 25H, 0x25, or eight binary digits such as 00100101. Bare numbers are hexadecimal: 25 means 37 decimal. Blank cells load as 00.</p></>}
      </div>
    </div>
  </details>;
}
