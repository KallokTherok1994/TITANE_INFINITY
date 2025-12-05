/**
 * TITANE∞ v∞ ULTRA — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * UNIFIED VOCAL INTELLIGENCE ENGINE
 * Super Prompts XXIV + XXV + XXVI Integration
 *
 * Le cerveau vocal unifié de TITANE∞ qui coordonne:
 * - ASR Streaming (Whisper)
 * - VAD Detection
 * - WakeWord Engine
 * - Emotion Detection
 * - Intent Recognition
 * - TTS Modulation
 * - Halo & Avatar Sync
 * - Full Duplex Orchestration
 * - Self-Healing
 * - Cognitive Loop (XXV)
 * - Voice Memory & Style (XXVI)
 */

import { audioStateMachine, type AudioConversationState } from '../audio/audioStateMachine';
import { wakeWordEngine as _wakeWordEngine, type WakeWordEvent } from './wakeWordEngine';
import { attentionEngine, type AttentionState } from './attentionEngine';
import { fullDuplexOrchestrator as _fullDuplexOrchestrator } from './fullDuplexOrchestrator';
import { haloEngine, type HaloState } from './haloEngine';
import { voiceService } from '../api/voice';
import { hybridTTS } from '../tts/hybridTTS';
import { innerDialogueController as _innerDialogueController, type InnerDialogueState as _InnerDialogueState, type ThinkingState as _ThinkingState } from './innerDialogueController';

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

/**
 * États attentionnels de la boucle cognitive (Super Prompt XXV)
 */
export type CognitiveState =
  | 'idle'
  | 'passive_listening'
  | 'wakeword_candidate'
  | 'active_listening'
  | 'human_speaking'
  | 'processing'
  | 'thinking'
  | 'tts_speaking'
  | 'full_duplex_interrupt'
  | 'healing'
  | 'regulating';

/**
 * États émotionnels détectés (Super Prompt XXIV)
 */
export type EmotionalState =
  | 'calm'
  | 'joyful'
  | 'stressed'
  | 'tired'
  | 'excited'
  | 'focused'
  | 'sad'
  | 'neutral';

/**
 * Types d'intentions vocales
 */
export type IntentType =
  | 'question'
  | 'instruction'
  | 'emotion'
  | 'reflection'
  | 'presence'
  | 'unknown';

/**
 * Profil vocal utilisateur (Super Prompt XXVI)
 */
export interface UserVoiceProfile {
  avgPitch: number; // Hauteur moyenne (Hz)
  speechRate: number; // Rythme (1.0 = normal)
  emotionBaseline: EmotionalState;
  jitter: number; // Micro-variations de fréquence
  shimmer: number; // Micro-variations d'amplitude
  pauseRate: number; // Taux de pauses
  intensityLevel: number; // Intensité émotionnelle moyenne (0-1)
  lastUpdated: number; // Timestamp
}

/**
 * Signature vocale TITANE∞ (Super Prompt XXVI)
 */
export interface TitaneVoiceSignature {
  timbreBase: 'cristal-profond' | 'chaleureux' | 'neutre';
  warmth: number; // Chaleur (0-1)
  clarity: number; // Clarté (0-1)
  depth: number; // Profondeur (0-1)
  calm: number; // Calme (0-1)
  mystery: number; // Mystère (0-1)
  elegance: number; // Élégance (0-1)
  presence: number; // Présence humaine (0-1)
}

/**
 * Configuration du moteur vocal unifié
 */
export interface UnifiedVocalConfig {
  loopFrequency: number; // Hz (10-30)
  vadSensitivity: number; // 0-1
  wakeWordThreshold: number; // 0-1
  emotionSensitivity: number; // 0-1
  autoHealEnabled: boolean;
  styleAdaptationRate: number; // Vitesse d'adaptation (0-0.1)
  memoryPersistence: boolean;
}

/**
 * État complet du moteur vocal unifié
 */
