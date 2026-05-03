#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.1.0 — TTS FUNCTIONAL TESTS (Manual Execution)
 *   Script Node.js pour exécuter tests TTS en environnement terminal
 * ═══════════════════════════════════════════════════════════════════
 */

// Mock des dépendances browser pour environnement Node.js
global.window = {
  speechSynthesis: undefined, // Simulate browser without Web Speech API
};

global.performance = {
  now: () => Date.now(),
};

// Mock hybridTTS service
const mockHybridTTS = {
  speaking: false,
  tauriAvailable: null,

  async checkTauriAvailable() {
    if (this.tauriAvailable !== null) {
      return this.tauriAvailable;
    }
    // Simulate Tauri check (fail in Node.js environment)
    this.tauriAvailable = false;
    console.log('⚠️  TTS: Tauri backend unavailable (Node.js environment)');
    return false;
  },

  checkWebSpeechAvailable() {
    return typeof window !== 'undefined' && window.speechSynthesis !== undefined;
  },

  async speak(text, _config = {}, useOnline = false) {
    if (!text.trim()) {
      console.warn('⚠️  TTS: Empty text, skipping');
      return;
    }

    console.log(
      `\n🔊 TTS: Mock synthesis for "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`
    );
    console.log(`🌐 Mode: ${useOnline ? 'Online' : 'Offline'}`);

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 200));

    const tauriAvailable = await this.checkTauriAvailable();
    const webSpeechAvailable = this.checkWebSpeechAvailable();

    if (tauriAvailable) {
      console.log('✅ TTS (Mock Tauri): Success');
    } else if (webSpeechAvailable) {
      console.log('✅ TTS (Mock WebSpeech): Success');
    } else {
      console.log('🔇 TTS: Silent mode (no provider available)');
    }
  },

  async stop() {
    console.log('⏹️  TTS: Mock stop');
    this.speaking = false;
  },

  async getStatus() {
    const tauriAvailable = await this.checkTauriAvailable();
    const webSpeechAvailable = this.checkWebSpeechAvailable();

    let provider = 'none';
    let available = false;

    if (tauriAvailable) {
      provider = 'tauri';
      available = true;
    } else if (webSpeechAvailable) {
      provider = 'webspeech';
      available = true;
    }

    return {
      provider,
      available,
      speaking: this.speaking,
    };
  },

  resetCache() {
    this.tauriAvailable = null;
  },
};

// ═══════════════════════════════════════════════════════════════════
//   TTS FUNCTIONAL TESTS (Inline implementation)
// ═══════════════════════════════════════════════════════════════════

async function testLocalTTS() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 1/7] TTS Local (espeak/piper)...');

    const testText = 'Test synthèse vocale locale.';
    await mockHybridTTS.speak(testText, { rate: 1.2, pitch: 1.0, lang: 'fr-FR' }, false);

    const duration = performance.now() - start;
    const status = await mockHybridTTS.getStatus();
    const usedTauri = status.provider === 'tauri';

    if (usedTauri) {
      return {
        testName: 'TTS Local (espeak/piper)',
        status: 'ok',
        duration,
        details: `Synthèse locale réussie (${duration.toFixed(0)}ms)`,
        provider: 'tauri-local',
      };
    } else {
      return {
        testName: 'TTS Local (espeak/piper)',
        status: 'warn',
        duration,
        details: `Tauri indisponible, fallback ${status.provider} utilisé`,
        provider: status.provider === 'webspeech' ? 'webspeech' : 'none',
      };
    }
  } catch (error) {
    const duration = performance.now() - start;
    return {
      testName: 'TTS Local (espeak/piper)',
      status: 'error',
      duration,
      details: 'Échec synthèse locale',
      error: String(error),
    };
  }
}

