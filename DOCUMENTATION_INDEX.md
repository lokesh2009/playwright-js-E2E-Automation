# 🎯 Complete Framework Documentation Index

Welcome! This is your **master guide** to the Playwright + Cucumber + JavaScript + Allure testing framework. Start here to find what you need.

---

## 📚 Documentation Files

### Getting Started (Read These First)

| Document | Purpose | Time |
|----------|---------|------|
| **START_HERE.md** | Quick 3-step setup and overview | 5 min |
| **SETUP_SUMMARY.md** | Executive summary of framework setup | 10 min |
| **SETUP_COMPLETE.md** | Comprehensive setup guide with troubleshooting | 30 min |

### Learning & Reference

| Document | Purpose | Time |
|----------|---------|------|
| **STEP_DEFINITIONS_GUIDE.md** | How to write step definitions (patterns, templates, examples) | 20 min |
| **FAILURE_HANDLING_GUIDE.md** | Handling test failures, screenshots, and debugging | 15 min |
| **DEBUGGING_REFERENCE.md** | Debugging commands, selectors, and troubleshooting | 20 min |

### Code Examples & Templates

| File | Purpose | Location |
|------|---------|----------|
| **STEP_TEMPLATE.js** | Reusable template for step definitions | `tests/steps/ui/STEP_TEMPLATE.js` |
| **inventory_filters_example_steps.js** | Real-world implementation example | `tests/steps/ui/inventory_filters_example_steps.js` |
| **example-failure-screenshot.html** | Visual example of failure | `reports/example-failure-screenshot.html` |

---

## 🚀 Quick Start (3 Steps)

### Step 1: Verify Setup ✓

```bash
# Open terminal
npm test --version

# Check packages installed
npm list | grep -E "(playwright|cucumber|allure)"
```

**Expected Output**: Playwright 1.58.2, Cucumber 9.5.0 installed

### Step 2: Run First Test ✓

```bash
# Run all tests
npm test

# Run specific feature
npm test -- tests/features/UIFeature/login.feature

# Run single scenario
npm test -- --name "Login with valid credentials"
```

### Step 3: View Results ✓

```bash
# Open Allure report
npm run report:open

# Or open manual report
open reports/cucumber-report.html
```

---

## 📖 Learning Paths

### Path 1: "I want to write a new step definition"

1. Read: [STEP_DEFINITIONS_GUIDE.md](STEP_DEFINITIONS_GUIDE.md) - Pattern overview (10 min)
2. Study: [STEP_TEMPLATE.js](tests/steps/ui/STEP_TEMPLATE.js) - Template structure (15 min)
3. Reference: [inventory_filters_example_steps.js](tests/steps/ui/inventory_filters_example_steps.js) - Real example (10 min)
4. Create: Copy template and modify for your case
5. Test: `npm test -- --name "your feature name"`

### Path 2: "A test failed, can you help debug?"

1. Check: Screenshot in `reports/` folder
2. Read: [FAILURE_HANDLING_GUIDE.md](FAILURE_HANDLING_GUIDE.md) - Failure analysis (10 min)
3. Use: [DEBUGGING_REFERENCE.md](DEBUGGING_REFERENCE.md) - Debug techniques (5 min)
4. Identify: Root cause using provided debugging steps
5. Fix: Update step definition or test data
6. Retry: `npm test -- --name "failing test"`

### Path 3: "I want to understand the entire setup"

1. Start: [SETUP_COMPLETE.md](SETUP_COMPLETE.md) - Full overview (30 min)
2. Review: Folder structure below
3. Check: Configuration files (cucumber.js, Setup/hooks.js, package.json)
4. Run: `npm test` to verify everything works
5. Explore: Navigate through feature files to understand test organization

### Path 4: "I'm having issues"

