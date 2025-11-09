// tests/lighthouse.spec.js

const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const fs = require('fs');

test('Run Lighthouse audit and show report', async () => {
  const url = 'https://heavy-trucks-v6-simple.qa.dsp.leadventure.dev/inventory/v1/Current/Genesis-Attachments'; // Replace with your actual site
  const outputPath = './lighthouse-report.html';

  try {
    execSync(`npx lighthouse ${url} --output html --output-path ${outputPath} --chrome-flags="--headless"`, { stdio: 'inherit' });
    console.log(`✅ Lighthouse report generated at ${outputPath}`);
    expect(fs.existsSync(outputPath)).toBeTruthy();
  } catch (error) {
    console.error('Lighthouse audit failed:', error);
    throw error;
  }
});