import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  captureFailureScreenshot,
  clickAllTabs,
  ensureArtifactsDir,
  gotoTopNavPage,
  openApp,
  sendChatAndAssertNoSilence,
  waitAppReady,
} from './ui-driver.wdio.js';
import { uiPages } from './page-objects/uiPages.po.js';

const CHAT_PROMPT =
  'Réponds en 3 phrases simples sur respiration, alimentation et sommeil pour activer les contrôles audio.';

const ARTIFACTS_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR
  ? path.resolve(process.env.TITANE_E2E_ARTIFACTS_DIR)
  : path.resolve(process.cwd(), 'reports/e2e-desktop');

const METRICS_FILE = path.join(ARTIFACTS_DIR, 'audio_tts_runtime_controls_metrics.json');

const METRICS = {
  chatPrompt: CHAT_PROMPT,
  assistantMessageDetected: false,
  ttsControlsVisible: false,
  ttsStatusAfterRead: null,
  pauseResumePath: 'not-observed',
  stopActionObserved: false,
  replayButtonObserved: false,
  audioCenterVisible: false,
  speakerButtonVisible: false,
  microphoneButtonVisible: false,
  speakerResultObserved: false,
  microphoneResultObserved: false,
  verdict: 'BLOCKED',
};

async function writeMetrics() {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  fs.writeFileSync(METRICS_FILE, JSON.stringify(METRICS, null, 2));
}

async function waitForAnyResultText(timeoutMs = 20000) {
  const pattern = /Test (haut-parleur|microphone) réussi\s*!|Échec du test|Erreur/i;
  await browser.waitUntil(
    async () => {
      const body = await $('body');
      const text = await body.getText();
      return pattern.test(text);
    },
    {
      timeout: timeoutMs,
      interval: 300,
      timeoutMsg: 'No audio test result text detected within timeout',
    }
  );
}

