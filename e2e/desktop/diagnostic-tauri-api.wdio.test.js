/**
 * Diagnostic WebDriver: Check Tauri API Availability
 *
 * This test inspects what Tauri APIs are available in the WebDriver context
 * to help debug IPC access issues.
 */

import assert from 'node:assert/strict';

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const DIAG_SCRIPT_TIMEOUT_MS = parsePositiveInt(
  process.env.DIAG_IPC_SCRIPT_TIMEOUT_MS,
  90000
);
const DIAG_TEST_TIMEOUT_MS = parsePositiveInt(process.env.DIAG_TEST_TIMEOUT_MS, 120000);

async function ensureTauriPageLoaded(appUrl) {
  const candidates = [appUrl, 'tauri://localhost/#/chat', 'tauri://localhost'];

  for (const url of candidates) {
    await browser.url(url);
    await browser.pause(1200);
    const href = await browser.execute(() => window.location.href || '');
    if (href.startsWith('tauri://localhost')) {
      return true;
    }
  }

  return false;
}

async function recoverDiagnosticSession(appUrl) {
  try {
    await browser.reloadSession();
  } catch {
    // Session may already be gone; continue with fresh navigation attempts.
  }

  const loaded = await ensureTauriPageLoaded(appUrl);
  if (!loaded) {
    throw new Error('Diagnostic recovery failed: Tauri page unavailable');
  }
}

describe('Diagnostic: Tauri API Availability', () => {
  before(async function () {
    const appUrl = process.env.TITANE_E2E_URL || 'tauri://localhost/#/chat';

    await browser.setTimeout({
      script: DIAG_SCRIPT_TIMEOUT_MS,
      pageLoad: 60000,
      implicit: 0,
    });

    const loaded = await ensureTauriPageLoaded(appUrl);
    if (!loaded) {
      throw new Error(
        'BLOCKER: Tauri page unavailable (about:blank) - environment setup required'
      );
    }
  });

  it('Check window.__TAURI__ availability', async () => {
    const result = await browser.execute(() => {
      return {
        hasTAURI: typeof window.__TAURI__ !== 'undefined',
        hasTAURI_INTERNALS: typeof window.__TAURI_INTERNALS__ !== 'undefined',
        tauriKeys: window.__TAURI__ ? Object.keys(window.__TAURI__) : [],
        internalsKeys: window.__TAURI_INTERNALS__
          ? Object.keys(window.__TAURI_INTERNALS__)
          : [],
      };
    });

    console.log('\n🔍 Tauri API Diagnostic:');
    console.log(`  window.__TAURI__: ${result.hasTAURI ? '✅ YES' : '❌ NO'}`);
    console.log(
      `  window.__TAURI_INTERNALS__: ${result.hasTAURI_INTERNALS ? '✅ YES' : '❌ NO'}`
    );

    if (result.tauriKeys.length > 0) {
      console.log(`  __TAURI__ keys: ${result.tauriKeys.join(', ')}`);
    }

    if (result.internalsKeys.length > 0) {
      console.log(`  __TAURI_INTERNALS__ keys: ${result.internalsKeys.join(', ')}`);
    }

    // At least one should be available
    assert.ok(
      result.hasTAURI || result.hasTAURI_INTERNALS,
      'Neither __TAURI__ nor __TAURI_INTERNALS__ found'
    );
  });

  it('Check if @tauri-apps/api is available', async () => {
    const result = await browser.execute(() => {
      // Try importing @tauri-apps/api dynamically
      return window.__TAURI_METADATA__ || null;
    });

    console.log('\n📦 Tauri Metadata:', result);
  });

  it('Test direct IPC call with @tauri-apps/api/core pattern', async function () {
    const appUrl = process.env.TITANE_E2E_URL || 'tauri://localhost/#/chat';

    // Increase per-test timeout because local generation can exceed default Mocha timeout.
    this.timeout(DIAG_TEST_TIMEOUT_MS);

    try {
      let response = null;
      let lastError = 'IPC invocation failed';

      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          response = await browser.executeAsync(done => {
            const run = async () => {
              const payload = {
                args: {
                  message: '[DIAG] ping',
                  conversationId: `diag-${Date.now()}`,
                  provider: 'local',
                },
              };

              if (window.__TAURI_INTERNALS__?.invoke) {
                return await window.__TAURI_INTERNALS__.invoke(
                  'conversation_generate',
                  payload
                );
              }

              if (window.__TAURI__?.invoke) {
                return await window.__TAURI__.invoke('conversation_generate', payload);
              }

              if (window.__TAURI__?.tauri?.invoke) {
                return await window.__TAURI__.tauri.invoke(
                  'conversation_generate',
                  payload
                );
              }

              if (window.__TAURI__?.core?.invoke) {
                return await window.__TAURI__.core.invoke(
                  'conversation_generate',
                  payload
                );
              }

              throw new Error('No Tauri API found');
            };

            run()
              .then(res => done({ ok: true, res }))
              .catch(err => done({ ok: false, err: String(err?.message || err) }));
          });
        } catch (error) {
          lastError = String(error?.message || error);
          if (
            /script timed out|invalid session id|no such window|page crash|invalidated/i.test(
              lastError
            ) &&
            attempt < 5
          ) {
            await recoverDiagnosticSession(appUrl);
            await browser.pause(300);
            continue;
          }
          throw error;
        }

        if (response?.ok) {
          break;
        }

        lastError = response?.err || lastError;
        if (
          /Origin header is not a valid URL|script timed out|invalid session id|no such window|page crash|invalidated/i.test(
            String(lastError)
          ) &&
          attempt < 5
        ) {
          if (
            /script timed out|invalid session id|no such window|page crash|invalidated/i.test(
              String(lastError)
            )
          ) {
            await recoverDiagnosticSession(appUrl);
          }
          await browser.pause(300);
          continue;
        }
        break;
      }

      if (!response?.ok) {
        throw new Error(lastError);
      }

      console.log('\n✅ IPC Call Success:', JSON.stringify(response.res, null, 2));
      assert.ok(response.res, 'IPC call returned null');
    } catch (error) {
      console.error('\n❌ IPC Call Failed:', error);
      throw error;
    }
  });

  it('List all global window properties', async () => {
    const properties = await browser.execute(() => {
      const props = [];
      for (const key in window) {
        if (key.toUpperCase() === key || key.includes('TAURI') || key.includes('__')) {
          props.push(key);
        }
      }
      return props.sort();
    });

    console.log('\n🔑 Relevant window properties:');
    properties.forEach(prop => console.log(`  - ${prop}`));
  });
});
