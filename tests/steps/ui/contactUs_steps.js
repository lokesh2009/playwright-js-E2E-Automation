const { Given, When, Then } = require('@cucumber/cucumber');

Given('I am on the RideNow contact page {string}', async function (url) {
  await global.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(resolve => setTimeout(resolve, 2000));
});

When('I fill in the contact form with:', async function (dataTable) {
  const data = dataTable.rowsHash();
  // Fill Name
  if ('Name' in data) {
    await global.page.fill('input[name="name"], input[id*="name"]', data['Name']);
  }
  // Fill Email
  if ('Email' in data) {
    await global.page.fill('input[type="email"], input[name*="email" i], input[id*="email"]', data['Email']);
  }
  // Fill Phone
  if ('Phone' in data) {
    await global.page.fill('input[type="tel"], input[name*="phone" i], input[id*="phone"]', data['Phone']);
  }
  // Fill Subject
  if ('Subject' in data) {
    await global.page.fill('input[name*="subject" i], input[id*="subject"]', data['Subject']);
  }
  // Fill Message
  if ('Message' in data) {
    await global.page.fill('textarea[name*="message" i], textarea[id*="message"]', data['Message']);
  }
});

When('I submit the contact form', async function () {
  // Try to find and click the submit button
  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Submit")',
    'button:has-text("Send")',
    'input[value*="Send"]',
    'input[value*="Submit"]'
  ];
  let clicked = false;
  for (const selector of submitSelectors) {
    const el = await global.page.$(selector).catch(() => null);
    if (el) {
      await el.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) throw new Error('Submit button not found');
  await new Promise(resolve => setTimeout(resolve, 2000));
});

Then('I should see a confirmation message {string} on the page', async function (msg) {
  const content = await global.page.content();
  if (!content.includes(msg)) {
    throw new Error(`Confirmation message not found: ${msg}`);
  }
});

Then('I should see validation error for required fields', async function () {
  // Look for common validation error messages
  const errorSelectors = [
    '.error', '.validation-error', '.field-validation-error', '[role="alert"]', '.invalid-feedback', '.form-error'
  ];
  let found = false;
  for (const selector of errorSelectors) {
    const el = await global.page.$(selector).catch(() => null);
    if (el) {
      const text = await el.innerText();
      if (text && text.match(/required|please|missing|must/i)) {
        found = true;
        break;
      }
    }
  }
  if (!found) throw new Error('No required field validation error found');
});

Then('I should not see a confirmation message', async function () {
  const content = await global.page.content();
  if (content.match(/thank you|success|submitted|we have received/i)) {
    throw new Error('Unexpected confirmation message found');
  }
});

Then('I should see an email validation error', async function () {
  // Look for email-specific validation error
  const errorSelectors = [
    '.error', '.validation-error', '.field-validation-error', '[role="alert"]', '.invalid-feedback', '.form-error'
  ];
  let found = false;
  for (const selector of errorSelectors) {
    const el = await global.page.$(selector).catch(() => null);
    if (el) {
      const text = await el.innerText();
      if (text && text.match(/email|valid email|invalid email|correct email/i)) {
        found = true;
        break;
      }
    }
  }
  if (!found) throw new Error('No email validation error found');
});

module.exports = {};
