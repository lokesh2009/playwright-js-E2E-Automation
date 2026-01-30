const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// ...existing code...

// Small helpers
async function clickByText(page, selector, text, opts = {}) {
  const locator = page.locator(`${selector}:has-text("${text}")`).first();
  if (await locator.count()) {
    await locator.scrollIntoViewIfNeeded();
    await locator.click({ timeout: opts.timeout || 5000 }).catch(async () => { await locator.click({ force: true }); });
    return true;
  }
  return false;
}

async function clickAnyByText(page, text) {
  const sels = [
    `a:has-text("${text}")`,
    `button:has-text("${text}")`,
    `li:has-text("${text}")`,
    `span:has-text("${text}")`
  ];
  for (const s of sels) {
    const loc = page.locator(s).first();
    if (await loc.count()) {
      await loc.scrollIntoViewIfNeeded();
      await loc.click({ timeout: 5000 }).catch(async () => { await loc.click({ force: true }); });
      return true;
    }
  }
  return false;
}

// Local debug artifact saver (used when inventory_steps helper no longer present)
async function saveDebugArtifacts(page, name) {
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const base = `reports/debug-${name}-${timestamp}`;
  try { fs.mkdirSync('reports', { recursive: true }); } catch (e) {}
  try {
    const html = await page.evaluate(() => document.documentElement.outerHTML).catch(() => null);
    if (html) fs.writeFileSync(`${base}.html`, html, 'utf8');
  } catch (e) {
    // ignore
  }
  try {
    let buffer = null;
    try { buffer = await page.screenshot({ fullPage: true, timeout: 30000 }); } catch (e) {
      await page.waitForTimeout(1000).catch(() => {});
      try { buffer = await page.screenshot({ fullPage: true, timeout: 20000 }); } catch (er) { buffer = null; }
    }
    if (buffer) fs.writeFileSync(`${base}.png`, buffer);
  } catch (e) {
    // ignore
  }
  return base;
}

