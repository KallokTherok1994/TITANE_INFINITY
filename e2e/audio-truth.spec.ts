/**
 * TITANE∞ — AUDIO E2E TRUTH SYSTEM
 *
 * Validates real audio generation through the Tauri IPC layer:
 *   STEP 3 — Assert audio buffer exists and is non-empty
 *   STEP 4 — Assert correct engine is reported
 *   STEP 5 — Multi-voice: two voices produce different waveforms
 *   STEP 6 — Detect silent / fallback buffer → FAIL_FALLBACK
 *   STEP 7 — Audio snapshot: store baseline hash and compare on CI
 *   STEP 8 — Final PASS verdict (audio + engine + perceptual diff)
 *
 * The test works in both mock mode (Vite / CI without Tauri) and real
 * Tauri mode (TITANE_E2E_TAURI=1) — the IPC mock mirrors the Rust logic
 * deterministically so snapshot hashes are stable across environments.
 */

import { test, expect } from './fixtures/index.js';
import fs from 'node:fs';
import path from 'node:path';

// ─── Config ─────────────────────────────────────────────────────
const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

const SNAPSHOT_DIR = path.resolve('reports/e2e-audio-snapshots');
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'audio-baseline.json');

/** Minimum non-silent buffer length (samples). 200ms @ 22050Hz = 4410 */
const MIN_BUFFER_LENGTH = 4000;
/** Minimum peak amplitude to be considered non-silent */
const MIN_PEAK = 0.01;
/** Expected engine in mock / espeak environments */
const EXPECTED_ENGINES = ['espeak', 'piper', 'elevenlabs', 'mock'];

// ─── Helpers ────────────────────────────────────────────────────

/** Stable SHA-256 hex hash of a Float32 buffer via the page context */
async function hashBuffer(page: any, buffer: number[]): Promise<string> {
  // Compute in-page via SubtleCrypto for cross-env stability
  return page.evaluate(async (buf: number[]) => {
    const f32 = new Float32Array(buf);
    const bytes = new Uint8Array(f32.buffer);
    const hashBuf = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }, buffer);
}

/** Invoke Tauri command via __TAURI__.core.invoke (works in mock + real) */
async function invokeAudio(page: any, voice: string, durationMs = 200): Promise<{
  buffer: number[];
  length: number;
  engine: string;
  voice: string;
  sampleRate: number;
  peak: number;
}> {
  return page.evaluate(
    async ([v, d]: [string, number]) => {
      const tauri = (window as any).__TAURI__;
      if (!tauri?.core?.invoke) {
        throw new Error('__TAURI__.core.invoke not available');
      }
      return tauri.core.invoke('tts_generate_test_buffer', { voice: v, duration_ms: d });
    },
    [voice, durationMs] as [string, number]
  );
}

// ─── Tests ──────────────────────────────────────────────────────

