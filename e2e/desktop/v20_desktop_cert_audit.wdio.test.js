/**
 * V20 CERT AUDIT v3 — DIAGNOSTIC PROGRESSIF (ESM)
 * Stratégie: pas de browser.url() initial, checkpoints à 5/10/16/22s,
 * inspecte __TITANE_BOOT__, styles inline splash, localStorage TITANE_BOOT_ERR.
 */
import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const RUN_ID = process.env.TITANE_V20_RUN_ID || 'run3';
const SCREEN_DIR = process.env.TITANE_V20_SCREEN_DIR || '/tmp/v20_run3_screens';
const ARTIFACTS_DIR = process.env.RUN_ARTIFACTS || '/tmp/v20_run3_artifacts';

fs.mkdirSync(SCREEN_DIR, { recursive: true });
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const metrics = {
  runId: RUN_ID,
  checkpoints: [],
  appReadyReached: false,
  appReadyAtCheckpoint: null,
  bootState: null,
  splashFinalStyle: null,
  localStorageErrors: null,
  frictions: [],
};

/** Capture un screenshot silencieusement */
async function capture(name) {
  try {
    const p = path.join(SCREEN_DIR, `${RUN_ID}_${name}.png`);
    await browser.saveScreenshot(p);
  } catch (_) {
    /* silent */
  }
}

/** Inspecte l'état complet du DOM à l'instant t */
async function inspectDom() {
  return browser.execute(() => {
    const splash = document.querySelector('.loading-splash');
    const root = document.getElementById('root');
    const bootWin = window;

    const boot = bootWin.__TITANE_BOOT__ || {};
    const bootReady = Boolean(bootWin.__TITANE_BOOT_READY__);

    let splashInfo = null;
    if (splash) {
      const cs = window.getComputedStyle(splash);
      splashInfo = {
        exists: true,
        offsetW: splash.offsetWidth,
        offsetH: splash.offsetHeight,
        inlineDisplay: splash.style.display,
        inlineVisibility: splash.style.visibility,
        inlineOpacity: splash.style.opacity,
        computedDisplay: cs.display,
        computedVisibility: cs.visibility,
        ariaHidden: splash.getAttribute('aria-hidden'),
        innerHTML_len: splash.innerHTML.length,
      };
    } else {
      splashInfo = { exists: false };
    }

    const allBtns = document.querySelectorAll('button');
    const visibleBtns = Array.from(allBtns).filter(
      e => e.offsetWidth > 0 || e.offsetHeight > 0
    );
    const allInputs = document.querySelectorAll('input,textarea');
    const visibleInputs = Array.from(allInputs).filter(
      e => e.offsetWidth > 0 || e.offsetHeight > 0
    );
    const allTabs = document.querySelectorAll('[role="tab"]');
    const visibleTabs = Array.from(allTabs).filter(
      e => e.offsetWidth > 0 || e.offsetHeight > 0
    );

    const allCls = new Set();
    document
      .querySelectorAll('*')
      .forEach(el => el.classList.forEach(c => allCls.add(c)));

    let lsErrors = null;
    try {
      const raw =
        window.localStorage.getItem('TITANE_BOOT_ERR') ||
        window.localStorage.getItem('titane_boot_errors');
      if (raw) lsErrors = JSON.parse(raw);
    } catch (_) {
      lsErrors = 'parse_error';
    }

    const rootChildren = root
      ? Array.from(root.children).map(c => ({
          tag: c.tagName,
          cls: c.className.substring(0, 40),
          id: c.id,
        }))
      : [];
    const htmlDataset = Object.fromEntries(
      Object.entries(document.documentElement.dataset)
    );

    return {
      ts: Date.now(),
      url: window.location.href,
      boot: {
        entry_ts: Boolean(boot.entry_ts),
        main_tsx: Boolean(boot.main_tsx),
        ready: bootReady,
        errors: boot.errors || [],
        ts: boot.entry_ts_timestamp || null,
      },
      splash: splashInfo,
      interactive: {
        totalBtns: allBtns.length,
        visibleBtns: visibleBtns.length,
        totalInputs: allInputs.length,
        visibleInputs: visibleInputs.length,
        tabsCount: allTabs.length,
        visibleTabs: visibleTabs.length,
      },
      classesCount: allCls.size,
      rootChildren,
      htmlDataset,
      lsErrors,
    };
  });
}