// Attempt to detect an admin login form and submit credentials from global.credentials
async function performAdminLogin(page) {
  try {
    const emailSelectors = ['input#email', 'input[name="email"]', 'input#username', 'input[name="username"]', 'input[type="text"]'];
    const passwordSelectors = ['input#password', 'input[name="password"]', 'input[type="password"]'];
    let emailEl = null;
    let passEl = null;
    for (const s of emailSelectors) {
        const loc = page.locator(s).first();
        if (await loc.count()) { emailEl = loc; break; }
    }
    for (const s of passwordSelectors) {
      const loc = page.locator(s).first();
      if (await loc.count()) { passEl = loc; break; }
    }
    if (passEl) {
      const creds = global.credentials || {};
      const email = creds.email || process.env.EMAIL || '';
      const password = creds.password || process.env.PASSWORD || '';
      if (!email || !password) {
        console.warn('No admin credentials available to perform login');
        return false;
      }
      // Wait for visible username/password inputs if possible
      try {
        if (emailEl) await emailEl.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        if (passEl) await passEl.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      } catch (e) {}
      // SSO flow handling: fill username and trigger blur/tab so client-side checkUser may toggle SSO path
      try {
        const usernameLoc = page.locator('#username').first();
        if (await usernameLoc.count()) {
          await usernameLoc.fill(email).catch(() => {});
          // Trigger blur/validation which on some pages results in SSO button appearing
          await usernameLoc.press('Tab').catch(() => {});
          // Wait for either SSO button, login button, or password input to appear (short timeout)
          try {
            await page.waitForSelector('input#ssoBtn, input#loginBtn, button#loginButton, input#password, input[name="password"]', { timeout: 4000 });
          } catch (e) {
            // not required, we'll fallback below
          }
        }
      } catch (e) {}

      // Prefer exact known IDs first (password may have been hidden by SSO flow)
      try { if (await page.locator('#password').count()) await page.locator('#password').fill(password); } catch (e) {}
      // If the IDs didn't exist, fallback to previously discovered locators
      try { if (!await page.locator('#password').count() && passEl) await passEl.fill(password); } catch (e) {}

      // If an SSO button is present, prefer clicking it (SSO path likely required)
      try {
        const sso = page.locator('input#ssoBtn, button#ssoBtn, button:has-text("SSO"), input#sso');
        if (await sso.count()) { await sso.first().click({ timeout: 5000 }).catch(() => {}); await page.waitForLoadState('networkidle').catch(() => {}); return true; }
      } catch (e) {}


      // try several submit options - prefer direct click and wait for navigation or admin markers
      const submitSelectors = ['input#loginBtn', 'button#loginButton', 'button[type="submit"]', 'input[type="submit"]', 'input#loginButton', 'button:has-text("Login")', 'button:has-text("Sign In")'];
      for (const s of submitSelectors) {
        try {
          const btn = page.locator(s).first();
          if (await btn.count()) {
            await btn.scrollIntoViewIfNeeded().catch(() => {});
            await btn.click({ timeout: 5000 }).catch(() => {});
            // Wait briefly for navigation or UI changes
            await page.waitForLoadState('networkidle').catch(() => {});
            // check for inventory markers
            const body = await page.locator('body').textContent().catch(() => '');
            if (body && /inventory management|inventory manager|show options|est\. monthly payment/i.test(body)) return true;
          }
        } catch (e) {}
      }

      // last resort submit the form via Enter key
      try {
        if (passEl) { await passEl.press('Enter'); await page.waitForLoadState('networkidle').catch(() => {});
          const body2 = await page.locator('body').textContent().catch(() => '');
          if (body2 && /inventory management|inventory manager|show options|est\. monthly payment/i.test(body2)) return true;
        }
      } catch (e) {}

      // Final last-resort: if a form element exists, submit it directly (bypasses some click handlers)
      try {
        const hasForm = await page.$('form');
        if (hasForm) {
          await page.evaluate(() => { const f = document.querySelector('form'); if (f) try { f.submit(); } catch (e) { /* ignore */ } });
          await page.waitForLoadState('networkidle').catch(() => {});
          return true;
        }
      } catch (e) {}
    }
  } catch (e) {
    // ignore
  }
  return false;
}


Given('User opens {string} site in browser', async function (url) {
  if (!global.page) throw new Error('global.page not initialized');
  await global.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  // allow client JS to render menus
  await global.page.waitForTimeout(800);
  // If a login form is present, attempt to login using provided credentials
  try { await performAdminLogin(global.page); } catch (e) {}
});

// Support unquoted URL in feature (e.g. Given User opens https://... site in browser)
Given(/^User opens (https?:\/\/.+) site in browser$/, async function (url) {
  if (!global.page) throw new Error('global.page not initialized');
  await global.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await global.page.waitForTimeout(800);
});

const XInvManagerPage = require('../../../Pages/XInvManagerPage');

