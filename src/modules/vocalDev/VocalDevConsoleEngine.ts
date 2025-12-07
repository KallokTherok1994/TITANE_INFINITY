/**
 * TITANE∞ v∞.28.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ VOCAL DEV CONSOLE ENGINE v∞
 *   Super Prompt #18 — Terminal Vocal Intelligent
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Fusion complète:
 * - IA Bulle (chat conversationnel)
 * - Console Dev (terminal technique)
 * - Module Audio (micro + TTS + VAD)
 * - Self-Healing Engine (auto-correction)
 * - Pipeline IA (TITANE-LOCAL / Claude / Gemini)
 * - Commandes Dev SUDO vocales
 *
 * Workflow:
 * 1. Écoute voix Kevin → VAD détection
 * 2. Transcription audio → texte (Whisper/Google)
 * 3. Interprétation intention → dev/chat/heal/system
 * 4. Exécution commande → patch/log/diagnostic
 * 5. Réponse textuelle → console
 * 6. Réponse vocale → TTS (optionnel)
 * 7. Synchronisation Singularity → état global
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { invoke as _invoke } from '@tauri-apps/api/core';
import { secureInvoke } from '@/lib/security';
import { voiceService as _voiceService } from '@/services/api';
import { hybridTTS } from '@/services/tts/hybridTTS';
import { autoHealEngine } from '@/services/ai/autoHealEngine';
import type { AutoHealError as _AutoHealError } from '@/services/ai/autoHealEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mode vocal actif
 */
export type VocalDevMode = 'dev' | 'chat' | 'heal' | 'system' | 'idle';

/**
 * Intention détectée depuis commande vocale
 */
export interface VocalIntent {
  type: 'dev' | 'chat' | 'heal' | 'system';
  confidence: number; // 0.0-1.0
  keywords: string[];
  rawCommand: string;
  parsedAction?: string;
  target?: string;
  params?: Record<string, unknown>;
}

/**
 * État d'enregistrement vocal
 */
export interface VocalRecordingState {
  isRecording: boolean;
  isTranscribing: boolean;
  isSpeaking: boolean;
  vadActive: boolean; // Voice Activity Detection
  audioBuffer: Uint8Array[];
  duration: number; // ms
}

/**
 * Résultat exécution commande vocale
 */
export interface VocalExecutionResult {
  intent: VocalIntent;
  action: string;
  output: string;
  exitCode: number;
  duration: number;
  timestamp: number;
  errors?: string[];
  patch?: VocalPatch;
  ttsResponse?: string;
}

/**
 * Patch appliqué par commande vocale
 */
export interface VocalPatch {
  file: string;
  lineStart: number;
  lineEnd: number;
  oldCode: string;
  newCode: string;
  description: string;
  applied: boolean;
  timestamp: number;
}

/**
 * Log console dev
 */
export interface VocalConsoleLog {
  id: string;
  timestamp: number;
  level: 'info' | 'success' | 'warning' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * État global Vocal Dev Console
 */
export interface VocalDevState {
  mode: VocalDevMode;
  isActive: boolean;
  isVisible: boolean;
  recordingState: VocalRecordingState;
  currentIntent: VocalIntent | null;
  lastCommand: string;
  lastExecution: VocalExecutionResult | null;
  executionHistory: VocalExecutionResult[];
  consoleLogs: VocalConsoleLog[];
  pendingPatches: VocalPatch[];
  healthScore: number; // 0-100
  lastError: string | null;
}

/**
 * Configuration Vocal Dev Console
 */
export interface VocalDevConfig {
  enabled: boolean;
  autoOpen: boolean; // Auto-open console sur erreur
  ttsEnabled: boolean; // Réponse vocale activée
  vadThreshold: number; // 0.0-1.0
  language: string; // 'fr-FR', 'en-US'
  aiProvider: 'titane-local' | 'claude' | 'gemini' | 'auto';
  maxHistorySize: number;
  debugMode: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// VOCAL DEV CONSOLE ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class VocalDevConsoleEngine {
  private static instance: VocalDevConsoleEngine;

  private state: VocalDevState = {
    mode: 'idle',
    isActive: false,
    isVisible: false,
    recordingState: {
      isRecording: false,
      isTranscribing: false,
      isSpeaking: false,
      vadActive: false,
      audioBuffer: [],
      duration: 0,
    },
    currentIntent: null,
    lastCommand: '',
    lastExecution: null,
    executionHistory: [],
    consoleLogs: [],
    pendingPatches: [],
    healthScore: 100,
    lastError: null,
  };

