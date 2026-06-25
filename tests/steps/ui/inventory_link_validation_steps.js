const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium, request } = require('@playwright/test');
const InventoryLinkValidationPage = require('../../../Pages/InventoryLinkValidationPage');

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
  const apiCtx = await request.newContext({ ignoreHTTPSErrors: true });

  const { results, passCount, failCount } =
    await this.inventoryLinkPage.validateAllLinks(apiCtx, this.uniqueLinks);

  await apiCtx.dispose();
  await this.page.close();
  await this.context.close();
  await this.browser.close();

  const reportPath = this.inventoryLinkPage.generateReport(results, passCount, failCount);
  const total = results.length;

  this.attach(
    `Link Validation Summary\nSite: ${this.inventoryLinkPage.inventoryUrl}\n` +
      `Total: ${total} | Pass: ${passCount} | Fail: ${failCount}\nReport: ${reportPath}`,
    'text/plain'
  );
});