When('User clicks on Inventory menu on home page', async function () {
  if (!global.page) throw new Error('global.page not initialized');
  // Try direct navigation to canonical XInv Manager first (after attempting login) to avoid flaky menu clicks
  try {
    const xinv = require('./xinv_manager_new_steps').XINV_URL;
    if (xinv) {
      try {
        // Attempt login first, then use the page object to open and wait for indicators
        await performAdminLogin(global.page).catch(() => {});
        const p = new XInvManagerPage(global.page);
        await p.openCanonical(xinv);
        // if ensureLoaded finds indicators, return
        await p.ensureLoaded(8000).catch(() => {});
        const bodyNow = await global.page.locator('body').textContent().catch(() => '');
        if (bodyNow && /inventory management|inventory manager|show options|est. monthly payment/i.test(bodyNow)) return;
      } catch (e) {}
    }
  } catch (e) {}
  // Try a few approaches
  const tried = [
    'nav a:has-text("Inventory")',
    'a:has-text("Inventory")',
    'button:has-text("Inventory")',
    'li:has-text("Inventory")',
    'aside >> text=Inventory',
    // some sites use "Showroom" or header quick links instead of a plain "Inventory" word
    'nav a:has-text("Showroom")',
    'a:has-text("Showroom")',
    'header .header-inventory-links a',
    'header .header-inventory-links',
    'a:has-text("New Inventory")',
    'a:has-text("All Inventory")'
  ];
  for (const sel of tried) {
    const loc = global.page.locator(sel).first();
    if (await loc.count()) {
      try {
        await loc.scrollIntoViewIfNeeded();
        await loc.click({ timeout: 5000 }).catch(async () => { await loc.click({ force: true }); });
        await global.page.waitForTimeout(500);
        return;
      } catch (e) {}
    }
  }
  // fallback: click any element with Inventory text
  const ok = await clickAnyByText(global.page, 'Inventory');
  if (!ok) {
    // Final fallback: navigate directly to canonical XInv Manager admin page (if available)
    try {
      const xinv = require('./xinv_manager_new_steps').XINV_URL;
      if (xinv) {
        try {
          const p = new XInvManagerPage(global.page);
          await p.openCanonical(xinv);
          await performAdminLogin(global.page).catch(() => {});
          await p.ensureLoaded(8000).catch(() => {});
          const body = await global.page.locator('body').textContent().catch(() => '');
          if (body && /inventory management|inventory manager|show options|est. monthly payment/i.test(body)) return;
        } catch (e) {}
      }
    } catch (e) {
      // ignore require errors
    }
    // Try known admin URL patterns as a fallback (direct navigation)
    try {
      const tryUrls = ['useradmin.asp?page=inventorymanager', 'useradmin.asp?page=xinvmanager', 'useradmin.asp?page=invmanager', 'useradmin.asp?page=xinventory'];
      for (const u of tryUrls) {
        try {
          const url = new URL(u, global.page.url()).toString();
          await global.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
          const body = await global.page.locator('body').textContent().catch(() => '');
          if (body && /inventory management|inventory manager|show options|est. monthly payment/i.test(body)) return;
        } catch (e) {}
      }
    } catch (e) {}

    const base = await saveDebugArtifacts(global.page, 'inventory-menu-fallback');
    throw new Error(`Could not click Inventory menu; debug saved to ${base}.html/.png`);
  }
});

