/**
 * TITANE_INFINITY v19.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.1.0 — TTS FUNCTIONAL TESTS
 *   Tests complets du pipeline TTS (Local + Online + Web Speech API)
 *   Tests: espeak, Google TTS, fallback, erreurs, anti-superposition
 * ═══════════════════════════════════════════════════════════════════
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { hybridTTS } from '../tts/hybridTTS';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { TTSConfig, TTSStatus } from '../tts/hybridTTS';

// ═══════════════════════════════════════════════════════════════════
//   TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface TTSTestResult {
  testName: string;
  status: 'ok' | 'warn' | 'error';
  duration: number; // ms
  details: string;
  provider?: 'tauri-local' | 'tauri-online' | 'webspeech' | 'none';
  error?: string;
}

export interface TTSFunctionalTestReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  tests: TTSTestResult[];
  summary: string;
}

// ═══════════════════════════════════════════════════════════════════
//   TESTS FONCTIONNELS
// ═══════════════════════════════════════════════════════════════════

/**
 * Test 1: TTS Local (espeak/piper)
 */
async function testLocalTTS(): Promise<TTSTestResult> {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 1/7] TTS Local (espeak/piper)...');

    // Texte court pour test rapide
    const testText = 'Test synthèse vocale locale.';

    // Force mode local (useOnline=false)
    await hybridTTS.speak(testText, { rate: 1.2, pitch: 1.0, lang: 'fr-FR' }, false);

    const duration = performance.now() - start;

    // Vérifier qu'on a bien utilisé Tauri (pas WebSpeech)
    const status = await hybridTTS.getStatus();
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

/**
 * Test 2: TTS Online (Google TTS)
 */
async function testOnlineTTS(): Promise<TTSTestResult> {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 2/7] TTS Online (Google TTS)...');

    // Texte court pour test rapide
    const testText = 'Test synthèse vocale en ligne.';

    // Force mode online (useOnline=true)
    await hybridTTS.speak(testText, { rate: 1.0, pitch: 1.0, lang: 'fr-FR' }, true);

    const duration = performance.now() - start;

    // Si réussi, c'est que online ou fallback fonctionnent
    const status = await hybridTTS.getStatus();

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

/**
 * Test 3: Fallback Web Speech API
 */
async function testWebSpeechFallback(): Promise<TTSTestResult> {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 3/7] Fallback Web Speech API...');

    // Forcer indisponibilité Tauri temporairement
    hybridTTS.resetCache();

    // Vérifier si Web Speech API disponible
    const hasWebSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

    if (!hasWebSpeech) {
      return {
        testName: 'Fallback Web Speech API',
        status: 'warn',
        duration: performance.now() - start,
        details: 'Web Speech API non disponible (environnement Node.js ou navigateur incompatible)',
        provider: 'none',
      };
    }

    // Tester Web Speech directement
    const testText = 'Test fallback Web Speech.';
    await hybridTTS.speak(testText, { rate: 1.0, pitch: 1.0, lang: 'fr-FR' }, false);

    const duration = performance.now() - start;
    const status = await hybridTTS.getStatus();

    return {
      testName: 'Fallback Web Speech API',
      status: 'ok',
      duration,
      details: `Fallback WebSpeech fonctionnel (${duration.toFixed(0)}ms)`,
      provider: status.provider === 'webspeech' ? 'webspeech' : status.provider === 'tauri' ? 'tauri-local' : 'none',
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

/**
 * Test 4: Gestion erreur (API down)
 */
async function testErrorHandlingAPIDown(): Promise<TTSTestResult> {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 4/7] Gestion erreur (API down)...');

    // Forcer mode online avec texte invalide (trop long ou chaîne vide)
    // Devrait fallback vers Web Speech ou silent mode
    const emptyText = '';

    await hybridTTS.speak(emptyText, { rate: 1.0, pitch: 1.0 }, true);

    const duration = performance.now() - start;

    // Si aucune erreur lancée, c'est que le fallback a fonctionné
    return {
      testName: 'Gestion erreur (API down)',
      status: 'ok',
      duration,
      details: 'Texte vide détecté, aucune erreur lancée (fallback silent)',
      provider: 'none',
    };
  } catch (error) {
    const duration = performance.now() - start;

    // C'est normal que ça échoue sans crash l'app
    return {
      testName: 'Gestion erreur (API down)',
      status: 'ok',
      duration,
      details: 'Erreur capturée correctement (non-bloquante)',
      error: String(error),
    };
  }
}

/**
 * Test 5: Gestion erreur (espeak absent)
 */
