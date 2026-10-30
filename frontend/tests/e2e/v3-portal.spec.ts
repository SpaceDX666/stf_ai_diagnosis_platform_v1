import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const workshopId = "11111111-1111-4111-8111-111111111111";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("用戶名稱").fill("manager");
  await page.getByLabel("密碼", { exact: true }).fill("valid-password");
  await page.getByRole("button", { name: "登入", exact: true }).click();
  await expect(page.getByRole("heading", { name: "我的工作坊" })).toBeVisible();
}

test("login, workshop pagination, search and vehicle detail work on this viewport", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await login(page);
  await page.getByRole("link", { name: /測試工作坊/ }).click();
  await expect(page).toHaveURL(new RegExp(`/workshops/${workshopId}$`));
  await expect(page.locator(".vehicle-card")).toHaveCount(50);
  await page.getByRole("button", { name: "下一頁" }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await page.getByPlaceholder("搜尋 VIN、車牌或暱稱").fill("STF-001");
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await page.getByRole("link", { name: /STF-001/ }).click();
  await expect(page).toHaveURL(/\/vehicles\/00000000-0000-4000-8000-000000000001$/);
  await expect(page.getByRole("heading", { level: 1, name: "測試車輛" })).toBeVisible();
  await expect(page.getByText("JHMGK5830HX202404")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("secret_internal");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("invalid login and sign-out show the correct state", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("用戶名稱").fill("manager");
  await page.getByLabel("密碼", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "登入", exact: true }).click();
  await expect(page.locator(".login-error")).toContainText("不正確");
  await page.getByLabel("密碼", { exact: true }).fill("valid-password");
  await page.getByRole("button", { name: "登入", exact: true }).click();
  await expect(page.getByRole("heading", { name: "我的工作坊" })).toBeVisible();
  let rejectedLogoutRequests = 0;
  await page.route("**/api/auth/logout", async (route) => { rejectedLogoutRequests += 1; await route.fulfill({ status: 503, body: "unavailable" }); });
  await page.getByRole("button", { name: "登出", exact: true }).click();
  await expect(page.locator(".logout-error")).toContainText("登出失敗");
  expect(rejectedLogoutRequests).toBe(1);
  await expect(page.getByRole("heading", { name: "我的工作坊" })).toBeVisible();
  await page.unroute("**/api/auth/logout");
  await page.getByRole("button", { name: "登出", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("old vehicle links return to the workshop entry and private responses are not cached", async ({ page, context }) => {
  await login(page);
  await context.addCookies([{ name: "portal_vehicle_context", value: "old-context", url: "http://127.0.0.1:3001/" }]);
  await page.goto("/vehicles/plate/STF-001");
  await expect(page).toHaveURL(/\/$/);
  expect((await context.cookies()).some((cookie) => cookie.name === "portal_vehicle_context")).toBe(false);
  await page.goto("/vehicles/vin/JHMGK5830HX202404/components/engine");
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("link", { name: /測試工作坊/ }).click();
  await expect(page.locator(".vehicle-card").first()).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  const cachedUrls = await page.evaluate(async () => (await Promise.all((await caches.keys()).map(async (name) => (await (await caches.open(name)).keys()).map((item) => item.url)))).flat());
  expect(cachedUrls.some((url) => url.includes("/api/portal/") || url.includes("/api/auth/"))).toBe(false);
  const offlineHtml = await page.evaluate(async () => (await (await caches.match("/offline.html"))?.text()) ?? "");
  expect(offlineHtml).toContain("目前離線");
  expect(offlineHtml).not.toContain("manager");
  expect(offlineHtml).not.toContain("JHMGK5830HX202404");
  await context.setOffline(true);
  await expect(page.getByRole("heading", { name: "目前離線" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("STF-001");
  await expect(page.locator("body")).not.toContainText("manager");
  await page.reload();
  await expect(page.getByRole("heading", { name: "目前離線" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("manager");
});