export interface UnifiedVocalState {
  cognitiveState: CognitiveState;
  emotionalState: EmotionalState;
  intentType: IntentType;
  audioState: AudioConversationState;
  attentionState: AttentionState;
  haloState: HaloState;
  isRecording: boolean;
  isSpeaking: boolean;
  isHealing: boolean;
  lastWakeWord: WakeWordEvent | null;
  userVoiceProfile: UserVoiceProfile;
  titaneSignature: TitaneVoiceSignature;
}

// ═══════════════════════════════════════════════════════════════════
// UNIFIED VOCAL ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════

class UnifiedVocalEngine {
  private state: UnifiedVocalState;
  private config: UnifiedVocalConfig;
  private loopInterval: number | null = null;
  private listeners: Set<(state: UnifiedVocalState) => void> = new Set();
  private vadCheckCount = 0;
  private lastVADTimestamp = 0;
  private lastHealCheck = 0;
  private isInitialized = false;

  constructor() {
    // État initial
    this.state = {
      cognitiveState: 'idle',
      emotionalState: 'neutral',
      intentType: 'unknown',
      audioState: 'idle',
      attentionState: 'inactive',
      haloState: 'idle',
      isRecording: false,
      isSpeaking: false,
      isHealing: false,
      lastWakeWord: null,
      userVoiceProfile: this.getDefaultUserProfile(),
      titaneSignature: this.getDefaultTitaneSignature(),
    };

    // Configuration par défaut
    this.config = {
      loopFrequency: 20, // 20 Hz (50ms interval)
      vadSensitivity: 0.7,
      wakeWordThreshold: 0.75,
      emotionSensitivity: 0.6,
      autoHealEnabled: true,
      styleAdaptationRate: 0.01,
      memoryPersistence: true,
    };

    // Charger la mémoire persistante
    this.loadMemory();
  }

