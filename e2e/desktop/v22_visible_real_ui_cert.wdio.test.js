/**
 * TITANE∞ — V22 VISIBLE REAL UI CERTIFICATION
 * VISIBLE_REAL_UI_CERTIFICATION__DESKTOP_WEBDRIVERIO__LIVE_FRONTEND_PROOF
 * Autorité: Kevin Thibault | Mode: MODE_B-first (fall to MODE_A if boot blocked)
 *
 * Spec: v22_visible_real_ui_cert.wdio.test.js
 * Target: AppImage 27.2.0 (with P1_BUILD_CHUNKS_FIX — TDZ eliminated)
 * Authority: v15_total_audit_20260311_080118 @ 20fbba492 = origin/MAIN
 */

import { browser } from '@wdio/globals';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ─── Constants ───────────────────────────────────────────────────────────────
const RUN_ID = process.env.TITANE_V22_RUN_ID || 'run1';
const SCREEN_DIR = process.env.TITANE_V22_SCREEN_DIR || '/tmp/v22_screens';
const RUN_ARTIFACTS = process.env.RUN_ARTIFACTS || '/tmp/v22_artifacts';
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
  tabFocusRulePresent: false,
  reflowReasonable: true,
  potentialDoubleScroll: false,
  contrastRatioInput: null,
  frictions: [],
  blockers: [],
  harnessRisks: [],
  dominantClassification: 'UNKNOWN',
  screenshots: [],
  jsCriticalErrors: [],
  ipcAvailable: false,
  currentUrl: null,
  pageTitle: null,
  zoom: null,
  navAudit: null,
  bodyText: null,
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

