/**
 * Diagnostic WebDriver: Check Tauri API Availability
 *
 * This test inspects what Tauri APIs are available in the WebDriver context
 * to help debug IPC access issues.
 */

import assert from 'node:assert/strict';

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

describe('Diagnostic: Tauri API Availability', () => {
  before(async function () {
    const appUrl = process.env.TITANE_E2E_URL || 'tauri://localhost/#/chat';
    const loaded = await ensureTauriPageLoaded(appUrl);
    if (!loaded) {
      console.warn('[DIAG] Tauri page unavailable (about:blank), skipping diagnostic spec');
      this.skip();
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

  it('Test direct IPC call with @tauri-apps/api/core pattern', async () => {
    try {
      let response = null;
      let lastError = 'IPC invocation failed';

      for (let attempt = 1; attempt <= 5; attempt++) {
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
              return await window.__TAURI_INTERNALS__.invoke('conversation_generate', payload);
            }

            if (window.__TAURI__?.invoke) {
              return await window.__TAURI__.invoke('conversation_generate', payload);
            }

            if (window.__TAURI__?.tauri?.invoke) {
              return await window.__TAURI__.tauri.invoke('conversation_generate', payload);
            }

            if (window.__TAURI__?.core?.invoke) {
              return await window.__TAURI__.core.invoke('conversation_generate', payload);
            }

            throw new Error('No Tauri API found');
          };

          run()
            .then(res => done({ ok: true, res }))
            .catch(err => done({ ok: false, err: String(err?.message || err) }));
        });

        if (response?.ok) {
          break;
        }

        lastError = response?.err || lastError;
        if (String(lastError).includes('Origin header is not a valid URL') && attempt < 5) {
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
