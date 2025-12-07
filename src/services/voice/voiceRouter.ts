/**
 * TITANE_INFINITY v19.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3.1 — VOICE ROUTER (Voice Intelligence Bridge)
 *
 *   Le chaînon manquant entre ASR → Chat IA → TTS → VoiceEngine
 *   NOW WITH EMOTIONAL INTELLIGENCE!
 *
 *   Architecture du pipeline vocal complet :
 *
 *   🎤 Micro → ASR → Transcription
 *        ↓
 *   📝 VoiceRouter.processVoiceTurn(transcript)
 *        ↓
 *   🤖 ChatEngine.sendMessage() → Réponse IA
 *        ↓
 *   🎭 EmotionalAnalyzer → Détection émotion
 *        ↓
 *   🔊 EmotionalTTS.speak() → Audio expressif
 *        ↓
 *   ✅ VoiceEngine.setState('done')
 *
 *   Ce module orchestre TOUTE la logique conversationnelle vocale.
 *   Il est le cerveau central du Voice Mode TITANE∞.
 * ═══════════════════════════════════════════════════════════════════
 */

import { hybridTTS } from '@/services/tts/hybridTTS';
import { audioStateMachine } from '@/services/audio/audioStateMachine';
import type { AIMessage } from '@/services/ai/types';
import { emotionalAnalyzer } from './emotionalAnalyzer';
import { emotionalTTS } from './emotionalTTS';
import type { EmotionalContext, EmotionType } from './emotionalIntent';
import { wakeWordEngine as _wakeWordEngine, type WakeWordEvent } from './wakeWordEngine';
import { attentionEngine } from './attentionEngine';
import { interruptionController } from './interruptionController';
import { haloEngine } from './haloEngine'; // ✅ v∞.7 Halo sync

/**
 * Configuration du tour vocal
 */
export interface VoiceTurnConfig {
  /** Mode TTS (offline prioritaire par défaut) */
  useOnlineTTS?: boolean;

  /** Timeout IA en ms (défaut: 30s) */
  aiTimeout?: number;

  /** Timeout TTS en ms (défaut: 60s) */
  ttsTimeout?: number;

  /** Activer l'analyse émotionnelle (défaut: true) */
  useEmotionalEngine?: boolean;

  /** Contexte émotionnel (optionnel) */
  emotionalContext?: EmotionalContext;

  /** Wake word event (si détecté en amont) */
  wakeEvent?: WakeWordEvent;

  /** Callback appelé quand l'état change */
  onStateChange?: (state: VoiceRouterState) => void;

  /** Callback appelé quand la réponse IA arrive */
  onAIResponse?: (response: AIMessage) => void;

  /** Callback appelé quand une émotion est détectée */
  onEmotionDetected?: (emotion: EmotionType, intensity: number) => void;

  /** Callback appelé quand le TTS commence */
  onTTSStart?: () => void;

  /** Callback appelé quand le TTS se termine */
  onTTSEnd?: () => void;

  /** Callback appelé en cas d'erreur */
  onError?: (error: VoiceRouterError) => void;
}

/**
 * États du VoiceRouter
 */
export type VoiceRouterState =
  | 'idle' // Prêt
  | 'processing' // Traitement IA en cours
  | 'speaking' // TTS en cours
  | 'done' // Tour complété
  | 'error'; // Erreur

/**
 * Erreurs du VoiceRouter
 */
export interface VoiceRouterError {
  stage: 'ai' | 'tts' | 'unknown';
  message: string;
  originalError?: Error;
}

/**
 * Résultat d'un tour vocal
 */
export interface VoiceTurnResult {
  success: boolean;
  transcript: string;
  aiResponse?: AIMessage;
  error?: VoiceRouterError;
  duration: number; // ms
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   VOICE ROUTER SERVICE
 * ═══════════════════════════════════════════════════════════════════
 */
class VoiceRouterService {
  private currentState: VoiceRouterState = 'idle';
  private abortController: AbortController | null = null;

