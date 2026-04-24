import assert from 'node:assert/strict';

import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  getModelBadges,
  openChat,
  sendMessage,
} from './ui-driver.wdio.js';

describe('Chat model truth chain (WDIO/Tauri)', () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  it('publishes requested, used and shown model truth from the canonical runtime panel', async function () {
    this.timeout(180000);

    await openChat();
    await sendMessage(
      '[MODEL_TRUTH] Reponds en une phrase courte et expose la verite runtime.'
    );

    const { requested, used, shown, runtime } = await getModelBadges();

    assert.equal(requested, 'gemma2:2b');
    assert.equal(used, 'gemma2:2b');
    assert.equal(shown, 'gemma2:2b');
    assert.match(runtime.providerUsed, /ollama|local|omega/i);
    assert.notEqual(runtime.orchestratorState, '');
  });
});
