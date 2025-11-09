// src/tests/uiTest.spec.js
import { test, expect } from "@playwright/test";

test.describe("Amazon Product Search UI Test", () => {
  test("Search for a product on Amazon", async ({ page }) => {
    await page.goto("https://www.amazon.in/");

    const searchBox = page.locator("#twotabsearchtextbox");
    const searchButton = page.locator("#nav-search-submit-button");

    await searchBox.fill("Wireless Headphones");
    await searchButton.click();

    const results = page.locator("div[data-component-type='s-search-result']");
    await expect(results.first()).toBeVisible();

    // ✅ Optional: log performance timing
    const metrics = await page.evaluate(() => JSON.stringify(window.performance.timing));
    const perf = JSON.parse(metrics);
    const loadTime = perf.loadEventEnd - perf.navigationStart;
    console.log(` Page Load Time: ${loadTime} ms`);
  });
});
