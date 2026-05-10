/**
 * uiDesktopBackendProofDepth.js
 * v58 — Structured proof-depth helper for deep backend verification.
 *
 * Key improvements over v57 uiDesktopBackendActivation.js:
 * - Returns structured proof: command, attempted, available, ok, responseShape,
 *   errorKind, latencyMs, proofLevel, uiReflected, safeToPersist
 * - Distinguishes: command absent vs command failed vs command returned typed response
 * - Persists proof lines to artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl
 * - Fails for REQUIRED_LIVE commands that are missing
 * - Never throws for optional (OPTIONAL) flows
 * - Redacts secrets from response shapes
 *
 * Proof depth levels (taxonomy v58):
 *   IPC_COMMAND_PROVEN     — invoke reached IPC channel
 *   IPC_RESPONSE_PROVEN    — command returned typed/controlled response
 *   UI_REFLECTS_BACKEND    — UI state changed after IPC response
 *   SANDBOXED_MUTATION     — safe temp/test mutation executed and verified
 *   GUARDED_ONLY           — action guarded, no execution
 *   DEGRADED_VISIBLE       — degraded state visible and honest
 *   DISPLAY_ONLY_CONFIRMED — intentional display-only
 *   BLOCKED_BY_PROVIDER    — local provider not reachable
 *   BLOCKED_BY_RUNTIME     — IPC not available at runtime
 *   BLOCKED_BY_MISSING_COMMAND — command not registered or not in allow list
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { navigateAndWait, isVisible, getText, getAttribute, safeClick } = require('./uiDesktopFunctionalFlows.js');
const { logClassification } = require('./uiDesktopFunctionalAssertions.js');

const ARTIFACT_DIR = path.join(process.cwd(), 'artifacts', 'backend-proof-depth');
const ARTIFACT_FILE = path.join(ARTIFACT_DIR, 'v58-backend-proof-depth.jsonl');

// Ensure artifact dir exists
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

/**
 * Redact sensitive patterns from a stringified response.
 */
function redactSecrets(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/sk-[a-zA-Z0-9]{20,}/g, 'sk-REDACTED')
    .replace(/Bearer [a-zA-Z0-9]{20,}/g, 'Bearer REDACTED')
    .replace(/"token"\s*:\s*"[^"]{8,}"/g, '"token":"REDACTED"')
    .replace(/"secret"\s*:\s*"[^"]{8,}"/g, '"secret":"REDACTED"')
    .replace(/"key"\s*:\s*"[^"]{8,}"/g, '"key":"REDACTED"')
    .replace(/"password"\s*:\s*"[^"]{8,}"/g, '"password":"REDACTED"');
}

/**
 * Derive response shape description from a result value.
 */
function describeShape(val) {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'boolean') return `boolean:${val}`;
  if (typeof val === 'number') return `number:${val}`;
  if (typeof val === 'string') return `string(${val.length})`;
  if (Array.isArray(val)) return `array(${val.length}):[${val.slice(0, 3).map(v => typeof v).join(',')}]`;
  if (typeof val === 'object') {
    const keys = Object.keys(val).slice(0, 8).join(',');
    return `object{${keys}}`;
  }
  return `${typeof val}`;
}

/**
 * Classify error kind from error string.
 */
function classifyError(errorStr) {
  if (!errorStr) return null;
  if (errorStr.includes('NO_TAURI_INVOKE')) return 'NO_TAURI_INVOKE';
  if (errorStr.includes('not found') || errorStr.includes('unknown command')) return 'COMMAND_NOT_FOUND';
  if (errorStr.includes('Permission') || errorStr.includes('not allowed')) return 'PERMISSION_DENIED';
  if (errorStr.includes('timeout') || errorStr.includes('Timeout')) return 'TIMEOUT';
  if (errorStr.includes('Network') || errorStr.includes('network')) return 'NETWORK_ERROR';
  return 'COMMAND_ERROR';
}

/**
 * Classify proof level from result.
 */
function classifyProofLevel(result) {
  if (!result.attempted) return 'PROOF_DEPTH_BLOCKED_BY_RUNTIME';
  if (!result.available) return 'PROOF_DEPTH_BLOCKED_BY_RUNTIME';
  if (result.errorKind === 'NO_TAURI_INVOKE') return 'PROOF_DEPTH_BLOCKED_BY_RUNTIME';
  if (result.errorKind === 'COMMAND_NOT_FOUND') return 'PROOF_DEPTH_BLOCKED_BY_MISSING_COMMAND';
  if (result.ok && result.responseShape !== 'null') return 'PROOF_DEPTH_IPC_RESPONSE_PROVEN';
  if (result.attempted && result.available && result.errorKind !== 'NO_TAURI_INVOKE') return 'PROOF_DEPTH_IPC_COMMAND_PROVEN';
  return 'PROOF_DEPTH_BLOCKED_BY_RUNTIME';
}

/**
 * Persist a proof line to the JSONL artifact file.
 */
function persistProofLine(entry) {
  try {
    const line = JSON.stringify({ ...entry, timestamp: new Date().toISOString() });
    fs.appendFileSync(ARTIFACT_FILE, line + '\n', 'utf8');
  } catch (e) {
    // Non-blocking — proof write failure must not break test
    console.warn('[uiDesktopBackendProofDepth] artifact write failed:', e.message);
  }
}

/**
 * Deep tryInvoke: returns structured proof.
 *
 * @param {string} command - IPC command name
 * @param {object} args - command args
 * @param {object} opts
 * @param {boolean} [opts.required=false] - if true, throws when command absent
 * @param {string} [opts.module] - module name for artifact
 * @param {string} [opts.route] - route for artifact
 */
