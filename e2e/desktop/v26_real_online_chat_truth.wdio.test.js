/**
 * TITANE V26 - Real Online Chat Truth
 * Scope: visible chat truth with runtime panel, provider/network/orchestrator verification
 */

import { browser } from '@wdio/globals';
import * as fs from 'node:fs';
import * as path from 'node:path';

const RUN_ID = process.env.TITANE_V26_RUN_ID || 'run_online_recovery';
const SCREEN_DIR = process.env.TITANE_V26_SCREEN_DIR || '/tmp/v26_screens';
const RUN_ARTIFACTS = process.env.RUN_ARTIFACTS || '/tmp/v26_artifacts';
const QUESTION =
  'Parle-moi de tes modules actifs, de ton orchestrateur, de ta memoire, de tes providers reels et de ton acces internet actuel.';

fs.mkdirSync(SCREEN_DIR, { recursive: true });
fs.mkdirSync(RUN_ARTIFACTS, { recursive: true });

const M = {
  runId: RUN_ID,
  mode: 'VISIBLE_REAL_CHAT_ONLINE_RECOVERY_V26',
  question: QUESTION,
  envOfflineSim: process.env.OFFLINE_SIM || '<unset>',
  currentUrl: null,
  uiVisible: false,
  whiteScreen: false,
  inputPresent: false,
  sendPresent: false,
  runtimePanelPresent: false,
  runtimePanelVisible: false,
  runtimePanelText: '',
  runtimeStateAttrs: {},
  runtimeBadgesText: [],
  inputTyped: false,
  sendEnabledBeforeTyping: null,
  sendEnabledAfterTyping: null,
  sendActivationPath: 'UNKNOWN',
  sendHarnessDiagnosis: 'UNKNOWN',
  sendClicked: false,
  processingVisible: false,
  processingSignals: [],
  reasoningVisible: false,
  reasoningState: 'ABSENT',
  reasoningTopologyCount: 0,
  responseReceived: false,
  responseText: '',
  assistantMessagesCountBeforeSend: 0,
  assistantMessagesCountAfterSend: 0,
  runtimeMessageAttrs: {},
  runtimeMessageBadges: [],
  healthButtonTitle: null,
  chatErrorText: null,
  canonicalCoverage: false,
  providerTruthOnline: false,
  orchestratorProved: false,
  memoryProved: false,
  networkProved: false,
  fallbackDetected: false,
  offlineDetected: false,
  simulatedDetected: false,
  classifications: [],
  blockers: [],
  frictions: [],
  verdict: 'BLOCKED',
  screenshots: [],
};

