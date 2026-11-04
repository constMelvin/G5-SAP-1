import { describe, expect, it } from "vitest";
import { parseCell, parseProgram, instructionTemplate } from "./program";
describe("program input", () => {
  it.each([
    ["LDA 9H", 9],
    ["add ah", 0x1a],
    ["SUB 0xB", 0x2b],
    ["OUT", 0xef],
    ["HLT", 0xff],
    ["25H", 0x25],
    ["0xFF", 255],
    ["0000 0111", 7],
    ["0b10101010", 170],
    ["", 0],
  ])("parses %s", (text, value) => expect(parseCell(text)).toBe(value));
  it.each([
    "LDA 10H",
    "ADD",
    "OUT 9",
    "100H",
    "256",
    "banana",
    "000000001",
    "-1",
    "SUB GH",
  ])("rejects invalid input %s", (text) =>
    expect(() => parseCell(text)).toThrow(),
  );
  it("reports the memory address without mutating cells", () => {
    const cells = Array(16).fill("00");
    cells[9] = "invalid";
    expect(() => parseProgram(cells)).toThrow(/09/);
    expect(cells[9]).toBe("invalid");
  });
  it("requires 16 rows", () => expect(() => parseProgram(["00"])).toThrow());
  it("supplies instructions with the default hexadecimal operands", () => {
    const cells = instructionTemplate();
    expect(cells.slice(0, 5)).toEqual([
      "LDA 9H",
      "ADD AH",
      "SUB BH",
      "OUT",
      "HLT",
    ]);
    expect(cells.slice(9, 12)).toEqual(["25H", "05H", "23H"]);
    expect(parseProgram(cells).slice(9, 12)).toEqual([0x25, 0x05, 0x23]);
  });
});