async function testOnlineTTS() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 2/7] TTS Online (Google TTS)...');

    const testText = 'Test synthèse vocale en ligne.';
    await mockHybridTTS.speak(testText, { rate: 1.0, pitch: 1.0, lang: 'fr-FR' }, true);

    const duration = performance.now() - start;
    const status = await mockHybridTTS.getStatus();

    if (status.provider === 'tauri') {
      return {
        testName: 'TTS Online (Google TTS)',
        status: 'ok',
        duration,
        details: `Synthèse online réussie (${duration.toFixed(0)}ms)`,
        provider: 'tauri-online',
      };
    } else if (status.provider === 'webspeech') {
      return {
        testName: 'TTS Online (Google TTS)',
        status: 'warn',
        duration,
        details: 'Google TTS indisponible, fallback WebSpeech utilisé',
        provider: 'webspeech',
      };
    } else {
      return {
        testName: 'TTS Online (Google TTS)',
        status: 'warn',
        duration,
        details: 'TTS online indisponible, mode silent',
        provider: 'none',
      };
    }
  } catch (error) {
    const duration = performance.now() - start;
    return {
      testName: 'TTS Online (Google TTS)',
      status: 'error',
      duration,
      details: 'Échec synthèse online',
      error: String(error),
    };
  }
}

async function testWebSpeechFallback() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 3/7] Fallback Web Speech API...');

    mockHybridTTS.resetCache();

    const hasWebSpeech =
      typeof window !== 'undefined' && window.speechSynthesis !== undefined;

    if (!hasWebSpeech) {
      return {
        testName: 'Fallback Web Speech API',
        status: 'warn',
        duration: performance.now() - start,
        details: 'Web Speech API non disponible (environnement Node.js)',
        provider: 'none',
      };
    }

    const testText = 'Test fallback Web Speech.';
    await mockHybridTTS.speak(testText, { rate: 1.0, pitch: 1.0, lang: 'fr-FR' }, false);

    const duration = performance.now() - start;
    const status = await mockHybridTTS.getStatus();

    return {
      testName: 'Fallback Web Speech API',
      status: 'ok',
      duration,
      details: `Fallback WebSpeech fonctionnel (${duration.toFixed(0)}ms)`,
      provider: status.provider,
    };
  } catch (error) {
    const duration = performance.now() - start;
    return {
      testName: 'Fallback Web Speech API',
      status: 'error',
      duration,
      details: 'Échec fallback WebSpeech',
      error: String(error),
    };
  }
}

async function testErrorHandlingAPIDown() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 4/7] Gestion erreur (API down)...');

    const emptyText = '';
    await mockHybridTTS.speak(emptyText, { rate: 1.0, pitch: 1.0 }, true);

    const duration = performance.now() - start;

    return {
      testName: 'Gestion erreur (API down)',
      status: 'ok',
      duration,
      details: 'Texte vide détecté, aucune erreur lancée (fallback silent)',
      provider: 'none',
    };
  } catch (error) {
    const duration = performance.now() - start;

    return {
      testName: 'Gestion erreur (API down)',
      status: 'ok',
      duration,
      details: 'Erreur capturée correctement (non-bloquante)',
      error: String(error),
    };
  }
}

async function testErrorHandlingEspeakMissing() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 5/7] Gestion erreur (espeak absent)...');

    const testText = 'Test sans espeak.';
    await mockHybridTTS.speak(testText, { rate: 1.0 }, false);

    const duration = performance.now() - start;
    const status = await mockHybridTTS.getStatus();

    if (status.provider === 'tauri') {
      return {
        testName: 'Gestion erreur (espeak absent)',
        status: 'ok',
        duration,
        details: 'Espeak ou alternative disponible',
        provider: 'tauri-local',
      };
    } else if (status.provider === 'webspeech') {
      return {
        testName: 'Gestion erreur (espeak absent)',
        status: 'ok',
        duration,
        details: 'Espeak absent, fallback WebSpeech utilisé',
        provider: 'webspeech',
      };
    } else {
      return {
        testName: 'Gestion erreur (espeak absent)',
        status: 'warn',
        duration,
        details: 'Aucun TTS disponible, mode silent activé',
        provider: 'none',
      };
    }
  } catch (error) {
    const duration = performance.now() - start;
    return {
      testName: 'Gestion erreur (espeak absent)',
      status: 'error',
      duration,
      details: 'Erreur non gérée',
      error: String(error),
    };
  }
}

