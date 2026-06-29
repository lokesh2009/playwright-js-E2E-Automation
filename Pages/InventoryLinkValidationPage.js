const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../tests/test-results/link-validation-screenshots');

class InventoryLinkValidationPage {
  constructor(page, context) {
    this.page = page;
    this.context = context;

    // Selector for all anchor elements on the page
    this.linkSelector = 'a[href]';
  }

  /**
   * Health check — verify the base site responds with HTTP < 400.
   * Returns { reachable: bool, status: number|string }.
   */
  async healthCheck(siteUrl, apiCtx) {
    const url = siteUrl.replace(/\/$/, '') + '/';
    console.log(`\n🏥 Health check: ${url}`);
    try {
      const response = await apiCtx.get(url, { timeout: 15000 });
      const status = response.status();
      const reachable = status < 400;
      console.log(reachable ? `  ✅ Site reachable [${status}]` : `  ❌ Site unreachable [${status}]`);
      return { reachable, status };
    } catch (err) {
      console.error(`  ❌ Health check failed: ${err.message}`);
      return { reachable: false, status: err.message };
    }
  }

  /**
   * Navigate to the New Inventory path on the given site.
   */
  async goto(siteUrl) {
    this.siteUrl = siteUrl;
    this.inventoryUrl = siteUrl.replace(/\/$/, '') + '/new-inventory/';
    console.log(`\n🌐 Navigating to: ${this.inventoryUrl}`);
    try {
      await this.page.goto(this.inventoryUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
    } catch (err) {
      console.warn(`⚠️  Page load issue for ${this.inventoryUrl}: ${err.message}`);
    }
    return this.inventoryUrl;
  }

  /**
   * Extract all unique http/https links from the current page.
   * @returns {string[]} deduplicated list of absolute URLs
   */
  async extractUniqueLinks() {
    const rawLinks = await this.page.$$eval(this.linkSelector, anchors =>
      anchors.map(a => a.href).filter(Boolean)
    );
    const unique = [...new Set(rawLinks)].filter(href => /^https?:\/\//.test(href));
    console.log(`🔗 Found ${unique.length} unique links on ${this.inventoryUrl}`);
    return unique;
  }

  /**
   * Validate a single link via HTTP GET (8 s timeout to keep batches fast).
   * Screenshots are taken on the source inventory page for failed links.
   * @param {import('@playwright/test').APIRequestContext} apiCtx
   * @param {string} link
   * @returns {{ link, status, pass, screenshotFile }}
   */
  async validateLink(apiCtx, link) {
    let status;
    let pass;
    let screenshotFile = null;

    try {
      const response = await apiCtx.get(link, { timeout: 8000 });
      status = response.status();
      pass = status < 400;
    } catch (err) {
      status = err.message;
      pass = false;
    }

    if (!pass) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
      const safeName = link.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);
      screenshotFile = path.join(SCREENSHOT_DIR, `FAIL_${safeName}.png`);
      try {
        await this.page.screenshot({ path: screenshotFile, fullPage: false });
      } catch (_) {
        screenshotFile = null;
      }
      console.log(`  ❌ FAIL [${status}] ${link}`);
    } else {
      console.log(`  ✅ PASS [${status}] ${link}`);
    }

    return { link, status, pass, screenshotFile };
  }

  /**
   * Validate all links concurrently in batches to avoid Cucumber step timeouts.
   * CONCURRENCY controls how many HTTP requests run in parallel per batch.
   * Report generation is handled automatically by the After hook via reportHelper.
   * @param {import('@playwright/test').APIRequestContext} apiCtx
   * @param {string[]} links
   * @param {number} [concurrency=10]
   * @returns {{ results, passCount, failCount }}
   */
  async validateAllLinks(apiCtx, links, concurrency = 10) {
    const results = [];
    let passCount = 0;
    let failCount = 0;

    // Process in fixed-size batches — all links in one batch run in parallel
    for (let i = 0; i < links.length; i += concurrency) {
      const batch = links.slice(i, i + concurrency);
      console.log(
        `\n⚡ Validating links ${i + 1}–${Math.min(i + concurrency, links.length)} of ${links.length}`
      );

      const batchResults = await Promise.all(
        batch.map(link => this.validateLink(apiCtx, link))
      );

      for (const result of batchResults) {
        results.push(result);
        result.pass ? passCount++ : failCount++;
      }
    }

    console.log(
      `\n📊 Results for ${this.siteUrl}: ${passCount} passed, ${failCount} failed`
    );
    return { results, passCount, failCount };
  }
}

module.exports = InventoryLinkValidationPage;
