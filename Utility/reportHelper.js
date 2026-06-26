const fs = require('fs');
const path = require('path');

const REPORT_PATH = path.join(__dirname, '../tests/test-results/inventory-link-validation-report.html');

/**
 * Generate (or append to) an HTML pass/fail report for inventory link validation.
 * Called automatically from the @Healthcheck After hook — no manual invocation needed.
 *
 * @param {string} inventoryUrl  - The page that was scanned
 * @param {{ link: string, status: number|string, pass: boolean, screenshotFile: string|null }[]} results
 * @param {number} passCount
 * @param {number} failCount
 * @returns {string} Absolute path to the written report file
 */
function generateLinkValidationReport(inventoryUrl, results, passCount, failCount) {
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
      <tr><th>Link URL</th><th>HTTP Status</th><th>Result</th><th>Screenshot</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</section>`;

  let html;
  if (fs.existsSync(REPORT_PATH)) {
    // Append new site section before closing </body> tag
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

// ── Lighthouse report ─────────────────────────────────────────────────────────

const LH_REPORT_DIR = path.join(__dirname, '../tests/test-results/lighthouse');

/**
 * Generate an HTML summary report for a Lighthouse audit.
 * The full Lighthouse HTML report is saved alongside as <safe-name>-full.html.
 * Called automatically from the @lighthouse After hook — no manual call needed.
 *
 * @param {string} url            - Audited URL
 * @param {object} lhJson         - Parsed Lighthouse JSON result
 * @param {string} [lhHtml]       - Raw Lighthouse HTML report string (optional)
 * @returns {string} Path to the written summary report
 */
function generateLighthouseReport(url, lhJson, lhHtml) {
  fs.mkdirSync(LH_REPORT_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const safeName = url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 60);

  // Save the full Lighthouse HTML report if provided
  let fullReportPath = null;
  if (lhHtml) {
    fullReportPath = path.join(LH_REPORT_DIR, `${safeName}-full.html`);
    fs.writeFileSync(fullReportPath, lhHtml, 'utf8');
  }

  // Extract category scores (0–1 → 0–100)
  const categories = lhJson.categories || {};
  const scoreRow = cat => {
    const c = categories[cat];
    if (!c) return '';
    const pct = Math.round((c.score || 0) * 100);
    const cls = pct >= 90 ? 'good' : pct >= 50 ? 'average' : 'poor';
    return `<tr><td>${c.title}</td><td class="score ${cls}">${pct}</td></tr>`;
  };

  const summaryTable = `
    <table class="scores">
      <thead><tr><th>Category</th><th>Score</th></tr></thead>
      <tbody>
        ${scoreRow('performance')}
        ${scoreRow('accessibility')}
        ${scoreRow('best-practices')}
        ${scoreRow('seo')}
      </tbody>
    </table>`;

  const fullReportLink = fullReportPath
    ? `<p><a href="${fullReportPath}" target="_blank">📄 Open full Lighthouse report</a></p>`
    : '';

  const sectionHtml = `
<section>
  <h2>Audit: <a href="${url}" target="_blank">${url}</a></h2>
  <p class="meta">Run at: ${timestamp}</p>
  ${summaryTable}
  ${fullReportLink}
</section>`;

  const summaryPath = path.join(LH_REPORT_DIR, 'lighthouse-summary.html');
  let html;
  if (fs.existsSync(summaryPath)) {
    html = fs.readFileSync(summaryPath, 'utf8').replace('</body>', `${sectionHtml}</body>`);
  } else {
    html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Lighthouse Audit Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #333; }
    h2 { color: #444; margin-top: 40px; }
    section { background: #fff; border-radius: 8px; padding: 20px; margin-bottom: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .meta { color: #888; font-size: 0.9em; }
    table.scores { border-collapse: collapse; width: 320px; margin: 12px 0; }
    table.scores th { background: #34495e; color: #fff; padding: 8px 16px; text-align: left; }
    table.scores td { padding: 8px 16px; border-bottom: 1px solid #ddd; font-size: 0.95em; }
    .score { font-weight: bold; text-align: center; }
    .good   { color: #27ae60; }
    .average { color: #f39c12; }
    .poor   { color: #e74c3c; }
    a { color: #2980b9; }
  </style>
</head>
<body>
  <h1>🔦 Lighthouse Audit Report</h1>
  ${sectionHtml}
</body>
</html>`;
  }

  fs.writeFileSync(summaryPath, html, 'utf8');
  console.log(`📄 Lighthouse summary saved to: ${summaryPath}`);
  return summaryPath;
}

module.exports = { generateLinkValidationReport, generateLighthouseReport, REPORT_PATH, LH_REPORT_DIR };
