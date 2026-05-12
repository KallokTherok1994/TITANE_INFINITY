#!/usr/bin/env node
/**
 * verify-ui-prod-install-freshness.mjs
 * TITANE v84 — Verify UI prod install freshness: version alignment, no epoch dates in source,
 * snapshot null guards present, formatter guards present.
 * Usage: node scripts/verify/verify-ui-prod-install-freshness.mjs
 */

import { readFileSync, existsSync } from 'fs';

const ROOT = new URL('../../', import.meta.url).pathname;

const failures = [];
const passes = [];
const warnings = [];

const pkg = JSON.parse(readFileSync(`${ROOT}package.json`, 'utf8'));
const version = pkg.version;

// 1. Version alignment checks
const versionFiles = [
  { path: 'src-tauri/Cargo.toml', pattern: /^version\s*=\s*"(\d+\.\d+\.\d+)"/m },
  { path: 'src-tauri/tauri.conf.json', pattern: /"version"\s*:\s*"(\d+\.\d+\.\d+)"/ },
  { path: 'tauri.base.json', pattern: /"version"\s*:\s*"(\d+\.\d+\.\d+)"/ },
];

for (const { path, pattern } of versionFiles) {
  const fullPath = `${ROOT}${path}`;
  if (!existsSync(fullPath)) {
    warnings.push(`VERSION_FILE_MISSING: ${path}`);
    continue;
  }
  const content = readFileSync(fullPath, 'utf8');
  const match = content.match(pattern);
  if (!match) {
    failures.push(`VERSION_PATTERN_NOT_FOUND: ${path}`);
  } else if (match[1] !== version) {
    failures.push(`VERSION_MISMATCH in ${path}: found=${match[1]} expected=${version}`);
  } else {
    passes.push(`VERSION_ALIGNED: ${path} = ${version}`);
  }
}

// 2. Check index.html version strings (4 patterns)
const indexPath = `${ROOT}index.html`;
if (existsSync(indexPath)) {
  const html = readFileSync(indexPath, 'utf8');
  const patterns = [
    { re: /TITANE_INFINITY v(\d+\.\d+\.\d+)/, name: 'header-comment' },
    { re: /TITANE∞ v(\d+\.\d+\.\d+)/, name: 'meta-description' },
    { re: /name="version" content="(\d+\.\d+\.\d+)"/, name: 'meta-version' },
    { re: /<title>TITANE∞ v(\d+\.\d+\.\d+)/, name: 'title' },
  ];
  for (const { re, name } of patterns) {
    const m = html.match(re);
    if (!m) {
      failures.push(`INDEX_HTML_PATTERN_MISSING: ${name}`);
    } else if (m[1] !== version) {
      failures.push(
        `INDEX_HTML_VERSION_MISMATCH(${name}): found=${m[1]} expected=${version}`
      );
    } else {
      passes.push(`INDEX_HTML_VERSION_OK: ${name} = ${version}`);
    }
  }
} else {
  failures.push('INDEX_HTML_MISSING');
}

// 3. Check TimePage.tsx for epoch date null guards
const timePagePath = `${ROOT}src/pages/TimePage.tsx`;
if (existsSync(timePagePath)) {
  const timePage = readFileSync(timePagePath, 'utf8');

  // Guard in formatDate function
  if (timePage.includes('if (!timestamp || timestamp <= 0) return')) {
    passes.push('TIME_PAGE_FORMATDATE_NULL_GUARD: present');
  } else {
    failures.push(
      'TIME_PAGE_FORMATDATE_NULL_GUARD: MISSING — epoch date 31/12/1969 regression risk'
    );
  }

  // Guard in stats oldestSnapshot display
  if (timePage.includes('stats.oldestSnapshot > 0')) {
    passes.push('TIME_PAGE_OLDEST_SNAPSHOT_GUARD: present');
  } else {
    failures.push('TIME_PAGE_OLDEST_SNAPSHOT_GUARD: MISSING');
  }

  // Guard in stats newestSnapshot display
  if (timePage.includes('stats.newestSnapshot > 0')) {
    passes.push('TIME_PAGE_NEWEST_SNAPSHOT_GUARD: present');
  } else {
    failures.push('TIME_PAGE_NEWEST_SNAPSHOT_GUARD: MISSING');
  }

  // Filter in snapshotTimeline builder
  if (timePage.includes('.filter(snapshot => snapshot.timestamp > 0)')) {
    passes.push('TIME_PAGE_TIMELINE_FILTER: present');
  } else {
    failures.push('TIME_PAGE_TIMELINE_FILTER: MISSING');
  }
} else {
  failures.push('TIME_PAGE_MISSING: src/pages/TimePage.tsx not found');
}

// 4. Check deployment/latest VERSION.txt
const deployVersionPath = `${ROOT}deployment/latest/VERSION.txt`;
if (existsSync(deployVersionPath)) {
  const deployVersion = readFileSync(deployVersionPath, 'utf8').trim();
  if (deployVersion !== version) {
    failures.push(
      `DEPLOY_VERSION_MISMATCH: deployment/latest=${deployVersion} expected=${version}`
    );
  } else {
    passes.push(`DEPLOY_VERSION_MATCH: ${deployVersion}`);
  }
} else {
  warnings.push('DEPLOY_VERSION_MISSING: deployment/latest/VERSION.txt not found');
}

// 5. Check sync-versions.mjs has section 7 (index.html sync)
const syncVersionsPath = `${ROOT}scripts/sync-versions.mjs`;
if (existsSync(syncVersionsPath)) {
  const content = readFileSync(syncVersionsPath, 'utf8');
  if (content.includes('index.html') && content.includes('TITANE_INFINITY v')) {
    passes.push('SYNC_VERSIONS_INDEX_HTML_SECTION: present');
  } else {
    failures.push(
      'SYNC_VERSIONS_INDEX_HTML_SECTION: MISSING — index.html not in sync pipeline'
    );
  }
} else {
  failures.push('SYNC_VERSIONS_SCRIPT_MISSING');
}

// Report
console.log('\n=== TITANE v84 — UI Prod Install Freshness Verifier ===\n');
for (const p of passes) console.log(`  PASS     ${p}`);
for (const w of warnings) console.log(`  WARNING  ${w}`);
for (const f of failures) console.log(`  FAIL     ${f}`);

console.log(
  `\nSummary: ${passes.length} PASS, ${warnings.length} WARN, ${failures.length} FAIL`
);

if (failures.length > 0) {
  console.error('\nVERDICT: FAIL — UI prod install freshness not confirmed');
  process.exit(1);
} else {
  console.log('\nVERDICT: PASS — UI prod install freshness confirmed');
  process.exit(0);
}
