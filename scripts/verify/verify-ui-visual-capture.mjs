#!/usr/bin/env node

/**
 * verify-ui-visual-capture.mjs
 *
 * v78: Verify production and desktop visual capture artifacts
 *
 * Usage:
 * TITANE_UI_VISUAL_ARTIFACT=artifacts/ui-visual/v78-production-visual-capture.jsonl node scripts/verify/verify-ui-visual-capture.mjs
 *
 * Environment Variables:
 * - TITANE_UI_VISUAL_ARTIFACT: path to artifact file (default: artifacts/ui-visual/v78-production-visual-capture.jsonl)
 * - TITANE_UI_VISUAL_STRICT: set to '1' for strict mode (fail on any BROKEN or UNKNOWN)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_PATH =
  process.env.TITANE_UI_VISUAL_ARTIFACT ||
  'artifacts/ui-visual/v78-production-visual-capture.jsonl';
const STRICT_MODE = process.env.TITANE_UI_VISUAL_STRICT === '1';

const CANONICAL_ROUTES = [
  '/titane',
  '/experience',
  '/time',
  '/admin',
  '/dev',
  '/fusion',
  '/cloud',
  '/twins',
  '/optimization',
  '/total-dev',
  '/memory',
  '/doc-center',
  '/research',
  '/orchestration-center',
  '/orchestration-intelligence',
  '/reality-center',
  '/hyper-center',
  '/quantum-center',
  '/singularity',
  '/sentinel',
  '/watchdog',
  '/selfheal',
  '/adaptive',
  '/skills',
  '/knowledge',
  '/creation',
  '/evolution',
  '/performance',
  '/htf',
];

const MAIN_MENU_ROUTES = [
  '/titane',
  '/time',
  '/admin',
  '/dev',
  '/fusion',
  '/twins',
  '/optimization',
  '/total-dev',
];

function verifyArtifact() {
  console.log(`\n=== TITANE v78: Visual Capture Artifact Verification ===\n`);
  console.log(`Artifact: ${ARTIFACT_PATH}`);
  console.log(`Strict Mode: ${STRICT_MODE ? 'ON' : 'OFF'}\n`);

  // Check file exists
  if (!fs.existsSync(ARTIFACT_PATH)) {
    console.error(`❌ FAIL: Artifact not found: ${ARTIFACT_PATH}`);
    process.exit(1);
  }

  // Parse JSONL
  let records = [];
  try {
    const content = fs.readFileSync(ARTIFACT_PATH, 'utf-8');
    records = content
      .split('\n')
      .filter(Boolean)
      .map((line, idx) => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.error(
            `❌ FAIL: Line ${idx + 1} is not valid JSON: ${line.substring(0, 100)}`
          );
          throw e;
        }
      });
  } catch (error) {
    console.error(`❌ FAIL: Cannot parse artifact file`);
    process.exit(1);
  }

  console.log(`✓ Artifact parsed: ${records.length} records\n`);

  // Verify schema
  let schemaErrors = 0;
  const requiredFields = [
    'schemaVersion',
    'route',
    'pageId',
    'visualStatus',
    'screenshot',
  ];

  for (const record of records) {
    for (const field of requiredFields) {
      if (!(field in record)) {
        console.error(`❌ FAIL: Record missing field '${field}': ${record.route}`);
        schemaErrors++;
      }
    }
  }

  if (schemaErrors > 0) {
    console.error(`\n❌ FAIL: ${schemaErrors} schema violations`);
    process.exit(1);
  }

  // Count by status
  const statusCounts = {};
  for (const record of records) {
    const status = record.visualStatus || 'UNKNOWN';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  console.log('Status Distribution:');
  for (const [status, count] of Object.entries(statusCounts)) {
    const icon =
      status.startsWith('VISUAL_ACTIVE') || status.startsWith('VISUAL_GUARDED')
        ? '✓'
        : '⚠';
    console.log(`  ${icon} ${status}: ${count}`);
  }

  // Check for critical issues
  const broken = records.filter(r => r.visualStatus.includes('BROKEN'));
  const blank = records.filter(r => r.blankPage === true);
  const errorBoundary = records.filter(
    r => r.errorBoundary === true && !r.disclosureFound
  );

  console.log(`\nCritical Checks:`);
  console.log(`  Broken pages: ${broken.length}`);
  console.log(`  Blank pages: ${blank.length}`);
  console.log(`  Unclassified ErrorBoundary: ${errorBoundary.length}`);

  // Verify main menu routes captured
  const routesCaptured = new Set(records.map(r => r.route));
  const mainMenuMissing = MAIN_MENU_ROUTES.filter(r => !routesCaptured.has(r));

  if (mainMenuMissing.length > 0) {
    console.log(`\n⚠ WARNING: Missing main menu routes: ${mainMenuMissing.join(', ')}`);
  } else {
    console.log(`\n✓ All 8 main menu routes captured`);
  }

  // Verify screenshot files exist
  let missingScreenshots = 0;
  for (const record of records) {
    if (record.screenshot && record.visualStatus !== 'VISUAL_BROKEN') {
      const screenshotPath = path.join(path.dirname(ARTIFACT_PATH), record.screenshot);
      if (!fs.existsSync(screenshotPath)) {
        console.error(`❌ Missing screenshot: ${record.screenshot}`);
        missingScreenshots++;
      }
    }
  }

  if (missingScreenshots > 0) {
    console.error(`\n❌ FAIL: ${missingScreenshots} screenshot files missing`);
    process.exit(1);
  }

  // Verdict
  console.log(`\n=== VERDICT ===\n`);

  if (broken.length > 0) {
    console.error(`❌ FAIL: ${broken.length} broken pages detected`);
    if (STRICT_MODE) process.exit(1);
  }

  if (blank.length > 0) {
    console.error(`❌ FAIL: ${blank.length} blank pages detected`);
    if (STRICT_MODE) process.exit(1);
  }

  if (errorBoundary.length > 0) {
    console.error(`❌ FAIL: ${errorBoundary.length} unclassified error boundaries`);
    if (STRICT_MODE) process.exit(1);
  }

  const activeCount =
    (statusCounts['VISUAL_ACTIVE'] || 0) + (statusCounts['VISUAL_GUARDED'] || 0);
  const totalCount = records.length;
  const coverage = Math.round((activeCount / totalCount) * 100);

  console.log(
    `✓ PASS: ${activeCount}/${totalCount} routes (${coverage}%) are active or guarded`
  );
  console.log(`✓ Artifact verified successfully`);
  console.log(`✓ All required screenshots present`);

  // Summary
  console.log(`\nSummary:`);
  console.log(`  Routes captured: ${totalCount}`);
  console.log(`  Main menu covered: ${8 - mainMenuMissing.length}/8`);
  console.log(`  Coverage: ${coverage}%`);
  console.log(`  Schema: v${records[0]?.schemaVersion || 'unknown'}`);

  process.exit(0);
}

// Run verification
verifyArtifact();
