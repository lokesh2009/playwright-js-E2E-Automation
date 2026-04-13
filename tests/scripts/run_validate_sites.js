#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Default sites file; can be overridden by CLI --sites or --env
let cfgPath = path.join(process.cwd(), 'tests', 'config', 'sites.json');
let sites = [];
const endpoint = '/default.asp?page=xxtest';
const expectedLines = [
  'Getting Client IP: 10.98.5.44',
  'Real Client IP: 10.98.5.44',
  'REMOTE_ADDR: 10.56.112.5',
  'HTTP_X_FORWARDED_FOR: 10.98.5.44',
  'HTTP_X_DS_CLIENT_IP: 10.98.5.44'
];

async function checkSite(s) {
  const url = s.replace(/\/$/, '') + endpoint;
  try {
    const resp = await axios.get(url, { timeout: 15000 });
    const body = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
    const missing = expectedLines.filter(l => !body.includes(l));
    return { site: s, ok: missing.length === 0, missing, status: resp.status };
  } catch (err) {
    return { site: s, ok: false, error: err.message };
  }
}
function printHelp() {
  console.log('Usage: node run_validate_sites.js [--parallel] [--concurrency N] [--dry-run] [--help]');
  console.log('\nOptions:');
  console.log('  --parallel         Run requests in parallel (batched by --concurrency)');
  console.log('  --concurrency N    Number of concurrent requests when --parallel is set (default 10)');
  console.log('  --dry-run          Do not make network requests; just print sites');
  console.log('  --help             Show this help message');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { parallel: false, concurrency: 10, dryRun: false, retries: 0, retryDelay: 1000, output: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--parallel') opts.parallel = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--help') { printHelp(); process.exit(0); }
    else if (a === '--concurrency') {
      const val = args[i + 1];
      if (!val || isNaN(Number(val))) { console.error('Invalid value for --concurrency'); process.exit(2); }
      opts.concurrency = Math.max(1, Number(val));
      i++;
    } else if (a.startsWith('--concurrency=')) {
      const val = a.split('=')[1];
      opts.concurrency = Math.max(1, Number(val));
    } else if (a === '--retries') {
      const val = args[i + 1];
      if (!val || isNaN(Number(val))) { console.error('Invalid value for --retries'); process.exit(2); }
      opts.retries = Math.max(0, Number(val));
      i++;
    } else if (a.startsWith('--retries=')) {
      const val = a.split('=')[1];
      opts.retries = Math.max(0, Number(val));
    } else if (a === '--retry-delay') {
      const val = args[i + 1];
      if (!val || isNaN(Number(val))) { console.error('Invalid value for --retry-delay'); process.exit(2); }
      opts.retryDelay = Math.max(0, Number(val));
      i++;
    } else if (a.startsWith('--retry-delay=')) {
      const val = a.split('=')[1];
      opts.retryDelay = Math.max(0, Number(val));
    } else if (a === '--output') {
      const val = args[i + 1];
      if (!val) { console.error('Invalid value for --output'); process.exit(2); }
      opts.output = val;
      i++;
    } else if (a.startsWith('--output=')) {
      opts.output = a.split('=')[1];
    } else if (a === '--sites') {
      const val = args[i + 1];
      if (!val) { console.error('Invalid value for --sites'); process.exit(2); }
      opts.sites = val;
      i++;
    } else if (a.startsWith('--sites=')) {
      opts.sites = a.split('=')[1];
    } else if (a === '--env') {
      const val = args[i + 1];
      if (!val) { console.error('Invalid value for --env'); process.exit(2); }
      opts.env = val.toLowerCase();
      i++;
    } else if (a.startsWith('--env=')) {
      opts.env = a.split('=')[1].toLowerCase();
    } else {
      console.error('Unknown argument:', a);
      printHelp();
      process.exit(2);
    }
  }
  return opts;
}

async function runSequential(dryRun) {
  const results = [];
  for (const s of sites) {
    console.log('Checking', s);
    if (dryRun) {
      results.push({ site: s, ok: null, skipped: true });
      continue;
    }
    const r = await checkSite(s);
    results.push(r);
    console.log(r.ok ? '  PASS' : `  FAIL: ${r.error || 'Missing lines: ' + r.missing.join(', ')}`);
  }
  return results;
}

async function runParallel(concurrency, dryRun) {
  const results = [];
  if (dryRun) {
    sites.forEach(s => { console.log('Would check', s); results.push({ site: s, ok: null, skipped: true }); });
    return results;
  }
  // Use a concurrency limiter (promise pool)
  const pool = [];
  let idx = 0;

  async function worker() {
    while (idx < sites.length) {
      const current = sites[idx++];
      try {
        const r = await checkSite(current);
        console.log(r.ok ? `${r.site}  PASS` : `${r.site}  FAIL: ${r.error || 'Missing lines: ' + r.missing.join(', ')}`);
        results.push(r);
      } catch (err) {
        results.push({ site: current, ok: false, error: err && err.message ? err.message : String(err) });
      }
    }
  }

  for (let i = 0; i < concurrency; i++) pool.push(worker());
  await Promise.all(pool);
  return results;
}

// Helper: sleep ms
function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

