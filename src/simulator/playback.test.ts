import { expect, it } from "vitest";
import { initialPlayback, playbackReducer } from "./playback";
it("stops a single step after one instruction", () => {
  let state = playbackReducer(initialPlayback(), {
    type: "START",
    mode: "step",
  });
  for (let i = 0; i < 6; i++) state = playbackReducer(state, { type: "TICK" });
  expect(state.mode).toBe("idle");
  expect(state.cpu.instructions).toBe(1);
});
it("ignores queued timer ticks after reset", () => {
  let state = playbackReducer(initialPlayback(), {
    type: "START",
    mode: "run",
  });
  state = playbackReducer(state, { type: "TICK" });
  state = playbackReducer(state, { type: "RESET", memory: Array(16).fill(0) });
  state = playbackReducer(state, { type: "TICK" });
  expect(state.cpu.clocks).toBe(0);
  expect(state.trace).toHaveLength(0);
});
it("safety pauses programs without HLT and bounds trace history", () => {
  let state = playbackReducer(initialPlayback(), {
    type: "START",
    mode: "run",
  });
  for (let i = 0; i < 256 * 6; i++)
    state = playbackReducer(state, { type: "TICK" });
  expect(state.mode).toBe("idle");
  expect(state.cpu.instructions).toBe(256);
  expect(state.notice).toMatch(/256/);
  expect(state.trace.length).toBeLessThanOrEqual(80);
});
it("pause preserves intermediate microcycles", () => {
  let state = playbackReducer(initialPlayback(), {
    type: "START",
    mode: "run",
  });
  state = playbackReducer(state, { type: "TICK" });
  state = playbackReducer(state, { type: "PAUSE" });
  expect(state.cpu.phase).toBe(1);
  expect(state.mode).toBe("idle");
});