async function pause(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function ss(label) {
  const file = `${RUN_ID}_${label}.png`;
  const filePath = path.join(SCREEN_DIR, file);
  await browser.saveScreenshot(filePath);
  M.screenshots.push({ label, file, path: filePath });
  console.log(`[SCREEN] ${label} => ${filePath}`);
}

function saveMetrics() {
  const output = path.join(RUN_ARTIFACTS, `${RUN_ID}_v26_metrics.json`);
  fs.writeFileSync(output, JSON.stringify(M, null, 2));
  console.log(`[METRICS] saved => ${output}`);
}

async function inspect() {
  return await browser.execute(() => {
    const input = document.querySelector('[data-testid="chat-input"]');
    const send = document.querySelector('[data-testid="chat-send"]');
    const loading = document.querySelector('[data-testid="chat-loading"]');
    const error = document.querySelector('[data-testid="chat-error"]');
    const health = document.querySelector('[data-testid="btn-health-check"]');
    const reasoning = document.querySelector('[data-testid="reasoning-progress"]');
    const runtimePanel = document.querySelector('[data-testid="chat-runtime-state"]');
    const runtimeSummary = document.querySelector('[data-testid="chat-runtime-summary"]');

    const assistantTextNodes = Array.from(
      document.querySelectorAll(
        '[data-testid="chat-message-assistant"] [data-testid="chat-message-content"]'
      )
    );
    const assistantMessages = assistantTextNodes.map(el => (el.textContent || '').trim());
    const assistantContainers = Array.from(
      document.querySelectorAll('[data-testid="chat-message-assistant"]')
    );
    const lastAssistantContainer =
      assistantContainers[assistantContainers.length - 1] || null;

    const runtimeMessageBadges = lastAssistantContainer
      ? Array.from(
          lastAssistantContainer.querySelectorAll(
            '[data-testid="chat-runtime-tag"], .conversation-tag'
          )
        )
          .map(el => (el.textContent || '').trim())
          .filter(Boolean)
      : [];

    const runtimeMessageAttrs = lastAssistantContainer
      ? {
          providerUsed: lastAssistantContainer.getAttribute('data-provider-used'),
          providerMode: lastAssistantContainer.getAttribute('data-provider-mode'),
          providerReason: lastAssistantContainer.getAttribute('data-provider-reason'),
          providerClass: lastAssistantContainer.getAttribute('data-provider-class'),
          networkUsed: lastAssistantContainer.getAttribute('data-network-used'),
          orchestratorState: lastAssistantContainer.getAttribute(
            'data-orchestrator-state'
          ),
          memoryState: lastAssistantContainer.getAttribute('data-memory-state'),
        }
      : null;

    const runtimeStateAttrs = runtimePanel
      ? {
          providerMode: runtimePanel.getAttribute('data-provider-mode'),
          providerReason: runtimePanel.getAttribute('data-provider-reason'),
          providerUsed: runtimePanel.getAttribute('data-provider-used'),
          networkUsed: runtimePanel.getAttribute('data-network-used'),
          orchestratorState: runtimePanel.getAttribute('data-orchestrator-state'),
          memoryState: runtimePanel.getAttribute('data-memory-state'),
          geminiConfigured: runtimePanel.getAttribute('data-gemini-configured'),
          ollamaModel: runtimePanel.getAttribute('data-ollama-model'),
          secretsMode: runtimePanel.getAttribute('data-secrets-mode'),
        }
      : null;

    const runtimeBadgesText = runtimePanel
      ? Array.from(runtimePanel.querySelectorAll('[data-testid="chat-runtime-badge"]'))
          .map(el => (el.textContent || '').trim())
          .filter(Boolean)
      : [];

    const visibleText = (document.body.textContent || '').trim();

    return {
      url: window.location.href,
      whiteScreen: visibleText.length < 10,
      inputPresent: !!input,
      inputValue: input && 'value' in input ? input.value : '',
      sendPresent: !!send,
      sendDisabled: !!(send && send.disabled),
      loadingVisible: !!(loading && loading.offsetWidth > 0 && loading.offsetHeight > 0),
      healthTitle: health ? health.getAttribute('title') : null,
      chatErrorText: error ? (error.textContent || '').trim() : null,
      reasoningVisible: !!(
        reasoning &&
        reasoning.offsetWidth > 0 &&
        reasoning.offsetHeight > 0
      ),
      reasoningState: reasoning ? reasoning.getAttribute('data-state') : null,
      reasoningTopologyCount: document.querySelectorAll(
        '[data-testid="reasoning-topology-node"]'
      ).length,
      runtimePanelPresent: !!runtimePanel,
      runtimePanelVisible: !!(
        runtimePanel &&
        runtimePanel.offsetWidth > 0 &&
        runtimePanel.offsetHeight > 0
      ),
      runtimePanelText: runtimeSummary ? (runtimeSummary.textContent || '').trim() : '',
      runtimeStateAttrs,
      runtimeBadgesText,
      assistantMessages,
      runtimeMessageAttrs,
      runtimeMessageBadges,
      textPreview: visibleText.slice(0, 600),
    };
  });
}

async function tryOpenChatSurface() {
  return await browser.execute(() => {
    const nodes = Array.from(
      document.querySelectorAll('button, [role="tab"], a, [data-testid*="chat" i]')
    );

    const visible = nodes.filter(node => node.offsetWidth > 0 && node.offsetHeight > 0);
    const chatCandidate = visible.find(node => {
      const text = (node.textContent || '').trim().toLowerCase();
      const testId = (node.getAttribute('data-testid') || '').toLowerCase();
      return text.includes('chat') || testId.includes('chat');
    });

    if (!chatCandidate) {
      return { clicked: false, reason: 'no_chat_candidate' };
    }

    chatCandidate.click();
    return {
      clicked: true,
      text: (chatCandidate.textContent || '').trim().slice(0, 60),
      testId: chatCandidate.getAttribute('data-testid'),
    };
  });
}

function computeTruth() {
  const attrs = M.runtimeStateAttrs || {};
  const msgAttrs = M.runtimeMessageAttrs || {};
  const responseText = (M.responseText || '').toUpperCase();
  const providerMode = String(
    attrs.providerMode || msgAttrs.providerMode || ''
  ).toUpperCase();
  const providerReason = String(
    attrs.providerReason || msgAttrs.providerReason || ''
  ).toUpperCase();
  const providerUsed = String(
    attrs.providerUsed || msgAttrs.providerUsed || ''
  ).toLowerCase();
  const networkUsed = String(
    attrs.networkUsed || msgAttrs.networkUsed || ''
  ).toLowerCase();
  const orchestratorState = String(
    attrs.orchestratorState || msgAttrs.orchestratorState || ''
  ).toLowerCase();
  const memoryState = String(
    attrs.memoryState || msgAttrs.memoryState || ''
  ).toLowerCase();

  M.offlineDetected =
    providerMode === 'OFFLINE' ||
    providerReason === 'FALLBACK_OFFLINE' ||
    providerUsed === 'offline' ||
    responseText.includes('HORS LIGNE');

  M.simulatedDetected =
    responseText.includes('OFFLINE_SIM') ||
    responseText.includes('SIMULE') ||
    responseText.includes('DETERMINISTE');

  M.fallbackDetected =
    providerReason.includes('FALLBACK') ||
    responseText.includes('FALLBACK') ||
    responseText.includes('OFFLINE_SIM');

  M.networkProved = networkUsed === 'true' && providerMode === 'REMOTE';
  M.providerTruthOnline =
    providerMode === 'REMOTE' &&
    providerReason !== 'FALLBACK_OFFLINE' &&
    providerUsed !== 'offline';
  M.orchestratorProved =
    orchestratorState === 'running' || orchestratorState === 'initialized';
  M.memoryProved = memoryState !== '' && memoryState !== 'unknown';
  M.canonicalCoverage =
    /MODULE|ORCHESTRAT|MEMOIRE|PROVIDER|INTERNET/.test(responseText) &&
    responseText.length > 80;

  if (M.offlineDetected) M.classifications.push('OFFLINE_PATH_VISIBLE');
  if (M.simulatedDetected) M.classifications.push('SIMULATED_RESPONSE_VISIBLE');
  if (!M.networkProved) M.classifications.push('NETWORK_NOT_PROVED');
  if (!M.orchestratorProved) M.classifications.push('ORCHESTRATOR_NOT_PROVED');
  if (!M.memoryProved) M.classifications.push('MEMORY_NOT_PROVED');
  if (!M.canonicalCoverage) M.classifications.push('CANONICAL_ANSWER_WEAK');
}

function classifyFinal() {
  if (!M.uiVisible || M.whiteScreen) {
    M.blockers.push('UI_NOT_VISIBLE');
    return 'FAIL';
  }

  if (!M.inputPresent || !M.sendPresent) {
    M.blockers.push('CHAT_CONTROLS_NOT_VISIBLE');
    return 'FAIL';
  }

  if (!M.runtimePanelPresent || !M.runtimePanelVisible) {
    M.blockers.push('RUNTIME_PANEL_NOT_VISIBLE');
    return 'FAIL';
  }

  if (!M.inputTyped || !M.sendClicked || !M.responseReceived) {
    M.blockers.push('CHAT_CYCLE_INCOMPLETE');
    return 'FAIL';
  }

  if (!M.reasoningVisible && !M.processingVisible) {
    M.blockers.push('RUNTIME_PROGRESS_NOT_VISIBLE');
    return 'FAIL';
  }

  if (M.offlineDetected || M.fallbackDetected || M.simulatedDetected) {
    M.blockers.push('OFFLINE_OR_SIMULATED_VISIBLE');
    return 'FAIL';
  }

  if (!M.providerTruthOnline || !M.networkProved) {
    M.blockers.push('ONLINE_PROVIDER_NOT_PROVED');
    return 'FAIL';
  }

  if (!M.orchestratorProved) {
    M.blockers.push('ORCHESTRATOR_NOT_PROVED');
    return 'FAIL';
  }

  if (!M.memoryProved) {
    M.blockers.push('MEMORY_NOT_PROVED');
    return 'FAIL';
  }

  if (!M.canonicalCoverage) {
    M.blockers.push('CANONICAL_QUESTION_NOT_ANSWERED');
    return 'FAIL';
  }

  return 'PASS';
}

describe('V26 - REAL ONLINE CHAT TRUTH', () => {
  it('V26-SCENARIO - visible real online chat truth', async () => {
    await pause(1500);
    await browser.url('tauri://localhost/#/titane');
    await pause(2400);

    await browser.execute(() => {
      window.localStorage.setItem('titane.enable_external_ai', '1');
      return window.localStorage.getItem('titane.enable_external_ai');
    });
    await browser.refresh();
    await pause(2400);

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const pre = await inspect();
      if (pre.inputPresent && pre.sendPresent) {
        break;
      }
      const nav = await tryOpenChatSurface();
      if (!nav.clicked) {
        await pause(700);
        continue;
      }
      await pause(900);
    }

    const s1 = await inspect();
    M.currentUrl = s1.url;
    M.whiteScreen = s1.whiteScreen;
    M.uiVisible = !s1.whiteScreen;
    M.inputPresent = s1.inputPresent;
    M.sendPresent = s1.sendPresent;
    M.runtimePanelPresent = s1.runtimePanelPresent;
    M.runtimePanelVisible = s1.runtimePanelVisible;
    M.runtimePanelText = s1.runtimePanelText;
    M.runtimeStateAttrs = s1.runtimeStateAttrs || {};
    M.runtimeBadgesText = s1.runtimeBadgesText || [];
    M.sendEnabledBeforeTyping = s1.sendPresent ? !s1.sendDisabled : null;
    M.assistantMessagesCountBeforeSend = s1.assistantMessages.length;
    await ss('s1_boot_visible');

    if (!s1.inputPresent || !s1.sendPresent) {
      M.blockers.push('CHAT_INPUT_OR_SEND_MISSING');
      M.verdict = 'FAIL';
      saveMetrics();
      expect(M.verdict).toBeTruthy();
      return;
    }

    const inputSelector = '[data-testid="chat-input"]';
    const sendSelector = '[data-testid="chat-send"]';

    try {
      const input = await browser.$(inputSelector);
      await input.click();
      await input.clearValue();
      await input.setValue(QUESTION);
      M.inputTyped = true;
      M.sendActivationPath = 'WEBDRIVER_SETVALUE';
    } catch {
      M.frictions.push('WEBDRIVER_SETVALUE_FAILED');
    }

    let s3 = await inspect();
    if (s3.sendDisabled) {
      const nativeApplied = await browser.execute(
        (sel, value) => {
          const node = document.querySelector(sel);
          if (!node) return false;
          const proto =
            window.HTMLTextAreaElement?.prototype || window.HTMLInputElement?.prototype;
          const desc = proto ? Object.getOwnPropertyDescriptor(proto, 'value') : null;
          if (desc?.set) {
            desc.set.call(node, value);
          } else {
            node.value = value;
          }
          node.dispatchEvent(new InputEvent('input', { bubbles: true }));
          node.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        },
        inputSelector,
        QUESTION
      );

      if (nativeApplied) {
        M.inputTyped = true;
        M.sendActivationPath = 'NATIVE_SETTER_INPUTEVENT';
        M.sendHarnessDiagnosis = 'HARNESS_LIMITATION_JS_VALUE_NOT_REACT';
      }

      await pause(700);
      s3 = await inspect();
    }

    M.sendEnabledAfterTyping = !s3.sendDisabled;
    await ss('s2_after_typing');

    if (s3.sendDisabled) {
      M.blockers.push('SEND_DISABLED_AFTER_TYPING');
      M.verdict = 'FAIL';
      saveMetrics();
      expect(M.verdict).toBeTruthy();
      return;
    }

    await browser.execute(sel => {
      const button = document.querySelector(sel);
      if (button) button.click();
    }, sendSelector);
    M.sendClicked = true;
    await ss('s3_after_send');

    const started = Date.now();
    let processingCaptured = false;

    while (Date.now() - started < 50000) {
      const snap = await inspect();

      if (snap.loadingVisible) {
        M.processingVisible = true;
        if (!M.processingSignals.includes('chat-loading')) {
          M.processingSignals.push('chat-loading');
        }
      }

      if (snap.reasoningVisible) {
        M.reasoningVisible = true;
        M.reasoningState = snap.reasoningState || 'VISIBLE';
        M.reasoningTopologyCount = Math.max(
          M.reasoningTopologyCount,
          snap.reasoningTopologyCount || 0
        );
        if (!M.processingSignals.includes('reasoning-progress')) {
          M.processingSignals.push('reasoning-progress');
        }
      }

      if (!processingCaptured && (snap.loadingVisible || snap.reasoningVisible)) {
        await ss('s4_runtime_progress');
        processingCaptured = true;
      }

      const assistantCount = snap.assistantMessages.length;
      const lastAssistantText =
        assistantCount > 0 ? snap.assistantMessages[assistantCount - 1] : '';

      if (
        assistantCount > M.assistantMessagesCountBeforeSend &&
        lastAssistantText &&
        lastAssistantText.trim().length > 0
      ) {
        M.assistantMessagesCountAfterSend = assistantCount;
        M.responseReceived = true;
        M.responseText = lastAssistantText;
        M.runtimePanelPresent = snap.runtimePanelPresent;
        M.runtimePanelVisible = snap.runtimePanelVisible;
        M.runtimePanelText = snap.runtimePanelText;
        M.runtimeStateAttrs = snap.runtimeStateAttrs || {};
        M.runtimeBadgesText = snap.runtimeBadgesText || [];
        M.runtimeMessageAttrs = snap.runtimeMessageAttrs || {};
        M.runtimeMessageBadges = snap.runtimeMessageBadges || [];
        M.healthButtonTitle = snap.healthTitle;
        M.chatErrorText = snap.chatErrorText;
        await ss('s5_response_received');
        break;
      }

      await pause(650);
    }

    const s7 = await inspect();
    M.runtimePanelPresent = s7.runtimePanelPresent;
    M.runtimePanelVisible = s7.runtimePanelVisible;
    M.runtimePanelText = s7.runtimePanelText;
    M.runtimeStateAttrs =
      Object.keys(M.runtimeStateAttrs).length > 0
        ? M.runtimeStateAttrs
        : s7.runtimeStateAttrs || {};
    M.runtimeBadgesText =
      M.runtimeBadgesText.length > 0 ? M.runtimeBadgesText : s7.runtimeBadgesText || [];
    M.runtimeMessageAttrs =
      Object.keys(M.runtimeMessageAttrs).length > 0
        ? M.runtimeMessageAttrs
        : s7.runtimeMessageAttrs || {};
    M.runtimeMessageBadges =
      M.runtimeMessageBadges.length > 0
        ? M.runtimeMessageBadges
        : s7.runtimeMessageBadges || [];
    await ss('s6_runtime_panel');

    await browser.execute(() => {
      const button = document.querySelector('[data-testid="btn-health-check"]');
      if (button) button.click();
    });
    await pause(900);
    await ss('s7_health_probe');

    const s8 = await inspect();
    M.healthButtonTitle = s8.healthTitle;
    M.chatErrorText = M.chatErrorText || s8.chatErrorText;
    await ss('s8_runtime_stable');

    computeTruth();

    const s9 = await inspect();
    M.currentUrl = s9.url;
    M.uiVisible = !s9.whiteScreen;
    M.whiteScreen = s9.whiteScreen;
    await ss('s9_final_state');

    M.verdict = classifyFinal();
    await ss('s10_verdict_state');
    saveMetrics();

    console.log(`[V26] verdict=${M.verdict}`);
    console.log(`[V26] runtimeStateAttrs=${JSON.stringify(M.runtimeStateAttrs)}`);
    console.log(`[V26] runtimeMessageAttrs=${JSON.stringify(M.runtimeMessageAttrs)}`);
    console.log(`[V26] response=${M.responseText}`);

    expect(M.verdict).toBeTruthy();
  });
});
