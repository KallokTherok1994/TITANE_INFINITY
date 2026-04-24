import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  getChatRuntimeTruth,
  openChat,
  sendMessage,
} from './ui-driver.wdio.js';

const REPORT_DIR = path.resolve(
  process.cwd(),
  'reports/e2e-desktop/chat-orchestrator-advanced-stress'
);
const REPORT_FILE = path.join(REPORT_DIR, 'orchestrator-ui-runtime.json');

async function writeReport(payload) {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(REPORT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

describe('Chat orchestrator Agent UI runtime proof (WDIO/Tauri)', () => {
  const report = {
    suite: 'chat-orchestrator-agent-ui-runtime',
    turns: [],
  };

  before(async () => {
    await ensureArtifactsDir();
    await fs.mkdir(REPORT_DIR, { recursive: true });
  });

  after(async () => {
    await writeReport(report);
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      const screenshotPath = await captureFailureScreenshot(this.currentTest.fullTitle());
      report.failure = {
        test: this.currentTest.fullTitle(),
        screenshotPath,
      };
      await writeReport(report);
    }
  });

  it('keeps the Agent UI connected to orchestrator, memory and governed local model truth', async function () {
    this.timeout(240000);

    await openChat();

    const prompts = [
      '[AGENT_UI_1] Confirme orchestration active en une phrase courte.',
      '[AGENT_UI_2] Confirme memoire runtime visible en une phrase courte.',
      '[AGENT_UI_3] Confirme provider local et modele gouverne en une phrase courte.',
    ];

    for (const prompt of prompts) {
      const runtime = await sendMessage(prompt, 120000);
      report.turns.push({ prompt, runtime });
      assert.match(runtime.providerUsed, /ollama|local|omega/i);
      assert.equal(runtime.ollamaModel, 'gemma2:2b');
      assert.notEqual(runtime.orchestratorState, '');
      assert.notEqual(runtime.memoryState, '');
      assert.notEqual(runtime.providerReason, 'UNKNOWN');
    }

    const finalRuntime = await getChatRuntimeTruth();
    assert.equal(finalRuntime.ollamaModel, 'gemma2:2b');
    assert.ok(report.turns.length >= 3);
  });
});
