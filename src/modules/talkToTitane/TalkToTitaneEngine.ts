/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ TALK-TO-TITANE ENGINE v∞.30.0
 *   Super Prompt #20 — Assistant Vocal Continu Omniprésent
 * ═══════════════════════════════════════════════════════════════════
 *
 * Assistant vocal permanent, intelligent, adaptatif
 *
 * Features:
 * - Wake phrase detection ("Hey TITANE", "Ok TITANE")
 * - 7 catégories d'intentions (conversation/dev/structure/action/coaching/analyse/mémoire)
 * - Modes adaptatifs (continu/murmuré/direct/calibration/focus)
 * - Intégration totale (Memory/Singularity/Self-Heal/Evolution/Cognitive/Context)
 * - Réponse vocale + textuelle
 * - Session longue durée
 */

import { vocalDevConsole } from '@/modules/vocalDev/VocalDevConsoleEngine';
import { autoSaveConversationEngine } from './AutoSaveConversationEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type TalkToTitaneMode =
  | 'continuous'    // Parle en continu tant que Kevin parle
  | 'whispered'     // Réponses murmurées (TTS low voice)
  | 'direct'        // Tout traduit en action Dev avec confirmation
  | 'calibrated'    // Adapté au ton émotionnel
  | 'focus';        // Simplifié pour recentrer

export type TalkIntentType =
  | 'conversation'  // Conversation naturelle
  | 'dev'          // Débogage / Dev
  | 'structure'    // Structuration / Organisation
  | 'action'       // Action / Commande
  | 'coaching'     // Coaching / Guidance
  | 'analyze'      // Analyse interne système
  | 'memory';      // Mémoire / Historique

export interface WakePhrase {
  phrase: string;
  confidence: number;
  timestamp: number;
}

export interface TalkIntent {
  type: TalkIntentType;
  confidence: number;
  text: string;
  keywords: string[];
  emotionalTone: 'analytical' | 'calm' | 'energizing' | 'motivating' | 'neutral';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TalkResponse {
  intent: TalkIntent;
  analysis: string;
  response: string;
  action?: string; // Action Dev/SUDO si applicable
  vocalResponse: string;
  memoryUpdate: boolean;
  singularitySnapshot: Record<string, unknown>;
  followUpSuggestions: string[];
}

export interface TalkToTitaneState {
  isActive: boolean;
  isListening: boolean;
  currentMode: TalkToTitaneMode;
  lastWakePhrase: WakePhrase | null;
  sessionId: string;
  sessionStartTime: number;
  totalInteractions: number;
  currentIntent: TalkIntent | null;
  lastResponse: TalkResponse | null;
  conversationHistory: TalkResponse[];
  emotionalCalibration: 'analytical' | 'calm' | 'energizing' | 'motivating' | 'neutral';
}

export interface TalkToTitaneConfig {
  wakePhrases: string[];
  confidenceThreshold: number;
  ttsEnabled: boolean;
  ttsVolume: 'low' | 'medium' | 'high';
  autoSaveEnabled: boolean;
  maxHistorySize: number;
  defaultMode: TalkToTitaneMode;
  emotionalAdaptation: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// TALK-TO-TITANE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class TalkToTitaneEngine {
  private state: TalkToTitaneState = {
    isActive: false,
    isListening: false,
    currentMode: 'continuous',
    lastWakePhrase: null,
    sessionId: '',
    sessionStartTime: 0,
    totalInteractions: 0,
    currentIntent: null,
    lastResponse: null,
    conversationHistory: [],
    emotionalCalibration: 'calm',
  };

  private config: TalkToTitaneConfig = {
    wakePhrases: ['hey titane', 'ok titane', 'titane écoute-moi', 'titane aide-moi'],
    confidenceThreshold: 0.7,
    ttsEnabled: true,
    ttsVolume: 'medium',
    autoSaveEnabled: true,
    maxHistorySize: 100,
    defaultMode: 'continuous',
    emotionalAdaptation: true,
  };

  private listeners: Array<(state: TalkToTitaneState) => void> = [];
  private transcriptBuffer: string = '';
  private lastProcessedLength: number = 0;

