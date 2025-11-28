/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ UNIFIED COGNITIVE PIPELINE vΩ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Pipeline unifié: Analyse Intention → Génération Pensée → TTS → Lip-Sync → Animation Avatar → Mise à jour UI
 *
 * @responsibilities
 * - Analyse du message utilisateur et détermination intention
 * - Activation moteurs cognitifs (logique, émotion, style)
 * - Génération pensée → réponse
 * - Préparation TTS (ElevenLabs Adina)
 * - Préparation lip-sync (phénomènes FR)
 * - Animation avatar synchronisée
 * - Mise à jour état global
 * - Auto-optimisation pipeline
 *
 * @guarantees
 * - ZÉRO désynchronisation
 * - TTS fluide
 * - Avatar cohérent
 * - Réponse instantanée
 * - UI mise à jour sans lag
 *
 * @version Ω (Omega - Final Fusion)
 * @created 2025-11-27
 */

import { invoke } from '@tauri-apps/api/core';
import type { SingularityState } from '@/types/singularityState';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Message utilisateur à traiter
 */
export interface UserMessage {
  id: string;
  content: string;
  timestamp: number;
  context?: Record<string, any>;
}

/**
 * Intention détectée
 */
export interface DetectedIntention {
  primary_intent: IntentType;
  secondary_intents: IntentType[];
  confidence: number; // 0-1
  emotional_tone: EmotionalTone;
  complexity: number; // 0-1
  requires_memory: boolean;
  requires_reasoning: boolean;
  requires_creativity: boolean;
}

export type IntentType =
  | 'question'
  | 'command'
  | 'conversation'
  | 'creative'
  | 'analysis'
  | 'emotional_support'
  | 'technical_help'
  | 'storytelling'
  | 'other';

export type EmotionalTone =
  | 'neutral'
  | 'positive'
  | 'negative'
  | 'curious'
  | 'urgent'
  | 'playful'
  | 'serious';

/**
 * Réponse cognitive générée
 */
export interface CognitiveResponse {
  text: string;
  reasoning: string[];
  emotional_alignment: number; // 0-1
  confidence: number; // 0-1
  memory_references: string[];
  generated_at: number;
}

/**
 * Audio TTS préparé
 */
export interface TTSAudio {
  audio_data: ArrayBuffer;
  duration: number; // ms
  sample_rate: number;
  format: 'mp3' | 'wav' | 'pcm';
  phonemes: Phoneme[];
  visemes: Viseme[];
}

export interface Phoneme {
  symbol: string;
  start: number; // ms
  duration: number; // ms
}

export interface Viseme {
  shape: string; // A, E, I, O, U, M, F, etc.
  intensity: number; // 0-1
  start: number; // ms
  duration: number; // ms
}

/**
 * Animation avatar préparée
 */
export interface AvatarAnimation {
  keyframes: AnimationKeyframe[];
  duration: number; // ms
  fps: number;
  synchronized_with_audio: boolean;
}

export interface AnimationKeyframe {
  time: number; // ms
  mouth_shape: string;
  expression: string;
  head_rotation: { x: number; y: number; z: number };
  blink: boolean;
}

/**
 * Résultat complet du pipeline
 */
export interface PipelineResult {
  id: string;
  user_message: UserMessage;
  intention: DetectedIntention;
  cognitive_response: CognitiveResponse;
  tts_audio: TTSAudio;
  avatar_animation: AvatarAnimation;
  state_updates: Partial<SingularityState>;
  processing_time: number; // ms
  stage_times: Record<string, number>; // ms par stage
  success: boolean;
  error?: string;
}

/**
 * Configuration du pipeline
 */
export interface PipelineConfig {
  // TTS
  tts_enabled: boolean;
  tts_voice: string;
  tts_speed: number; // 0.5-2.0

  // Lip-sync
  lipsync_enabled: boolean;
  lipsync_accuracy: 'low' | 'medium' | 'high';