1. Consult: [SETUP_COMPLETE.md](SETUP_COMPLETE.md#troubleshooting) - Troubleshooting section
2. Check: [DEBUGGING_REFERENCE.md](DEBUGGING_REFERENCE.md) - Common errors
3. Verify: `npm test --version` and dependencies
4. Inspect: Look at recent screenshot in `reports/`
5. Review: Test output in terminal

---

## 📁 Folder Structure

```
📦 Playwright E2E Framework
├── 📄 Configuration Files
│  ├── cucumber.js ..................... Cucumber test runner config
│  ├── cucumber.debug.js ............... Debug configuration
│  ├── playwright.config.js ............ Playwright browser config
│  ├── package.json .................... NPM dependencies & scripts
│  └── .env ........................... Environment variables
│
├── 📂 tests/ ....................... Test definitions (MAIN FOLDER)
│  ├── features/ ..................... Feature files (Gherkin syntax)
│  │  ├── UIFeature/ ................ UI tests
│  │  │  ├── login.feature
│  │  │  ├── inventory_filters.feature
│  │  │  ├── inventory_search.feature
│  │  │  └── ... (15 features total)
│  │  ├── APIFeature/ .............. API tests
│  │  └── performance/ ............. Performance tests
│  │
│  └── steps/ ....................... Step definitions (JS implementation)
│     ├── ui/ ....................... UI step definitions
│     │  ├── login_steps.js
│     │  ├── inventory_filters_steps.js
│     │  ├── STEP_TEMPLATE.js ........ 👈 Copy this when creating new steps
│     │  └── inventory_filters_example_steps.js 👈 Reference real example
│     ├── api/ ....................... API step definitions
│     └── performance/ ............... Performance step definitions
│
├── 📂 Pages/ ...................... Page Object Models (UI element selectors)
│  ├── LoginPage.js
│  ├── InventoryPage.js
│  ├── InventoryManagerPage.js
│  └── ... (7 page objects total)
│
├── 📂 Setup/ ...................... Framework hooks & setup
│  └── hooks.js ..................... Before/After hooks, browser setup
│
├── 📂 Utility/ .................... Helper functions
│  ├── apiHelper.js ................. API request utilities
│  └── util.js ..................... Common utility functions
│
├── 📂 reports/ ................ Test reports & screenshots
│  ├── cucumber-report.html ........ HTML test report
│  ├── example-failure-screenshot.html 👈 Example failure format
│  ├── *.png ....................... Auto-captured screenshots on failure
│  └── allure-report/ ............. Allure report directory
│
├── 📂 allure-results/ ........... Raw Allure data (generated)
│
├── 📚 Documentation (READ THESE)
│  ├── START_HERE.md ............... 👈 Begin here! (3-step overview)
│  ├── SETUP_COMPLETE.md .......... Comprehensive setup guide
│  ├── SETUP_SUMMARY.md ........... Executive summary
│  ├── STEP_DEFINITIONS_GUIDE.md .. How to write steps (patterns + examples)
│  ├── FAILURE_HANDLING_GUIDE.md .. How to handle failures
│  ├── DEBUGGING_REFERENCE.md .... Quick debugging reference
│  └── DOCUMENTATION_INDEX.md .... This file!
│
└── 📊 Results Files
   ├── cucumber.json .............. Raw test results
   ├── test_output.txt ........... Console output
   └── test-results/junit.xml .... JUnit format results
```

---

## 🎯 Common Tasks

### "Run a specific test"

```bash
# By feature file name
npm test -- tests/features/UIFeature/login.feature

# By scenario name
npm test -- --name "Login with valid credentials"

# All inventory tests
npm test -- --name "inventory"

# All tests
npm test
```

### "Write a new step definition"

1. Choose feature file to work with
2. Copy `tests/steps/ui/STEP_TEMPLATE.js` as template
3. Implement your steps based on [STEP_DEFINITIONS_GUIDE.md](STEP_DEFINITIONS_GUIDE.md)
4. Save as `tests/steps/ui/my_feature_steps.js`
5. Create feature file in `tests/features/UIFeature/`
6. Run: `npm test -- my_feature`

### "Debug a failing test"

1. Take screenshot: `reports/*.png` (auto-captured on failure)
2. Open: [example-failure-screenshot.html](reports/example-failure-screenshot.html) for format reference
3. Compare: Expected vs actual in screenshot
4. Use: [DEBUGGING_REFERENCE.md](DEBUGGING_REFERENCE.md) debugging commands
5. Fix: Update step definition
6. Retry: `npm test -- --name "failing test"`

### "Check browser automation"

```bash
# View verbose logs
DEBUG=pw:api npm test

# Run with headed browser (see browser window)
npm test -- --headed

# Enable screenshots
npm test -- --screenshot
```

### "Analyze test results"

```bash
# Open interactive Allure report
npm run report:open

# View HTML report
open reports/cucumber-report.html

# Check raw JSON
cat allure-results/cucumber-report.json | jq '.'

# Find failures
cat allure-results/cucumber-report.json | jq '.[] | select(.status=="FAILED")'
```

---

## 💾 Useful File Locations

### To Modify

| Need | Location | Edit |
|------|----------|------|
| Test data | `.env` (create if needed) | Email, password, URLs |
| Browser settings | `cucumber.js` | Timeouts, parallel execution |
| Lifecycle hooks | `Setup/hooks.js` | Before/After test setup |
| UI selectors | `Pages/*.js` | Element locators |
| Step definitions | `tests/steps/ui/*.js` | Test implementation |

### To Review

| Need | Location | Purpose |
|------|----------|---------|
| Feature files | `tests/features/UIFeature/` | Test scenarios |
| Step templates | `tests/steps/ui/STEP_TEMPLATE.js` | Copy when creating steps |
| Example implementation | `tests/steps/ui/inventory_filters_example_steps.js` | Real-world patterns |
| API helpers | `Utility/apiHelper.js` | API call utilities |
| Common utilities | `Utility/util.js` | Shared functions |

### To View

| Need | Location |
|-----|----------|
| Test results | `reports/cucumber-report.html` |
| Failure screenshots | `reports/*.png` |
| Allure dashboard | `allure-report/index.html` |
| Raw data | `allure-results/cucumber-report.json` |

---

## 🛠️ NPM Scripts Reference

```bash
# Testing
npm test                      # Run all tests
npm run test:ui             # UI tests only
npm run test:api            # API tests only
npm run test:performance    # Performance tests only
npm run test:login          # Login tests only
npm run test:inventory      # Inventory tests only

# Reporting
npm run report:open         # Open Allure report
npm run report:generate     # Generate Allure report

# Code Quality
npm run lint                # Check for code issues
npm run format              # Format code
npm run debug               # Run tests in debug mode

# Commands (for quick reference)
npm run                     # List all available scripts
```

---

## 🔍 Where to Find Things

### "I need to understand how login works"

1. Read feature: `tests/features/UIFeature/login.feature`
2. Check steps: `tests/steps/ui/login_steps.js`
3. See selectors: `Pages/LoginPage.js`
4. Review guide: [STEP_DEFINITIONS_GUIDE.md](STEP_DEFINITIONS_GUIDE.md)

### "I want to see how filters work"

1. Example feature: `tests/features/UIFeature/inventory_filters.feature`
2. Implementation: `tests/steps/ui/inventory_filters_example_steps.js` (with error handling)
3. Also check: `tests/steps/ui/inventory_filters_steps.js` (original implementation)
4. Selectors: `Pages/InventoryPage.js`

### "Show me how to handle errors"

1. Overview: [FAILURE_HANDLING_GUIDE.md](FAILURE_HANDLING_GUIDE.md)
2. Reference template: `tests/steps/ui/STEP_TEMPLATE.js` (see error handling section)
3. Real example: `tests/steps/ui/inventory_filters_example_steps.js` (see try/catch blocks)
4. Hooks: `Setup/hooks.js` (After hook with screenshot capture)

### "I need debugging techniques"

1. Quick reference: [DEBUGGING_REFERENCE.md](DEBUGGING_REFERENCE.md)
2. Common patterns: [STEP_DEFINITIONS_GUIDE.md](STEP_DEFINITIONS_GUIDE.md#debugging-checklist)
3. Example output: Look at screenshots in `reports/`
4. Tools: DevTools F12 with selectors from templates

---

## 📊 Test Organization

### Current Features (15 total)

```
UIFeature/
├── login.feature ......................... User authentication
├── inventory_filters.feature ............. Filter inventory
├── inventory_search.feature ............. Search functionality
├── brokenlink.feature ................... Link validation
├── client_ip_validation.feature ......... IP validation
├── length_filter_accuracy.feature ....... Length filter checks
├── partRequest.feature .................. Part requests
├── V7_Powersports_Inventory_Scenarios.feature ... V7 platform
├── validate_many_sites.feature .......... Multi-site validation
├── xinv_manager.feature ................. XInv manager tests
├── xinventoryManager.feature ............ XInventory tests
├── InventoryModule.feature .............. Module tests
├── contactUs_steps.feature .............. Contact form
├── client_ip_steps.feature .............. IP checks
└── ... (more variations)

APIFeature/
└── A123Feed.feature ..................... API data feed tests

performance/
├── lighthouse.feature ................... Performance metrics
└── load_test.feature .................... Load testing
```

### Test Statistics

- **Total Features**: 15
- **Step Definition Files**: 18
- **Page Object Models**: 7
- **Test Scenarios**: 50+
- **Supported Environments**: 2 (Production, Sandbox)

---

## ✅ Pre-Run Checklist

Before running tests, verify:

- [ ] Node.js installed: `node --version` (should be v14+)
- [ ] Dependencies installed: `npm install` (should run without errors)
- [ ] `.env` file configured (optional, has defaults)
- [ ] Browser downloaded: First test run automatically downloads
- [ ] Reports folder exists: `reports/` (auto-created on run)
- [ ] No port conflicts: Port 3000+ available
- [ ] Network connectivity: Can reach test sites

Run tests:
```bash
npm test
```

View results:
```bash
npm run report:open
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Tests won't run | `npm install` to reinstall dependencies |
| Selectors fail | Check [DEBUGGING_REFERENCE.md](DEBUGGING_REFERENCE.md#common-errors--solutions) |
| Browser won't start | Playwright browser may need download: `npx playwright install` |
| Screenshots not captured | Check `reports/` folder, verify step creates reports folder |
| Timeout errors | Check network, increase timeout in `cucumber.js` |
| "Feature not found" | Ensure feature files exist in `tests/features/UIFeature/` |

See [SETUP_COMPLETE.md](SETUP_COMPLETE.md#troubleshooting) for detailed troubleshooting

---

## 📞 Quick Reference

### File Locations

```
Main test files .................. tests/features/UIFeature/
Step implementations ............ tests/steps/ui/
Page object models ............. Pages/
Framework setup ................ Setup/hooks.js
Configuration ................. cucumber.js
Test results .................. reports/
Documentation ................. *.md files in root
```

### Key Commands

```bash
npm test                  # Run all tests
npm run report:open      # View interactive report
npm run debug            # Run in debug mode
ls -ltr reports/*.png    # List latest screenshots
cat .env                 # View environment config
```

### Key Files to Know

```
✅ START_HERE.md ............ Begin here!
✅ STEP_TEMPLATE.js ........ Copy when creating steps
✅ inventory_filters_example_steps.js  .... See real example
✅ Setup/hooks.js .......... Test lifecycle
✅ cucumber.js ............. Test runner config
```

---

## 📈 Next Steps

### If You're New:
1. Read [START_HERE.md](START_HERE.md) (5 min)
2. Run `npm test` (2 min)
3. View results in `reports/cucumber-report.html`

### If You Want to Create Tests:
1. Read [STEP_DEFINITIONS_GUIDE.md](STEP_DEFINITIONS_GUIDE.md) (20 min)
2. Copy `tests/steps/ui/STEP_TEMPLATE.js` as template
3. Reference [inventory_filters_example_steps.js](tests/steps/ui/inventory_filters_example_steps.js) for patterns
4. Create your feature and step files

### If You're Debugging:
1. Look at screenshot in `reports/`
2. Check [FAILURE_HANDLING_GUIDE.md](FAILURE_HANDLING_GUIDE.md) (15 min)
3. Use [DEBUGGING_REFERENCE.md](DEBUGGING_REFERENCE.md) for techniques

### If You Have Issues:
1. Review [SETUP_COMPLETE.md](SETUP_COMPLETE.md#troubleshooting)
2. Check test output for error messages
3. Look at screenshot in `reports/`
4. Verify all prerequisites met

---

## 🎓 Learning Resources

### Inside This Project

- **SETUP_COMPLETE.md**: 1000+ lines of comprehensive documentation
- **STEP_DEFINITIONS_GUIDE.md**: Pattern library and best practices
- **FAILURE_HANDLING_GUIDE.md**: Error handling and recovery patterns
- **DEBUGGING_REFERENCE.md**: Practical debugging techniques
- **STEP_TEMPLATE.js**: 400+ lines of reusable code patterns
- **inventory_filters_example_steps.js**: 500+ lines of real-world implementation

### External Resources

- [Playwright Documentation](https://playwright.dev)
- [Cucumber.js Reference](https://github.com/cucumber/cucumber-js)
- [Allure Report Documentation](https://docs.qameta.io/allure/)

---

## 🎯 Your Journey

```
📍 Start Here
    ↓
[START_HERE.md] ← 5 minutes
    ↓
npm test ← 2 minutes 
    ↓
View results
   / | \
  /  |  \
Create   Debug   Learn
Tests    Issues   More
  |       |       |
  ↓       ↓       ↓
Copy   Check    Read
STEP_  ERROR    Guides
TEMP-  SCREEN-
LATE   SHOT
```

---

**🚀 Ready to get started? Read [START_HERE.md](START_HERE.md) next!**

---

*Last updated: 2026-03-24*
*Framework: Playwright 1.58.2 + Cucumber 9.5.0 + JavaScript ES6+*
*Status: ✅ Complete and Ready to Use*
