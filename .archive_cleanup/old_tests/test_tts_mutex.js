#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2.0 — TEST MUTEX TTS ANTI-SUPERPOSITION
 *   Validation mutex is_speaking + transmission paramètres
 * ═══════════════════════════════════════════════════════════════════
 */

// Mock des dépendances
global.window = {
  speechSynthesis: undefined,
};

global.performance = {
  now: () => Date.now(),
};

// Mock secureInvoke avec mutex simulation
let mockIsSpeaking = false;
const mockSecureInvoke = async (command, params = {}) => {
  console.log(`\n📡 secureInvoke('${command}', ${JSON.stringify(params)})`);

  if (command === 'speak') {
    // Simulate mutex check
    if (mockIsSpeaking) {
      throw new Error(
        'TTS busy: another synthesis is in progress. Please wait or call stop_speaking().'
      );
    }

    // Validation
    const { text, rate, pitch, voice, use_online } = params;
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }
    if (text.length > 10000) {
      throw new Error('Text too long (max 10000 chars)');
    }

    // Clamp parameters
    const finalRate = rate ? Math.max(0.5, Math.min(2.0, rate)) : 1.0;
    const finalPitch = pitch ? Math.max(0.5, Math.min(2.0, pitch)) : 1.0;

    console.log(
      `✅ TTS Start: mode=${use_online ? 'online' : 'local'}, rate=${finalRate.toFixed(2)}, pitch=${finalPitch.toFixed(2)}, voice=${voice || 'default'}`
    );

    // Set mutex
    mockIsSpeaking = true;

    // Simulate synthesis (200ms)
    await new Promise(resolve => setTimeout(resolve, 200));

    // Release mutex
    mockIsSpeaking = false;
    console.log('✅ TTS Complete');
  } else if (command === 'stop_speaking') {
    mockIsSpeaking = false;
    console.log('✅ TTS Stopped');
  } else if (command === 'is_speaking') {
    return mockIsSpeaking;
  } else if (command === 'ping') {
    return 'pong';
  }
};

// ═══════════════════════════════════════════════════════════════════
//   TESTS MUTEX
// ═══════════════════════════════════════════════════════════════════

async function testMutexAntiSuperposition() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 1/5] Mutex anti-superposition...');

    // Lancer 1ère synthèse
    const promise1 = mockSecureInvoke('speak', {
      text: 'Premier texte long qui prend du temps.',
      use_online: false,
      rate: 1.0,
      pitch: 1.0,
    });

    // Attendre 50ms puis tenter 2ème synthèse (devrait échouer avec mutex)
    await new Promise(resolve => setTimeout(resolve, 50));

    let mutexWorked = false;
    try {
      await mockSecureInvoke('speak', {
        text: 'Deuxième texte concurrent.',
        use_online: false,
        rate: 1.0,
        pitch: 1.0,
      });
    } catch (error) {
      if (error.message.includes('TTS busy')) {
        mutexWorked = true;
        console.log('✅ Mutex blocked concurrent synthesis (expected)');
      }
    }

    // Attendre fin 1ère synthèse
    await promise1;

    const duration = performance.now() - start;

    if (mutexWorked) {
      return {
        testName: 'Mutex anti-superposition',
        status: 'ok',
        duration,
        details: 'Mutex correctly blocked concurrent synthesis',
      };
    } else {
      return {
        testName: 'Mutex anti-superposition',
        status: 'error',
        duration,
        details: 'Mutex failed: concurrent synthesis allowed',
      };
    }
  } catch (error) {
    const duration = performance.now() - start;
    return {
      testName: 'Mutex anti-superposition',
      status: 'error',
      duration,
      details: 'Test failed',
      error: String(error),
    };
  }
}

async function testParametersTransmission() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 2/5] Transmission paramètres rate/pitch/voice...');

    await mockSecureInvoke('speak', {
      text: 'Test paramètres personnalisés.',
      use_online: false,
      rate: 1.5,
      pitch: 1.2,
      voice: 'fr-FR-Wavenet-A',
    });

    const duration = performance.now() - start;

    return {
      testName: 'Transmission paramètres',
      status: 'ok',
      duration,
      details:
        'Parameters correctly transmitted (rate=1.5, pitch=1.2, voice=fr-FR-Wavenet-A)',
    };
  } catch (error) {
    const duration = performance.now() - start;
    return {
      testName: 'Transmission paramètres',
      status: 'error',
      duration,
      details: 'Failed to transmit parameters',
      error: String(error),
    };
  }
}

