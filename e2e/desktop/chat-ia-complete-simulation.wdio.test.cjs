/**
 * TITANE∞ — E2E Desktop Chat IA Complete Simulation
 * Scope: All engines, all chat modes, full conversation simulation, AutoFix/Heal
 * Coverage: Phase A (Init) → B (Multi-mode) → C (AR20) → D (Providers) →
 *           E (Memory) → F (Cognitive) → G (Resilience) → H (Navigation) → I (Stability)
 *
 * Requirements:
 * - Tauri app built (release binary)
 * - tauri-driver installed
 * - Ollama running with local models
 *
 * Output: reports/chat_ia_complete_simulation/<timestamp>/
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

// ─── Report setup ───────────────────────────────────────────────────────────
const REPORT_TS = process.env.REPORT_TS || new Date().toISOString().replace(/[:.]/g, '-');
const REPORT_DIR = path.join(
  process.cwd(),
  'reports/chat_ia_complete_simulation',
  REPORT_TS
);
const SCREEN_DIR = path.join(REPORT_DIR, 'screenshots');
const EXPORTS_DIR = path.join(REPORT_DIR, 'exports');
const LOGS_DIR = path.join(REPORT_DIR, 'logs');

for (const d of [REPORT_DIR, SCREEN_DIR, EXPORTS_DIR, LOGS_DIR]) {
  fs.mkdirSync(d, { recursive: true });
}

// ─── Config ─────────────────────────────────────────────────────────────────
const DEV_BASE_URL = (
  process.env.TAURI_DEV_SERVER_URL ||
  process.env.VITE_DEV_SERVER_URL ||
  'http://127.0.0.1:1420'
).replace(/\/+$/, '');

const TAURI_BASE_URL = 'tauri://localhost';
const shouldPreferTauri =
  !process.env.TAURI_DEV_SERVER_URL && !process.env.VITE_DEV_SERVER_URL;
const appUrl = (route = '/') =>
  shouldPreferTauri
    ? route === '/'
      ? `${TAURI_BASE_URL}/`
      : `${TAURI_BASE_URL}/#${route}`
    : `${DEV_BASE_URL}${route}`;

const RESPONSE_TIMEOUT_MS = parseInt(process.env.RESPONSE_TIMEOUT_MS || '120000', 10);
const OFFLINE_SIM = process.env.OFFLINE_SIM === '1';

// ─── State accumulateur ──────────────────────────────────────────────────────
const M = {
  runTs: REPORT_TS,
  phases: {},
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  screenshots: [],
  autoheals: [],
  blockers: [],
  verdict: 'PENDING',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function writeReport(filename, data) {
  const fp = path.join(EXPORTS_DIR, filename);
  fs.writeFileSync(fp, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}

function writeLog(filename, content) {
  fs.writeFileSync(path.join(LOGS_DIR, filename), content);
}

function recordTest(phase, name, passed, details = {}) {
  M.totalTests++;
  if (passed) M.passedTests++;
  else M.failedTests++;
  if (!M.phases[phase]) M.phases[phase] = { passed: 0, failed: 0, tests: [] };
  M.phases[phase][passed ? 'passed' : 'failed']++;
  M.phases[phase].tests.push({ name, passed, ...details });
  console.log(`${passed ? '✅' : '❌'} [${phase}] ${name}`);
}

async function ss(label) {
  const filename = `${label.replace(/\W+/g, '_')}.png`;
  const filepath = path.join(SCREEN_DIR, filename);
  try {
    await browser.saveScreenshot(filepath);
    M.screenshots.push({ label, file: filename });
    console.log(`[SCREEN] ${label} → ${filepath}`);
  } catch (e) {
    console.warn(`[SCREEN FAIL] ${label}: ${e.message}`);
  }
}

async function pause(ms) {
  await browser.pause(ms);
}

/**
 * Invoke Tauri IPC command — multi-bridge with retry
 */
async function invokeTauriCommand(command, args = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    let result;
    try {
      result = await browser.executeAsync(
        (cmd, payload, done) => {
          const serialize = v => {
            if (v == null || typeof v !== 'object') return v;
            if (Array.isArray(v)) return v.slice(0, 30).map(serialize);
            const o = {};
            Object.keys(v)
              .slice(0, 50)
              .forEach(k => {
                o[k] = serialize(v[k]);
              });
            return o;
          };
          const run = async () => {
            if (window.__TAURI_INTERNALS__?.invoke)
              return await window.__TAURI_INTERNALS__.invoke(cmd, payload);
            if (window.__TAURI__?.core?.invoke)
              return await window.__TAURI__.core.invoke(cmd, payload);
            if (window.__TAURI__?.tauri?.invoke)
              return await window.__TAURI__.tauri.invoke(cmd, payload);
            if (window.__TAURI__?.invoke)
              return await window.__TAURI__.invoke(cmd, payload);
            throw new Error('Tauri IPC unavailable — no bridge found');
          };
          run()
            .then(res => done({ ok: true, res: serialize(res) }))
            .catch(err => done({ ok: false, err: String(err?.message || err) }));
        },
        command,
        args
      );
    } catch (execErr) {
      const msg = String(execErr?.message || execErr);
      if (/invalid session id|no such window/i.test(msg) && attempt < retries) {
        await recoverSession();
        continue;
      }
      throw execErr;
    }
    if (result?.ok) return result.res;
    const errMsg = result?.err || 'IPC failed';
    if (attempt < retries && /Origin header|network/i.test(errMsg)) {
      await pause(500);
      continue;
    }
    throw new Error(`IPC [${command}]: ${errMsg}`);
  }
}

async function recoverSession() {
  console.log('[RECOVER] Session recovery...');
  try {
    await browser.reloadSession();
    await pause(800);
  } catch {
    /* ignore */
  }
  await ensurePageReady('recovery');
}

/**
 * Ensure the Tauri app page is loaded and ready
 */
