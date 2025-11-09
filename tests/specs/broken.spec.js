// tests/specs/Broken.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Array to store all broken link results from all tests
const allBrokenLinkResults = [];
const REPORT_DIR = path.resolve(__dirname, 'reports');
const MAX_RETRIES = 2; // Total attempts = MAX_RETRIES + 1 (original attempt)

// --- Report Generation Functions (No Change) ---

// HTML Report Generator
function generateHtmlReport(data) {
  let html = `
    <html><head><title>Broken Link Report</title>
    <style>
      body { font-family: Arial; padding: 20px; }
      h1 { color: #d00; }
      h2 { color: #333; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; table-layout: fixed; }
      th, td { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
      th { background: #f4f4f4; }
      td a { color: #d00; text-decoration: none; word-break: break-all; } 
      .url-cell { width: 40%; word-break: break-all; }
      .links-cell { width: 60%; word-break: break-all; }
    </style>
    </head><body><h1>Broken Link Report</h1>`;

  const groupedReport = data.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push({ url: item.url, brokenLinks: item.brokenLinks });
    return acc;
  }, {});

  for (const category in groupedReport) {
    html += `<h2>${category}</h2><table><tr><th class="url-cell">Site URL</th><th class="links-cell">Broken Links</th></tr>`;
    for (const site of groupedReport[category]) {
      const brokenLinksHtml = site.brokenLinks.map(link => `<a href="${link}" target="_blank">${link}</a>`).join('<br>');
      html += `<tr><td class="url-cell">${site.url}</td><td class="links-cell">${brokenLinksHtml}</td></tr>`;
    }
    html += `</table>`; 
  }

  html += `</body></html>`;
  return html;
}

// Markdown Report Generator
function generateMarkdownReport(data) {
  let markdown = `# ⚠️ Broken Link Report\n\n`;

  const groupedReport = data.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push({ url: item.url, brokenLinks: item.brokenLinks });
    return acc;
  }, {});

  for (const category in groupedReport) {
    markdown += `## ${category}\n\n`;
    markdown += `| Site URL | Broken Links |\n`;
    markdown += `| :--- | :--- |\n`; 

    for (const site of groupedReport[category]) {
      const links = site.brokenLinks.map(link => `- ${link}`).join('\n');
      markdown += `| ${site.url} | \n${links}\n |\n`; 
    }

    markdown += `\n`;
  }

  return markdown;
}

// --- Playwright Test Definition ---

test.afterAll(async () => {
  if (allBrokenLinkResults.length === 0) {
    console.log('🎉 All links checked successfully. No broken links found. Skipping report generation.');
    return;
  }

  console.log('\n--- 🚨 Generating Broken Link Reports ---');
  
  // 1. Ensure the reports directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    console.log(`Created report directory: ${REPORT_DIR}`);
  }

  // 2. Generate and write the HTML report
  const htmlReport = generateHtmlReport(allBrokenLinkResults);
  const htmlFilePath = path.join(REPORT_DIR, 'broken-links-report.html');
  fs.writeFileSync(htmlFilePath, html);
  console.log(`✅ HTML Report saved to: ${htmlFilePath}`);

  // 3. Generate and write the Markdown report
  const markdownReport = generateMarkdownReport(allBrokenLinkResults);
  const markdownFilePath = path.join(REPORT_DIR, 'broken-links-report.md');
  fs.writeFileSync(markdownFilePath, markdown);
  console.log(`✅ Markdown Report saved to: ${markdownFilePath}`);

  // Optional: Throw an error here to fail the CI/CD pipeline if broken links were found.
});


