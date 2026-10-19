import { expect, test } from "@playwright/test";
test("manifest, service worker, sanitized offline data and offline page are available", async ({ page, request, context }) => {
  const manifest = await request.get("/manifest.webmanifest"); expect(manifest.ok()).toBe(true); const body = await manifest.json(); expect(body.display).toBe("standalone"); expect(body.icons).toHaveLength(3);
  await page.goto("/"); await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.evaluate(() => fetch("/api/portal/vehicles?q=UY8280").then((response) => response.json()));
  await context.setOffline(true);
  const offline = await page.evaluate(async () => { const response = await fetch("/api/portal/vehicles?q=UY8280"); return { marker: response.headers.get("x-portal-offline-cache"), cachedAt: response.headers.get("x-portal-cached-at"), body: await response.json() }; });
  expect(offline.marker).toBe("true"); expect(offline.cachedAt).toBeTruthy(); expect(offline.body.vehicles[0].plate).toBe("UY8280");
  await context.setOffline(false);
  await page.goto("/offline"); await expect(page.getByRole("heading", { name: "目前離線" })).toBeVisible();
});