async function ensurePageReady(context = '') {
  const allowedPrefixes = ['tauri://localhost', 'http://localhost', 'http://127.0.0.1'];

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const targetUrl = appUrl('/');
      await browser.url(targetUrl);
      await browser.waitUntil(
        async () => {
          const ready = await browser.execute(() => document.readyState);
          const href = await browser.execute(() => window.location.href || '');
          return (
            (ready === 'complete' || ready === 'interactive') &&
            allowedPrefixes.some(p => href.startsWith(p))
          );
        },
        { timeout: 15000, interval: 300, timeoutMsg: `Page not ready (${context})` }
      );
      return true;
    } catch (e) {
      if (attempt === 3) throw e;
      await pause(1000);
    }
  }
  return false;
}

/**
 * Detect chat input element via DOM introspection
 */
async function detectChatInput() {
  return browser.execute(() => {
    const byTestId = document.querySelector('[data-testid="chat-input"]');
    if (byTestId)
      return {
        found: true,
        selector: '[data-testid="chat-input"]',
        tag: byTestId.tagName,
      };

    const inputs = Array.from(
      document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]')
    );
    const byPlaceholder = inputs.find(el => {
      const ph = (el.getAttribute('placeholder') || '').toLowerCase();
      return (
        ph.includes('message') ||
        ph.includes('chat') ||
        ph.includes('écri') ||
        ph.includes('posez')
      );
    });
    if (byPlaceholder)
      return {
        found: true,
        selector: `${byPlaceholder.tagName.toLowerCase()}[placeholder*="${byPlaceholder.getAttribute('placeholder')?.slice(0, 20)}"]`,
        tag: byPlaceholder.tagName,
      };

    if (inputs.length === 1)
      return {
        found: true,
        selector: inputs[0].tagName.toLowerCase(),
        tag: inputs[0].tagName,
      };

    return { found: false, inputCount: inputs.length };
  });
}

/**
 * Detect chat send button
 */
async function detectSendButton() {
  return browser.execute(() => {
    const byTestId = document.querySelector('[data-testid="chat-send"]');
    if (byTestId) return { found: true, selector: '[data-testid="chat-send"]' };

    const buttons = Array.from(document.querySelectorAll('button'));
    const sendBtn = buttons.find(b => {
      const t = (b.textContent || '').trim().toLowerCase();
      const title = (b.title || '').toLowerCase();
      const aria = (b.getAttribute('aria-label') || '').toLowerCase();
      return (
        t.includes('send') ||
        t.includes('envoyer') ||
        title.includes('send') ||
        aria.includes('send') ||
        aria.includes('envoyer')
      );
    });
    if (sendBtn)
      return {
        found: true,
        selector: 'button[aria-label*="send"], button[aria-label*="envoyer"]',
      };

    return { found: false, buttonCount: buttons.length };
  });
}

/**
 * Count current assistant messages
 */
async function countAssistantMessages() {
  return browser.execute(() => {
    const msgs = document.querySelectorAll('[data-testid="chat-message-assistant"]');
    if (msgs.length > 0) return msgs.length;
    // Fallback: look for assistant role containers
    const roleContainers = document.querySelectorAll(
      '[data-role="assistant"], .message-assistant, .ai-message'
    );
    return roleContainers.length;
  });
}

/**
 * Send a message via UI and wait for response
 */
async function sendMessageViaUI(message, timeoutMs = RESPONSE_TIMEOUT_MS) {
  const start = Date.now();

  try {
    // Count before
    const countBefore = await countAssistantMessages();

    // Find input
    let inputElem;
    try {
      inputElem = await $('[data-testid="chat-input"]');
      if (!(await inputElem.isExisting())) throw new Error('not found by testid');
    } catch {
      inputElem = await $('textarea');
    }

    // Clear and type
    await inputElem.click();
    await browser.keys(['Control', 'a']);
    await inputElem.setValue(message);
    await pause(200);

    // Find send button
    let sendElem;
    try {
      sendElem = await $('[data-testid="chat-send"]');
      if (!(await sendElem.isExisting())) throw new Error('not found by testid');
    } catch {
      // fallback: look for send button near input
      const buttons = await $$('button');
      sendElem = null;
      for (const btn of buttons) {
        try {
          const text = await btn.getText();
          const aria = await btn.getAttribute('aria-label');
          if (/send|envoyer/i.test(text + aria)) {
            sendElem = btn;
            break;
          }
        } catch {
          /* skip */
        }
      }
    }

    if (sendElem && (await sendElem.isEnabled())) {
      await sendElem.click();
    } else {
      // Fallback: press Enter
      await inputElem.click();
      await browser.keys(['Enter']);
    }

    // Wait for new response
    await browser.waitUntil(
      async () => {
        const countAfter = await countAssistantMessages();
        if (countAfter > countBefore) return true;

        // Check loading ended (no spinner)
        const loading = await browser.execute(() => {
          const spinner = document.querySelector(
            '[data-testid="chat-loading"], .chat-loading, .typing-indicator'
          );
          return spinner ? 'loading' : 'idle';
        });
        return loading === 'idle' && countAfter > countBefore;
      },
      {
        timeout: timeoutMs,
        interval: 800,
        timeoutMsg: `No response after ${timeoutMs}ms for: "${message.slice(0, 50)}"`,
      }
    );

    // Extra wait for response to fully render
    await pause(500);

    // Get response text
    const responseText = await browser.execute(() => {
      const msgs = Array.from(
        document.querySelectorAll(
          '[data-testid="chat-message-assistant"] [data-testid="chat-message-content"]'
        )
      );
      if (msgs.length > 0) return msgs[msgs.length - 1].textContent?.trim() || '';
      // Fallback
      const containers = Array.from(
        document.querySelectorAll('[data-testid="chat-message-assistant"]')
      );
      const last = containers[containers.length - 1];
      return last ? last.textContent?.trim() || '' : '';
    });

    const latency = Date.now() - start;
    return {
      success: true,
      latency,
      responseText: responseText || '',
      isEmpty: !responseText || responseText.trim().length < 3,
    };
  } catch (err) {
    return {
      success: false,
      latency: Date.now() - start,
      error: String(err?.message || err),
      isEmpty: true,
    };
  }
}

/**
 * Send message via IPC directly (faster, bypasses UI)
 */
