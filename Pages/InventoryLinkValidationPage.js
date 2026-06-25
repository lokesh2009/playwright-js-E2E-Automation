const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../tests/test-results/link-validation-screenshots');
const REPORT_PATH = path.join(__dirname, '../tests/test-results/inventory-link-validation-report.html');

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
   * Validate a single link via HTTP GET.
   * @param {import('@playwright/test').APIRequestContext} apiCtx
   * @param {string} link
   * @returns {{ link, status, pass, screenshotFile }}
   */
  async validateLink(apiCtx, link) {
    let status;
    let pass;
    let screenshotFile = null;

    try {
      const response = await apiCtx.get(link, { timeout: 15000 });
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
   * Validate all links and return aggregated results.
   * @param {import('@playwright/test').APIRequestContext} apiCtx
   * @param {string[]} links
   * @returns {{ results, passCount, failCount }}
   */
  async validateAllLinks(apiCtx, links) {
    const results = [];
    let passCount = 0;
    let failCount = 0;

    for (const link of links) {
      const result = await this.validateLink(apiCtx, link);
      results.push(result);
      result.pass ? passCount++ : failCount++;
    }

    console.log(
      `\n📊 Results for ${this.siteUrl}: ${passCount} passed, ${failCount} failed`
    );
    return { results, passCount, failCount };
  }

  /**
   * Generate (or append to) an HTML pass/fail report.
   */
  generateReport(results, passCount, failCount) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const total = results.length;
    const passRate = total ? ((passCount / total) * 100).toFixed(1) : '0.0';

    const rows = results
      .map(r => {
        const badge = r.pass ? '✅ PASS' : '❌ FAIL';
        const screenshot = r.screenshotFile
          ? `<a href="${r.screenshotFile}" target="_blank">screenshot</a>`
          : '—';
        return `
        <tr class="${r.pass ? 'pass' : 'fail'}">
          <td><a href="${r.link}" target="_blank">${r.link}</a></td>
          <td>${r.status}</td>
          <td>${badge}</td>
          <td>${screenshot}</td>
        </tr>`;
      })
      .join('');

    const sectionHtml = `
<section>
  <h2>Site: <a href="${this.inventoryUrl}" target="_blank">${this.inventoryUrl}</a></h2>
  <p class="meta">Run at: ${timestamp}</p>
  <div class="summary">
    <span class="total">Total: ${total}</span>
    <span class="pass-count">Pass: ${passCount}</span>
    <span class="fail-count">Fail: ${failCount}</span>
    <span class="rate">Pass rate: ${passRate}%</span>
  </div>
  <table>
    <thead>
      <tr><th>Link URL</th><th>HTTP Status</th><th>Result</th><th>Screenshot</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</section>`;

    let html;
    if (fs.existsSync(REPORT_PATH)) {
      html = fs.readFileSync(REPORT_PATH, 'utf8').replace('</body>', `${sectionHtml}</body>`);
    } else {
      html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Inventory Link Validation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #333; }
    h2 { color: #444; margin-top: 40px; }
    section { background: #fff; border-radius: 8px; padding: 20px; margin-bottom: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .meta { color: #888; font-size: 0.9em; }
    .summary { display: flex; gap: 20px; margin: 10px 0 16px; font-weight: bold; }
    .total { color: #555; }
    .pass-count { color: #27ae60; }
    .fail-count { color: #e74c3c; }
    .rate { color: #2980b9; }
    table { border-collapse: collapse; width: 100%; font-size: 0.88em; }
    th { background: #34495e; color: #fff; padding: 8px 12px; text-align: left; }
    td { padding: 6px 12px; border-bottom: 1px solid #ddd; word-break: break-all; }
    tr.pass { background: #eafaf1; }
    tr.fail { background: #fdedec; }
    tr:hover { filter: brightness(0.97); }
    a { color: #2980b9; }
  </style>
</head>
<body>
  <h1>🔗 Inventory Link Validation Report</h1>
  ${sectionHtml}
</body>
</html>`;
    }

    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, html, 'utf8');
    console.log(`📄 Report saved to: ${REPORT_PATH}`);
    return REPORT_PATH;
  }
}

module.exports = InventoryLinkValidationPage;