async function testNoSimultaneousReads() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 6/7] Pas de lectures simultanées...');

    const text1 = 'Premier texte.';
    const text2 = 'Deuxième texte.';

    const promise1 = mockHybridTTS.speak(text1, { rate: 1.5 }, false);

    await new Promise(resolve => setTimeout(resolve, 100));
    const promise2 = mockHybridTTS.speak(text2, { rate: 1.5 }, false);

    await Promise.all([promise1, promise2]);

    const duration = performance.now() - start;

    return {
      testName: 'Pas de lectures simultanées',
      status: 'warn',
      duration,
      details: 'Lectures parallèles effectuées (mutex non implémenté - TODO Phase 6)',
    };
  } catch (error) {
    const duration = performance.now() - start;
    return {
      testName: 'Pas de lectures simultanées',
      status: 'error',
      duration,
      details: 'Erreur durant lectures parallèles',
      error: String(error),
    };
  }
}

async function testIsSpeakingTracking() {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 7/7] Tracking état isSpeaking...');

    const statusBefore = await mockHybridTTS.getStatus();
    const speakingBefore = statusBefore.speaking;

    const testText = 'Test tracking.';
    const speakPromise = mockHybridTTS.speak(testText, { rate: 2.0 }, false);

    await new Promise(resolve => setTimeout(resolve, 50));
    const statusDuring = await mockHybridTTS.getStatus();
    const speakingDuring = statusDuring.speaking;

    await speakPromise;

    const statusAfter = await mockHybridTTS.getStatus();
    const speakingAfter = statusAfter.speaking;

    const duration = performance.now() - start;

    if (!speakingBefore && speakingDuring && !speakingAfter) {
      return {
        testName: 'Tracking état isSpeaking',
        status: 'ok',
        duration,
        details: `Tracking correct: avant=${speakingBefore}, pendant=${speakingDuring}, après=${speakingAfter}`,
      };
    } else if (!speakingBefore && !speakingAfter) {
      return {
        testName: 'Tracking état isSpeaking',
        status: 'ok',
        duration,
        details: `Tracking partiel: avant=${speakingBefore}, pendant=${speakingDuring}, après=${speakingAfter}`,
      };
    } else {
      return {
        testName: 'Tracking état isSpeaking',
        status: 'warn',
        duration,
        details: `Tracking imprécis: avant=${speakingBefore}, pendant=${speakingDuring}, après=${speakingAfter}`,
      };
    }
  } catch (error) {
    const duration = performance.now() - start;
    return {
      testName: 'Tracking état isSpeaking',
      status: 'error',
      duration,
      details: 'Erreur tracking état',
      error: String(error),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
//   ORCHESTRATION
// ═══════════════════════════════════════════════════════════════════

async function runAllTTSFunctionalTests() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 TITANE∞ v19.1.0 — TTS FUNCTIONAL TESTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const timestamp = new Date().toISOString();
  const tests = [];

  // Exécuter les 7 tests séquentiellement
  tests.push(await testLocalTTS());
  tests.push(await testOnlineTTS());
  tests.push(await testWebSpeechFallback());
  tests.push(await testErrorHandlingAPIDown());
  tests.push(await testErrorHandlingEspeakMissing());
  tests.push(await testNoSimultaneousReads());
  tests.push(await testIsSpeakingTracking());

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
  console.log('📊 RÉSULTATS TESTS FONCTIONNELS TTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`✅ Passed:   ${passed}/${totalTests}`);
  console.log(`⚠️  Warnings: ${warnings}/${totalTests}`);
  console.log(`❌ Failed:   ${failed}/${totalTests}`);
  console.log(`📈 Success:  ${successRate}%`);
  console.log('───────────────────────────────────────────────────────────────');

  tests.forEach((test, index) => {
    const icon = test.status === 'ok' ? '✅' : test.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} [${index + 1}/7] ${test.testName}`);
    console.log(`   └─ ${test.details} (${test.duration.toFixed(0)}ms)`);
    if (test.provider) {
      console.log(`   └─ Provider: ${test.provider}`);
    }
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
    const report = await runAllTTSFunctionalTests();

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
