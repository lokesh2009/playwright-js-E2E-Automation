const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium, request } = require('@playwright/test');
const InventoryLinkValidationPage = require('../../../Pages/InventoryLinkValidationPage');

// ── Lifecycle ────────────────────────────────────────────────────────────────

Before({ tags: '@Healthcheck' }, async function () {
  this.apiCtx = await request.newContext({ ignoreHTTPSErrors: true });
});

After({ tags: '@Healthcheck' }, async function () {
  if (this.apiCtx) await this.apiCtx.dispose();
  if (this.page)    await this.page.close().catch(() => {});
  if (this.context) await this.context.close().catch(() => {});
  if (this.browser) await this.browser.close().catch(() => {});
});

// ── Background ───────────────────────────────────────────────────────────────

Given('the QA site is reachable at {string}', async function (siteUrl) {
  // InventoryLinkValidationPage needs a page instance for goto(), but the
  // health check only uses the API context, so we pass null for page/context.
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

Then('I validate each link and report failures with screenshots', async function () {
  const { results, passCount, failCount } =
    await this.inventoryLinkPage.validateAllLinks(this.apiCtx, this.uniqueLinks);

  const reportPath = this.inventoryLinkPage.generateReport(results, passCount, failCount);
  const total = results.length;

  this.attach(
    `Link Validation Summary\nSite: ${this.inventoryLinkPage.inventoryUrl}\n` +
      `Total: ${total} | Pass: ${passCount} | Fail: ${failCount}\nReport: ${reportPath}`,
    'text/plain'
  );
});