  private config: VocalDevConfig = {
    enabled: true,
    autoOpen: true,
    ttsEnabled: true,
    vadThreshold: 0.02,
    language: 'fr-FR',
    aiProvider: 'auto',
    maxHistorySize: 100,
    debugMode: false,
  };

  private listeners: Set<(state: VocalDevState) => void> = new Set();
  private recordingTimer: NodeJS.Timeout | null = null;
  private recordingStartTime: number = 0;

  /**
   * Singleton pattern
   */
  public static getInstance(): VocalDevConsoleEngine {
    if (!VocalDevConsoleEngine.instance) {
      VocalDevConsoleEngine.instance = new VocalDevConsoleEngine();
    }
    return VocalDevConsoleEngine.instance;
  }

  private constructor() {
    this.log('info', '🎤 Vocal Dev Console Engine v∞ initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Configure le moteur
   */
  public configure(config: Partial<VocalDevConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('info', `Configuration updated: ${JSON.stringify(config)}`);
  }

  /**
   * Obtenir configuration actuelle
   */
  public getConfig(): VocalDevConfig {
    return { ...this.config };
  }

  /**
   * Obtenir état actuel
   */
  public getState(): VocalDevState {
    return { ...this.state };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Active le moteur vocal
   */
  public async activate(): Promise<void> {
    if (this.state.isActive) {
      this.log('warning', 'Vocal Dev Console already active');
      return;
    }

    try {
      // Test microphone disponibilité
      await this.testMicrophone();

      // Test TTS disponibilité
      await this.testTTS();

      // Activer VAD
      await this.activateVAD();

      this.state.isActive = true;
      this.state.mode = 'idle';
      this.log('success', '🎤 Vocal Dev Console activated');
      this.notifyListeners();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.state.lastError = errorMsg;
      this.log('error', `Failed to activate vocal console: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Désactive le moteur vocal
   */
  public async deactivate(): Promise<void> {
    if (!this.state.isActive) return;

    try {
      // Stop recording si en cours
      if (this.state.recordingState.isRecording) {
        await this.stopRecording();
      }

      // Stop TTS si en cours
      if (this.state.recordingState.isSpeaking) {
        await this.stopSpeaking();
      }

      this.state.isActive = false;
      this.state.mode = 'idle';
      this.log('info', 'Vocal Dev Console deactivated');
      this.notifyListeners();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log('error', `Failed to deactivate: ${errorMsg}`);
    }
  }

  /**
   * Afficher/masquer console
   */
  public toggleVisibility(): void {
    this.state.isVisible = !this.state.isVisible;
    this.log('info', `Console ${this.state.isVisible ? 'visible' : 'hidden'}`);
    this.notifyListeners();
  }

  /**
   * Ouvrir console (ex: auto-open sur erreur)
   */
  public open(): void {
    this.state.isVisible = true;
    this.notifyListeners();
  }

  /**
   * Fermer console
   */
  public close(): void {
    this.state.isVisible = false;
    this.notifyListeners();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORDING (AUDIO CAPTURE)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Commence enregistrement vocal
   */
  public async startRecording(): Promise<void> {
    if (this.state.recordingState.isRecording) {
      this.log('warning', 'Already recording');
      return;
    }

    try {
      // Reset audio buffer
      this.state.recordingState.audioBuffer = [];
      this.state.recordingState.isRecording = true;
      this.recordingStartTime = Date.now();

      // Start backend recording
      await secureInvoke('voice_start_recording', {
        language: this.config.language,
      });

      // Start duration timer
      this.recordingTimer = setInterval(() => {
        this.state.recordingState.duration = Date.now() - this.recordingStartTime;
        this.notifyListeners();
      }, 100);

      this.log('info', '🎤 Recording started');
      this.notifyListeners();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.state.lastError = errorMsg;
      this.log('error', `Failed to start recording: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Arrête enregistrement et transcrit
   */
  public async stopRecording(): Promise<string> {
    if (!this.state.recordingState.isRecording) {
      this.log('warning', 'Not recording');
      return '';
    }

    try {
      // Clear timer
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
      }

      this.state.recordingState.isRecording = false;
      this.state.recordingState.isTranscribing = true;
      this.notifyListeners();

      // Stop backend recording + transcribe
      const result = await secureInvoke<{ text: string; confidence: number }>(
        'voice_stop_recording'
      );

      const transcript = result.text || '';
      this.state.recordingState.isTranscribing = false;
      this.state.recordingState.duration = 0;

      this.log(
        'success',
        `🎤 Transcription: "${transcript}" (confidence: ${result.confidence.toFixed(2)})`
      );
      this.notifyListeners();

      return transcript;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.state.lastError = errorMsg;
      this.log('error', `Failed to stop recording: ${errorMsg}`);
      this.state.recordingState.isTranscribing = false;
      this.notifyListeners();
      return '';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE COMMAND EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Execute commande vocale complète (workflow principal)
   */
  public async executeVoiceCommand(): Promise<VocalExecutionResult | null> {
    try {
      // 1. Start recording
      await this.startRecording();

      // Wait for user to stop manually (or auto-stop after VAD silence)
      // Note: Caller should stop recording manually via stopRecording()
      return null;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log('error', `Voice command execution failed: ${errorMsg}`);
      return null;
    }
  }

  /**
   * Process transcript → interpret → execute → respond
   */
  public async processTranscript(transcript: string): Promise<VocalExecutionResult> {
    const startTime = Date.now();

    try {
      this.state.lastCommand = transcript;
      this.log('info', `Processing command: "${transcript}"`);

      // 1. Interpret intent
      const intent = await this.interpretIntent(transcript);
      this.state.currentIntent = intent;
      this.state.mode = intent.type;
      this.notifyListeners();

      this.log(
        'info',
        `Intent detected: ${intent.type} (confidence: ${intent.confidence.toFixed(2)})`
      );

      // 2. Route to appropriate handler
      let output = '';
      let exitCode = 0;
      let errors: string[] = [];
      let patch: VocalPatch | undefined;

      switch (intent.type) {
        case 'dev':
          ({ output, exitCode, errors, patch } = await this.handleDevIntent(intent));
          break;
        case 'chat':
          output = await this.handleChatIntent(intent);
          break;
        case 'heal':
          ({ output, patch } = await this.handleHealIntent(intent));
          break;
        case 'system':
          output = await this.handleSystemIntent(intent);
          break;
      }

      const duration = Date.now() - startTime;

      // 3. Create execution result
      const result: VocalExecutionResult = {
        intent,
        action: intent.parsedAction || intent.rawCommand,
        output,
        exitCode,
        duration,
        timestamp: Date.now(),
        errors,
        patch,
      };

      // 4. TTS response if enabled
      if (this.config.ttsEnabled && output) {
        const ttsText = this.generateTTSResponse(result);
        result.ttsResponse = ttsText;
        await this.speak(ttsText);
      }

      // 5. Save to history
      this.state.lastExecution = result;
      this.state.executionHistory.unshift(result);
      if (this.state.executionHistory.length > this.config.maxHistorySize) {
        this.state.executionHistory.pop();
      }

      this.log('success', `Command executed in ${duration}ms`);
      this.notifyListeners();

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const duration = Date.now() - startTime;

      const result: VocalExecutionResult = {
        intent: {
          type: 'system',
          confidence: 0,
          keywords: [],
          rawCommand: transcript,
        },
        action: 'error',
        output: `Error: ${errorMsg}`,
        exitCode: 1,
        duration,
        timestamp: Date.now(),
        errors: [errorMsg],
      };

      this.state.lastExecution = result;
      this.state.lastError = errorMsg;
      this.log('error', `Execution failed: ${errorMsg}`);
      this.notifyListeners();

      return result;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INTENT INTERPRETATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Interprète l'intention depuis le transcript
   */
  private async interpretIntent(transcript: string): Promise<VocalIntent> {
    const lower = transcript.toLowerCase();

    // Dev intent patterns
    const devPatterns = [
      /corrige|répare|fix|patch|debug/,
      /montre|affiche|logs?|erreurs?/,
      /compile|build|test|run/,
      /génère|crée|create/,
      /backend|frontend|rust|typescript/,
    ];

    // Chat intent patterns
    const chatPatterns = [
      /explique|qu'est-ce|c'est quoi|comment|pourquoi/,
      /quelle est|quel est/,
      /aide-moi|peux-tu/,
    ];

    // Heal intent patterns
    const healPatterns = [
      /auto.?heal|self.?heal/,
      /répare ce|fix ce/,
      /diagnostic|analyse/,
    ];

    // System intent patterns
    const systemPatterns = [
      /ouvre|ferme|affiche|cache/,
      /console|terminal|window/,
      /active|désactive|enable|disable/,
    ];

    // Calculate confidence scores
    const devScore = devPatterns.filter(p => p.test(lower)).length / devPatterns.length;
    const chatScore =
      chatPatterns.filter(p => p.test(lower)).length / chatPatterns.length;
    const healScore =
      healPatterns.filter(p => p.test(lower)).length / healPatterns.length;
    const systemScore =
      systemPatterns.filter(p => p.test(lower)).length / systemPatterns.length;

    // Determine intent type
    const scores = {
      dev: devScore,
      chat: chatScore,
      heal: healScore,
      system: systemScore,
    };
    const maxScore = Math.max(...Object.values(scores));
    const intentType =
      (Object.keys(scores) as Array<'dev' | 'chat' | 'heal' | 'system'>).find(
        key => scores[key] === maxScore
      ) || 'chat';

    // Extract keywords
    const allPatterns = [
      ...devPatterns,
      ...chatPatterns,
      ...healPatterns,
      ...systemPatterns,
    ];
    const keywords = allPatterns
      .filter(p => p.test(lower))
      .map(p => {
        const match = lower.match(p);
        return match ? match[0] : '';
      })
      .filter(Boolean);

    return {
      type: intentType,
      confidence: maxScore,
      keywords,
      rawCommand: transcript,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INTENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Handler pour intention DEV
   */
  private async handleDevIntent(
    intent: VocalIntent
  ): Promise<{ output: string; exitCode: number; errors: string[]; patch?: VocalPatch }> {
    try {
      const command = intent.rawCommand;

      // Route to Tauri backend dev command
      const result = await secureInvoke<{ output: string; exitCode: number }>(
        'dev_run_command',
        {
          command,
        }
      );

      return {
        output: result.output,
        exitCode: result.exitCode,
        errors: result.exitCode !== 0 ? ['Command failed'] : [],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        output: `Error executing dev command: ${errorMsg}`,
        exitCode: 1,
        errors: [errorMsg],
      };
    }
  }

  /**
   * Handler pour intention CHAT
   */
  private async handleChatIntent(intent: VocalIntent): Promise<string> {
    try {
      // Route to AI provider based on config
      const provider = this.config.aiProvider;

      let response = '';

      if (provider === 'auto' || provider === 'titane-local') {
        // Try TITANE-LOCAL first
        try {
          const result = await secureInvoke<{ response: string }>('ai_query_local', {
            prompt: intent.rawCommand,
          });
          response = result.response;
        } catch {
          // Fallback to Claude if TITANE-LOCAL unavailable
          response = await this.queryClaude(intent.rawCommand);
        }
      } else if (provider === 'claude') {
        response = await this.queryClaude(intent.rawCommand);
      } else if (provider === 'gemini') {
        response = await this.queryGemini(intent.rawCommand);
      }

      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return `Error executing chat: ${errorMsg}`;
    }
  }

  /**
   * Handler pour intention HEAL
   */
  private async handleHealIntent(
    intent: VocalIntent
  ): Promise<{ output: string; patch?: VocalPatch }> {
    try {
      // Trigger auto-heal engine
      const target = intent.target || 'all';

      // Run diagnostic first
      const diagnostics = await secureInvoke<{ issues: string[] }>('dev_diagnostic', {
        target,
      });

      if (diagnostics.issues.length === 0) {
        return { output: '✅ No issues detected. System healthy.' };
      }

      // Trigger self-healing
      const healResult = await autoHealEngine.heal(
        'vocal-dev',
        new Error(`Issues: ${diagnostics.issues.join(', ')}`)
      );

      return {
        output: `🩹 Auto-healing triggered:\n${diagnostics.issues.map(i => `- ${i}`).join('\n')}\n\nHealing ID: ${healResult.id}`,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        output: `Error executing heal: ${errorMsg}`,
      };
    }
  }

  /**
   * Handler pour intention SYSTEM
   */
  private async handleSystemIntent(intent: VocalIntent): Promise<string> {
    const lower = intent.rawCommand.toLowerCase();

    // Console visibility commands
    if (/ouvre|affiche|show/.test(lower) && /console|terminal/.test(lower)) {
      this.open();
      return 'Console opened';
    }

    if (/ferme|cache|hide/.test(lower) && /console|terminal/.test(lower)) {
      this.close();
      return 'Console closed';
    }

    // Mode vocal commands
    if (/active|enable|start/.test(lower) && /vocal|voice|micro/.test(lower)) {
      await this.activate();
      return 'Vocal mode activated';
    }

    if (/désactive|disable|stop/.test(lower) && /vocal|voice|micro/.test(lower)) {
      await this.deactivate();
      return 'Vocal mode deactivated';
    }

    return 'System command not recognized';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AI PROVIDERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Query Claude
   */
  private async queryClaude(prompt: string): Promise<string> {
    try {
      const result = await secureInvoke<{ response: string }>('ai_query_claude', {
        prompt,
      });
      return result.response;
    } catch (error) {
      throw new Error(`Claude query failed: ${error}`);
    }
  }

  /**
   * Query Gemini
   */
  private async queryGemini(prompt: string): Promise<string> {
    try {
      const result = await secureInvoke<{ response: string }>('ai_query_gemini', {
        prompt,
      });
      return result.response;
    } catch (error) {
      throw new Error(`Gemini query failed: ${error}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TTS (TEXT-TO-SPEECH)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Speak text via TTS
   */
  public async speak(text: string): Promise<void> {
    try {
      this.state.recordingState.isSpeaking = true;
      this.notifyListeners();

      await hybridTTS.speak(text);

      this.state.recordingState.isSpeaking = false;
      this.notifyListeners();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log('error', `TTS failed: ${errorMsg}`);
      this.state.recordingState.isSpeaking = false;
      this.notifyListeners();
    }
  }

  /**
   * Stop TTS
   */
  public async stopSpeaking(): Promise<void> {
    try {
      await hybridTTS.stop();
      this.state.recordingState.isSpeaking = false;
      this.notifyListeners();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log('error', `Stop TTS failed: ${errorMsg}`);
    }
  }

  /**
   * Generate TTS-friendly response from execution result
   */
  private generateTTSResponse(result: VocalExecutionResult): string {
    const { intent, exitCode, errors } = result;

    if (exitCode !== 0) {
      return `Erreur lors de l'exécution de la commande ${intent.type}. ${errors?.join('. ')}`;
    }

    switch (intent.type) {
      case 'dev':
        return 'Commande développement exécutée avec succès.';
      case 'chat':
        return result.output.slice(0, 200); // Truncate long responses
      case 'heal':
        return 'Auto-correction effectuée.';
      case 'system':
        return result.output;
      default:
        return 'Commande exécutée.';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Test microphone disponibilité
   */
  private async testMicrophone(): Promise<void> {
    try {
      await secureInvoke('test_microphone');
      this.log('success', '🎤 Microphone available');
    } catch (error) {
      throw new Error('Microphone not available');
    }
  }

  /**
   * Test TTS disponibilité
   */
  private async testTTS(): Promise<void> {
    try {
      const status = await hybridTTS.getStatus();
      if (!status.available) {
        throw new Error('TTS not available');
      }
      this.log('success', '🔊 TTS available');
    } catch (error) {
      throw new Error('TTS not available');
    }
  }

  /**
   * Activer VAD (Voice Activity Detection)
   */
  private async activateVAD(): Promise<void> {
    try {
      await secureInvoke('vad_configure', {
        threshold: this.config.vadThreshold,
        minSpeechFrames: 10,
        minSilenceFrames: 20,
      });
      this.log('success', '🎙️ VAD activated');
    } catch (error) {
      this.log('warning', 'VAD activation failed (continuing without VAD)');
    }
  }

  /**
   * Log message to console
   */
  private log(
    level: VocalConsoleLog['level'],
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    const logEntry: VocalConsoleLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      metadata,
    };

    this.state.consoleLogs.unshift(logEntry);
    if (this.state.consoleLogs.length > 500) {
      this.state.consoleLogs.pop();
    }

    // Console output in dev mode
    if (this.config.debugMode) {
      console.log(`[VocalDev:${level}]`, message, metadata || '');
    }
  }

  /**
   * Clear logs console
   */
  public clearLogs(): void {
    this.state.consoleLogs = [];
    this.notifyListeners();
  }

  /**
   * Clear execution history
   */
  public clearHistory(): void {
    this.state.executionHistory = [];
    this.notifyListeners();
  }

  /**
   * Get health score
   */
  public getHealthScore(): number {
    // Calculate based on recent errors and success rate
    const recentExecutions = this.state.executionHistory.slice(0, 10);
    if (recentExecutions.length === 0) return 100;

    const successCount = recentExecutions.filter(e => e.exitCode === 0).length;
    return Math.round((successCount / recentExecutions.length) * 100);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LISTENERS (OBSERVABILITY)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: VocalDevState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const stateCopy = this.getState();
    this.listeners.forEach(listener => listener(stateCopy));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const vocalDevConsole = VocalDevConsoleEngine.getInstance();
