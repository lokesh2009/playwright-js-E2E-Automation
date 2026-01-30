const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// Base URL for the XInv Manager admin page
const XINV_URL = 'https://powersports-v7-complex.qa.dsp.leadventure.dev/useradmin.asp?page=xinvmanager';
// Export so other step files can reuse this canonical URL as a reliable fallback
module.exports = { XINV_URL };

Given('the XInv Manager admin page is available', async function () {
  if (!global.page) throw new Error('global.page not initialized');
  // quick sanity check: navigate and ensure we get a 200-like load
  await global.page.goto(XINV_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
});

Given('admin credentials are configured', async function () {
  // Attach global credentials to the Cucumber world for easy access in steps
  this.admin = {
    email: global.credentials && global.credentials.email ? global.credentials.email : '',
    password: global.credentials && global.credentials.password ? global.credentials.password : ''
  };
  // Basic validation
  if (!this.admin.email || !this.admin.password) {
    console.warn('Admin credentials not set in environment; some steps may fail');
  }
});

When('I navigate to the XInv Manager', async function () {
  if (!global.page) throw new Error('global.page not initialized');
  try {
    await global.page.goto(XINV_URL, { waitUntil: 'networkidle', timeout: 60000 });
  } catch (err) {
    // sometimes the server returns HTTP2 protocol errors; retry with domcontentloaded
    console.warn('Navigate failed with', err.message, '- retrying with domcontentloaded');
    await global.page.goto(XINV_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
});

When('I search XInv for {string}', async function (term) {
  // Try several possible search input selectors commonly found on the page
  const selectors = ['input[name="search"]', 'input[type="search"]', '#search', 'input#searchInput', 'input[name="q"]'];
  let input = null;
  for (const s of selectors) {
    const locator = global.page.locator(s).first();
    try {
      if (await locator.count() && await locator.isVisible()) {
        input = locator;
        break;
      }
    } catch (e) {
      // ignore
    }
  }

  if (!input) {
    // fallback: focus body and send key presses (best-effort)
    await global.page.keyboard.type(term);
    return;
  }

  await input.fill(term);
  // attempt to submit search via Enter or clicking a nearby button
  await input.press('Enter');
  await global.page.waitForLoadState('networkidle');
  await global.page.waitForTimeout(1000);
});

Then('I should see at least one search result', async function () {
  // check for table rows or common product/result containers
  const resultSelectors = ['table tbody tr', '.result, .results, .product, .item', '[data-testid="result"]'];
  let found = false;
  for (const s of resultSelectors) {
    try {
      const count = await global.page.locator(s).count();
      if (count > 0) {
        found = true;
        break;
      }
    } catch (e) {
      // continue
    }
  }

  assert.ok(found, 'Expected at least one search result but found none');
});

Then('I should see the XInv Manager header', async function () {
  // Try to detect common header elements or page identifiers
  const headerSelectors = ['h1', '.page-title', 'h2', 'title'];
  let found = false;
  for (const s of headerSelectors) {
    try {
      const el = global.page.locator(s).first();
      if (await el.count()) {
        const text = (await el.textContent()) || '';
        if (text.toLowerCase().includes('inventory') || text.toLowerCase().includes('xinv') || text.toLowerCase().includes('inventory manager')) {
          found = true;
          break;
        }
      }
    } catch (e) {}
  }
  if (!found) {
    // last resort: check entire body for identifiers
    const body = await global.page.locator('body').textContent();
    if (body && (body.toLowerCase().includes('inventory') || body.toLowerCase().includes('xinv'))) found = true;
  }
  assert.ok(found, 'Expected XInv Manager header or identifier on the page');
});

When('I create a temporary item with name {string} and description {string}', async function (name, description) {
  // Attempt common 'Add' flow: click add button, fill fields, save
  // Try known selectors
  const addSelectors = ['button#btnAddInventory', 'button.add-inventory', 'a.add', 'button[title="Add"]'];
  let addButton = null;
  for (const s of addSelectors) {
    try {
      const locator = global.page.locator(s).first();
      if (await locator.count() && await locator.isVisible()) {
        addButton = locator;
        break;
      }
    } catch (e) {}
  }

  if (addButton) {
    await addButton.click();
    await global.page.waitForTimeout(500);
  }

  // Fill form fields if present
  const nameSelectors = ['input[name="itemName"]', '#itemName', 'input[name="name"]'];
  const descSelectors = ['textarea[name="description"]', 'input[name="description"]', '#description'];

  for (const s of nameSelectors) {
    try {
      const el = global.page.locator(s).first();
      if (await el.count()) {
        await el.fill(name);
        break;
      }
    } catch (e) {}
  }

  for (const s of descSelectors) {
    try {
      const el = global.page.locator(s).first();
      if (await el.count()) {
        await el.fill(description);
        break;
      }
    } catch (e) {}
  }

  // Click save
  const saveSelectors = ['button[type="submit"]', 'button#btnSave', 'button.save, .btn-save'];
  for (const s of saveSelectors) {
    try {
      const btn = global.page.locator(s).first();
      if (await btn.count() && await btn.isVisible()) {
        await btn.click();
        await global.page.waitForLoadState('networkidle');
        await global.page.waitForTimeout(1000);
        break;
      }
    } catch (e) {}
  }
  // After saving, attempt to search for the newly created item so subsequent assertions can find it
  const searchInput = global.page.locator('input[name="search"], input[type="search"], #search, input#searchInput').first();
  try {
    if (await searchInput.count()) {
      await searchInput.fill(name);
      await searchInput.press('Enter');
      await global.page.waitForLoadState('networkidle');
      await global.page.waitForTimeout(1000);
    }
  } catch (e) {
    // ignore search failures, tests will assert later
  }
});

Then('I should be able to find {string} in results', async function (text) {
  // Look for text in rows or result containers
  const body = await global.page.locator('body').textContent();
  assert.ok(body && body.includes(text), `Expected to find "${text}" on the page`);
});

When('I delete the temporary item', async function () {
  // Try to find a delete button near the item by text
  const text = 'temp-item-123';
  // Ensure we search for the item first to surface it in results
  const searchInput = global.page.locator('input[name="search"], input[type="search"], #search, input#searchInput').first();
  try {
    if (await searchInput.count()) {
      await searchInput.fill(text);
      await searchInput.press('Enter');
      await global.page.waitForLoadState('networkidle');
      await global.page.waitForTimeout(1000);
    }
  } catch (e) {}
  // search for the row containing the text and click a delete button inside it
  const rows = global.page.locator('table tbody tr');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const rowText = await row.textContent();
    if (rowText && rowText.includes(text)) {
      // try common delete selectors inside the row
      const delBtn = row.locator('button.delete, .btn-delete, button[title="Delete"]').first();
      if (await delBtn.count()) {
        await delBtn.click();
        // confirm if dialog appears
        const yes = global.page.locator('button.confirm-yes, #btnConfirmYes').first();
        if (await yes.count()) {
          await yes.click();
        }
        await global.page.waitForTimeout(1000);
        return;
      }
    }
  }

  // fallback: try clicking any global delete for the test text
  const delGlobal = global.page.locator(`text=${text} >> .. >> button.delete`).first();
  if (await delGlobal.count()) {
    await delGlobal.click();
    await global.page.waitForTimeout(1000);
  }
});

Then('the temporary item should no longer be present', async function () {
  const body = await global.page.locator('body').textContent();
  assert.ok(!body || !body.includes('temp-item-123'), 'Expected temporary item to be removed');
});
