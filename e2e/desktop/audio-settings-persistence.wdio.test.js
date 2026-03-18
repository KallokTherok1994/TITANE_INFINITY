/**
 * TITANE∞ — AUDIO SETTINGS CANONICAL PERSISTENCE TEST
 *
 * Proves audio settings persist across page reload.
 * - Opens Admin > Audio Center > Advanced tab
 * - Reads current toggle-audio-auto-read-assistant state
 * - Flips it
 * - Verifies localStorage immediately reflects the change
 * - Reloads the app (browser.url('tauri://localhost'))
 * - Reopens Admin > Audio Center > Advanced tab
 * - Asserts the flipped value is still set
 * - Restores original value
 *
 * Closes: G_AUDIO_SETTINGS_CANONICAL
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  captureFailureScreenshot,
  clickAllTabs,
  gotoTopNavPage,
  openApp,
  waitAppReady,
} from './ui-driver.wdio.js';
import { uiPages } from './page-objects/uiPages.po.js';

const ARTIFACTS_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR
  ? path.resolve(process.env.TITANE_E2E_ARTIFACTS_DIR)
  : path.resolve(process.cwd(), 'reports/e2e-desktop');

const METRICS_FILE = path.join(ARTIFACTS_DIR, 'audio_settings_persistence_metrics.json');
const STORAGE_KEY = 'titane_audio_config';

const METRICS = {
  audioTabVisible: false,
  initialToggleState: null,
  toggleFlipped: false,
  localStorageUpdatedImmediately: false,
  valueAfterReload: null,
  persistenceProven: false,
  restoredOriginal: false,
  verdict: 'BLOCKED',
};

async function writeMetrics() {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  fs.writeFileSync(METRICS_FILE, JSON.stringify(METRICS, null, 2));
}

async function readAutoReadFromLocalStorage() {
  return browser.execute(key => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const cfg = JSON.parse(raw);
      return cfg?.tts?.autoReadAssistant ?? null;
    } catch {
      return null;
    }
  }, STORAGE_KEY);
}

/**
 * Navigate to Admin > Audio Center > Advanced tab with retry for lazy-load.
 */
async function openAudioCenterAdvanced(maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await gotoTopNavPage(uiPages.admin);
    await clickAllTabs(['[data-testid="tab-admin-audio"]']);

    const audioCenterRoot = await $('[data-testid="page-audio-center"]');
    try {
      await browser.waitUntil(
        async () => {
          const exists = await audioCenterRoot.isExisting();
          if (!exists) return false;
          return audioCenterRoot.isDisplayed();
        },
        { timeout: 15000, interval: 500, timeoutMsg: `Audio Center not visible (attempt ${attempt})` }
      );
    } catch {
      if (attempt === maxAttempts) throw new Error('Audio Center failed to load after retries');
      continue;
    }

    // Navigate to Advanced sub-tab (use JS click to bypass interactability guard)
    const advancedTab = await $('[data-testid="tab-audio-advanced"]');
    if ((await advancedTab.isExisting()) && (await advancedTab.isDisplayed())) {
      await browser.execute(el => { el.scrollIntoView({ block: 'center', behavior: 'instant' }); el.click(); }, advancedTab);
      await browser.pause(600);
    }

    // Wait for toggle to appear
    const toggle = await $('[data-testid="toggle-audio-auto-read-assistant"]');
    try {
      await browser.waitUntil(
        async () => {
          const exists = await toggle.isExisting();
          if (!exists) return false;
          return toggle.isDisplayed();
        },
        { timeout: 8000, interval: 300, timeoutMsg: 'toggle-audio-auto-read-assistant not visible' }
      );
      return toggle;
    } catch {
      if (attempt === maxAttempts) throw new Error('toggle-audio-auto-read-assistant not visible after retries');
    }
  }
  throw new Error('openAudioCenterAdvanced: exhausted attempts');
}

describe('Audio Settings Canonical Persistence', () => {
  before(async () => {
    await openApp();
    await waitAppReady();
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  });

  after(async () => {
    await writeMetrics();
  });

  it('Audio Center advanced tab is reachable with toggle visible', async () => {
    await openAudioCenterAdvanced();
    METRICS.audioTabVisible = true;
  });

  it('Toggle autoReadAssistant and verify localStorage updates immediately', async () => {
    const toggle = await openAudioCenterAdvanced();

    const initialChecked = await toggle.isSelected();
    METRICS.initialToggleState = initialChecked;

    // Flip the toggle (JS click to bypass interactability guard)
    await browser.execute(el => { el.scrollIntoView({ block: 'center', behavior: 'instant' }); el.click(); }, toggle);
    await browser.pause(600); // React state flush + audioService.updateTTSSettings + localStorage write

    METRICS.toggleFlipped = true;

    // Read localStorage immediately
    const storedValue = await readAutoReadFromLocalStorage();
    const expectedValue = !initialChecked;

    METRICS.localStorageUpdatedImmediately = storedValue === expectedValue;

    assert.strictEqual(
      storedValue,
      expectedValue,
      `ANTI-LIE: localStorage not updated after toggle. Expected: ${expectedValue}, got: ${storedValue}`
    );
  });

  it('Settings survive a full app reload (canonical persistence proof)', async () => {
    const expectedValue = await readAutoReadFromLocalStorage();
    if (expectedValue === null) {
      // Read from state: should have been set by prior test
      throw new assert.AssertionError({
        message: 'Cannot read localStorage before reload — prior test may have failed',
      });
    }

    // Full reload
    await browser.url('tauri://localhost');
    await waitAppReady();
    await browser.pause(800); // extra hydration time

    // Reopen audio center
    const toggle = await openAudioCenterAdvanced();

    const valueAfterReload = await toggle.isSelected();
    METRICS.valueAfterReload = valueAfterReload;
    METRICS.persistenceProven = valueAfterReload === expectedValue;

    assert.strictEqual(
      valueAfterReload,
      expectedValue,
      `ANTI-LIE: settings lost after reload. Expected: ${expectedValue}, got: ${valueAfterReload}`
    );
  });

  it('Restore original toggle value (cleanup)', async () => {
    if (METRICS.initialToggleState === null) {
      METRICS.restoredOriginal = true;
      METRICS.verdict = METRICS.persistenceProven ? 'PASS' : 'FAIL';
      return;
    }

    try {
      const toggle = await openAudioCenterAdvanced();
      const currentState = await toggle.isSelected();
      if (currentState !== METRICS.initialToggleState) {
        await browser.execute(el => { el.scrollIntoView({ block: 'center', behavior: 'instant' }); el.click(); }, toggle);
        await browser.pause(400);
      }
      const finalState = await toggle.isSelected();
      METRICS.restoredOriginal = finalState === METRICS.initialToggleState;
    } catch {
      METRICS.restoredOriginal = false;
    }
    METRICS.verdict = METRICS.persistenceProven ? 'PASS' : 'FAIL';
  });
});