describe('V20 CERT — Diagnostic Progressif (v3)', () => {
  before(async () => {
    // PAS de browser.url() initial — l'AppImage démarre automatiquement
    // Attendre 5s d'initialisation sans interférer
    await browser.pause(5000);
  });

  after(async () => {
    const outPath = path.join(ARTIFACTS_DIR, `${RUN_ID}_cert_metrics.json`);
    fs.writeFileSync(outPath, JSON.stringify(metrics, null, 2));
    console.log(`\n=== METRICS_JSON_PATH=${outPath} ===`);
    console.log(JSON.stringify(metrics, null, 2));
  });

  it('CP1 — État à +5s (loaderGuardTimer devrait avoir hidé splash)', async () => {
    const state = await inspectDom();
    metrics.checkpoints.push({ cp: 1, elapsed: 5000, ...state });
    await capture('cp1_t5s');

    console.log('\n=== CP1 (+5s) ===');
    console.log('boot:', JSON.stringify(state.boot));
    console.log('splash:', JSON.stringify(state.splash));
    console.log('interactive:', JSON.stringify(state.interactive));
    console.log('classesCount:', state.classesCount);
    console.log('rootChildren:', JSON.stringify(state.rootChildren));
    console.log('lsErrors:', JSON.stringify(state.lsErrors));

    if (!state.boot.entry_ts) {
      metrics.frictions.push('HARNESS_BOOT_ENTRY_NOT_STARTED');
    }
    assert.ok(true, 'CP1 collect only');
  });

  it('CP2 — État à +10s (watchdog entry 8s aurait dû firer)', async () => {
    await browser.pause(5000);
    const state = await inspectDom();
    metrics.checkpoints.push({ cp: 2, elapsed: 10000, ...state });
    await capture('cp2_t10s');

    console.log('\n=== CP2 (+10s) ===');
    console.log('boot:', JSON.stringify(state.boot));
    console.log('splash:', JSON.stringify(state.splash));
    console.log('interactive:', JSON.stringify(state.interactive));
    console.log('classesCount:', state.classesCount);
    console.log('lsErrors:', JSON.stringify(state.lsErrors));
    assert.ok(true, 'CP2 collect only');
  });

  it('CP3 — État à +16s (après recovery éventuel)', async () => {
    await browser.pause(6000);
    const state = await inspectDom();
    metrics.checkpoints.push({ cp: 3, elapsed: 16000, ...state });
    await capture('cp3_t16s');

    console.log('\n=== CP3 (+16s) ===');
    console.log('boot:', JSON.stringify(state.boot));
    console.log('splash:', JSON.stringify(state.splash));
    console.log('interactive:', JSON.stringify(state.interactive));
    console.log('classesCount:', state.classesCount);
    console.log('lsErrors:', JSON.stringify(state.lsErrors));

    const splashV = state.splash?.exists && state.splash.offsetW > 0;
    const noInteractive =
      state.interactive.visibleBtns === 0 && state.interactive.visibleInputs === 0;
    if (splashV && noInteractive) {
      console.log(
        '[CRITICAL] Splash still visible at +16s with no interactive elements!'
      );
      metrics.frictions.push('CRITICAL_SPLASH_PERSISTENT_16s');
    }
    assert.ok(true, 'CP3 collect only');
  });

  it('CP4 — État à +22s (décision finale)', async () => {
    await browser.pause(6000);
    const state = await inspectDom();
    metrics.checkpoints.push({ cp: 4, elapsed: 22000, ...state });
    await capture('cp4_t22s');

    console.log('\n=== CP4 (+22s) ===');
    console.log('boot-FINAL:', JSON.stringify(state.boot));
    console.log('splash-FINAL:', JSON.stringify(state.splash));
    console.log('interactive-FINAL:', JSON.stringify(state.interactive));
    console.log('classesCount:', state.classesCount);
    console.log('lsErrors:', JSON.stringify(state.lsErrors));

    metrics.bootState = state.boot;
    metrics.splashFinalStyle = state.splash;
    metrics.localStorageErrors = state.lsErrors;

    const hasInteractive =
      state.interactive.visibleBtns > 0 ||
      state.interactive.visibleInputs > 0 ||
      state.interactive.visibleTabs > 0;
    const splashHidden = !state.splash?.exists || state.splash.offsetW === 0;

    if (hasInteractive) {
      metrics.appReadyReached = true;
      metrics.appReadyAtCheckpoint = 4;
      console.log('[PASS] App interactive at CP4 (+22s)!');
    } else if (splashHidden) {
      console.log('[INFO] Splash hidden at CP4 but no interactive elements');
      metrics.splashHiddenAtCp4 = true;
    } else {
      console.log('[FAIL] App NOT ready at CP4 (+22s)');
      metrics.frictions.push('FAIL_APP_NOT_READY_22s');
    }

    assert.ok(true, 'CP4 collect only');
  });

  it('CP5 — Analyse inline style splash + __TITANE_BOOT__ complet', async () => {
    const state = await inspectDom();
    await capture('cp5_splash_analysis');

    console.log('\n=== CP5 — SPLASH MECHANISM ===');
    if (state.splash?.exists) {
      console.log('splash.inlineDisplay:', state.splash.inlineDisplay);
      console.log('splash.computedDisplay:', state.splash.computedDisplay);
      console.log('splash.computedVisibility:', state.splash.computedVisibility);
      console.log('splash.inlineOpacity:', state.splash.inlineOpacity);
      console.log('splash.ariaHidden:', state.splash.ariaHidden);
      console.log('splash.offsetW:', state.splash.offsetW, 'H:', state.splash.offsetH);
      console.log('splash.innerHTML_len:', state.splash.innerHTML_len);

      const splashContent = await browser.execute(() => {
        const s = document.querySelector('.loading-splash');
        return s ? s.innerHTML.substring(0, 500) : null;
      });
      console.log('splash.innerHTML[:500]:', splashContent);
      metrics.splashInnerHtmlSample = splashContent;
    }

    const bootFull = await browser.execute(() => {
      try {
        return JSON.stringify(window.__TITANE_BOOT__ || {});
      } catch (_) {
        return '{}';
      }
    });
    console.log('__TITANE_BOOT__ full:', bootFull);
    metrics.bootFull = bootFull;

    const lsBootKeys = await browser.execute(() => {
      const result = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.includes('boot'))
            result[k] = localStorage.getItem(k)?.substring(0, 200);
        }
      } catch (_) {}
      return result;
    });
    console.log('localStorage boot keys:', JSON.stringify(lsBootKeys));
    metrics.lsBootKeys = lsBootKeys;

    assert.ok(true, 'CP5 splash mechanism captured');
  });

  it('S6 — Post-navigation /titane (avec browser.url)', async () => {
    try {
      await browser.url('tauri://localhost#/titane');
      await browser.pause(3000);
    } catch (_) {}
    const state = await inspectDom();
    await capture('s6_post_nav_titane');
    console.log('\n=== S6 — POST-NAV /titane ===');
    console.log('url:', state.url, 'classesCount:', state.classesCount);
    console.log('splash:', JSON.stringify(state.splash));
    console.log('interactive:', JSON.stringify(state.interactive));
    metrics.checkpoints.push({ cp: 'nav_titane', ...state });
    assert.ok(true, 'S6 collect only');
  });

  it('S7 — Summary + verdict friction dominant', async () => {
    const cps = metrics.checkpoints;
    const splashEverHidden = cps.some(
      cp => !cp.splash?.exists || cp.splash.offsetW === 0
    );
    const appEverInteractive = cps.some(
      cp => cp.interactive?.visibleBtns > 0 || cp.interactive?.visibleTabs > 0
    );
    const entryTsEverStarted = cps.some(cp => cp.boot?.entry_ts === true);

    console.log('\n=== SUMMARY ===');
    console.log('splashEverHidden:', splashEverHidden);
    console.log('appEverInteractive:', appEverInteractive);
    console.log('entryTsEverStarted:', entryTsEverStarted);
    console.log('bootFull:', metrics.bootFull);
    console.log('All frictions:', JSON.stringify(metrics.frictions));

    let verdict;
    if (appEverInteractive) {
      verdict = 'APP_INTERACTIVE_DETECTED';
      metrics.appReadyReached = true;
    } else if (splashEverHidden && !appEverInteractive) {
      verdict = 'SPLASH_HIDDEN_BUT_NO_INTERACTIVE — partial init';
    } else if (!entryTsEverStarted) {
      verdict = 'CRITICAL_BOOT_NOT_STARTED — entry.ts never ran';
    } else {
      verdict = 'CRITICAL_SPLASH_PERSISTENT — app stuck in loading state throughout 22s+';
    }

    metrics.verdict = verdict;
    console.log('VERDICT:', verdict);
    assert.ok(true, 'S7 summary complete');
  });
});
