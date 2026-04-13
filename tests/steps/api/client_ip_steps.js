import axios from 'axios';
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

let url;
let response;

Given('the API base URL and endpoint are configured', function () {
  const base = process.env.BASE_URL;
  const endpoint = process.env.ENDPOINT || '/default.asp?page=xxtest';
  if (!base) throw new Error('BASE_URL not configured in .env');
  url = base.replace(/\/$/, '') + endpoint;
});

When('I request the client IP page', async function () {
  response = await axios.get(url, { timeout: 10000 });
});

Then('the response body should include the expected IP and header values', function () {
  const body = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  // Expected strings from user
  const expectedLines = [
    'Getting Client IP: 10.98.5.44',
    'Real Client IP: 10.98.5.44',
    'REMOTE_ADDR: 10.56.112.5',
    'HTTP_X_FORWARDED_FOR: 10.98.5.44',
    'HTTP_X_DS_CLIENT_IP: 10.98.5.44'
  ];

  expectedLines.forEach((line) => {
    expect(body).to.include(line, `Response did not include expected line: ${line}`);
  });
});