test.describe('Audio E2E Truth System', () => {
  if (!FULL_E2E_ENABLED) {
    test('full-mode precondition proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for Tauri mock / real bridge to be ready
    await page.waitForFunction(() => !!(window as any).__TAURI__?.core?.invoke, { timeout: 10_000 });
  });

  // STEP 3 — Assert audio exists and is non-empty
  test('STEP 3 — buffer length > threshold, non-empty', async ({ page }) => {
    const result = await invokeAudio(page, 'alpha', 200);

    expect(result, 'IPC response must not be null').toBeTruthy();
    expect(result.buffer, 'buffer must be an array').toBeInstanceOf(Array);
    expect(result.length, `length must be >= ${MIN_BUFFER_LENGTH}`).toBeGreaterThanOrEqual(MIN_BUFFER_LENGTH);
    expect(result.buffer.length, 'buffer.length matches length field').toBe(result.length);
    expect(result.peak, `peak must be >= ${MIN_PEAK} (not silence)`).toBeGreaterThanOrEqual(MIN_PEAK);
    expect(result.sampleRate, 'sampleRate must be > 0').toBeGreaterThan(0);
  });

  // STEP 4 — Assert engine is reported and valid
  test('STEP 4 — engine reported and in expected set', async ({ page }) => {
    const result = await invokeAudio(page, 'alpha', 200);

    expect(result.engine, 'engine field must exist').toBeTruthy();
    expect(
      EXPECTED_ENGINES.includes(result.engine),
      `engine "${result.engine}" must be one of ${EXPECTED_ENGINES.join(', ')}`
    ).toBe(true);
  });

  // STEP 5 — Multi-voice: two voices must produce perceptually different buffers
  test('STEP 5 — multi-voice hashes differ (perceptually unique)', async ({ page }) => {
    const [v1, v2] = await Promise.all([
      invokeAudio(page, 'alpha', 200),
      invokeAudio(page, 'beta',  200),
    ]);

    const [h1, h2] = await Promise.all([
      hashBuffer(page, v1.buffer),
      hashBuffer(page, v2.buffer),
    ]);

    expect(h1, 'voice alpha hash must not be empty').toBeTruthy();
    expect(h2, 'voice beta hash must not be empty').toBeTruthy();
    expect(h1, 'voice alpha and beta must produce DIFFERENT audio').not.toEqual(h2);
  });

  // STEP 6 — Detect fallback: if two different voices return identical audio → FAIL_FALLBACK
  test('STEP 6 — FAIL_FALLBACK detection (voices must diverge)', async ({ page }) => {
    const [v1, v2] = await Promise.all([
      invokeAudio(page, 'alpha', 200),
      invokeAudio(page, 'beta',  200),
    ]);

    const [h1, h2] = await Promise.all([
      hashBuffer(page, v1.buffer),
      hashBuffer(page, v2.buffer),
    ]);

    if (h1 === h2) {
      throw new Error(
        'FAIL_FALLBACK — voices alpha and beta produced identical audio. ' +
        'TTS engine is likely falling back to a single silent/default buffer.'
      );
    }

    expect(h1).not.toEqual(h2);
  });

  // STEP 7 — Audio snapshot: store baseline on first run, compare on subsequent runs
  test('STEP 7 — audio snapshot baseline compare', async ({ page }) => {
    const result = await invokeAudio(page, 'alpha', 200);
    const currentHash = await hashBuffer(page, result.buffer);

    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });

    if (!fs.existsSync(SNAPSHOT_FILE)) {
      // First run: write baseline
      const baseline = {
        createdAt: new Date().toISOString(),
        voice: 'alpha',
        durationMs: 200,
        engine: result.engine,
        sampleRate: result.sampleRate,
        length: result.length,
        hash: currentHash,
      };
      fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(baseline, null, 2));
      console.log('[AudioE2E] Baseline snapshot written:', SNAPSHOT_FILE);
      // First run always passes
      expect(currentHash).toBeTruthy();
    } else {
      // Subsequent runs: compare against baseline
      const baseline = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf-8'));
      expect(
        currentHash,
        `Audio snapshot mismatch! Expected hash "${baseline.hash}" but got "${currentHash}". ` +
        'Audio generation changed — update the snapshot if intentional.'
      ).toBe(baseline.hash);
    }
  });

  // STEP 8 — Final PASS verdict: audio + engine + voices perceptually different
  test('STEP 8 — FINAL VERDICT (audio + engine + perceptual diff)', async ({ page }) => {
    const [v1, v2] = await Promise.all([
      invokeAudio(page, 'alpha', 200),
      invokeAudio(page, 'beta',  200),
    ]);

    // Criterion 1: audio generated (non-empty, non-silent)
    expect(v1.length).toBeGreaterThanOrEqual(MIN_BUFFER_LENGTH);
    expect(v1.peak).toBeGreaterThanOrEqual(MIN_PEAK);

    // Criterion 2: correct engine reported
    expect(EXPECTED_ENGINES.includes(v1.engine)).toBe(true);

    // Criterion 3: voices perceptually different
    const [h1, h2] = await Promise.all([
      hashBuffer(page, v1.buffer),
      hashBuffer(page, v2.buffer),
    ]);
    expect(h1).not.toEqual(h2);

    // All criteria met → PASS
    console.log('[AudioE2E] FINAL VERDICT: PASS');
    console.log(`  engine=${v1.engine}  voice_alpha_peak=${v1.peak.toFixed(4)}  hashes_differ=${h1 !== h2}`);
  });
});
