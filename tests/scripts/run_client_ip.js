#!/usr/bin/env node
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const base = process.env.BASE_URL;
const endpoint = process.env.ENDPOINT || '/default.asp?page=xxtest';
if (!base) {
  console.error('BASE_URL not set in .env');
  process.exit(2);
}

const url = base.replace(/\/$/, '') + endpoint;

const expectedLines = [
  'Getting Client IP: 10.98.5.44',
  'Real Client IP: 10.98.5.44',
  'REMOTE_ADDR: 10.56.112.5',
  'HTTP_X_FORWARDED_FOR: 10.98.5.44',
  'HTTP_X_DS_CLIENT_IP: 10.98.5.44'
];

(async () => {
  try {
    console.log('Requesting', url);
    const resp = await axios.get(url, { timeout: 15000 });
    const body = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
    const missing = expectedLines.filter(l => !body.includes(l));
    if (missing.length === 0) {
      console.log('PASS: All expected lines found in response');
      process.exit(0);
    } else {
      console.error('FAIL: Missing lines:', missing);
      process.exit(1);
    }
  } catch (err) {
    console.error('ERROR requesting URL:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
