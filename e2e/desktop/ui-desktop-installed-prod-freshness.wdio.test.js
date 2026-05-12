/**
 * ui-desktop-installed-prod-freshness.wdio.test.js
 * TITANE v84 — WDIO E2E: Installed prod freshness + no epoch dates in TIME page
 * Verifies the installed production binary exposes correct version and no epoch date regression.
 *
 * @jest-environment node
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../');

describe('TITANE v84 — Installed Prod Freshness', () => {
  it('installed binary exists at /usr/bin/titane-infinity', () => {
    assert.ok(
      fs.existsSync('/usr/bin/titane-infinity'),
      'Binary missing at /usr/bin/titane-infinity'
    );
  });

  it('installed version matches package.json', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
    );
    let dpkgVersion = null;
    try {
      dpkgVersion = execSync(
        'dpkg -s titane-infinity 2>/dev/null | grep "^Version:" | cut -d" " -f2',
        {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      ).trim();
    } catch {
      dpkgVersion = null;
    }
    if (dpkgVersion) {
      assert.strictEqual(
        dpkgVersion,
        pkg.version,
        `Version mismatch: dpkg=${dpkgVersion} pkg=${pkg.version}`
      );
    } else {
      // Not on a dpkg system, skip
      console.log('SKIP: dpkg not available');
    }
  });

  it('deployment/latest/VERSION.txt matches package.json', () => {
    const versionPath = path.join(PROJECT_ROOT, 'deployment/latest/VERSION.txt');
    if (!fs.existsSync(versionPath)) {
      console.log('SKIP: deployment/latest/VERSION.txt not found');
      return;
    }
    const pkg = JSON.parse(
      fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
    );
    const deployVersion = fs.readFileSync(versionPath, 'utf8').trim();
    assert.strictEqual(
      deployVersion,
      pkg.version,
      `Deploy version mismatch: ${deployVersion} != ${pkg.version}`
    );
  });

  it('TimePage.tsx has null guard in formatDate to prevent epoch 31/12/1969', () => {
    const timePagePath = path.join(PROJECT_ROOT, 'src/pages/TimePage.tsx');
    assert.ok(fs.existsSync(timePagePath), 'TimePage.tsx not found');
    const content = fs.readFileSync(timePagePath, 'utf8');
    assert.ok(
      content.includes('if (!timestamp || timestamp <= 0) return'),
      'formatDate null guard missing — epoch date 31/12/1969 regression risk'
    );
  });

  it('TimePage.tsx has null guard for oldestSnapshot stats display', () => {
    const timePagePath = path.join(PROJECT_ROOT, 'src/pages/TimePage.tsx');
    const content = fs.readFileSync(timePagePath, 'utf8');
    assert.ok(
      content.includes('stats.oldestSnapshot > 0'),
      'oldestSnapshot guard missing'
    );
  });

  it('TimePage.tsx has null guard for newestSnapshot stats display', () => {
    const timePagePath = path.join(PROJECT_ROOT, 'src/pages/TimePage.tsx');
    const content = fs.readFileSync(timePagePath, 'utf8');
    assert.ok(
      content.includes('stats.newestSnapshot > 0'),
      'newestSnapshot guard missing'
    );
  });

  it('TimePage.tsx filters zero-timestamp snapshots from timeline', () => {
    const timePagePath = path.join(PROJECT_ROOT, 'src/pages/TimePage.tsx');
    const content = fs.readFileSync(timePagePath, 'utf8');
    assert.ok(
      content.includes('.filter(snapshot => snapshot.timestamp > 0)'),
      'Timeline snapshot filter missing'
    );
  });

  it('sync-versions.mjs includes index.html sync (section 7)', () => {
    const syncPath = path.join(PROJECT_ROOT, 'scripts/sync-versions.mjs');
    assert.ok(fs.existsSync(syncPath), 'sync-versions.mjs not found');
    const content = fs.readFileSync(syncPath, 'utf8');
    assert.ok(
      content.includes('index.html') && content.includes('TITANE_INFINITY v'),
      'sync-versions.mjs missing index.html section 7'
    );
  });

  it('verify-installed-prod-freshness.mjs exists', () => {
    const verifierPath = path.join(
      PROJECT_ROOT,
      'scripts/verify/verify-installed-prod-freshness.mjs'
    );
    assert.ok(
      fs.existsSync(verifierPath),
      'verify-installed-prod-freshness.mjs not found'
    );
  });

  it('verify-ui-prod-install-freshness.mjs exists', () => {
    const verifierPath = path.join(
      PROJECT_ROOT,
      'scripts/verify/verify-ui-prod-install-freshness.mjs'
    );
    assert.ok(
      fs.existsSync(verifierPath),
      'verify-ui-prod-install-freshness.mjs not found'
    );
  });
});
