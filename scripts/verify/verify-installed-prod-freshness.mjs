#!/usr/bin/env node
/**
 * verify-installed-prod-freshness.mjs
 * TITANE v84 — Verify that the installed production binary matches the deployment/latest artifacts.
 * Usage: node scripts/verify/verify-installed-prod-freshness.mjs
 */

import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const ROOT = new URL('../../', import.meta.url).pathname;
const DEPLOYMENT_LATEST = `${ROOT}deployment/latest`;

function sha256File(path) {
  if (!existsSync(path)) return null;
  const content = readFileSync(path);
  return createHash('sha256').update(content).digest('hex');
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

const failures = [];
const passes = [];

// 1. Check installed binary exists
const installedBinary = '/usr/bin/titane-infinity';
if (!existsSync(installedBinary)) {
  failures.push('INSTALLED_BINARY_MISSING: /usr/bin/titane-infinity not found');
} else {
  passes.push('INSTALLED_BINARY_EXISTS');
}

// 2. Check dpkg version matches package.json
const pkgVersion = JSON.parse(readFileSync(`${ROOT}package.json`, 'utf8')).version;
const dpkgVersion = run(
  'dpkg -s titane-infinity 2>/dev/null | grep Version | cut -d" " -f2'
);
if (dpkgVersion !== pkgVersion) {
  failures.push(`VERSION_MISMATCH: package.json=${pkgVersion} dpkg=${dpkgVersion}`);
} else {
  passes.push(`VERSION_MATCH: ${pkgVersion}`);
}

// 3. Check deployment/latest VERSION.txt
const deployVersion = existsSync(`${DEPLOYMENT_LATEST}/VERSION.txt`)
  ? readFileSync(`${DEPLOYMENT_LATEST}/VERSION.txt`, 'utf8').trim()
  : null;
if (deployVersion !== pkgVersion) {
  failures.push(
    `DEPLOY_VERSION_MISMATCH: deployment/latest=${deployVersion} expected=${pkgVersion}`
  );
} else {
  passes.push(`DEPLOY_VERSION_MATCH: ${deployVersion}`);
}

// 4. Verify SHA256SUMS.txt in deployment/latest
const sha256sumsPath = `${DEPLOYMENT_LATEST}/SHA256SUMS.txt`;
if (existsSync(sha256sumsPath)) {
  const sums = readFileSync(sha256sumsPath, 'utf8').trim().split('\n');
  for (const line of sums) {
    const [expectedHash, filename] = line.trim().split(/\s+/);
    if (!filename) continue;
    const filePath = `${DEPLOYMENT_LATEST}/${filename}`;
    if (!existsSync(filePath)) {
      // Binary path check
      if (filename === 'titane-infinity') {
        const actualHash = sha256File(installedBinary);
        if (actualHash && actualHash === expectedHash) {
          passes.push(`BINARY_HASH_MATCH: ${filename}`);
        } else if (actualHash) {
          failures.push(
            `BINARY_HASH_MISMATCH: ${filename} expected=${expectedHash.slice(0, 16)} actual=${actualHash.slice(0, 16)}`
          );
        }
      } else {
        failures.push(`ARTIFACT_MISSING: ${filePath}`);
      }
      continue;
    }
    const actualHash = sha256File(filePath);
    if (actualHash === expectedHash) {
      passes.push(`ARTIFACT_HASH_MATCH: ${filename}`);
    } else {
      failures.push(`ARTIFACT_HASH_MISMATCH: ${filename}`);
    }
  }
} else {
  failures.push('SHA256SUMS_MISSING: deployment/latest/SHA256SUMS.txt not found');
}

// 5. Check index.html version strings
const indexHtml = existsSync(`${ROOT}index.html`)
  ? readFileSync(`${ROOT}index.html`, 'utf8')
  : '';
const versionInIndexHtml = (indexHtml.match(/TITANE_INFINITY v(\d+\.\d+\.\d+)/) || [])[1];
if (versionInIndexHtml && versionInIndexHtml !== pkgVersion) {
  failures.push(
    `INDEX_HTML_VERSION_MISMATCH: found=${versionInIndexHtml} expected=${pkgVersion}`
  );
} else if (versionInIndexHtml) {
  passes.push(`INDEX_HTML_VERSION_MATCH: ${versionInIndexHtml}`);
}

// Report
console.log('\n=== TITANE v84 — Installed Prod Freshness Verifier ===\n');
for (const p of passes) console.log(`  PASS  ${p}`);
for (const f of failures) console.log(`  FAIL  ${f}`);

console.log(`\nSummary: ${passes.length} PASS, ${failures.length} FAIL`);

if (failures.length > 0) {
  console.error('\nVERDICT: FAIL — installed prod freshness not confirmed');
  process.exit(1);
} else {
  console.log('\nVERDICT: PASS — installed prod is fresh and matches deployment/latest');
  process.exit(0);
}
