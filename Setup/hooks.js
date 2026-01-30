const playwright = require('playwright');
const { BeforeAll, Before, After, AfterAll, Status, setDefaultTimeout } = require('@cucumber/cucumber');
// Load local env variables if present
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional; continue if not installed
}

// Expose credentials to tests via global.credentials when available
global.credentials = {
  email: process.env.EMAIL || '',
  password: process.env.PASSWORD || ''
};

// Set global timeout to 120 seconds
setDefaultTimeout(120000);

// Launch options.
const options = {
  headless: false,
  slowMo: 100
};

// Create a global browser for the test session.
BeforeAll(async () => {
  console.log('before all - launching browser...');
  global.browser = await playwright['chromium'].launch(options);
});

AfterAll(async () => {
  console.log('after all - closing browser...');
  if (global.browser) {
    await global.browser.close();
  }
});

// Create a fresh browser context for each test.
Before(async () => {
  console.log('before scenario - creating context and page...');
  if (global.browser) {
    global.context = await global.browser.newContext();
    global.page = await global.context.newPage();
  }
});

// Close the page and context after each test.
After(async function (scenario) {
  console.log('after scenario...');
  
  // Take screenshot if failed
  if (scenario.result.status === Status.FAILED) {
    try {
      if (global.page && global.context && global.browser) {
        const fs = require('fs');
        const path = require('path');
        try { if (!fs.existsSync('reports')) fs.mkdirSync('reports', { recursive: true }); } catch (e) {}
        // try screenshot with longer timeout and one retry
        let buffer = null;
        try {
          buffer = await global.page.screenshot({ fullPage: true, timeout: 30000 });
        } catch (e) {
          console.error('Screenshot first attempt failed:', e && e.message ? e.message : e);
          try { await global.page.waitForTimeout(1000); buffer = await global.page.screenshot({ fullPage: true, timeout: 20000 }); } catch (er) { buffer = null; }
        }
        if (buffer) {
          try {
            // sanitize filename
            const rawName = scenario.pickle && scenario.pickle.name ? scenario.pickle.name : `screenshot-${Date.now()}`;
            const safeName = rawName.replace(/[^a-z0-9-_.() ]/gi, '_').slice(0, 200);
            const outPath = path.join('reports', `${safeName}.png`);
            fs.writeFileSync(outPath, buffer);
          } catch (wf) {
            console.error('Could not write screenshot file:', wf && wf.message ? wf.message : wf);
          }
          this.attach(buffer, 'image/png');
        }
      }
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  }

  // Close page and context
  try {
    if (global.page) {
      await global.page.close();
    }
    if (global.context) {
      await global.context.close();
    }
  } catch (error) {
    console.error('Error closing page/context:', error);
  }
});