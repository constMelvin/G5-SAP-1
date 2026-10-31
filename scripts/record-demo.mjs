import { chromium } from "@playwright/test";
import { mkdir, rename } from "node:fs/promises";
await mkdir("docs/demo", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  recordVideo: {
    dir: "docs/demo/.recording",
    size: { width: 1440, height: 1100 },
  },
});
const page = await context.newPage();
const video = page.video();
try {
  await page.goto("http://127.0.0.1:5173");
  await page
    .getByRole("button", { name: "Insert instruction template" })
    .click();
  await page.getByLabel("Clock speed").fill("8");
  for (const values of [
    ["25H", "05H", "23H", "07"],
    ["12H", "08H", "05H", "15"],
    ["40H", "10H", "20H", "30"],
  ]) {
    for (const [index, address] of ["09", "0A", "0B"].entries()) {
      const input = page.getByRole("textbox", { name: "Memory " + address });
      await input.fill("");
      await input.pressSequentially(values[index], { delay: 160 });
    }
    await page
      .getByRole("button", { name: "Load program", exact: true })
      .click();
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await page
      .getByTestId("cpu-status")
      .filter({ hasText: "Halted" })
      .waitFor();
    const result = await page.getByTestId("output-hex").textContent();
    if (result !== values[3]) throw new Error("Unexpected output: " + result);
    await page.waitForTimeout(2400);
  }
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.waitForTimeout(1000);
} finally {
  await context.close();
  await browser.close();
}
await rename(await video.path(), "docs/demo/three-calculations.webm");
console.log("Recorded docs/demo/three-calculations.webm");
