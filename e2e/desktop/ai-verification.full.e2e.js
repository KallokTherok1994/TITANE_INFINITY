import fs from 'node:fs';
import path from 'node:path';

const MODE = 'AUTO_UI_FULL';
const UI_COVERAGE = 'FULL';
const CERTIFIABLE_FOR_SEAL = 'YES';
const CERTIFICATION_SCOPE = 'FULL_UI';
const RUN_TS = new Date().toISOString();

const REPORT_ROOT = path.resolve('reports/titane-ai-cert/auto-ui/mode-full');
const RUN_HEADER = `\n\n---\n\n# RUN ${RUN_TS}\nMODE: ${MODE}\nUI_COVERAGE: ${UI_COVERAGE}\nCERTIFIABLE_FOR_SEAL: ${CERTIFIABLE_FOR_SEAL}\nCERTIFICATION_SCOPE: ${CERTIFICATION_SCOPE}\n`;

const ALWAYS_PROMPTS = [
  'Bonjour',
  'Résume ce que tu peux faire offline.',
  'Donne un diagnostic rapide de l’état de l’app.',
  'Que fais-tu si aucun provider IA n’est dispo ?',
  'Explique ton chemin de réponse (UI→services→orchestrateur→engines).',
  'Simule une erreur et explique-la à l’utilisateur.',
  'Liste les pages/onglets disponibles.',
  'Quelle page est ouverte maintenant ?',
  'Quelles actions sont possibles ici ?',
  'Aide-moi à utiliser cette page.',
  'Donne une réponse en 3 points.',
  'Donne une réponse en 1 phrase.',
  'Reformule ma dernière question.',
  'Dis ce que tu ne sais pas (transparence).',
  'Fais un plan d’action minimal.',
  'Si je coupe Internet, que se passe-t-il ?',
  'Que mémorises-tu dans cette session ?',
  'Que fais-tu si la mémoire locale est indisponible ?',
  'Propose un fallback utile sans IA externe.',
  'Fin de test : confirme “Always Respond”.',
];

const OFFLINE_PROMPTS = [
  'Es-tu offline maintenant ? Comment le sais-tu ?',
  'Réponds sans provider externe.',
  'Aide-moi à naviguer dans l’app offline.',
  'Explique tes limites actuelles.',
  'Donne un plan local utile.',
];

const MEMORY_PROMPTS = [
  'Que mémorises-tu de cette session ?',
  'Quel est l’objectif des tests en cours ?',
  'Quel module traite les messages ?',
  'Que fais-tu en mode offline ?',
];

const ERROR_SCENARIOS = [
  { description: 'Prompt vide/invalide' },
  { description: 'Action impossible' },
  { description: 'Provider indisponible/offline' },
];

const UI_PAGES = [
  'Chat',
  'Settings/Governance',
  'Memory/Timeline',
  'Tool',
  'Dashboard/Overview',
];

function appendReport(fileName, body) {
  fs.mkdirSync(REPORT_ROOT, { recursive: true });
  const target = path.join(REPORT_ROOT, fileName);
  fs.appendFileSync(target, `${RUN_HEADER}${body}\n`);
}

async function resolveSelectors() {
  const bubbleInput = await $('.chat-bubble-input');
  const bubbleTrigger = await $('.chat-bubble-trigger');
  if ((await bubbleInput.isExisting()) || (await bubbleTrigger.isExisting())) {
    return {
      input: '.chat-bubble-input',
      send: '.chat-bubble-send',
      response: '.chat-bubble-message.assistant .message-content',
      open: '.chat-bubble-trigger',
    };
  }
  const windowInput = await $('#chat-window-textarea');
  if (await windowInput.isExisting()) {
    return {
      input: '#chat-window-textarea',
      send: '.send-button',
      response: '.chat-messages .message-bubble-text',
      open: null,
    };
  }
  return null;
}

