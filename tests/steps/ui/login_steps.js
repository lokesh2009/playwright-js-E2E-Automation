const { Given, When, Then } = require('@cucumber/cucumber');
const { LoginPageCucumber } = require('../../../Pages/LoginPageCucumber');

Given('I navigate to the admin login page', async function () {
  if (!global.page) throw new Error('global.page is not initialized. Check hooks.');
  const url = 'https://powersports-v7-complex.qa.dsp.leadventure.dev/default.asp?page=xAdminLogin';
  await global.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
});

When('I log in with valid admin credentials', async function () {
  if (!global.page) throw new Error('global.page is not initialized. Check hooks.');
  const login = new LoginPageCucumber(global.page);
  const username = process.env.UI_USERNAME || process.env.EMAIL || global.credentials.email || 'dealerspike';
  const password = process.env.UI_PASSWORD || process.env.PASSWORD || global.credentials.password || 'ds4321';
  await login.login(username, password);
  
});

Then('I should be logged in to the admin ', async function () {
  if (!global.page) throw new Error('global.page is not initialized. Check hooks.');
  const login = new LoginPageCucumber(global.page);
  const ok = await login.isLoggedIn(10000);
  if (!ok) {console
    try { await global.page.screenshot({ path: 'reports/login-failure.png', fullPage: true }); } catch (e) {}
    throw new Error('Login did not reach expected post-login state');
  }
});

// Helper used by multiple Given patterns (some features use slightly different wording)
async function navigatePartsRequestPage(partsRequestUrl) {
  console.log(`🔗 Navigating to dealerspike parts request page: ${partsRequestUrl}`);
  if (!global.page) throw new Error('global.page is not initialized. Check hooks.');
  try {
    await global.page.goto(partsRequestUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    }).catch((navigationError) => {
      console.log(`Navigation took longer than expected: ${navigationError && navigationError.message ? navigationError.message : navigationError}`);
    });
    // Wait briefly for client-side rendering
    await global.page.waitForTimeout(3000);
    const pageTitle = await global.page.title().catch(() => '');
    console.log(`✓ Successfully navigated to parts request page`);
    console.log(`✓ Page title: ${pageTitle}`);
  } catch (error) {
    console.error(`❌ Error navigating to parts request page: ${error && error.message ? error.message : error}`);
    throw error;
  }
}

// Register both variants so older feature wording still works
Given('I navigate to dealerspike parts request page {string}', async function (partsRequestUrl) {
  await navigatePartsRequestPage(partsRequestUrl);
});

Given('I navigate dealerspike parts request page {string}', async function (partsRequestUrl) {
  await navigatePartsRequestPage(partsRequestUrl);
});