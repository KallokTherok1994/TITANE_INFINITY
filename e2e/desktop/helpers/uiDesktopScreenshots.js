/**
 * uiDesktopScreenshots.js
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Screenshot-on-failure and proof capture helper for desktop E2E tests.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SCREENSHOTS_DIR = resolve(__dirname, '../../../artifacts/run1/desktop-screenshots');
const PROOF_LOG_PATH = resolve(__dirname, '../../../artifacts/run1/ui-desktop-full-coverage-v50.log');

let _proofLog = [];
let _startTime = Date.now();

/**
 * Ensure the screenshots directory exists.
 */
function ensureDir() {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Take a screenshot and save it.
 * @param {string} name e.g. 'titane-route-loaded'
 * @returns {string} path to screenshot
 */
async function takeProofScreenshot(name) {
  ensureDir();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}_${ts}.png`;
  const filepath = join(SCREENSHOTS_DIR, filename);
  
  try {
    await browser.saveScreenshot(filepath);
    logProof({ type: 'SCREENSHOT', name, filepath, ts });
    return filepath;
  } catch (e) {
    logProof({ type: 'SCREENSHOT_ERROR', name, error: e.message, ts });
    return null;
  }
}

/**
 * Take a screenshot on test failure.
 * Typically called in afterEach hooks.
 * @param {string} testTitle
 * @param {boolean} failed
 */
async function screenshotOnFailure(testTitle, failed) {
  if (!failed) return;
  const safeName = testTitle.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 60);
  return takeProofScreenshot(`FAILURE_${safeName}`);
}

/**
 * Log a proof event to the in-memory log and flush to disk.
 * @param {object} entry
 */
function logProof(entry) {
  const event = {
    ts: new Date().toISOString(),
    elapsed: `${Math.round((Date.now() - _startTime) / 1000)}s`,
    ...entry,
  };
  _proofLog.push(event);
  
  // Flush to disk immediately
  ensureDir();
  try {
    writeFileSync(PROOF_LOG_PATH, _proofLog.map(e => JSON.stringify(e)).join('\n'));
  } catch (_) {
    // silent — don't fail test on logging error
  }
}

/**
 * Log a route result (LOADED | NOT_FOUND | DEGRADED | ERROR_BOUNDARY | SIMULATED).
 * @param {string} route
 * @param {string} classification
 * @param {object} details
 */
function logRouteResult(route, classification, details = {}) {
  logProof({ type: 'ROUTE_RESULT', route, classification, ...details });
}

/**
 * Log a tab result.
 * @param {string} route
 * @param {string} tabId
 * @param {string} result FOUND | NOT_FOUND | CLICKED
 * @param {object} details
 */
function logTabResult(route, tabId, result, details = {}) {
  logProof({ type: 'TAB_RESULT', route, tabId, result, ...details });
}

/**
 * Log an action classification.
 * @param {string} route
 * @param {string} actionId
 * @param {string} result SAFE_CLICKED | SKIPPED | GUARDED | NOT_FOUND
 * @param {object} details
 */
function logActionResult(route, actionId, result, details = {}) {
  logProof({ type: 'ACTION_RESULT', route, actionId, result, ...details });
}

/**
 * Write a final summary to the proof log.
 * @param {object} summary
 */
function writeFinalSummary(summary) {
  logProof({ type: 'FINAL_SUMMARY', ...summary });
  console.log('[uiDesktopScreenshots] Proof log written to:', PROOF_LOG_PATH);
}

/**
 * Get the current proof log for assertions.
 * @returns {object[]}
 */
function getProofLog() {
  return _proofLog;
}

/**
 * Reset log (call between test runs if needed).
 */
function resetLog() {
  _proofLog = [];
  _startTime = Date.now();
}

export {
  takeProofScreenshot,
  screenshotOnFailure,
  logProof,
  logRouteResult,
  logTabResult,
  logActionResult,
  writeFinalSummary,
  getProofLog,
  resetLog,
  SCREENSHOTS_DIR,
  PROOF_LOG_PATH,
};
