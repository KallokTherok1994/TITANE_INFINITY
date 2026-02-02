#!/usr/bin/env node
/**
 * Test direct du fallback Ollama
 * Simule un appel depuis le frontend
 */

console.log('🧪 Test Chat TITANE∞ v20.5 - Ollama Fallback\n');

async function testOllamaFallback() {
  console.log('1️⃣ Testing Ollama HTTP direct...');
  
  try {
    const request = {
      model: 'llama3.1:latest',
      prompt: 'Réponds simplement "SYSTÈME OK" si tu me reçois.',
      stream: false,
      options: { temperature: 0.7 }
    };

    console.log('📤 Sending request to Ollama...');
    const startTime = Date.now();
    
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    console.log('✅ SUCCESS!');
    console.log(`📊 Latency: ${latency}ms`);
    console.log(`🤖 Response: ${data.response}`);
    console.log(`📦 Model: ${data.model}`);
    console.log(`✓ Done: ${data.done}`);
    
    return true;
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    return false;
  }
}

async function testOllamaModels() {
  console.log('\n2️⃣ Testing Ollama models list...');
  
  try {
    const response = await fetch('http://127.0.0.1:11434/api/tags');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Models available:');
    data.models?.forEach(m => {
      console.log(`   - ${m.name} (${(m.size / 1024 / 1024 / 1024).toFixed(2)}GB)`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    return false;
  }
}

async function testMultipleMessages() {
  console.log('\n3️⃣ Testing multiple messages...');
  
  const messages = [
    'Dis "TEST 1"',
    'Dis "TEST 2"',
    'Dis "TEST 3"'
  ];

  let successCount = 0;
  
  for (let i = 0; i < messages.length; i++) {
    try {
      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:latest',
          prompt: messages[i],
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Message ${i + 1}: ${data.response.substring(0, 50)}...`);
        successCount++;
      } else {
        console.log(`   ❌ Message ${i + 1}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Message ${i + 1}: ${error.message}`);
    }
  }

  console.log(`\n📊 Success rate: ${successCount}/${messages.length}`);
  return successCount === messages.length;
}

// Run all tests
(async () => {
  const results = {
    fallback: await testOllamaFallback(),
    models: await testOllamaModels(),
    multiple: await testMultipleMessages()
  };

  console.log('\n' + '═'.repeat(50));
  console.log('📊 FINAL RESULTS:');
  console.log('═'.repeat(50));
  console.log(`Ollama Fallback: ${results.fallback ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Models List:     ${results.models ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Multiple Msgs:   ${results.multiple ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Chat system is working.');
    console.log('\n💡 Next: Open TITANE∞ and test in the UI');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Check Ollama status.');
    process.exit(1);
  }
})();
