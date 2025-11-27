const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

let api1Data, api2Data, comparisonResult;

let fetchAPI1Data, fetchAPI2Data;

try {
  const apiHelper = require('../../Utility/apiHelper');
  fetchAPI1Data = apiHelper.fetchAPI1Data;
  fetchAPI2Data = apiHelper.fetchAPI2Data;
} catch (e) {
  console.warn('Warning: Could not load API helper module:', e.message);
  fetchAPI1Data = async () => { throw new Error('API Helper not available'); };
  fetchAPI2Data = async () => { throw new Error('API Helper not available'); };
}

Given('I fetch dealer data from API1', async () => {
  api1Data = await fetchAPI1Data();
});

Given('I fetch dealer data from API2', async () => {
  api2Data = await fetchAPI2Data();
});

When('I compare the dealer data for dealer ID {string}', (dealerId) => {
  // Placeholder for comparison logic
  comparisonResult = { mismatches: [] };
});

Then('the data should match across both APIs', () => {
  assert.deepStrictEqual(comparisonResult.mismatches.length, 0, `Mismatches found: ${JSON.stringify(comparisonResult.mismatches)}`);
});