// TITANE∞ - E2E WDIO: Compétences, Connaissances, Mémoire
// Ce test simule des questions/réponses réelles dans l’UI du chat TITANE.

const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

const REPORT_DIR = path.join(__dirname, '../artifacts/knowledge-competence-memory');

async function getAssistantMessages() {
  return $$('[data-testid="chat-message-assistant"] [data-testid="chat-message-content"]');
}

async function sendAndCheck(question, expectedPattern, timeout = 15000) {
  const beforeMessages = await getAssistantMessages();
  const beforeCount = beforeMessages.length;

  const input = await $('[data-testid="chat-input"]');
  await input.waitForDisplayed({ timeout });
  await input.waitForEnabled({ timeout });
  await input.clearValue().catch(() => {});
  await browser.pause(200);
  await input.setValue(question);

  const send = await $('[data-testid="chat-send"]');
  await send.waitForEnabled({ timeout });
  await send.click();

  await browser.waitUntil(
    async () => {
      const nodes = await getAssistantMessages();
      if (nodes.length <= beforeCount) return false;
      const txt = await nodes[nodes.length - 1].getText();
      return expectedPattern.test(txt);
    },
    { timeout, interval: 500, timeoutMsg: `Pas de réponse pour: ${question}` }
  );

  await input.waitForEnabled({ timeout });
}

describe('TITANE∞ Chat - Compétences, Connaissances, Mémoire (E2E)', () => {
  before(async () => {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    await browser.url('tauri://localhost/#/chat');
    await $('[data-testid="chat-input"]').waitForDisplayed({ timeout: 20000 });
  });

  it('répond à une question de connaissance (capitale)', async () => {
    await sendAndCheck('Quelle est la capitale de la France ?', /paris/i);
  });

  it('répond à une question de compétence (calcul)', async () => {
    await sendAndCheck('Combien font 2 + 2 ?', /\b4\b/);
  });

  it('démontre la mémoire de session', async () => {
    await sendAndCheck('Mon prénom est Testeur.', /testeur/i);
    await sendAndCheck('Peux-tu me rappeler mon prénom ?', /testeur/i);
  });

  it('répond à une question d’identité', async () => {
    await sendAndCheck('Qui es-tu ?', /titane/i);
  });

  it('explique son raisonnement (métacognition)', async () => {
    await sendAndCheck('Explique ton raisonnement.', /logique|raison/i);
  });
});