  /**
   * État actuel du router
   */
  getState(): VoiceRouterState {
    return this.currentState;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   *   CORE : Traiter un tour vocal complet
   *
   *   C'est LA fonction centrale qui orchestre tout le pipeline :
   *   Transcription → IA → TTS → Done
   *
   *   Utilisée par useVoiceEngine.completeTurn()
   * ═══════════════════════════════════════════════════════════════════
   */
  async processVoiceTurn(
    transcript: string,
    chatSendMessage: (content: string) => Promise<AIMessage>,
    config: VoiceTurnConfig = {}
  ): Promise<VoiceTurnResult> {
    const startTime = Date.now();

    console.log('\n🎙️ [VoiceRouter] ═══ Starting voice turn ═══');
    console.log(
      `📝 Transcript: "${transcript.substring(0, 60)}${transcript.length > 60 ? '...' : ''}"`
    );

    // Synchroniser avec AttentionEngine
    attentionEngine.startProcessing();

    // Validation
    if (!transcript.trim()) {
      console.warn('[VoiceRouter] ⚠️ Empty transcript, aborting turn');
      return {
        success: false,
        transcript,
        error: {
          stage: 'unknown',
          message: 'Empty transcript',
        },
        duration: Date.now() - startTime,
      };
    }

    // Reset abort controller
    this.abortController = new AbortController();

    try {
      // ═══ PHASE 1 : CHAT IA ═══
      this.setState('processing', config.onStateChange);
      audioStateMachine.transition('STT_COMPLETE');
      haloEngine.startPulsing(); // ✅ v∞.7 Halo pulsing during AI

      console.log('[VoiceRouter] 🤖 Phase 1: Calling AI...');

      const aiResponse = await this.callAIWithTimeout(
        chatSendMessage,
        transcript,
        config.aiTimeout || 30000
      );

      console.log(
        '[VoiceRouter] ✅ AI response received:',
        aiResponse.content.substring(0, 60)
      );
      config.onAIResponse?.(aiResponse);

      // ═══ PHASE 2 : EMOTIONAL ANALYSIS ═══
      const useEmotional = config.useEmotionalEngine !== false; // Activé par défaut

      if (useEmotional) {
        console.log('[VoiceRouter] 🎭 Phase 2: Analyzing emotion...');

        const analysisResult = emotionalAnalyzer.analyze(
          aiResponse.content,
          config.emotionalContext
        );

        console.log(
          `[VoiceRouter] ✅ Emotion detected: ${analysisResult.intent.emotion} (intensity: ${analysisResult.intent.intensity.toFixed(2)})`
        );
        config.onEmotionDetected?.(
          analysisResult.intent.emotion,
          analysisResult.intent.intensity
        );

        // ═══ PHASE 3 : EMOTIONAL TTS ═══
        this.setState('speaking', config.onStateChange);
        haloEngine.startShimmer(); // ✅ v∞.7 Halo shimmer during TTS
        audioStateMachine.transition('TTS_START');

        console.log('[VoiceRouter] 🔊 Phase 3: Starting Emotional TTS...');

        // Notifier attention + interruption engines
        attentionEngine.startResponding();
        interruptionController.startMonitoring();

        config.onTTSStart?.();

        await this.speakEmotionalWithTimeout(
          aiResponse.content,
          analysisResult.intent,
          config.useOnlineTTS || false,
          config.ttsTimeout || 60000
        );

        console.log('[VoiceRouter] ✅ Emotional TTS completed');

        // Arrêter monitoring
        interruptionController.stopMonitoring();
      } else {
        // Fallback: TTS neutre classique
        this.setState('speaking', config.onStateChange);
        audioStateMachine.transition('TTS_START');

        console.log('[VoiceRouter] 🔊 Phase 2: Starting TTS (no emotion)...');

        attentionEngine.startResponding();
        interruptionController.startMonitoring();

        config.onTTSStart?.();

        await this.speakWithTimeout(
          aiResponse.content,
          config.useOnlineTTS || false,
          config.ttsTimeout || 60000
        );

        console.log('[VoiceRouter] ✅ TTS completed');

        // Arrêter monitoring
        interruptionController.stopMonitoring();
      }

      config.onTTSEnd?.(); // ═══ PHASE 4 : COMPLETION ═══
      this.setState('done', config.onStateChange);
      audioStateMachine.transition('TTS_END');
      audioStateMachine.reset();
      haloEngine.reset(); // ✅ v∞.7 Reset halo to idle

      const duration = Date.now() - startTime;
      console.log(`[VoiceRouter] 🎉 Voice turn completed in ${duration}ms`);

      // Notifier attention engine
      attentionEngine.endResponse();

      // Auto-reset to idle après un court délai
      setTimeout(() => {
        if (this.currentState === 'done') {
          this.setState('idle', config.onStateChange);
        }
      }, 100);

      return {
        success: true,
        transcript,
        aiResponse,
        duration,
      };
    } catch (error) {
      console.error('[VoiceRouter] ❌ Voice turn failed:', error);
      haloEngine.setError(); // ✅ v∞.7 Show error state in halo

      const routerError: VoiceRouterError = {
        stage:
          this.currentState === 'processing'
            ? 'ai'
            : this.currentState === 'speaking'
              ? 'tts'
              : 'unknown',
        message: error instanceof Error ? error.message : String(error),
        originalError: error instanceof Error ? error : undefined,
      };

      this.setState('error', config.onStateChange);
      config.onError?.(routerError);

      // Reset après erreur
      setTimeout(() => {
        if (this.currentState === 'error') {
          this.setState('idle', config.onStateChange);
          audioStateMachine.reset();
        }
      }, 1000);

      return {
        success: false,
        transcript,
        error: routerError,
        duration: Date.now() - startTime,
      };
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Appeler l'IA avec timeout
   */
  private async callAIWithTimeout(
    sendMessage: (content: string) => Promise<AIMessage>,
    content: string,
    timeout: number
  ): Promise<AIMessage> {
    return Promise.race([
      sendMessage(content),
      new Promise<AIMessage>((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), timeout)
      ),
    ]);
  }

  /**
   * Appeler le TTS avec timeout
   */
  private async speakWithTimeout(
    text: string,
    useOnline: boolean,
    timeout: number
  ): Promise<void> {
    return Promise.race([
      hybridTTS.speak(text, {}, useOnline),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('TTS timeout')), timeout)
      ),
    ]);
  }

