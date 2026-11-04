import { chromium } from "@playwright/test";
import { mkdir, copyFile, unlink } from "node:fs/promises";
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
    ["0AH", "08H", "03H", "0F"],
    ["14H", "0AH", "05H", "19"],
  ]) {
    await page.getByRole("button", { name: values[3] === "0F" ? /Rose Pink/ : /Sky Blue/ }).click();
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
    const expectedBits = parseInt(values[3], 16).toString(2).padStart(8, "0");
    const litCount = await page.locator(".led.on").count();
    if (litCount !== [...expectedBits].filter(bit => bit === "1").length)
      throw new Error("LED count does not match output");
    await page.locator("#output").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1800);
    await page.getByRole("region", { name: "Live calculations" }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(2200);
    console.log(`Verified ${values.slice(0, 3).join(" +/− ")} → ${values[3]}H (${expectedBits})`);
    await page.getByRole("button", { name: /Sky Blue/ }).scrollIntoViewIfNeeded();
  }
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.waitForTimeout(1000);
} finally {
  await context.close();
  await browser.close();
}
const capturePath = await video.path();
await copyFile(capturePath, "docs/demo/three-calculations.webm");
await unlink(capturePath);
console.log("Recorded docs/demo/three-calculations.webm");
