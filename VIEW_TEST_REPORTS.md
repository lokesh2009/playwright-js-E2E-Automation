# 📊 How to View Your Test Reports

## ⭐ **EASIEST METHOD** (Just 3 Steps!)

### Step 1: Open File Explorer
Navigate to your project:
```
C:\Users\lokesh.sharma\playwright-js-E2E-Automation\reports\
```

### Step 2: Find the Report File
Look for: **`cucumber-report.html`**

### Step 3: Double-Click It
Your browser will open with your full test report! 🎉

---

## 📂 Your Report Files

Your test reports are located in:
```
📁 reports/
├── 🔴 cucumber-report.html              ← OPEN THIS IN BROWSER
├── 📄 cucumber-report.json              (detailed data in JSON)
├── 🖼️ Add a product to dealerspike catalog and verify price.png
├── 🖼️ Add a product to the catalog and verify its price.png
├── 🖼️ Audit homepage performance.png
└── 🖼️ Search for a product and verify that results appear.png
```

---

## 🚀 Quick Commands

### Open Report in Browser (PowerShell)
```powershell
Start-Process "reports/cucumber-report.html"
```

### Open Screenshots Folder
```powershell
explorer.exe "reports/"
```

### View Playwright Report
```powershell
Start-Process "playwright-report/index.html"
```

---

## ✅ What You'll See in the Report

When you open `cucumber-report.html`, you'll see:

- **Test Status**: ✅ Passed / ❌ Failed / ⊘ Skipped
- **Feature Breakdown**: All features and scenarios
- **Step Details**: Each step with status and duration
- **Screenshots**: Visual proof of each test step
- **Execution Time**: How long each step/scenario took
- **Error Messages**: Details of any failures

---

## 📋 Example: Your Dealerspike Test Report

```
SCENARIO: Add a product to dealerspike catalog and verify price
Status: ✅ PASSED
Time: 43.842 seconds

STEPS:
✅ Step 1: Given I navigate to dealerspike
   Time: 42.88 seconds
   Screenshot: [Displayed in report]

✅ Step 2: When I search for a product in dealerspike
   Time: 0.035 seconds

✅ Step 3: Then I should see product results
   Time: 0.009 seconds

✅ Step 4: And I should verify product pricing on dealerspike
   Time: 0.005 seconds

SUMMARY: 1 scenario (1 passed) | 4 steps (4 passed)
```

---

## 🔄 Generate Fresh Reports

To run tests and generate updated reports:

### Run All Tests
```bash
npm run test:cucumber
```

### Run Dealerspike Test Only
```bash
npx cucumber-js tests/features/UIFeature/addProduct.feature --tags "@dealerspike"
```

### Run Amazon Test Only
```bash
npx cucumber-js tests/features/UIFeature/addProduct.feature --tags "@ui"
```

---

## 💡 Different Report Formats Available

| Report File | Location | Best For | Opens In |
|---|---|---|---|
| **Cucumber HTML** | `reports/cucumber-report.html` | Overview & Screenshots | Browser |
| **Cucumber JSON** | `reports/cucumber-report.json` | Data Analysis | Text Editor |
| **Screenshots** | `reports/*.png` | Visual Evidence | Image Viewer |
| **Playwright Report** | `playwright-report/index.html` | Playwright Details | Browser |
| **JUnit XML** | `test-results/junit.xml` | CI/CD Integration | Text Editor |

---

## 🎯 Quick Reference

**Simplest way:** Double-click `reports/cucumber-report.html` in your file explorer  
**Next step:** Scroll through to see all test steps and screenshots  
**Need more?** Check the JSON file for detailed data  
**Re-run tests:** Use the npm commands above to generate fresh reports  

---

## 📸 View Screenshots

Your test screenshots are also in the reports folder:
```powershell
# Open the reports folder with all screenshots
explorer.exe "reports/"
```

Then double-click any `.png` file to view the screenshot from that test step.

---

✅ **You're all set!** Just open `cucumber-report.html` in your browser to see your test results.
