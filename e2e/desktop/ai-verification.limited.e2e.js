import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const RUN_TS = new Date().toISOString();
const REPORT_ROOT = path.resolve(process.cwd(), 'reports/titane-ai-cert/auto-ui');
const MODE = process.env.AUTO_UI_MODE || 'AUTO_UI_LIMITED';
const UI_COVERAGE = process.env.AUTO_UI_COVERAGE || 'PARTIAL';
const CERTIFIABLE_FOR_SEAL = process.env.AUTO_UI_CERTIFIABLE || 'NO';
const CERTIFICATION_SCOPE = 'LIMITED_UI';
const MODE_DIR = 'mode-limited';
const REPORT_DIR = path.join(REPORT_ROOT, MODE_DIR);
const APP_ORIGIN = process.env.E2E_APP_ORIGIN || 'http://127.0.0.1:5173';
const CHAT_ROUTE = '/';

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
  const header = `\n\n---\n\n# RUN ${RUN_TS}\nMODE: ${MODE}\nUI_COVERAGE: ${UI_COVERAGE}\nCERTIFIABLE_FOR_SEAL: ${CERTIFIABLE_FOR_SEAL}\nCERTIFICATION_SCOPE: ${CERTIFICATION_SCOPE}\n`;
  fs.appendFileSync(path.join(REPORT_DIR, file), header + content);
}

