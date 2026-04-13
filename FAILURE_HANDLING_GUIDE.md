# Test Failure Handling & Screenshots

## Overview

When tests fail, your framework automatically captures screenshots and generates detailed failure reports. This guide shows how to:
- Capture failure screenshots
- Analyze failures
- Debug issues
- Recover from failures

---

## 📸 Automatic Screenshot Capture

The framework automatically captures screenshots on test failure via `Setup/hooks.js`:

```javascript
After(async function (scenario) {
  if (scenario.result.status === Status.FAILED) {
    try {
      const screenshot = await global.page.screenshot({ fullPage: true });
      this.attach(screenshot, 'image/png');
      // Also saved to reports/ directory
    } catch (error) {
      console.error('Screenshot capture failed');
    }
  }
});
```

### Screenshot Locations

```
📁 reports/
├── *.png                  ← Auto-captured screenshots
├── example-failure-screenshot.html  ← Visual failure example
├── cucumber-report.html   ← HTML test report
└── cucumber-report.json   ← JSON results
```

---

## 🎯 Manual Screenshot in Steps

### Capture During Step Execution

```javascript
When('I update the inventory', async function () {
  const page = global.page;
  
  try {
    // ... perform action ...
    await page.click('button[data-test="save"]');
  } catch (error) {
    // Manually capture screenshot on error
    const path = `reports/inventory_update_failed_${Date.now()}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`Screenshot saved: ${path}`);
    throw error;
  }
});
```

### Helper Function for Screenshots

```javascript
const fs = require('fs');
const path = require('path');

async function captureScreenshot(page, stepName) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = stepName.replace(/[^a-z0-9]/gi, '_').slice(0, 100);
    const filePath = path.join('reports', `${safeName}-${timestamp}.png`);
    
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports', { recursive: true });
    }
    
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`📸 Screenshot: ${filePath}`);
    return filePath;
  } catch (error) {
    console.warn(`Could not capture screenshot: ${error.message}`);
    return null;
  }
}

