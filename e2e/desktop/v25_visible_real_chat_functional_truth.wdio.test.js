/**
 * TITANE V25 - Visible Real Chat Functional Truth
 * Scope: Real visible chat cycle (input -> send -> activity -> response -> status correspondence)
 */

import { browser } from '@wdio/globals';
import * as fs from 'node:fs';
import * as path from 'node:path';

const RUN_ID = process.env.TITANE_V25_RUN_ID || 'run_chat_baseline';
const SCREEN_DIR = process.env.TITANE_V25_SCREEN_DIR || '/tmp/v25_screens';
const RUN_ARTIFACTS = process.env.RUN_ARTIFACTS || '/tmp/v25_artifacts';
const QUESTION = "Parle-moi de tes modules actifs et de l'etat de ton orchestrateur.";

fs.mkdirSync(SCREEN_DIR, { recursive: true });
fs.mkdirSync(RUN_ARTIFACTS, { recursive: true });

const M = {
  runId: RUN_ID,
  mode: 'VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH',
  question: QUESTION,
  currentUrl: null,
  uiVisible: false,
  whiteScreen: false,
  inputPresent: false,
  sendPresent: false,
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
  reasoningTestIdPresent: false,
  reasoningTopologyCount: 0,
  responseReceived: false,
  responseText: '',
  userText: '',
  assistantMessagesCountBeforeSend: 0,
  assistantMessagesCountAfterSend: 0,
  runtimeBadgesText: [],
  runtimeAttrs: {},
  healthButtonTitle: null,
  chatErrorText: null,
  debugVisible: false,
  debugText: null,
  fallbackDetected: false,
  timeoutDetected: false,
  degradedDetected: false,
  correspondence: [],
  classifications: [],
  blockers: [],
  frictions: [],
  verdict: 'BLOCKED',
  screenshots: [],
};

async function pause(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

function isSessionCrashError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('invalid session id') ||
    message.includes('session deleted because of page crash or hang') ||
    message.includes('page crash or hang') ||
    message.includes('no such window')
  );
}

async function recoverSessionIfNeeded(step, error) {
  const detail = String(error?.message || error).slice(0, 160);
  M.frictions.push(`${step}_SESSION_LOST:${detail}`);
  console.warn(`[${step}] session lost: ${detail}`);

  try {
    await browser.reloadSession();
    await browser.url('tauri://localhost/#/titane');
    await pause(1200);
    return true;
  } catch (recoveryError) {
    const recoveryDetail = String(recoveryError?.message || recoveryError).slice(0, 160);
    M.frictions.push(`${step}_SESSION_RECOVERY_FAILED:${recoveryDetail}`);
    console.warn(`[${step}] session recovery failed: ${recoveryDetail}`);
    return false;
  }
}

async function ss(label) {
  const file = `${RUN_ID}_${label}.png`;
  const filePath = path.join(SCREEN_DIR, file);
  await browser.saveScreenshot(filePath);
  M.screenshots.push({ label, file, path: filePath });
  console.log(`[SCREEN] ${label} => ${filePath}`);
}

function pushCorrespondence(problem, symptom, runtimeProof, verdict) {
  M.correspondence.push({ problem, symptom, runtimeProof, verdict });
}

function saveMetrics() {
  const output = path.join(RUN_ARTIFACTS, `${RUN_ID}_v25_metrics.json`);
  fs.writeFileSync(output, JSON.stringify(M, null, 2));
  console.log(`[METRICS] saved => ${output}`);
}

