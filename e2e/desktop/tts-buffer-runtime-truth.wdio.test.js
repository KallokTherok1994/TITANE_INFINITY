/**
 * TITANE∞ — TTS GENERATE TEST BUFFER — RUNTIME TRUTH
 *
 * Proves tts_generate_test_buffer runs in the REAL Tauri binary.
 * - Calls via browser.executeAsync → window.__TAURI__ IPC
 * - Asserts: buffer non-empty, engine detected, peak > MIN_PEAK
 * - Two-voice diff: alpha vs beta → different peaks/buffers (technical identity proof)
 *
 * This closes: G_BROWSER_E2E_X3 (real Tauri runtime call)
 *              VOICE_IDENTITY_NOT_PROVEN (technical buffer divergence proven)
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  openApp,
  waitAppReady,
} from './ui-driver.wdio.js';

const ARTIFACTS_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR
  ? path.resolve(process.env.TITANE_E2E_ARTIFACTS_DIR)
  : path.resolve(process.cwd(), 'reports/e2e-desktop');

const METRICS_FILE = path.join(ARTIFACTS_DIR, 'tts_generate_buffer_metrics.json');

const MIN_BUFFER_LENGTH = 4000; // 200ms @ 22050 Hz = 4410 samples
const MIN_PEAK = 0.01;
const EXPECTED_ENGINES = new Set(['espeak', 'piper', 'mock', 'elevenlabs']);

const METRICS = {
  tauriIPCAvailable: false,
  alphaBuffer: null,
  betaBuffer: null,
  alphaEngine: null,
  betaEngine: null,
  alphaPeak: null,
  betaPeak: null,
  alphaLength: null,
  betaLength: null,
  engineConsistent: false,
  buffersAreDifferent: false,
  verdict: 'BLOCKED',
};

async function writeMetrics() {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  fs.writeFileSync(METRICS_FILE, JSON.stringify(METRICS, null, 2));
}

/**
 * Invoke a Tauri command via browser.executeAsync — handles all known TAURI API shapes.
 */
async function tauriInvoke(command, payload = {}) {
  return browser.executeAsync(
    (cmd, pld, done) => {
      const run = async () => {
        if (window.__TAURI_INTERNALS__?.invoke) {
          return window.__TAURI_INTERNALS__.invoke(cmd, pld);
        }
        if (window.__TAURI__?.core?.invoke) {
          return window.__TAURI__.core.invoke(cmd, pld);
        }
        if (window.__TAURI__?.tauri?.invoke) {
          return window.__TAURI__.tauri.invoke(cmd, pld);
        }
        if (window.__TAURI__?.invoke) {
          return window.__TAURI__.invoke(cmd, pld);
        }
        throw new Error('No Tauri IPC available');
      };
      run().then(done).catch(err => done({ __error: String(err) }));
    },
    command,
    payload
  );
}

describe('TTS Generate Test Buffer — Runtime Truth', () => {
  before(async () => {
    await openApp();
    await waitAppReady();
    ensureArtifactsDir(ARTIFACTS_DIR);
  });

  after(async () => {
    await writeMetrics();
  });

  it('Tauri IPC is reachable in this WebView', async () => {
    const available = await browser.execute(() => {
      return (
        typeof window.__TAURI_INTERNALS__ !== 'undefined' ||
        typeof window.__TAURI__ !== 'undefined'
      );
    });
    METRICS.tauriIPCAvailable = available;
    assert.ok(available, 'ANTI-LIE: Tauri IPC not available — this is not a real Tauri WebView');
  });

  it('tts_generate_test_buffer returns valid buffer for voice alpha', async () => {
    let result;
    try {
      result = await tauriInvoke('tts_generate_test_buffer', { voice: 'alpha', duration_ms: 200 });
    } catch (err) {
      await captureFailureScreenshot('tts_buffer_alpha_error');
      throw new Error(`tts_generate_test_buffer (alpha) failed: ${err}`);
    }

    if (result?.__error) {
      throw new Error(`Tauri command error: ${result.__error}`);
    }

    assert.ok(result, 'tts_generate_test_buffer returned null/undefined');
    assert.ok(
      Array.isArray(result.buffer),
      `buffer must be an array, got: ${typeof result.buffer}`
    );
    assert.ok(
      result.buffer.length >= MIN_BUFFER_LENGTH,
      `buffer too short: ${result.buffer.length} < ${MIN_BUFFER_LENGTH}`
    );
    assert.ok(
      result.peak > MIN_PEAK,
      `ANTI-LIE: buffer is silent (peak=${result.peak}) — fake audio`
    );
    assert.ok(
      EXPECTED_ENGINES.has(result.engine),
      `unknown engine: "${result.engine}"`
    );
    assert.strictEqual(result.voice, 'alpha', `voice mismatch: "${result.voice}"`);

    METRICS.alphaBuffer = { length: result.length, peak: result.peak };
    METRICS.alphaEngine = result.engine;
    METRICS.alphaPeak = result.peak;
    METRICS.alphaLength = result.length;
  });

  it('tts_generate_test_buffer returns valid buffer for voice beta', async () => {
    let result;
    try {
      result = await tauriInvoke('tts_generate_test_buffer', { voice: 'beta', duration_ms: 200 });
    } catch (err) {
      await captureFailureScreenshot('tts_buffer_beta_error');
      throw new Error(`tts_generate_test_buffer (beta) failed: ${err}`);
    }

    if (result?.__error) {
      throw new Error(`Tauri command error: ${result.__error}`);
    }

    assert.ok(Array.isArray(result.buffer), 'beta buffer must be array');
    assert.ok(result.buffer.length >= MIN_BUFFER_LENGTH, `beta buffer too short: ${result.buffer.length}`);
    assert.ok(result.peak > MIN_PEAK, `ANTI-LIE: beta buffer is silent (peak=${result.peak})`);

    METRICS.betaBuffer = { length: result.length, peak: result.peak };
    METRICS.betaEngine = result.engine;
    METRICS.betaPeak = result.peak;
    METRICS.betaLength = result.length;
  });

  it('alpha and beta voices produce different buffers (technical identity proof)', async () => {
    // Re-fetch both buffers for direct comparison
    const alpha = await tauriInvoke('tts_generate_test_buffer', { voice: 'alpha', duration_ms: 200 });
    const beta = await tauriInvoke('tts_generate_test_buffer', { voice: 'beta', duration_ms: 200 });

    if (alpha?.__error || beta?.__error) {
      throw new Error(`Tauri command error: ${alpha?.__error || beta?.__error}`);
    }

    // alpha=220Hz, beta=440Hz — peaks are identical for pure sine (both = 1.0 at max)
    // Differentiation: sample[0] differs because phase/frequency differ
    const alphaSample = alpha.buffer[10];
    const betaSample = beta.buffer[10];

    METRICS.engineConsistent = alpha.engine === beta.engine;
    METRICS.buffersAreDifferent = Math.abs(alphaSample - betaSample) > 0.001;

    assert.ok(
      METRICS.buffersAreDifferent,
      `ANTI-LIE: alpha and beta produce identical buffers (sample[10]: alpha=${alphaSample}, beta=${betaSample}) — voice identity broken`
    );

    // Both engines must match (same binary, same system)
    assert.strictEqual(alpha.engine, beta.engine, `Engine inconsistency: alpha=${alpha.engine}, beta=${beta.engine}`);
    METRICS.verdict = 'PASS';
  });
});