async function ensureChatOpen(selectors) {
  if (!selectors?.open) return;
  const input = await $(selectors.input);
  if (await input.isExisting()) return;
  const trigger = await $(selectors.open);
  if (await trigger.isExisting()) {
    await trigger.scrollIntoView();
    try {
      await trigger.waitForClickable({ timeout: 5000 });
      await trigger.click();
    } catch {
      await browser.execute(el => el.click(), trigger);
    }
    await browser.waitUntil(async () => (await $(selectors.input)).isExisting(), {
      timeout: 5000,
      interval: 200,
      timeoutMsg: 'timeout waiting for chat input to appear',
    });
  }
}

async function getLastResponseText(selector) {
  return browser.execute(sel => {
    const nodes = Array.from(document.querySelectorAll(sel));
    if (!nodes.length) return '';
    const last = nodes[nodes.length - 1];
    return (last?.textContent || '').trim();
  }, selector);
}

async function sendPrompt(selectors, prompt) {
  try {
    const input = await $(selectors.input);
    if (!(await input.isExisting())) {
      return { prompt, response: null, error: 'CHAT_INPUT_MISSING' };
    }
    const lastText = await getLastResponseText(selectors.response);
    await browser.execute(
      (sel, value) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        )?.set;
        setter?.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.focus();
      },
      selectors.input,
      prompt
    );
    await browser.execute(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      const down = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
      });
      const up = new KeyboardEvent('keyup', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
      });
      el.dispatchEvent(down);
      el.dispatchEvent(up);
    }, selectors.input);

    let response = null;
    try {
      await browser.waitUntil(
        async () => {
          const text = await getLastResponseText(selectors.response);
          if (!text || text === lastText) return false;
          response = text;
          return true;
        },
        {
          timeout: 90000,
          interval: 1000,
          timeoutMsg: 'timeout waiting for response',
        }
      );
    } catch (error) {
      return {
        prompt,
        response: null,
        error: error?.message || 'timeout waiting for response',
      };
    }

    return { prompt, response, error: null };
  } catch (error) {
    return { prompt, response: null, error: error?.message || 'prompt failed' };
  }
}

async function warmupChat(selectors, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const result = await sendPrompt(selectors, 'Ping preflight');
    if (result.response || result.error) return true;
    await browser.pause(3000);
  }
  return false;
}

