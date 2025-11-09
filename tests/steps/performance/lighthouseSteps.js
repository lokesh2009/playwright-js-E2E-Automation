const { Given, Then } = require('@cucumber/cucumber');
const { execSync } = require('child_process');
const fs = require('fs');

Given('I run Lighthouse on {string}', function (url) {
  execSync(`lighthouse ${url} --output json --output-path=./lh-report.json --chrome-flags="--headless"`);
});

Then('I should get a performance score above {int}', function (expectedScore) {
  const report = JSON.parse(fs.readFileSync('./lh-report.json', 'utf-8'));
  const score = report.categories.performance.score * 100;
  if (score < expectedScore) {
    throw new Error(`Performance score ${score} is below expected ${expectedScore}`);
  }
});