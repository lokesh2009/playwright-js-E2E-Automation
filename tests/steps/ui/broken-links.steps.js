const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium, request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const urlsToCheck = [
  { category: 'v6 Marine', url: 'https://www.portharbormarine.com/' },
  { category: 'v7 Marine', url: 'https://www.n3boatworks.com/' },
  { category: 'v6 Auto', url: 'https://www.rallyemotors-chrysler.ca/' },
  { category: 'v7 Auto', url: 'https://www.cartsgonewild.com/' },
  { category: 'v6 RV', url: 'https://www.mannsrv.com/' },
  { category: 'v7 RV', url: 'https://www.edmundsonrv.com/' },
  { category: 'Multisite', url: 'https://www.sonicpowersports.com/' },
  { category: 'Multisite', url: 'https://www.ridenoworlando.com/' },
  { category: 'Heavy Truck', url: 'https://www.sargentsequipmentwi.com/' },
  { category: 'v6 Powersports', url: 'https://www.desertvalleypowersports.com/' },
  { category: 'v7 Powersports', url: 'https://www.barneshd.com/' },
];

let brokenLinks = [];

Given('a list of categorized URLs', async function () {
  this.urls = urlsToCheck;
});

When('I visit each site and validate all links', async function () {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const apiRequest = await request.newContext();

  for (const { category, url } of this.urls) {
    const page = await context.newPage();
    console.log(`🔍 Checking: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const links = await page.$$eval('a', as => as.map(a => a.href));

      for (const link of links) {
        if (!link.startsWith('http')) continue;

        try {
          const response = await apiRequest.get(link);
          const status = response.status();

          if (status >= 400) {
            brokenLinks.push({ category, source: url, link, status });
          }
        } catch (err) {
          brokenLinks.push({ category, source: url, link, status: err.message });
        }
      }
    } catch (err) {
      brokenLinks.push({ category, source: url, link: url, status: 'Page Load Failed' });
    }

    await page.close();
  }

  await browser.close();
  await apiRequest.dispose();
});

Then('I should generate a CSV report of broken links', async function () {
  const outputPath = path.join(__dirname, '../../test-results/brokenlinkTestResult.csv');
  const header = 'Category,Source Page,Link,Status/Error\n';
  const rows = brokenLinks.map(d =>
    `"${d.category}","${d.source}","${d.link}","${d.status}"`
  );
  const content = header + rows.join('\n');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`📄 Report saved to: ${outputPath}`);
});