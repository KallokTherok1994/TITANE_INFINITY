/**
 * Diagnostic WebDriver: Check Tauri API Availability
 * 
 * This test inspects what Tauri APIs are available in the WebDriver context
 * to help debug IPC access issues.
 */

import assert from 'node:assert/strict';

describe('Diagnostic: Tauri API Availability', () => {
  before(async () => {
    await browser.url('tauri://localhost');
    await browser.pause(2000); // Wait for app to fully load
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
    console.log(`  window.__TAURI_INTERNALS__: ${result.hasTAURI_INTERNALS ? '✅ YES' : '❌ NO'}`);
    
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
      const response = await browser.execute(async () => {
        // Tauri 2.0 pattern: Use window.__TAURI_INTERNALS__
        if (window.__TAURI_INTERNALS__) {
          const { invoke } = window.__TAURI_INTERNALS__;
          
          // Try system health check (simpler command)
          return await invoke('get_system_health');
        }
        
        // Fallback: Try window.__TAURI__
        if (window.__TAURI__) {
          const invoke = window.__TAURI__.invoke;
          return await invoke('get_system_health');
        }

        throw new Error('No Tauri API found');
      });

      console.log('\n✅ IPC Call Success:', JSON.stringify(response, null, 2));
      assert.ok(response, 'IPC call returned null');
    } catch (error) {
      console.error('\n❌ IPC Call Failed:', error);
      throw error;
    }
  });

  it('List all global window properties', async () => {
    const properties = await browser.execute(() => {
      const props: string[] = [];
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