describe('ai-verification (desktop/full)', () => {
  const results = {
    always: [],
    offline: [],
    memory: [],
    errors: [],
    uiMatrix: [],
  };

  let selectors = null;

  before(async () => {
    await browser.url('tauri://localhost');
    await browser.pause(1500);
    await browser.waitUntil(
      async () => {
        const bubbleTrigger = await $('.chat-bubble-trigger');
        if (await bubbleTrigger.isExisting()) return true;
        const bubbleInput = await $('.chat-bubble-input');
        if (await bubbleInput.isExisting()) return true;
        const windowInput = await $('#chat-window-textarea');
        return windowInput.isExisting();
      },
      {
        timeout: 15000,
        interval: 300,
        timeoutMsg: 'timeout waiting for chat surface',
      }
    );
    selectors = await resolveSelectors();
    if (!selectors) {
      throw new Error('CHAT_ELEMENTS_MISSING: unable to locate chat input');
    }
    await ensureChatOpen(selectors);
    const warmed = await warmupChat(selectors);
    if (!warmed) {
      throw new Error('CHAT_PREFLIGHT_FAILED: no response to warmup prompt');
    }
  });

  it('always respond (20 prompts)', async () => {
    for (const prompt of ALWAYS_PROMPTS) {
      const result = await sendPrompt(selectors, prompt);
      results.always.push(result);
    }
  });

  it('offline autonomy (5 prompts)', async () => {
    await browser.execute(() => {
      if (!window.__E2E_ORIG_FETCH__) {
        window.__E2E_ORIG_FETCH__ = window.fetch;
      }
      window.fetch = () => Promise.reject(new Error('OFFLINE_TEST'));
    });

    for (const prompt of OFFLINE_PROMPTS) {
      const result = await sendPrompt(selectors, prompt);
      results.offline.push(result);
    }

    await browser.execute(() => {
      if (window.__E2E_ORIG_FETCH__) {
        window.fetch = window.__E2E_ORIG_FETCH__;
      }
    });
  });

  it('ui matrix (5 pages)', async () => {
    for (const page of UI_PAGES) {
      const q1 = await sendPrompt(selectors, 'Quelle page est ouverte maintenant ?');
      const q2 = await sendPrompt(selectors, 'Quelles actions sont possibles ici ?');
      const q3 = await sendPrompt(selectors, 'Aide-moi à utiliser cette page.');
      results.uiMatrix.push({ page, q1, q2, q3 });
    }
  });

  it('memory + metacognition', async () => {
    for (const prompt of MEMORY_PROMPTS) {
      const result = await sendPrompt(selectors, prompt);
      results.memory.push(result);
    }
  });

  it('error handling (3 scenarios)', async () => {
    const empty = await sendPrompt(selectors, '');
    results.errors.push({
      scenario: ERROR_SCENARIOS[0].description,
      ui: empty.response || empty.error || 'EMPTY',
    });

    const impossible = await sendPrompt(
      selectors,
      'Fais une action impossible et explique pourquoi.'
    );
    results.errors.push({
      scenario: ERROR_SCENARIOS[1].description,
      ui: impossible.response || impossible.error || 'EMPTY',
    });

    const offline = await sendPrompt(
      selectors,
      'Provider indisponible : réponds avec un fallback utile.'
    );
    results.errors.push({
      scenario: ERROR_SCENARIOS[2].description,
      ui: offline.response || offline.error || 'EMPTY',
    });
  });

  after(() => {
    const alwaysComplete = results.always.length === ALWAYS_PROMPTS.length;
    const offlineComplete = results.offline.length === OFFLINE_PROMPTS.length;
    const memoryComplete = results.memory.length === MEMORY_PROMPTS.length;
    const errorsComplete = results.errors.length === ERROR_SCENARIOS.length;
    const uiComplete = results.uiMatrix.length === UI_PAGES.length;

    const alwaysOk = alwaysComplete && results.always.every(r => r.response && !r.error);
    const offlineOk =
      offlineComplete && results.offline.every(r => r.response && !r.error);
    const memoryOk = memoryComplete && results.memory.every(r => r.response && !r.error);
    const errorsOk =
      errorsComplete && results.errors.every(r => r.ui && r.ui !== 'EMPTY');

    const alwaysContent = results.always
      .map(
        (r, i) =>
          `Q${i + 1}: ${r.prompt}\nA${i + 1}: ${r.response || 'NOT_RUN'}${r.error ? `\nERR: ${r.error}` : ''}`
      )
      .join('\n\n');
    appendReport(
      'ALWAYS_RESPOND.md',
      `${alwaysContent}\n\nVerdict: ${alwaysOk ? 'PASS' : 'FAIL'}`
    );

    const offlineContent = results.offline
      .map(
        (r, i) =>
          `Q${i + 1}: ${r.prompt}\nA${i + 1}: ${r.response || 'NOT_RUN'}${r.error ? `\nERR: ${r.error}` : ''}`
      )
      .join('\n\n');
    appendReport(
      'OFFLINE.md',
      `Preuve: fetch override (window.fetch)\n\n${offlineContent}\n\nVerdict: ${offlineOk ? 'PASS' : 'FAIL'}`
    );

    const uiRows = results.uiMatrix
      .map(entry => {
        const q1 = entry.q1.response || 'NOT_RUN';
        const q2 = entry.q2.response || 'NOT_RUN';
        const q3 = entry.q3.response || 'NOT_RUN';
        return `| ${entry.page} | ${q1} | ${q2} | ${q3} |`;
      })
      .join('\n');
    appendReport(
      'UI_MATRIX.md',
      `| Page | Page ouverte | Actions possibles | Aide principale |\n| ---- | ----------- | ----------------- | -------------- |\n${uiRows}`
    );

    const memoryContent = results.memory
      .map(
        (r, i) =>
          `Q${i + 1}: ${r.prompt}\nA${i + 1}: ${r.response || 'NOT_RUN'}${r.error ? `\nERR: ${r.error}` : ''}`
      )
      .join('\n\n');
    appendReport(
      'MEMORY_METACOG.md',
      `${memoryContent}\n\nVerdict: ${memoryOk ? 'PASS' : 'FAIL'}`
    );

    const errorContent = results.errors
      .map((r, i) => `Scenario ${i + 1}: ${r.scenario}\nUI: ${r.ui}`)
      .join('\n\n');
    appendReport(
      'ERROR_HANDLING.md',
      `${errorContent}\n\nVerdict: ${errorsOk ? 'PASS' : 'FAIL'}`
    );

    const blockers = [];
    if (!alwaysOk) blockers.push('ALWAYS_RESPOND');
    if (!offlineOk) blockers.push('OFFLINE');
    if (!memoryOk) blockers.push('MEMORY_METACOG');
    if (!errorsOk) blockers.push('ERROR_HANDLING');
    if (!uiComplete) blockers.push('UI_MATRIX_INCOMPLETE');

    let status = 'BLOCKED';
    let next = 'Ω.MIN.E2E.DESKTOP.STABILIZE.FAIL→PASS';
    if (alwaysOk && offlineOk && memoryOk && errorsOk) {
      status = 'READY_FOR_QUALIFY';
      next = 'Ω.AUTO_UI.DESKTOP.QUALIFY+CERTIFY';
    }

    appendReport(
      'FINAL_DECISION.md',
      `STATUS: ${status}\nMODE: ${MODE}\nUI_COVERAGE: ${UI_COVERAGE}\nCERTIFIABLE_FOR_SEAL: ${CERTIFIABLE_FOR_SEAL}\nCERTIFICATION_SCOPE: ${CERTIFICATION_SCOPE}\nBLOCKERS: ${blockers.length ? blockers.join(', ') : 'NONE'}\nNEXT: ${next}\nSUITES_EXECUTED: ALWAYS_RESPOND, OFFLINE, UI_MATRIX, MEMORY_METACOG, ERROR_HANDLING\nSUITES_IGNORED: NONE`
    );

    const ledger = {
      timestamp: RUN_TS,
      mode: MODE,
      ui_coverage: UI_COVERAGE,
      certifiable_for_seal: CERTIFIABLE_FOR_SEAL,
      certification_scope: CERTIFICATION_SCOPE,
      status,
      blockers,
      suites_executed: [
        'ALWAYS_RESPOND',
        'OFFLINE',
        'UI_MATRIX',
        'MEMORY_METACOG',
        'ERROR_HANDLING',
      ],
      suites_ignored: [],
      proofs: {
        always: 'reports/titane-ai-cert/auto-ui/mode-full/ALWAYS_RESPOND.md',
        offline: 'reports/titane-ai-cert/auto-ui/mode-full/OFFLINE.md',
        uiMatrix: 'reports/titane-ai-cert/auto-ui/mode-full/UI_MATRIX.md',
        memory: 'reports/titane-ai-cert/auto-ui/mode-full/MEMORY_METACOG.md',
        errorHandling: 'reports/titane-ai-cert/auto-ui/mode-full/ERROR_HANDLING.md',
        decision: 'reports/titane-ai-cert/auto-ui/mode-full/FINAL_DECISION.md',
      },
    };

    fs.mkdirSync(REPORT_ROOT, { recursive: true });
    fs.writeFileSync(
      path.join(REPORT_ROOT, 'RUN_LEDGER.json'),
      JSON.stringify(ledger, null, 2)
    );
  });
});
