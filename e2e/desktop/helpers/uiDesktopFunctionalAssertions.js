/**
 * uiDesktopFunctionalAssertions.js
 * v54 — Assertion helpers for functional module proofs.
 * Classifications: FUNCTIONAL_LIVE_PROVEN, FUNCTIONAL_DEGRADED_EXPECTED, etc.
 */

'use strict';

const {
  isVisible,
  getText,
  count,
  classifySurface,
} = require('./uiDesktopFunctionalFlows.js');

/**
 * Assert module root is loaded.
 * @param {string} rootTestId
 * @param {string} moduleName
 */
async function assertModuleLoaded(rootTestId, moduleName) {
  const visible = await isVisible(rootTestId, 8000);
  if (!visible) {
    throw new Error(
      `[v54:functional] Module ${moduleName} root [data-testid="${rootTestId}"] NOT FOUND`
    );
  }
}

/**
 * Assert that a text-bearing element exists and is non-empty.
 * @param {string} testId
 * @param {string} label
 */
async function assertNonEmpty(testId, label) {
  const visible = await isVisible(testId, 5000);
  if (!visible) {
    throw new Error(
      `[v54:functional] ${label} element [data-testid="${testId}"] not visible`
    );
  }
  const text = await getText(testId);
  if (!text || text.trim().length === 0) {
    throw new Error(
      `[v54:functional] ${label} element [data-testid="${testId}"] is empty`
    );
  }
}

/**
 * Assert visible surface classification.
 * @param {string} rootTestId
 * @param {string[]} allowedClassifications
 * @param {string} moduleName
 */
async function assertSurfaceClassification(
  rootTestId,
  allowedClassifications,
  moduleName
) {
  const cls = await classifySurface(rootTestId);
  if (!allowedClassifications.includes(cls)) {
    throw new Error(
      `[v54:functional] ${moduleName} surface classification=${cls}, expected one of ${allowedClassifications.join('|')}`
    );
  }
  return cls;
}

/**
 * Log functional classification to console (captured by WDIO).
 * @param {string} module
 * @param {string} classification
 * @param {string} [note='']
 */
function logClassification(module, classification, note = '') {
  console.log(
    `[v54:functional] ${module} | ${classification}${note ? ' | ' + note : ''}`
  );
}

module.exports = {
  assertModuleLoaded,
  assertNonEmpty,
  assertSurfaceClassification,
  logClassification,
};
