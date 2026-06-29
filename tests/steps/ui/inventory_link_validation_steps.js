const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium, request } = require('@playwright/test');
const InventoryLinkValidationPage = require('../../../Pages/InventoryLinkValidationPage');
const { generateLinkValidationReport } = require('../../../Utility/reportHelper');

// ── Lifecycle ─────────────────────────────────────────────────────────────────

Before({ tags: '@Healthcheck' }, async function () {
  this.apiCtx = await request.newContext({ ignoreHTTPSErrors: true });
  this.inventoryLinkPage = null;
  this.linkResults = null;
  this.uniqueLinks = [];
});

/**
 * After hook — auto-generates the HTML report at the end of every @Healthcheck
 * scenario via Utility/reportHelper, then tears down browser and API context.
 */
After({ tags: '@Healthcheck' }, async function () {
  if (this.inventoryLinkPage && this.linkResults) {
    const { results, passCount, failCount } = this.linkResults;
    const reportPath = generateLinkValidationReport(
      this.inventoryLinkPage.inventoryUrl,
      results,
      passCount,
      failCount
    );
    this.attach(`Report generated: ${reportPath}`, 'text/plain');
  }

  if (this.apiCtx) await this.apiCtx.dispose().catch(() => {});
  if (this.page)    await this.page.close().catch(() => {});
  if (this.context) await this.context.close().catch(() => {});
  if (this.browser) await this.browser.close().catch(() => {});
});

// ── Health check ──────────────────────────────────────────────────────────────

Given('the QA site is reachable at {string}', async function (siteUrl) {
  // Health check runs as an inline scenario step (not Background) so that
  // <siteUrl> is correctly substituted from the Examples table.
  const checker = new InventoryLinkValidationPage(null, null);
  const { reachable, status } = await checker.healthCheck(siteUrl, this.apiCtx);

  this.attach(
    `Health Check — ${siteUrl}\nHTTP Status: ${status} | Reachable: ${reachable}`,
    'text/plain'
  );

  if (!reachable) {
    throw new Error(
      `🚨 Health check FAILED for ${siteUrl} — HTTP ${status}. Cannot proceed with link validation.`
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
  if (!this.inventoryLinkPage) {
    throw new Error(
      'inventoryLinkPage is not initialized — the "Given I navigate to the inventory page" step did not run or failed.'
    );
  }
  this.uniqueLinks = await this.inventoryLinkPage.extractUniqueLinks();
});

// 10-minute timeout: batched concurrency keeps runtime low but large sites
// with hundreds of links need headroom beyond Cucumber's 120s default.
Then('I validate each link and report failures with screenshots', { timeout: 10 * 60 * 1000 }, async function () {
  if (!this.inventoryLinkPage) {
    throw new Error(
      'inventoryLinkPage is not initialized — the "Given I navigate to the inventory page" step did not run or failed.'
    );
  }
  if (!this.uniqueLinks || this.uniqueLinks.length === 0) {
    throw new Error(
      'No links to validate — the "When I extract all unique links" step did not run or found zero links.'
    );
  }

  // Store results on this so the After hook can pick them up for report generation
  this.linkResults = await this.inventoryLinkPage.validateAllLinks(this.apiCtx, this.uniqueLinks);

  const { passCount, failCount } = this.linkResults;
  this.attach(
    `Link Validation Summary\nSite: ${this.inventoryLinkPage.inventoryUrl}\n` +
      `Total: ${this.uniqueLinks.length} | Pass: ${passCount} | Fail: ${failCount}`,
    'text/plain'
  );
});
