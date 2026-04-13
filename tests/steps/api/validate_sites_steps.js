import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

let sites = [];
let results = [];

Given('the list of sites is loaded', function () {

  const cfgPath = path.join(process.cwd(), 'tests', 'config', 'sites.json');
  const raw = fs.readFileSync(cfgPath, 'utf8');
  sites = JSON.parse(raw);
  if (!Array.isArray(sites) || sites.length === 0) throw new Error('No sites found in tests/config/sites.json');
});

When('I request the default xxtest page for each site', async function () {
  // Increase allowed step time if your runner supports it. This implementation
  // batches requests to avoid long sequential waits and performs them in parallel.
  results = [];
  const endpoint = '/default.asp?page=xxtest';
  const timeoutMs = 15000; // per-request timeout
  const concurrency = 10;

  const batches = [];
  for (let i = 0; i < sites.length; i += concurrency) {
    batches.push(sites.slice(i, i + concurrency));
  }

  for (const batch of batches) {
    const promises = batch.map(async (s) => {
      const url = s.replace(/\/$/, '') + endpoint;
      try {
        const resp = await axios.get(url, { timeout: timeoutMs });
        return { site: s, status: resp.status, body: typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data) };
      } catch (err) {
        return { site: s, error: err.message };
      }
    });

    const settled = await Promise.all(promises);
    results.push(...settled);
  }
});

Then('each response should include the expected IP and header values', function () {
  const expectedLines = [
    'Getting Client IP: 10.98.5.44',
    'Real Client IP: 10.98.5.44',
    'REMOTE_ADDR: 10.56.112.5',
    'HTTP_X_FORWARDED_FOR: 10.98.5.44',
    'HTTP_X_DS_CLIENT_IP: 10.98.5.44'
  ];

  // We'll assert that at least one of the successful responses contains all expected lines.
  const failures = [];

  results.forEach((r) => {
    if (r.error) {
      failures.push({ site: r.site, reason: `Request error: ${r.error}` });
      return;
    }
    const missing = expectedLines.filter((line) => !r.body.includes(line));
    if (missing.length > 0) failures.push({ site: r.site, reason: `Missing lines: ${missing.join(', ')}` });
  });

  if (failures.length > 0) {
    const summary = failures.map(f => `${f.site} -> ${f.reason}`).join('\n');
    throw new Error(`Some sites failed validation:\n${summary}`);
  }
});
