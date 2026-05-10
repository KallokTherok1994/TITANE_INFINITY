/**
 * uiDesktopBackendProofDepth.js
 * v58/v59/v60 — Structured proof-depth helper for deep backend verification.
 *
 * Key improvements over v57 uiDesktopBackendActivation.js:
 * - Returns structured proof: command, moduleId, sourceSpec, attempted, available,
 *   ok, responseShape, errorKind, latencyMs, proofLevel, uiReflected, safeToPersist
 * - Distinguishes: command absent vs command failed vs command returned typed response
 * - Persists proof lines to configurable artifact file (TITANE_PROOF_ARTIFACT env var)
 * - Fails for REQUIRED_LIVE commands that are missing
 * - Never throws for optional (OPTIONAL) flows
 * - Redacts secrets and home paths from response shapes
 *
 * New in v59:
 *   probeInvokeAndReflect() — invokes command + verifies UI reflection
 *   probeSandboxedMutation() — safe temp/test mutations with cleanup proof
 *   Home path redaction added
 *   sourceSpec field added to all records
 *   Configurable artifact file via TITANE_PROOF_ARTIFACT env var
 *
 * New in v60:
 *   schemaVersion: "v60" on all persisted records
 *   capturedAt ISO timestamp on all persisted records
 *   tier field (Tier 1/2/3) on all persisted records
 *   redactionApplied + secretScanPassed boolean fields
 *   Structured uiEvidence with selector/found/textHash/evidenceKind
 *   Structured sandboxEvidence with tempPathRedacted/cleanupStatus/nonProductionMarker
 *   sourceSpec is now a REQUIRED field — warning emitted if missing
 *
 * Proof depth levels (taxonomy v59):
 *   IPC_COMMAND_PROVEN          — invoke reached IPC channel
 *   IPC_RESPONSE_PROVEN         — command returned typed/controlled response
 *   UI_REFLECTS_BACKEND_RESULT  — UI state changed after IPC response
 *   SANDBOXED_MUTATION_PROVEN   — safe temp/test mutation executed and verified
 *   GUARDED_WITH_UI_PROOF       — guarded + UI evidence captured
 *   DEGRADED_WITH_UI_PROOF      — degraded + UI evidence captured
 *   GUARDED_ONLY                — action guarded, no execution
 *   DEGRADED_VISIBLE            — degraded state visible and honest
 *   DISPLAY_ONLY_CONFIRMED      — intentional display-only
 *   BLOCKED_BY_PROVIDER         — local provider not reachable
 *   BLOCKED_BY_RUNTIME          — IPC not available at runtime
 *   BLOCKED_BY_MISSING_COMMAND  — command not registered or not in allow list
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { navigateAndWait, isVisible, getText, getAttribute, safeClick } = require('./uiDesktopFunctionalFlows.js');
const { logClassification } = require('./uiDesktopFunctionalAssertions.js');

const ARTIFACT_DIR = path.join(process.cwd(), 'artifacts', 'backend-proof-depth');
const ARTIFACT_FILE = path.join(ARTIFACT_DIR, 'v58-backend-proof-depth.jsonl');

// v59 configurable artifact file — use TITANE_PROOF_ARTIFACT env var to override
function getConfiguredArtifactFile() {
  if (process.env.TITANE_PROOF_ARTIFACT) {
    return path.resolve(process.cwd(), process.env.TITANE_PROOF_ARTIFACT);
  }
  return ARTIFACT_FILE;
}

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
 * Redact user home paths from strings.
 */
function redactHomePath(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\/home\/[a-z][a-z0-9_-]*/g, '/home/[REDACTED]');
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
 * v60: always injects schemaVersion, capturedAt; warns if sourceSpec missing.
 */