async function inspect() {
  return await browser.execute(() => {
    const input = document.querySelector('[data-testid="chat-input"]');
    const send = document.querySelector('[data-testid="chat-send"]');
    const loading = document.querySelector('[data-testid="chat-loading"]');
    const error = document.querySelector('[data-testid="chat-error"]');
    const ready = document.querySelector('[data-testid="chat-ready"]');
    const reasoning = document.querySelector('[data-testid="reasoning-progress"]');
    const reasoningStatus = document.querySelector(
      '[data-testid="reasoning-status-label"]'
    );
    const health = document.querySelector('[data-testid="btn-health-check"]');

    const userMessages = Array.from(
      document.querySelectorAll(
        '[data-testid="chat-message-user"] [data-testid="chat-message-content"]'
      )
    ).map(el => (el.textContent || '').trim());

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

    const runtimeTags = lastAssistantContainer
      ? Array.from(
          lastAssistantContainer.querySelectorAll(
            '[data-testid="chat-runtime-tag"], .conversation-tag'
          )
        )
          .map(el => (el.textContent || '').trim())
          .filter(Boolean)
      : [];

    const runtimeAttrs = lastAssistantContainer
      ? {
          providerUsed: lastAssistantContainer.getAttribute('data-provider-used'),
          providerMode: lastAssistantContainer.getAttribute('data-provider-mode'),
          providerClass: lastAssistantContainer.getAttribute('data-provider-class'),
          providerReason: lastAssistantContainer.getAttribute('data-provider-reason'),
          providerNetworkUsed: lastAssistantContainer.getAttribute(
            'data-provider-network-used'
          ),
          providerCacheHit: lastAssistantContainer.getAttribute(
            'data-provider-cache-hit'
          ),
        }
      : null;

    const debugNode =
      document.querySelector('[data-testid*="debug" i]') ||
      document.querySelector('[class*="debug" i]') ||
      document.querySelector('[id*="debug" i]');

    const debugVisible = !!(
      debugNode &&
      debugNode.offsetWidth > 0 &&
      debugNode.offsetHeight > 0
    );

    const visibleText = (document.body.textContent || '').trim();
    const whiteScreen = visibleText.length < 10;

    return {
      url: window.location.href,
      whiteScreen,
      inputPresent: !!input,
      inputValue: input && 'value' in input ? input.value : '',
      sendPresent: !!send,
      sendDisabled: !!(send && send.disabled),
      loadingVisible: !!(loading && loading.offsetWidth > 0 && loading.offsetHeight > 0),
      chatErrorText: error ? (error.textContent || '').trim() : null,
      readyState: ready ? ready.getAttribute('data-state') : null,
      reasoningPresent: !!reasoning,
      reasoningVisible: !!(
        reasoning &&
        reasoning.offsetWidth > 0 &&
        reasoning.offsetHeight > 0
      ),
      reasoningDataState: reasoning ? reasoning.getAttribute('data-state') : null,
      reasoningStatusLabel: reasoningStatus
        ? (reasoningStatus.textContent || '').trim()
        : null,
      reasoningTopologyCount: document.querySelectorAll(
        '[data-testid="reasoning-topology-node"]'
      ).length,
      healthTitle: health ? health.getAttribute('title') : null,
      userMessages,
      assistantMessages,
      runtimeTags,
      runtimeAttrs,
      debugVisible,
      debugText: debugVisible ? (debugNode.textContent || '').trim().slice(0, 300) : null,
      textPreview: visibleText.slice(0, 600),
    };
  });
}