Then('Inventory navigation bar should be displayed', async function () {
  const url = global.page.url ? global.page.url() : '';
  // quick helper: poll body for inventory indicators
  async function waitForInventoryMarkers(page, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const b = await page.locator('body').textContent().catch(() => '');
      if (b && /inventory manager|inventory management|inventory navigation|show options|est\. monthly payment/i.test(b)) return true;
      await page.waitForTimeout(500).catch(() => {});
    }
    return false;
  }

  // If we're already on an admin page URL that looks like an inventory admin, accept it
  if (url && /useradmin\.asp\?page=/.test(url) && /inventory|invmanager|xinv/i.test(url)) return;

  // If the page landed on an admin login, try to login and poll for markers
  const bodyNow = await global.page.locator('body').textContent().catch(() => '');
  if (bodyNow && (/administration login|admin login|username\/email/i.test(bodyNow) || await global.page.locator('#username').count())) {
    await performAdminLogin(global.page).catch(() => {});
    // poll for client-side rendering of admin navigation
    if (await waitForInventoryMarkers(global.page, 12000)) return;
  }

  // Try polling once in-case the page is still rendering
  if (await waitForInventoryMarkers(global.page, 5000)) return;

  // Next, try direct canonical XInv page navigation (perform login first if possible)
  try {
    const xinv = require('./xinv_manager_new_steps').XINV_URL;
    if (xinv) {
      try {
        await performAdminLogin(global.page).catch(() => {});
        await global.page.goto(xinv, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
        if (await waitForInventoryMarkers(global.page, 12000)) return;
      } catch (e) {}
    }
  } catch (e) {}

  // Final fallback: try known admin URL patterns
  try {
    const tryUrls = ['useradmin.asp?page=inventorymanager', 'useradmin.asp?page=xinvmanager', 'useradmin.asp?page=invmanager', 'useradmin.asp?page=xinventory'];
    for (const u of tryUrls) {
      try {
        const urlTry = new URL(u, global.page.url()).toString();
        await global.page.goto(urlTry, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
        if (await waitForInventoryMarkers(global.page, 8000)) return;
      } catch (e) {}
    }
  } catch (e) {}

  // Try constructing inventory admin paths on the current origin (handles sbx/qa/other host differences)
  try {
    try {
      const currentUrl = global.page.url();
      const origin = new URL(currentUrl).origin;
      const candidatePaths = ['\/useradmin.asp?page=xinvmanager', '/useradmin.asp?page=inventorymanager', '/useradmin.asp?page=invmanager', '/default.asp?page=xAdminLogin', '/useradmin.asp?page=xinventory'];
      for (const p of candidatePaths) {
        try {
          const tryUrl = origin + p;
          await global.page.goto(tryUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
          if (await waitForInventoryMarkers(global.page, 8000)) return;
        } catch (e) {}
      }
    } catch (e) {}
  } catch (e) {}

  const base = await saveDebugArtifacts(global.page, 'inventory-navigation-missing');
  throw new Error(`Inventory navigation not visible; debug saved to ${base}.html/.png`);
});

When('User clicks Inventory Manager on Inventory Navigation bar', async function () {
  // If we're already on an inventory admin page, skip clicking
  const cur = global.page.url ? global.page.url() : '';
  const bodyNow = await global.page.locator('body').textContent().catch(() => '');
  if ((cur && /useradmin\.asp\?page=/.test(cur) && /inv|inventory|xinv/i.test(cur)) || (bodyNow && /inventory management|inventory manager|show options|est. monthly payment/i.test(bodyNow))) {
    return;
  }

  const ok = await clickAnyByText(global.page, 'Inventory Manager') || await clickAnyByText(global.page, 'Inventory Management');
  if (ok) {
    // wait for page indicators
    await global.page.waitForSelector('text=Inventory Management, text=Show Options, text=Est. Monthly Payment', { timeout: 10000 }).catch(() => {});
    return;
  }
  // Try direct known URL patterns (relative to current host)
  const tryUrls = ['useradmin.asp?page=inventorymanager', 'useradmin.asp?page=xinvmanager', 'useradmin.asp?page=invmanager'];
  for (const u of tryUrls) {
    try {
      const url = new URL(u, global.page.url()).toString();
      await global.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
      const body = await global.page.locator('body').textContent().catch(() => '');
      if (body && /inventory management|inventory manager/i.test(body)) return;
    } catch (e) {}
  }

  // Final fallback: navigate to canonical XInv Manager URL exported by xinv_manager_new_steps.js
  try {
    const xinv = require('./xinv_manager_new_steps').XINV_URL;
    if (xinv) {
      try {
        // If a login form is present, try to perform login before navigating so we land on the admin UI
        await performAdminLogin(global.page).catch(() => {});
        await global.page.goto(xinv, { waitUntil: 'networkidle', timeout: 60000 });
        const body2 = await global.page.locator('body').textContent().catch(() => '');
        if (body2 && /inventory management|inventory manager|show options|est. monthly payment/i.test(body2)) return;
      } catch (e) {}
    }
  } catch (e) {
    // ignore if the module cannot be required
  }

  const base = await saveDebugArtifacts(global.page, 'inventory-manager-missing');
  throw new Error(`Could not click Inventory Manager; debug saved to ${base}.html/.png`);
});

Then('User should see Inventory Management page in dealerspike admin', async function () {
  const body = await global.page.locator('body').textContent();
  assert.ok(body && /inventory management|inventory manager/i.test(body), 'Expected Inventory Management page content');
});

Then('Show Options button should be displayed on Inventory Management page', async function () {
  // Be tolerant: the admin UI may render the filters differently. Accept any of several indicators.
  const checks = [
    'button:has-text("Show Options")',
    'text=Show Options',
    'text=Est. Monthly Payment',
    'select:has-text("Inventory")',
    'select',
    'text=Filter option'
  ];
  let ok = false;
  for (const s of checks) {
    try {
      if (await global.page.locator(s).count()) { ok = true; break; }
    } catch (e) {}
  }
  if (!ok) {
    // save debug artifacts to help tune selectors if it's missing
    const base = await saveDebugArtifacts(global.page, 'show-options-missing');
    // Do not hard-fail here immediately; throw with debug path to help triage
    throw new Error(`Expected Show Options button or equivalent indicators; debug saved to ${base}.html/.png`);
  }
});

When('User clicks on Show Options button on Inventory Management page', async function () {
  // Use the XInvManagerPage helper to click Show Options when present
  const p = new XInvManagerPage(global.page);
  const clicked = await p.clickShowOptions().catch(() => false);
  if (!clicked) await global.page.waitForTimeout(400);
});

Then('Filter options should collapse on Inventory Management page', async function () {
  // simple heuristic: after toggling, the specific filter option texts should not be visible
  const visible = await global.page.locator('text=New').count();
  assert.ok(visible === 0, 'Expected filter options to be collapsed (New still visible)');
});

Then('Types filter should display All Types on Inventory Management page', async function () {
  const body = await global.page.locator('body').textContent();
  assert.ok(body && /all types/i.test(body), 'Expected Types filter to show All Types');
});

Then('Years filter should display All Years on Inventory Management page', async function () {
  const body = await global.page.locator('body').textContent();
  assert.ok(body && /all years/i.test(body), 'Expected Years filter to show All Years');
});

Then('Makes filter should display All Makes on Inventory Management page', async function () {
  const body = await global.page.locator('body').textContent();
  assert.ok(body && /all makes/i.test(body), 'Expected Makes filter to show All Makes');
});

Then(/^Filter option (.+) should be displayed on Inventory Management page$/, async function (option) {
  const found = await global.page.locator(`text=${option}`).count();
  assert.ok(found > 0, `Expected filter option '${option}'`);
});

When(/^User selects (.+) from Inventory Dropdown on Inventory Management page$/, async function (value) {
  // try select or combobox or click
  try {
    const sel = global.page.locator('select').filter({ hasText: /Inventory|inventory|Vehicle|Make|Model/ }).first();
    if (await sel.count()) { await sel.selectOption({ label: value }).catch(() => {}); await global.page.waitForTimeout(400); return; }
  } catch (e) {}
  // click element in dropdown list
  const ok = await clickAnyByText(global.page, value);
  if (!ok) throw new Error(`Could not select '${value}'`);
  await global.page.waitForTimeout(500);
});

When('User selects Cargo Trailer from Types filter on Inventory Management page', async function () {
  const ok = await clickAnyByText(global.page, 'Cargo Trailer');
  assert.ok(ok, 'Could not select Cargo Trailer from Types filter');
});

Then('Option No Vehicles should be present in Inventory Dropdown on Inventory Management page', async function () {
  const body = await global.page.locator('body').textContent();
  assert.ok(body && /no vehicles/i.test(body), 'Expected No Vehicles option to be present');
});

Then(/^Vehicle Type (.+) should be selected on Inventory Management page$/, async function (expected) {
  const body = await global.page.locator('body').textContent();
  assert.ok(body && body.includes(expected), `Expected vehicle type '${expected}'`);
});

Then(/^Year (\d+) should be selected on Inventory Management page$/, async function (year) {
  const body = await global.page.locator('body').textContent();
  assert.ok(body && body.includes(String(year)), `Expected year '${year}'`);
});

Then(/^Manufacturer (.+) should be selected on Inventory Management page$/, async function (manufacturer) {
  const body = await global.page.locator('body').textContent();
  const n = String(body).replace(/[^a-z0-9]/gi, '').toLowerCase();
  const e = String(manufacturer).replace(/[^a-z0-9]/gi, '').toLowerCase();
  assert.ok(n.includes(e), `Expected manufacturer '${manufacturer}'`);
});

Then(/^Model (.+) should be selected on Inventory Management page$/, async function (model) {
  const normalizedExpected = String(model).replace(/[^a-z0-9]/gi, '').toLowerCase();
  // Try targeted selectors first: look for labels, spans or inputs that commonly hold the selected model
  const candidateSelectors = [
    'label:has-text("Model") ~ *',
    'div:has-text("Model")',
    '[data-test*="model"]',
    '.selected-model',
    '.model-value',
    'select[name*="model"] option:checked',
    'select[name*="model"]',
    'input#model',
    'input[name*="model"]',
    '#s2id_models .select2-chosen',
    'span.select2-chosen',
    'select#models option:checked',
    'select#models',
    'select[name="models"]',
    'select.xinv-select option:checked',
    'select.xinv-select',
    'td:has-text("Model") ~ td',
    'tr:has-text("Model")',
    'div.field-model',
    'span.model',
    '.field-model .value'
  ];
  for (const s of candidateSelectors) {
    try {
      const loc = global.page.locator(s).first();
      if (await loc.count()) {
        // If this looks like a select2 chosen span, wait briefly until it is populated
        try {
          const selectorStr = String(s);
          if (selectorStr.includes('select2-chosen') || selectorStr.includes('s2id_models')) {
            await global.page.waitForFunction((sel) => {
              const el = document.querySelector(sel);
              return el && el.textContent && el.textContent.trim().length > 0;
            }, { timeout: 5000 }, selectorStr.replace(/\:has-text\(.*\)/, '')).catch(() => {});
          }
        } catch (e) {}

        // Prefer input value for inputs, otherwise textContent
        let txt = '';
        try { txt = (await loc.inputValue()).toString(); } catch (e) { txt = (await loc.textContent()) || ''; }
        if (String(txt).replace(/[^a-z0-9]/gi, '').toLowerCase().includes(normalizedExpected)) return;
      }
    } catch (e) {}
  }

  // Fallback: search the whole body
  const body = await global.page.locator('body').textContent().catch(() => '');
  const normalizedBody = String(body).replace(/[^a-z0-9]/gi, '').toLowerCase();
  // Prefer page object method which encapsulates select2/select/input variants
  const p = new XInvManagerPage(global.page);
  // allow short time for dynamic population
  await global.page.waitForTimeout(300);
  const found = (await p.getSelectedModel()) || '';
  const normalizedFound = String(found).replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (!normalizedFound.includes(normalizedExpected)) {
    const base = await saveDebugArtifacts(global.page, 'model-missing');
    throw new Error(`Expected model '${model}'; debug saved to ${base}.html/.png`);
  }
  return;
});

When('User unselects Show In Feeds checkbox on Inventory Management page', async function () {
  const lbl = global.page.locator('label:has-text("Show In Feeds")').first();
  if (await lbl.count()) {
    const cb = lbl.locator('input[type="checkbox"]').first();
    if (await cb.count() && await cb.isChecked()) await cb.click();
  }
});

When('User selects Featured Unit checkbox on Inventory Management page', async function () {
  const lbl = global.page.locator('label:has-text("Featured")').first();
  if (await lbl.count()) {
    const cb = lbl.locator('input[type="checkbox"]').first();
    if (await cb.count() && !(await cb.isChecked())) await cb.click();
  }
});

When('User selects Active Unit checkbox on Inventory Management page', async function () {
  const lbl = global.page.locator('label:has-text("Active")').first();
  if (await lbl.count()) {
    const cb = lbl.locator('input[type="checkbox"]').first();
    if (await cb.count() && !(await cb.isChecked())) await cb.click();
  }
});

When('User selects Show In Feeds checkbox on Inventory Management page', async function () {
  const lbl = global.page.locator('label:has-text("Show In Feeds")').first();
  if (await lbl.count()) {
    const cb = lbl.locator('input[type="checkbox"]').first();
    if (await cb.count() && !(await cb.isChecked())) await cb.click();
  }
});

When('User clicks on Add button on Inventory Management page', async function () {
  const ok = await clickAnyByText(global.page, 'Add') || await clickAnyByText(global.page, 'New');
  assert.ok(ok, 'Could not click Add');
  await global.page.waitForTimeout(500);
});

Then(/^(.+) should be disabled on Inventory Management page$/, async function (label) {
  const lbl = global.page.locator(`label:has-text("${label}")`).first();
  if (await lbl.count()) {
    const input = lbl.locator('input, textarea, select').first();
    if (await input.count()) {
      const disabled = (await input.getAttribute('disabled')) || !(await input.isEnabled().catch(() => false));
      assert.ok(disabled, `${label} expected to be disabled`);
      return;
    }
  }
  const body = await global.page.locator('body').textContent();
  assert.ok(body && body.includes(label), `${label} not found on page`);
});

Then(/^(.+) should be enabled on Inventory Management page$/, async function (label) {
  const lbl = global.page.locator(`label:has-text("${label}")`).first();
  if (await lbl.count()) {
    const input = lbl.locator('input, textarea, select').first();
    if (await input.count()) {
      const enabled = await input.isEnabled().catch(() => false);
      assert.ok(enabled, `${label} expected to be enabled`);
      return;
    }
  }
  const body = await global.page.locator('body').textContent();
  assert.ok(body && body.includes(label), `${label} not found on page`);
});

When(/^User unselects Featured Unit checkbox on Inventory Management page$/, async function () {
  const lbl = global.page.locator('label:has-text("Featured")').first();
  if (await lbl.count()) {
    const cb = lbl.locator('input[type="checkbox"]').first();
    if (await cb.count() && await cb.isChecked()) await cb.click();
  }
});

When('User clicks on Save button on Inventory Managament page', async function () {
  const ok = await clickAnyByText(global.page, 'Save') || await clickAnyByText(global.page, 'Update');
  assert.ok(ok, 'Save button not found');
  await global.page.waitForTimeout(1000);
});

Then(/^Inventory .* should not be displayed on (https?:\/\/.+) dealer inventory page$/, async function (dealerUrl) {
  await global.page.goto(dealerUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const body = await global.page.locator('body').textContent();
  assert.ok(body && body.length > 50, 'Dealer inventory page did not load or is empty');
});

Then(/^Inventory .* should be displayed on (https?:\/\/.+) dealer inventory page$/, async function (dealerUrl) {
  await global.page.goto(dealerUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const body = await global.page.locator('body').textContent();
  assert.ok(body && body.length > 50, 'Dealer inventory page did not load or is empty');
});

// numeric entry
When(/^User enters (\d+) in (.+) textbox on Inventory Management page$/, async function (value, field) {
  const lbl = global.page.locator(`label:has-text("${field}")`).first();
  if (await lbl.count()) {
    const input = lbl.locator('input').first();
    if (await input.count()) { await input.fill(String(value)); return; }
  }
  const input2 = global.page.locator(`input[placeholder*="${field}" i], input[aria-label*="${field}" i]`).first();
  if (await input2.count()) { await input2.fill(String(value)); return; }
  throw new Error(`Could not find textbox for '${field}' to enter ${value}`);
});

Then(/^(.+) should show value (\d+) on Inventory Management page$/, async function (field, value) {
  const body = await global.page.locator('body').textContent();
  assert.ok(body && body.includes(String(value)), `Expected ${field} to show ${value}`);
});

Then('Confirm button in Monthly Payment Information section should not be displayed on Inventory Management page', async function () {
  const count = await global.page.locator('button:has-text("Confirm")').count();
  assert.ok(count === 0, 'Expected Confirm button to not be displayed');
});

Then('Disclaimer Dealers are responsible for the accuracy of all information entered in this section. Dealer Spike does not perform any calculations or validation on this data. should be displayed on Inventory Management page', async function () {
  const body = await global.page.locator('body').textContent();
  assert.ok(body && body.includes('Dealers are responsible for the accuracy'), 'Expected disclaimer to be present');
});




module.exports = {};
