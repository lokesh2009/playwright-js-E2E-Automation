# 🎭 Playwright JS E2E Automation Suite

This repository contains a JavaScript-based end-to-end automation framework built with Playwright and Cucumber. It supports UI, API, health-check, self-heal, and performance-style test flows for a set of web applications.

## ✅ What’s included

- BDD-style test execution with Cucumber and Gherkin feature files
- Playwright-based browser automation for UI validation
- API and health-check scenarios
- Self-heal and parts-request workflow coverage
- HTML and JSON reporting output for test runs

## 📦 Prerequisites

- Node.js 18+ (the project is currently aligned with Node 22 in the environment)
- npm
- Git
- A terminal such as PowerShell, Command Prompt, or Bash

## 🚀 Installation

```bash
git clone https://lokeshsharma4@bitbucket.org/aridevelopment/ds-qa-automation-repo.git
cd ds-qa-automation-repo
npm install
npx playwright install
```

## 🧪 Running tests

Common commands available in this repository:

```bash
npm run test:cucumber
npm run test:ui
npm run test:healthcheck
npm run test:api
npm run test:performance
npm run test:selfheal
npm run test:parts-request
```

You can also run a specific feature file directly with Cucumber if needed.

## 📁 Project structure

- tests/features/ - Gherkin feature files grouped by UI, API, and performance scenarios
- tests/steps/ - Step definitions for the feature files
- Pages/ - Page Object Model classes for the UI flows
- Setup/ - Hooks and shared browser/test setup
- Utility/ - Shared helpers and fixtures
- reports/ - Generated HTML/JSON reports for test runs
- allure-results/ - Raw results used for Allure reporting
- test-results/ - Playwright/Cucumber result files

## 📈 Reports

Generated reports are written to the reports folder and other result folders during execution. These files are intended to stay local and are ignored by Git.

## 🤖 How to start the MCP server

The Playwright MCP server can be started locally with:

```bash
npx @playwright/mcp@latest
```

If you are using VS Code, make sure the MCP configuration file is present in your user settings and then reload the window after saving it. Once connected, you can use Copilot agent mode to drive the Playwright MCP server from this repository.

## 🔧 Notes

- The main test runner is configured through package.json and Playwright/Cucumber setup files.
- Environment-specific values should be kept in local config files and not committed to source control.

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
