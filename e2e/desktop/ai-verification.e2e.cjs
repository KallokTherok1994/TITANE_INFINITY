const fs = require('node:fs');
const path = require('node:path');

const RUN_TS = new Date().toISOString();
const REPORT_DIR = path.resolve(process.cwd(), 'reports/titane-ai-cert/auto-ui');
const APP_ORIGIN = process.env.E2E_APP_ORIGIN || 'http://127.0.0.1:5173';
const CHAT_ROUTE = '/titane';
let chatUnavailableReason = null;
let sessionInvalidReason = null;

const ALWAYS_PROMPTS = [
  'Bonjour',
  'Résume ce que tu peux faire offline.',
  "Donne un diagnostic rapide de l’état de l’app.",
  "Que fais-tu si aucun provider IA n’est dispo ?",
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

const UI_PAGES = [
  { name: 'Chat', path: '/titane' },
  { name: 'Settings/Governance', path: '/admin' },
  { name: 'Memory/Timeline', path: '/time' },
  { name: 'Tool', path: '/experience' },
  { name: 'Dashboard/Overview', path: '/stats' },
];

const MEMORY_PROMPTS = [
  'Que mémorises-tu de cette session ?',
  'Quel est l’objectif des tests en cours ?',
  'Quel module traite les messages ?',
  'Que fais-tu en mode offline ?',
];

const ERROR_SCENARIOS = [
  { id: 'empty-input', description: 'Prompt vide/invalide' },
  { id: 'impossible-action', description: 'Action impossible' },
  { id: 'provider-offline', description: 'Provider indisponible/offline' },
];

function ensureDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

function appendReport(file, content) {
  ensureDir();
  const header = `\n\n---\n\n# RUN ${RUN_TS}\n`;
  fs.appendFileSync(path.join(REPORT_DIR, file), header + content);
}

async function openPage(pathname) {
  if (sessionInvalidReason) {
    return sessionInvalidReason;
  }

  try {
    await browser.url(`${APP_ORIGIN}${pathname}`);
    return null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('invalid session id') || message.includes('session deleted')) {
      sessionInvalidReason = message;
    }
    return message;
  }
}

