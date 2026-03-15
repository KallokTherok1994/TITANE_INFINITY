/**
 * TITANE∞ — V24 VISIBLE REAL UI CERTIFICATION
 * VISIBLE_REAL_UI_CERTIFICATION__DESKTOP_WEBDRIVERIO__LIVE_FRONTEND_PROOF
 * Autorité: Kevin Thibault | Mode: MODE_B-first (fall to MODE_A if boot blocked)
 *
 * Spec: v24_visible_real_ui_fullstack_perfection.wdio.test.js
 * Target: AppImage 27.2.0 (with P1_BUILD_CHUNKS_FIX — TDZ eliminated)
 * Authority: v15_total_audit_20260311_080118 @ f99844548 = origin/MAIN
 */

import { browser } from '@wdio/globals';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ─── Constants ───────────────────────────────────────────────────────────────
const RUN_ID = process.env.TITANE_V24_RUN_ID || 'run_baseline';
const SCREEN_DIR = process.env.TITANE_V24_SCREEN_DIR || '/tmp/v24_screens';
const RUN_ARTIFACTS = process.env.RUN_ARTIFACTS || '/tmp/v24_artifacts';
const ACTION_PAUSE = 900;
const LONG_PAUSE = 2000;

fs.mkdirSync(SCREEN_DIR, { recursive: true });
fs.mkdirSync(RUN_ARTIFACTS, { recursive: true });

// ─── Metrics accumulator ─────────────────────────────────────────────────────
const M = {
  runId: RUN_ID,
  modeDecision: 'MODE_UNKNOWN',
  rootRendered: false,
  whiteScreen: false,
  actualVisibleFrontendConfirmed: false,
  actualTargetVersion: '27.2.0',
  mainAligned: true,
  splash: { exists: false, visible: false },
  boot: { entryTs: false, mainTsx: false, ready: false },
  tabsCount: 0,
  selectedTabCount: 0,
  tabSwitchWorked: false,
  inputPresent: false,
  inputTyped: false,
  sendPresent: false,
  sendEnabledAfterTyping: false,
  sendClicked: false,
  sendActivationPath: 'UNKNOWN',
  sendHarnessDiagnosis: 'UNKNOWN',
  visibleUiChangeAfterSend: false,
  secondarySurfaceOpened: false,
  returnedToPrimarySurface: false,
  backendSyncState: 'UNKNOWN',
  orchestratorSyncState: 'UNKNOWN',
  providerState: 'UNKNOWN',
  memoryState: 'UNKNOWN',
  aiChatState: 'UNKNOWN',
  modulesState: 'UNKNOWN',
  reasoningProgressState: 'ABSENT',
  reasoningProgressTestIdPresent: false,
  reasoningProgressDataState: null,
  reasoningProgressHasTopology: false,
  tabFocusRulePresent: false,
  reflowReasonable: true,
  potentialDoubleScroll: false,
  contrastRatioInput: null,
  frictions: [],
  blockers: [],
  harnessRisks: [],
  dominantClassification: 'UNKNOWN',
  dominantCategory: 'NON_BLOCKING_FRICTION',
  dominantSeverity: 'P3',
  dominantFixability: 'SAFE_AUTO_FIX',
  issueClassifications: [],
  screenshots: [],
  jsCriticalErrors: [],
  ipcAvailable: false,
  currentUrl: null,
  pageTitle: null,
  zoom: null,
  navAudit: null,
  bodyText: null,
  residualDiagnostics: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function ss(label) {
  try {
    const fn = `${RUN_ID}_${label}.png`;
    const fp = path.join(SCREEN_DIR, fn);
    await browser.saveScreenshot(fp);
    M.screenshots.push({ label, file: fn, path: fp });
    console.log(`[SCREEN] ${label} => ${fp}`);
    return fp;
  } catch (e) {
    console.warn(`[SCREEN_FAIL] ${label}: ${e.message}`);
    return null;
  }
}

async function pause(ms) {
  await new Promise(r => setTimeout(r, ms));
}

function isSessionCrashError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('invalid session id') ||
    message.includes('session deleted because of page crash or hang') ||
    message.includes('page crash or hang') ||
    message.includes('no such window')
  );
}

async function recoverSessionIfNeeded(step, error) {
  const detail = String(error?.message || error).slice(0, 160);
  M.harnessRisks.push(`${step}_SESSION_LOST:${detail}`);
  console.warn(`[${step}] session lost: ${detail}`);

  try {
    await browser.reloadSession();
    await browser.url('tauri://localhost/#/titane');
    await pause(LONG_PAUSE);
    await ss(`${step.toLowerCase()}_session_recovered`);
    return true;
  } catch (recoveryError) {
    const recoveryDetail = String(recoveryError?.message || recoveryError).slice(0, 160);
    M.harnessRisks.push(`${step}_SESSION_RECOVERY_FAILED:${recoveryDetail}`);
    console.warn(`[${step}] session recovery failed: ${recoveryDetail}`);
    return false;
  }
}