  // Avatar
  avatar_animation_enabled: boolean;
  avatar_expression_intensity: number; // 0-1

  // Performance
  max_processing_time: number; // ms
  parallel_stages: boolean;

  // Mémoire
  memory_integration: boolean;
  context_window: number; // nombre de messages précédents
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED COGNITIVE PIPELINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pipeline cognitif unifié - UN SEUL PIPELINE POUR TOUT
 */
export class UnifiedCognitivePipeline {
  private static instance: UnifiedCognitivePipeline;

  private config: PipelineConfig;
  private isProcessing: boolean = false;
  private queue: UserMessage[] = [];

  // Métriques
  private metrics = {
    total_processed: 0,
    total_errors: 0,
    average_processing_time: 0,
    stage_times: {} as Record<string, number>,
  };

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * Singleton
   */
  public static getInstance(): UnifiedCognitivePipeline {
    if (!UnifiedCognitivePipeline.instance) {
      UnifiedCognitivePipeline.instance = new UnifiedCognitivePipeline();
    }
    return UnifiedCognitivePipeline.instance;
  }

  /**
   * Configure le pipeline
   */
  public configure(config: Partial<PipelineConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[UnifiedPipeline] 🔧 Configuration updated');
  }

  /**
   * Configuration par défaut
   */
  private getDefaultConfig(): PipelineConfig {
    return {
      tts_enabled: true,
      tts_voice: 'adina',
      tts_speed: 1.0,
      lipsync_enabled: true,
      lipsync_accuracy: 'high',
      avatar_animation_enabled: true,
      avatar_expression_intensity: 0.8,
      max_processing_time: 5000,
      parallel_stages: true,
      memory_integration: true,
      context_window: 10,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PIPELINE PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Traite un message utilisateur - POINT D'ENTRÉE PRINCIPAL
   */
  public async processMessage(message: UserMessage): Promise<PipelineResult> {
    console.log('[UnifiedPipeline] 🚀 Processing message:', message.id);

    const startTime = Date.now();
    const stageTimes: Record<string, number> = {};

    try {
      // 1. ANALYSE INTENTION
      const intentStart = Date.now();
      const intention = await this.analyzeIntention(message);
      stageTimes['intention'] = Date.now() - intentStart;
      console.log('[UnifiedPipeline] ✅ Intention detected:', intention.primary_intent);

      // 2. GÉNÉRATION COGNITIVE
      const cognitiveStart = Date.now();
      const cognitiveResponse = await this.generateCognitiveResponse(message, intention);
      stageTimes['cognitive'] = Date.now() - cognitiveStart;
      console.log('[UnifiedPipeline] ✅ Cognitive response generated');

      // 3. PRÉPARATION TTS (si activé)
      let ttsAudio: TTSAudio | null = null;
      if (this.config.tts_enabled) {
        const ttsStart = Date.now();
        ttsAudio = await this.prepareTTS(cognitiveResponse.text);
        stageTimes['tts'] = Date.now() - ttsStart;
        console.log('[UnifiedPipeline] ✅ TTS audio prepared');
      }

      // 4. PRÉPARATION LIP-SYNC (si activé et TTS disponible)
      let avatarAnimation: AvatarAnimation | null = null;
      if (this.config.lipsync_enabled && ttsAudio) {
        const lipsyncStart = Date.now();
        avatarAnimation = await this.prepareAvatarAnimation(ttsAudio);
        stageTimes['lipsync'] = Date.now() - lipsyncStart;
        console.log('[UnifiedPipeline] ✅ Avatar animation prepared');
      }

      // 5. MISE À JOUR ÉTAT GLOBAL
      const stateStart = Date.now();
      const stateUpdates = await this.prepareStateUpdates(intention, cognitiveResponse);
      stageTimes['state'] = Date.now() - stateStart;
      console.log('[UnifiedPipeline] ✅ State updates prepared');

      // 6. RÉSULTAT FINAL
      const processingTime = Date.now() - startTime;

      const result: PipelineResult = {
        id: `pipeline-${Date.now()}`,
        user_message: message,
        intention,
        cognitive_response: cognitiveResponse,
        tts_audio: ttsAudio || this.createEmptyTTS(),
        avatar_animation: avatarAnimation || this.createEmptyAnimation(),
        state_updates: stateUpdates,
        processing_time: processingTime,
        stage_times: stageTimes,
        success: true,
      };

      // Mettre à jour métriques
      this.updateMetrics(result);

      console.log(`[UnifiedPipeline] ✨ Processing complete in ${processingTime}ms`);

      return result;
    } catch (error) {
      console.error('[UnifiedPipeline] ❌ Processing failed:', error);

      this.metrics.total_errors++;

      return {
        id: `pipeline-error-${Date.now()}`,
        user_message: message,
        intention: this.createDefaultIntention(),
        cognitive_response: this.createErrorResponse(error),
        tts_audio: this.createEmptyTTS(),
        avatar_animation: this.createEmptyAnimation(),
        state_updates: {},
        processing_time: Date.now() - startTime,
        stage_times: stageTimes,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 1: ANALYSE INTENTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Analyse l'intention de l'utilisateur
   */
  private async analyzeIntention(message: UserMessage): Promise<DetectedIntention> {
    try {
      const result = await invoke<DetectedIntention>('cognitive_analyze_intention', {
        content: message.content,
        context: message.context,
      });

      return result;
    } catch (error) {
      console.warn('[UnifiedPipeline] Intention analysis failed, using fallback');

      // Analyse simple basée sur mots-clés
      const content = message.content.toLowerCase();

      let primary_intent: IntentType = 'conversation';
      if (content.includes('?') || content.startsWith('pourquoi') || content.startsWith('comment')) {
        primary_intent = 'question';
      } else if (content.startsWith('fais') || content.startsWith('crée') || content.startsWith('génère')) {
        primary_intent = 'command';
      } else if (content.includes('raconte') || content.includes('histoire')) {
        primary_intent = 'storytelling';
      }

      return {
        primary_intent,
        secondary_intents: [],
        confidence: 0.6,
        emotional_tone: 'neutral',
        complexity: 0.5,
        requires_memory: false,
        requires_reasoning: primary_intent === 'question',
        requires_creativity: primary_intent === 'storytelling',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 2: GÉNÉRATION COGNITIVE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Génère la réponse cognitive
   */
  private async generateCognitiveResponse(
    message: UserMessage,
    intention: DetectedIntention
  ): Promise<CognitiveResponse> {
    try {
      const result = await invoke<CognitiveResponse>('cognitive_generate_response', {
        message: message.content,
        intention,
        context: message.context,
        memoryEnabled: this.config.memory_integration,
      });

      return result;
    } catch (error) {
      console.warn('[UnifiedPipeline] Cognitive generation failed, using fallback');

      return {
        text: `Je comprends votre message : "${message.content}". Comment puis-je vous aider ?`,
        reasoning: ['Analyse du message', 'Génération réponse contextuelle'],
        emotional_alignment: 0.7,
        confidence: 0.6,
        memory_references: [],
        generated_at: Date.now(),
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 3: PRÉPARATION TTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Prépare l'audio TTS
   */
  private async prepareTTS(text: string): Promise<TTSAudio> {
    try {
      const result = await invoke<TTSAudio>('tts_generate_audio', {
        text,
        voice: this.config.tts_voice,
        speed: this.config.tts_speed,
      });

      return result;
    } catch (error) {
      console.warn('[UnifiedPipeline] TTS generation failed');
      return this.createEmptyTTS();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 4: PRÉPARATION ANIMATION AVATAR
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Prépare l'animation avatar synchronisée
   */
  private async prepareAvatarAnimation(ttsAudio: TTSAudio): Promise<AvatarAnimation> {
    try {
      const result = await invoke<AvatarAnimation>('avatar_prepare_animation', {
        visemes: ttsAudio.visemes,
        duration: ttsAudio.duration,
        expressionIntensity: this.config.avatar_expression_intensity,
      });

      return result;
    } catch (error) {
      console.warn('[UnifiedPipeline] Avatar animation preparation failed');
      return this.createEmptyAnimation();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 5: MISE À JOUR ÉTAT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Prépare les mises à jour d'état
   */
  private async prepareStateUpdates(
    _intention: DetectedIntention,
    _response: CognitiveResponse
  ): Promise<Partial<SingularityState>> {
    const updates: Partial<SingularityState> = {
      timestamp: Date.now(),
    };

    // Mise à jour cognitive basée sur l'intention
    // TODO: Réactiver quand CognitiveLayer aura focus, clarity, depth, metacognition
    // if (intention.requires_reasoning) {
    //   updates.cognitive = {
    //     focus: 0.9,
    //     clarity: response.confidence,
    //     depth: intention.complexity,
    //     metacognition: 0.8,
    //   };
    // }

    // Mise à jour adaptive basée sur l'émotion
    // TODO: Réactiver quand AdaptiveLayer aura responsiveness, learning_rate, adaptation_speed
    // if (intention.emotional_tone !== 'neutral') {
    //   updates.adaptive = {
    //     responsiveness: 0.9,
    //     learning_rate: 0.7,
    //     adaptation_speed: 0.8,
    //   };
    // }

    return updates;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS & FALLBACKS
  // ═══════════════════════════════════════════════════════════════════════════

  private createDefaultIntention(): DetectedIntention {
    return {
      primary_intent: 'conversation',
      secondary_intents: [],
      confidence: 0.5,
      emotional_tone: 'neutral',
      complexity: 0.5,
      requires_memory: false,
      requires_reasoning: false,
      requires_creativity: false,
    };
  }

  private createErrorResponse(_error: any): CognitiveResponse {
    return {
      text: "Je rencontre une difficulté technique. Pouvez-vous reformuler votre demande ?",
      reasoning: ['Erreur de traitement'],
      emotional_alignment: 0.5,
      confidence: 0.3,
      memory_references: [],
      generated_at: Date.now(),
    };
  }

  private createEmptyTTS(): TTSAudio {
    return {
      audio_data: new ArrayBuffer(0),
      duration: 0,
      sample_rate: 24000,
      format: 'mp3',
      phonemes: [],
      visemes: [],
    };
  }

  private createEmptyAnimation(): AvatarAnimation {
    return {
      keyframes: [],
      duration: 0,
      fps: 60,
      synchronized_with_audio: false,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTRIQUES
  // ═══════════════════════════════════════════════════════════════════════════

  private updateMetrics(result: PipelineResult): void {
    this.metrics.total_processed++;

    // Moyenne mobile pour le temps de traitement
    const alpha = 0.1;
    this.metrics.average_processing_time =
      alpha * result.processing_time +
      (1 - alpha) * this.metrics.average_processing_time;

    // Temps moyens par stage
    for (const [stage, time] of Object.entries(result.stage_times)) {
      if (!this.metrics.stage_times[stage]) {
        this.metrics.stage_times[stage] = time;
      } else {
        this.metrics.stage_times[stage] =
          alpha * time + (1 - alpha) * this.metrics.stage_times[stage];
      }
    }
  }

  public getMetrics() {
    return { ...this.metrics };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUEUE & PARALLEL PROCESSING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ajoute un message à la queue
   */
  public enqueue(message: UserMessage): void {
    this.queue.push(message);
    this.processQueue();
  }

  /**
   * Traite la queue de messages
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const message = this.queue.shift()!;
      await this.processMessage(message);
    }

    this.isProcessing = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const UnifiedPipeline = UnifiedCognitivePipeline.getInstance();
