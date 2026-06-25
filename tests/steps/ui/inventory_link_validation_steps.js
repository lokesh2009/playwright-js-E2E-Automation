const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium, request } = require('@playwright/test');
const InventoryLinkValidationPage = require('../../../Pages/InventoryLinkValidationPage');
const { generateLinkValidationReport } = require('../../../Utility/reportHelper');

// ── Lifecycle ────────────────────────────────────────────────────────────────

Before({ tags: '@Healthcheck' }, async function () {
  this.apiCtx = await request.newContext({ ignoreHTTPSErrors: true });
});

/**
 * After hook — runs automatically at the end of every @Healthcheck scenario.
 * Generates the HTML report from Utility/reportHelper without any manual step call.
 */
After({ tags: '@Healthcheck' }, async function () {
  // Generate report if validation results are available
  if (this.inventoryLinkPage && this.linkResults) {
    const { results, passCount, failCount } = this.linkResults;
    const reportPath = generateLinkValidationReport(
      this.inventoryLinkPage.inventoryUrl,
      results,
      passCount,
      failCount
    );
    this.attach(
      `Report generated: ${reportPath}`,
      'text/plain'
    );
  }

  // Cleanup
  if (this.apiCtx) await this.apiCtx.dispose();
  if (this.page)    await this.page.close().catch(() => {});
  if (this.context) await this.context.close().catch(() => {});
  if (this.browser) await this.browser.close().catch(() => {});
});

// ── Background ───────────────────────────────────────────────────────────────

Given('the QA site is reachable at {string}', async function (siteUrl) {
  const checker = new InventoryLinkValidationPage(null, null);
  const { reachable, status } = await checker.healthCheck(siteUrl, this.apiCtx);

  this.attach(
    `Health Check — ${siteUrl}\nStatus: ${status} | Reachable: ${reachable}`,
    'text/plain'
  );

  if (!reachable) {
    throw new Error(
      `🚨 Health check FAILED for ${siteUrl} — HTTP ${status}. Skipping link validation.`
    );
  }
});

// ── Scenario steps ────────────────────────────────────────────────────────────

Given('I navigate to the inventory page for {string}', async function (siteUrl) {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  });
  this.page = await this.context.newPage();

  this.inventoryLinkPage = new InventoryLinkValidationPage(this.page, this.context);
  await this.inventoryLinkPage.goto(siteUrl);
});

When('I extract all unique links from the page', async function () {
  this.uniqueLinks = await this.inventoryLinkPage.extractUniqueLinks();
});

// 10-minute timeout: large pages can have hundreds of links; batched concurrency
// keeps total time well under this but the guard is needed for very large sites.
Then('I validate each link and report failures with screenshots', { timeout: 10 * 60 * 1000 }, async function () {
  // Store results on `this` so the After hook can pick them up for report generation
  this.linkResults = await this.inventoryLinkPage.validateAllLinks(this.apiCtx, this.uniqueLinks);

  const { passCount, failCount } = this.linkResults;
  const total = this.uniqueLinks.length;

  this.attach(
    `Link Validation Summary\nSite: ${this.inventoryLinkPage.inventoryUrl}\n` +
      `Total: ${total} | Pass: ${passCount} | Fail: ${failCount}`,
    'text/plain'
  );
});
