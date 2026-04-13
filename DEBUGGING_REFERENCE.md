# Debugging Reference & Common Selectors

## Quick Debugging Commands

### Check if Element Exists

```javascript
// In your step definition
When('I debug selector {string}', async function (selector) {
  const page = global.page;
  
  try {
    // Count elements
    const count = await page.locator(selector).count();
    console.log(`✓ Found ${count} element(s) with: ${selector}`);
    
    // Get text
    if (count > 0) {
      const texts = await page.locator(selector).allTextContents();
      console.log(`  Texts: ${texts.join(', ')}`);
    }
    
    // Get attributes
    if (count > 0) {
      const attrs = await page.locator(selector).first().getAttribute('class');
      console.log(`  Classes: ${attrs}`);
    }
  } catch (error) {
    console.error(`✗ Selector not found: ${selector}`);
    console.error(`  Error: ${error.message}`);
  }
});
```

Run in terminal:
```bash
npm test -- --name "I debug selector.*filter"
```

---

## Common Selector Patterns

### By Data Attribute (RECOMMENDED)

```javascript
// HTML
<button data-test="submit">Submit</button>
<input data-id="email-field" />

// Selectors
page.locator('[data-test="submit"]')
page.locator('[data-id="email-field"]')
```

**Pros**: Stable, not affected by CSS changes
**Cons**: Requires developer to add data attributes

### By Class

```javascript
// HTML
<button class="btn btn-primary save-btn">Save</button>

// Selectors
page.locator('.save-btn')
page.locator('.btn.btn-primary')
page.locator('button.btn-primary')
```

**Pros**: Commonly available
**Cons**: Changes with styling updates

### By ID

```javascript
// HTML
<form id="inventory-form">

// Selector
page.locator('#inventory-form')
```

**Pros**: Unique, stable
**Cons**: Not always available

### By Text (Last Resort)

```javascript
// HTML
<button>Apply Filters</button>

// Selector (exact match)
page.locator('button:has-text("Apply Filters")')

// Or with contains (partial match)
page.locator('button:has-text("Apply")')
```

**Pros**: No need for attributes
**Cons**: Breaks with text changes, case-sensitive

### Combined Selectors

```javascript
// Parent -> Child
page.locator('[class*="filter"] button.apply')

// Multiple conditions
page.locator('[data-test="make"] >> text=Honda')

// Nth child
page.locator('[class*="option"]:nth-child(2)')
```

---

## Finding Elements in Browser DevTools

### Method 1: Copy Selector from DevTools

```
1. Open DevTools (F12)
2. Click Elements tab
3. Find the element
4. Right-click → Copy → Copy selector
5. Paste into test file
```

**Result**:
```
#inventory > div.filter-panel > button.save
```

### Method 2: XPath

```javascript
// XPath selector
page.locator('xpath=//button[text()="Save"]')

// More complex
page.locator('xpath=//form[@id="inventory"]//button[@data-test="submit"]')
```

### Method 3: Role-Based (Recommended for Accessibility)

```javascript
// Find by role (more stable to DOM changes)
page.locator('role=button[name="Save"]')
page.locator('role=textbox[name="Search"]')
page.locator('role=combobox[name="Make"]')
```

---

## Test Data Setup

### Sample Data Used in Framework

**Inventory Scenarios**:
```javascript
// From test setup
BASE_URL = 'https://dealerspike.com'
EMAIL = 'admin@dealerspike.com'
PASSWORD = 'ds4321'

// Sample inventory filter values
Makes: Honda, Yamaha, Harley-Davidson, KTM
Categories: Motorcycles, ATVs, Scooters
Years: 2022, 2023, 2024, 2025
Prices: Budget, Mid-range, Premium
```

### How to Override

**Create `.env` file**:
```
BASE_URL=https://your-site.com
EMAIL=your-email@example.com
PASSWORD=your-password
PROTOCOL=https
```

**In hooks.js**:
```javascript
require('dotenv').config();

const testEnv = {
  url: process.env.BASE_URL || 'https://dealerspike.com',
  email: process.env.EMAIL || 'admin@dealerspike.com',
  password: process.env.PASSWORD || 'ds4321'
};
```

---

## Screenshot Analysis Template

When test fails:

```
1. WHAT HAPPENED?
   ├─ Step that failed: ________________
   ├─ Expected result: ________________
   └─ Actual result: __________________

2. SCREENSHOT ANALYSIS
   ├─ Is element visible? Yes/No
   ├─ Is element in expected position? Yes/No
   ├─ Is element clickable? Yes/No
   └─ Page loaded completely? Yes/No

3. LIKELY CAUSES (Check in order)
   ├─ [ ] Wrong selector (test in DevTools)
   ├─ [ ] Element not loaded (add wait)
   ├─ [ ] Element hidden/disabled (check CSS)
   ├─ [ ] Wrong test data (check .env)
   ├─ [ ] Page navigation failed (check URL)
   └─ [ ] Race condition (add retry logic)

4. FIX APPLIED
   ├─ Solution: ________________________
   ├─ File changed: _____________________
   └─ Re-tested: Yes/No
```

---

## Common Errors & Solutions

### Error: "Could not find selector"

```
❌ Error: locator.click: Timeout 30000ms exceeded
   waiting for locator('[data-test="make"]')
```

**Solutions**:
1. Verify selector exists in browser DevTools
2. Check for iframe - selector might be inside iframe
3. Add wait before clicking
4. Use multiple selector strategies

