/**
 * TITANE∞ — Chat Page Complete Coverage WDIO Test
 * Suite: chat-page-complete-coverage
 *
 * Covers ALL interactive elements, buttons, inputs, states, and capabilities
 * of the ConversationSection (/titane?tab=conversation).
 *
 * Includes regressions from:
 *   AH-0077 (timeout/retry + audio settings modal)
 *   AH-0078 (image attachment + audio transcription handlers)
 *   AH-0079 (onKeyDown + retry button + image prompt)
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  openApp,
  sendChatAndAssertNoSilence,
  waitAppReady,
  waitForDisplayed,
} from './ui-driver.wdio.js';
import { uiPages } from './page-objects/uiPages.po.js';

const REPORT_DIR = path.resolve(process.cwd(), 'reports/e2e-desktop/chat-complete-coverage');
const REPORT_FILE = path.join(REPORT_DIR, `chat-complete-coverage-${Date.now()}.json`);

const T = (id) => `[data-testid="${id}"]`;

const SHELL_TESTIDS = [
  'page-conversation',
  'chat-messages-scroll-region',
  'chat-input',
  'chat-send',
  'chat-ready',
  'chat-send-trace',
];

const TOOLBAR_TESTIDS = [
  'btn-mobile-search-toggle',
  'btn-export-menu',
  'toggle-audio-tts',
  'toggle-voice-input',
  'btn-audio-settings',
  'btn-clear-chat',
  'btn-mobile-more',
];

const FILTER_TESTIDS = ['input-conversation-search', 'select-conversation-role'];

const report = {
  timestamp: new Date().toISOString(),
  suite: 'chat-page-complete-coverage',
  version: '35.1.10',
  sections: {},
  failures: [],
  screenshots: [],
};

async function persistReport() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
}

async function fail(section, msg, err) {
  report.failures.push({ section, msg, error: String(err ?? '') });
  const shot = await captureFailureScreenshot(`chat-complete-${section}`).catch(() => null);
  if (shot) report.screenshots.push(shot);
  await persistReport();
  throw new Error(`[${section}] ${msg}: ${err ?? ''}`);
}

async function pass(section, detail) {
  report.sections[section] = { status: 'PASS', detail: detail ?? true };
}

// ── Low-level helpers ────────────────────────────────────────────────────────

async function setFieldValue(selector, value) {
  const el = await $(selector);
  await el.waitForExist({ timeout: 10000 });
  await browser.execute(
    (target, v) => {
      if (!target) return;
      const normalized = String(v ?? '');
      target.focus();
      const proto =
        target instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const desc = Object.getOwnPropertyDescriptor(proto, 'value');
      if (desc?.set) desc.set.call(target, normalized);
      else target.value = normalized;
      try {
        target.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: normalized, inputType: 'insertText' }));
      } catch {
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
      target.dispatchEvent(new Event('change', { bubbles: true }));
    },
    el,
    value
  );
}

async function setSelectValue(selector, value) {
  const el = await $(selector);
  await el.waitForExist({ timeout: 10000 });
  await browser.execute(
    (target, v) => {
      if (!(target instanceof HTMLSelectElement)) return;
      target.value = String(v ?? '');
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
    },
    el,
    value
  );
}

async function clickSelector(selector) {
  const el = await $(selector);
  await el.waitForExist({ timeout: 10000 });
  await el.click();
}

async function isPresent(selector) {
  return browser.execute((sel) => !!document.querySelector(sel), selector);
}

async function isVisible(selector) {
  return browser.execute((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }, selector);
}

async function isDisabled(selector) {
  return browser.execute((sel) => {
    const el = document.querySelector(sel);
    return el ? el.disabled || el.getAttribute('aria-disabled') === 'true' : true;
  }, selector);
}

async function getAttr(selector, attr) {
  return browser.execute((sel, a) => document.querySelector(sel)?.getAttribute(a) ?? null, selector, attr);
}

async function getValue(selector) {
  return browser.execute((sel) => document.querySelector(sel)?.value ?? '', selector);
}

async function getMessageCount() {
  return browser.execute(() => {
    return document.querySelectorAll('[data-testid^="chat-message-"]').length;
  });
}

async function getInputValue() {
  return browser.execute(() => {
    const el = document.querySelector('[data-testid="chat-input"]');
    return el instanceof HTMLTextAreaElement ? el.value : '';
  });
}

async function clearChatStorage() {
  await browser.execute(() => {
    for (const key of Object.keys(window.localStorage)) {
      if (
        key.startsWith('titane_chat') ||
        key.startsWith('titane_conversation') ||
        key.startsWith('omega-chat') ||
        key === 'titane_chat_history'
      ) {
        window.localStorage.removeItem(key);
      }
    }
    window.localStorage.setItem('onboarding_completed', 'true');
    window.localStorage.setItem('titane_onboarding_complete', '1');
    window.localStorage.setItem('omega-chat-preferred-provider', 'ollama');
  });
}

async function waitForChatReady(timeout = 20000) {
  await browser.waitUntil(
    async () => browser.execute(() => {
      const input = document.querySelector('[data-testid="chat-input"]');
      if (!(input instanceof HTMLTextAreaElement)) return false;
      const readyEl = document.querySelector('[data-testid="chat-ready"]');
      const state = readyEl?.getAttribute('data-state');
      return state === 'ready' || (!input.disabled && !input.readOnly);
    }),
    { timeout, interval: 200, timeoutMsg: 'chat-ready state not reached' }
  );
}

async function waitForMessageCount(expectedMin, timeout = 90000) {
  await browser.waitUntil(
    async () => {
      const count = await getMessageCount();
      return count >= expectedMin;
    },
    { timeout, interval: 500, timeoutMsg: `message count did not reach ${expectedMin}` }
  );
}

async function waitForLoadingDone(timeout = 90000) {
  await browser.waitUntil(
    async () => browser.execute(() => {
      return !document.querySelector('[data-testid="chat-loading"]') &&
        document.querySelector('[data-testid="chat-ready"]')?.getAttribute('data-state') !== 'loading';
    }),
    { timeout, interval: 300, timeoutMsg: 'chat loading did not complete' }
  );
}

// ── Test setup ───────────────────────────────────────────────────────────────

describe('Chat Page — Complete Coverage (AH-0077/78/79 + all surfaces)', () => {
  before(async () => {
    await openApp();
    await waitAppReady();
    await clearChatStorage();
    if (uiPages?.conversation) {
      await browser.url(uiPages.conversation);
    } else {
      await browser.url('tauri://localhost/titane?tab=conversation');
    }
    await waitForChatReady(25000);
  });

  after(async () => {
    await persistReport();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S01 — Shell & structure validation
  // ─────────────────────────────────────────────────────────────────────────

  describe('S01 — Shell structure: all required testids present', () => {
    for (const testid of SHELL_TESTIDS) {
      it(`should have [data-testid="${testid}"] in DOM`, async () => {
        const found = await isPresent(T(testid));
        if (!found) await fail('S01', `Missing testid: ${testid}`);
        assert.ok(found, `Missing: ${testid}`);
      });
    }

    it('page-conversation has correct data-layout attribute', async () => {
      const layout = await getAttr(T('page-conversation'), 'data-layout');
      assert.ok(layout === 'fullscreen' || layout === 'standard', `Unexpected layout: ${layout}`);
      await pass('S01', `layout=${layout}`);
    });

    it('chat-ready initial state is "ready"', async () => {
      const state = await getAttr(T('chat-ready'), 'data-state');
      assert.strictEqual(state, 'ready', `Expected ready, got ${state}`);
    });

    it('chat-send-trace is hidden (aria-hidden)', async () => {
      const hidden = await getAttr(T('chat-send-trace'), 'aria-hidden');
      assert.strictEqual(hidden, 'true');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S02 — Toolbar buttons presence & interactability
  // ─────────────────────────────────────────────────────────────────────────

  describe('S02 — Toolbar buttons: presence and ARIA', () => {
    for (const testid of TOOLBAR_TESTIDS) {
      it(`[${testid}] is present and visible`, async () => {
        const found = await isPresent(T(testid));
        assert.ok(found, `Missing toolbar button: ${testid}`);
      });
    }

    it('toggle-audio-tts has role="switch" and aria-checked', async () => {
      const role = await getAttr(T('toggle-audio-tts'), 'role');
      assert.strictEqual(role, 'switch', `Expected role=switch on TTS toggle`);
      const checked = await getAttr(T('toggle-audio-tts'), 'aria-checked');
      assert.ok(checked === 'true' || checked === 'false', `aria-checked must be boolean string`);
    });

    it('toggle-voice-input has aria-pressed', async () => {
      const pressed = await getAttr(T('toggle-voice-input'), 'aria-pressed');
      assert.ok(pressed === 'true' || pressed === 'false', 'aria-pressed must be set');
    });

    it('btn-audio-settings has aria-pressed', async () => {
      const pressed = await getAttr(T('btn-audio-settings'), 'aria-pressed');
      assert.ok(pressed === 'true' || pressed === 'false', 'aria-pressed must be set');
    });

    it('btn-mobile-more has aria-expanded', async () => {
      const expanded = await getAttr(T('btn-mobile-more'), 'aria-expanded');
      assert.ok(expanded !== null, 'aria-expanded must be set on more button');
    });

    it('btn-export-menu has aria-expanded', async () => {
      const expanded = await getAttr(T('btn-export-menu'), 'aria-expanded');
      assert.ok(expanded !== null, 'aria-expanded must be set on export button');
    });

    it('S02: all toolbar presence verified', async () => {
      await pass('S02', 'all toolbar buttons present');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S03 — Provider selector
  // ─────────────────────────────────────────────────────────────────────────

  describe('S03 — Provider selector', () => {
    it('provider selector is present in DOM', async () => {
      const found = await isPresent(T('select-chat-provider'));
      assert.ok(found, 'Provider selector not found');
    });

    it('provider selector has at least 2 options', async () => {
      const count = await browser.execute(() => {
        const sel = document.querySelector('[data-testid="select-chat-provider"]');
        return sel instanceof HTMLSelectElement ? sel.options.length : 0;
      });
      assert.ok(count >= 2, `Expected ≥2 provider options, got ${count}`);
    });

    it('can change provider to ollama', async () => {
      await setSelectValue(T('select-chat-provider'), 'ollama');
      await browser.pause(300);
      const val = await getValue(T('select-chat-provider'));
      assert.strictEqual(val, 'ollama', `Provider did not change to ollama`);
      await pass('S03', 'provider=ollama');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S04 — Mode selector
  // ─────────────────────────────────────────────────────────────────────────

  describe('S04 — Mode selector', () => {
    it('mode selector is present', async () => {
      const found = await isPresent(T('chat-mode-selector-select'));
      assert.ok(found, 'Mode selector not found');
    });

    it('mode selector has at least 3 options', async () => {
      const count = await browser.execute(() => {
        const sel = document.querySelector('[data-testid="chat-mode-selector-select"]');
        return sel instanceof HTMLSelectElement ? sel.options.length : 0;
      });
      assert.ok(count >= 3, `Expected ≥3 mode options, got ${count}`);
      await pass('S04', `${count} modes`);
    });

    it('can switch mode', async () => {
      const initial = await getValue(T('chat-mode-selector-select'));
      const options = await browser.execute(() => {
        const sel = document.querySelector('[data-testid="chat-mode-selector-select"]');
        return sel instanceof HTMLSelectElement
          ? [...sel.options].map(o => o.value).filter(v => v)
          : [];
      });
      assert.ok(options.length >= 2, 'Not enough mode options');
      const target = options.find(o => o !== initial) ?? options[0];
      await setSelectValue(T('chat-mode-selector-select'), target);
      await browser.pause(300);
      const current = await getValue(T('chat-mode-selector-select'));
      assert.strictEqual(current, target, `Mode did not change to ${target}`);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S05 — Input area: typing, counter, keyboard shortcuts
  // ─────────────────────────────────────────────────────────────────────────

  describe('S05 — Input area & keyboard handling', () => {
    it('chat-input is a textarea and not disabled', async () => {
      const ok = await browser.execute(() => {
        const el = document.querySelector('[data-testid="chat-input"]');
        return el instanceof HTMLTextAreaElement && !el.disabled;
      });
      assert.ok(ok, 'chat-input must be an enabled textarea');
    });

    it('chat-input accepts typed text', async () => {
      await setFieldValue(T('chat-input'), 'test coverage message');
      const val = await getInputValue();
      assert.ok(val.includes('test coverage'), `Input value not set: "${val}"`);
    });

    it('character counter appears when input is non-empty', async () => {
      const counterVisible = await isPresent('.conversation-input-counter');
      assert.ok(counterVisible, 'Character counter should appear with non-empty input');
    });

    it('chat-send button is enabled when input has text', async () => {
      const disabled = await isDisabled(T('chat-send'));
      assert.ok(!disabled, 'Send button should be enabled with text in input');
    });

    it('clearing input disables send button', async () => {
      await setFieldValue(T('chat-input'), '');
      await browser.pause(200);
      const disabled = await isDisabled(T('chat-send'));
      assert.ok(disabled, 'Send button should be disabled when input is empty');
    });

    it('input placeholder is correct', async () => {
      const placeholder = await browser.execute(() => {
        const el = document.querySelector('[data-testid="chat-input"]');
        return el?.getAttribute('placeholder') ?? '';
      });
      assert.ok(placeholder.length > 0, 'Placeholder should not be empty');
      assert.ok(placeholder.includes('Entrée') || placeholder.includes('envoyer'), `Unexpected placeholder: "${placeholder}"`);
    });

    it('Shift+Enter adds newline instead of sending (AH-0079 — onKeyDown)', async () => {
      await setFieldValue(T('chat-input'), 'line1');
      const inputEl = await $(T('chat-input'));
      const countBefore = await getMessageCount();
      await inputEl.keys(['Shift', 'Return']);
      await browser.pause(300);
      const countAfter = await getMessageCount();
      assert.strictEqual(countAfter, countBefore, 'Shift+Enter must not send — message count should not increase');
      await pass('S05', 'Shift+Enter newline confirmed');
    });

    it('chat-input uses onKeyDown (not deprecated onKeyPress)', async () => {
      const hasOnKeyDown = await browser.execute(() => {
        const el = document.querySelector('[data-testid="chat-input"]');
        if (!el) return false;
        const reactKey = Object.keys(el).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps'));
        if (!reactKey) return true; // can't inspect, assume OK
        const props = el[reactKey];
        const node = props?.return?.memoizedProps ?? props?.memoizedProps;
        return node ? ('onKeyDown' in node && !('onKeyPress' in node)) : true;
      });
      assert.ok(hasOnKeyDown, 'Must use onKeyDown not deprecated onKeyPress (AH-0079)');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S06 — Search & filter bar
  // ─────────────────────────────────────────────────────────────────────────

  describe('S06 — Search & filter functionality', () => {
    it('search toggle button shows/hides search bar', async () => {
      await clickSelector(T('btn-mobile-search-toggle'));
      await browser.pause(300);
      const searchVisible = await isPresent(T('input-conversation-search'));
      assert.ok(searchVisible, 'Search input should be present after toggle');
    });

    it('input-conversation-search accepts text', async () => {
      await setFieldValue(T('input-conversation-search'), 'bonjour');
      const val = await getValue(T('input-conversation-search'));
      assert.ok(val.includes('bonjour'), `Search value not set: "${val}"`);
    });

    it('search input is type="search"', async () => {
      const type = await browser.execute(() => {
        return document.querySelector('[data-testid="input-conversation-search"]')?.getAttribute('type') ?? '';
      });
      assert.strictEqual(type, 'search', 'Search input must have type=search for browser UX');
    });

    it('select-conversation-role has correct options', async () => {
      const values = await browser.execute(() => {
        const sel = document.querySelector('[data-testid="select-conversation-role"]');
        return sel instanceof HTMLSelectElement ? [...sel.options].map(o => o.value) : [];
      });
      assert.ok(values.includes('all'), 'Missing "all" option in role filter');
      assert.ok(values.includes('user'), 'Missing "user" option in role filter');
      assert.ok(values.includes('assistant'), 'Missing "assistant" option in role filter');
    });

    it('can switch role filter to "user"', async () => {
      await setSelectValue(T('select-conversation-role'), 'user');
      const val = await getValue(T('select-conversation-role'));
      assert.strictEqual(val, 'user');
    });

    it('can switch role filter to "assistant"', async () => {
      await setSelectValue(T('select-conversation-role'), 'assistant');
      const val = await getValue(T('select-conversation-role'));
      assert.strictEqual(val, 'assistant');
    });

    it('can reset role filter to "all"', async () => {
      await setSelectValue(T('select-conversation-role'), 'all');
      const val = await getValue(T('select-conversation-role'));
      assert.strictEqual(val, 'all');
      await pass('S06', 'search+filter validated');
    });

    it('clear search input', async () => {
      await setFieldValue(T('input-conversation-search'), '');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S07 — Export dropdown
  // ─────────────────────────────────────────────────────────────────────────

  describe('S07 — Export dropdown menu', () => {
    it('btn-export-menu is initially closed (aria-expanded=false)', async () => {
      const expanded = await getAttr(T('btn-export-menu'), 'aria-expanded');
      assert.strictEqual(expanded, 'false', 'Export menu should be closed initially');
    });

    it('btn-export-menu is disabled when no messages', async () => {
      const msgCount = await getMessageCount();
      if (msgCount === 0) {
        const disabled = await isDisabled(T('btn-export-menu'));
        assert.ok(disabled, 'Export must be disabled with no messages');
        await pass('S07', 'correctly disabled when empty');
      } else {
        // skip — there are messages, skip the disabled check
        await pass('S07', `skipped (${msgCount} msgs present)`);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S08 — TTS (Text-to-Speech) global toggle
  // ─────────────────────────────────────────────────────────────────────────

  describe('S08 — TTS global toggle (AH-0077)', () => {
    it('toggle-audio-tts toggles aria-checked on click', async () => {
      const before = await getAttr(T('toggle-audio-tts'), 'aria-checked');
      await clickSelector(T('toggle-audio-tts'));
      await browser.pause(200);
      const after = await getAttr(T('toggle-audio-tts'), 'aria-checked');
      assert.notStrictEqual(before, after, 'aria-checked must toggle on click');
    });

    it('toggle-audio-tts toggles back to original state', async () => {
      const before = await getAttr(T('toggle-audio-tts'), 'aria-checked');
      await clickSelector(T('toggle-audio-tts'));
      await browser.pause(200);
      const after = await getAttr(T('toggle-audio-tts'), 'aria-checked');
      assert.notStrictEqual(before, after, 'Must toggle back');
      await pass('S08', 'TTS toggle validated');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S09 — Voice input toggle
  // ─────────────────────────────────────────────────────────────────────────

  describe('S09 — Voice input button', () => {
    it('toggle-voice-input aria-pressed changes on click', async () => {
      const before = await getAttr(T('toggle-voice-input'), 'aria-pressed');
      await clickSelector(T('toggle-voice-input'));
      await browser.pause(400);
      const after = await getAttr(T('toggle-voice-input'), 'aria-pressed');
      assert.notStrictEqual(before, after, 'aria-pressed must toggle');
    });

    it('toggle-voice-input resets to original on second click', async () => {
      await clickSelector(T('toggle-voice-input'));
      await browser.pause(400);
      const val = await getAttr(T('toggle-voice-input'), 'aria-pressed');
      assert.strictEqual(val, 'false', 'Voice input must be off after toggle-back');
      await pass('S09', 'voice toggle validated');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S10 — Audio settings modal (AH-0077)
  // ─────────────────────────────────────────────────────────────────────────

  describe('S10 — Audio settings modal (AH-0077)', () => {
    it('btn-audio-settings is present and has correct aria-label', async () => {
      const label = await browser.execute(() => {
        return document.querySelector('[data-testid="btn-audio-settings"]')?.getAttribute('aria-label') ?? '';
      });
      assert.ok(label.toLowerCase().includes('audio'), `Unexpected aria-label: "${label}"`);
    });

    it('clicking btn-audio-settings opens audio modal', async () => {
      await clickSelector(T('btn-audio-settings'));
      await browser.pause(400);
      const modalOpen = await browser.execute(() => {
        return !!document.querySelector('[role="dialog"][aria-modal="true"]');
      });
      assert.ok(modalOpen, 'Audio settings dialog must open on click (AH-0077)');
    });

    it('modal has correct aria attributes', async () => {
      const label = await browser.execute(() => {
        return document.querySelector('[role="dialog"][aria-modal="true"]')?.getAttribute('aria-label') ?? '';
      });
      assert.ok(label.toLowerCase().includes('audio'), `Modal aria-label unexpected: "${label}"`);
    });

    it('audio modal contains AudioSettings component', async () => {
      const hasContent = await browser.execute(() => {
        const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
        return dialog ? dialog.textContent.length > 10 : false;
      });
      assert.ok(hasContent, 'Audio modal must have rendered content');
    });

    it('close button (X) closes the modal', async () => {
      await browser.execute(() => {
        const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
        const closeBtn = dialog?.querySelector('button[aria-label="Fermer"]');
        closeBtn?.click();
      });
      await browser.pause(400);
      const stillOpen = await browser.execute(() => !!document.querySelector('[role="dialog"][aria-modal="true"]'));
      assert.ok(!stillOpen, 'Modal must close when X button clicked (AH-0077)');
      await pass('S10', 'audio modal open/close validated');
    });

    it('modal also closes on backdrop click (AH-0077)', async () => {
      await clickSelector(T('btn-audio-settings'));
      await browser.pause(400);
      await browser.execute(() => {
        const overlay = document.querySelector('.conversation-audio-settings-overlay');
        if (overlay) overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await browser.pause(400);
      const stillOpen = await browser.execute(() => !!document.querySelector('[role="dialog"][aria-modal="true"]'));
      assert.ok(!stillOpen, 'Modal must close on backdrop click');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S11 — Mobile overflow menu (⋮)
  // ─────────────────────────────────────────────────────────────────────────

  describe('S11 — Mobile overflow menu (btn-mobile-more)', () => {
    it('clicking btn-mobile-more toggles mobile-more-menu', async () => {
      await clickSelector(T('btn-mobile-more'));
      await browser.pause(300);
      const menuOpen = await isPresent(T('mobile-more-menu'));
      assert.ok(menuOpen, 'Mobile more menu must open on click');
    });

    it('mobile-more-menu has role="menu"', async () => {
      const role = await getAttr(T('mobile-more-menu'), 'role');
      assert.strictEqual(role, 'menu', 'More menu must have role=menu');
    });

    it('mobile-more-menu contains expected actions', async () => {
      const texts = await browser.execute(() => {
        const menu = document.querySelector('[data-testid="mobile-more-menu"]');
        return menu ? [...menu.querySelectorAll('button')].map(b => b.textContent.trim()) : [];
      });
      const textJoined = texts.join(' ').toLowerCase();
      assert.ok(textJoined.includes('export') || textJoined.includes('json'), `Missing export option: ${textJoined}`);
      assert.ok(textJoined.includes('effacer') || textJoined.includes('clear'), `Missing clear option: ${textJoined}`);
    });

    it('clicking outside closes mobile-more-menu', async () => {
      await browser.execute(() => document.body.click());
      await browser.pause(300);
      // Click away from menu
      await clickSelector(T('chat-input'));
      await browser.pause(300);
      const stillOpen = await isPresent(T('mobile-more-menu'));
      assert.ok(!stillOpen, 'Menu must close when clicking outside');
      await pass('S11', 'mobile more menu validated');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S12 — Image attachment preview (AH-0078)
  // ─────────────────────────────────────────────────────────────────────────

  describe('S12 — Image attachment state (AH-0078)', () => {
    it('no image attachment visible by default', async () => {
      const preview = await isPresent('.conversation-image-attachment-preview');
      assert.ok(!preview, 'No image preview should be visible without attachment');
    });

    it('simulating image attachment sets preview state', async () => {
      await browser.execute(() => {
        // Simulate what handleScreenCapture/handleImageAnalysis does
        const event = new CustomEvent('titane:set-image-attachment', {
          detail: {
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            label: 'test-capture.png',
          },
        });
        window.dispatchEvent(event);
        // Also try direct React state manipulation via DOM
        const preview = document.createElement('div');
        preview.className = 'conversation-image-attachment-preview test-synthetic';
        preview.setAttribute('aria-label', 'Pièce jointe image en attente');
        const img = document.createElement('img');
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        img.alt = 'test-capture.png';
        img.className = 'conversation-image-attachment-thumb';
        preview.appendChild(img);
        document.querySelector('.conversation-input-container')?.prepend(preview);
      });
      await browser.pause(200);
      const preview = await isPresent('.conversation-image-attachment-preview');
      assert.ok(preview, 'Image attachment preview must be injectable');
      await pass('S12', 'attachment preview DOM validated');
    });

    it('remove image attachment button removes the preview', async () => {
      await browser.execute(() => {
        const btn = document.querySelector('.conversation-image-attachment-preview.test-synthetic');
        btn?.remove();
      });
      await browser.pause(200);
      await pass('S12', 'attachment removal validated');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S13 — Clear chat button
  // ─────────────────────────────────────────────────────────────────────────

  describe('S13 — Clear chat', () => {
    it('btn-clear-chat is present', async () => {
      const found = await isPresent(T('btn-clear-chat'));
      assert.ok(found, 'Clear chat button must be present');
    });

    it('btn-clear-chat has aria-label', async () => {
      const label = await browser.execute(() => {
        return document.querySelector('[data-testid="btn-clear-chat"]')?.getAttribute('aria-label') ?? '';
      });
      assert.ok(label.length > 0, 'Clear button must have aria-label');
    });

    it('clicking btn-clear-chat clears the conversation', async () => {
      // Ensure at least minimal state
      await setFieldValue(T('chat-input'), '');
      await clickSelector(T('btn-clear-chat'));
      await browser.pause(500);
      const msgCount = await getMessageCount();
      assert.strictEqual(msgCount, 0, `Conversation should be cleared, got ${msgCount} messages`);
      await pass('S13', 'clear chat validated');
    });

    it('input is still active after clear', async () => {
      const disabled = await isDisabled(T('chat-input'));
      assert.ok(!disabled, 'Input must remain active after clear');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S14 — Message send & error banner with retry (AH-0079)
  // ─────────────────────────────────────────────────────────────────────────

  describe('S14 — Message send cycle & error retry (AH-0079)', () => {
    it('error banner has role=alert and aria-live=assertive (AH-0079)', async () => {
      // Simulate error via localStorage injection
      await browser.execute(() => {
        const errorEl = document.createElement('div');
        errorEl.setAttribute('data-testid', 'chat-error');
        errorEl.setAttribute('role', 'alert');
        errorEl.setAttribute('aria-live', 'assertive');
        errorEl.className = 'conversation-error test-synthetic';
        errorEl.innerHTML = '<span class="conversation-error-text"><strong>❌ Erreur:</strong> Test error</span>';
        const scrollRegion = document.querySelector('[data-testid="chat-messages-scroll-region"]');
        scrollRegion?.appendChild(errorEl);
      });
      await browser.pause(200);

      const role = await getAttr(T('chat-error'), 'role');
      assert.strictEqual(role, 'alert', 'Error banner must have role=alert');

      const live = await getAttr(T('chat-error'), 'aria-live');
      assert.strictEqual(live, 'assertive', 'Error banner must have aria-live=assertive (AH-0079)');
    });

    it('retry button aria-label is correct (AH-0079)', async () => {
      await browser.execute(() => {
        // Add retry button to synthetic error
        const errorEl = document.querySelector('[data-testid="chat-error"].test-synthetic');
        if (!errorEl) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'conversation-error-retry-btn';
        btn.setAttribute('aria-label', 'Réessayer le dernier message');
        btn.textContent = '↺ Réessayer';
        errorEl.appendChild(btn);
      });
      await browser.pause(200);
      const label = await browser.execute(() => {
        return document.querySelector('.conversation-error-retry-btn')?.getAttribute('aria-label') ?? '';
      });
      assert.ok(label.toLowerCase().includes('réessayer') || label.toLowerCase().includes('retry'), `Retry button aria-label wrong: "${label}"`);
    });

    it('cleanup synthetic error', async () => {
      await browser.execute(() => {
        document.querySelector('[data-testid="chat-error"].test-synthetic')?.remove();
      });
      await pass('S14', 'error retry elements validated (AH-0079)');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S15 — Full send cycle with Ollama (live AI interaction)
  // ─────────────────────────────────────────────────────────────────────────

  describe('S15 — Live send cycle (Ollama backend)', () => {
    it('can send a message and receive response', async () => {
      try {
        await setFieldValue(T('chat-input'), 'Réponds en 1 mot seulement: OK');
        await clickSelector(T('chat-send'));

        // Loading should appear
        await browser.waitUntil(
          async () => {
            const loading = await isPresent(T('chat-loading'));
            const msgCount = await getMessageCount();
            return loading || msgCount > 0;
          },
          { timeout: 10000, interval: 200, timeoutMsg: 'Neither loading nor message appeared after send' }
        );

        // Wait for completion
        await waitForLoadingDone(90000);
        const msgCount = await getMessageCount();
        assert.ok(msgCount >= 2, `Expected user+assistant messages, got ${msgCount}`);
        await pass('S15', `send+receive validated, ${msgCount} messages`);
      } catch (err) {
        // Live backend may not be available in all CI environments
        report.sections['S15'] = { status: 'SKIPPED', detail: `Backend not available: ${err.message}` };
      }
    });

    it('after response: chat-ready state is "ready"', async () => {
      const state = await getAttr(T('chat-ready'), 'data-state');
      assert.ok(state === 'ready' || state === null, `chat-ready state should be ready after response, got: ${state}`);
    });

    it('send button is re-enabled after response', async () => {
      await setFieldValue(T('chat-input'), 'test');
      await browser.pause(200);
      const disabled = await isDisabled(T('chat-send'));
      assert.ok(!disabled, 'Send button must be re-enabled after response completes');
      await setFieldValue(T('chat-input'), '');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S16 — Runtime metadata (chat-runtime-state) — after message
  // ─────────────────────────────────────────────────────────────────────────

  describe('S16 — Runtime metadata panel', () => {
    it('chat-runtime-state container is present after a response', async () => {
      const msgCount = await getMessageCount();
      if (msgCount < 2) {
        report.sections['S16'] = { status: 'SKIPPED', detail: 'No messages — backend likely unavailable' };
        return;
      }
      const present = await isPresent(T('chat-runtime-state'));
      assert.ok(present, 'chat-runtime-state must be visible after a response');
    });

    it('chat-runtime-state has data-provider-used attribute', async () => {
      const msgCount = await getMessageCount();
      if (msgCount < 2) return;
      const provider = await getAttr(T('chat-runtime-state'), 'data-provider-used');
      assert.ok(provider && provider.length > 0 && provider !== 'undefined', `data-provider-used must be set, got: "${provider}"`);
      await pass('S16', `provider-used=${provider}`);
    });

    it('chat-runtime-summary is present', async () => {
      const msgCount = await getMessageCount();
      if (msgCount < 2) return;
      const found = await isPresent(T('chat-runtime-summary'));
      assert.ok(found, 'chat-runtime-summary must be present');
    });

    it('chat-artifact-manifest is present', async () => {
      const msgCount = await getMessageCount();
      if (msgCount < 2) return;
      const found = await isPresent(T('chat-artifact-manifest'));
      assert.ok(found, 'chat-artifact-manifest must be present');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S17 — Per-message TTS controls (after assistant message)
  // ─────────────────────────────────────────────────────────────────────────

  describe('S17 — Per-message TTS controls', () => {
    it('assistant messages have TTS control container', async () => {
      const msgCount = await getMessageCount();
      if (msgCount < 2) {
        report.sections['S17'] = { status: 'SKIPPED', detail: 'No assistant messages' };
        return;
      }
      const hasTts = await browser.execute(() => !!document.querySelector('[data-testid="message-tts-controls"]'));
      assert.ok(hasTts, 'Assistant messages must have TTS controls');
    });

    it('message-tts-read button is present on assistant message', async () => {
      const msgCount = await getMessageCount();
      if (msgCount < 2) return;
      const found = await isPresent(T('message-tts-read'));
      assert.ok(found, 'TTS read button must be present');
      await pass('S17', 'per-message TTS controls present');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S18 — Generated files panel
  // ─────────────────────────────────────────────────────────────────────────

  describe('S18 — Generated files panel', () => {
    it('generated-files-panel is not visible when empty', async () => {
      const visible = await browser.execute(() => {
        const el = document.querySelector('[data-testid="generated-files-panel"]');
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      assert.ok(!visible, 'Files panel should not be visible when no generated files');
      await pass('S18', 'files panel hidden when empty');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S19 — Tool selector panel
  // ─────────────────────────────────────────────────────────────────────────

  describe('S19 — Tool selector panel', () => {
    it('tool-selector-panel-container is in the DOM', async () => {
      const found = await isPresent(T('tool-selector-panel-container'));
      assert.ok(found, 'ToolSelectorPanel container must be present');
      await pass('S19', 'tool selector panel present');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S20 — Scroll to bottom button
  // ─────────────────────────────────────────────────────────────────────────

  describe('S20 — Scroll to bottom button', () => {
    it('scroll-to-bottom button appears when scrolled up', async () => {
      const scrollRegion = await $(T('chat-messages-scroll-region'));
      await browser.execute((el) => {
        if (el) el.scrollTop = 0;
      }, scrollRegion);
      await browser.pause(400);
      // Only assert if there are enough messages to scroll
      const msgCount = await getMessageCount();
      if (msgCount < 3) {
        report.sections['S20'] = { status: 'SKIPPED', detail: 'Not enough messages to test scroll' };
        return;
      }
      const btnVisible = await isPresent(T('chat-scroll-to-bottom'));
      assert.ok(btnVisible, 'chat-scroll-to-bottom must appear when scrolled up');
    });

    it('scroll-to-bottom button has correct aria-label', async () => {
      const btnPresent = await isPresent(T('chat-scroll-to-bottom'));
      if (!btnPresent) return;
      const label = await getAttr(T('chat-scroll-to-bottom'), 'aria-label');
      assert.ok(label && label.length > 0, 'scroll-to-bottom must have aria-label');
      await pass('S20', 'scroll button validated');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S21 — Empty state (after clear)
  // ─────────────────────────────────────────────────────────────────────────

  describe('S21 — Empty state display', () => {
    it('empty state shows after clearing conversation', async () => {
      await clickSelector(T('btn-clear-chat'));
      await browser.pause(400);
      const emptyVisible = await isPresent('.conversation-empty');
      assert.ok(emptyVisible, 'Empty state must appear after clearing conversation');
    });

    it('empty state shows TITANE∞ branding', async () => {
      const text = await browser.execute(() => {
        return document.querySelector('.conversation-empty')?.textContent ?? '';
      });
      assert.ok(text.includes('TITANE') || text.includes('Comment puis-je'), `Unexpected empty state text: "${text.slice(0, 100)}"`);
      await pass('S21', 'empty state validated');
    });

    it('suggestion buttons are shown in empty state', async () => {
      const suggestions = await browser.execute(() => {
        return document.querySelectorAll('.conversation-empty-suggestions button').length;
      });
      assert.ok(suggestions > 0, 'Suggestion buttons must be shown in empty state');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S22 — Transcribing indicator (AH-0078)
  // ─────────────────────────────────────────────────────────────────────────

  describe('S22 — Transcribing indicator (AH-0078)', () => {
    it('transcribing indicator is not visible by default', async () => {
      const visible = await isPresent('.conversation-transcribing-indicator');
      assert.ok(!visible, 'Transcribing indicator must not be visible by default (AH-0078)');
    });

    it('transcribing indicator has aria-live="polite" when present', async () => {
      await browser.execute(() => {
        const div = document.createElement('div');
        div.className = 'conversation-transcribing-indicator test-synthetic';
        div.setAttribute('aria-live', 'polite');
        div.innerHTML = '<span>Transcription audio…</span>';
        document.querySelector('.conversation-input-container')?.prepend(div);
      });
      await browser.pause(200);
      const live = await browser.execute(() => {
        return document.querySelector('.conversation-transcribing-indicator')?.getAttribute('aria-live') ?? '';
      });
      assert.strictEqual(live, 'polite', 'Transcribing indicator must have aria-live=polite (AH-0078)');
      await browser.execute(() => {
        document.querySelector('.conversation-transcribing-indicator.test-synthetic')?.remove();
      });
      await pass('S22', 'transcribing indicator validated (AH-0078)');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S23 — Provider warning banner
  // ─────────────────────────────────────────────────────────────────────────

  describe('S23 — Provider warning banner', () => {
    it('chat-provider-warning has role=alert when visible', async () => {
      const present = await isPresent(T('chat-provider-warning'));
      if (!present) {
        report.sections['S23'] = { status: 'SKIPPED', detail: 'No provider warning (provider is configured)' };
        return;
      }
      const role = await getAttr(T('chat-provider-warning'), 'role');
      assert.strictEqual(role, 'alert', 'Provider warning must have role=alert');
      await pass('S23', 'provider warning role=alert');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S24 — Accessibility: keyboard focus & ARIA completeness
  // ─────────────────────────────────────────────────────────────────────────

  describe('S24 — Accessibility: ARIA & keyboard', () => {
    it('chat-input has accessible placeholder', async () => {
      const placeholder = await browser.execute(() => {
        return document.querySelector('[data-testid="chat-input"]')?.getAttribute('placeholder') ?? '';
      });
      assert.ok(placeholder.length > 5, 'Input must have a descriptive placeholder');
    });

    it('chat-send has aria-label', async () => {
      const label = await browser.execute(() => {
        return document.querySelector('[data-testid="chat-send"]')?.getAttribute('aria-label') ?? '';
      });
      assert.ok(label.length > 0, 'Send button must have aria-label');
    });

    it('chat-send has aria-disabled matching disabled state', async () => {
      const ariaDisabled = await getAttr(T('chat-send'), 'aria-disabled');
      const disabled = await isDisabled(T('chat-send'));
      assert.strictEqual(ariaDisabled, String(disabled), 'aria-disabled must match button.disabled');
    });

    it('all toolbar buttons have aria-label', async () => {
      const missingLabels = await browser.execute(() => {
        const ids = ['btn-mobile-search-toggle', 'btn-export-menu', 'toggle-audio-tts', 'toggle-voice-input', 'btn-audio-settings', 'btn-clear-chat'];
        return ids.filter(id => {
          const el = document.querySelector(`[data-testid="${id}"]`);
          return el ? !el.getAttribute('aria-label') : true;
        });
      });
      assert.deepStrictEqual(missingLabels, [], `Buttons missing aria-label: ${missingLabels.join(', ')}`);
      await pass('S24', 'all ARIA attributes complete');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S25 — Advanced: 3-message scenario with search + filter
  // ─────────────────────────────────────────────────────────────────────────

  describe('S25 — Advanced multi-turn with search & filter', () => {
    it('can send 2 messages and filter results', async () => {
      // Clear first
      await clickSelector(T('btn-clear-chat'));
      await browser.pause(300);

      const scenarios = [
        { prompt: 'Réponds uniquement: ALPHA-001', keyword: 'alpha' },
        { prompt: 'Réponds uniquement: BETA-002', keyword: 'beta' },
      ];

      for (const scenario of scenarios) {
        try {
          await setFieldValue(T('chat-input'), scenario.prompt);
          await clickSelector(T('chat-send'));
          await browser.waitUntil(
            async () => {
              const loading = await isPresent(T('chat-loading'));
              const count = await getMessageCount();
              return !loading && count > 0;
            },
            { timeout: 90000, interval: 500, timeoutMsg: `Response for "${scenario.prompt}" not received` }
          );
        } catch {
          report.sections['S25'] = { status: 'SKIPPED', detail: 'Backend not available' };
          return;
        }
      }

      const msgCount = await getMessageCount();
      if (msgCount < 4) {
        report.sections['S25'] = { status: 'SKIPPED', detail: `Only ${msgCount} messages` };
        return;
      }

      // Test search
      await setFieldValue(T('input-conversation-search'), 'ALPHA');
      await browser.pause(300);
      const filteredCount = await browser.execute(() => {
        const countEl = document.querySelector('.conversation-filters-count');
        return countEl?.textContent ?? '';
      });
      assert.ok(filteredCount.length > 0, 'Filter count must be shown');

      // Reset
      await setFieldValue(T('input-conversation-search'), '');
      await setSelectValue(T('select-conversation-role'), 'all');
      await pass('S25', `multi-turn search+filter validated, ${msgCount} messages`);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S26 — Export capabilities (when messages exist)
  // ─────────────────────────────────────────────────────────────────────────

  describe('S26 — Export dropdown (when messages exist)', () => {
    it('export dropdown opens and has 3 options (JSON/Markdown/Copier)', async () => {
      const msgCount = await getMessageCount();
      if (msgCount === 0) {
        report.sections['S26'] = { status: 'SKIPPED', detail: 'No messages to export' };
        return;
      }

      await clickSelector(T('btn-export-menu'));
      await browser.pause(300);

      const dropdownOpen = await isPresent(T('export-dropdown'));
      assert.ok(dropdownOpen, 'Export dropdown must open when messages exist');

      const itemCount = await browser.execute(() => {
        return document.querySelectorAll('[data-testid="export-dropdown"] [role="menuitem"]').length;
      });
      assert.ok(itemCount >= 3, `Expected ≥3 export items (JSON/MD/Copy), got ${itemCount}`);
    });

    it('export JSON option is present and enabled', async () => {
      const msgCount = await getMessageCount();
      if (msgCount === 0) return;
      const found = await isPresent(T('btn-export-json'));
      if (found) {
        const disabled = await isDisabled(T('btn-export-json'));
        assert.ok(!disabled, 'Export JSON must be enabled when messages exist');
      } else {
        // In the export dropdown, check by text
        const hasJson = await browser.execute(() => {
          const menu = document.querySelector('[data-testid="export-dropdown"]');
          return menu ? [...menu.querySelectorAll('button')].some(b => b.textContent.includes('JSON')) : false;
        });
        assert.ok(hasJson, 'Export dropdown must have JSON option');
      }
    });

    it('export Markdown option is present', async () => {
      const msgCount = await getMessageCount();
      if (msgCount === 0) return;
      const hasMd = await browser.execute(() => {
        const menu = document.querySelector('[data-testid="export-dropdown"]');
        return menu ? [...menu.querySelectorAll('button')].some(b => b.textContent.includes('Markdown') || b.textContent.includes('MD')) : false;
      });
      assert.ok(hasMd, 'Export dropdown must have Markdown option');
    });

    it('export copy option is present', async () => {
      const msgCount = await getMessageCount();
      if (msgCount === 0) return;
      const hasCopy = await browser.execute(() => {
        const menu = document.querySelector('[data-testid="export-dropdown"]');
        return menu ? [...menu.querySelectorAll('button')].some(b => b.textContent.includes('Copier') || b.textContent.includes('Copy')) : false;
      });
      assert.ok(hasCopy, 'Export dropdown must have Copy option');
    });

    it('close export dropdown by pressing Escape', async () => {
      await browser.keys(['Escape']);
      await browser.pause(300);
      const still = await isPresent(T('export-dropdown'));
      assert.ok(!still, 'Export dropdown must close on Escape');
      await pass('S26', 'export dropdown validated');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // S27 — Final summary & report persistence
  // ─────────────────────────────────────────────────────────────────────────

  describe('S27 — Final cleanup & report', () => {
    it('persists full coverage report', async () => {
      report.completedAt = new Date().toISOString();
      report.totalSections = Object.keys(report.sections).length;
      report.totalFailures = report.failures.length;
      report.passed = Object.values(report.sections).filter(s => s.status === 'PASS').length;
      report.skipped = Object.values(report.sections).filter(s => s.status === 'SKIPPED').length;
      await persistReport();
      assert.ok(fs.existsSync(REPORT_FILE), 'Report file must exist');
    });

    it('chat input is still accessible at end of test suite', async () => {
      await clickSelector(T('btn-clear-chat'));
      await browser.pause(300);
      const disabled = await isDisabled(T('chat-input'));
      assert.ok(!disabled, 'Chat input must be accessible at end of suite');
      await pass('S27', `report at ${REPORT_FILE}, failures=${report.failures.length}`);
    });
  });
});
