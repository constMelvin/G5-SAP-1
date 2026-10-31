const operation: Record<string, number> = { LDA: 0, ADD: 1, SUB: 2 };
export function parseCell(text: string): number {
  const input = text.trim().toUpperCase();
  if (!input) return 0;
  if (input === "OUT") return 0xef;
  if (input === "HLT") return 0xff;
  const instruction = /^(LDA|ADD|SUB)\s+(?:0X)?([0-9A-F])H?$/.exec(input);
  if (instruction)
    return (operation[instruction[1]] << 4) | parseInt(instruction[2], 16);
  if (/^(?:0B)?[01]{8}$/.test(input))
    return parseInt(input.replace(/^0B/, ""), 2);
  if (/^[01]{4}\s+[01]{4}$/.test(input))
    return parseInt(input.replace(/\s/g, ""), 2);
  if (/^(?:0X)?[0-9A-F]{1,2}H?$/.test(input))
    return parseInt(input.replace(/^0X/, "").replace(/H$/, ""), 16);
  throw new Error(
    "Use LDA/ADD/SUB with address 0–F, OUT, HLT, a hex byte (00–FF), or 8 binary bits.",
  );
}
export function parseProgram(cells: string[]): number[] {
  if (cells.length !== 16)
    throw new Error("A program must contain 16 memory rows.");
  return cells.map((cell, address) => {
    try {
      return parseCell(cell);
    } catch (error) {
      throw new Error(
        "Address " +
          address.toString(16).toUpperCase().padStart(2, "0") +
          ": " +
          (error as Error).message,
      );
    }
  });
}
export function instructionTemplate(): string[] {
  const cells = Array<string>(16).fill("");
  cells.splice(0, 5, "LDA 9H", "ADD AH", "SUB BH", "OUT", "HLT");
  return cells;
}