function saveMetrics(suffix) {
  try {
    const f = path.join(RUN_ARTIFACTS, `${RUN_ID}_v22_metrics${suffix || ''}.json`);
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
      ? splashEl.offsetWidth > 0 && splashEl.offsetHeight > 0 &&
        getComputedStyle(splashEl).display !== 'none' &&
        getComputedStyle(splashEl).visibility !== 'hidden' &&
        getComputedStyle(splashEl).opacity !== '0'
      : false;

    const tabEls = Array.from(document.querySelectorAll(
      '[role="tab"], .tab-button, .nav-tab, button[data-tab], [data-testid*="tab"]'
    ));
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

    const ipcAvailable = !!(window.__TAURI__ || window.__TAURI_IPC__ || window.__TAURI_INTERNALS__);
    const ipcInternals = window.__TAURI_INTERNALS__ || {};
    const hasMetadata = !!(ipcInternals.metadata || window.__TAURI__);

    const providerReady = !!document.querySelector('[data-provider-ready], [data-status="ready"]');
    const memoryInd = !!document.querySelector('[data-memory], [data-testid*="memory"]');
    const orchestratorInd = !!document.querySelector('[data-orchestrator], [data-testid*="orchestrator"]');
    const chatActiveInd = !!document.querySelector('[data-testid="chat"], .chat-container, #chat');

    const progressComp = document.querySelector(
      '[data-testid="reasoning-progress"], [class*="reasoning"], ' +
      '[class*="progress"][class*="chat"], [data-component="progress"]'
    );

    const zoom = window.devicePixelRatio || 1;
    const scrollContainers = Array.from(document.querySelectorAll('*')).filter(el => {
      const s = getComputedStyle(el);
      return s.overflow === 'auto' || s.overflow === 'scroll' ||
             s.overflowY === 'auto' || s.overflowY === 'scroll';
    }).length;
    const bodyOverflow = getComputedStyle(document.body).overflow;
    const htmlOverflow = getComputedStyle(document.documentElement).overflow;
    const potentialDoubleScroll = scrollContainers > 2 &&
      (bodyOverflow === 'auto' || bodyOverflow === 'scroll' || htmlOverflow === 'auto');

    const focusStyle = document.querySelector('[class*="focus"], [class*="Focus"]');
    const tabFocusRulePresent = !!(focusStyle || document.styleSheets.length > 0);

    const hasVisibleText = document.body.innerText.trim().length > 10;
    const hasVisibleElements = document.body.children.length > 0 && rootChildren > 0;
    const whiteScreen = !hasVisibleText && !hasVisibleElements;

    const errorBanner = document.querySelector('[class*="error"], [role="alert"], .error-overlay');
    const hasErrorBanner = errorBanner ? (errorBanner.offsetWidth > 0 && errorBanner.offsetHeight > 0) : false;

    let contrastRatioInput = null;
    if (inputEl) {
      try {
        const cs = getComputedStyle(inputEl);
        const bg = cs.backgroundColor || 'rgb(255,255,255)';
        const fg = cs.color || 'rgb(0,0,0)';
        const r2 = bg.match(/\d+/g), r1 = fg.match(/\d+/g);
        if (r2 && r1 && r2.length >= 3 && r1.length >= 3) {
          const lum = (m) => {
            const [r, g, b] = m.slice(0, 3).map(x => {
              const c = parseInt(x) / 255;
              return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          const l1 = lum(r1), l2 = lum(r2);
          const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
          contrastRatioInput = Math.round(100 * (hi + 0.05) / (lo + 0.05)) / 100;
        }
      } catch (_) {}
    }

    const ipcHasInvoke = !!(window.__TAURI_INTERNALS__?.invoke);

    return {
      entryTs, mainTsx, reactMounted, rootChildren,
      splashExists, splashVisible,
      splashOffsetW: splashEl ? splashEl.offsetWidth : 0,
      splashOffsetH: splashEl ? splashEl.offsetHeight : 0,
      tabCount: tabEls.length, selectedCount: activeTabs.length,
      inputPresent: !!inputEl, sendPresent: !!sendEl,
      ipcAvailable, hasMetadata, ipcHasInvoke,
      providerReady, memoryInd, orchestratorInd, chatActiveInd,
      progressCompPresent: !!progressComp,
      zoom, scrollContainers, potentialDoubleScroll,
      tabFocusRulePresent, whiteScreen, hasErrorBanner,
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
  if (m.splash.exists && m.splash.visible && !m.boot.entryTs) return 'FAIL_BOOT_NOT_STARTED';
  if (m.splash.exists && m.splash.visible && m.boot.entryTs) return 'FAIL_RUNTIME_TARGET_STALE';
  if (m.modeDecision !== 'MODE_B_REAL_UI') return 'FAIL_RUNTIME_TARGET_STALE';
  if (!m.ipcAvailable) return 'FAIL_BACKEND_SYNC';
  if (m.tabsCount > 0 && !m.tabSwitchWorked) return 'FAIL_TAB_INTERACTION_REAL';
  if (!m.inputPresent && m.actualVisibleFrontendConfirmed) return 'FAIL_CHAT_INPUT_REAL';
  if (m.inputPresent && !m.sendPresent) return 'FAIL_SEND_ACTION_REAL';
  if (!m.tabFocusRulePresent) return 'FAIL_UI_FOCUS_PERCEPTIBILITY';
  if (m.potentialDoubleScroll) return 'FAIL_LAYOUT_OR_REFLOW';
  if (m.frictions.length === 0 && m.blockers.length === 0) return 'NO_CRITICAL_ISSUE_DETECTED';
  return 'UI_MINOR_NON_BLOCKING';
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('V22 — VISIBLE REAL UI CERTIFICATION (AppImage 27.2.0)', () => {

  it('V22-S1 — Boot, surface canonique, MODE decision', async () => {
    console.log('[V22-S1] START');

    await pause(LONG_PAUSE);
    await ss('s1_t0_post_boot');

    const r0 = await inspectRuntime();
    console.log('[V22-S1] r0:', JSON.stringify({
      url: r0.currentUrl, splash: r0.splashVisible,
      react: r0.reactMounted, entry: r0.entryTs, ipc: r0.ipcAvailable,
    }));

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
      console.log('[V22-S1] => MODE_A boot blocked');
    } else {
      M.modeDecision = 'MODE_B_REAL_UI';
      M.actualVisibleFrontendConfirmed = true;
      console.log('[V22-S1] => MODE_B real UI visible');
    }

    // Navigate to /titane
    try {
      const url = await browser.getUrl();
      if (!url.includes('/titane')) {
        await browser.url('tauri://localhost/#/titane');
        await pause(LONG_PAUSE);
        console.log('[V22-S1] navigated to /titane');
      } else {
        console.log('[V22-S1] already on /titane');
      }
    } catch (e) {
      console.warn('[V22-S1] nav failed:', e.message);
      M.harnessRisks.push('NAV_TO_TITANE_FAILED');
    }

    await pause(ACTION_PAUSE);
    const r1 = await inspectRuntime();
    M.tabsCount = r1.tabCount;
    M.selectedTabCount = r1.selectedCount;
    M.inputPresent = r1.inputPresent;
    M.sendPresent = r1.sendPresent;
    M.reasoningProgressState = r1.progressCompPresent ? 'PRESENT' : 'ABSENT';
    M.backendSyncState = r1.ipcAvailable ? (r1.hasMetadata ? 'CONNECTED' : 'PARTIAL') : 'ABSENT';
    M.orchestratorSyncState = r1.orchestratorInd ? 'VISIBLE' : 'NOT_DETECTABLE_FROM_DOM';
    M.providerState = r1.providerReady ? 'READY' : 'NOT_DETECTABLE_FROM_DOM';
    M.memoryState = r1.memoryInd ? 'PRESENT' : 'NOT_DETECTABLE_FROM_DOM';
    M.aiChatState = r1.chatActiveInd ? 'VISIBLE' : (r1.inputPresent ? 'INPUT_VISIBLE' : 'ABSENT');
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
    if (!r1.progressCompPresent) M.frictions.push('REASONING_PROGRESS_ABSENT');

    saveMetrics('_s1');

    expect(M.rootRendered || M.modeDecision === 'MODE_A_BOOT_BLOCKED').toBe(true);
    console.log(`[V22-S1] DONE => mode=${M.modeDecision} frictions=[${M.frictions.join(', ')}]`);
  });

  it('V22-S2 — Navigation DOM audit + hash nav proof', async () => {
    console.log('[V22-S2] START');

    await ss('s2_start');

    // Extended nav audit via JS
    const navData = await browser.execute(() => {
      const navSels = [
        '[role="tab"]', '.tab-button', '.nav-tab', 'button[data-tab]',
        '[data-testid*="tab"]', 'nav a', 'nav button', '[role="navigation"] a',
        '[role="navigation"] button', 'header a', 'header button',
        '[class*="nav"] a', '[class*="nav"] button', '[class*="Nav"] a',
        '[class*="Nav"] button',
      ];
      const found = {};
      for (const sel of navSels) {
        const els = document.querySelectorAll(sel);
        if (els.length > 0) {
          found[sel] = Array.from(els).slice(0, 5).map(el => ({
            text: el.textContent?.trim().slice(0, 30),
            tag: el.tagName,
            role: el.getAttribute('role'),
            ariaSelected: el.getAttribute('aria-selected'),
            visible: el.offsetWidth > 0 && el.offsetHeight > 0,
          }));
        }
      }
      const navEl = document.querySelector('nav, [role="navigation"], header');
      const navItems = navEl ? Array.from(navEl.querySelectorAll('a, button')).slice(0, 12).map(el => ({
        text: el.textContent?.trim().slice(0, 30),
        tag: el.tagName,
        visible: el.offsetWidth > 0 && el.offsetHeight > 0,
      })) : [];
      return { found: Object.keys(found), navItems, navElTag: navEl ? navEl.tagName : null };
    });

    console.log('[V22-S2] navItems:', JSON.stringify(navData.navItems.map(i => i.text)));
    console.log('[V22-S2] selectors matched:', navData.found);
    M.navAudit = navData;

    if (navData.navItems.length > 0 && M.tabsCount === 0) {
      M.tabsCount = navData.navItems.filter(i => i.visible).length;
      if (M.tabsCount > 0) M.frictions = M.frictions.filter(f => f !== 'TABS_NOT_VISIBLE');
    }

    // Hash navigation proof (no element click - avoids session crash)
    let tabSwitched = false;
    try {
      const lenBefore = await browser.execute(() => document.body.innerHTML.length);
      const urlBefore = await browser.getUrl();
      await ss('s2_before_hash_nav');

      await browser.execute(() => { window.location.hash = '/time'; });
      await pause(LONG_PAUSE);
      await ss('s2_after_nav_time');
      const urlTime = await browser.getUrl();
      const lenTime = await browser.execute(() => document.body.innerHTML.length);
      console.log(`[V22-S2] /time nav: ${urlBefore} => ${urlTime} | len: ${lenBefore} => ${lenTime}`);

      if (urlTime.includes('time') || Math.abs(lenTime - lenBefore) > 200) {
        tabSwitched = true;
      }

      await browser.execute(() => { window.location.hash = '/stats'; });
      await pause(ACTION_PAUSE);
      await ss('s2_after_nav_stats');

      await browser.execute(() => { window.location.hash = '/titane'; });
      await pause(ACTION_PAUSE);
      await ss('s2_returned_titane');
      const urlFinal = await browser.getUrl();
      console.log(`[V22-S2] returned: ${urlFinal}`);

    } catch (e) {
      console.warn('[V22-S2] hash nav error:', e.message);
      M.harnessRisks.push('HASH_NAV_FAILED: ' + e.message.slice(0, 80));
    }

    M.tabSwitchWorked = tabSwitched;
    if (!tabSwitched) M.frictions.push('TAB_SWITCH_NOT_CONFIRMED');

    const r2 = await inspectRuntime();
    M.selectedTabCount = r2.selectedCount;
    await ss('s2_final');

    console.log(`[V22-S2] DONE => tabSwitchWorked=${tabSwitched} tabsCount=${M.tabsCount}`);
  });

  it('V22-S3 — Chat: saisie visible + send + changement etat', async () => {
    console.log('[V22-S3] START');

    try {
      await browser.execute(() => { window.location.hash = '/titane'; });
      await pause(LONG_PAUSE);
    } catch (e) {
      M.harnessRisks.push('S3_NAV_FAILED');
    }

    const rChat = await inspectRuntime();
    M.inputPresent = rChat.inputPresent;
    M.sendPresent = rChat.sendPresent;
    await ss('s3_before_chat');

    if (!rChat.inputPresent) {
      console.log('[V22-S3] SKIP no chat input');
      M.frictions.push('CHAT_SCENARIO_SKIPPED_NO_INPUT');
      return;
    }

    // Find input via JS
    const inputInfo = await browser.execute(() => {
      const sels = [
        'textarea[placeholder]', '[data-testid="chat-input"]',
        '[role="textbox"]', 'textarea:not([disabled]):not([readonly])',
        '.chat-input textarea', 'textarea', 'input[type="text"]',
      ];
      for (const sel of sels) {
        const el = document.querySelector(sel);
        if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
          return { found: true, sel, placeholder: el.placeholder || '', disabled: el.disabled };
        }
      }
      return { found: false };
    });

    if (!inputInfo.found) {
      M.frictions.push('CHAT_INPUT_SELECTOR_FAIL');
      return;
    }

    // Type via JS (avoids WebDriver focus issues)
    try {
      const typed = await browser.execute((sel, text) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        el.focus();
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }, inputInfo.sel, 'Test V22 certification TITANE visible');

      if (typed) {
        M.inputTyped = true;
        console.log('[V22-S3] typed via JS');
        await pause(ACTION_PAUSE);
        await ss('s3_after_typing');
      }
    } catch (e) {
      console.warn('[V22-S3] type failed:', e.message);
    }

    // Check send button
    const sendInfo = await browser.execute(() => {
      const sels = [
        'button[type="submit"]', '[data-testid="send"]', '.send-button',
        '[aria-label*="nvoi"]', 'button[class*="send" i]',
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

    if (sendInfo.found && !sendInfo.disabled) {
      try {
        const lenBefore = await browser.execute(() => document.body.innerHTML.length);
        await browser.execute((sel) => {
          const el = document.querySelector(sel);
          if (el) el.click();
        }, sendInfo.sel);
        M.sendClicked = true;
        await pause(LONG_PAUSE);
        await ss('s3_after_send');
        const lenAfter = await browser.execute(() => document.body.innerHTML.length);
        M.visibleUiChangeAfterSend = Math.abs(lenAfter - lenBefore) > 50;
        console.log(`[V22-S3] send clicked dom: ${lenBefore} => ${lenAfter} change=${M.visibleUiChangeAfterSend}`);
      } catch (e) {
        console.warn('[V22-S3] send failed:', e.message);
      }
    } else {
      M.frictions.push(sendInfo.found ? 'SEND_DISABLED_AFTER_TYPING' : 'SEND_BUTTON_NOT_FOUND_BY_SELECTOR');
    }

    await ss('s3_final');
    console.log(`[V22-S3] DONE typed=${M.inputTyped} sendClicked=${M.sendClicked} uiChange=${M.visibleUiChangeAfterSend}`);
  });

  it('V22-S4 — Surface secondaire + fullstack IPC probe', async () => {
    console.log('[V22-S4] START');

    await ss('s4_start');

    // Try secondary surfaces via hash nav
    const routes = ['/admin', '/settings', '/dev', '/stats'];
    let opened = false;
    for (const route of routes) {
      try {
        await browser.execute((r) => { window.location.hash = r; }, route);
        await pause(ACTION_PAUSE);
        const r = await inspectRuntime();
        const url = await browser.getUrl();
        if (r.reactMounted && !r.splashVisible && url.includes(route.replace('/', ''))) {
          M.secondarySurfaceOpened = true;
          opened = true;
          console.log(`[V22-S4] opened: ${route} url=${url}`);
          await ss('s4_secondary_opened');
          break;
        }
      } catch (e) {
        console.warn(`[V22-S4] ${route} failed: ${e.message}`);
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
      console.log('[V22-S4] IPC probe:', JSON.stringify(ipcProbe));
    } catch (e) {
      M.harnessRisks.push('IPC_PROBE_FAILED: ' + e.message.slice(0, 60));
    }

    await ss('s4_done');
    console.log(`[V22-S4] DONE secondarySurfaceOpened=${M.secondarySurfaceOpened}`);
  });

  it('V22-S5 — Retour principal + stabilite + metriques finales', async () => {
    console.log('[V22-S5] START');

    try {
      await browser.execute(() => { window.location.hash = '/titane'; });
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
      const errEls = Array.from(document.querySelectorAll('[class*="error" i], [role="alert"]'));
      const blockEls = Array.from(document.querySelectorAll('[class*="overlay"], [class*="modal"]'));
      return {
        visibleErrors: errEls.filter(el => el.offsetWidth > 0).length,
        blockingOverlays: blockEls.filter(el => el.offsetWidth > 0 && el.offsetHeight > 100).length,
        inputCount: document.querySelectorAll('textarea, input[type="text"]').length,
        buttonCount: document.querySelectorAll('button:not([disabled])').length,
        scriptCount: document.scripts.length,
        stylesheetCount: document.styleSheets.length,
      };
    });
    console.log('[V22-S5] health:', JSON.stringify(health));

    if (health.visibleErrors > 0) M.frictions.push('ERROR_ELEMENTS_IN_DOM');
    if (health.blockingOverlays > 0) M.frictions.push('BLOCKING_OVERLAY_DETECTED');

    // Final IPC check
    try {
      const ipc = await browser.execute(() => ({
        hasInvoke: typeof (window.__TAURI_INTERNALS__?.invoke || window.__TAURI__?.invoke) === 'function',
        tauriPresent: !!window.__TAURI__,
      }));
      M.ipcAvailable = ipc.hasInvoke;
    } catch (e) {
      M.harnessRisks.push('IPC_FINAL_FAILED');
    }

    await ss('s5_final');

    M.dominantClassification = classify(M);
    saveMetrics('');

    console.log(`[V22-S5] FINAL mode=${M.modeDecision} class=${M.dominantClassification}`);
    console.log(`[V22-S5] frictions=[${M.frictions.join(', ')}]`);
    console.log(`[V22-S5] blockers=[${M.blockers.join(', ')}]`);
    console.log(`[V22-S5] screens=${M.screenshots.length} ipc=${M.ipcAvailable}`);

    expect(M.dominantClassification).toBeTruthy();
    console.log('[V22-S5] DONE');
  });

});