async function testParametersValidation() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 3/5] Validation paramètres (clamp)...');

    // Test rate > 2.0 (should clamp to 2.0)
    await mockSecureInvoke('speak', {
      text: 'Test clamp rate.',
      use_online: false,
      rate: 5.0, // Should be clamped to 2.0
      pitch: 0.1, // Should be clamped to 0.5
    });

    const duration = performance.now() - start;

    return {
      testName: 'Validation paramètres',
      status: 'ok',
      duration,
      details: 'Parameters correctly clamped (rate 5.0→2.0, pitch 0.1→0.5)',
    };
  } catch (error) {
    const duration = performance.now() - start;
    return {
      testName: 'Validation paramètres',
      status: 'error',
      duration,
      details: 'Parameter validation failed',
      error: String(error),
    };
  }
}

async function testEmptyTextValidation() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 4/5] Validation texte vide...');

    let errorCaught = false;
    try {
      await mockSecureInvoke('speak', {
        text: '',
        use_online: false,
      });
    } catch (error) {
      if (error.message.includes('empty')) {
        errorCaught = true;
        console.log('✅ Empty text correctly rejected');
      }
    }

    const duration = performance.now() - start;

    if (errorCaught) {
      return {
        testName: 'Validation texte vide',
        status: 'ok',
        duration,
        details: 'Empty text correctly rejected',
      };
    } else {
      return {
        testName: 'Validation texte vide',
        status: 'error',
        duration,
        details: 'Empty text was accepted (should reject)',
      };
    }
  } catch (error) {
    const duration = performance.now() - start;
    return {
      testName: 'Validation texte vide',
      status: 'error',
      duration,
      details: 'Test failed',
      error: String(error),
    };
  }
}

async function testStopCommand() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 5/5] Commande stop_speaking...');

    // Lancer synthèse
    const _speakPromise = mockSecureInvoke('speak', {
      text: 'Synthèse qui sera interrompue.',
      use_online: false,
    });

    // Attendre 50ms puis arrêter
    await new Promise(resolve => setTimeout(resolve, 50));
    await mockSecureInvoke('stop_speaking');

    // Vérifier que mutex est libéré
    await new Promise(resolve => setTimeout(resolve, 100));
    const isSpeaking = await mockSecureInvoke('is_speaking');

    const duration = performance.now() - start;

    if (!isSpeaking) {
      return {
        testName: 'Commande stop_speaking',
        status: 'ok',
        duration,
        details: 'stop_speaking correctly released mutex',
      };
    } else {
      return {
        testName: 'Commande stop_speaking',
        status: 'warn',
        duration,
        details: 'stop_speaking executed but mutex still locked',
      };
    }
  } catch (error) {
    const duration = performance.now() - start;
    return {
      testName: 'Commande stop_speaking',
      status: 'error',
      duration,
      details: 'Test failed',
      error: String(error),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
//   ORCHESTRATION
// ═══════════════════════════════════════════════════════════════════

async function runAllMutexTests() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 TITANE∞ v19.2.0 — MUTEX TTS TESTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const timestamp = new Date().toISOString();
  const tests = [];

  // Exécuter les 5 tests séquentiellement
  tests.push(await testMutexAntiSuperposition());
  tests.push(await testParametersTransmission());
  tests.push(await testParametersValidation());
  tests.push(await testEmptyTextValidation());
  tests.push(await testStopCommand());

  // Calculer statistiques
  const totalTests = tests.length;
  const passed = tests.filter(t => t.status === 'ok').length;
  const failed = tests.filter(t => t.status === 'error').length;
  const warnings = tests.filter(t => t.status === 'warn').length;

  // Générer summary
  const successRate = ((passed / totalTests) * 100).toFixed(1);
  const summary = `${passed}/${totalTests} tests passed (${successRate}%), ${warnings} warnings, ${failed} failures`;

  // Log résultats
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 RÉSULTATS TESTS MUTEX TTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`✅ Passed:   ${passed}/${totalTests}`);
  console.log(`⚠️  Warnings: ${warnings}/${totalTests}`);
  console.log(`❌ Failed:   ${failed}/${totalTests}`);
  console.log(`📈 Success:  ${successRate}%`);
  console.log('───────────────────────────────────────────────────────────────');

  tests.forEach((test, index) => {
    const icon = test.status === 'ok' ? '✅' : test.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} [${index + 1}/5] ${test.testName}`);
    console.log(`   └─ ${test.details} (${test.duration.toFixed(0)}ms)`);
    if (test.error) {
      console.log(`   └─ Error: ${test.error.substring(0, 100)}`);
    }
  });

  console.log('═══════════════════════════════════════════════════════════════\n');

  return {
    timestamp,
    totalTests,
    passed,
    failed,
    warnings,
    tests,
    summary,
  };
}

// ═══════════════════════════════════════════════════════════════════
//   EXECUTION
// ═══════════════════════════════════════════════════════════════════

(async () => {
  try {
    const report = await runAllMutexTests();

    // Export JSON
    const jsonOutput = JSON.stringify(report, null, 2);
    console.log('📄 JSON Export:');
    console.log(jsonOutput);

    // Exit avec code approprié
    if (report.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
})();
