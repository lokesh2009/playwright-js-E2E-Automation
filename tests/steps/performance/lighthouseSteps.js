const { Given, Then, Before, After } = require('@cucumber/cucumber');
const { generateLighthouseReport } = require('../../../Utility/reportHelper');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// ── Lifecycle ─────────────────────────────────────────────────────────────────

Before({ tags: '@lighthouse' }, async function () {
  this.lhUrl = null;
  this.lhJson = null;
  this.lhHtml = null;
});

/**
 * After hook — auto-generates the Lighthouse summary and full HTML report
 * via Utility/reportHelper at the end of every @lighthouse scenario.
 */
After({ tags: '@lighthouse' }, async function () {
  if (this.lhJson && this.lhUrl) {
    const reportPath = generateLighthouseReport(this.lhUrl, this.lhJson, this.lhHtml);
    this.attach(`Lighthouse report generated: ${reportPath}`, 'text/plain');
  }
});

// ── Steps ─────────────────────────────────────────────────────────────────────

Given('I run Lighthouse on {string}', { timeout: 3 * 60 * 1000 }, async function (url) {
  this.lhUrl = url;

  // Dynamic require so Lighthouse (ESM in v10+) is loaded at runtime only
  let lighthouse, chromeLauncher;
  try {
    ({ default: lighthouse } = await import('lighthouse'));
    chromeLauncher = await import('chrome-launcher');
  } catch (err) {
    throw new Error(
      `Failed to load Lighthouse or chrome-launcher: ${err.message}\n` +
        'Run: npm install lighthouse chrome-launcher'
    );
  }

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: ['json', 'html'],
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });

    // result.report is [jsonString, htmlString] when two outputs are requested
    const [jsonStr, htmlStr] = Array.isArray(result.report)
      ? result.report
      : [result.report, null];

    this.lhJson = JSON.parse(jsonStr);
    this.lhHtml = htmlStr;

    const perfScore = Math.round((this.lhJson.categories.performance?.score || 0) * 100);
    console.log(`\n🔦 Lighthouse audit complete for: ${url}`);
    console.log(`   Performance   : ${perfScore}`);
    console.log(`   Accessibility : ${Math.round((this.lhJson.categories.accessibility?.score || 0) * 100)}`);
    console.log(`   Best Practices: ${Math.round((this.lhJson.categories['best-practices']?.score || 0) * 100)}`);
    console.log(`   SEO           : ${Math.round((this.lhJson.categories.seo?.score || 0) * 100)}`);
  } finally {
    await chrome.kill();
  }
});

Then('I should get a performance score above {int}', function (expectedScore) {
  if (!this.lhJson) {
    throw new Error('No Lighthouse results found — the "Given I run Lighthouse" step did not complete successfully.');
  }

  const score = Math.round((this.lhJson.categories.performance?.score || 0) * 100);

  this.attach(
    `Performance Score: ${score} / 100  (threshold: ${expectedScore})`,
    'text/plain'
  );

  if (score < expectedScore) {
    throw new Error(
      `❌ Performance score ${score} is below the expected threshold of ${expectedScore}`
    );
  }

  console.log(`✅ Performance score ${score} meets the threshold of ${expectedScore}`);
});