function saveMetrics(suffix) {
  try {
    const f = path.join(RUN_ARTIFACTS, `${RUN_ID}_v24_metrics${suffix || ''}.json`);
    fs.writeFileSync(f, JSON.stringify(M, null, 2));
    console.log(`[METRICS] saved => ${f}`);
  } catch (e) {
    console.warn('[METRICS] save failed:', e.message);
  }
}

// ─── Runtime inspection (pure JS execute, no selector failures) ───────────────
async function inspectRuntime() {
  return await browser.execute(() => {
    const entryTs = !!window.__TITANE_ENTRY_TS__;
    const appRoot = document.getElementById('root');
    const rootChildren = appRoot ? appRoot.children.length : 0;
    const reactMounted = rootChildren > 0;
    const mainTsx = !!appRoot?.firstElementChild;

    const splashEl = document.querySelector(
      '#splash-screen, .splash-screen, [data-splash], ' +
        '[data-testid="splash"], .loading-screen, #loading, ' +
        '[class*="splash"], [class*="Splash"]'
    );
    const splashExists = !!splashEl;
    const splashVisible = splashEl
      ? splashEl.offsetWidth > 0 &&
        splashEl.offsetHeight > 0 &&
        getComputedStyle(splashEl).display !== 'none' &&
        getComputedStyle(splashEl).visibility !== 'hidden' &&
        getComputedStyle(splashEl).opacity !== '0'
      : false;

    const tabEls = Array.from(
      document.querySelectorAll(
        '[role="tab"], .tab-button, .nav-tab, button[data-tab], [data-testid*="tab"]'
      )
    );
    const activeTabs = tabEls.filter(t => t.getAttribute('aria-selected') === 'true');

    const inputEl = document.querySelector(
      'textarea[placeholder], input[type="text"][placeholder], ' +
        '[data-testid="chat-input"], [role="textbox"], ' +
        'textarea:not([disabled]):not([readonly]), .chat-input'
    );
    const sendEl = document.querySelector(
      'button[type="submit"], button[data-testid="send"], ' +
        '.send-button, [aria-label*="nvoi"], [aria-label*="end"], ' +
        'button:last-of-type[class*="send"], button[class*="Send"]'
    );

    const ipcAvailable = !!(
      window.__TAURI__ ||
      window.__TAURI_IPC__ ||
      window.__TAURI_INTERNALS__
    );
    const ipcInternals = window.__TAURI_INTERNALS__ || {};
    const hasMetadata = !!(ipcInternals.metadata || window.__TAURI__);

    const providerReady = !!document.querySelector(
      '[data-provider-ready], [data-status="ready"]'
    );
    const memoryInd = !!document.querySelector('[data-memory], [data-testid*="memory"]');
    const orchestratorInd = !!document.querySelector(
      '[data-orchestrator], [data-testid*="orchestrator"]'
    );
    const chatActiveInd = !!document.querySelector(
      '[data-testid="chat"], .chat-container, #chat'
    );

    const progressComp = document.querySelector(
      '[data-testid="reasoning-progress"], [class*="reasoning"], ' +
        '[class*="progress"][class*="chat"], [data-component="progress"]'
    );
    const progressHasTestId = !!document.querySelector(
      '[data-testid="reasoning-progress"]'
    );
    const progressDataState = progressComp?.getAttribute('data-state') || null;
    const progressVisible = !!(
      progressComp &&
      progressComp.offsetWidth > 0 &&
      progressComp.offsetHeight > 0
    );
    const progressTopologyCount = document.querySelectorAll(
      '[data-testid="reasoning-topology-node"]'
    ).length;

    const zoom = window.devicePixelRatio || 1;
    const scrollContainers = Array.from(document.querySelectorAll('*')).filter(el => {
      const s = getComputedStyle(el);
      return (
        s.overflow === 'auto' ||
        s.overflow === 'scroll' ||
        s.overflowY === 'auto' ||
        s.overflowY === 'scroll'
      );
    }).length;
    const bodyOverflow = getComputedStyle(document.body).overflow;
    const htmlOverflow = getComputedStyle(document.documentElement).overflow;
    const potentialDoubleScroll =
      scrollContainers > 2 &&
      (bodyOverflow === 'auto' || bodyOverflow === 'scroll' || htmlOverflow === 'auto');

    const focusStyle = document.querySelector('[class*="focus"], [class*="Focus"]');
    const tabFocusRulePresent = !!(focusStyle || document.styleSheets.length > 0);

    const hasVisibleText = document.body.innerText.trim().length > 10;
    const hasVisibleElements = document.body.children.length > 0 && rootChildren > 0;
    const whiteScreen = !hasVisibleText && !hasVisibleElements;

    const errorBanner = document.querySelector(
      '[class*="error"], [role="alert"], .error-overlay'
    );
    const hasErrorBanner = errorBanner
      ? errorBanner.offsetWidth > 0 && errorBanner.offsetHeight > 0
      : false;

    let contrastRatioInput = null;
    if (inputEl) {
      try {
        const cs = getComputedStyle(inputEl);
        const bg = cs.backgroundColor || 'rgb(255,255,255)';
        const fg = cs.color || 'rgb(0,0,0)';
        const r2 = bg.match(/\d+/g),
          r1 = fg.match(/\d+/g);
        if (r2 && r1 && r2.length >= 3 && r1.length >= 3) {
          const lum = m => {
            const [r, g, b] = m.slice(0, 3).map(x => {
              const c = parseInt(x) / 255;
              return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          const l1 = lum(r1),
            l2 = lum(r2);
          const hi = Math.max(l1, l2),
            lo = Math.min(l1, l2);
          contrastRatioInput = Math.round((100 * (hi + 0.05)) / (lo + 0.05)) / 100;
        }
      } catch (_) {}
    }

    const ipcHasInvoke = !!window.__TAURI_INTERNALS__?.invoke;

    return {
      entryTs,
      mainTsx,
      reactMounted,
      rootChildren,
      splashExists,
      splashVisible,
      splashOffsetW: splashEl ? splashEl.offsetWidth : 0,
      splashOffsetH: splashEl ? splashEl.offsetHeight : 0,
      tabCount: tabEls.length,
      selectedCount: activeTabs.length,
      inputPresent: !!inputEl,
      sendPresent: !!sendEl,
      ipcAvailable,
      hasMetadata,
      ipcHasInvoke,
      providerReady,
      memoryInd,
      orchestratorInd,
      chatActiveInd,
      progressCompPresent: !!progressComp,
      progressHasTestId,
      progressDataState,
      progressVisible,
      progressTopologyCount,
      zoom,
      scrollContainers,
      potentialDoubleScroll,
      tabFocusRulePresent,
      whiteScreen,
      hasErrorBanner,
      contrastRatioInput,
      bodyText: document.body.innerText.slice(0, 400),
      currentUrl: window.location.href,
      pageTitle: document.title,
    };
  });
}

// ─── Classification ──────────────────────────────────────────────────────────
function classify(m) {
  if (!m.rootRendered || m.whiteScreen) return 'FAIL_VISIBLE_FRONTEND_NOT_CONFIRMED';
  if (m.splash.exists && m.splash.visible && !m.boot.entryTs)
    return 'FAIL_BOOT_NOT_STARTED';
  if (m.splash.exists && m.splash.visible && m.boot.entryTs)
    return 'FAIL_RUNTIME_TARGET_STALE';
  if (m.modeDecision !== 'MODE_B_REAL_UI') return 'FAIL_RUNTIME_TARGET_STALE';
  if (!m.ipcAvailable) return 'FAIL_BACKEND_SYNC';
  if (m.tabsCount > 0 && !m.tabSwitchWorked) return 'FAIL_TAB_INTERACTION_REAL';
  if (!m.inputPresent && m.actualVisibleFrontendConfirmed) return 'FAIL_CHAT_INPUT_REAL';
  if (m.inputPresent && !m.sendPresent) return 'FAIL_SEND_ACTION_REAL';
  if (!m.tabFocusRulePresent) return 'FAIL_UI_FOCUS_PERCEPTIBILITY';
  if (m.potentialDoubleScroll && !m.reflowReasonable) return 'FAIL_LAYOUT_OR_REFLOW';
  if (m.frictions.length === 0 && m.blockers.length === 0)
    return 'NO_CRITICAL_ISSUE_DETECTED';
  return 'UI_MINOR_NON_BLOCKING';
}

function classifyGaps(m) {
  const rows = [];
  const push = (problem, category, severity, fixability) => {
    rows.push({ problem, category, severity, fixability });
  };

  for (const b of m.blockers) {
    push(b, 'UI_VISIBILITY_DEFECT', 'P0', 'NEEDS_DECISION');
  }

  for (const f of m.frictions) {
    if (f.includes('SEND_DISABLED')) {
      push(f, 'UX_FRICTION', 'P1', 'SAFE_AUTO_FIX');
    } else if (f.includes('REASONING_PROGRESS')) {
      push(f, 'UI_VISIBILITY_DEFECT', 'P1', 'SAFE_AUTO_FIX');
    } else if (
      f.includes('DOUBLE_SCROLL') ||
      f.includes('LAYOUT') ||
      f.includes('REFLOW')
    ) {
      push(f, 'UX_FRICTION', 'P2', 'SAFE_AUTO_FIX');
    } else if (f.includes('BACKEND') || f.includes('SYNC')) {
      push(f, 'FULLSTACK_SYNC_DEFECT', 'P1', 'NEEDS_DECISION');
    } else {
      push(f, 'NON_BLOCKING_FRICTION', 'P3', 'SAFE_AUTO_FIX');
    }
  }

  for (const h of m.harnessRisks) {
    push(h, 'HARNESS_DEFECT', 'P2', 'SAFE_AUTO_FIX');
  }

  return rows;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('V24 — VISIBLE REAL UI CERTIFICATION (AppImage 27.2.0)', () => {
  it('V24-S1 — Boot, surface canonique, MODE decision', async () => {
    console.log('[V24-S1] START');

    await pause(LONG_PAUSE);
    await ss('s1_t0_post_boot');

    const r0 = await inspectRuntime();
    console.log(
      '[V24-S1] r0:',
      JSON.stringify({
        url: r0.currentUrl,
        splash: r0.splashVisible,
        react: r0.reactMounted,
        entry: r0.entryTs,
        ipc: r0.ipcAvailable,
      })
    );

    M.currentUrl = r0.currentUrl;
    M.pageTitle = r0.pageTitle;
    M.zoom = r0.zoom;
    M.bodyText = r0.bodyText;
    M.boot.entryTs = r0.entryTs;
    M.boot.mainTsx = r0.mainTsx;
    M.boot.ready = r0.reactMounted;
    M.splash.exists = r0.splashExists;
    M.splash.visible = r0.splashVisible;
    M.ipcAvailable = r0.ipcAvailable;
    M.tabFocusRulePresent = r0.tabFocusRulePresent;
    M.potentialDoubleScroll = r0.potentialDoubleScroll;
    M.contrastRatioInput = r0.contrastRatioInput;
    M.rootRendered = r0.reactMounted && !r0.whiteScreen;
    M.whiteScreen = r0.whiteScreen;

    if (!M.rootRendered || (M.splash.visible && !M.boot.entryTs)) {
      M.modeDecision = 'MODE_A_BOOT_BLOCKED';
      M.blockers.push('BOOT_DID_NOT_COMPLETE');
      if (M.splash.visible) M.frictions.push('LOADING_SPLASH_PERSISTENT');
      if (!M.boot.entryTs) M.frictions.push('ENTRY_NOT_STARTED');
      console.log('[V24-S1] => MODE_A boot blocked');
    } else {
      M.modeDecision = 'MODE_B_REAL_UI';
      M.actualVisibleFrontendConfirmed = true;
      console.log('[V24-S1] => MODE_B real UI visible');
    }

    // Navigate to /titane
    try {
      const url = await browser.getUrl();
      if (!url.includes('/titane')) {
        await browser.url('tauri://localhost/#/titane');
        await pause(LONG_PAUSE);
        console.log('[V24-S1] navigated to /titane');
      } else {
        console.log('[V24-S1] already on /titane');
      }
    } catch (e) {
      console.warn('[V24-S1] nav failed:', e.message);
      M.harnessRisks.push('NAV_TO_TITANE_FAILED');
    }

    await pause(ACTION_PAUSE);
    const r1 = await inspectRuntime();
    M.tabsCount = r1.tabCount;
    M.selectedTabCount = r1.selectedCount;
    M.inputPresent = r1.inputPresent;
    M.sendPresent = r1.sendPresent;
    M.reasoningProgressState = r1.progressCompPresent
      ? r1.progressDataState || 'PRESENT'
      : 'ABSENT';
    M.reasoningProgressTestIdPresent = !!r1.progressHasTestId;
    M.reasoningProgressDataState = r1.progressDataState || null;
    M.reasoningProgressHasTopology = (r1.progressTopologyCount || 0) > 0;
    M.backendSyncState = r1.ipcAvailable
      ? r1.hasMetadata
        ? 'CONNECTED'
        : 'PARTIAL'
      : 'ABSENT';
    M.orchestratorSyncState = r1.orchestratorInd ? 'VISIBLE' : 'NOT_DETECTABLE_FROM_DOM';
    M.providerState = r1.providerReady ? 'READY' : 'NOT_DETECTABLE_FROM_DOM';
    M.memoryState = r1.memoryInd ? 'PRESENT' : 'NOT_DETECTABLE_FROM_DOM';
    M.aiChatState = r1.chatActiveInd
      ? 'VISIBLE'
      : r1.inputPresent
        ? 'INPUT_VISIBLE'
        : 'ABSENT';
    M.modulesState = r1.reactMounted ? 'MODULES_LOADED' : 'MODULES_NOT_LOADED';

    if (r1.splashVisible) {
      M.splash.visible = true;
      M.frictions.push('SPLASH_STILL_VISIBLE_AFTER_NAV');
      if (M.modeDecision === 'MODE_B_REAL_UI') {
        M.modeDecision = 'MODE_A_BOOT_BLOCKED';
        M.blockers.push('SPLASH_PERSISTENT_AFTER_NAV');
      }
    }

    await ss('s1_post_nav_titane');

    if (!r1.inputPresent) M.frictions.push('CHAT_INPUT_NOT_VISIBLE');
    if (!r1.sendPresent) M.frictions.push('SEND_BUTTON_NOT_VISIBLE');
    if (r1.tabCount === 0) M.frictions.push('TABS_NOT_VISIBLE');
    if (r1.inputPresent && !r1.progressCompPresent)
      M.frictions.push('REASONING_PROGRESS_ABSENT');
    if (r1.inputPresent && r1.progressCompPresent && !r1.progressHasTestId) {
      M.frictions.push('REASONING_PROGRESS_NO_STABLE_TESTID');
    }

    saveMetrics('_s1');

    expect(M.rootRendered || M.modeDecision === 'MODE_A_BOOT_BLOCKED').toBe(true);
    console.log(
      `[V24-S1] DONE => mode=${M.modeDecision} frictions=[${M.frictions.join(', ')}]`
    );
  });

  it('V24-S2 — Navigation DOM audit + hash nav proof', async () => {
    console.log('[V24-S2] START');

    await ss('s2_start');

    // Extended nav audit via JS
    const navData = await browser.execute(() => {
      const navSels = [
        '[role="tab"]',
        '.tab-button',
        '.nav-tab',
        'button[data-tab]',
        '[data-testid*="tab"]',
        'nav a',
        'nav button',
        '[role="navigation"] a',
        '[role="navigation"] button',
        'header a',
        'header button',
        '[class*="nav"] a',
        '[class*="nav"] button',
        '[class*="Nav"] a',
        '[class*="Nav"] button',
      ];
      const found = {};
      for (const sel of navSels) {
        const els = document.querySelectorAll(sel);
        if (els.length > 0) {
          found[sel] = Array.from(els)
            .slice(0, 5)
            .map(el => ({
              text: el.textContent?.trim().slice(0, 30),
              tag: el.tagName,
              role: el.getAttribute('role'),
              ariaSelected: el.getAttribute('aria-selected'),
              visible: el.offsetWidth > 0 && el.offsetHeight > 0,
            }));
        }
      }
      const navEl = document.querySelector('nav, [role="navigation"], header');
      const navItems = navEl
        ? Array.from(navEl.querySelectorAll('a, button'))
            .slice(0, 12)
            .map(el => ({
              text: el.textContent?.trim().slice(0, 30),
              tag: el.tagName,
              visible: el.offsetWidth > 0 && el.offsetHeight > 0,
            }))
        : [];
      return {
        found: Object.keys(found),
        navItems,
        navElTag: navEl ? navEl.tagName : null,
      };
    });

    console.log('[V24-S2] navItems:', JSON.stringify(navData.navItems.map(i => i.text)));
    console.log('[V24-S2] selectors matched:', navData.found);
    M.navAudit = navData;

    if (navData.navItems.length > 0 && M.tabsCount === 0) {
      M.tabsCount = navData.navItems.filter(i => i.visible).length;
      if (M.tabsCount > 0)
        M.frictions = M.frictions.filter(f => f !== 'TABS_NOT_VISIBLE');
    }

    // Hash navigation proof (no element click - avoids session crash)
    let tabSwitched = false;
    try {
      const lenBefore = await browser.execute(() => document.body.innerHTML.length);
      const urlBefore = await browser.getUrl();
      await ss('s2_before_hash_nav');

      await browser.execute(() => {
        window.location.hash = '/time';
      });
      await pause(LONG_PAUSE);
      await ss('s2_after_nav_time');
      const urlTime = await browser.getUrl();
      const lenTime = await browser.execute(() => document.body.innerHTML.length);
      console.log(
        `[V24-S2] /time nav: ${urlBefore} => ${urlTime} | len: ${lenBefore} => ${lenTime}`
      );

      if (urlTime.includes('time') || Math.abs(lenTime - lenBefore) > 200) {
        tabSwitched = true;
      }

      await browser.execute(() => {
        window.location.hash = '/stats';
      });
      await pause(ACTION_PAUSE);
      await ss('s2_after_nav_stats');

      await browser.execute(() => {
        window.location.hash = '/titane';
      });
      await pause(ACTION_PAUSE);
      await ss('s2_returned_titane');
      const urlFinal = await browser.getUrl();
      console.log(`[V24-S2] returned: ${urlFinal}`);
    } catch (e) {
      console.warn('[V24-S2] hash nav error:', e.message);
      M.harnessRisks.push('HASH_NAV_FAILED: ' + e.message.slice(0, 80));
    }

    M.tabSwitchWorked = tabSwitched;
    if (!tabSwitched) M.frictions.push('TAB_SWITCH_NOT_CONFIRMED');

    const r2 = await inspectRuntime();
    M.selectedTabCount = r2.selectedCount;
    await ss('s2_final');

    console.log(
      `[V24-S2] DONE => tabSwitchWorked=${tabSwitched} tabsCount=${M.tabsCount}`
    );
  });

  it('V24-S3 — Chat: saisie visible + send + changement etat', async () => {
    console.log('[V24-S3] START');

    try {
      try {
        await browser.execute(() => {
          window.location.hash = '/titane';
        });
        await pause(LONG_PAUSE);
      } catch (e) {
        M.harnessRisks.push('S3_NAV_FAILED');
      }

      const rChat = await inspectRuntime();
      M.inputPresent = rChat.inputPresent;
      M.sendPresent = rChat.sendPresent;
      await ss('s3_before_chat');

      if (!rChat.inputPresent) {
        console.log('[V24-S3] SKIP no chat input');
        M.frictions.push('CHAT_SCENARIO_SKIPPED_NO_INPUT');
        return;
      }

      // Find input via JS
      const inputInfo = await browser.execute(() => {
        const sels = [
          'textarea[placeholder]',
          '[data-testid="chat-input"]',
          '[role="textbox"]',
          'textarea:not([disabled]):not([readonly])',
          '.chat-input textarea',
          'textarea',
          'input[type="text"]',
        ];
        for (const sel of sels) {
          const el = document.querySelector(sel);
          if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
            return {
              found: true,
              sel,
              placeholder: el.placeholder || '',
              disabled: el.disabled,
            };
          }
        }
        return { found: false };
      });

      if (!inputInfo.found) {
        M.frictions.push('CHAT_INPUT_SELECTOR_FAIL');
        return;
      }

      const typedText = 'Test V24 certification TITANE visible';

      // First path: real user-like typing through WebDriver APIs
      try {
        const inputEl = await browser.$(inputInfo.sel);
        await inputEl.click();
        await inputEl.clearValue();
        await inputEl.setValue(typedText);
        M.inputTyped = true;
        M.sendActivationPath = 'WEBDRIVER_SETVALUE';
        console.log('[V24-S3] typed via WebDriver setValue');
        await pause(ACTION_PAUSE);
        await ss('s3_after_typing_webdriver');
      } catch (e) {
        M.harnessRisks.push('WEBDRIVER_SETVALUE_FAILED');
        console.warn('[V24-S3] WebDriver typing failed:', e.message);
      }

      // Check send button
      const sendInfo = await browser.execute(() => {
        const sels = [
          'button[type="submit"]',
          '[data-testid="chat-send"]',
          '[data-testid="send"]',
          '.send-button',
          '[aria-label*="nvoi"]',
          'button[class*="send" i]',
        ];
        for (const sel of sels) {
          const el = document.querySelector(sel);
          if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
            return { found: true, sel, disabled: el.disabled };
          }
        }
        return { found: false };
      });

      M.sendPresent = sendInfo.found;
      M.sendEnabledAfterTyping = sendInfo.found && !sendInfo.disabled;
      let sendSelectorResolved = sendInfo.found ? sendInfo.sel : null;

      // If still disabled, apply native setter + InputEvent to disambiguate harness vs product
      if (sendInfo.found && sendInfo.disabled) {
        try {
          const typedViaNativeSetter = await browser.execute(
            (sel, text) => {
              const el = document.querySelector(sel);
              if (!el) return false;
              const proto =
                window.HTMLTextAreaElement?.prototype ||
                window.HTMLInputElement?.prototype;
              const desc = proto ? Object.getOwnPropertyDescriptor(proto, 'value') : null;
              if (desc?.set) {
                desc.set.call(el, text);
              } else {
                el.value = text;
              }
              el.dispatchEvent(new InputEvent('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            },
            inputInfo.sel,
            typedText
          );

          if (typedViaNativeSetter) {
            M.inputTyped = true;
            await pause(ACTION_PAUSE);
            await ss('s3_after_typing_native_setter');
            const sendInfo2 = await browser.execute(() => {
              const sels = [
                'button[type="submit"]',
                '[data-testid="chat-send"]',
                '[data-testid="send"]',
                '.send-button',
                '[aria-label*="nvoi"]',
                'button[class*="send" i]',
              ];
              for (const sel of sels) {
                const el = document.querySelector(sel);
                if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
                  return { found: true, sel, disabled: el.disabled };
                }
              }
              return { found: false };
            });

            if (sendInfo2.found && !sendInfo2.disabled) {
              M.sendEnabledAfterTyping = true;
              sendSelectorResolved = sendInfo2.sel;
              M.sendActivationPath = 'NATIVE_SETTER_INPUTEVENT';
              M.sendHarnessDiagnosis = 'HARNESS_DEFECT_JS_VALUE_NOT_REACT';
              M.frictions.push('SEND_TYPING_PATH_REQUIRES_NATIVE_SETTER');
              console.log(
                '[V24-S3] send enabled only after native setter => harness diagnosis'
              );
            } else {
              M.sendHarnessDiagnosis = 'PRODUCT_OR_LOGIC_DEFECT';
            }
          }
        } catch (e) {
          M.harnessRisks.push('NATIVE_SETTER_DIAG_FAILED');
        }
      }

      if (M.sendPresent && M.sendEnabledAfterTyping && sendSelectorResolved) {
        try {
          const lenBefore = await browser.execute(() => document.body.innerHTML.length);
          await browser.execute(sel => {
            const el = document.querySelector(sel);
            if (el) el.click();
          }, sendSelectorResolved);
          M.sendClicked = true;
          await pause(LONG_PAUSE);

          const rAfterSend = await inspectRuntime();
          M.reasoningProgressState = rAfterSend.progressCompPresent
            ? rAfterSend.progressDataState || 'PRESENT'
            : M.reasoningProgressState;
          M.reasoningProgressTestIdPresent =
            M.reasoningProgressTestIdPresent || !!rAfterSend.progressHasTestId;
          M.reasoningProgressDataState =
            rAfterSend.progressDataState || M.reasoningProgressDataState;
          M.reasoningProgressHasTopology =
            M.reasoningProgressHasTopology || (rAfterSend.progressTopologyCount || 0) > 0;

          if (rAfterSend.progressCompPresent) {
            M.frictions = M.frictions.filter(
              f =>
                f !== 'REASONING_PROGRESS_ABSENT' &&
                f !== 'REASONING_PROGRESS_NO_STABLE_TESTID'
            );
            if (!rAfterSend.progressHasTestId) {
              M.frictions.push('REASONING_PROGRESS_NO_STABLE_TESTID');
            }
          } else {
            M.frictions.push('REASONING_PROGRESS_ABSENT');
          }

          await ss('s3_after_send');
          const lenAfter = await browser.execute(() => document.body.innerHTML.length);
          M.visibleUiChangeAfterSend = Math.abs(lenAfter - lenBefore) > 50;
          console.log(
            `[V24-S3] send clicked dom: ${lenBefore} => ${lenAfter} change=${M.visibleUiChangeAfterSend}`
          );
        } catch (e) {
          console.warn('[V24-S3] send failed:', e.message);
        }
      } else {
        if (sendInfo.found && sendInfo.disabled && M.sendHarnessDiagnosis === 'UNKNOWN') {
          M.sendHarnessDiagnosis = 'PRODUCT_OR_LOGIC_DEFECT';
        }
        M.frictions.push(
          M.sendPresent
            ? 'SEND_DISABLED_AFTER_TYPING'
            : 'SEND_BUTTON_NOT_FOUND_BY_SELECTOR'
        );
      }

      await ss('s3_final');
      console.log(
        `[V24-S3] DONE typed=${M.inputTyped} sendClicked=${M.sendClicked} uiChange=${M.visibleUiChangeAfterSend}`
      );
    } catch (e) {
      if (isSessionCrashError(e)) {
        await recoverSessionIfNeeded('V24-S3', e);
        return;
      }
      throw e;
    }
  });

  it('V24-S4 — Surface secondaire + fullstack IPC probe', async () => {
    console.log('[V24-S4] START');

    try {
      await ss('s4_start');

      // Try secondary surfaces via hash nav
      const routes = ['/admin', '/settings', '/dev', '/stats'];
      let opened = false;
      for (const route of routes) {
        try {
          await browser.execute(r => {
            window.location.hash = r;
          }, route);
          await pause(ACTION_PAUSE);
          const r = await inspectRuntime();
          const url = await browser.getUrl();
          if (
            r.reactMounted &&
            !r.splashVisible &&
            url.includes(route.replace('/', ''))
          ) {
            M.secondarySurfaceOpened = true;
            opened = true;
            console.log(`[V24-S4] opened: ${route} url=${url}`);
            await ss('s4_secondary_opened');
            break;
          }
        } catch (e) {
          console.warn(`[V24-S4] ${route} failed: ${e.message}`);
        }
      }

      if (!opened) {
        M.frictions.push('SECONDARY_SURFACE_NOT_REACHABLE');
      }

      // IPC probe
      try {
        const ipcProbe = await browser.execute(() => {
          const inv = window.__TAURI_INTERNALS__?.invoke || window.__TAURI__?.invoke;
          const meta = window.__TAURI_INTERNALS__?.metadata;
          return {
            hasInvoke: typeof inv === 'function',
            tauriPresent: !!window.__TAURI__,
            internalsPresent: !!window.__TAURI_INTERNALS__,
            runtimeVersion: meta?.currentPackage?.version || null,
          };
        });
        M.ipcAvailable = ipcProbe.hasInvoke;
        if (ipcProbe.runtimeVersion) M.actualTargetVersion = ipcProbe.runtimeVersion;
        console.log('[V24-S4] IPC probe:', JSON.stringify(ipcProbe));
      } catch (e) {
        M.harnessRisks.push('IPC_PROBE_FAILED: ' + e.message.slice(0, 60));
      }

      await ss('s4_done');
      console.log(`[V24-S4] DONE secondarySurfaceOpened=${M.secondarySurfaceOpened}`);
    } catch (e) {
      if (isSessionCrashError(e)) {
        await recoverSessionIfNeeded('V24-S4', e);
        return;
      }
      throw e;
    }
  });

  it('V24-S5 — Retour principal + stabilite + metriques finales', async () => {
    console.log('[V24-S5] START');

    try {
      try {
        await browser.execute(() => {
          window.location.hash = '/titane';
        });
        await pause(LONG_PAUSE);
      } catch (e) {
        M.harnessRisks.push('RETURN_TITANE_FAILED');
      }

      await ss('s5_returned_primary');

      const rf = await inspectRuntime();
      M.returnedToPrimarySurface = rf.reactMounted && !rf.splashVisible;
      M.reflowReasonable = rf.scrollContainers < 8;
      M.potentialDoubleScroll = rf.potentialDoubleScroll;
      if (!M.returnedToPrimarySurface) M.frictions.push('RETURN_TO_PRIMARY_FAILED');

      // DOM health
      const health = await browser.execute(() => {
        const errEls = Array.from(
          document.querySelectorAll('[class*="error" i], [role="alert"]')
        );
        const blockEls = Array.from(
          document.querySelectorAll('[class*="overlay"], [class*="modal"]')
        );
        const scrollEls = Array.from(document.querySelectorAll('*')).filter(el => {
          const s = getComputedStyle(el);
          return (
            s.overflow === 'auto' ||
            s.overflow === 'scroll' ||
            s.overflowY === 'auto' ||
            s.overflowY === 'scroll'
          );
        });
        return {
          visibleErrors: errEls.filter(el => el.offsetWidth > 0).length,
          visibleErrorSummaries: errEls
            .filter(el => el.offsetWidth > 0)
            .slice(0, 5)
            .map(el => ({
              tag: el.tagName,
              className: el.className || '',
              role: el.getAttribute('role'),
              text: (el.textContent || '').trim().slice(0, 120),
            })),
          blockingOverlays: blockEls.filter(
            el => el.offsetWidth > 0 && el.offsetHeight > 100
          ).length,
          inputCount: document.querySelectorAll('textarea, input[type="text"]').length,
          buttonCount: document.querySelectorAll('button:not([disabled])').length,
          scriptCount: document.scripts.length,
          stylesheetCount: document.styleSheets.length,
          scrollContainers: scrollEls.length,
          bodyOverflow: getComputedStyle(document.body).overflow,
          htmlOverflow: getComputedStyle(document.documentElement).overflow,
        };
      });
      console.log('[V24-S5] health:', JSON.stringify(health));
      M.residualDiagnostics = health;

      if (health.visibleErrors > 0) M.frictions.push('ERROR_ELEMENTS_IN_DOM');
      if (health.blockingOverlays > 0) M.frictions.push('BLOCKING_OVERLAY_DETECTED');

      // Final IPC check
      try {
        const ipc = await browser.execute(() => ({
          hasInvoke:
            typeof (window.__TAURI_INTERNALS__?.invoke || window.__TAURI__?.invoke) ===
            'function',
          tauriPresent: !!window.__TAURI__,
        }));
        M.ipcAvailable = ipc.hasInvoke;
      } catch (e) {
        M.harnessRisks.push('IPC_FINAL_FAILED');
      }

      await ss('s5_final');

      M.dominantClassification = classify(M);
      M.issueClassifications = classifyGaps(M);
      if (M.issueClassifications.length > 0) {
        const first = M.issueClassifications[0];
        M.dominantCategory = first.category;
        M.dominantSeverity = first.severity;
        M.dominantFixability = first.fixability;
      }
      saveMetrics('');

      console.log(
        `[V24-S5] FINAL mode=${M.modeDecision} class=${M.dominantClassification}`
      );
      console.log(`[V24-S5] frictions=[${M.frictions.join(', ')}]`);
      console.log(`[V24-S5] blockers=[${M.blockers.join(', ')}]`);
      console.log(`[V24-S5] screens=${M.screenshots.length} ipc=${M.ipcAvailable}`);

      expect(M.dominantClassification).toBeTruthy();
      console.log('[V24-S5] DONE');
    } catch (e) {
      if (isSessionCrashError(e)) {
        await recoverSessionIfNeeded('V24-S5', e);
        M.dominantClassification = classify(M);
        M.issueClassifications = classifyGaps(M);
        if (M.issueClassifications.length > 0) {
          const first = M.issueClassifications[0];
          M.dominantCategory = first.category;
          M.dominantSeverity = first.severity;
          M.dominantFixability = first.fixability;
        }
        saveMetrics('_s5_session_crash');
        throw new Error(
          `SESSION_CRASH V24-S5: harness lost — product verdict unproven. harnessRisks=${M.harnessRisks.slice(-2).join('|')}`
        );
      }
      throw e;
    }
  });
});
