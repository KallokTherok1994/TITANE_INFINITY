/**
 * TITANE∞ - Test Chat IA Integration
 * Exécuter dans DevTools Console (F12)
 *
 * Tests:
 * 1. Provider Status Check
 * 2. Ollama Message
 * 3. Gemini Message
 * 4. Auto Cascade (Gemini → Ollama → Local)
 */

console.log('🚀 TITANE∞ Chat IA Integration Test');
console.log('=====================================\n');

async function runTests() {
  try {
    // ─────────────────────────────────────────────────────────────
    // TEST 1: Provider Status
    // ─────────────────────────────────────────────────────────────
    console.log('📊 TEST 1: Checking providers status...');
    const status = await window.__TAURI__.core.invoke('chat_get_providers_status');
    console.table(status);
    console.log('✅ Test 1 PASS\n');

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Ollama Direct
    // ─────────────────────────────────────────────────────────────
    console.log('🦙 TEST 2: Sending message to Ollama...');
    const ollamaResponse = await window.__TAURI__.core.invoke('chat_send_message', {
      request: {
        message: "Présente-toi en une phrase courte",
        provider: "ollama",
        streaming: false
      }
    });
    console.log('📝 Ollama response:', ollamaResponse.message.content);
    console.log(`⏱️  Latency: ${ollamaResponse.latency_ms}ms`);
    console.log('✅ Test 2 PASS\n');

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Gemini Direct
    // ─────────────────────────────────────────────────────────────
    console.log('🌐 TEST 3: Sending message to Gemini...');
    const geminiResponse = await window.__TAURI__.core.invoke('chat_send_message', {
      request: {
        message: "Réponds brièvement: que peux-tu faire?",
        provider: "gemini",
        model: "gemini-2.0-flash-exp",
        streaming: false
      }
    });
    console.log('📝 Gemini response:', geminiResponse.message.content);
    console.log(`⏱️  Latency: ${geminiResponse.latency_ms}ms`);
    console.log('✅ Test 3 PASS\n');

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Auto Cascade (Gemini → Ollama → Local)
    // ─────────────────────────────────────────────────────────────
    console.log('🔄 TEST 4: Auto provider cascade...');
    const autoResponse = await window.__TAURI__.core.invoke('chat_send_message', {
      request: {
        message: "Test cascade: que peux-tu me dire sur TITANE?",
        provider: "auto", // Will try: gemini → ollama → local
        streaming: false
      }
    });
    console.log(`📝 Auto cascade winner: ${autoResponse.message.provider}`);
    console.log('📝 Response:', autoResponse.message.content.substring(0, 100) + '...');
    console.log(`⏱️  Latency: ${autoResponse.latency_ms}ms`);
    console.log('✅ Test 4 PASS\n');

    // ─────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('=====================================');
    console.log('✅ Providers Status: OK');
    console.log('✅ Ollama: Responding');
    console.log('✅ Gemini: Responding');
    console.log('✅ Auto Cascade: Working');
    console.log('\n📊 CHAT IA 100% FONCTIONNEL');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Exécuter les tests
runTests();