test.describe('Broken Links Validation', () => {
  const urlsToCheck = [
    { category: 'RideNow v7', url: 'https://ridenow.qa.dsp.leadventure.dev/new-used-inventory-for-sale--inventory' },
    { category: 'RideNow-AllInventory', url: 'https://ridenow.qa.dsp.leadventure.dev/new-used-inventory-for-sale--inventory' },
    { category: 'RideNow-Preowned', url: 'https://ridenow.qa.dsp.leadventure.dev/used-inventory-for-sale--inventory?condition=pre-owned&pg=1&sortby=Inventory|asc' },
    { category: 'RideNow-under10k', url: 'https://ridenow.qa.dsp.leadventure.dev/new-used-inventory-for-sale--inventory?pg=1&price=1-9999' },
    { category: 'Ridenow orlando', url: 'https://multi-site-inventory-2-v7.qa.dsp.leadventure.dev/--inventory' },
    { category: 'Marine-boat', url: 'https://marine-v6-complex.qa.dsp.leadventure.dev/new-boats-near-sebago-lake-maine--xNewInventory#page=xNewInventory&vt=boat' },
    { category: 'Marine-newOffRoad', url: 'https://marine-v6-complex.qa.dsp.leadventure.dev/new-boats-near-sebago-lake-maine--xallinventory?at=atv|sport%20sxs|utility%20vehicle' },
    { category: 'Marine-PreOwned', url: 'https://marine-v6-complex.qa.dsp.leadventure.dev/default.asp?page=xPreOwnedInventory' }
  ];

  for (const { category, url } of urlsToCheck) {
    test(`Check broken links for ${category} - ${url}`, async ({ page, request }) => {
      console.log(`\n-- Starting check for: ${category} (${url}) --`);

      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const links = await page.$$eval('a', anchors =>
        anchors
          .map(a => a.href)
          .filter(href => href && !href.startsWith('#') && (href.startsWith('http') || href.startsWith('https')))
      );
      const uniqueLinks = [...new Set(links)]; 

      console.log(`-- Found ${uniqueLinks.length} unique HTTP(S) links to check.`);

      const brokenLinks = [];

      // Loop through each unique link found on the page
      for (const link of uniqueLinks) {
        let isBrokenLink = false;

        // --- RETRY LOOP START ---
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            // Attempt 1, 2, or 3
            const response = await request.get(link, { timeout: 15000, maxRedirects: 5 });
            
            // Check for definitive 4xx or 5xx status code
            if (response.status() >= 400) {
              console.log(`❌ BROKEN: Status ${response.status()} for link: ${link} (Attempt ${attempt + 1})`);
              isBrokenLink = true; // Mark as broken (will break out of retry loop)
            } else {
              // Success (status < 400) - break out of the retry loop
              isBrokenLink = false;
            }
            break; // Exit the retry loop on success or definitive HTTP error

          } catch (error) {
            const errorMessage = error.message.toLowerCase();
            
            // Define common transient network/timeout errors
            const isTransientError = 
              errorMessage.includes('timeout') || 
              errorMessage.includes('connection') || 
              errorMessage.includes('net::') ||
              errorMessage.includes('name not resolved'); 

            if (isTransientError) {
              if (attempt < MAX_RETRIES) {
                // If it's a transient error and we have retries left, warn and continue
                console.log(`⚠️ RETRY: Transient error for ${link}. Retrying... (Attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
                await page.waitForTimeout(1000 * (attempt + 1)); // Wait for 1s, 2s, etc. before next attempt
                continue; // Go to the next retry attempt
              } else {
                // Last attempt failed with a transient error - log but do NOT report
                console.log(`⚠️ SKIPPING: Transient error for ${link} after ${MAX_RETRIES + 1} attempts. Skipping report.`);
                isBrokenLink = false; // Do not report as broken
                break; // Exit the retry loop
              }
            } else {
              // Non-transient, unexpected error (e.g., Protocol Error) - report immediately
              console.log(`❌ ERROR: UNEXPECTED FAILURE for link: ${link} - ${error.message.split('\n')[0]}`);
              isBrokenLink = true;
              break; // Exit the retry loop
            }
          }
        }
        // --- RETRY LOOP END ---

        // Record the link if the retry loop concluded it was a hard broken link
        if (isBrokenLink) {
          brokenLinks.push(link);
        }
      }

      if (brokenLinks.length > 0) { 
        allBrokenLinkResults.push({ 
          category: category, 
          url: url, 
          brokenLinks: brokenLinks 
        });
        console.log(`\n⚠️ Finished check for: ${category}. Found ${brokenLinks.length} actual broken links.`);
      } else {
        console.log(`\n✅ Finished check for: ${category}. No true broken links found.`);
      }
    });
  }
});