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

module.exports = { generateLinkValidationReport, REPORT_PATH };