// Wrap checkSite with retries
function withRetries(fn, retries, retryDelay) {
  return async function (s) {
    let attempt = 0;
    while (true) {
      try {
        return await fn(s);
      } catch (err) {
        if (attempt >= retries) throw err;
        const delay = retryDelay * Math.pow(2, attempt);
        await sleep(delay);
        attempt++;
      }
    }
  };
}

(async () => {
  const opts = parseArgs();

  // Determine sites file based on flags: --sites takes precedence, then --env
  if (opts.sites) {
    // allow relative path; resolve against cwd
    cfgPath = path.isAbsolute(opts.sites) ? opts.sites : path.join(process.cwd(), opts.sites);
  } else if (opts.env) {
    if (opts.env === 'sbx') cfgPath = path.join(process.cwd(), 'tests', 'config', 'sitesSBX.json');
    else if (opts.env === 'qa') cfgPath = path.join(process.cwd(), 'tests', 'config', 'sites.json');
    else {
      console.error('Unknown env value for --env. Supported: qa, sbx');
      process.exit(2);
    }
  }

  if (!fs.existsSync(cfgPath)) {
    console.error('Sites file not found at', cfgPath);
    process.exit(2);
  }

  const rawSites = fs.readFileSync(cfgPath, 'utf8');
  try {
    sites = JSON.parse(rawSites);
    if (!Array.isArray(sites)) throw new Error('sites file did not contain a JSON array');
  } catch (e) {
    // Fallback: try to parse as newline-separated or comma-separated list of URLs
    console.warn('Warning: sites file is not valid JSON, attempting lenient parse...');
    const lines = rawSites.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let urls = [];
    if (lines.length === 1 && lines[0].includes(',')) {
      // maybe a single-line comma separated list
      urls = lines[0].split(',').map(s => s.trim());
    } else {
      urls = lines.slice();
    }
    // clean quotes and trailing commas
    urls = urls.map(s => s.replace(/^\s*,?\s*/, '').replace(/\s*,?\s*$/, '').replace(/^['"]|['"]$/g, '').trim()).filter(Boolean);
    // ensure elements look like URLs
    urls = urls.filter(s => /^https?:\/\//i.test(s));
    if (urls.length === 0) {
      console.error('Failed to parse sites file as JSON or lenient list:', e.message);
      process.exit(2);
    }
    sites = urls;
  }

  // decorate checkSite with retries if requested
  const effectiveCheck = opts.retries > 0 ? withRetries(checkSite, opts.retries, opts.retryDelay) : checkSite;

  // Replace checkSite usage in runSequential and runParallel by shadowing (simple approach)
  const originalCheckSite = global.checkSite;
  // We'll patch the local checkSite reference by reassigning the name in this scope
  const _checkSite = effectiveCheck;

  // Override functions to use _checkSite
  async function runSequentialWithCheck(dryRun) {
    const results = [];
    for (const s of sites) {
      console.log('Checking', s);
      if (dryRun) { results.push({ site: s, ok: null, skipped: true }); continue; }
      const r = await _checkSite(s);
      results.push(r);
      console.log(r.ok ? '  PASS' : `  FAIL: ${r.error || 'Missing lines: ' + r.missing.join(', ')}`);
    }
    return results;
  }

  async function runParallelWithCheck(concurrency, dryRun) {
    const results = [];
    if (dryRun) { sites.forEach(s => { console.log('Would check', s); results.push({ site: s, ok: null, skipped: true }); }); return results; }
    const pool = [];
    let idx = 0;
    async function worker() {
      while (idx < sites.length) {
        const current = sites[idx++];
        try {
          const r = await _checkSite(current);
          console.log(r.ok ? `${r.site}  PASS` : `${r.site}  FAIL: ${r.error || 'Missing lines: ' + r.missing.join(', ')}`);
          results.push(r);
        } catch (err) {
          results.push({ site: current, ok: false, error: err && err.message ? err.message : String(err) });
        }
      }
    }
    for (let i = 0; i < concurrency; i++) pool.push(worker());
    await Promise.all(pool);
    return results;
  }

  let results = [];
  if (opts.parallel) {
    results = await runParallelWithCheck(opts.concurrency, opts.dryRun);
  } else {
    results = await runSequentialWithCheck(opts.dryRun);
  }

  const fails = results.filter(r => r.ok === false);
  console.log('\nSummary:');
  console.log(`Total sites: ${results.length}, Passed: ${results.filter(r => r.ok === true).length}, Skipped: ${results.filter(r => r.skipped).length}, Failed: ${fails.length}`);

  // Write output if requested
  if (opts.output) {
    try {
      const outPath = path.resolve(process.cwd(), opts.output);
      const ext = outPath.split('.').pop().toLowerCase();
      if (ext === 'json') {
        fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
      } else if (ext === 'csv') {
        const header = ['site','ok','status','error','missing'].join(',') + '\n';
        const lines = results.map(r => {
          const missing = r.missing ? '"' + (r.missing || []).join(';') + '"' : '';
          const error = r.error ? '"' + r.error.replace(/"/g,'""') + '"' : '';
          return [r.site, r.ok, r.status || '', error, missing].join(',');
        }).join('\n');
        fs.writeFileSync(outPath, header + lines, 'utf8');
      } else {
        // default to json
        fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
      }
      console.log('Wrote results to', outPath);
    } catch (err) {
      console.error('Failed to write output file:', err && err.message ? err.message : err);
    }
  }

  if (fails.length > 0) process.exit(1);
  process.exit(0);
})();