  // ───────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ───────────────────────────────────────────────────────────────────────────

  async activate(mode: TalkToTitaneMode = 'continuous'): Promise<void> {
    console.log('[TalkToTitane] Activating Talk-To-TITANE Engine v∞...');

    this.state.isActive = true;
    this.state.currentMode = mode;
    this.state.sessionId = `talk-${Date.now()}`;
    this.state.sessionStartTime = Date.now();
    this.state.totalInteractions = 0;
    this.state.conversationHistory = [];

    // Start listening for wake phrases
    await this.startWakePhraseDetection();

    console.log(`[TalkToTitane] Activated in ${mode} mode`);
    this.notifyListeners();
  }

  async deactivate(): Promise<void> {
    console.log('[TalkToTitane] Deactivating Talk-To-TITANE Engine...');

    this.stopListening();

    // Save session before deactivation
    if (this.config.autoSaveEnabled && this.state.conversationHistory.length > 0) {
      await autoSaveConversationEngine.saveSession({
        sessionId: this.state.sessionId,
        startTime: this.state.sessionStartTime,
        endTime: Date.now(),
        mode: this.state.currentMode,
        interactions: this.state.totalInteractions,
        history: this.state.conversationHistory,
      });
    }

    this.state.isActive = false;
    this.state.isListening = false;
    this.state.currentIntent = null;

    console.log('[TalkToTitane] Deactivated');
    this.notifyListeners();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // WAKE PHRASE DETECTION
  // ───────────────────────────────────────────────────────────────────────────

  private async startWakePhraseDetection(): Promise<void> {
    console.log('[TalkToTitane] Wake phrase detection active...');

    // Listen to VocalDevConsole transcription
    const checkInterval = setInterval(() => {
      if (!this.state.isActive) {
        clearInterval(checkInterval);
        return;
      }

      const vocalState = vocalDevConsole.getState();
      const transcript = vocalState.lastCommand || '';

      if (transcript && transcript !== this.transcriptBuffer) {
        this.transcriptBuffer = transcript;
        this.checkWakePhrase(transcript.toLowerCase());
      }
    }, 500);
  }

  private checkWakePhrase(text: string): void {
    for (const phrase of this.config.wakePhrases) {
      if (text.includes(phrase)) {
        const wakePhrase: WakePhrase = {
          phrase,
          confidence: 1.0,
          timestamp: Date.now(),
        };

        this.state.lastWakePhrase = wakePhrase;
        console.log(`[TalkToTitane] Wake phrase detected: "${phrase}"`);

        // Start listening
        if (!this.state.isListening) {
          this.startListening();
        }

        // Process remaining text after wake phrase
        const afterWake = text.split(phrase)[1]?.trim();
        if (afterWake && afterWake.length > 5) {
          this.processUserInput(afterWake);
        }

        break;
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LISTENING
  // ───────────────────────────────────────────────────────────────────────────

  private startListening(): void {
    console.log('[TalkToTitane] Listening activated...');
    this.state.isListening = true;
    this.lastProcessedLength = 0;
    this.notifyListeners();
  }

  stopListening(): void {
    console.log('[TalkToTitane] Listening stopped');
    this.state.isListening = false;
    this.notifyListeners();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // INTENT DETECTION (7 CATEGORIES)
  // ───────────────────────────────────────────────────────────────────────────

  private async detectIntent(text: string): Promise<TalkIntent> {
    const intentScores = {
      conversation: this.calculateConversationScore(text),
      dev: this.calculateDevScore(text),
      structure: this.calculateStructureScore(text),
      action: this.calculateActionScore(text),
      coaching: this.calculateCoachingScore(text),
      analyze: this.calculateAnalyzeScore(text),
      memory: this.calculateMemoryScore(text),
    };

    const topIntent = Object.entries(intentScores)
      .sort((a, b) => b[1] - a[1])[0];

    const emotionalTone = this.detectEmotionalTone(text);
    const priority = this.calculatePriority(topIntent[0] as TalkIntentType, topIntent[1]);

    return {
      type: topIntent[0] as TalkIntentType,
      confidence: topIntent[1],
      text,
      keywords: this.extractKeywords(text),
      emotionalTone,
      priority,
    };
  }

  private calculateConversationScore(text: string): number {
    const conversationKeywords = [
      'je suis', 'explique', 'c\'est quoi', 'pourquoi', 'comment',
      'dis-moi', 'parle', 'raconte', 'penses-tu', 'idée'
    ];
    let score = 0;
    conversationKeywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) score += 0.15;
    });
    return Math.min(1.0, score);
  }

  private calculateDevScore(text: string): number {
    const devKeywords = [
      'bug', 'erreur', 'plante', 'corrige', 'analyse', 'module',
      'backend', 'frontend', 'code', 'fonction', 'patch', 'debug'
    ];
    let score = 0;
    devKeywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) score += 0.2;
    });
    return Math.min(1.0, score);
  }

