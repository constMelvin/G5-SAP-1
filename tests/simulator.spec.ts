import { test, expect } from "@playwright/test";
for (const [steps, result] of [
  [2, "2A"],
  [3, "07"],
] as const) {
  test(
    "ALU transfer shows captured result after " + steps + " instructions",
    async ({ page }) => {
      await loadSample(page);
      for (let count = 1; count <= steps; count++) {
        await page.getByRole("button", { name: "Step instruction" }).click();
        await expect(page.getByTestId("instruction-count")).toHaveText(
          String(count),
        );
      }
      await expect(
        page.getByTestId("register-ALU").locator(".register-value"),
      ).toHaveText(result + "H");
    },
  );
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
async function loadSample(
  page: import("@playwright/test").Page,
  a = "25H",
  b = "05H",
  c = "23H",
) {
  await page
    .getByRole("button", { name: "Insert instruction template" })
    .click();
  await page.getByRole("textbox", { name: "Memory 09" }).fill(a);
  await page.getByRole("textbox", { name: "Memory 0A" }).fill(b);
  await page.getByRole("textbox", { name: "Memory 0B" }).fill(c);
  await page.getByRole("button", { name: "Load program", exact: true }).click();
  await page.getByLabel("Clock speed").fill("20");
}
test("user-entered sample runs to HLT and lights three LEDs", async ({
  page,
}) => {
  await loadSample(page);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("cpu-status")).toHaveText("Halted");
  await expect(page.getByTestId("output-hex")).toHaveText("07");
  await expect(page.locator(".led.on")).toHaveCount(3);
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
});
test("Step executes one instruction and Reset restores loaded RAM", async ({
  page,
}) => {
  await loadSample(page);
  await page.getByRole("button", { name: "Step instruction" }).click();
  await expect(page.getByTestId("instruction-count")).toHaveText("1");
  await expect(page.getByTestId("register-A")).toContainText("25");
  await expect(page.getByTestId("register-PC")).toContainText("1");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByTestId("instruction-count")).toHaveText("0");
  await expect(page.getByTestId("register-A")).toContainText("00");
});
test("invalid draft never overwrites loaded program", async ({ page }) => {
  await loadSample(page);
  await page.getByRole("textbox", { name: "Memory 09" }).fill("100H");
  await page.getByRole("button", { name: "Load program", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("09");
  await expect(page.getByTestId("loaded-09")).toHaveText("25");
});
test("reset cancels Run and leaves the machine at zero", async ({ page }) => {
  await loadSample(page);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await page.waitForTimeout(160);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId("cpu-status")).toHaveText("Ready");
  await expect(page.getByTestId("instruction-count")).toHaveText("0");
  await expect(page.getByTestId("register-PC")).toContainText("0");
});
test("mobile layout has no page-level horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: "SAP-1 Workbench." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
test("alternative operands produce a different real result", async ({
  page,
}) => {
  await loadSample(page, "12H", "08H", "05H");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("cpu-status")).toHaveText("Halted");
  await expect(page.getByTestId("output-hex")).toHaveText("15");
});
