# 🎭 Playwright JS E2E Automation Suite

A comprehensive end-to-end automation testing framework using **Playwright**, **Cucumber (BDD)**, and **JavaScript/Node.js**.

[![Node.js](https://img.shields.io/badge/Node.js-v22.19.0-green?logo=node.js)]()
[![Playwright](https://img.shields.io/badge/Playwright-Latest-blue?logo=playwright)]()
[![Cucumber](https://img.shields.io/badge/Cucumber-v9.5.0-green)]()
[![License](https://img.shields.io/badge/License-ISC-yellow)]()

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Configuration](#configuration)
- [Test Scenarios](#test-scenarios)
- [Reports](#reports)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Project Overview

This automation suite provides a robust testing framework for:
- **UI Testing**: Automated browser testing across multiple platforms
- **API Testing**: REST API validation and data comparison
- **Performance Testing**: Lighthouse performance audits
- **Broken Link Validation**: Automated link checking
- **Cross-URL Testing**: Testing on multiple domains (Amazon, Dealerspike, etc.)

**Current Status**: ✅ **STABLE & PASSING**
- UI Tests: ✅ Passing
- API Tests: ✅ Configured
- Performance Tests: ✅ Enabled
- Reports: ✅ Generated

---

## ✨ Features

### 🎬 Core Features
- ✅ **BDD Framework**: Natural language Gherkin syntax for test scenarios
- ✅ **Playwright Integration**: Modern browser automation with Chromium, Firefox, WebKit
- ✅ **Multi-URL Support**: Test multiple websites and domains
- ✅ **Screenshot Capture**: Automatic screenshots on test failure
- ✅ **Detailed Reporting**: HTML, JSON, and JUnit XML reports
- ✅ **Flexible Configuration**: Environment-based settings via Cucumber
- ✅ **Tag-Based Execution**: Run specific test suites using tags
- ✅ **Error Handling**: Robust error handling and graceful failures
- ✅ **Performance Metrics**: Lighthouse integration for performance testing

### 🔧 Technical Capabilities
- **Browser Support**: Chromium, Firefox, WebKit (WebKit currently disabled)
- **Test Types**: Unit, Integration, E2E, API, Performance
- **Reporting**: HTML, JSON, JUnit XML, Allure-ready
- **CI/CD Ready**: GitHub Actions, Jenkins, Azure DevOps compatible
- **Parallel Execution**: Sequential by default, can be configured for parallel runs

---

## 📦 Prerequisites

### System Requirements
- **OS**: Windows 10/11, macOS, Linux
- **Node.js**: v16 or higher (currently using v22.19.0)
- **npm**: v7 or higher
- **Browsers**: Chromium (auto-downloaded by Playwright)

### Software Requirements
- Git (for version control)
- PowerShell or Bash terminal
- Any modern text editor (VS Code recommended)

### Optional Tools
- Chrome/Firefox browser (for manual testing)
- Postman (for API testing)
- Allure CLI (for Allure reports)

---

## 🚀 Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/lokesh2009/playwright-js-E2E-Automation.git
cd playwright-js-E2E-Automation
```

### Step 2: Checkout the E2E Branch
```bash
git checkout E2EBranch
```

### Step 3: Install Dependencies
```bash
npm install
```

This will install:
- `@cucumber/cucumber@9.5.0` - BDD framework
- `@playwright/test` - Playwright testing library
- `playwright` - Browser automation
- `axios` - HTTP client for API testing
- `chai` - Assertion library
- `lighthouse` - Performance testing

### Step 4: Verify Installation
```bash
npx playwright --version
npx cucumber-js --version
```

Expected Output:
```
Version X.XX.X (Playwright)
X.X.X (@cucumber/cucumber)
```

### Step 5: Download Browsers (One-time)
```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers (~500MB).

---

## 📂 Project Structure

```
playwright-js-E2E-Automation/
│
├── 📁 tests/                           # Test files
│   ├── features/                       # Gherkin feature files (BDD scenarios)
│   │   ├── UIFeature/
│   │   │   ├── addProduct.feature     # Amazon & Dealerspike product tests
│   │   │   ├── brokenlink.feature     # Broken link validation
│   │   │   └── searchProduct.feature  # Product search tests
│   │   ├── APIFeature/
│   │   │   ├── apiTest.feature        # API testing scenarios
│   │   │   └── A123Feed.feature       # Feed API tests
│   │   └── performance/
│   │       ├── lighthouse.feature     # Performance testing
│   │       └── load_test.feature      # Load testing
│   │
│   ├── steps/                          # Step definitions (Implementation)
│   │   ├── ui/
│   │   │   ├── addProductStepdef.js   # Product test steps
│   │   │   ├── search_steps.js        # Search step definitions
│   │   │   └── broken-links.steps.js  # Link validation steps
│   │   ├── api/
│   │   │   ├── api_steps.js           # API test steps
│   │   │   └── compareDealerSteps.js  # Data comparison steps
│   │   └── performance/
│   │       ├── lighthouseSteps.js     # Performance steps
│   │       └── jmeter-performce.js    # Load testing steps
│   │
│   └── specs/                          # Direct test specs (alternative format)
│       ├── apiTest.spec.js
│       ├── lighthouse.spec.js
│       ├── uiTest.spec.js
│       └── broken.spec.js
│
├── 📁 Pages/                           # Page Object Models (POM)
│   ├── AmazonHomePage.js              # Amazon page interactions
│   ├── SearchPage.js                  # Search page model
│   ├── ProductPage.js                 # Product details page
│   ├── AddProductPage.js              # Add product functionality
│   └── perfMetrics.js                 # Performance metrics
│
├── 📁 Setup/                           # Configuration and Hooks
│   └── hooks.js                        # Before/After hooks, browser setup
│
├── 📁 Utility/                         # Helper functions
│   ├── apiHelper.js                   # API request helpers
│   ├── util.js                        # Utility functions
│   └── logger.js                      # Logging utilities
│
├── 📁 reports/                         # Test reports (Generated)
│   ├── cucumber-report.html           # Main HTML report
│   ├── cucumber-report.json           # JSON report data
│   └── *.png                          # Test screenshots
│
├── 📁 test-results/                    # Test result files
│   ├── junit.xml                      # JUnit XML format
│   ├── results.json                   # JSON results
│   └── broken-*/                      # Broken link test results
│
├── 📁 playwright-report/               # Playwright report
│   └── index.html                     # Playwright HTML report
│
├── 📁 .github/                         # GitHub Actions workflows
│   └── workflows/
│       └── test.yml                   # CI/CD pipeline configuration
│
├── 📄 cucumber.js                      # Cucumber configuration
├── 📄 cucumber.json                    # Cucumber output file
├── 📄 package.json                     # npm dependencies
├── 📄 package-lock.json                # Dependency lock file
├── 📄 playwright.config.js             # Playwright configuration
├── 📄 .gitignore                       # Git ignore rules
└── 📄 README.md                        # This file

```

---

## 🧪 Running Tests

### Basic Commands

#### Run All Tests
```bash
npm run test:cucumber
# or
npx cucumber-js
```

**Output**: Runs all feature files, generates HTML and JSON reports

---

#### Run Specific Feature File
```bash
npx cucumber-js tests/features/UIFeature/addProduct.feature
```

---

#### Run Tests by Tag

##### 🏷️ Available Tags
- `@smoke` - Quick smoke tests
- `@ui` - UI testing scenarios
- `@api` - API testing scenarios
- `@dealerspike` - Dealerspike-specific tests
- `@performance` - Performance tests
- `@regression` - Full regression suite

##### Run Smoke Tests Only
```bash
npx cucumber-js --tags "@smoke"
```

##### Run UI Tests Only
```bash
npx cucumber-js --tags "@ui"
```

##### Run Dealerspike Tests Only
```bash
npx cucumber-js --tags "@dealerspike"
```

##### Run Multiple Tags (AND condition)
```bash
npx cucumber-js --tags "@smoke and @ui"
```

##### Run Multiple Tags (OR condition)
```bash
npx cucumber-js --tags "@smoke or @dealerspike"
```

##### Exclude Tags (NOT condition)
```bash
npx cucumber-js --tags "not @performance"
```

---

#### Run API Tests
```bash
npm run test:api
# Generates: reports/api-report.json
```

---

#### Run Performance Tests
```bash
npm run test:performance
# Runs Lighthouse performance audits
```

---

#### Run UI Tests
```bash
npm run test:ui
# Generates: reports/ui-report.json
```

---

### Advanced Options

#### Run with Dry Run (Validate scenarios without executing)
```bash
npx cucumber-js --dry-run
```

**Use Case**: Check if all steps are defined before running

---

#### Run with Specific Format
```bash
# HTML Report
npx cucumber-js --format html:reports/custom-report.html

# JSON Report
npx cucumber-js --format json:reports/custom-report.json

# Console Output
npx cucumber-js --format progress-bar
```

---

#### Run with Parallel Execution
```bash
npx cucumber-js --parallel 4
```

**Note**: Default is sequential (0 parallel). Set to match your CPU cores.

---

#### Run with Specific Number of Scenarios
```bash
npx cucumber-js tests/features/UIFeature/addProduct.feature --lines 15
```

**Runs only the scenario at line 15**

---

#### Run with Detailed Output
```bash
npx cucumber-js --format pretty
```

---

### Custom NPM Scripts

Available npm scripts from `package.json`:

```bash
npm run test              # Run cucumber-js (same as test:cucumber)
npm run test:cucumber     # Run all Cucumber tests
npm run test:ui           # Run UI tests only
npm run test:api          # Run API tests only
npm run test:mobile       # Run mobile tests (if available)
npm run test:performance  # Run performance tests
npm run test:all          # Run all tests (UI + API + Mobile + Performance)
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
npm run report:generate   # Generate Allure reports
npm run report:open       # Open Allure reports
npm run bdd               # Run BDD tests with HTML report
```

---

## ⚙️ Configuration

### Cucumber Configuration (`cucumber.js`)

```javascript
module.exports = {
  default: {
    require: ['tests/steps/**/*.js', 'Setup/hooks.js'],
    format: ['progress', 'html:reports/cucumber-report.html', 'json:reports/cucumber-report.json'],
    paths: ['tests/features/**/*.feature'],
    parallel: 0,                    // 0 = Sequential, >0 = Parallel
    timeout: 120000,                // 120 seconds timeout
    tags: '',                       // Filter by tags
    worldParameters: {
      baseURL: 'https://www.amazon.in/'
    }
  }
};
```

### Key Configuration Options

| Option | Value | Purpose |
|--------|-------|---------|
| `timeout` | 120000 (120s) | Step execution timeout |
| `parallel` | 0 | Sequential execution (more stable) |
| `format` | HTML, JSON, Progress | Report generation formats |
| `require` | Steps + Hooks | Load test files |
| `tags` | @tag_name | Filter scenarios by tags |

### Playwright Configuration (`playwright.config.js`)

Key settings:
- **Headless Mode**: `false` (visible browser) for dealerspike, `true` for others
- **Browser**: Chromium (Firefox/WebKit available but not used)
- **Viewport**: 1280x720
- **Screenshots**: Only on failure
- **Videos**: Disabled by default

### Environment Variables

Create a `.env` file in the project root:
```
BASE_URL=https://www.amazon.in/
DEALERSPIKE_URL=https://qa-powersports.clients.dealerspike.net/
HEADLESS=false
TIMEOUT=120000
```

Load in your hooks or steps:
```javascript
require('dotenv').config();
const baseUrl = process.env.BASE_URL;
```

---

## 🧩 Test Scenarios

### 📌 UI Testing Scenarios

#### 1. Product Search & Pricing (Amazon)
**File**: `tests/features/UIFeature/addProduct.feature`  
**Tags**: `@smoke @ui`  
**Description**: Search for products on Amazon and verify pricing

**Steps**:
1. Navigate to Amazon home page
2. Click on search textbox
3. Enter product name
4. Click search button
5. Scroll to product
6. Verify pricing details

**Expected Result**: ✅ Product found with correct pricing

---

#### 2. Dealerspike Product Verification
**File**: `tests/features/UIFeature/addProduct.feature`  
**Tags**: `@dealerspike @smoke`  
**Description**: Test product catalog on Dealerspike powersports website

**Steps**:
1. Navigate to Dealerspike URL
2. Search for a product
3. Verify product results displayed
4. Verify product pricing

**Expected Result**: ✅ Dealerspike catalog accessible with valid products

---

#### 3. Broken Link Validation
**File**: `tests/features/UIFeature/brokenlink.feature`  
**Tags**: `@regression`  
**Description**: Validate all links on a page return HTTP 200

---

#### 4. Search Product Tests
**File**: `tests/features/UIFeature/searchProduct.feature`  
**Tags**: `@ui @smoke`  
**Description**: Comprehensive product search scenarios

---

### 🔌 API Testing Scenarios

#### 1. API Test Suite
**File**: `tests/features/APIFeature/apiTest.feature`  
**Description**: REST API endpoint validation

---

#### 2. A123 Feed API
**File**: `tests/features/APIFeature/A123Feed.feature`  
**Description**: Feed API integration testing

---

### 🎬 Performance Testing

#### 1. Lighthouse Performance Audit
**File**: `tests/features/performance/lighthouse.feature`  
**Description**: Measure page performance metrics
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

---

#### 2. Load Testing
**File**: `tests/features/performance/load_test.feature`  
**Description**: JMeter-based load testing scenarios

---

## 📊 Reports

### Report Types Generated

#### 1. **Cucumber HTML Report** ⭐ MAIN REPORT
**Location**: `reports/cucumber-report.html`

**Contents**:
- ✅ Overall test summary (Passed/Failed/Skipped)
- 📸 Screenshots from each step
- ⏱️ Execution time per step/scenario
- 📊 Feature breakdown
- 🔍 Error messages and stack traces

**How to View**:
```powershell
Start-Process "reports/cucumber-report.html"
```

Or double-click the file in Windows Explorer.

---

#### 2. **JSON Report**
**Location**: `reports/cucumber-report.json`

**Use Case**: Data analysis, CI/CD integration, custom report generation

---

#### 3. **JUnit XML Report**
**Location**: `test-results/junit.xml`

**Use Case**: 
- Jenkins integration
- GitHub Actions integration
- Azure DevOps reporting

---

#### 4. **Playwright Report**
**Location**: `playwright-report/index.html`

**Contents**:
- Browser-specific test details
- Performance metrics
- Test timeline

---

#### 5. **Screenshots**
**Location**: `reports/*.png`

Individual screenshots from each test scenario:
- `Add a product to dealerspike catalog and verify price.png`
- `Add a product to the catalog and verify its price.png`
- `Audit homepage performance.png`
- `Search for a product and verify that results appear.png`

---

### Viewing Reports

#### Open Main Report (Easiest)
```bash
# Windows PowerShell
Start-Process "reports/cucumber-report.html"

# Or manually: Open reports/cucumber-report.html in any browser
```

#### Open All Reports
```powershell
# Open Cucumber Report
Start-Process "reports/cucumber-report.html"

# Open Playwright Report
Start-Process "playwright-report/index.html"

# Open Screenshots Folder
explorer.exe "reports/"
```

#### Share Reports
All HTML reports can be sent via email or uploaded to a server. They're self-contained with all CSS/JS embedded.

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Example `.github/workflows/test.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install
      - run: npm run test:cucumber
      - uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: reports/
```

### Jenkins Pipeline

```groovy
pipeline {
  agent any
  stages {
    stage('Install') {
      steps {
        sh 'npm install'
        sh 'npx playwright install'
      }
    }
    stage('Test') {
      steps {
        sh 'npm run test:cucumber'
      }
    }
    stage('Report') {
      steps {
        publishHTML([
          reportDir: 'reports',
          reportFiles: 'cucumber-report.html',
          reportName: 'E2E Test Report'
        ])
      }
    }
  }
}
```

### Azure DevOps Pipeline

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'

- script: npm install
  displayName: 'Install Dependencies'

- script: npx playwright install
  displayName: 'Install Browsers'

- script: npm run test:cucumber
  displayName: 'Run Tests'

- task: PublishTestResults@2
  inputs:
    testResultsFiles: 'test-results/junit.xml'
    testRunTitle: 'E2E Tests'
```

---

## 🛠️ Troubleshooting

### Issue 1: Tests Timing Out

**Error**: `function timed out, ensure the promise resolves within 120000 milliseconds`

**Solution**:
```javascript
// In cucumber.js, increase timeout
timeout: 180000  // 3 minutes instead of 2
```

---

### Issue 2: Browser Not Found

**Error**: `Chromium not found`

**Solution**:
```bash
# Install browsers
npx playwright install

# Verify installation
npx playwright --version
```

---

### Issue 3: Step Definition Not Found

**Error**: `Undefined step`

**Solution**:
1. Check step name matches exactly (case-sensitive)
2. Ensure step file is in `tests/steps/` directory
3. Verify file is required in `cucumber.js`

---

### Issue 4: Report Not Generated

**Error**: `reports/cucumber-report.html not found`

**Solution**:
1. Run tests first: `npm run test:cucumber`
2. Reports are generated in `reports/` folder
3. Check if folder exists: `ls reports/`

---

### Issue 5: Cannot Find Module

**Error**: `Cannot find module 'xxx'`

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or install specific package
npm install --save-dev @cucumber/cucumber@9.5.0
```

---

### Issue 6: Dealerspike Tests Hanging

**Error**: Tests taking too long or not responding

**Solution**:
- Check internet connection
- Verify dealerspike URL is accessible
- Increase timeout in `cucumber.js`
- Run with verbose logging: `npx cucumber-js --format pretty`

---

### Issue 7: Port Already in Use

**Error**: `Port 3000 already in use`

**Solution**:
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

---

### Debug Mode

Enable detailed logging:

```bash
# Enable verbose output
npx cucumber-js --format pretty

# Run with node debugger
node --inspect-brk ./node_modules/.bin/cucumber-js

# Print console logs
npx cucumber-js 2>&1 | tee test.log
```

---

## 📚 Best Practices

### Writing Test Scenarios

1. **Keep Scenarios Focused**: One behavior per scenario
   ```gherkin
   ✅ Scenario: User can search for products
   ❌ Scenario: User can login, search, filter, and checkout
   ```

2. **Use Descriptive Names**: Clear intent
   ```gherkin
   ✅ Given I am on the home page
   ❌ Given I open page
   ```

3. **Use Data Tables**: For multiple test cases
   ```gherkin
   When I search for the following products:
     | product  |
     | Laptop   |
     | Mouse    |
     | Keyboard |
   ```

4. **Tag Appropriately**: Organize by type and priority
   ```gherkin
   @smoke @ui @high-priority
   Scenario: Login functionality
   ```

---

### Writing Step Definitions

1. **Keep Steps Independent**: Minimal interdependencies
2. **Use Page Objects**: Separate locators from logic
3. **Add Error Handling**: Graceful failures
4. **Log Important Steps**: For debugging

---

### Maintenance Tips

1. **Regular Updates**: `npm update` monthly
2. **Review Reports**: Analyze failures early
3. **Refactor Steps**: Remove duplication
4. **Update Selectors**: When UI changes
5. **Archive Old Reports**: Keep project clean

---

## 📞 Support & Documentation

### Resources
- [Playwright Docs](https://playwright.dev/)
- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)
- [Node.js Guide](https://nodejs.org/en/docs/)

### Project Structure Documentation
- See individual feature files for scenario details
- Check step definitions for implementation details
- Review `Setup/hooks.js` for browser configuration

### Common Commands Cheat Sheet

```bash
# Installation
npm install                    # Install dependencies
npx playwright install         # Install browsers

# Running Tests
npm run test:cucumber          # Run all tests
npx cucumber-js --tags "@smoke"  # Run by tag
npm run test:performance       # Performance tests

# Reporting
start reports/cucumber-report.html   # View report
explorer.exe reports/                # View screenshots

# Development
npm run lint                   # Check code
npm run format                 # Format code
```

---

## 📝 Contributing

### Adding New Tests

1. **Create Feature File**: `tests/features/UIFeature/myfeature.feature`
2. **Write Scenarios**: Use Gherkin syntax
3. **Add Step Definitions**: `tests/steps/ui/myfeature_steps.js`
4. **Test Locally**: Run your scenario
5. **Add to CI/CD**: Update workflow (if needed)

### Code Style
- Use camelCase for variables
- Use PascalCase for classes
- Add JSDoc comments
- Keep functions under 20 lines
- Add unit tests for utilities

---

## 📄 License

ISC License - See LICENSE file for details

---

## 👥 Author

**Lokesh Sharma**  
GitHub: [@lokesh2009](https://github.com/lokesh2009)

---

## 🎉 Quick Start Summary

```bash
# 1. Clone and setup
git clone https://github.com/lokesh2009/playwright-js-E2E-Automation.git
cd playwright-js-E2E-Automation
npm install
npx playwright install

# 2. Run tests
npm run test:cucumber

# 3. View reports
start reports/cucumber-report.html

# Done! 🚀
```

---

**Last Updated**: November 27, 2025  
**Framework Version**: Cucumber v9.5.0 | Playwright Latest  
**Status**: ✅ Production Ready

---

## ✅ Checklist for New Team Members

- [ ] Clone repository
- [ ] Install Node.js v16+
- [ ] Run `npm install`
- [ ] Run `npx playwright install`
- [ ] Run smoke tests: `npx cucumber-js --tags "@smoke"`
- [ ] View report: `start reports/cucumber-report.html`
- [ ] Read test scenarios in `tests/features/`
- [ ] Review step definitions in `tests/steps/`
- [ ] Check hooks in `Setup/hooks.js`
- [ ] Ready to write new tests!

---

**Questions?** Check the troubleshooting section or review individual test files for examples.
