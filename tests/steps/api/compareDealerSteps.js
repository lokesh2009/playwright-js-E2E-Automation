const { Given, When, Then } = require('@cucumber/cucumber');
const { fetchAPI1Data, fetchAPI2Data } = require('../utils/apiHelper');
const { compareDealerData } = require('../utils/comparator');
const assert = require('assert');

let api1Data, api2Data, comparisonResult;

Given('I fetch dealer data from API1', async () => {
  api1Data = await fetchAPI1Data();
});

Given('I fetch dealer data from API2', async () => {
  api2Data = await fetchAPI2Data();
});

When('I compare the dealer data for dealer ID {string}', (dealerId) => {
  comparisonResult = compareDealerData(api1Data, api2Data, dealerId);
});

Then('the data should match across both APIs', () => {
  assert.deepStrictEqual(comparisonResult.mismatches.length, 0, `Mismatches found: ${JSON.stringify(comparisonResult.mismatches)}`);
});