import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { openApp, waitAppReady, gotoTopNavPage } from './ui-driver.wdio.js';
import { uiPages } from './page-objects/uiPages.po.js';

const RUN_ID = process.env.TITANE_ADMIN_PROP_RUN_ID || 'preprod_admin_config_propagation';
const ARTIFACT_DIR =
  process.env.TITANE_ADMIN_PROP_ARTIFACT_DIR ||
  path.resolve(process.cwd(), 'reports/preprod_runtime');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function clickWithFallback(element) {
  await element.waitForDisplayed({ timeout: 30000 });

  try {
    await element.click();
    return;
  } catch {
    // Fall through to JS-dispatched click for Wry/WebKit non-interactable cases.
  }

  await browser.execute(el => {
    if (!el) return;
    try {
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
    } catch {
      // Best effort only.
    }
    el.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
      })
    );
  }, element);
}

async function dismissBootBeaconIfPresent() {
  const closeCandidates = [
    '//*[@id="titane-boot-beacon"]//button[contains(normalize-space(.),"Fermer diagnostic")]',
    '//button[contains(normalize-space(.),"Fermer diagnostic")]',
  ];

  for (const selector of closeCandidates) {
    const closeButton = await $(selector);
    if (!(await closeButton.isExisting())) continue;
    if (!(await closeButton.isDisplayed())) continue;

    await clickWithFallback(closeButton);
    await browser.pause(300);
    break;
  }
}

async function getSelectOptionValues(selectElement) {
  return browser.execute(el => {
    if (!el || !el.options) return [];
    return Array.from(el.options)
      .map(option => String(option.value || '').toLowerCase().trim())
      .filter(Boolean);
  }, selectElement);
}

function normalizeDefaultsEnvelope(value) {
  const content = value?.content ?? value?.res?.content ?? value?.res ?? value;
  if (!content || typeof content !== 'object') {
    throw new Error(`invalid defaults envelope: ${JSON.stringify(value)}`);
  }

  const temperature = content.temperature;
  const maxOutputTokens =
    content.maxOutputTokens ?? content.max_output_tokens ?? content.max_tokens;
  const provider = String(content.provider ?? 'auto').toLowerCase();
  const enableStreaming =
    content.enableStreaming ?? content.enable_streaming ?? content.streaming;

  return {
    temperature,
    maxOutputTokens,
    provider,
    enableStreaming,
  };
}

async function invokeTauri(command, args = {}) {
  const result = await browser.executeAsync(
    (payload, done) => {
      const run = async () => {
        const attempts = [];

        if (window.__TAURI__?.core?.invoke) {
          attempts.push(params => window.__TAURI__.core.invoke(payload.command, params));
        }
        if (window.__TAURI__?.tauri?.invoke) {
          attempts.push(params => window.__TAURI__.tauri.invoke(payload.command, params));
        }
        if (window.__TAURI__?.invoke) {
          attempts.push(params => window.__TAURI__.invoke(payload.command, params));
        }
        if (window.__TAURI_INTERNALS__?.invoke) {
          attempts.push(params => window.__TAURI_INTERNALS__.invoke(payload.command, params));
        }

        if (!attempts.length) {
          throw new Error('Tauri IPC unavailable');
        }

        let lastError = 'invoke unavailable';
        for (const attempt of attempts) {
          try {
            return await attempt(payload.args);
          } catch (error) {
            lastError = String(error?.message || error);
          }
        }

        throw new Error(lastError);
      };

      run()
        .then(res => done({ ok: true, res }))
        .catch(err => done({ ok: false, err: String(err?.message || err) }));
    },
    { command, args }
  );

  if (!result?.ok) {
    throw new Error(result?.err || `IPC ${command} failed`);
  }

  return result.res;
}

async function getDefaults() {
  return normalizeDefaultsEnvelope(await invokeTauri('get_chat_request_defaults', {}));
}

async function restoreDefaults(defaults) {
  await invokeTauri('set_chat_request_defaults', {
    defaults: {
      temperature: defaults.temperature,
      maxOutputTokens: defaults.maxOutputTokens,
      provider: defaults.provider,
      enableStreaming: defaults.enableStreaming,
    },
  });
}

