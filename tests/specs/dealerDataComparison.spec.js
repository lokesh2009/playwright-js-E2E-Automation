const { test, expect, request } = require('@playwright/test');
require('dotenv').config();
const { fetchAPI1Data, fetchAPI2Data } = require('../Utility/apiHelper');
const { compareDealerData } = require('../Utility/comparator');

const API1_URL = process.env.API1_URL;
const API2_URL = process.env.API2_URL;
const DEALER_ID = process.env.DEALER_ID;

test('Compare dealer data between API1 and API2', async ({ request }) => {
  // Fetch data using helper functions
  const api1Data = await fetchAPI1Data();
  const api2Data = await fetchAPI2Data();

  // Compare full datasets using custom comparator
  const comparisonResult = compareDealerData(api1Data, api2Data, DEALER_ID);
  expect(comparisonResult.mismatches.length).toBe(0);

  // Fetch raw API responses
  const res1 = await request.get(API1_URL);
  const res2 = await request.get(API2_URL);

  expect(res1.status()).toBe(200);
  expect(res2.status()).toBe(200);

  const data1 = await res1.json();
  const data2 = await res2.json();

  expect(Array.isArray(data1)).toBeTruthy();
  expect(Array.isArray(data2)).toBeTruthy();

  // Find a dealer with a specific ID (e.g., 6239) in both datasets
  const dealer1 = data1.find(dealer => dealer.id.toString().includes('6239'));
  const dealer2 = data2.find(dealer => dealer.id.toString().includes('6239'));

  expect(dealer1).toBeTruthy();
  expect(dealer2).toBeTruthy();

  // Compare key fields of the dealer
  expect(dealer1.name).toBe(dealer2.name);
  expect(dealer1.location).toBe(dealer2.location);
  expect(dealer1.status).toBe(dealer2.status);
  expect(dealer1.updatedAt).toBe(dealer2.updatedAt);

  // Optional: Log mismatches if any
  if (dealer1.name !== dealer2.name ||
      dealer1.location !== dealer2.location ||
      dealer1.status !== dealer2.status) {
    console.warn('Mismatch found in dealer data:', {
      dealer1,
      dealer2
    });
  }
});
