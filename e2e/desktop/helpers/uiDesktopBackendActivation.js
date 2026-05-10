/**
 * uiDesktopBackendActivation.js
 * v57 — Backend activation helpers for proving real IPC flows.
 * Safe read-only only. No destructive actions. No real secrets.
 */

'use strict';

const { navigateAndWait, isVisible, getText, getAttribute, safeClick } = require('./uiDesktopFunctionalFlows.js');
const { logClassification } = require('./uiDesktopFunctionalAssertions.js');

/**
 * Attempt a safe read-only Tauri IPC invoke.
 * Returns { ok, content, error, available } shape.
 * Never throws — degraded result is classified as BACKEND_DEGRADED_EXPECTED.
 */
async function tryInvoke(command, args = {}) {
  try {
    const result = await browser.execute(async (cmd, cmdArgs) => {
      try {
        const invoker =
          (window.__TAURI__?.core?.invoke) ||
          (window.__TAURI__?.tauri?.invoke) ||
          (window.__TAURI__?.invoke);
        if (!invoker) return { ok: false, content: null, error: 'NO_TAURI_INVOKE', available: false };
        const res = await invoker(cmd, cmdArgs);
        return { ok: true, content: res, error: null, available: true };
      } catch (e) {
        return { ok: false, content: null, error: String(e), available: true };
      }
    }, command, args);
    return result || { ok: false, content: null, error: 'null_result', available: false };
  } catch (e) {
    return { ok: false, content: null, error: String(e), available: false };
  }
}

/**
 * Check if Tauri IPC bridge is available in the current page.
 */
async function isTauriAvailable() {
  try {
    return await browser.execute(() => {
      return !!(
        window.__TAURI__?.core?.invoke ||
        window.__TAURI__?.tauri?.invoke ||
        window.__TAURI__?.invoke
      );
    });
  } catch {
    return false;
  }
}

/**
 * Get body HTML safely.
 */
async function getBodyHTML() {
  try {
    return await browser.execute(() => document.body.innerHTML || '');
  } catch {
    return '';
  }
}

/**
 * Check for visible degraded/blocked state in HTML.
 */
function hasDegradedIndicator(html) {
  if (typeof html !== 'string') return false;
  return (
    html.includes('degraded') || html.includes('Degraded') ||
    html.includes('unavailable') || html.includes('Unavailable') ||
    html.includes('offline') || html.includes('Offline') ||
    html.includes('error') || html.includes('Error') ||
    html.includes('simulation') || html.includes('Simulation') ||
    html.includes('simulé') || html.includes('indisponible') ||
    html.includes('⚠') || html.includes('blocked') || html.includes('Blocked')
  );
}

/**
 * Check if content implies simulated state.
 */
function hasSimulatedIndicator(html) {
  if (typeof html !== 'string') return false;
  return (
    html.includes('simulation') || html.includes('Simulation') ||
    html.includes('simulé') || html.includes('simulated') ||
    html.includes('mock') || html.includes('fictif') ||
    html.includes('SIMULATED')
  );
}

module.exports = {
  tryInvoke,
  isTauriAvailable,
  getBodyHTML,
  hasDegradedIndicator,
  hasSimulatedIndicator,
  navigateAndWait,
  isVisible,
  getText,
  getAttribute,
  safeClick,
  logClassification,
};
