#!/usr/bin/env node

/**
 * Test script to verify Tauri detection fix
 * Run in browser console after app starts
 */

const testTauriDetection = () => {
  const w = window as any;

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║ 🧪 TAURI DETECTION TEST - v20.1 FIX                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Test 1: Global flag
  console.log('1️⃣ Initialization Flag');
  console.log('   __TITANE_TAURI_INITIALIZED:', w.__TITANE_TAURI_INITIALIZED ? '✅ YES' : '❌ NO');

  // Test 2: __TAURI__ global
  console.log('\n2️⃣ Window.__TAURI__');
  if (w.__TAURI__) {
    console.log('   ✅ Exists');
    console.log('   __TAURI__.core:', w.__TAURI__.core ? '✅' : '❌');
    console.log('   __TAURI__.core.invoke:', typeof w.__TAURI__.core?.invoke === 'function' ? '✅' : '❌');
  } else {
    console.log('   ❌ Does not exist');
  }

  // Test 3: __TAURI_INTERNALS__
  console.log('\n3️⃣ Window.__TAURI_INTERNALS__');
  if (w.__TAURI_INTERNALS__) {
    console.log('   ✅ Exists');
    console.log('   __TAURI_INTERNALS__.invoke:', typeof w.__TAURI_INTERNALS__.invoke === 'function' ? '✅' : '❌');
  } else {
    console.log('   ❌ Does not exist');
  }

  // Test 4: TauriProtector availability
  console.log('\n4️⃣ TauriProtector Check');
  try {
    const protector = w.window?.safeInvokeTauri ? '✅' : '❌';
    console.log('   safeInvokeTauri available:', protector);
  } catch (e) {
    console.log('   Error:', e);
  }

  // Test 5: Try a simple invoke
  console.log('\n5️⃣ Test Invoke (safe)');
  if (w.__TAURI__?.core?.invoke) {
    console.log('   Attempting health_check...');
    w.__TAURI__.core
      .invoke('health_check')
      .then((result: any) => {
        console.log('   ✅ Invoke SUCCESS:', result);
      })
      .catch((error: any) => {
        console.log('   ❌ Invoke FAILED:', error.message);
      });
  } else {
    console.log('   ❌ __TAURI__.core.invoke not available');
  }

  console.log('\n✅ Test complete. Check logs above.\n');
};

// Expose globally
(window as any).__TEST_TAURI = testTauriDetection;

console.log(
  '🧪 [Test Ready] Run in console: window.__TEST_TAURI() to test Tauri detection'
);

export { testTauriDetection };