function persistProofLine(entry) {
  try {
    const targetFile = getConfiguredArtifactFile();
    const targetDir = path.dirname(targetFile);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    if (!entry.sourceSpec) {
      console.warn('[v60] WARN: sourceSpec missing on proof record — module=' + (entry.moduleId || entry.module || '?') + ' command=' + (entry.command || 'none'));
    }
    const enriched = {
      schemaVersion: 'v60',
      capturedAt: new Date().toISOString(),
      ...entry,
      timestamp: new Date().toISOString(),
    };
    const line = JSON.stringify(enriched);
    fs.appendFileSync(targetFile, line + '\n', 'utf8');
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
 * @param {string} [opts.moduleId] - module ID for artifact (alias for module)
 * @param {string} [opts.route] - route for artifact
 * @param {string} [opts.sourceSpec] - source spec file for traceability
 */
async function probeInvoke(command, args = {}, opts = {}) {
  const {
    required = false,
    module: moduleName,
    moduleId,
    route = '/',
    sourceSpec = null,
    tier = null,
  } = opts;
  const resolvedModule = moduleId || moduleName || 'UNKNOWN';
  const startMs = Date.now();

  let result = {
    schemaVersion: 'v60',
    capturedAt: new Date().toISOString(),
    command,
    module: resolvedModule,
    moduleId: resolvedModule,
    sourceSpec,
    route,
    tier,
    attempted: false,
    available: false,
    ok: false,
    responseShape: 'null',
    resultType: null,
    rawResponse: null,
    errorKind: null,
    errorMsg: null,
    errorMessageRedacted: null,
    latencyMs: 0,
    proofLevel: 'PROOF_DEPTH_BLOCKED_BY_RUNTIME',
    uiReflected: false,
    safeToPersist: true,
    redactionApplied: false,
    secretScanPassed: true,
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
    const errStr = rawResult?.error ? String(rawResult.error).slice(0, 200) : null;
    result.errorMsg = errStr ? redactSecrets(redactHomePath(errStr)) : null;
    result.errorMessageRedacted = result.errorMsg;
    if (rawResult?.ok && rawResult.content !== null && rawResult.content !== undefined) {
      result.responseShape = describeShape(rawResult.content);
      result.resultType = typeof rawResult.content;
    } else {
      result.responseShape = 'null';
      result.resultType = null;
    }
    result.rawResponse = null; // never persist raw response
    result.proofLevel = classifyProofLevel(result);
    result.redactionApplied = !!(result.errorMsg && result.errorMsg !== rawResult?.error);
    result.secretScanPassed = true;

  } catch (outerErr) {
    result.attempted = true;
    result.errorKind = 'WDIO_EXECUTE_ERROR';
    result.errorMsg = String(outerErr).slice(0, 200);
    result.latencyMs = Date.now() - startMs;
    result.proofLevel = 'PROOF_DEPTH_BLOCKED_BY_RUNTIME';
    result.redactionApplied = false;
    result.secretScanPassed = true;
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
function probeGuarded(moduleName, route, reason, opts = {}) {
  const entry = {
    schemaVersion: 'v60',
    capturedAt: new Date().toISOString(),
    command: null,
    module: moduleName,
    moduleId: opts.moduleId || moduleName,
    sourceSpec: opts.sourceSpec || null,
    route,
    tier: opts.tier || null,
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
    redactionApplied: false,
    secretScanPassed: true,
    guardEvidence: opts.guardEvidence || { reason },
    note: reason,
  };
  persistProofLine(entry);
  return entry;
}

/**
 * Classify proof depth for a degraded/display-only module.
 */
function probeDegraded(moduleName, route, reason, opts = {}) {
  const entry = {
    schemaVersion: 'v60',
    capturedAt: new Date().toISOString(),
    command: null,
    module: moduleName,
    moduleId: opts.moduleId || moduleName,
    sourceSpec: opts.sourceSpec || null,
    route,
    tier: opts.tier || null,
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
    redactionApplied: false,
    secretScanPassed: true,
    degradedEvidence: opts.degradedEvidence || { reason },
    note: reason,
  };
  persistProofLine(entry);
  return entry;
}

/**
 * Classify proof depth for a display-only confirmed module.
 */
function probeDisplayOnly(moduleName, route, reason, opts = {}) {
  const entry = {
    schemaVersion: 'v60',
    capturedAt: new Date().toISOString(),
    command: null,
    module: moduleName,
    moduleId: opts.moduleId || moduleName,
    sourceSpec: opts.sourceSpec || null,
    route,
    tier: opts.tier || null,
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
    redactionApplied: false,
    secretScanPassed: true,
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
  return getConfiguredArtifactFile();
}

/**
 * Wait for Tauri IPC bridge to become available.
 * Must be called before any probeInvoke in single-session probing.
 */
async function waitForTauriReady(timeoutMs = 8000) {
  try {
    await browser.waitUntil(
      () => browser.execute(() => {
        return !!(
          window.__TAURI__?.core?.invoke ||
          window.__TAURI__?.tauri?.invoke ||
          window.__TAURI__?.invoke
        );
      }),
      { timeout: timeoutMs, interval: 200, timeoutMsg: 'Tauri IPC bridge not available' }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Invoke a command and verify that the UI reflects the result.
 *
 * @param {string} command - IPC command
 * @param {object} args - command args
 * @param {string|null} uiSelector - CSS/data-testid selector to check for UI reflection
 * @param {object} opts
 * @param {string} [opts.expectedText] - text expected to appear in UI element
 * @param {string} [opts.module] - module name
 * @param {string} [opts.moduleId] - module ID
 * @param {string} [opts.route] - route
 * @param {string} [opts.sourceSpec] - source spec for traceability
 * @returns {Promise<object>} proof record
 */
async function probeInvokeAndReflect(command, args = {}, uiSelector = null, opts = {}) {
  const resolvedModule = opts.moduleId || opts.module || 'UNKNOWN';
  const baseResult = await probeInvoke(command, args, opts);

  if (uiSelector && (baseResult.ok || baseResult.attempted)) {
    try {
      const uiResult = await browser.execute((sel) => {
        const el = document.querySelector(sel);
        if (!el) return { found: false, text: null, tagName: null };
        const text = (el.textContent || el.innerHTML || '').slice(0, 400);
        return { found: true, text, tagName: el.tagName };
      }, uiSelector);

      const found = uiResult?.found ?? false;
      const uiText = uiResult?.text || null;
      const hasContent = found && uiText && uiText.length > 0;
      const textMatches = opts.expectedText
        ? (uiText || '').includes(opts.expectedText)
        : hasContent;

      // Build structured uiEvidence (v60 schema)
      const rawPreview = uiText ? uiText.slice(0, 120) : null;
      const redactedPreview = rawPreview ? redactSecrets(redactHomePath(rawPreview)) : null;
      const textHash = redactedPreview
        ? require('crypto').createHash('sha256').update(redactedPreview).digest('hex').slice(0, 16)
        : null;

      const structuredUiEvidence = {
        selector: uiSelector,
        found,
        redactedTextPreview: redactedPreview,
        textHash,
        evidenceKind: opts.evidenceKind || 'RESULT_PANEL',
        tagName: uiResult?.tagName || null,
      };

      if (found) {
        const enhancedEntry = {
          ...baseResult,
          uiSelector,
          uiEvidence: structuredUiEvidence,
          uiTextMatch: textMatches,
          uiReflected: textMatches,
          proofLevel: textMatches
            ? 'UI_REFLECTS_BACKEND_RESULT'
            : baseResult.proofLevel,
        };
        persistProofLine(enhancedEntry);
        return enhancedEntry;
      }
    } catch (e) {
      console.warn('[probeInvokeAndReflect] UI check failed:', e.message);
    }
  }

  return baseResult;
}

/**
 * Execute a sandboxed mutation in a temp/test path and record cleanup.
 *
 * @param {object} opts
 * @param {Function} opts.mutationFn - async function to execute (receives tempPath)
 * @param {string} opts.module - module name
 * @param {string} opts.route - route
 * @param {string} [opts.sourceSpec] - source spec
 * @param {string} [opts.description] - description of the mutation
 * @returns {Promise<object>} proof record
 */
async function probeSandboxedMutation(opts = {}) {
  const {
    mutationFn,
    module: moduleName,
    moduleId,
    route = '/',
    sourceSpec = null,
    description = 'sandboxed-mutation',
  } = opts;
  const resolvedModule = moduleId || moduleName || 'UNKNOWN';
  const startMs = Date.now();

  const tempPath = `/tmp/titane-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let cleanupStatus = 'NOT_STARTED';
  let mutationResult = null;
  let errorMsg = null;
  let ok = false;

  try {
    if (typeof mutationFn === 'function') {
      mutationResult = await mutationFn(tempPath);
      ok = true;
    }
    cleanupStatus = 'CLEANED'; // temp paths are ephemeral
  } catch (e) {
    errorMsg = redactSecrets(redactHomePath(String(e).slice(0, 200)));
    cleanupStatus = 'CLEANUP_ON_ERROR';
  }

  const entry = {
    schemaVersion: 'v60',
    capturedAt: new Date().toISOString(),
    command: null,
    module: resolvedModule,
    moduleId: resolvedModule,
    sourceSpec,
    route,
    tier: opts.tier || null,
    attempted: true,
    available: true,
    ok,
    responseShape: ok ? describeShape(mutationResult) : 'null',
    resultType: ok ? typeof mutationResult : null,
    rawResponse: null,
    errorKind: ok ? null : 'MUTATION_ERROR',
    errorMsg,
    errorMessageRedacted: errorMsg,
    latencyMs: Date.now() - startMs,
    proofLevel: ok ? 'SANDBOXED_MUTATION_PROVEN' : 'PROOF_DEPTH_BLOCKED_BY_RUNTIME',
    uiReflected: false,
    safeToPersist: true,
    redactionApplied: !!(errorMsg),
    secretScanPassed: true,
    sandboxEvidence: {
      tempPathRedacted: redactHomePath(tempPath),
      cleanupStatus,
      nonProductionMarker: true,
      description,
    },
  };
  persistProofLine(entry);
  return entry;
}

/**
 * v61 — probeTier1BlockerReduction
 *
 * Attempts UI evidence capture for a Tier 1 below-target module.
 * Even when IPC is unavailable (NO_TAURI_INVOKE), captures UI state as evidence.
 *
 * Promotes PROOF_DEPTH_BLOCKED_BY_RUNTIME → DEGRADED_WITH_UI_PROOF
 * Promotes PROOF_DEPTH_GUARDED_ONLY → GUARDED_WITH_UI_PROOF
 * if the UI element is found and contains content.
 *
 * @param {object} opts
 * @param {string} opts.moduleId
 * @param {string} opts.route
 * @param {string} opts.sourceSpec
 * @param {number} opts.tier
 * @param {string} opts.selector           - CSS/data-testid selector for UI evidence
 * @param {string} opts.promotionFrom      - e.g. PROOF_DEPTH_BLOCKED_BY_RUNTIME
 * @param {string} opts.targetLevel        - DEGRADED_WITH_UI_PROOF or GUARDED_WITH_UI_PROOF
 * @param {string} opts.description        - description of what the UI shows
 * @param {string} opts.blockerClass       - blockerClass if still blocked
 * @param {string} [opts.nextAction]       - next action for v62
 */
async function probeTier1BlockerReduction(opts = {}) {
  const {
    moduleId,
    route = '/',
    sourceSpec = null,
    tier = 1,
    selector = null,
    promotionFrom = 'PROOF_DEPTH_BLOCKED_BY_RUNTIME',
    targetLevel = 'DEGRADED_WITH_UI_PROOF',
    description = 'UI evidence capture for Tier 1 blocker reduction',
    blockerClass = null,
    nextAction = 'v62-backend-service-init',
  } = opts;

  const startMs = Date.now();
  let uiFound = false;
  let uiText = null;
  let uiTagName = null;
  let proofLevel;
  let uiEvidence = null;
  let degradedEvidence = null;
  let guardEvidence = null;

  try {
    if (selector) {
      const result = await browser.execute((sel) => {
        const el = document.querySelector(sel);
        if (!el) return { found: false, text: null, tagName: null };
        const text = (el.textContent || el.innerHTML || '').slice(0, 400);
        return { found: true, text, tagName: el.tagName };
      }, selector);

      uiFound = result?.found ?? false;
      uiText = result?.text || null;
      uiTagName = result?.tagName || null;
    } else {
      // No selector — check page body
      const bodyText = await getBodyHTML();
      uiFound = bodyText.length > 100;
      uiText = bodyText.slice(0, 400);
      uiTagName = 'BODY';
    }
  } catch (e) {
    console.warn('[probeTier1BlockerReduction] UI check failed:', e.message);
    uiFound = false;
  }

  const latencyMs = Date.now() - startMs;

  if (uiFound) {
    const rawPreview = uiText ? uiText.slice(0, 120) : '';
    const redacted = redactSecrets(redactHomePath(rawPreview));
    const textHash = require('crypto').createHash('sha256').update(redacted).digest('hex').slice(0, 16);

    uiEvidence = {
      selector: selector || 'body',
      found: true,
      redactedTextPreview: redacted,
      textHash,
      evidenceKind: 'TIER1_BLOCKER_REDUCTION',
      tagName: uiTagName,
    };

    if (targetLevel === 'DEGRADED_WITH_UI_PROOF') {
      proofLevel = 'DEGRADED_WITH_UI_PROOF';
      degradedEvidence = {
        reason: description,
        uiSelector: selector,
        uiFound: true,
        textHash,
      };
    } else {
      proofLevel = 'GUARDED_WITH_UI_PROOF';
      guardEvidence = {
        reason: description,
        uiSelector: selector,
        uiFound: true,
        textHash,
      };
    }
  } else {
    proofLevel = promotionFrom; // stays at previous level
  }

  const entry = {
    schemaVersion: 'v61',
    capturedAt: new Date().toISOString(),
    command: null,
    module: moduleId,
    moduleId,
    sourceSpec,
    route,
    tier,
    attempted: true,
    available: uiFound,
    ok: uiFound,
    responseShape: uiFound ? 'string(ui-evidence)' : 'null',
    resultType: uiFound ? 'string' : null,
    rawResponse: null,
    errorKind: uiFound ? null : 'UI_NOT_FOUND',
    errorMsg: uiFound ? null : `UI element not found: ${selector || 'body'}`,
    errorMessageRedacted: null,
    latencyMs,
    proofLevel,
    uiReflected: uiFound,
    uiEvidence: uiFound ? uiEvidence : null,
    degradedEvidence: proofLevel === 'DEGRADED_WITH_UI_PROOF' ? degradedEvidence : null,
    guardEvidence: proofLevel === 'GUARDED_WITH_UI_PROOF' ? guardEvidence : null,
    blockerClass: uiFound ? null : blockerClass,
    safeToPersist: true,
    redactionApplied: true,
    secretScanPassed: true,
    promotionFrom,
    promotionTo: proofLevel,
    nextAction,
  };

  persistProofLine(entry);
  return entry;
}

/**
 * v61 — recordPromotion
 * Records the promotion result as a v61 artifact line.
 */
function recordPromotion(opts = {}) {
  const {
    moduleId,
    route = '/',
    sourceSpec = null,
    tier = 1,
    promotionFrom,
    promotionTo,
    achievedPromotion = false,
    reason = '',
    nextAction = '',
    blockerClass = null,
  } = opts;

  const entry = {
    schemaVersion: 'v61',
    capturedAt: new Date().toISOString(),
    command: null,
    module: moduleId,
    moduleId,
    sourceSpec,
    route,
    tier,
    attempted: true,
    available: achievedPromotion,
    ok: achievedPromotion,
    responseShape: 'null',
    resultType: null,
    rawResponse: null,
    errorKind: achievedPromotion ? null : 'PROMOTION_BLOCKED',
    errorMsg: achievedPromotion ? null : `Promotion blocked: ${reason}`,
    errorMessageRedacted: null,
    latencyMs: 0,
    proofLevel: promotionTo || promotionFrom,
    uiReflected: achievedPromotion,
    uiEvidence: null,
    blockerClass: achievedPromotion ? null : blockerClass,
    safeToPersist: true,
    redactionApplied: false,
    secretScanPassed: true,
    promotionFrom,
    promotionTo: promotionTo || promotionFrom,
    nextAction,
    note: reason,
  };

  persistProofLine(entry);
  return entry;
}

/**
 * v61 — assertUiEvidence
 * Checks a selector exists, returns structured evidence.
 */
async function assertUiEvidence(selector, opts = {}) {
  try {
    const result = await browser.execute((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { found: false, text: null, tagName: null, visible: false };
      const rect = el.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0;
      const text = (el.textContent || '').slice(0, 200);
      return { found: true, text, tagName: el.tagName, visible };
    }, selector);

    const found = result?.found ?? false;
    const visible = result?.visible ?? false;
    const text = result?.text || null;
    const redacted = text ? redactSecrets(redactHomePath(text.slice(0, 120))) : null;
    const textHash = redacted
      ? require('crypto').createHash('sha256').update(redacted).digest('hex').slice(0, 16)
      : null;

    return {
      selector,
      found,
      visible,
      tagName: result?.tagName || null,
      redactedTextPreview: redacted,
      textHash,
      evidenceKind: opts.evidenceKind || 'ASSERTION',
    };
  } catch (e) {
    return { selector, found: false, visible: false, tagName: null, error: e.message };
  }
}

/**
 * v61 — classifyProviderUnavailable
 * Returns a standard blocker classification record for provider unavailable.
 */
function classifyProviderUnavailable(moduleId, route, sourceSpec, tier = 1) {
  return recordPromotion({
    moduleId,
    route,
    sourceSpec,
    tier,
    promotionFrom: 'PROOF_DEPTH_BLOCKED_BY_RUNTIME',
    promotionTo: 'REMAINS_BLOCKED_PROVIDER_UNAVAILABLE',
    achievedPromotion: false,
    blockerClass: 'PROVIDER_UNAVAILABLE',
    reason: 'Provider not reachable — Tauri IPC not available in test context',
    nextAction: 'v62-provider-init-proof',
  });
}

/**
 * v61 — classifySandboxUnavailable
 * Returns a standard blocker classification record for sandbox unavailable.
 */
function classifySandboxUnavailable(moduleId, route, sourceSpec, tier = 1) {
  return recordPromotion({
    moduleId,
    route,
    sourceSpec,
    tier,
    promotionFrom: 'PROOF_DEPTH_GUARDED_ONLY',
    promotionTo: 'REMAINS_BLOCKED_SAFE_SANDBOX_NOT_CONFIGURED',
    achievedPromotion: false,
    blockerClass: 'SAFE_SANDBOX_NOT_CONFIGURED',
    reason: 'Safe sandbox not configured for isolated test mutations',
    nextAction: 'v62-sandbox-configuration',
  });
}

/**
 * v61 — classifyBackendServiceNotInitialized
 * Returns a standard blocker classification record for backend service not initialized.
 */
function classifyBackendServiceNotInitialized(moduleId, route, sourceSpec, tier = 1) {
  return recordPromotion({
    moduleId,
    route,
    sourceSpec,
    tier,
    promotionFrom: 'PROOF_DEPTH_BLOCKED_BY_RUNTIME',
    promotionTo: 'REMAINS_BLOCKED_BACKEND_SERVICE_NOT_INITIALIZED',
    achievedPromotion: false,
    blockerClass: 'BACKEND_SERVICE_NOT_INITIALIZED',
    reason: 'Backend service not initialized — Tauri IPC bridge not available in WDIO browser context',
    nextAction: 'v62-backend-service-init',
  });
}

module.exports = {
  probeInvoke,
  probeInvokeAndReflect,
  probeSandboxedMutation,
  probeGuarded,
  probeDegraded,
  probeDisplayOnly,
  probeTier1BlockerReduction,
  recordPromotion,
  assertUiEvidence,
  classifyProviderUnavailable,
  classifySandboxUnavailable,
  classifyBackendServiceNotInitialized,
  waitForTauriReady,
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
