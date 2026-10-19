import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("anonymous vehicle directory supports search and future VIN identity", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /車輛資料|车辆数据/ })).toBeVisible();
  await expect(page.getByText("UY8280", { exact: true })).toBeVisible();
  const vinLink = page.locator("article").filter({ hasText: "AB1234" }).getByRole("link");
  await expect(vinLink).toHaveAttribute("href", "/vehicles/vin/JHMCM56557C404453");
  await page.getByPlaceholder(/搜尋車牌|搜索车牌/).fill("TOYOTA");
  await expect(page.getByText("UY8280", { exact: true })).toBeVisible();
  await expect(page.getByText("AB1234", { exact: true })).toBeHidden();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(await page.evaluate(() => document.cookie)).not.toMatch(/portal_auth|portal_vehicle|portal_idle|jwt/i);
  await expect(page).toHaveScreenshot(`directory-${testInfo.project.name}.png`, { fullPage: true, animations: "disabled" });
});

test("plate route shows pending VIN, dynamic BOM and real historical events", async ({ page }, testInfo) => {
  await page.goto("/vehicles/plate/UY8280");
  await expect(page.getByRole("heading", { name: "TOYOTA COASTER" })).toBeVisible();
  await expect(page.getByText(/尚未提供 VIN|尚未提供 VIN/)).toBeVisible();
  if (testInfo.project.name.startsWith("mobile") || testInfo.project.name.startsWith("tablet")) await page.getByRole("button", { name: /開啟部件樹|打开部件树/ }).click();
  const systemNode = page.getByRole("treeitem", { name: /引擎系統/ });
  const componentNode = page.getByRole("treeitem", { name: /燃油濾清器/ });
  await expect(systemNode).toHaveCSS("--tree-indent", "0em");
  await expect(componentNode).toHaveCSS("--tree-indent", "2em");
  await componentNode.getByRole("button").press("ArrowRight");
  await expect(page.getByRole("treeitem", { name: /燃油噴射器/ })).toHaveCSS("--tree-indent", "4em");
  await componentNode.getByRole("button").click();
  if (testInfo.project.name.startsWith("mobile") || testInfo.project.name.startsWith("tablet")) await page.keyboard.press("Escape");
  await expect(page.getByText("歷史檢查記錄")).toBeVisible();
  await expect(page.getByRole("link", { name: /部件詳情|部件详情/ })).toBeVisible();
  await expect(page).toHaveScreenshot(`vehicle-${testInfo.project.name}.png`, { fullPage: true, animations: "disabled" });
});

test("component detail exposes cleaned lifecycle data", async ({ page }) => {
  await page.goto("/vehicles/plate/UY8280/components/CMP-FILTER?returnScope=CMP-FILTER");
  await expect(page.getByRole("heading", { name: "燃油濾清器" })).toBeVisible();
  await expect(page.getByText("WO-1001", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("hidden.xlsx")).toHaveCount(0);
  await expect(page.getByText(/installed → removed/)).toBeVisible();
});

for (const oldPath of ["/login", "/register", "/reset-password", "/verify-vehicle"]) {
  test(`${oldPath} no longer exists`, async ({ request }) => { expect((await request.get(oldPath)).status()).toBe(404); });
}

test("security headers are present on the public portal", async ({ request }) => { const response = await request.get("/"); expect(response.headers()["x-frame-options"]).toBe("DENY"); expect(response.headers()["x-content-type-options"]).toBe("nosniff"); expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow"); expect(response.headers()["content-security-policy"]).toContain("worker-src 'self'"); });