async function probeInvoke(command, args = {}, opts = {}) {
  const { required = false, module: moduleName = 'UNKNOWN', route = '/' } = opts;
  const startMs = Date.now();

  let result = {
    command,
    module: moduleName,
    route,
    attempted: false,
    available: false,
    ok: false,
    responseShape: 'null',
    rawResponse: null,
    errorKind: null,
    errorMsg: null,
    latencyMs: 0,
    proofLevel: 'PROOF_DEPTH_BLOCKED_BY_RUNTIME',
    uiReflected: false,
    safeToPersist: true,
  };

  try {
    const rawResult = await browser.execute(async (cmd, cmdArgs) => {
      const tStart = performance.now();
      try {
        const invoker =
          (window.__TAURI__?.core?.invoke) ||
          (window.__TAURI__?.tauri?.invoke) ||
          (window.__TAURI__?.invoke);
        if (!invoker) {
          return {
            ok: false,
            content: null,
            error: 'NO_TAURI_INVOKE',
            available: false,
            latencyMs: Math.round(performance.now() - tStart),
          };
        }
        const res = await invoker(cmd, cmdArgs);
        return {
          ok: true,
          content: res,
          error: null,
          available: true,
          latencyMs: Math.round(performance.now() - tStart),
        };
      } catch (e) {
        return {
          ok: false,
          content: null,
          error: String(e),
          available: true,
          latencyMs: Math.round(performance.now() - tStart),
        };
      }
    }, command, args);

    result.attempted = true;
    result.available = rawResult?.available ?? false;
    result.ok = rawResult?.ok ?? false;
    result.latencyMs = rawResult?.latencyMs ?? (Date.now() - startMs);
    result.errorKind = classifyError(rawResult?.error);
    result.errorMsg = rawResult?.error ? redactSecrets(String(rawResult.error).slice(0, 200)) : null;
    result.responseShape = rawResult?.ok ? describeShape(rawResult.content) : 'null';
    result.rawResponse = null; // never persist raw response
    result.proofLevel = classifyProofLevel(result);

  } catch (outerErr) {
    result.attempted = true;
    result.errorKind = 'WDIO_EXECUTE_ERROR';
    result.errorMsg = String(outerErr).slice(0, 200);
    result.latencyMs = Date.now() - startMs;
    result.proofLevel = 'PROOF_DEPTH_BLOCKED_BY_RUNTIME';
  }

  persistProofLine(result);

  if (required && result.errorKind === 'NO_TAURI_INVOKE') {
    throw new Error(`[REQUIRED_LIVE] command="${command}" — IPC not available (BLOCKED_BY_RUNTIME)`);
  }
  if (required && result.errorKind === 'COMMAND_NOT_FOUND') {
    throw new Error(`[REQUIRED_LIVE] command="${command}" — command not found (BLOCKED_BY_MISSING_COMMAND)`);
  }

  return result;
}

/**
 * Classify proof depth for a guarded module (action present but not executed).
 */
function probeGuarded(moduleName, route, reason) {
  const entry = {
    command: null,
    module: moduleName,
    route,
    attempted: false,
    available: null,
    ok: null,
    responseShape: null,
    rawResponse: null,
    errorKind: null,
    errorMsg: null,
    latencyMs: 0,
    proofLevel: 'PROOF_DEPTH_GUARDED_ONLY',
    uiReflected: false,
    safeToPersist: true,
    note: reason,
  };
  persistProofLine(entry);
  return entry;
}

/**
 * Classify proof depth for a degraded/display-only module.
 */
function probeDegraded(moduleName, route, reason) {
  const entry = {
    command: null,
    module: moduleName,
    route,
    attempted: false,
    available: null,
    ok: null,
    responseShape: null,
    rawResponse: null,
    errorKind: null,
    errorMsg: null,
    latencyMs: 0,
    proofLevel: 'PROOF_DEPTH_DEGRADED_VISIBLE',
    uiReflected: false,
    safeToPersist: true,
    note: reason,
  };
  persistProofLine(entry);
  return entry;
}

/**
 * Classify proof depth for a display-only confirmed module.
 */
function probeDisplayOnly(moduleName, route, reason) {
  const entry = {
    command: null,
    module: moduleName,
    route,
    attempted: false,
    available: null,
    ok: null,
    responseShape: null,
    rawResponse: null,
    errorKind: null,
    errorMsg: null,
    latencyMs: 0,
    proofLevel: 'PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED',
    uiReflected: false,
    safeToPersist: true,
    note: reason,
  };
  persistProofLine(entry);
  return entry;
}

/**
 * Check if Tauri IPC bridge is available.
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
 * Check for ErrorBoundary.
 */
async function checkErrorBoundary() {
  try {
    const hasErrorH2 = await browser.execute(() => {
      const h2s = Array.from(document.querySelectorAll('h2'));
      return h2s.some(h => h.textContent != null && h.textContent.includes('Erreur dans'));
    });
    const hasErrorTestid = await browser.execute(() =>
      !!document.querySelector('[data-testid="titane-error-boundary"]')
    );
    return hasErrorH2 || hasErrorTestid;
  } catch {
    return false;
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
    html.includes('simulation') || html.includes('simulé') ||
    html.includes('⚠') || html.includes('blocked') ||
    html.includes('indisponible') || html.includes('hors ligne')
  );
}

/**
 * Get artifact path for reference.
 */
function getArtifactPath() {
  return ARTIFACT_FILE;
}

module.exports = {
  probeInvoke,
  probeGuarded,
  probeDegraded,
  probeDisplayOnly,
  isTauriAvailable,
  getBodyHTML,
  checkErrorBoundary,
  hasDegradedIndicator,
  getArtifactPath,
  navigateAndWait,
  isVisible,
  getText,
  getAttribute,
  safeClick,
  logClassification,
};
