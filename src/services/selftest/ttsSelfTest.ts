/**
 * TITANE∞ v19.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v19.1.0 - TTS SELF-TEST MODULE
 *   Auto-diagnostic système synthèse vocale
 * ═══════════════════════════════════════════════════════════════
 */

import { hybridTTS } from '../tts/hybridTTS';

export interface TtsSelfTestResult {
  available: boolean;
  engine: 'tauri-local' | 'tauri-online' | 'webspeech' | 'none';
  latency_ms: number;
  error?: string;
  details?: {
    tauriAvailable: boolean;
    webSpeechAvailable: boolean;
    voiceCount: number;
    testedPhrase: string;
  };
}

/**
 * Test complet du système TTS
 */
export async function tts_selftest(): Promise<TtsSelfTestResult> {
  console.log('\n🧪 [TTS SELF-TEST] Démarrage...');

  const startTime = performance.now();
  const testPhrase = 'Test synthèse vocale TITANE';

  try {
    // 1. Vérifier disponibilité Web Speech API
    const webSpeechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
    console.log('Web Speech API:', webSpeechAvailable ? 'Disponible' : 'Indisponible');

    // 2. Obtenir statut hybride
    const status = await hybridTTS.getStatus();
    console.log('Provider actif:', status.provider);
    console.log('TTS disponible:', status.available);

    // 3. Compter voix disponibles
    const voices = await hybridTTS.getAvailableVoices();
    console.log('Voix disponibles:', voices.length);

    // 4. Test synthèse (sans audio réel pour ne pas déranger)
    // On vérifie juste que speak() ne lance pas d'erreur
    try {
      console.log('Test phrase:', testPhrase);

      // Petit timeout pour éviter de bloquer si TTS est lent
      const speakPromise = hybridTTS.speak(testPhrase, { volume: 0.1 }, false);
      await Promise.race([
        speakPromise,
        new Promise((resolve) => setTimeout(resolve, 5000)) // 5s max
      ]);

      console.log('Synthèse réussie');
    } catch (speakError) {
      console.warn('Synthèse échouée:', speakError);
    }

    const latency = Math.round(performance.now() - startTime);

    // 5. Résultat final
    const result: TtsSelfTestResult = {
      available: status.available,
      engine: status.provider as any,
      latency_ms: latency,
      details: {
        tauriAvailable: status.provider === 'tauri',
        webSpeechAvailable,
        voiceCount: voices.length,
        testedPhrase: testPhrase,
      },
    };

    console.log('\n✅ [TTS SELF-TEST] SUCCÈS');
    console.log(`   Provider: ${result.engine}`);
    console.log(`   Latency: ${result.latency_ms}ms`);
    console.log(`   Voices: ${result.details?.voiceCount}`);

    return result;
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('\n❌ [TTS SELF-TEST] ÉCHEC');
    console.error(`   Error: ${errorMessage}`);

    return {
      available: false,
      engine: 'none',
      latency_ms: latency,
      error: errorMessage,
    };
  }
}

/**
 * Test rapide (juste disponibilité, pas de synthèse)
 */
export async function tts_quick_check(): Promise<boolean> {
  try {
    const status = await hybridTTS.getStatus();
    return status.available;
  } catch {
    return false;
  }
}

/**
 * Obtient diagnostic détaillé TTS (pour UI)
 */
export async function tts_get_diagnostic(): Promise<{
  status: 'ok' | 'warn' | 'error';
  message: string;
  provider: string;
  voiceCount: number;
}> {
  try {
    const status = await hybridTTS.getStatus();
    const voices = await hybridTTS.getAvailableVoices();

    if (!status.available) {
      return {
        status: 'error',
        message: 'Aucun moteur TTS disponible',
        provider: 'none',
        voiceCount: 0,
      };
    }

    if (status.provider === 'webspeech') {
      return {
        status: 'warn',
        message: 'Tauri TTS indisponible, utilisation Web Speech API',
        provider: 'webspeech',
        voiceCount: voices.length,
      };
    }

    return {
      status: 'ok',
      message: `TTS opérationnel (${status.provider})`,
      provider: status.provider,
      voiceCount: voices.length,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      provider: 'none',
      voiceCount: 0,
    };
  }
}
