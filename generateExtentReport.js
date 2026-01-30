const fs = require('fs');
const path = require('path');

/**
 * Generate Extent-like Report from Cucumber JSON
 * Uses a simple HTML template to create a visually appealing report
 */

const reportsDir = 'reports';
const jsonFile = path.join(reportsDir, 'cucumber-report.json');
const outputDir = path.join(reportsDir, 'extent-report');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read cucumber JSON report
if (fs.existsSync(jsonFile)) {
  const cucumberResults = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

  // Calculate statistics
  let totalScenarios = 0;
  let passedScenarios = 0;
  let failedScenarios = 0;
  let skippedScenarios = 0;
  let totalSteps = 0;
  let passedSteps = 0;
  let failedSteps = 0;
  let skippedSteps = 0;

  cucumberResults.forEach((feature) => {
    feature.elements?.forEach((scenario) => {
      totalScenarios++;
      const steps = scenario.steps || [];
      let scenarioStatus = 'passed';

      steps.forEach((step) => {
        totalSteps++;
        if (step.result?.status === 'passed') passedSteps++;
        else if (step.result?.status === 'failed') {
          failedSteps++;
          scenarioStatus = 'failed';
        } else if (step.result?.status === 'skipped') skippedSteps++;
      });

      if (scenarioStatus === 'passed') passedScenarios++;
      else if (scenarioStatus === 'failed') failedScenarios++;
      else if (scenarioStatus === 'skipped') skippedScenarios++;
    });
  });

  // Generate HTML report
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Extent Report - Test Execution Summary</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .container {
            max-width: 1200px;
            margin: 30px auto;
            padding: 0 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .stat-card h3 {
            color: #667eea;
            font-size: 2em;
            margin-bottom: 10px;
        }
        .stat-card p {
            color: #666;
            font-size: 0.9em;
        }
        .progress-section {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 40px;
        }
        .progress-section h2 {
            margin-bottom: 20px;
            color: #333;
        }
        .progress-bar {
            display: flex;
            height: 30px;
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 20px;
            background-color: #eee;
        }
        .progress-segment {
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.9em;
        }
        .passed {
            background-color: #10b981;
        }
        .failed {
            background-color: #ef4444;
        }
        .skipped {
            background-color: #f59e0b;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }
        .timestamp {
            color: #999;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Extent Report</h1>
        <p>Test Execution Summary</p>
    </div>

    <div class="container">
        <div class="stats-grid">
            <div class="stat-card">
                <h3>${totalScenarios}</h3>
                <p>Total Scenarios</p>
            </div>
            <div class="stat-card">
                <h3>${passedScenarios}</h3>
                <p>Passed Scenarios</p>
            </div>
            <div class="stat-card">
                <h3>${failedScenarios}</h3>
                <p>Failed Scenarios</p>
            </div>
            <div class="stat-card">
                <h3>${skippedScenarios}</h3>
                <p>Skipped Scenarios</p>
            </div>
        </div>

        <div class="progress-section">
            <h2>Scenario Progress</h2>
            <div class="progress-bar">
                ${passedScenarios > 0 ? `<div class="progress-segment passed" style="width: ${(passedScenarios/totalScenarios)*100}%">${passedScenarios}</div>` : ''}
                ${failedScenarios > 0 ? `<div class="progress-segment failed" style="width: ${(failedScenarios/totalScenarios)*100}%">${failedScenarios}</div>` : ''}
                ${skippedScenarios > 0 ? `<div class="progress-segment skipped" style="width: ${(skippedScenarios/totalScenarios)*100}%">${skippedScenarios}</div>` : ''}
            </div>
            <p><strong>Pass Rate:</strong> ${totalScenarios > 0 ? ((passedScenarios/totalScenarios)*100).toFixed(2) : 0}%</p>
        </div>

        <div class="progress-section">
            <h2>Steps Progress</h2>
            <div class="progress-bar">
                ${passedSteps > 0 ? `<div class="progress-segment passed" style="width: ${(passedSteps/totalSteps)*100}%">${passedSteps}</div>` : ''}
                ${failedSteps > 0 ? `<div class="progress-segment failed" style="width: ${(failedSteps/totalSteps)*100}%">${failedSteps}</div>` : ''}
                ${skippedSteps > 0 ? `<div class="progress-segment skipped" style="width: ${(skippedSteps/totalSteps)*100}%">${skippedSteps}</div>` : ''}
            </div>
            <p><strong>Total Steps:</strong> ${totalSteps} | <strong>Pass Rate:</strong> ${totalSteps > 0 ? ((passedSteps/totalSteps)*100).toFixed(2) : 0}%</p>
        </div>

        <div class="progress-section">
            <h2>Summary Statistics</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; text-align: left;">Total Steps</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold;">${totalSteps}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; text-align: left;">Passed Steps</td>
                    <td style="padding: 10px; text-align: right; color: #10b981; font-weight: bold;">${passedSteps}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; text-align: left;">Failed Steps</td>
                    <td style="padding: 10px; text-align: right; color: #ef4444; font-weight: bold;">${failedSteps}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; text-align: left;">Skipped Steps</td>
                    <td style="padding: 10px; text-align: right; color: #f59e0b; font-weight: bold;">${skippedSteps}</td>
                </tr>
            </table>
        </div>
    </div>

    <div class="footer">
        <p class="timestamp">Report Generated: ${new Date().toLocaleString()}</p>
        <p>Powered by Cucumber & Node.js</p>
    </div>
</body>
</html>
  `;

  // Write HTML report
  fs.writeFileSync(path.join(outputDir, 'index.html'), htmlContent);
  console.log(`✅ Extent report generated successfully at: ${path.join(outputDir, 'index.html')}`);
} else {
  console.warn(`⚠️  Cucumber report not found at ${jsonFile}`);
  console.log('Please run tests first: npm run test:cucumber');
}