describe('Audio/TTS runtime controls (desktop)', () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
    await writeMetrics();
  });

  it('validates chat TTS controls and audio center runtime buttons', async function () {
    this.timeout(420000);

    await openApp();
    await waitAppReady();

    await gotoTopNavPage(uiPages.titane);
    await clickAllTabs(['[data-testid="tab-conversation"]']);

    await sendChatAndAssertNoSilence(CHAT_PROMPT, 90000);

    await browser.waitUntil(
      async () => {
        const assistants = await $$('[data-testid="chat-message-assistant"]');
        return assistants.length > 0;
      },
      {
        timeout: 90000,
        interval: 400,
        timeoutMsg: 'No assistant message detected after sending prompt',
      }
    );

    const assistantMessages = await $$('[data-testid="chat-message-assistant"]');
    const lastAssistant = assistantMessages[assistantMessages.length - 1];
    METRICS.assistantMessageDetected = true;

    const controls = await lastAssistant.$('[data-testid="message-tts-controls"]');
    await browser.waitUntil(
      async () => controls.isExisting() && controls.isDisplayed(),
      {
        timeout: 30000,
        interval: 300,
        timeoutMsg: 'Per-message TTS controls are not visible on latest assistant message',
      }
    );
    METRICS.ttsControlsVisible = true;

    const readButton = await lastAssistant.$('[data-testid="message-tts-read"]');
    await browser.waitUntil(
      async () => readButton.isExisting() && (await readButton.isDisplayed()),
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'Read button not visible on assistant message',
      }
    );

    // Scroll button into view before clicking (avoids "element not interactable" in overflow containers)
    await browser.execute(el => el.scrollIntoView({ behavior: 'instant', block: 'nearest' }), readButton);
    await browser.pause(400);
    // Use JS click to bypass WebKit interactability guard (element may be in scrolled container)
    await browser.execute(el => el.click(), readButton);
    await browser.pause(1200);

    const status = await lastAssistant.$('[data-testid="message-tts-status"]');
    await browser.waitUntil(
      async () => status.isExisting() && status.isDisplayed(),
      {
        timeout: 10000,
        interval: 250,
        timeoutMsg: 'TTS status element not visible after read action',
      }
    );

    METRICS.ttsStatusAfterRead = await status.getText();
    assert.ok(
      (METRICS.ttsStatusAfterRead || '').length > 0,
      'TTS status text should be populated after read action'
    );

    const pauseButton = await lastAssistant.$('[data-testid="message-tts-pause"]');
    if ((await pauseButton.isExisting()) && (await pauseButton.isDisplayed())) {
      await browser.execute(el => el.scrollIntoView({ behavior: 'instant', block: 'nearest' }), pauseButton);
      await browser.pause(300);
      await browser.execute(el => el.click(), pauseButton);
      await browser.pause(700);

      const resumeButton = await lastAssistant.$('[data-testid="message-tts-resume"]');
      await browser.waitUntil(
        async () => resumeButton.isExisting() && (await resumeButton.isDisplayed()),
        {
          timeout: 10000,
          interval: 250,
          timeoutMsg: 'Resume button not visible after pause action',
        }
      );
      await browser.execute(el => el.scrollIntoView({ behavior: 'instant', block: 'nearest' }), resumeButton);
      await browser.pause(300);
      await browser.execute(el => el.click(), resumeButton);
      METRICS.pauseResumePath = 'executed';
    }

    const stopButton = await lastAssistant.$('[data-testid="message-tts-stop"]');
    if ((await stopButton.isExisting()) && (await stopButton.isDisplayed())) {
      await browser.execute(el => el.scrollIntoView({ behavior: 'instant', block: 'nearest' }), stopButton);
      await browser.pause(300);
      await browser.execute(el => el.click(), stopButton);
      METRICS.stopActionObserved = true;
    }

    await browser.waitUntil(
      async () => {
        const replayOrRead = await lastAssistant.$('[data-testid="message-tts-read"]');
        return replayOrRead.isExisting() && replayOrRead.isDisplayed();
      },
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'Read/replay button not visible after stop or completion',
      }
    );

    const replayOrRead = await lastAssistant.$('[data-testid="message-tts-read"]');
    const replayLabel = await replayOrRead.getText();
    METRICS.replayButtonObserved = /Relire|Lire à haute voix/i.test(replayLabel);
    assert.equal(
      METRICS.replayButtonObserved,
      true,
      'Replay/read button label should be available after TTS run'
    );

    await gotoTopNavPage(uiPages.admin);
    await clickAllTabs(['[data-testid="tab-admin-audio"]']);

    const audioCenterRoot = await $('[data-testid="page-audio-center"]');
    await browser.waitUntil(
      async () => audioCenterRoot.isExisting() && audioCenterRoot.isDisplayed(),
      {
        timeout: 30000,
        interval: 300,
        timeoutMsg: 'Audio Center page is not visible',
      }
    );
    METRICS.audioCenterVisible = true;

    // Navigate to the 'devices' tab within the Audio Center (speaker/mic buttons are there)
    await clickAllTabs(['[data-testid="tab-audio-devices"]']);
    await browser.pause(500);

    const speakerButton = await $('[data-testid="btn-audio-test-speaker"]');
    await browser.waitUntil(
      async () => speakerButton.isExisting() && speakerButton.isDisplayed(),
      {
        timeout: 15000,
        interval: 300,
        timeoutMsg: 'Speaker test button is not visible',
      }
    );
    METRICS.speakerButtonVisible = true;
    await browser.execute(el => el.scrollIntoView({ behavior: 'instant', block: 'nearest' }), speakerButton);
    await browser.pause(300);
    await browser.execute(el => el.click(), speakerButton);
    await waitForAnyResultText(25000);
    METRICS.speakerResultObserved = true;

    const microphoneButton = await $('[data-testid="btn-audio-test-microphone"]');
    await browser.waitUntil(
      async () => microphoneButton.isExisting() && microphoneButton.isDisplayed(),
      {
        timeout: 15000,
        interval: 300,
        timeoutMsg: 'Microphone test button is not visible',
      }
    );
    METRICS.microphoneButtonVisible = true;
    await browser.execute(el => el.scrollIntoView({ behavior: 'instant', block: 'nearest' }), microphoneButton);
    await browser.pause(300);
    await browser.execute(el => el.click(), microphoneButton);
    await waitForAnyResultText(25000);
    METRICS.microphoneResultObserved = true;

    METRICS.verdict = 'PASS';
    await writeMetrics();
  });
});