  /**
   * Profil utilisateur par défaut
   */
  private getDefaultUserProfile(): UserVoiceProfile {
    return {
      avgPitch: 155, // Hz (voix humaine moyenne)
      speechRate: 1.0,
      emotionBaseline: 'calm',
      jitter: 0.04,
      shimmer: 0.03,
      pauseRate: 0.12,
      intensityLevel: 0.5,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Signature vocale TITANE∞ par défaut (Super Prompt XXVI)
   */
  private getDefaultTitaneSignature(): TitaneVoiceSignature {
    return {
      timbreBase: 'cristal-profond',
      warmth: 0.12,
      clarity: 0.15,
      depth: 0.20,
      calm: 0.25,
      mystery: 0.10,
      elegance: 0.10,
      presence: 0.08,
    };
  }

  /**
   * Initialisation du moteur
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[UnifiedVocalEngine] Already initialized');
      return;
    }

    console.log('[UnifiedVocalEngine] 🚀 Initializing Unified Vocal Intelligence Engine v∞...');

    // Initialiser les sous-systèmes
    await this.initializeSubsystems();

    // Démarrer la boucle cognitive (Super Prompt XXV)
    this.startCognitiveLoop();

    this.isInitialized = true;
    console.log('[UnifiedVocalEngine] ✅ Unified Vocal Engine initialized');
  }

  /**
   * Initialiser tous les sous-systèmes vocaux
   */
  private async initializeSubsystems(): Promise<void> {
    // Sync avec audioStateMachine (observer pattern manuel)
    const checkAudioState = () => {
      const currentState = audioStateMachine.getState();
      if (this.state.audioState !== currentState) {
        this.state.audioState = currentState;
        this.updateCognitiveState();
      }
    };
    setInterval(checkAudioState, 200); // Check every 200ms

    // Sync avec attentionEngine
    attentionEngine.onStateChange((attentionState) => {
      this.state.attentionState = attentionState.state;
      this.updateCognitiveState();
    });

    // Sync avec haloEngine
    haloEngine.onStateChange((status) => {
      this.state.haloState = status.state;
    });

    // Note: wakeWordEngine and fullDuplexOrchestrator event handlers
    // will be connected when those features are fully integrated

    console.log('[UnifiedVocalEngine] ✅ Subsystems connected');
  }

  /**
   * Boucle cognitive principale (Super Prompt XXV)
   * Tourne à 10-30 Hz selon config
   */
  private startCognitiveLoop(): void {
    const intervalMs = 1000 / this.config.loopFrequency;

    this.loopInterval = window.setInterval(() => {
      this.cognitiveLoopTick();
    }, intervalMs);

    console.log(`[UnifiedVocalEngine] 🔄 Cognitive loop started (${this.config.loopFrequency} Hz)`);
  }

  /**
   * Tick de la boucle cognitive (exécuté 10-30x/seconde)
   */
  private cognitiveLoopTick(): void {
    // 1. VAD CHECK
    this.vadCheck();

    // 2. WAKEWORD CHECK
    this.wakeWordCheck();

    // 3. STATE MACHINE CHECK
    this.stateMachineCheck();

    // 4. EMOTION SENSE
    this.emotionSense();

    // 5. VOICE SAFETY CHECK (Self-Healing)
    this.voiceSafetyCheck();

    // 6. HALO & AVATAR SYNC
    this.visualSync();

    // 7-8. INTENT MONITOR & AUTONOMIC RESPONSE (à implémenter)
    // this.intentMonitor();
    // this.autonomicResponse();

    // Notifier les listeners
    this.notifyListeners();

    this.vadCheckCount++;
  }

  /**
   * 1. VAD CHECK - Détection activité vocale
   */
  private vadCheck(): void {
    // Implémentation simplifiée - À connecter au vrai VAD
    const now = Date.now();
    if (now - this.lastVADTimestamp > 100) {
      // Simulé pour l'instant - sera connecté au VAD CPAL
      this.lastVADTimestamp = now;
    }
  }

  /**
   * 2. WAKEWORD CHECK - Détection "TITANE"
   */
  private wakeWordCheck(): void {
    // Géré par wakeWordEngine.onWakeWord() callback
    // Analyse phonétique continue dans le buffer audio
  }

  /**
   * 3. STATE MACHINE CHECK - Gestion transitions
   */
  private stateMachineCheck(): void {
    const { audioState, isSpeaking, isRecording } = this.state;

    // Si TTS parle & humain parle → stop TTS (FullDuplex)
    if (isSpeaking && isRecording) {
      this.handleBargeIn();
    }

    // Si idle & humain commence → start_turn
    if (audioState === 'idle' && this.state.cognitiveState === 'human_speaking') {
      this.transitionToCognitiveState('active_listening');
    }

    // Si processing & ASR terminé → thinking
    if (audioState === 'processing' && !isRecording) {
      this.transitionToCognitiveState('thinking');
    }
  }

  /**
   * 4. EMOTION SENSE - Analyse émotionnelle
   */
  private emotionSense(): void {
    // Analyse prosodie + timbre + rythme
    // Mise à jour du UserVoiceProfile (Super Prompt XXVI)

    // Simulé pour l'instant - sera connecté à l'analyse audio réelle
    const _emotions: EmotionalState[] = ['calm', 'joyful', 'stressed', 'tired', 'excited', 'focused', 'sad'];

    // Détection basée sur intensité audio, rythme, pauses
    // À implémenter avec analyse spectrale réelle
  }

  /**
   * 5. VOICE SAFETY CHECK - Auto-healing (Super Prompt XXIV)
   */
  private voiceSafetyCheck(): void {
    if (!this.config.autoHealEnabled) return;

    const now = Date.now();
    if (now - this.lastHealCheck < 5000) return; // Check every 5s

    this.lastHealCheck = now;

    // Vérifier backend non bloqué
    if (this.state.isRecording && this.state.cognitiveState === 'idle') {
      console.warn('[UnifiedVocalEngine] 🔥 Detected stuck recording state, healing...');
      this.heal();
    }

    // Vérifier TTS non coincé
    if (this.state.isSpeaking && this.state.audioState === 'idle') {
      console.warn('[UnifiedVocalEngine] 🔥 Detected stuck TTS state, healing...');
      this.heal();
    }
  }

  /**
   * 6. VISUAL SYNC - Synchronisation Halo + Avatar
   */
  private visualSync(): void {
    const { cognitiveState } = this.state;

    // Mapper état cognitif → méthode halo appropriée
    switch (cognitiveState) {
      case 'idle':
        if (this.state.haloState !== 'idle') {
          haloEngine.reset();
        }
        break;
      case 'passive_listening':
      case 'regulating':
        if (this.state.haloState !== 'breathing') {
          haloEngine.startBreathing();
        }
        break;
      case 'wakeword_candidate':
      case 'processing':
      case 'thinking':
        if (this.state.haloState !== 'pulsing') {
          haloEngine.startPulsing();
        }
        break;
      case 'active_listening':
      case 'human_speaking':
      case 'tts_speaking':
        if (this.state.haloState !== 'shimmer') {
          haloEngine.startShimmer();
        }
        break;
      case 'full_duplex_interrupt':
      case 'healing':
        if (this.state.haloState !== 'error') {
          haloEngine.setError();
        }
        break;
    }

    // Mapper émotion → couleur halo (à implémenter dans haloEngine)
    // calm → bleu
    // joyful → or
    // stressed → rouge doux
    // tired → gris-bleu
    // excited → cyan
    // focused → violet
  }

  /**
   * 7. INTENT MONITOR - Surveillance intention conversationnelle
   */
  /**
   * Gestion WakeWord "TITANE" détecté
   */
  private handleWakeWord(event: WakeWordEvent): void {
    console.log('[UnifiedVocalEngine] 🎯 WakeWord detected:', event);

    this.state.lastWakeWord = event;

    // Interrompre TTS immédiatement si actif
    if (this.state.isSpeaking) {
      hybridTTS.stop();
      this.state.isSpeaking = false;
    }

    // Passer en écoute active
    this.transitionToCognitiveState('active_listening');

    // Illuminer halo en or/blanc
    haloEngine.startShimmer();

    // Note: setListeningMode will be used when attentionEngine API is finalized
    // attentionEngine.setListeningMode('active');
  }

  /**
   * Gestion Barge-In (interruption humaine)
   */
  private handleBargeIn(): void {
    console.log('[UnifiedVocalEngine] 🛑 Barge-in detected, stopping TTS');

    // Stop TTS immédiatement
    if (this.state.isSpeaking) {
      hybridTTS.stop();
      this.state.isSpeaking = false;
    }

    this.transitionToCognitiveState('full_duplex_interrupt');

    // Après 500ms, passer en écoute active
    setTimeout(() => {
      if (this.state.cognitiveState === 'full_duplex_interrupt') {
        this.transitionToCognitiveState('active_listening');
      }
    }, 500);
  }

  /**
   * Self-Healing - Réparation auto
   */
  private async heal(): Promise<void> {
    if (this.state.isHealing) return;

    this.state.isHealing = true;
    this.transitionToCognitiveState('healing');

    console.log('[UnifiedVocalEngine] 🔧 Starting self-healing...');

    try {
      // Force reset recording
      await voiceService.forceResetVoice();

      // Reset state machine
      audioStateMachine.reset();

      // Reset halo
      haloEngine.reset();

      // Reset internal state
      this.state.isRecording = false;
      this.state.isSpeaking = false;

      console.log('[UnifiedVocalEngine] ✅ Self-healing complete');
    } catch (error) {
      console.error('[UnifiedVocalEngine] ❌ Self-healing failed:', error);
    } finally {
      this.state.isHealing = false;
      this.transitionToCognitiveState('idle');
    }
  }

  /**
   * Transition vers un nouvel état cognitif
   */
  private transitionToCognitiveState(newState: CognitiveState): void {
    const prevState = this.state.cognitiveState;
    if (prevState === newState) return;

    console.log(`[UnifiedVocalEngine] 🔄 Cognitive state: ${prevState} → ${newState}`);
    this.state.cognitiveState = newState;

    this.updateCognitiveState();
  }

  /**
   * Mise à jour état cognitif basé sur tous les signaux
   */
  private updateCognitiveState(): void {
    // Logique de priorité (Super Prompt XXV)
    // HUMAIN PARLE > WAKEWORD > EMOTION > INTENT > IA > TTS > INTERNAL

    // À affiner avec tous les signaux disponibles
  }

  /**
   * Mise à jour UserVoiceProfile (Super Prompt XXVI)
   */
  updateUserVoiceProfile(updates: Partial<UserVoiceProfile>): void {
    this.state.userVoiceProfile = {
      ...this.state.userVoiceProfile,
      ...updates,
      lastUpdated: Date.now(),
    };

    // Sauvegarder si persistence activée
    if (this.config.memoryPersistence) {
      this.saveMemory();
    }
  }

  /**
   * Adaptation lente du style TITANE∞ (Super Prompt XXVI)
   */
  adaptTitaneStyle(emotionalContext: EmotionalState, intensity: number): void {
    const rate = this.config.styleAdaptationRate;
    const signature = this.state.titaneSignature;

    // Adaptation progressive selon émotion
    switch (emotionalContext) {
      case 'calm':
        signature.calm = Math.min(1, signature.calm + rate * intensity);
        signature.warmth = Math.max(0, signature.warmth - rate * 0.5 * intensity);
        break;
      case 'joyful':
        signature.warmth = Math.min(1, signature.warmth + rate * intensity);
        signature.clarity = Math.min(1, signature.clarity + rate * 0.5 * intensity);
        break;
      case 'stressed':
        signature.calm = Math.max(0, signature.calm - rate * intensity);
        break;
      case 'tired':
        signature.presence = Math.max(0, signature.presence - rate * 0.3 * intensity);
        break;
      case 'focused':
        signature.depth = Math.min(1, signature.depth + rate * intensity);
        break;
    }

    // Sauvegarder
    if (this.config.memoryPersistence) {
      this.saveMemory();
    }
  }

  /**
   * Charger mémoire persistante (localStorage)
   */
  private loadMemory(): void {
    try {
      const saved = localStorage.getItem('titane_vocal_memory');
      if (!saved) return;

      const memory = JSON.parse(saved);

      if (memory.userVoiceProfile) {
        this.state.userVoiceProfile = memory.userVoiceProfile;
      }

      if (memory.titaneSignature) {
        this.state.titaneSignature = memory.titaneSignature;
      }

      console.log('[UnifiedVocalEngine] ✅ Memory loaded from localStorage');
    } catch (error) {
      console.warn('[UnifiedVocalEngine] Failed to load memory:', error);
    }
  }

  /**
   * Sauvegarder mémoire persistante
   */
  private saveMemory(): void {
    try {
      const memory = {
        userVoiceProfile: this.state.userVoiceProfile,
        titaneSignature: this.state.titaneSignature,
        lastSaved: Date.now(),
      };

      localStorage.setItem('titane_vocal_memory', JSON.stringify(memory));
    } catch (error) {
      console.warn('[UnifiedVocalEngine] Failed to save memory:', error);
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: UnifiedVocalState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get current state
   */
  getState(): UnifiedVocalState {
    return { ...this.state };
  }

  /**
   * Get config
   */
  getConfig(): UnifiedVocalConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(updates: Partial<UnifiedVocalConfig>): void {
    this.config = { ...this.config, ...updates };

    // Redémarrer loop si fréquence changée
    if (updates.loopFrequency && this.loopInterval) {
      clearInterval(this.loopInterval);
      this.startCognitiveLoop();
    }
  }

  /**
   * Arrêt du moteur
   */
  shutdown(): void {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }

    // Sauvegarder mémoire finale
    if (this.config.memoryPersistence) {
      this.saveMemory();
    }

    this.listeners.clear();
    this.isInitialized = false;

    console.log('[UnifiedVocalEngine] 🛑 Shutdown complete');
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const unifiedVocalEngine = new UnifiedVocalEngine();
export default unifiedVocalEngine;
