import { Given, Then } from "@cucumber/cucumber";
import { execSync } from "child_process";
import fs from "fs";
import { expect } from "chai";

Given('I execute JMeter test {string}', (testFile) => {
  console.log(`🏁 Running JMeter test: ${testFile}`);
  execSync(`jmeter -n -t jmeter/${testFile} -l jmeter/results.jtl`);
});

Then('I should see average response time under 2s', () => {
  const results = fs.readFileSync('jmeter/results.jtl', 'utf8');
  const avgTime = parseFloat(results.match(/avg="(\d+)"/)?.[1] || 0);
  console.log(`Average Response Time: ${avgTime} ms`);
  expect(avgTime).to.be.lessThan(2000);
});