// Usage
Then('I verify the filter applied', async function () {
  const page = global.page;
  
  try {
    // ... verification logic ...
  } catch (error) {
    await captureScreenshot(page, 'filter_verification_failed');
    throw error;
  }
});
```

---

## 🔍 Analyzing Failure Screenshots

### Step 1: Locate the Screenshot

```bash
# Find recent failed screenshots
ls -lt reports/*.png | head -5

# View in VS Code
code reports/filter_verification_failed-2026-03-24T*.png
```

### Step 2: Check the Failure Report

```bash
# View Allure report
npm run report:open

# Check raw JSON results
cat allure-results/cucumber-report.json | jq '.[] | select(.status=="failed")'
```

### Step 3: Review Step Details

Looking at failure screenshot, check:
1. **Is the element present?** - If not, selector might be wrong
2. **Is it visible?** - Check z-index, opacity, overflow
3. **Is it clickable?** - Check if covered by modal/overlay
4. **What text do you see?** - Compare expected vs actual

---

## 🛠️ Common Failure Scenarios

### Scenario 1: Element Not Found

**Screenshot shows**: Element is missing from page

**Causes**:
- Wrong CSS selector
- Element hasn't loaded yet
- Element inside iframe
- Element conditionally rendered

**Debug Steps**:
```javascript
When('I select {string} from make filter', async function (make) {
  const page = global.page;
  
  // Debug: Find what's actually in the DOM
  console.log('🔍 Available make options:');
  const options = await page.locator('[class*="make-option"]').all();
  for (const opt of options) {
    const text = await opt.textContent();
    console.log(`  - "${text}"`);
  }
  
  // Try to find the option
  const selector = `[class*="make-option"]:has-text("${make}")`;
  const count = await page.locator(selector).count();
  console.log(`Results for "${make}": ${count}`);
});
```

### Scenario 2: Element Not Clickable

**Screenshot shows**: Element is visible but click failed

**Causes**:
- Element covered by modal/overlay
- Element disabled or read-only
- Parent container has `pointer-events: none`
- Element still loading

**Debug Steps**:
```javascript
// Check if element is clickable
const element = page.locator('[data-test="apply-button"]');
const isEnabled = await element.isEnabled();
const isVisible = await element.isVisible();
const boundingBox = await element.boundingBox();

console.log({
  isEnabled,
  isVisible,
  boundingBox
});

// Force scroll into view
await element.scrollIntoViewIfNeeded();
await element.click({ force: true });
```

### Scenario 3: Stale Element

**Screenshot shows**: Page changed unexpectedly

**Causes**:
- Page reloaded mid-action
- DOM refreshed
- Navigation happened

**Solution**:
```javascript
// Use retry logic
async function retryClick(page, selector, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.waitForSelector(selector);
      await page.click(selector);
      return;
    } catch (error) {
      if (i < maxRetries - 1) {
        console.log(`Retry ${i + 1}/${maxRetries}...`);
        await new Promise(r => setTimeout(r, 1000));
      } else {
        throw error;
      }
    }
  }
}
```

### Scenario 4: Wrong Data

**Screenshot shows**: Element found but content different

**Example**:
```
Expected: "Honda"
Found: "Yamaha"
```

**Debug**:
```javascript
Then('make filter should show Honda', async function () {
  const page = global.page;
  const selected = await page.locator('[data-test="make-value"]').textContent();
  
  console.log(`Selected make: "${selected}"`);
  console.log(`Expected: "Honda"`);
  
  if (selected !== 'Honda') {
    await page.screenshot({ path: 'reports/debug-make-filter.png', fullPage: true });
    throw new Error(`Wrong make selected: ${selected}`);
  }
});
```

---

## 📊 Failure Report Example

### Test Output

```
❌ Scenario: User filters inventory by make
   ✓ Given user opens inventory page
   ✓ When I select category Honda
   ✗ When I select make Motorcycles from makes filter
     
     Error: Could not find "Motorcycles" in make filter
     Available: Honda, Yamaha, Harley-Davidson
     Screenshot: reports/make-motorcycles-not-found-2026-03-24T*.png
```

### Screenshot Analysis

From `example-failure-screenshot.html`:

```
Image shows:
└─ Inventory page with filter panel
   ├─ Category: Honda ✓ (selected)
   ├─ Make filter showing:
   │  ├─ Honda
   │  ├─ Yamaha
   │  └─ Harley-Davidson
   │  └─ ❌ "Motorcycles" NOT FOUND
   └─ Results: 3 base motorcycles
```

**Conclusion**: "Motorcycles" is NOT a valid make option, only a category

---

## 🔧 Debugging Tools

### Browser Inspector

```javascript
// Get HTML of filter area
When('I debug the make filter', async function () {
  const page = global.page;
  
  const html = await page.locator('[class*="make-filter"]').innerHTML();
  console.log('=== Make Filter HTML ===');
  console.log(html);
});
```

### Page State Logging

```javascript
Then('I save page state for debugging', async function () {
  const page = global.page;
  
  const state = {
    url: page.url(),
    title: await page.title(),
    elementCount: await page.locator('body').count(),
    selectedMake: await page.locator('[data-test="selected-make"]').textContent(),
    resultCount: await page.locator('[class*="result"]').count()
  };
  
  console.log('=== Page State ===');
  console.log(JSON.stringify(state, null, 2));
  
  // Save to file
  fs.writeFileSync('reports/page-state.json', JSON.stringify(state, null, 2));
});
```

---

## 📝 Best Practices for Handling Failures

### 1. Clear Error Messages

```javascript
// ✅ GOOD
throw new Error(
  `Failed to select make "${make}"\n` +
  `Expected: "${make}"\n` +
  `Available: ${options.join(', ')}\n` +
  `Screenshot: reports/debug-make.png`
);

// ❌ BAD
throw new Error('Selector not found');
```

### 2. Capture Context

```javascript
async function captureDebugInfo(page, stepName) {
  const screenshot = await page.screenshot({ path: `reports/${stepName}.png` });
  const html = await page.content();
  
  fs.writeFileSync(
    `reports/${stepName}-source.html`,
    html
  );
  
  console.log(`Debug info saved for "${stepName}"`);
}
```

### 3. Temporary Screenshots for Analysis

```javascript
Then('I debug current page state', async function () {
  const page = global.page;
  
  // Temporary screenshot - removed after test
  await page.screenshot({ 
    path: `reports/debug-${Date.now()}.png`,
    fullPage: true 
  });
  
  console.log('📸 Debug screenshot taken');
});
```

---

## 🎯 Failure Recovery

### Retry Failed Step

```javascript
async function retryStep(stepFunction, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await stepFunction();
    } catch (error) {
      console.warn(`Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        // Wait before retry
        await new Promise(r => setTimeout(r, 2000));
      } else {
        throw error;
      }
    }
  }
}

// Usage
When('I robustly select make {string}', async function (make) {
  const page = global.page;
  
  await retryStep(async () => {
    const option = page.locator(`[data-make="${make}"]`);
    await option.click();
  });
});
```

### Clear Cache on Failure

```javascript
After(async function (scenario) {
  if (scenario.result.status === 'FAILED') {
    // Clear browser cache
    const context = global.context;
    if (context) {
      await context.clearCookies();
      await page.evaluate(() => window.localStorage.clear());
      
      console.log('🧹 Cache cleared after failure');
    }
  }
});
```

---

## 📊 Analyzing Reports

### View Allure Dashboard

```bash
npm run report:open
```

**Dashboard shows**:
- ✅ Passed tests
- ❌ Failed tests
- ⏭️ Skipped tests
- 📊 Statistics
- 📸 Screenshots
- 📝 Step details

### Review JSON Results

```bash
# Pretty print failures
npx jq '.[] | select(.status=="FAILED")' allure-results/cucumber-report.json

# Count by status
npx jq 'group_by(.status) | map({status: .[0].status, count: length})' \
  allure-results/cucumber-report.json
```

---

## 📋 Failure Checklist

When test fails:

- [ ] Screenshot captured automatically
- [ ] Error message is clear and helpful
- [ ] Available options logged (if applicable)
- [ ] DOM state saved (if debugging)
- [ ] Selector verified in browser
- [ ] Test retried if flaky
- [ ] Root cause identified
- [ ] Step definition updated
- [ ] Test re-run to verify fix

---

## 💡 Pro Tips

1. **Take supplementary screenshots** at key moments for better debugging

2. **Log everything** - page state, element counts, available options

3. **Use data attributes** - Makes selectors stable and debugging easier

4. **Validate before action** - Check element exists before clicking

5. **Add explicit waits** - Don't rely on implicit waits alone

6. **Save page HTML** - Keep HTML snapshot for DOM analysis

7. **Review reports regularly** - Spot patterns in failures

---

## 📚 Example Files

- `example-failure-screenshot.html` - Visual failure example
- `reports/` - Auto-captured screenshots directory
- `STEP_DEFINITIONS_GUIDE.md` - Step definition best practices
- `STEP_TEMPLATE.js` - Template with error handling

---

**Key Takeaway**: Good error handling with screenshots makes debugging 10x faster!