```javascript
// Solution: Try multiple selectors
async function findAndClick(page, selectors) {
  for (const selector of selectors) {
    try {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await page.locator(selector).click();
        console.log(`✓ Clicked using: ${selector}`);
        return;
      }
    } catch (e) {
      // Try next selector
    }
  }
  throw new Error(`All selectors failed: ${selectors.join(', ')}`);
}

// Usage
await findAndClick(page, [
  '[data-test="make"]',
  '.make-selector',
  '[class*="make"]',
  'button:has-text("Select Make")'
]);
```

### Error: "Element is not clickable"

```
❌ Error: locator.click: Element is not stable
```

**Solutions**:
1. Scroll into view
2. Wait for element to be stable
3. Click with force flag

```javascript
// Solution: Force click after scroll
await page.locator(selector).scrollIntoViewIfNeeded();
await page.waitForTimeout(500); // Brief pause for animation
await page.locator(selector).click({ force: true });
```

### Error: "Timeout waiting for selector"

```
❌ Error: Timeout 30000ms exceeded waiting for locator
```

**Solutions**:
1. Increase timeout
2. Check network (page still loading)
3. Verify element exists in DOM

```javascript
// Solution: Increase timeout
await page.waitForSelector('[data-test="results"]', { timeout: 60000 });

// Or: Check network is idle
await page.waitForLoadState('networkidle');
```

### Error: "Wrong element found"

```
Expected: "Honda"
Found: "Yamaha"
```

**Solutions**:
1. Use more specific selector
2. Add parent context
3. Filter by visibility

```javascript
// Solution: Be more specific
// ❌ Too broad
page.locator('.option')

// ✓ Better
page.locator('[data-test="make"] .option')

// ✓ Best
page.locator('[data-test="make"] [data-value="honda"]')
```

---

## Debugging Workflow

### Step 1: Run Test with Detailed Logging

```bash
# Run single test with verbose output
npm test -- --name "inventory filter"

# With extra logging
DEBUG=pw:api npm test
```

### Step 2: Get Actual Page State

```javascript
When('I print page debug info', async function () {
  const page = global.page;
  
  console.log('\n=== DEBUG INFO ===');
  console.log(`URL: ${page.url()}`);
  console.log(`Title: ${await page.title()}`);
  
  // List all buttons
  const buttons = await page.locator('button').allTextContents();
  console.log(`Buttons found: ${buttons.join(', ')}`);
  
  // List all inputs
  const inputs = await page.locator('input').count();
  console.log(`Inputs found: ${inputs}`);
  
  // Console errors
  page.on('console', msg => console.log(`> ${msg.text()}`));
  page.on('pageerror', error => console.log(`Page error: ${error}`));
});
```

### Step 3: Interactive Debugging

```javascript
// Pause execution for manual inspection
When('I pause for debugging', async function () {
  const page = global.page;
  
  console.log('⏸️  Test paused. Open DevTools and inspect.');
  console.log(`Page URL: ${page.url()}`);
  
  // Wait 60 seconds for manual inspection
  await new Promise(resolve => setTimeout(resolve, 60000));
  
  console.log('▶️  Resuming test...');
});
```

### Step 4: Save Full HTML

```javascript
When('I save page HTML', async function () {
  const page = global.page;
  const html = await page.content();
  
  fs.writeFileSync('reports/page-debug.html', html);
  console.log('📄 HTML saved to reports/page-debug.html');
  
  // Open in browser
  console.log('   Open in browser: file:///c:/path/to/reports/page-debug.html');
});
```

---

## Performance Debugging

### Slow Step Detection

```javascript
// Add timing
When('I perform action that might be slow', async function () {
  const start = Date.now();
  const page = global.page;
  
  try {
    await page.click('[data-test="apply"]');
    await page.waitForLoadState('networkidle');
  } finally {
    const duration = Date.now() - start;
    console.log(`⏱️  Step took ${duration}ms`);
    
    if (duration > 5000) {
      console.warn('⚠️  Slow step detected!');
      await page.screenshot({ path: 'reports/slow-step.png' });
    }
  }
});
```

### Network Monitoring

```javascript
// Log all network requests
page.on('request', request => {
  console.log(`→ ${request.method()} ${request.url()}`);
});

page.on('response', response => {
  console.log(`← ${response.status()} ${response.url()}`);
});
```

---

## Tips for Stable Selectors

### ✅ GOOD PRACTICES

```javascript
// 1. Use data attributes (most stable)
await page.locator('[data-test="filter-apply"]').click();

// 2. Use role-based (accessible)
await page.locator('role=button[name="Apply"]').click();

// 3. Combine multiple attributes
await page.locator('[data-test="make"][class*="selector"]').click();

// 4. Use text as last resort with exact match
await page.locator('text="Save" >> visible=true').click();
```

### ❌ BAD PRACTICES

```javascript
// 1. Overly long XPath
xpath=//*[contains(text(), 'Apply')]/..

// 2. Index-based (breaks with DOM changes)
nth-child(3)

// 3. Pure text match (breaks with translation)
text=Apply Filters

// 4. Generic class names
.btn, .container, .item
```

---

## Reference Quick Commands

```bash
# Run tests with screenshots
npm test

# View Allure report
npm run report:open

# Run specific feature
npm test -- tests/features/UIFeature/inventory_filters.feature

# Run with debugging enabled
DEBUG=pw:api npm test

# Check installed packages
npm list

# Update packages
npm update

# Clear node_modules and reinstall
rm -r node_modules && npm install
```

---

**Remember**: When in doubt, take a screenshot, print the page state, and review DevTools!