  /**
   * Appeler le TTS émotionnel avec timeout
   */
  private async speakEmotionalWithTimeout(
    text: string,
    intent: any,
    useOnline: boolean,
    timeout: number
  ): Promise<void> {
    return Promise.race([
      emotionalTTS.speak(text, intent, { useSSML: true, fallbackToRaw: true }),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Emotional TTS timeout')), timeout)
      ),
    ]);
  }

  /**
   * Changer l'état et notifier
   */
  private setState(
    state: VoiceRouterState,
    callback?: (state: VoiceRouterState) => void
  ): void {
    const prevState = this.currentState;
    this.currentState = state;

    if (prevState !== state) {
      console.log(`[VoiceRouter] 🔄 State: ${prevState} → ${state}`);
      callback?.(state);
    }
  }

  /**
   * Annuler le tour vocal en cours
   */
  async abort(): Promise<void> {
    console.log('[VoiceRouter] 🛑 Aborting current voice turn');

    if (this.abortController) {
      this.abortController.abort();
    }

    // Arrêter le TTS si en cours
    if (this.currentState === 'speaking') {
      await hybridTTS.stop();
      emotionalTTS.stop();
    }

    this.setState('idle');
    audioStateMachine.reset();
  }

  /**
   * Reset complet du router
   */
  reset(): void {
    console.log('[VoiceRouter] 🔄 Resetting router');
    this.currentState = 'idle';
    this.abortController = null;
  }
}

// ═══ EXPORT SINGLETON ═══
export const voiceRouter = new VoiceRouterService();
export default voiceRouter;