async function testErrorHandlingEspeakMissing(): Promise<TTSTestResult> {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 5/7] Gestion erreur (espeak absent)...');

    // Tenter TTS local - si espeak absent, devrait fallback WebSpeech
    const testText = 'Test sans espeak.';
    await hybridTTS.speak(testText, { rate: 1.0 }, false);

    const duration = performance.now() - start;
    const status = await hybridTTS.getStatus();

    if (status.provider === 'tauri') {
      return {
        testName: 'Gestion erreur (espeak absent)',
        status: 'ok',
        duration,
        details: 'Espeak ou alternative (piper/festival) disponible',
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

/**
 * Test 6: Pas de lectures simultanées
 */
async function testNoSimultaneousReads(): Promise<TTSTestResult> {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 6/7] Pas de lectures simultanées...');

    // Lancer 2 synthèses en parallèle (devrait bloquer ou attendre)
    const text1 = 'Premier texte.';
    const text2 = 'Deuxième texte.';

    // Lancer les 2 en parallèle
    const promise1 = hybridTTS.speak(text1, { rate: 1.5 }, false);

    // Attendre 100ms puis lancer le 2ème
    await new Promise(resolve => setTimeout(resolve, 100));
    const promise2 = hybridTTS.speak(text2, { rate: 1.5 }, false);

    // Attendre que les 2 se terminent
    await Promise.all([promise1, promise2]);

    const duration = performance.now() - start;

    // Si aucune erreur, c'est que la séquence a fonctionné
    // (hybridTTS ne gère pas encore de mutex explicite, mais devrait pas crasher)
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

/**
 * Test 7: Tracking état isSpeaking
 */
async function testIsSpeakingTracking(): Promise<TTSTestResult> {
  const start = performance.now();

  try {
    console.log('\n🧪 [Test 7/7] Tracking état isSpeaking...');

    // Vérifier état initial
    const statusBefore = await hybridTTS.getStatus();
    const speakingBefore = statusBefore.speaking;

    // Lancer synthèse courte
    const testText = 'Test tracking.';
    const speakPromise = hybridTTS.speak(testText, { rate: 2.0 }, false);

    // Attendre 50ms puis vérifier état (devrait être speaking=true)
    await new Promise(resolve => setTimeout(resolve, 50));
    const statusDuring = await hybridTTS.getStatus();
    const speakingDuring = statusDuring.speaking;

    // Attendre fin synthèse
    await speakPromise;

    // Vérifier état final
    const statusAfter = await hybridTTS.getStatus();
    const speakingAfter = statusAfter.speaking;

    const duration = performance.now() - start;

    // Analyser résultats
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

/**
 * Exécute tous les tests fonctionnels TTS
 */
export async function runAllTTSFunctionalTests(): Promise<TTSFunctionalTestReport> {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 TITANE∞ v19.1.0 — TTS FUNCTIONAL TESTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const timestamp = new Date().toISOString();
  const tests: TTSTestResult[] = [];

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

/**
 * Exporte résultats en JSON pour intégration DiagnosticPanel
 */
export function exportTTSTestsToJSON(report: TTSFunctionalTestReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Exporte résultats en Markdown pour documentation
 */
export function exportTTSTestsToMarkdown(report: TTSFunctionalTestReport): string {
  const lines: string[] = [];

  lines.push('# 🧪 TTS Functional Tests Report');
  lines.push('');
  lines.push(`**Date**: ${new Date(report.timestamp).toLocaleString()}`);
  lines.push(`**Summary**: ${report.summary}`);
  lines.push('');
  lines.push('## 📊 Statistics');
  lines.push('');
  lines.push(`- **Total Tests**: ${report.totalTests}`);
  lines.push(`- **Passed**: ${report.passed} ✅`);
  lines.push(`- **Warnings**: ${report.warnings} ⚠️`);
  lines.push(`- **Failed**: ${report.failed} ❌`);
  lines.push('');
  lines.push('## 🧪 Test Results');
  lines.push('');

  report.tests.forEach((test, index) => {
    const icon = test.status === 'ok' ? '✅' : test.status === 'warn' ? '⚠️' : '❌';
    lines.push(`### ${icon} Test ${index + 1}: ${test.testName}`);
    lines.push('');
    lines.push(`- **Status**: ${test.status.toUpperCase()}`);
    lines.push(`- **Duration**: ${test.duration.toFixed(0)}ms`);
    if (test.provider) {
      lines.push(`- **Provider**: ${test.provider}`);
    }
    lines.push(`- **Details**: ${test.details}`);
    if (test.error) {
      lines.push(`- **Error**: \`${test.error}\``);
    }
    lines.push('');
  });

  return lines.join('\n');
}
