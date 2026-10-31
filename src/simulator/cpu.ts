export type ComponentId =
  | "PC"
  | "MAR"
  | "RAM"
  | "IR"
  | "A"
  | "B"
  | "ALU"
  | "OUT";
export interface BusTransfer {
  source: ComponentId;
  target: ComponentId;
  value: number;
}
export interface CpuState {
  pc: number;
  mar: number;
  ir: number;
  a: number;
  b: number;
  out: number;
  ram: number[];
  phase: number;
  clocks: number;
  instructions: number;
  halted: boolean;
  error: string | null;
  signals: string[];
  bus: BusTransfer | null;
  description: string;
  accessed: number | null;
  instructionAddress: number;
}
export const hex = (value: number, width = 2) =>
  value.toString(16).toUpperCase().padStart(width, "0");
export const binary = (value: number, width = 8) =>
  value.toString(2).padStart(width, "0");
export const OPCODES: Record<number, string> = {
  0: "LDA",
  1: "ADD",
  2: "SUB",
  14: "OUT",
  15: "HLT",
};
export function decode(byte: number): string {
  const opcode = byte >> 4;
  const name = OPCODES[opcode];
  return name
    ? name + (opcode <= 2 ? " " + hex(byte & 15, 1) + "H" : "")
    : "Unknown";
}
export function createCpu(memory: number[] = Array(16).fill(0)): CpuState {
  if (
    memory.length !== 16 ||
    memory.some((byte) => !Number.isInteger(byte) || byte < 0 || byte > 255)
  ) {
    throw new Error("RAM must contain exactly sixteen 8-bit integers.");
  }
  return {
    pc: 0,
    mar: 0,
    ir: 0,
    a: 0,
    b: 0,
    out: 0,
    ram: [...memory],
    phase: 0,
    clocks: 0,
    instructions: 0,
    halted: false,
    error: null,
    signals: [],
    bus: null,
    description: "Load a program, then follow its journey one clock at a time.",
    accessed: null,
    instructionAddress: 0,
  };
}
// State is the instant after the displayed T-state has completed.
export function tick(state: CpuState): CpuState {
  if (state.halted) return state;
  const phase = (state.phase % 6) + 1;
  const next: CpuState = {
    ...state,
    phase,
    clocks: state.clocks + 1,
    signals: [],
    bus: null,
    accessed: null,
    description: "Idle cycle — registers hold their values.",
  };
  const transfer = (
    source: ComponentId,
    target: ComponentId,
    value: number,
    signals: string[],
    description: string,
  ) => {
    next.bus = { source, target, value };
    next.signals = signals;
    next.description = description;
  };
  if (phase === 1) {
    next.mar = state.pc;
    next.instructionAddress = state.pc;
    transfer(
      "PC",
      "MAR",
      state.pc,
      ["EP", "LM"],
      "Fetch address: PC → MAR (" + hex(state.pc) + "H).",
    );
  } else if (phase === 2) {
    next.pc = (state.pc + 1) & 15;
    next.signals = ["CP"];
    next.description =
      "Advance PC → " + hex(next.pc, 1) + "H, ready for the next instruction.";
  } else if (phase === 3) {
    next.ir = state.ram[state.mar];
    next.accessed = state.mar;
    transfer(
      "RAM",
      "IR",
      next.ir,
      ["CE", "LI"],
      "Fetch instruction: RAM[" +
        hex(state.mar) +
        "] → IR. Decode " +
        decode(next.ir) +
        ".",
    );
  } else {
    const opcode = state.ir >> 4;
    if (!(opcode in OPCODES)) {
      next.halted = true;
      next.error =
        "Unsupported opcode " +
        hex(opcode, 1) +
        "H at address " +
        hex(state.instructionAddress) +
        "H. Reset and correct the program.";
      next.description = next.error;
      return next;
    }
    if (phase === 4) {
      if (opcode <= 2) {
        next.mar = state.ir & 15;
        transfer(
          "IR",
          "MAR",
          next.mar,
          ["EI", "LM"],
          "Select operand: IR address → MAR (" + hex(next.mar) + "H).",
        );
      } else if (opcode === 14) {
        next.out = state.a;
        transfer(
          "A",
          "OUT",
          state.a,
          ["EA", "LO"],
          "Latch output: A → OUT. LEDs show " + hex(state.a) + "H.",
        );
      } else {
        next.halted = true;
        next.signals = ["HLT"];
        next.instructions++;
        next.description =
          "HLT — clock stopped. Output and registers retain their values.";
      }
    } else if (phase === 5 && opcode <= 2) {
      const value = state.ram[state.mar];
      next.accessed = state.mar;
      if (opcode === 0) next.a = value;
      else next.b = value;
      transfer(
        "RAM",
        opcode === 0 ? "A" : "B",
        value,
        ["CE", opcode === 0 ? "LA" : "LB"],
        "Read operand: RAM[" +
          hex(state.mar) +
          "] → " +
          (opcode === 0 ? "A" : "B") +
          " (" +
          hex(value) +
          "H).",
      );
    } else if (phase === 6 && (opcode === 1 || opcode === 2)) {
      // A + complement(B) + 1 implements subtraction; retain eight bits.
      next.a =
        (state.a + (opcode === 1 ? state.b : (~state.b & 255) + 1)) & 255;
      transfer(
        "ALU",
        "A",
        next.a,
        opcode === 1 ? ["EU", "LA"] : ["SU", "EU", "LA"],
        (opcode === 1 ? "Add" : "Subtract (two’s complement)") +
          ": " +
          hex(state.a) +
          (opcode === 1 ? " + " : " − ") +
          hex(state.b) +
          " → A (" +
          hex(next.a) +
          "H).",
      );
    }
  }
  if (phase === 6) next.instructions++;
  return next;
}
export function stepInstruction(state: CpuState): CpuState {
  const target = state.instructions + 1;
  let next = state;
  for (
    let count = 0;
    count < 6 && !next.halted && next.instructions < target;
    count++
  )
    next = tick(next);
  return next;
}