  private calculateStructureScore(text: string): number {
    const structureKeywords = [
      'organise', 'structure', 'clarifier', 'plan', 'checklist',
      'aide-moi à', 'ordonne', 'arrange', 'classe'
    ];
    let score = 0;
    structureKeywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) score += 0.2;
    });
    return Math.min(1.0, score);
  }

  private calculateActionScore(text: string): number {
    const actionKeywords = [
      'ouvre', 'active', 'change', 'lance', 'exécute', 'commande',
      'sudo', 'fait', 'démarre', 'arrête'
    ];
    let score = 0;
    actionKeywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) score += 0.25;
    });
    return Math.min(1.0, score);
  }

  private calculateCoachingScore(text: string): number {
    const coachingKeywords = [
      'fatigué', 'dispersé', 'rassure', 'aide', 'guidance',
      'perdu', 'motivé', 'conseil', 'soutien'
    ];
    let score = 0;
    coachingKeywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) score += 0.2;
    });
    return Math.min(1.0, score);
  }

  private calculateAnalyzeScore(text: string): number {
    const analyzeKeywords = [
      'vérifie', 'analyse interne', 'cohérence', 'synchronise',
      'singularity', 'état système', 'moteur'
    ];
    let score = 0;
    analyzeKeywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) score += 0.25;
    });
    return Math.min(1.0, score);
  }

  private calculateMemoryScore(text: string): number {
    const memoryKeywords = [
      'rappelle', 'souviens', 'hier', 'dernier', 'historique',
      'avant', 'précédent', 'mémoire', 'passé'
    ];
    let score = 0;
    memoryKeywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) score += 0.2;
    });
    return Math.min(1.0, score);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EMOTIONAL TONE DETECTION
  // ───────────────────────────────────────────────────────────────────────────

  private detectEmotionalTone(text: string): 'analytical' | 'calm' | 'energizing' | 'motivating' | 'neutral' {
    const lowerText = text.toLowerCase();

    // Analytical
    if (lowerText.match(/analyse|vérifie|diagnostic|technique|précis|détail/)) {
      return 'analytical';
    }

    // Calm (fatigue, stress)
    if (lowerText.match(/fatigué|calme|rassure|repos|zen|tranquille/)) {
      return 'calm';
    }

    // Energizing
    if (lowerText.match(/motivé|énergie|boost|allons-y|go|action/)) {
      return 'energizing';
    }

    // Motivating
    if (lowerText.match(/perdu|aide|soutien|guide|conseil|direction/)) {
      return 'motivating';
    }

    return 'neutral';
  }

  private calculatePriority(intentType: TalkIntentType, confidence: number): 'low' | 'medium' | 'high' | 'urgent' {
    // Dev bugs = urgent
    if (intentType === 'dev' && confidence > 0.8) return 'urgent';

    // Actions = high
    if (intentType === 'action') return 'high';

    // Coaching, analyze = medium
    if (['coaching', 'analyze'].includes(intentType)) return 'medium';

    // Conversation, structure, memory = low/medium
    if (confidence > 0.7) return 'medium';
    return 'low';
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'de', 'du', 'des', 'et', 'ou', 'je', 'tu', 'il'];
    return words
      .filter(w => w.length > 3 && !stopWords.includes(w))
      .slice(0, 5);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PROCESS USER INPUT
  // ───────────────────────────────────────────────────────────────────────────

  async processUserInput(text: string): Promise<TalkResponse> {
    console.log('[TalkToTitane] Processing input:', text);

    // Detect intent
    const intent = await this.detectIntent(text);
    this.state.currentIntent = intent;

    // Analyze situation (with Singularity context)
    const analysis = await this.analyzeSituation(intent);

    // Generate response
    const response = await this.generateResponse(intent, analysis);

    // Generate vocal response (adapted to mode)
    const vocalResponse = this.generateVocalResponse(response, intent);

    // Determine if action needed
    const action = this.determineAction(intent);

    // Build complete talk response
    const talkResponse: TalkResponse = {
      intent,
      analysis,
      response,
      action,
      vocalResponse,
      memoryUpdate: true,
      singularitySnapshot: this.captureSingularitySnapshot(),
      followUpSuggestions: this.generateFollowUpSuggestions(intent),
    };

    // Save response
    this.state.lastResponse = talkResponse;
    this.state.conversationHistory.push(talkResponse);
    this.state.totalInteractions++;

    // Trim history if needed
    if (this.state.conversationHistory.length > this.config.maxHistorySize) {
      this.state.conversationHistory.shift();
    }

    // Auto-save if enabled
    if (this.config.autoSaveEnabled) {
      await autoSaveConversationEngine.saveInteraction({
        sessionId: this.state.sessionId,
        timestamp: Date.now(),
        type: 'talk-to-titane',
        input: text,
        intent: intent.type,
        response: talkResponse,
      });
    }

    // Speak if TTS enabled
    if (this.config.ttsEnabled) {
      await this.speak(vocalResponse);
    }

    this.notifyListeners();
    return talkResponse;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RESPONSE GENERATION
  // ───────────────────────────────────────────────────────────────────────────

  private async analyzeSituation(intent: TalkIntent): Promise<string> {
    // TODO: Integrate with Singularity Engine, Memory Engine, Context Engine
    // For now, basic analysis based on intent type

    switch (intent.type) {
      case 'conversation':
        return `Conversation naturelle détectée. Ton émotionnel: ${intent.emotionalTone}. Priorité: ${intent.priority}.`;

      case 'dev':
        return `Problème développement identifié. Keywords: ${intent.keywords.join(', ')}. Analyse modules en cours...`;

      case 'structure':
        return `Demande d'organisation détectée. Structuration des idées nécessaire.`;

      case 'action':
        return `Commande action identifiée. Priorité élevée. Préparation exécution...`;

      case 'coaching':
        return `Besoin de guidance détecté. Ton émotionnel: ${intent.emotionalTone}. Mode coaching activé.`;

      case 'analyze':
        return `Analyse système demandée. Vérification cohérence Singularity + modules...`;

      case 'memory':
        return `Requête mémoire. Accès historique conversations + actions passées...`;

      default:
        return `Intent: ${intent.type}. Confidence: ${(intent.confidence * 100).toFixed(0)}%`;
    }
  }

  private async generateResponse(intent: TalkIntent, analysis: string): Promise<string> {
    // TODO: Integrate with AI Chat Engine for intelligent responses
    // For now, template-based responses

    const templates = {
      conversation: `Je t'écoute. ${analysis}`,
      dev: `Analyse en cours... ${analysis} Je vais diagnostiquer le problème.`,
      structure: `Organisons ça ensemble. ${analysis}`,
      action: `Compris. ${analysis} J'exécute la commande.`,
      coaching: `Je suis là. ${analysis} Prenons le temps de clarifier.`,
      analyze: `Vérification système... ${analysis}`,
      memory: `Consultation mémoire... ${analysis}`,
    };

    return templates[intent.type] || `Intent détecté: ${intent.type}. ${analysis}`;
  }

  private generateVocalResponse(response: string, intent: TalkIntent): string {
    // Adapt vocal response based on mode and emotional calibration
    const prefix = this.getVocalPrefix(intent);
    const suffix = this.getVocalSuffix(intent);

    return `${prefix} ${response} ${suffix}`.trim();
  }

  private getVocalPrefix(intent: TalkIntent): string {
    if (this.state.currentMode === 'whispered') return '';
    if (this.state.currentMode === 'focus') return 'Focus:';

    const prefixes = {
      conversation: 'D\'accord.',
      dev: 'Analyse en cours.',
      structure: 'Organisons.',
      action: 'Exécution.',
      coaching: 'Je t\'écoute.',
      analyze: 'Vérification système.',
      memory: 'Consultation mémoire.',
    };

    return prefixes[intent.type] || '';
  }

  private getVocalSuffix(_intent: TalkIntent): string {
    if (this.state.currentMode === 'continuous') {
      return 'Continue.';
    }
    return '';
  }

  private determineAction(intent: TalkIntent): string | undefined {
    // Map intents to potential SUDO commands
    if (intent.type === 'action') {
      const text = intent.text.toLowerCase();

      if (text.includes('console')) return 'sudo dev.console';
      if (text.includes('heal')) return 'sudo auto-heal';
      if (text.includes('analyse')) return 'sudo diagnostic';
      if (text.includes('singularity')) return 'sudo singularity.sync';
    }

    if (intent.type === 'dev') {
      return 'sudo diagnostic';
    }

    return undefined;
  }

  private generateFollowUpSuggestions(intent: TalkIntent): string[] {
    const suggestions: Record<TalkIntentType, string[]> = {
      conversation: ['Veux-tu en parler plus?', 'Autre chose?'],
      dev: ['Veux-tu le patch?', 'Inspecter autre module?'],
      structure: ['Créer checklist?', 'Prioriser?'],
      action: ['Autre commande?', 'Vérifier résultat?'],
      coaching: ['Te sens-tu mieux?', 'Autre guidance?'],
      analyze: ['Synchroniser Singularity?', 'Vérifier mémoire?'],
      memory: ['Voir détails?', 'Autre historique?'],
    };

    return suggestions[intent.type] || ['Continue?'];
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TTS (PLACEHOLDER)
  // ───────────────────────────────────────────────────────────────────────────

  private async speak(text: string): Promise<void> {
    // TODO: Integrate with Hybrid TTS when available
    console.log(`[TalkToTitane] TTS: "${text}" (volume: ${this.config.ttsVolume})`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SINGULARITY SNAPSHOT (PLACEHOLDER)
  // ───────────────────────────────────────────────────────────────────────────

  private captureSingularitySnapshot(): Record<string, unknown> {
    // TODO: Integrate with Singularity Engine
    return {
      timestamp: Date.now(),
      mode: this.state.currentMode,
      emotionalCalibration: this.state.emotionalCalibration,
      totalInteractions: this.state.totalInteractions,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ───────────────────────────────────────────────────────────────────────────

  configure(config: Partial<TalkToTitaneConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[TalkToTitane] Configuration updated:', config);
    this.notifyListeners();
  }

  setMode(mode: TalkToTitaneMode): void {
    this.state.currentMode = mode;
    console.log(`[TalkToTitane] Mode changed to: ${mode}`);
    this.notifyListeners();
  }

  setEmotionalCalibration(tone: 'analytical' | 'calm' | 'energizing' | 'motivating' | 'neutral'): void {
    this.state.emotionalCalibration = tone;
    console.log(`[TalkToTitane] Emotional calibration: ${tone}`);
    this.notifyListeners();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // OBSERVABLE PATTERN
  // ───────────────────────────────────────────────────────────────────────────

  subscribe(listener: (state: TalkToTitaneState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState(): TalkToTitaneState {
    return { ...this.state };
  }

  getConfig(): TalkToTitaneConfig {
    return { ...this.config };
  }

  getHistory(): TalkResponse[] {
    return [...this.state.conversationHistory];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const talkToTitaneEngine = new TalkToTitaneEngine();
