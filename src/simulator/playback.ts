import { createCpu, tick, type CpuState } from "./cpu";
export interface TraceEntry {
  clock: number;
  phase: number;
  description: string;
}
export interface Playback {
  cpu: CpuState;
  mode: "idle" | "step" | "run";
  target: number;
  trace: TraceEntry[];
  notice: string;
}
export type PlaybackAction =
  | { type: "START"; mode: "step" | "run" }
  | { type: "TICK" | "CLOCK" | "PAUSE" }
  | { type: "RESET"; memory: number[] };
export function initialPlayback(memory?: number[]): Playback {
  return {
    cpu: createCpu(memory),
    mode: "idle",
    target: 0,
    trace: [],
    notice: "",
  };
}
export function playbackReducer(
  state: Playback,
  action: PlaybackAction,
): Playback {
  if (action.type === "RESET") return initialPlayback(action.memory);
  if (action.type === "PAUSE") return { ...state, mode: "idle" };
  if (action.type === "START") {
    if (state.cpu.halted) return state;
    return {
      ...state,
      mode: action.mode,
      target: state.cpu.instructions + (action.mode === "step" ? 1 : 256),
      notice: "",
    };
  }
  if (state.cpu.halted || (action.type === "TICK" && state.mode === "idle"))
    return state;
  const cpu = tick(state.cpu);
  const limit = state.mode !== "idle" && cpu.instructions >= state.target;
  return {
    ...state,
    cpu,
    mode: cpu.halted || limit ? "idle" : state.mode,
    notice:
      limit && state.mode === "run" && !cpu.halted
        ? "Paused after 256 instructions. Check for HLT, or press Run to continue."
        : "",
    trace: [
      { clock: cpu.clocks, phase: cpu.phase, description: cpu.description },
      ...state.trace,
    ].slice(0, 80),
  };
}
