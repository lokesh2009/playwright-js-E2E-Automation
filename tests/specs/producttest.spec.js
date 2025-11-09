// amazon.spec.js
const { test, expect } = require('@playwright/test');

test('Amazon search test', async ({ page }) => {
  // Navigate to Amazon India
  await page.goto('https://www.amazon.in');

  // Accept cookies if prompted (optional, depends on region)
  const acceptCookies = page.locator('input[name="accept"]');
  if (await acceptCookies.isVisible()) {
    await acceptCookies.click();
  }

  // Search for a product
  await page.fill('#twotabsearchtextbox', 'laptop');
  await page.click('input#nav-search-submit-button');

  // Wait for results and check that at least one result is visible
  const results = page.locator('.s-main-slot .s-result-item');
  await expect(results.first()).toBeVisible();
});

test("Search for a product and verify results", async ({ page }) => {
    const product = "Wireless Headphones";

    await logPagePerformance(page, "Before Search");

    await amazonPage.searchProduct(product);

    await logPagePerformance(page, "After Search");

    const resultVisible = await amazonPage.isResultDisplayed();
    expect(resultVisible).toBeTruthy();

    console.log(`✅ Product search for "${product}" successful`);
  });

test('Search product using baseURL from config', async ({ page }, testInfo) => {
  // Read baseURL from config
  const baseURL = testInfo.config.use.baseURL;
  console.log('Base URL from Config:', baseURL);

  // Use it in your test
  await page.goto(baseURL);
  await page.fill('#twotabsearchtextbox', 'Laptop');
  await page.press('#twotabsearchtextbox', 'Enter');

  // Assertion example
  await expect(page).toHaveTitle(/Laptop/i);
});

