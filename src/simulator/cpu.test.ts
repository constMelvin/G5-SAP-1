import { describe, expect, it } from "vitest";
import { createCpu, tick, stepInstruction } from "./cpu";
function image(a = 0x25, b = 5, c = 0x23) {
  const ram = Array(16).fill(0);
  ram.splice(0, 5, 0x09, 0x1a, 0x2b, 0xef, 0xff);
  ram[9] = a;
  ram[10] = b;
  ram[11] = c;
  return ram;
}
describe("SAP-1 architecture", () => {
  it("fetches through MAR and IR and increments the PC", () => {
    const initial = createCpu(image());
    const t1 = tick(initial);
    expect(t1.mar).toBe(0);
    expect(t1.phase).toBe(1);
    expect(t1.signals).toEqual(["EP", "LM"]);
    const t2 = tick(t1);
    expect(t2.pc).toBe(1);
    const t3 = tick(t2);
    expect(t3.ir).toBe(9);
    expect(t3.signals).toEqual(["CE", "LI"]);
    expect(initial.pc).toBe(0);
  });
  it.each([
    [0x25, 5, 0x23, 7],
    [0x12, 8, 5, 0x15],
    [0x40, 0x10, 0x20, 0x30],
  ])("computes user operands %i + %i - %i", (a, b, c, result) => {
    let cpu = createCpu(image(a, b, c));
    for (let i = 0; i < 5; i++) cpu = stepInstruction(cpu);
    expect(cpu.out).toBe(result);
    expect(cpu.halted).toBe(true);
    expect(cpu.instructions).toBe(5);
  });
  it("Step completes exactly one instruction", () => {
    const cpu = stepInstruction(createCpu(image()));
    expect(cpu.a).toBe(0x25);
    expect(cpu.pc).toBe(1);
    expect(cpu.instructions).toBe(1);
    expect(cpu.phase).toBe(6);
  });
  it("continues a partially fetched instruction", () => {
    const cpu = stepInstruction(tick(createCpu(image())));
    expect(cpu.instructions).toBe(1);
    expect(cpu.pc).toBe(1);
  });
  it("wraps overflow and two's complement underflow", () => {
    let cpu = stepInstruction(createCpu(image(255, 2, 4)));
    cpu = stepInstruction(cpu);
    expect(cpu.a).toBe(1);
    cpu = stepInstruction(cpu);
    expect(cpu.a).toBe(253);
  });
  it("halts without subsequent mutations", () => {
    const ram = image();
    ram[0] = 0xf0;
    const cpu = stepInstruction(createCpu(ram));
    expect(cpu.halted).toBe(true);
    expect(tick(cpu)).toBe(cpu);
  });
  it("accepts OUT with any operand nibble", () => {
    const ram = image();
    ram[1] = 0xe0;
    let cpu = stepInstruction(createCpu(ram));
    cpu = stepInstruction(cpu);
    expect(cpu.out).toBe(0x25);
  });
  it("stops on an unsupported opcode", () => {
    const ram = image();
    ram[0] = 0x30;
    const cpu = stepInstruction(createCpu(ram));
    expect(cpu.error).toMatch(/opcode/i);
    expect(cpu.halted).toBe(true);
  });
  it("wraps the four-bit PC", () => {
    const cpu = createCpu(image());
    cpu.pc = 15;
    expect(tick(tick(cpu)).pc).toBe(0);
  });
  it("validates RAM size and byte values", () => {
    expect(() => createCpu([1])).toThrow();
    expect(() => createCpu(Array(16).fill(256))).toThrow();
  });
  it("does not mutate the supplied memory image", () => {
    const ram = image();
    const cpu = createCpu(ram);
    ram[0] = 255;
    expect(cpu.ram[0]).toBe(9);
  });
});
