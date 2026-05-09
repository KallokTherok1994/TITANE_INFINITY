import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

import { uiPages } from './page-objects/uiPages.po.js';
import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  gotoTopNavPage,
  sendMessage,
  waitAppReady,
  waitForTabActive,
} from './ui-driver.wdio.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const FULL = process.env.TITANE_E2E_FULL === '1';
const TIMEOUT = 20000;
const testId = id => `[data-testid="${id}"]`;

describe('time-chat-context-sync (WDIO desktop)', () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  describe('S1-S4 — Static source checks', () => {
    let timePageSrc;
    let chatContextSrc;

    before(() => {
      timePageSrc = fs.readFileSync(
        path.resolve(__dirname, '../../src/pages/TimePage.tsx'),
        'utf-8'
      );
      chatContextSrc = fs.readFileSync(
        path.resolve(__dirname, '../../src/services/chat/chatMemorySingleDoor.ts'),
        'utf-8'
      );
    });

    it('S1 — TimePage publishes a visible chat sync status surface', () => {
      expect(timePageSrc.includes('data-testid="time-chat-sync-status"')).toBe(true);
    });

    it('S2 — TimePage persists the governed TIME runtime context key', () => {
      expect(timePageSrc.includes('TIME_RUNTIME_CONTEXT_KEY')).toBe(true);
      expect(timePageSrc.includes('currentSegment: agendaStats.currentSegment')).toBe(
        true
      );
    });

    it('S3 — chatMemorySingleDoor reads the governed TIME runtime context key', () => {
      expect(chatContextSrc.includes('titane_time_runtime_context_v1')).toBe(true);
      expect(chatContextSrc.includes('time_now=')).toBe(true);
      expect(chatContextSrc.includes('time_zone=')).toBe(true);
    });

    it('S4 — conversation context formatting includes TIME situational markers', () => {
      expect(chatContextSrc.includes('time_focus_minutes_today=')).toBe(true);
      expect(chatContextSrc.includes('time_runtime_source=')).toBe(true);
    });
  });

  describe('R1-R2 — Runtime sync checks', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    it('R1 — TIME runtime context stays aligned through the chat handoff', async () => {
      await waitAppReady();
      await gotoTopNavPage(uiPages.time);
      await $(testId('page-time')).waitForDisplayed({ timeout: TIMEOUT });
      await $(testId('tab-time-now')).click();
      await waitForTabActive(testId('tab-time-now'), TIMEOUT);
      await browser.waitUntil(
        async () =>
          browser.execute(() => {
            const marker = document.querySelector(
              '[data-testid="time-chat-sync-status"]'
            );
            const raw = localStorage.getItem('titane_time_runtime_context_v1');
            if (!marker || !raw) return false;
            const parsed = JSON.parse(raw);
            return (
              marker.getAttribute('data-sync-state') === 'active' &&
              typeof parsed.currentDateTime === 'string' &&
              parsed.activeTab === 'now'
            );
          }),
        {
          timeout: TIMEOUT,
          timeoutMsg: 'TIME sync marker or governed runtime context did not appear',
        }
      );

      await $(testId('tab-time-cognitive')).click();
      await waitForTabActive(testId('tab-time-cognitive'), TIMEOUT);
      await browser.waitUntil(
        async () =>
          browser.execute(() => {
            const raw = localStorage.getItem('titane_time_runtime_context_v1');
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            return (
              parsed.activeTab === 'cognitive' && typeof parsed.currentEnergy === 'number'
            );
          }),
        {
          timeout: TIMEOUT,
          timeoutMsg:
            'TIME runtime context was not updated after cognitive tab activation',
        }
      );

      await gotoTopNavPage(uiPages.titane);
      await $(testId('page-titane')).waitForDisplayed({ timeout: TIMEOUT });
      await $(testId('tab-conversation')).waitForDisplayed({ timeout: TIMEOUT });

      await browser.execute(() => {
        window.__TITANE_E2E_CHAT_MOCK__ = true;
        window.__TITANE_E2E_CHAT_SCENARIO__ = 'success';
      });

      await sendMessage(
        'Donne un bref statut temporel interne pour verifier la synchronisation.',
        45000
      );
      const syncState = await browser.execute(() => {
        const timeRaw = localStorage.getItem('titane_time_runtime_context_v1');
        const envelopeRaw = localStorage.getItem('titane_chat_context_envelope_v1');
        const timeContext = timeRaw ? JSON.parse(timeRaw) : null;
        const envelope = envelopeRaw ? JSON.parse(envelopeRaw) : null;
        return {
          timeContext,
          envelopeTimeContext: envelope?.timeContext ?? null,
        };
      });

      assert.ok(
        syncState.envelopeTimeContext,
        'Chat envelope should include TIME runtime context'
      );
      assert.equal(
        syncState.envelopeTimeContext.currentSegment,
        syncState.timeContext?.currentSegment
      );
      assert.equal(
        syncState.envelopeTimeContext.timeZone,
        syncState.timeContext?.timeZone
      );
      assert.equal(
        syncState.envelopeTimeContext.todayFocusMinutes,
        syncState.timeContext?.todayFocusMinutes
      );
      assert.equal(
        syncState.envelopeTimeContext.activeTab,
        syncState.timeContext?.activeTab
      );

      await gotoTopNavPage(uiPages.time);
      await $(testId('page-time')).waitForDisplayed({ timeout: TIMEOUT });
      const markerVisible = await browser.execute(() => {
        const marker = document.querySelector('[data-testid="time-chat-sync-status"]');
        return Boolean(marker && marker.getAttribute('data-sync-state') === 'active');
      });
      assert.equal(markerVisible, true);
    });

    it('R2 — chat envelope retains TIME situational fields after the seeded conversation', async () => {
      const payload = await browser.execute(() => {
        const raw = localStorage.getItem('titane_chat_context_envelope_v1');
        return raw ? JSON.parse(raw) : null;
      });

      assert.equal(typeof payload?.timeContext?.currentDateTime, 'string');
      assert.equal(typeof payload?.timeContext?.timeZone, 'string');
      assert.equal(typeof payload?.timeContext?.eventsToday, 'number');
      assert.equal(typeof payload?.timeContext?.todayFocusMinutes, 'number');
    });
  });
});
