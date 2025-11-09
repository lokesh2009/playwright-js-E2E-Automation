import axios from 'axios';
import { Given, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

let response;

Given('I send GET request to {string}', async function (url) {
  response = await axios.get(url);
});

Then('the response status should be {int}', function (statusCode) {
  expect(response.status).to.equal(statusCode);
});

Then('the response should contain {string}', function (keyword) {
  expect(JSON.stringify(response.data)).to.include(keyword);
});