async function openPage(page, pathname) {
  try {
    await page.goto(`${APP_ORIGIN}${pathname}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    return null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return message;
  }
}

async function getChatElements(page) {
  const convoTab = page.locator('[data-testid="titane-tab-conversation"]');
  if (await convoTab.count()) {
    await convoTab.first().click();
  }

  const input = page.locator('[data-testid="chat-input"]');
  const sendBtn = page.locator('[data-testid="chat-send"]');
  const lastResponse = page.locator('[data-testid="chat-last-response"]');

  try {
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await sendBtn.waitFor({ state: 'visible', timeout: 10000 });
    await lastResponse.waitFor({ state: 'visible', timeout: 10000 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `CHAT_ELEMENTS_MISSING: ${message}` };
  }

  return { input, sendBtn, lastResponse };
}

async function sendPrompt(page, prompt) {
  const elements = await getChatElements(page);
  if (elements.error) {
    return { prompt, response: '', error: elements.error };
  }

  const { input, sendBtn, lastResponse } = elements;
  const prev = (await lastResponse.textContent())?.trim() || '';
  await input.fill('');
  await input.fill(prompt);
  await sendBtn.click();

  let response = '';
  let error = '';
  try {
    await page.waitForFunction(
      ({ selector, prevValue }) => {
        const el = document.querySelector(selector);
        if (!el) return false;
        const text = (el.textContent || '').trim();
        return text.length > 0 && text !== prevValue;
      },
      { timeout: 60000 },
      { selector: '[data-testid="chat-last-response"]', prevValue: prev }
    );
    response = (await lastResponse.textContent())?.trim() || '';
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return { prompt, response, error };
}

async function run() {
  const results = {
    always: [],
    offline: [],
    memory: [],
    errors: [],
  };

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const navError = await openPage(page, CHAT_ROUTE);
    if (navError) {
      results.always.push({ prompt: 'NAV_ERROR', response: '', error: `NAV_ERROR: ${navError}` });
    } else {
      for (const prompt of ALWAYS_PROMPTS) {
        const res = await sendPrompt(page, prompt);
        results.always.push(res);
      }
    }

    const navErrorOffline = await openPage(page, CHAT_ROUTE);
    if (navErrorOffline) {
      results.offline.push({ prompt: 'NAV_ERROR', response: '', error: `NAV_ERROR: ${navErrorOffline}` });
    } else {
      await page.evaluate(() => {
        window.__E2E_OFFLINE__ = true;
        if (window.fetch) {
          const originalFetch = window.fetch.bind(window);
          window.__E2E_ORIG_FETCH__ = originalFetch;
          window.fetch = () => Promise.reject(new Error('E2E_OFFLINE'));
        }
      });

      for (const prompt of OFFLINE_PROMPTS) {
        const res = await sendPrompt(page, prompt);
        results.offline.push(res);
      }
    }

    const navErrorMemory = await openPage(page, CHAT_ROUTE);
    if (navErrorMemory) {
      results.memory.push({ prompt: 'NAV_ERROR', response: '', error: `NAV_ERROR: ${navErrorMemory}` });
    } else {
      for (const prompt of MEMORY_PROMPTS) {
        const res = await sendPrompt(page, prompt);
        results.memory.push(res);
      }
    }

    const navErrorErrors = await openPage(page, CHAT_ROUTE);
    if (navErrorErrors) {
      results.errors.push({ scenario: ERROR_SCENARIOS[0].description, ui: `NAV_ERROR: ${navErrorErrors}` });
      results.errors.push({ scenario: ERROR_SCENARIOS[1].description, ui: `NAV_ERROR: ${navErrorErrors}` });
      results.errors.push({ scenario: ERROR_SCENARIOS[2].description, ui: `NAV_ERROR: ${navErrorErrors}` });
    } else {
      const elements = await getChatElements(page);
      if (elements.error) {
        results.errors.push({ scenario: ERROR_SCENARIOS[0].description, ui: elements.error });
        results.errors.push({ scenario: ERROR_SCENARIOS[1].description, ui: elements.error });
        results.errors.push({ scenario: ERROR_SCENARIOS[2].description, ui: elements.error });
      } else {
        const { input, sendBtn } = elements;
        const errorBox = page.locator('[data-testid="chat-error"]');

        await input.fill('');
        await sendBtn.click();
        const err1 = (await errorBox.textContent())?.trim() || '';
        results.errors.push({ scenario: ERROR_SCENARIOS[0].description, ui: err1 || 'EMPTY' });

        const impossible = await sendPrompt(page, 'Fais une action impossible et explique pourquoi.');
        results.errors.push({ scenario: ERROR_SCENARIOS[1].description, ui: impossible.response || impossible.error || 'EMPTY' });

        const offline = await sendPrompt(page, 'Provider indisponible : réponds avec un fallback utile.');
        results.errors.push({ scenario: ERROR_SCENARIOS[2].description, ui: offline.response || offline.error || 'EMPTY' });
      }
    }
  } finally {
    await browser.close();
  }

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

  const memoryContent = results.memory
    .map((r, i) => `Q${i + 1}: ${r.prompt}\nA${i + 1}: ${r.response || 'NOT_RUN'}${r.error ? `\nERR: ${r.error}` : ''}`)
    .join('\n\n');
  appendReport('MEMORY_METACOG.md', `${memoryContent}\n\nVerdict: ${memoryOk ? 'PASS' : 'FAIL'}`);

  const errorContent = results.errors
    .map((r, i) => `Scenario ${i + 1}: ${r.scenario}\nUI: ${r.ui}`)
    .join('\n\n');
  appendReport('ERROR_HANDLING.md', `${errorContent}\n\nVerdict: ${errorsOk ? 'PASS' : 'FAIL'}`);

  let status = 'BLOCKED';
  let next = 'Ω.MIN.E2E.DESKTOP.STABILIZE.FAIL→PASS';
  let note = 'Native driver missing';

  if (alwaysOk && offlineOk && memoryOk && errorsOk) {
    status = 'QUALIFIED_LIMITED';
    next = 'Install native driver → rerun for FULL';
  }

  const blockers = [];
  if (!alwaysOk) blockers.push('ALWAYS_RESPOND');
  if (!offlineOk) blockers.push('OFFLINE');
  if (!memoryOk) blockers.push('MEMORY_METACOG');
  if (!errorsOk) blockers.push('ERROR_HANDLING');

  const suitesExecuted = ['ALWAYS_RESPOND', 'OFFLINE', 'MEMORY_METACOG', 'ERROR_HANDLING'];
  const suitesIgnored = [{ suite: 'UI_MATRIX', reason: 'LIMITED_MODE_NO_NATIVE_DRIVER' }];

  appendReport(
    'FINAL_DECISION.md',
    `STATUS: ${status}\nMODE: ${MODE}\nUI_COVERAGE: ${UI_COVERAGE}\nCERTIFIABLE_FOR_SEAL: ${CERTIFIABLE_FOR_SEAL}\nCERTIFICATION_SCOPE: ${CERTIFICATION_SCOPE}\nBLOCKERS: ${blockers.length ? blockers.join(', ') : 'NONE'}\nNOTE: ${note}\nNEXT: ${next}\nSUITES_EXECUTED: ${suitesExecuted.join(', ')}\nSUITES_IGNORED: ${suitesIgnored.map(s => `${s.suite} (${s.reason})`).join('; ')}`
  );

  const ledger = {
    timestamp: RUN_TS,
    commit: process.env.GIT_COMMIT || 'UNKNOWN',
    mode: MODE,
    ui_coverage: UI_COVERAGE,
    certifiable_for_seal: CERTIFIABLE_FOR_SEAL,
    certification_scope: CERTIFICATION_SCOPE,
    status,
    blockers,
    suites_executed: suitesExecuted,
    suites_ignored: suitesIgnored,
    proofs: {
      always: `reports/titane-ai-cert/auto-ui/${MODE_DIR}/ALWAYS_RESPOND.md`,
      offline: `reports/titane-ai-cert/auto-ui/${MODE_DIR}/OFFLINE.md`,
      memory: `reports/titane-ai-cert/auto-ui/${MODE_DIR}/MEMORY_METACOG.md`,
      errorHandling: `reports/titane-ai-cert/auto-ui/${MODE_DIR}/ERROR_HANDLING.md`,
      decision: `reports/titane-ai-cert/auto-ui/${MODE_DIR}/FINAL_DECISION.md`,
    },
  };
  fs.mkdirSync(REPORT_ROOT, { recursive: true });
  fs.writeFileSync(
    path.join(REPORT_ROOT, 'RUN_LEDGER.json'),
    JSON.stringify(ledger, null, 2)
  );

  process.exitCode = status === 'QUALIFIED_LIMITED' ? 0 : 1;
}

run().catch(err => {
  const message = err instanceof Error ? err.message : String(err);
  appendReport('FINAL_DECISION.md', `STATUS: BLOCKED\nMODE: ${MODE}\nUI_COVERAGE: ${UI_COVERAGE}\nCERTIFIABLE_FOR_SEAL: ${CERTIFIABLE_FOR_SEAL}\nCERTIFICATION_SCOPE: ${CERTIFICATION_SCOPE}\nBLOCKERS: RUNNER_ERROR\nNOTE: ${message}\nNEXT: Ω.MIN.E2E.DESKTOP.STABILIZE.FAIL→PASS`);
  process.exitCode = 1;
});
