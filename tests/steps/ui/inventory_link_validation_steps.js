const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium, request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const INVENTORY_PATH = '/new-inventory/';
const SCREENSHOT_DIR = path.join(__dirname, '../../test-results/link-validation-screenshots');
const REPORT_PATH = path.join(__dirname, '../../test-results/inventory-link-validation-report.html');

// Per-scenario state stored on `this`
Given('I navigate to the inventory page for {string}', async function (siteUrl) {
  this.siteUrl = siteUrl;
  this.inventoryUrl = siteUrl.replace(/\/$/, '') + INVENTORY_PATH;
  this.linkResults = [];

  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  });
  this.page = await this.context.newPage();

  console.log(`\n🌐 Navigating to: ${this.inventoryUrl}`);
  try {
    await this.page.goto(this.inventoryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err) {
    console.warn(`⚠️  Page load issue for ${this.inventoryUrl}: ${err.message}`);
  }
});

When('I extract all unique links from the page', async function () {
  const rawLinks = await this.page.$$eval('a[href]', anchors =>
    anchors.map(a => a.href).filter(Boolean)
  );

  // Deduplicate and filter to http(s) links only
  this.uniqueLinks = [...new Set(rawLinks)].filter(href => /^https?:\/\//.test(href));
  console.log(`🔗 Found ${this.uniqueLinks.length} unique links on ${this.inventoryUrl}`);
});

Then('I validate each link and report failures with screenshots', async function () {
  const apiCtx = await request.newContext({ ignoreHTTPSErrors: true });
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const results = [];
  let passCount = 0;
  let failCount = 0;

  for (const link of this.uniqueLinks) {
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
      failCount++;
      // Take a screenshot of the source inventory page highlighting context
      const safeName = link.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);
      screenshotFile = path.join(SCREENSHOT_DIR, `FAIL_${safeName}.png`);
      try {
        await this.page.screenshot({ path: screenshotFile, fullPage: false });
      } catch (_) {
        screenshotFile = null;
      }
      console.log(`  ❌ FAIL [${status}] ${link}`);
    } else {
      passCount++;
      console.log(`  ✅ PASS [${status}] ${link}`);
    }

    results.push({ link, status, pass, screenshotFile });
  }

  await apiCtx.dispose();
  await this.page.close();
  await this.context.close();
  await this.browser.close();

  this.linkResults = results;

  // Generate HTML report
  generateReport(this.siteUrl, this.inventoryUrl, results, passCount, failCount);

  console.log(`\n📊 Results for ${this.siteUrl}: ${passCount} passed, ${failCount} failed`);
  console.log(`📄 Report saved to: ${REPORT_PATH}`);

  // Attach summary to Cucumber world for visibility
  this.attach(
    `Link Validation Summary\nSite: ${this.inventoryUrl}\nTotal: ${results.length} | Pass: ${passCount} | Fail: ${failCount}`,
    'text/plain'
  );
});

function generateReport(siteUrl, inventoryUrl, results, passCount, failCount) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const total = results.length;
  const passRate = total ? ((passCount / total) * 100).toFixed(1) : '0.0';

  const rows = results
    .map(r => {
      const statusClass = r.pass ? 'pass' : 'fail';
      const badge = r.pass ? '✅ PASS' : '❌ FAIL';
      const screenshot = r.screenshotFile
        ? `<a href="${r.screenshotFile}" target="_blank">screenshot</a>`
        : '—';
      return `
      <tr class="${statusClass}">
        <td><a href="${r.link}" target="_blank">${r.link}</a></td>
        <td>${r.status}</td>
        <td>${badge}</td>
        <td>${screenshot}</td>
      </tr>`;
    })
    .join('');

  // Append a section per site so multiple scenario runs accumulate in one file
  const sectionHtml = `
<section>
  <h2>Site: <a href="${inventoryUrl}" target="_blank">${inventoryUrl}</a></h2>
  <p class="meta">Run at: ${timestamp}</p>
  <div class="summary">
    <span class="total">Total: ${total}</span>
    <span class="pass-count">Pass: ${passCount}</span>
    <span class="fail-count">Fail: ${failCount}</span>
    <span class="rate">Pass rate: ${passRate}%</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Link URL</th>
        <th>HTTP Status</th>
        <th>Result</th>
        <th>Screenshot</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</section>
`;

  // Build full document only when creating the file fresh
  let html;
  if (fs.existsSync(REPORT_PATH)) {
    // Append new section before closing </body>
    const existing = fs.readFileSync(REPORT_PATH, 'utf8');
    html = existing.replace('</body>', `${sectionHtml}</body>`);
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
    section { background: #fff; border-radius: 8px; padding: 20px; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
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

  fs.writeFileSync(REPORT_PATH, html, 'utf8');
}