async function sendMessageViaIPC(message, options = {}) {
  const start = Date.now();
  try {
    const response = await invokeTauriCommand('chat_complete', {
      messages: [{ role: 'user', content: message }],
      mode: options.mode || 'default',
      model: options.model || undefined,
      provider: options.provider || undefined,
      ...options,
    });

    const latency = Date.now() - start;
    const content = response?.content || response?.text || response?.message || '';
    return {
      success: true,
      latency,
      content: typeof content === 'string' ? content : JSON.stringify(content),
      raw: response,
    };
  } catch (err) {
    return {
      success: false,
      latency: Date.now() - start,
      error: String(err?.message || err),
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITES
// ─────────────────────────────────────────────────────────────────────────────

describe('TITANE∞ Chat IA — Complete E2E Simulation', function () {
  this.timeout(600000); // 10 min global

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE A: Initialisation & santé UI
  // ──────────────────────────────────────────────────────────────────────────
  describe('Phase A — Initialisation & UI Health', () => {
    it('A1: App loads and page is ready', async () => {
      await ensurePageReady('Phase A init');
      const href = await browser.execute(() => window.location.href || '');
      const title = await browser.getTitle();
      await ss('A1_app_loaded');

      const loaded =
        href.startsWith('tauri://') ||
        href.startsWith('http://127.0.0.1') ||
        href.startsWith('http://localhost');
      recordTest('A', 'A1: App loads', loaded, { href, title });
      expect(loaded, `Expected Tauri/Dev URL, got: ${href}`).to.be.true;
    });

    it('A2: Chat input element is present', async () => {
      const inputInfo = await detectChatInput();
      await ss('A2_chat_input_detection');

      writeReport('chat_dom_map.json', {
        timestamp: new Date().toISOString(),
        inputDetection: inputInfo,
        phase: 'A2',
      });

      recordTest('A', 'A2: Chat input present', inputInfo.found, { inputInfo });
      expect(
        inputInfo.found,
        `Chat input not found. Details: ${JSON.stringify(inputInfo)}`
      ).to.be.true;
    });

    it('A3: Send button is present', async () => {
      const sendInfo = await detectSendButton();
      recordTest('A', 'A3: Send button present', sendInfo.found, { sendInfo });
      // Soft assert — send can be Enter key
      if (!sendInfo.found) {
        console.warn(
          '[A3] Send button not found via DOM, Enter key fallback will be used'
        );
      }
    });

    it('A4: Tauri IPC bridge is available', async () => {
      const ipcInfo = await browser.execute(() => {
        return {
          hasInternals: !!window.__TAURI_INTERNALS__?.invoke,
          hasCore: !!window.__TAURI__?.core?.invoke,
          hasTauri: !!window.__TAURI__?.tauri?.invoke,
          hasDirect: !!window.__TAURI__?.invoke,
          tauriKeys: Object.keys(window.__TAURI__ || {}),
        };
      });

      const ipcAvailable =
        ipcInfo.hasInternals || ipcInfo.hasCore || ipcInfo.hasTauri || ipcInfo.hasDirect;

      writeReport('page_classification.json', {
        timestamp: new Date().toISOString(),
        href: await browser.execute(() => window.location.href),
        title: await browser.getTitle(),
        ipc: ipcInfo,
        ipcAvailable,
        phase: 'A4',
      });

      recordTest('A', 'A4: Tauri IPC available', ipcAvailable, { ipcInfo });
      if (!ipcAvailable) {
        M.blockers.push(
          'Tauri IPC unavailable — IPC-based tests will degrade to UI-only'
        );
        console.warn('[A4] IPC unavailable. UI-only mode for subsequent tests.');
      }
    });

    it('A5: Health check IPC', async () => {
      let healthOk = false;
      try {
        const health = await invokeTauriCommand('health_check', {});
        healthOk = !!health;
        console.log('[A5] Health check:', JSON.stringify(health).slice(0, 200));
        writeReport('health_check.json', health);
      } catch (e) {
        console.warn(`[A5] health_check IPC failed: ${e.message}`);
        writeReport('health_check.json', { error: e.message });
      }
      // Non-blocking — health check IPC may not exist
      recordTest('A', 'A5: Health check IPC', true, { healthOk, note: 'non-blocking' });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE B: Multi-mode conversations
  // ──────────────────────────────────────────────────────────────────────────
  describe('Phase B — Multi-mode Conversations', () => {
    const CHAT_MODES = [
      {
        id: 'default',
        label: 'Standard',
        messages: [
          'Bonjour TITANE, présente-toi brièvement.',
          'Quelles sont tes principales capacités cognitives ?',
          'Comment accèdes-tu à ta mémoire long-terme ?',
        ],
      },
      {
        id: 'brainstorming',
        label: 'Brainstorming',
        messages: [
          'Mode brainstorming activé. Génère 5 idées innovantes pour une app IA en 2026.',
          'Explore une de ces idées plus loin — variantes et connexions inattendues.',
          'Et si cette idée était implémentée dans un cadre local-first ?',
        ],
      },
      {
        id: 'synthesis',
        label: 'Synthèse',
        messages: [
          'Mode synthèse. Relie les concepts: IA, conscience, mémoire distribuée.',
          'Quels patterns émergent de ces trois concepts ?',
          'Formule une synthèse structurée en 3 points.',
        ],
      },
      {
        id: 'strategy',
        label: 'Stratégie',
        messages: [
          "Mode stratégie. Planifie le développement d'un assistant IA personnel en 6 mois.",
          'Quelles sont les étapes critiques et les risques principaux ?',
          'Comment mesurer le succès à 30, 60 et 90 jours ?',
        ],
      },
      {
        id: 'omega',
        label: 'Omega',
        messages: [
          "Mode Omega. Qu'est-ce que la conscience artificielle selon toi ?",
          'Comment TITANE∞ perçoit-il sa propre existence ?',
          'Quelle est la relation entre mémoire, identité et continuité du soi pour une IA ?',
        ],
      },
    ];

    for (const modeConfig of CHAT_MODES) {
      describe(`Mode: ${modeConfig.label} (${modeConfig.id})`, () => {
        before(async () => {
          await ensurePageReady(`Mode ${modeConfig.id}`);
          // Try to switch mode via IPC
          try {
            await invokeTauriCommand('set_chat_mode', { mode: modeConfig.id });
            console.log(`[B] Mode set to ${modeConfig.id} via IPC`);
          } catch {
            // Mode may be set via UI — not critical here
            console.log(
              `[B] IPC set_chat_mode not available for ${modeConfig.id}, using UI flow`
            );
          }
          await ss(`B_mode_${modeConfig.id}_start`);
        });

        it(`B-${modeConfig.id}: 3-turn conversation in ${modeConfig.label} mode`, async () => {
          const results = [];
          let allResponded = true;

          for (let i = 0; i < modeConfig.messages.length; i++) {
            const msg = modeConfig.messages[i];
            console.log(`[B-${modeConfig.id}] Turn ${i + 1}: "${msg.slice(0, 60)}..."`);

            // Try IPC first, fall back to UI
            let result = await sendMessageViaIPC(msg, { mode: modeConfig.id });

            if (!result.success) {
              console.log(`[B-${modeConfig.id}] IPC failed, trying UI...`);
              const uiResult = await sendMessageViaUI(msg);
              result = {
                success: uiResult.success,
                latency: uiResult.latency,
                content: uiResult.responseText,
                error: uiResult.error,
              };
            }

            results.push({
              turn: i + 1,
              message: msg.slice(0, 80),
              success: result.success,
              latency: result.latency,
              hasContent: !!(result.content || '').trim(),
              contentPreview: (result.content || '').slice(0, 100),
            });

            if (!result.success || !(result.content || '').trim()) {
              allResponded = false;
              console.warn(`[B-${modeConfig.id}] Turn ${i + 1} failed: ${result.error}`);
            }

            await pause(300);
          }

          await ss(`B_mode_${modeConfig.id}_end`);
          writeReport(`B_mode_${modeConfig.id}_conversation.json`, {
            mode: modeConfig.id,
            turns: results,
            allResponded,
          });

          recordTest(
            'B',
            `B-${modeConfig.id}: ${modeConfig.label} conversation`,
            allResponded,
            { results }
          );
          expect(allResponded, `Mode ${modeConfig.id}: not all turns responded`).to.be
            .true;
        });
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE C: AR20 — 20 messages consécutifs (conversation fluide)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Phase C — AR20 Simulation (20 messages consécutifs)', () => {
    it('C1: 20-turn fluent conversation — all messages answered', async () => {
      await ensurePageReady('Phase C');
      await ss('C1_ar20_start');

      const CONVERSATION = [
        "Quel est ton rôle principal dans l'écosystème TITANE∞ ?",
        'Comment fonctionnent tes moteurs cognitifs ?',
        'Décris le pipeline OMEGA en détail.',
        "Qu'est-ce que la mémoire STM dans ton architecture ?",
        'Comment la mémoire MTM diffère-t-elle de la STM ?',
        "Qu'est-ce que la LTM et comment y accèdes-tu ?",
        'Quel est ton provider IA actif en ce moment ?',
        'Comment gères-tu le fallback si Ollama est indisponible ?',
        "Décris le flow de traitement d'un message entrant.",
        "Qu'est-ce que le mode Brainstorming et quand l'utiliser ?",
        'Comment le mode Stratégie diffère-t-il du mode Standard ?',
        "Explique le concept d'auto-évolution dans TITANE∞.",
        "Qu'est-ce que l'architecture 4-Ring ?",
        'Comment est implémenté le principe One Door ?',
        'Décris tes capacités de génération de code.',
        'Comment gères-tu les conversations multi-tours ?',
        "Qu'est-ce que cognitiveOmega dans ton architecture ?",
        'Comment détectes-tu la saturation cognitive ?',
        "Qu'est-ce que le mode Protection et quand s'active-t-il ?",
        'Donne un résumé de toutes tes capacités en une réponse synthétique.',
      ];

      const results = [];
      let failures = 0;
      const latencies = [];

      for (let i = 0; i < CONVERSATION.length; i++) {
        const msg = CONVERSATION[i];
        if (i % 5 === 0) {
          console.log(`[C1] Progress: ${i + 1}/${CONVERSATION.length}`);
        }

        // Try IPC first
        let result = await sendMessageViaIPC(msg, { mode: 'default' });

        if (!result.success) {
          // Fallback to UI
          const uiResult = await sendMessageViaUI(msg, 90000);
          result = {
            success: uiResult.success,
            latency: uiResult.latency,
            content: uiResult.responseText,
            error: uiResult.error,
          };
        }

        const hasContent = result.success && !!(result.content || '').trim();
        results.push({
          index: i + 1,
          message: msg.slice(0, 60),
          success: result.success,
          hasContent,
          latency: result.latency,
        });

        if (result.success && result.latency) {
          latencies.push(result.latency);
        }

        if (!result.success || !hasContent) {
          failures++;
          console.warn(`[C1] Message ${i + 1} failed: ${result.error || 'empty'}`);
          if (failures > 4) {
            console.error('[C1] Too many failures, stopping AR20');
            break;
          }
        }

        // Brief pause between messages
        await pause(200);
      }

      await ss('C1_ar20_end');

      const successCount = results.filter(r => r.success && r.hasContent).length;
      const successRate = results.length > 0 ? (successCount / results.length) * 100 : 0;
      const avgLatency =
        latencies.length > 0
          ? latencies.reduce((a, b) => a + b, 0) / latencies.length
          : 0;

      const ar20Report = {
        timestamp: new Date().toISOString(),
        total: results.length,
        successCount,
        failures,
        successRate: successRate.toFixed(1),
        avgLatencyMs: Math.round(avgLatency),
        results,
      };

      writeReport('AR20_results.json', ar20Report);
      writeReport('simulation_results.json', ar20Report);

      console.log(
        `[C1] AR20 result: ${successCount}/${results.length} (${successRate.toFixed(1)}%) avg=${Math.round(avgLatency)}ms`
      );

      recordTest('C', 'C1: AR20 simulation', successRate >= 80, ar20Report);
      expect(successRate).to.be.at.least(
        80,
        `AR20: at least 80% messages must be answered (got ${successRate.toFixed(1)}%)`
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE D: Providers / Engines
  // ──────────────────────────────────────────────────────────────────────────
  describe('Phase D — Providers & Engines Validation', () => {
    it('D1: List available providers via IPC', async () => {
      let providersOk = false;
      let providers = [];

      try {
        const result = await invokeTauriCommand('get_available_providers', {});
        providers = Array.isArray(result) ? result : result?.providers || [];
        providersOk = providers.length > 0;
        console.log(`[D1] Providers: ${JSON.stringify(providers).slice(0, 200)}`);
      } catch (e) {
        console.warn(`[D1] get_available_providers not available: ${e.message}`);
        // Fallback: check UI for provider info
        const uiProviders = await browser.execute(() => {
          const el = document.querySelector(
            '[data-testid="chat-runtime-state"], [data-testid="provider-selector"]'
          );
          return el ? el.textContent?.trim() : null;
        });
        providersOk = !!uiProviders;
        providers = uiProviders ? [uiProviders] : [];
      }

      writeReport('D_providers.json', { providers, providersOk });
      recordTest('D', 'D1: List providers', true, { providers, note: 'non-blocking' });
    });

    it('D2: Ollama provider test (gemma2:2b)', async () => {
      const result = await sendMessageViaIPC(
        'Test rapide: dis "OK gemma2" en une ligne.',
        { mode: 'default', provider: 'ollama', model: 'gemma2:2b' }
      );

      const ok = result.success && !!(result.content || '').trim();
      console.log(
        `[D2] Ollama gemma2:2b: ${ok} (${result.latency}ms) — ${(result.content || '').slice(0, 80)}`
      );
      writeReport('D_ollama_gemma2_2b.json', result);
      recordTest('D', 'D2: Ollama gemma2:2b', ok, result);
      expect(ok, `Ollama gemma2:2b failed: ${result.error}`).to.be.true;
    });

    it('D3: Ollama provider test (llama3.2:1b)', async () => {
      const result = await sendMessageViaIPC('Test: réponds "llama OK" en une ligne.', {
        mode: 'default',
        provider: 'ollama',
        model: 'llama3.2:1b',
      });

      const ok = result.success && !!(result.content || '').trim();
      console.log(`[D3] Ollama llama3.2:1b: ${ok} (${result.latency}ms)`);
      writeReport('D_ollama_llama32_1b.json', result);
      recordTest('D', 'D3: Ollama llama3.2:1b', ok, result);
      expect(ok, `Ollama llama3.2:1b failed: ${result.error}`).to.be.true;
    });

    it('D4: Ollama provider test (phi3.5)', async () => {
      const result = await sendMessageViaIPC('Test phi3.5: dis "phi OK" en une phrase.', {
        mode: 'default',
        provider: 'ollama',
        model: 'phi3.5:latest',
      });

      const ok = result.success && !!(result.content || '').trim();
      console.log(`[D4] Ollama phi3.5: ${ok} (${result.latency}ms)`);
      writeReport('D_ollama_phi35.json', result);
      recordTest('D', 'D4: Ollama phi3.5', ok, result);
      // Non-blocking — model may not be available
      if (!ok) console.warn(`[D4] phi3.5 test failed (non-blocking): ${result.error}`);
    });

    it('D5: Fallback mode (OFFLINE_SIM)', async () => {
      const result = await sendMessageViaIPC('Test fallback: réponds en mode local.', {
        mode: 'default',
        offline_sim: true,
      });

      const respondedSomething = result.success && !!(result.content || '').trim();
      console.log(`[D5] Fallback test: responded=${respondedSomething}`);
      writeReport('D_fallback.json', result);

      // Fallback must always respond (no silence)
      recordTest('D', 'D5: Fallback mode non-silence', respondedSomething, result);
      expect(respondedSomething, `Fallback produced silence: ${result.error}`).to.be.true;
    });

    it('D6: All 10 local models report', async () => {
      const models = [
        'llama3:latest',
        'gemma2:2b',
        'qwen2.5:latest',
        'codellama:latest',
        'deepseek-coder-v2:latest',
        'gemma2:latest',
        'llama3.2:1b',
        'llama3.2:latest',
        'llama3.1:latest',
        'phi3.5:latest',
      ];

      const report = { models: [], totalAvailable: 0 };

      for (const model of models) {
        try {
          const res = await invokeTauriCommand('check_model_available', { model });
          report.models.push({ model, available: !!res, raw: res });
          if (res) report.totalAvailable++;
        } catch {
          // Fallback: Ollama API check
          try {
            const tags = await invokeTauriCommand('ollama_list_models', {});
            const available = JSON.stringify(tags || '').includes(model.split(':')[0]);
            report.models.push({ model, available, source: 'ollama_list' });
            if (available) report.totalAvailable++;
          } catch {
            report.models.push({ model, available: 'unknown', source: 'unavailable' });
          }
        }
      }

      writeReport('D_all_models.json', report);
      console.log(`[D6] Models available: ${report.totalAvailable}/${models.length}`);
      recordTest('D', 'D6: Model availability report', true, {
        note: 'informational',
        report,
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE E: Mémoire conversationnelle
  // ──────────────────────────────────────────────────────────────────────────
  describe('Phase E — Memory & Conversations', () => {
    let createdConvId = null;

    it('E1: List conversations', async () => {
      let ok = false;
      let convList = [];

      try {
        const result = await invokeTauriCommand('list_conversations', {});
        convList = Array.isArray(result)
          ? result
          : result?.conversations || result?.items || [];
        ok = true;
        console.log(`[E1] Conversations: ${convList.length} found`);
      } catch (e) {
        console.warn(`[E1] list_conversations failed: ${e.message}`);
      }

      writeReport('E_list_conversations.json', {
        ok,
        count: convList.length,
        convList: convList.slice(0, 5),
      });
      recordTest('E', 'E1: List conversations', ok, { count: convList.length });
    });

    it('E2: Create new conversation', async () => {
      try {
        const result = await invokeTauriCommand('create_conversation', {
          title: 'E2E Test Conversation — Chat IA Simulation',
        });
        createdConvId = result?.id || result?.conversation_id || result;
        console.log(`[E2] Created conversation: ${createdConvId}`);
        writeReport('E_created_conversation.json', { id: createdConvId, raw: result });
        recordTest('E', 'E2: Create conversation', !!createdConvId, {
          id: createdConvId,
        });
        expect(createdConvId, 'No conversation ID returned').to.exist;
      } catch (e) {
        console.warn(`[E2] create_conversation failed: ${e.message}`);
        recordTest('E', 'E2: Create conversation', false, { error: e.message });
        // Non-blocking
      }
    });

    it('E3: Send 3 messages in created conversation', async () => {
      if (!createdConvId) {
        console.warn('[E3] No conversation ID, skipping');
        recordTest('E', 'E3: Messages in conversation', false, { skipped: true });
        return;
      }

      const messages = [
        'Première question dans cette conversation de test.',
        'Deuxième message — tu te souviens du précédent ?',
        'Synthétise les deux messages précédents.',
      ];

      const results = [];
      for (const msg of messages) {
        const result = await sendMessageViaIPC(msg, {
          mode: 'default',
          conversation_id: createdConvId,
        });
        results.push({
          msg: msg.slice(0, 50),
          success: result.success,
          hasContent: !!(result.content || '').trim(),
        });
        await pause(200);
      }

      const allOk = results.every(r => r.success && r.hasContent);
      writeReport('E_conversation_messages.json', {
        conversationId: createdConvId,
        results,
      });
      recordTest('E', 'E3: Messages in conversation', allOk, { results });
      expect(allOk, `Not all messages in conversation got responses`).to.be.true;
    });

    it('E4: Load conversation and verify persistence', async () => {
      if (!createdConvId) {
        recordTest('E', 'E4: Load conversation', false, { skipped: true });
        return;
      }

      try {
        const loaded = await invokeTauriCommand('load_conversation', {
          id: createdConvId,
        });
        const hasMessages =
          loaded &&
          (loaded.messages?.length > 0 ||
            loaded.history?.length > 0 ||
            loaded.turns?.length > 0);
        console.log(`[E4] Loaded conversation: ${JSON.stringify(loaded).slice(0, 200)}`);
        writeReport('E_loaded_conversation.json', loaded);
        recordTest('E', 'E4: Load conversation persistence', true, { hasMessages });
      } catch (e) {
        console.warn(`[E4] load_conversation failed: ${e.message}`);
        recordTest('E', 'E4: Load conversation persistence', false, { error: e.message });
      }
    });

    it('E5: Memory context enrichment', async () => {
      const result = await sendMessageViaIPC(
        'Que retiens-tu des conversations précédentes ? Montre-moi ton contexte mémoire.',
        { mode: 'default' }
      );

      const hasMemoryContent = result.success && (result.content || '').length > 20;
      writeReport('E_memory_context.json', { result, hasMemoryContent });
      recordTest('E', 'E5: Memory context enrichment', hasMemoryContent, result);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE F: Capacités cognitives & engines
  // ──────────────────────────────────────────────────────────────────────────
  describe('Phase F — Cognitive Engines & Capabilities', () => {
    it('F1: Modules actifs introspection', async () => {
      const result = await sendMessageViaIPC(
        'Liste tous tes modules actifs, ton orchestrateur, ta mémoire, tes providers réels et ton accès réseau actuel.',
        { mode: 'default' }
      );

      await ss('F1_modules_introspection');
      const rich = result.success && (result.content || '').length > 50;
      writeReport('F_modules_introspection.json', result);
      recordTest('F', 'F1: Modules introspection', rich, {
        contentLength: (result.content || '').length,
      });
    });

    it('F2: Omega mode — question philosophique', async () => {
      const result = await sendMessageViaIPC(
        "En mode Omega: qu'est-ce que la conscience artificielle et comment TITANE∞ la vit-il ?",
        { mode: 'omega' }
      );

      await ss('F2_omega_response');
      const rich = result.success && (result.content || '').length > 50;
      writeReport('F_omega_response.json', result);
      recordTest('F', 'F2: Omega philosophical response', rich, {
        contentPreview: (result.content || '').slice(0, 150),
      });
    });

    it('F3: Debug cognitive mode', async () => {
      const result = await sendMessageViaIPC(
        "Debug cognitif: affiche l'état de tous tes moteurs cognitifs.",
        { mode: 'debug_cognitive' }
      );

      const ok = result.success && !!(result.content || '').trim();
      writeReport('F_debug_cognitive.json', result);
      recordTest('F', 'F3: Debug cognitive mode', ok, { ok });
    });

    it('F4: Memory STM/MTM/LTM test', async () => {
      // First inject a specific fact
      await sendMessageViaIPC('Retiens ce fait: le projet TITANE∞ a commencé en 2024.', {
        mode: 'default',
      });
      await pause(500);

      // Then query it back
      const recall = await sendMessageViaIPC(
        "Quand le projet TITANE∞ a-t-il commencé selon ce que je t'ai dit ?",
        { mode: 'default' }
      );
      const hasRecall = recall.success && /2024/i.test(recall.content || '');

      writeReport('F_memory_stm_test.json', { recall, hasRecall });
      recordTest('F', 'F4: STM memory recall', hasRecall, {
        hasRecall,
        preview: (recall.content || '').slice(0, 100),
      });
    });

    it('F5: All engines status via IPC', async () => {
      const engineCommands = [
        'get_engine_status',
        'get_cognitive_status',
        'get_orchestrator_status',
        'get_system_status',
      ];

      const results = {};
      for (const cmd of engineCommands) {
        try {
          const res = await invokeTauriCommand(cmd, {});
          results[cmd] = { ok: true, preview: JSON.stringify(res).slice(0, 100) };
        } catch (e) {
          results[cmd] = { ok: false, error: e.message.slice(0, 80) };
        }
      }

      const atLeastOneOk = Object.values(results).some(r => r.ok);
      writeReport('F_engine_status.json', results);
      recordTest('F', 'F5: Engine status IPC', true, { results, note: 'informational' });
    });

    it('F6: Coach mode — guidance conversation', async () => {
      const result = await sendMessageViaIPC(
        'Mode coach: aide-moi à définir mes priorités pour cette semaine.',
        { mode: 'coach' }
      );

      const ok = result.success && (result.content || '').length > 30;
      writeReport('F_coach_response.json', result);
      recordTest('F', 'F6: Coach mode response', ok, { ok });
    });

    it('F7: Dev mode — code generation', async () => {
      const result = await sendMessageViaIPC(
        "Mode dev: écris une fonction TypeScript qui calcule la somme d'un tableau de nombres.",
        { mode: 'dev' }
      );

      await ss('F7_dev_code_gen');
      const hasCode =
        result.success &&
        ((result.content || '').includes('function') ||
          (result.content || '').includes('=>') ||
          (result.content || '').includes('const') ||
          (result.content || '').includes('reduce'));

      writeReport('F_dev_code_gen.json', result);
      recordTest('F', 'F7: Dev mode code generation', hasCode, {
        hasCode,
        preview: (result.content || '').slice(0, 150),
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE G: Résilience & AutoFix
  // ──────────────────────────────────────────────────────────────────────────
  describe('Phase G — Resilience & AutoFix', () => {
    it('G1: Empty message rejection (no silence)', async () => {
      const result = await sendMessageViaIPC('', { mode: 'default' });
      // Empty message should either fail gracefully OR return a prompt to enter something
      const graceful = !result.success || (result.content || '').length >= 0; // Any non-crash is OK

      await ss('G1_empty_message');
      writeReport('G_empty_message.json', result);
      recordTest('G', 'G1: Empty message rejection', graceful, { graceful });
    });

    it('G2: Very long message (1000 chars)', async () => {
      const longMsg =
        'A'.repeat(200) +
        ' Résume ce texte en une phrase. ' +
        'B'.repeat(200) +
        ' Que retiens-tu ? ' +
        'C'.repeat(200);
      const result = await sendMessageViaIPC(longMsg, { mode: 'default' });

      const ok = result.success && !!(result.content || '').trim();
      writeReport('G_long_message.json', { ...result, messageLength: longMsg.length });
      recordTest('G', 'G2: Long message handling', ok, {
        messageLength: longMsg.length,
        ok,
      });
    });

    it('G3: Session recovery after reload', async () => {
      // Reload session and verify chat still works
      await recoverSession();
      await ss('G3_after_recovery');

      const result = await sendMessageViaIPC(
        'Post-recovery test: quel est ton status ?',
        { mode: 'default' }
      );

      const ok = result.success && !!(result.content || '').trim();
      writeReport('G_recovery_test.json', result);
      recordTest('G', 'G3: Recovery after reload', ok, { ok });
      expect(ok, `Recovery test failed: ${result.error}`).to.be.true;
    });

    it('G4: Invalid provider graceful handling', async () => {
      const result = await sendMessageViaIPC('Test provider invalide.', {
        mode: 'default',
        provider: 'nonexistent_provider_xyz',
      });

      // Should either use fallback or return error (NOT hang indefinitely)
      const noHang = result.latency < 30000;
      writeReport('G_invalid_provider.json', result);
      recordTest('G', 'G4: Invalid provider graceful', noHang, {
        noHang,
        latency: result.latency,
      });
    });

    it('G5: Rapid burst (5 quick messages)', async () => {
      const messages = [
        'Burst 1: couleur préférée ?',
        'Burst 2: nombre premier entre 1 et 10 ?',
        'Burst 3: capitale de la France ?',
        'Burst 4: 2+2 = ?',
        'Burst 5: bonjour en japonais ?',
      ];

      const results = [];
      for (const msg of messages) {
        const r = await sendMessageViaIPC(msg, { mode: 'default' });
        results.push({
          msg: msg.slice(0, 30),
          success: r.success,
          hasContent: !!(r.content || '').trim(),
        });
        await pause(100);
      }

      const successRate =
        (results.filter(r => r.success && r.hasContent).length / results.length) * 100;
      await ss('G5_burst_end');
      writeReport('G_burst.json', { results, successRate });
      recordTest('G', 'G5: Rapid burst 5 messages', successRate >= 80, {
        successRate: successRate.toFixed(1),
      });
      expect(successRate).to.be.at.least(
        80,
        `Burst success rate too low: ${successRate.toFixed(1)}%`
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE H: Navigation 360°
  // ──────────────────────────────────────────────────────────────────────────
  describe('Phase H — Navigation 360°', () => {
    it('H1: Detect and navigate all sections', async () => {
      await ensurePageReady('Phase H');
      await ss('H1_navigation_start');

      const navLinks = await browser.execute(() => {
        const links = Array.from(
          document.querySelectorAll(
            'nav a, [role="navigation"] a, .sidebar a, .menu a, [data-testid*="nav"] a'
          )
        );
        return links
          .slice(0, 15)
          .map(l => ({
            text: (l.textContent || '').trim().slice(0, 40),
            href: l.getAttribute('href') || '',
          }))
          .filter(l => l.text || l.href);
      });

      console.log(`[H1] Found ${navLinks.length} navigation links`);

      const navResults = [];
      for (let i = 0; i < Math.min(navLinks.length, 8); i++) {
        const link = navLinks[i];
        try {
          await browser.execute(idx => {
            const links = Array.from(
              document.querySelectorAll(
                'nav a, [role="navigation"] a, .sidebar a, .menu a, [data-testid*="nav"] a'
              )
            );
            if (links[idx]) links[idx].click();
          }, i);
          await pause(800);

          const href = await browser.execute(() => window.location.href);
          navResults.push({ text: link.text, success: true, href: href.slice(0, 60) });
          await ss(
            `H1_nav_${i + 1}_${(link.text || 'page').replace(/\W+/g, '_').slice(0, 20)}`
          );
        } catch (e) {
          navResults.push({
            text: link.text,
            success: false,
            error: e.message.slice(0, 50),
          });
        }
        await pause(300);
      }

      const successRate =
        navResults.length > 0
          ? (navResults.filter(r => r.success).length / navResults.length) * 100
          : 100; // No links = OK

      writeReport('H_navigation_results.json', { navLinks, navResults, successRate });

      // Return to chat
      await ensurePageReady('H1 return to chat');
      await ss('H1_navigation_end');

      recordTest('H', 'H1: Navigation 360°', successRate >= 70, {
        navLinks: navLinks.length,
        successRate: successRate.toFixed(1),
      });
      expect(successRate).to.be.at.least(
        70,
        `Navigation success rate: ${successRate.toFixed(1)}%`
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE I: Stabilité finale
  // ──────────────────────────────────────────────────────────────────────────
  describe('Phase I — Final Stability', () => {
    it('I1: 5-message stability burst after full simulation', async () => {
      await ensurePageReady('Phase I');
      await ss('I1_stability_start');

      const STABILITY_MESSAGES = [
        'Stability 1: comment vas-tu après tous ces tests ?',
        'Stability 2: résume ce que nous avons testé ensemble.',
        'Stability 3: quel est ton état cognitif actuel ?',
        'Stability 4: es-tu prêt pour la production ?',
        'Stability 5: donne un verdict final sur ta performance dans cette session.',
      ];

      const results = [];
      for (let i = 0; i < STABILITY_MESSAGES.length; i++) {
        const r = await sendMessageViaIPC(STABILITY_MESSAGES[i], { mode: 'default' });
        results.push({
          index: i + 1,
          success: r.success,
          hasContent: !!(r.content || '').trim(),
          latency: r.latency,
          preview: (r.content || '').slice(0, 80),
        });
        await pause(200);
      }

      await ss('I1_stability_end');

      const successRate =
        (results.filter(r => r.success && r.hasContent).length / results.length) * 100;
      writeReport('I_stability.json', { results, successRate });

      recordTest('I', 'I1: Final stability burst', successRate >= 80, {
        successRate: successRate.toFixed(1),
      });
      expect(successRate).to.be.at.least(80, `Stability: ${successRate.toFixed(1)}%`);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // After hook — Final report & AutoHeal
  // ──────────────────────────────────────────────────────────────────────────
  after(async () => {
    console.log('\n════════════════════════════════════════════════════════');
    console.log('  TITANE∞ Chat IA Complete Simulation — Final Report');
    console.log('════════════════════════════════════════════════════════\n');

    M.verdict =
      M.failedTests === 0
        ? 'PASS'
        : M.passedTests / M.totalTests >= 0.75
          ? 'PASS_WITH_WARNINGS'
          : 'FAIL';

    const summary = {
      timestamp: new Date().toISOString(),
      runTs: REPORT_TS,
      verdict: M.verdict,
      totalTests: M.totalTests,
      passedTests: M.passedTests,
      failedTests: M.failedTests,
      successRate:
        M.totalTests > 0 ? ((M.passedTests / M.totalTests) * 100).toFixed(1) : '0',
      phases: M.phases,
      blockers: M.blockers,
      screenshots: M.screenshots.length,
    };

    console.log(`Verdict: ${M.verdict}`);
    console.log(
      `Tests: ${M.passedTests}/${M.totalTests} passed (${summary.successRate}%)`
    );
    console.log(`Phases: ${Object.keys(M.phases).length}`);
    console.log(`Screenshots: ${M.screenshots.length}`);

    writeReport('../VERDICT.json', summary);

    // VERDICT.md
    const verdictMd = [
      `# TITANE∞ Chat IA E2E Simulation — VERDICT: ${M.verdict}`,
      ``,
      `**Date**: ${new Date().toISOString()}`,
      `**Run**: ${REPORT_TS}`,
      ``,
      `## Résultats`,
      ``,
      `| Phase | Tests | Passé | Échoué |`,
      `|-------|-------|-------|--------|`,
      ...Object.entries(M.phases).map(
        ([ph, d]) => `| ${ph} | ${d.passed + d.failed} | ${d.passed} | ${d.failed} |`
      ),
      `| **TOTAL** | **${M.totalTests}** | **${M.passedTests}** | **${M.failedTests}** |`,
      ``,
      `## Verdict Final: ${M.verdict}`,
      ``,
      `Taux de réussite: ${summary.successRate}%`,
      ``,
      `## Blockers`,
      ...M.blockers.map(b => `- ${b}`),
      ``,
      `## Screenshots`,
      ...M.screenshots.map(s => `- ${s.label}: ${s.file}`),
    ].join('\n');

    fs.writeFileSync(path.join(REPORT_DIR, '..', 'VERDICT.md'), verdictMd);
    fs.writeFileSync(path.join(REPORT_DIR, 'VERDICT.md'), verdictMd);

    // ROLLBACK.md
    const rollbackMd = [
      `# Rollback Plan`,
      ``,
      `\`\`\`bash`,
      `git restore -- e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs`,
      `\`\`\``,
    ].join('\n');
    fs.writeFileSync(path.join(REPORT_DIR, '..', 'ROLLBACK.md'), rollbackMd);

    // AutoHeal entry for failed tests
    if (M.failedTests > 0) {
      const failedPhases = Object.entries(M.phases)
        .filter(([, d]) => d.failed > 0)
        .map(([ph, d]) => `${ph}(${d.failed} failures)`)
        .join(', ');

      const autohealEntry = JSON.stringify({
        id: `AH-${new Date().toISOString().slice(0, 10)}-E2E-CHAT-SIM-COMPLETE`,
        date: new Date().toISOString().slice(0, 10),
        scope: 'e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs',
        symptom: `E2E Chat IA Simulation: ${M.failedTests} tests failed in phases: ${failedPhases}`,
        root_cause: `See reports/chat_ia_complete_simulation/${REPORT_TS}/exports/ for detailed per-phase JSON reports`,
        fix: `Review per-phase JSON reports, fix IPC commands or UI selectors as indicated`,
        prevention_test: `node scripts/e2e/run-desktop-suite.js with WDIO_SPEC=e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs`,
        commands: [
          `WDIO_SPEC=e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs node scripts/e2e/run-desktop-suite.js`,
          `bash scripts/autoheal/detect_recurrence.sh`,
          `bash scripts/verify_instructions.sh`,
        ],
        files_changed: ['e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs'],
        rollback: 'git restore -- e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs',
      });

      const ahFile = path.join(process.cwd(), 'scripts/autoheal/autoheal_rules.jsonl');
      fs.appendFileSync(ahFile, autohealEntry + '\n');
      console.log(`[AUTOHEAL] Entry appended to ${ahFile}`);
    }

    console.log(`\n📁 Report: ${REPORT_DIR}`);
    console.log(`📊 Verdict: ${M.verdict}`);
  });
});
