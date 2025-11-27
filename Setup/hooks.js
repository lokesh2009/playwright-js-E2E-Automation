const playwright = require('playwright');
const { BeforeAll, Before, After, AfterAll, Status, setDefaultTimeout } = require('@cucumber/cucumber');

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
        await global.page.screenshot({ path: `reports/${scenario.pickle.name}.png`, fullPage: true });
        const buffer = await global.page.screenshot();
        this.attach(buffer, 'image/png');
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