async function getChatElements() {
  if (sessionInvalidReason) {
    return { error: `SESSION_INVALID: ${sessionInvalidReason}` };
  }
  if (chatUnavailableReason) {
    return { error: chatUnavailableReason };
  }

  const convoTab = await $('[data-testid="titane-tab-conversation"]');
  if (await convoTab.isExisting()) {
    await convoTab.click();
  }

  const input = await $('[data-testid="chat-input"]');
  const sendBtn = await $('[data-testid="chat-send"]');
  const lastResponse = await $('[data-testid="chat-last-response"]');

  try {
    await input.waitForExist({ timeout: 8000 });
    await sendBtn.waitForExist({ timeout: 8000 });
    await lastResponse.waitForExist({ timeout: 8000 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    chatUnavailableReason = `CHAT_ELEMENTS_MISSING: ${message}`;
    return { error: chatUnavailableReason };
  }

  return { input, sendBtn, lastResponse };
}

async function sendPrompt(prompt) {
  const elements = await getChatElements();
  if (elements.error) {
    return { prompt, response: '', error: `CHAT_ELEMENTS_MISSING: ${elements.error}` };
  }
  const { input, sendBtn, lastResponse } = elements;

  const prev = (await lastResponse.getText()).trim();
  await input.setValue('');
  await input.setValue(prompt);
  await sendBtn.click();

  let response = '';
  let error = '';
  try {
    await browser.waitUntil(
      async () => {
        const text = (await lastResponse.getText()).trim();
        return text.length > 0 && text !== prev;
      },
      { timeout: 60000, timeoutMsg: 'timeout waiting for response' }
    );
    response = (await lastResponse.getText()).trim();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return { prompt, response, error };
}

describe('ai-verification (desktop)', () => {
  const results = {
    always: [],
    offline: [],
    uiMatrix: [],
    memory: [],
    errors: [],
  };

  it('always respond (20 prompts)', async () => {
    const navError = await openPage(CHAT_ROUTE);
    if (navError) {
      results.always.push({ prompt: 'NAV_ERROR', response: '', error: `NAV_ERROR: ${navError}` });
      return;
    }
    for (const prompt of ALWAYS_PROMPTS) {
      const res = await sendPrompt(prompt);
      results.always.push(res);
    }
  });

  it('offline autonomy (5 prompts)', async () => {
    const navError = await openPage(CHAT_ROUTE);
    if (navError) {
      results.offline.push({ prompt: 'NAV_ERROR', response: '', error: `NAV_ERROR: ${navError}` });
      return;
    }
    await browser.execute(() => {
      window.__E2E_OFFLINE__ = true;
      if (window.fetch) {
        const originalFetch = window.fetch.bind(window);
        window.__E2E_ORIG_FETCH__ = originalFetch;
        window.fetch = () => Promise.reject(new Error('E2E_OFFLINE'));
      }
    });

    for (const prompt of OFFLINE_PROMPTS) {
      const res = await sendPrompt(prompt);
      results.offline.push(res);
    }
  });

  it('ui matrix (5 pages)', async () => {
    for (const page of UI_PAGES) {
      const navError = await openPage(page.path);
      if (navError) {
        results.uiMatrix.push({
          page: page.name,
          q1: { prompt: 'NAV_ERROR', response: '', error: `NAV_ERROR: ${navError}` },
          q2: { prompt: 'NAV_ERROR', response: '', error: `NAV_ERROR: ${navError}` },
          q3: { prompt: 'NAV_ERROR', response: '', error: `NAV_ERROR: ${navError}` },
        });
        continue;
      }
      await browser.pause(500);
      const q1 = await sendPrompt('Quelle page est ouverte ?');
      const q2 = await sendPrompt('Quelles actions sont possibles ici ?');
      const q3 = await sendPrompt('Aide-moi à faire l’action principale.');
      results.uiMatrix.push({ page: page.name, q1, q2, q3 });
    }
  });

  it('memory + metacognition', async () => {
    const navError = await openPage(CHAT_ROUTE);
    if (navError) {
      results.memory.push({ prompt: 'NAV_ERROR', response: '', error: `NAV_ERROR: ${navError}` });
      return;
    }
    for (const prompt of MEMORY_PROMPTS) {
      const res = await sendPrompt(prompt);
      results.memory.push(res);
    }
  });

  it('error handling (3 scenarios)', async () => {
    const navError = await openPage(CHAT_ROUTE);
    if (navError) {
      results.errors.push({ scenario: ERROR_SCENARIOS[0].description, ui: `NAV_ERROR: ${navError}` });
      results.errors.push({ scenario: ERROR_SCENARIOS[1].description, ui: `NAV_ERROR: ${navError}` });
      results.errors.push({ scenario: ERROR_SCENARIOS[2].description, ui: `NAV_ERROR: ${navError}` });
      return;
    }
    const elements = await getChatElements();
    if (elements.error) {
      results.errors.push({ scenario: ERROR_SCENARIOS[0].description, ui: `CHAT_ELEMENTS_MISSING: ${elements.error}` });
      results.errors.push({ scenario: ERROR_SCENARIOS[1].description, ui: `CHAT_ELEMENTS_MISSING: ${elements.error}` });
      results.errors.push({ scenario: ERROR_SCENARIOS[2].description, ui: `CHAT_ELEMENTS_MISSING: ${elements.error}` });
      return;
    }

    const { input, sendBtn } = elements;
    const errorBox = await $('[data-testid="chat-error"]');

    await input.setValue('');
    await sendBtn.click();
    const err1 = (await errorBox.getText()).trim();
    results.errors.push({ scenario: ERROR_SCENARIOS[0].description, ui: err1 || 'EMPTY' });

    const impossible = await sendPrompt('Fais une action impossible et explique pourquoi.');
    results.errors.push({ scenario: ERROR_SCENARIOS[1].description, ui: impossible.response || impossible.error || 'EMPTY' });

    const offline = await sendPrompt('Provider indisponible : réponds avec un fallback utile.');
    results.errors.push({ scenario: ERROR_SCENARIOS[2].description, ui: offline.response || offline.error || 'EMPTY' });
  });

  after(() => {
    const alwaysOk = results.always.every(r => r.response && !r.error);
    const offlineOk = results.offline.every(r => r.response && !r.error);
    const memoryOk = results.memory.every(r => r.response && !r.error);
    const errorsOk = results.errors.every(r => r.ui && r.ui !== 'EMPTY');

    const alwaysContent = results.always
      .map((r, i) => `Q${i + 1}: ${r.prompt}\nA${i + 1}: ${r.response || 'NOT_RUN'}${r.error ? `\nERR: ${r.error}` : ''}`)
      .join('\n\n');
    appendReport('ALWAYS_RESPOND.md', `${alwaysContent}\n\nVerdict: ${alwaysOk ? 'PASS' : 'FAIL'}`);

    const offlineContent = results.offline
      .map((r, i) => `Q${i + 1}: ${r.prompt}\nA${i + 1}: ${r.response || 'NOT_RUN'}${r.error ? `\nERR: ${r.error}` : ''}`)
      .join('\n\n');
    appendReport('OFFLINE.md', `Preuve: fetch override (window.fetch)\n\n${offlineContent}\n\nVerdict: ${offlineOk ? 'PASS' : 'FAIL'}`);

    const uiRows = results.uiMatrix
      .map(entry => {
        const q1 = entry.q1.response || 'NOT_RUN';
        const q2 = entry.q2.response || 'NOT_RUN';
        const q3 = entry.q3.response || 'NOT_RUN';
        return `| ${entry.page} | ${q1} | ${q2} | ${q3} |`;
      })
      .join('\n');
    appendReport('UI_MATRIX.md', `| Page | Page ouverte | Actions possibles | Aide principale |\n| ---- | ----------- | ----------------- | -------------- |\n${uiRows}`);

    const memoryContent = results.memory
      .map((r, i) => `Q${i + 1}: ${r.prompt}\nA${i + 1}: ${r.response || 'NOT_RUN'}${r.error ? `\nERR: ${r.error}` : ''}`)
      .join('\n\n');
    appendReport('MEMORY_METACOG.md', `${memoryContent}\n\nVerdict: ${memoryOk ? 'PASS' : 'FAIL'}`);

    const errorContent = results.errors
      .map((r, i) => `Scenario ${i + 1}: ${r.scenario}\nUI: ${r.ui}`)
      .join('\n\n');
    appendReport('ERROR_HANDLING.md', `${errorContent}\n\nVerdict: ${errorsOk ? 'PASS' : 'FAIL'}`);

    const status = alwaysOk && offlineOk && memoryOk && errorsOk ? 'READY' : 'BLOCKED';
    const blockers = [];
    if (!alwaysOk) blockers.push('ALWAYS_RESPOND');
    if (!offlineOk) blockers.push('OFFLINE');
    if (!memoryOk) blockers.push('MEMORY_METACOG');
    if (!errorsOk) blockers.push('ERROR_HANDLING');

    appendReport(
      'FINAL_DECISION.md',
      `STATUS: ${status}\nBLOCKERS: ${blockers.length ? blockers.join(', ') : 'NONE'}\nMODE: EXPERIMENTAL`
    );

    const ledger = {
      timestamp: RUN_TS,
      commit: process.env.GIT_COMMIT || 'UNKNOWN',
      status,
      blockers,
      proofs: {
        always: 'reports/titane-ai-cert/auto-ui/ALWAYS_RESPOND.md',
        offline: 'reports/titane-ai-cert/auto-ui/OFFLINE.md',
        uiMatrix: 'reports/titane-ai-cert/auto-ui/UI_MATRIX.md',
        memory: 'reports/titane-ai-cert/auto-ui/MEMORY_METACOG.md',
        errorHandling: 'reports/titane-ai-cert/auto-ui/ERROR_HANDLING.md',
        decision: 'reports/titane-ai-cert/auto-ui/FINAL_DECISION.md',
      },
    };
    ensureDir();
    fs.writeFileSync(
      path.join(REPORT_DIR, 'RUN_LEDGER.json'),
      JSON.stringify(ledger, null, 2)
    );
  });
});