async function openAdminConfig() {
  await openApp();
  await browser.execute(() => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem(
      'onboarding_preferences',
      JSON.stringify({
        profile: 'e2e',
        mode: 'default',
      })
    );
  });
  await openApp();
  await waitAppReady();
  await gotoTopNavPage(uiPages.admin);
  await dismissBootBeaconIfPresent();

  const adminPage = await $('[data-testid="page-admin"]');
  await adminPage.waitForExist({ timeout: 30000 });

  const configTab = await $('[data-testid="tab-admin-config"]');
  await configTab.waitForDisplayed({ timeout: 30000 });
  await clickWithFallback(configTab);

  const page = await $('[data-testid="page-configuration-hub"]');
  await page.waitForDisplayed({ timeout: 30000 });

  const aiTab = await $('[data-testid="tab-config-ai"]');
  await aiTab.waitForDisplayed({ timeout: 15000 });
  await clickWithFallback(aiTab);

  const editButton = await $('[data-testid="btn-config-edit"]');
  await editButton.waitForDisplayed({ timeout: 15000 });
  await clickWithFallback(editButton);

  const providerSelect = await $('[data-testid="select-request-provider"]');
  await providerSelect.waitForDisplayed({ timeout: 15000 });
  return providerSelect;
}

async function waitForProviderReadback(expectedProvider) {
  await browser.waitUntil(
    async () => {
      const defaults = await getDefaults();
      return defaults.provider === expectedProvider;
    },
    {
      timeout: 20000,
      interval: 500,
      timeoutMsg: `provider read-back did not become ${expectedProvider}`,
    }
  );
}

describe('PREPROD - ADMIN CONFIG PROPAGATION', () => {
  it('writes request provider via UI, proves IPC read-back, then restores', async function () {
    this.timeout(180000);
    ensureDir(ARTIFACT_DIR);

    const metrics = {
      runId: RUN_ID,
      route: 'tauri://localhost/admin',
      original: null,
      targetProvider: null,
      uiValueBeforeSave: null,
      uiValueAfterSave: null,
      readBackAfterSave: null,
      restored: null,
      currentUrl: null,
      error: null,
      verdict: 'BLOCKED',
    };

    const original = await getDefaults();
    metrics.original = original;

    let restored = false;
    try {
      const providerSelect = await openAdminConfig();
      metrics.currentUrl = await browser.getUrl();
      const uiBefore = String(await providerSelect.getValue()).toLowerCase();
      metrics.uiValueBeforeSave = uiBefore;

      const availableProviders = await getSelectOptionValues(providerSelect);
      const preferredOrder = ['ollama', 'gemini', 'auto'];
      const targetProvider =
        preferredOrder.find(
          provider =>
            availableProviders.includes(provider) && provider !== original.provider
        ) ||
        availableProviders.find(provider => provider !== original.provider);

      metrics.availableProviders = availableProviders;
      assert.ok(targetProvider, 'no alternate provider available for propagation proof');
      metrics.targetProvider = targetProvider;

      await providerSelect.selectByAttribute('value', targetProvider);

      const saveButton = await $('[data-testid="btn-config-save"]');
      await saveButton.waitForExist({ timeout: 10000 });
      await clickWithFallback(saveButton);

      const editButton = await $('[data-testid="btn-config-edit"]');
      await editButton.waitForExist({ timeout: 20000 });

      await waitForProviderReadback(targetProvider);
      metrics.readBackAfterSave = await getDefaults();

      await clickWithFallback(editButton);
      const providerSelectAfter = await $('[data-testid="select-request-provider"]');
      await providerSelectAfter.waitForExist({ timeout: 10000 });
      metrics.uiValueAfterSave = String(await providerSelectAfter.getValue()).toLowerCase();

      assert.equal(
        metrics.readBackAfterSave.provider,
        targetProvider,
        'IPC read-back provider mismatch after UI save'
      );
      assert.equal(
        metrics.uiValueAfterSave,
        targetProvider,
        'UI provider value mismatch after save/read-back'
      );

      metrics.verdict = 'PASS';
    } catch (error) {
      metrics.currentUrl = metrics.currentUrl ?? (await browser.getUrl().catch(() => null));
      metrics.error = String(error?.message || error);
      metrics.verdict = 'FAIL';
      throw error;
    } finally {
      await restoreDefaults(original);
      await waitForProviderReadback(original.provider);
      metrics.restored = await getDefaults();
      restored = metrics.restored.provider === original.provider;
      if (!restored) {
        metrics.verdict = 'FAIL';
      }

      fs.writeFileSync(
        path.join(ARTIFACT_DIR, `${RUN_ID}.json`),
        JSON.stringify(metrics, null, 2)
      );
    }

    assert.equal(metrics.verdict, 'PASS', JSON.stringify(metrics, null, 2));
    assert.equal(restored, true, 'original request defaults were not restored');
  });
});