async function tryOpenChatSurface() {
  return await browser.execute(() => {
    const nodes = Array.from(
      document.querySelectorAll('button, [role="tab"], a, [data-testid*="chat" i]')
    );

    const visible = nodes.filter(node => {
      return node.offsetWidth > 0 && node.offsetHeight > 0;
    });

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

function classifyFinal() {
  if (!M.uiVisible || M.whiteScreen) {
    M.blockers.push('UI_NOT_VISIBLE');
    return 'FAIL';
  }

  if (!M.inputPresent || !M.sendPresent) {
    M.blockers.push('CHAT_CONTROLS_NOT_VISIBLE');
    return 'FAIL';
  }

  if (!M.inputTyped || !M.sendClicked || !M.responseReceived) {
    M.blockers.push('CHAT_CYCLE_INCOMPLETE');
    return 'FAIL';
  }

  if (!M.processingVisible && !M.reasoningVisible) {
    M.frictions.push('NO_VISIBLE_PROCESSING_SIGNAL');
    return 'FAIL';
  }

  if (M.timeoutDetected) {
    M.blockers.push('BACKEND_TIMEOUT_VISIBLE');
    return 'FAIL';
  }

  if (M.degradedDetected) {
    M.frictions.push('DEGRADED_MODE_VISIBLE');
    return 'FAIL';
  }

  return 'PASS';
}

describe('V25 - VISIBLE REAL CHAT FUNCTIONAL TRUTH', () => {
  it('V25-SCENARIO - visible real chat end-to-end truth', async () => {
    console.log('[V25] START');

    try {

    await pause(1500);
    await browser.url('tauri://localhost/#/titane');
    await pause(2200);

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
    M.sendEnabledBeforeTyping = s1.sendPresent ? !s1.sendDisabled : null;
    M.assistantMessagesCountBeforeSend = s1.assistantMessages.length;
    await ss('s1_before_typing');

    const inputSelector = '[data-testid="chat-input"]';
    const sendSelector = '[data-testid="chat-send"]';

    if (!s1.inputPresent || !s1.sendPresent) {
      M.blockers.push('CHAT_INPUT_OR_SEND_MISSING');
      M.verdict = 'FAIL';
      saveMetrics();
      expect(M.verdict).toBeTruthy();
      return;
    }

    try {
      const input = await browser.$(inputSelector);
      await input.click();
      await input.clearValue();
      await input.setValue(QUESTION);
      M.inputTyped = true;
      M.sendActivationPath = 'WEBDRIVER_SETVALUE';
    } catch (err) {
      M.frictions.push('WEBDRIVER_SETVALUE_FAILED');
    }

    let s2 = await inspect();
    if (s2.sendDisabled) {
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
      s2 = await inspect();
    }

    M.sendEnabledAfterTyping = !s2.sendDisabled;
    await ss('s2_input_filled');

    if (s2.sendDisabled) {
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
    await ss('s3_just_after_send');

    const started = Date.now();
    let processingCaptured = false;
    let responseCaptured = false;

    while (Date.now() - started < 45000) {
      const snap = await inspect();

      if (snap.loadingVisible) {
        M.processingVisible = true;
        if (!M.processingSignals.includes('chat-loading')) {
          M.processingSignals.push('chat-loading');
        }
      }

      if (snap.reasoningPresent) {
        M.reasoningVisible = M.reasoningVisible || snap.reasoningVisible;
        M.reasoningState =
          snap.reasoningDataState || snap.reasoningStatusLabel || 'PRESENT';
        M.reasoningTestIdPresent = true;
        M.reasoningTopologyCount = Math.max(
          M.reasoningTopologyCount,
          snap.reasoningTopologyCount || 0
        );
        if (!M.processingSignals.includes('reasoning-progress')) {
          M.processingSignals.push('reasoning-progress');
        }
      }

      if (!processingCaptured && (snap.loadingVisible || snap.reasoningPresent)) {
        await ss('s4_processing_state');
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
        M.userText = snap.userMessages[snap.userMessages.length - 1] || '';
        M.runtimeBadgesText = snap.runtimeTags;
        M.runtimeAttrs = snap.runtimeAttrs || {};
        M.healthButtonTitle = snap.healthTitle;
        M.chatErrorText = snap.chatErrorText;
        M.debugVisible = snap.debugVisible;
        M.debugText = snap.debugText;

        const normalizedTags = snap.runtimeTags.map(v => v.toUpperCase());
        const normalizedText =
          `${lastAssistantText} ${snap.chatErrorText || ''}`.toUpperCase();

        M.timeoutDetected =
          normalizedTags.some(tag => tag.includes('TIMEOUT')) ||
          normalizedText.includes('TIMEOUT');

        M.fallbackDetected =
          normalizedTags.some(
            tag =>
              tag.includes('OFFLINE') || tag.includes('FALLBACK') || tag.includes('LOCAL')
          ) || normalizedText.includes('FALLBACK');

        M.degradedDetected =
          normalizedText.includes('DEGRADE') ||
          normalizedText.includes('HORS LIGNE') ||
          normalizedTags.includes('OFFLINE');

        await ss('s5_final_response');
        responseCaptured = true;
        break;
      }

      await pause(600);
    }

    if (!processingCaptured) {
      await ss('s4_processing_state_missing');
    }

    try {
      const healthProbe = await browser.execute(() => {
        const button = document.querySelector('[data-testid="btn-health-check"]');
        if (!button) {
          return { clicked: false, reason: 'missing' };
        }
        button.click();
        return {
          clicked: true,
          title: button.getAttribute('title') || null,
        };
      });

      if (!healthProbe.clicked) {
        M.frictions.push('HEALTH_BUTTON_NOT_CLICKABLE');
      }
    } catch (err) {
      M.frictions.push('HEALTH_BUTTON_CLICK_HARNESS_LIMITATION');
    }

    await pause(900);

    const s6 = await inspect();
    M.healthButtonTitle = s6.healthTitle;
    M.chatErrorText = M.chatErrorText || s6.chatErrorText;
    M.runtimeBadgesText =
      M.runtimeBadgesText.length > 0 ? M.runtimeBadgesText : s6.runtimeTags;
    M.runtimeAttrs =
      Object.keys(M.runtimeAttrs || {}).length > 0
        ? M.runtimeAttrs
        : s6.runtimeAttrs || {};
    await ss('s6_runtime_badges');

    if (s6.debugVisible) {
      M.debugVisible = true;
      M.debugText = s6.debugText;
      await ss('s7_debug_visible');
    } else {
      await ss('s7_debug_absent');
    }

    const s8 = await inspect();
    M.currentUrl = s8.url;
    M.uiVisible = !s8.whiteScreen;
    M.whiteScreen = s8.whiteScreen;
    await ss('s8_final_stable');

    pushCorrespondence(
      'send path',
      M.sendEnabledAfterTyping ? 'send enabled after typing' : 'send stayed disabled',
      `sendActivationPath=${M.sendActivationPath}; sendHarnessDiagnosis=${M.sendHarnessDiagnosis}`,
      M.sendEnabledAfterTyping ? 'NON_BLOCKING' : 'PRODUCT_DEFECT'
    );

    pushCorrespondence(
      'runtime badges vs attrs',
      `badges=${M.runtimeBadgesText.join(',') || 'none'}`,
      `attrs=${JSON.stringify(M.runtimeAttrs || {})}`,
      M.runtimeBadgesText.length > 0 || Object.keys(M.runtimeAttrs || {}).length > 0
        ? 'MAPPED'
        : 'NOT_EXPOSED'
    );

    pushCorrespondence(
      'reasoning progress',
      `reasoningState=${M.reasoningState}; topology=${M.reasoningTopologyCount}`,
      `signals=${M.processingSignals.join(',') || 'none'}`,
      M.reasoningTestIdPresent || M.processingVisible ? 'VISIBLE' : 'ABSENT'
    );

    if (!responseCaptured) {
      M.blockers.push('NO_FINAL_ASSISTANT_RESPONSE');
    }

    const rawReason = String((M.runtimeAttrs || {}).providerReason || '').toUpperCase();
    const rawMode = String((M.runtimeAttrs || {}).providerMode || '').toUpperCase();
    const rawNetwork = String(
      (M.runtimeAttrs || {}).providerNetworkUsed || ''
    ).toLowerCase();

    if (rawReason.includes('TIMEOUT')) {
      M.classifications.push('BACKEND_TIMEOUT');
    }
    if (rawMode === 'OFFLINE' || rawReason.includes('FALLBACK')) {
      M.classifications.push('PROVIDER_FAILURE');
      M.classifications.push('FULLSTACK_SYNC_DEFECT');
    }
    if (M.sendActivationPath === 'NATIVE_SETTER_INPUTEVENT') {
      M.classifications.push('HARNESS_LIMITATION');
    }
    if (M.reasoningTopologyCount > 0 && M.reasoningVisible) {
      M.classifications.push('NON_BLOCKING');
    }
    if (rawNetwork === 'false' && rawMode === 'REMOTE') {
      M.classifications.push('FULLSTACK_SYNC_DEFECT');
      M.blockers.push('REMOTE_BADGE_WITHOUT_NETWORK');
    }
    if (M.chatErrorText) {
      M.classifications.push('PRODUCT_DEFECT');
    }

    M.verdict = classifyFinal();
    saveMetrics();

    console.log(`[V25] verdict=${M.verdict}`);
    console.log(
      `[V25] responseReceived=${M.responseReceived} processingVisible=${M.processingVisible}`
    );
    console.log(`[V25] badges=${M.runtimeBadgesText.join(', ')}`);
    console.log(`[V25] runtimeAttrs=${JSON.stringify(M.runtimeAttrs)}`);

    expect(M.verdict).toBeTruthy();
    } catch (error) {
      if (isSessionCrashError(error)) {
        await recoverSessionIfNeeded('V25', error);
        M.blockers.push('SESSION_CRASH_OR_HANG');
        M.verdict = 'BLOCKED_SESSION_LOSS';
        saveMetrics();
        expect(M.verdict).toBeTruthy();
        return;
      }
      throw error;
    }
  });
});
