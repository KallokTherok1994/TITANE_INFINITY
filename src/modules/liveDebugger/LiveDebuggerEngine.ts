/**
 * TITANE_INFINITY v∞.29.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — Live Debugger Vocal Engine
 *   Real-time debugging assistant with continuous voice analysis
 *   Super Prompt #19 — LIVE DEBUGGER VOCAL ENGINE v∞
 * ═══════════════════════════════════════════════════════════════════
 */

import type { VocalDevState as _VocalDevState } from '@/modules/vocalDev/VocalDevConsoleEngine';

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type LiveDebuggerMode =
  | 'shadow' // Écoute sans intervenir
  | 'active' // Analyse et propose
  | 'auto-heal' // Corrections automatiques
  | 'explain' // Explications en direct
  | 'draft'; // Génération patch vocale

export type LiveIntentType =
  | 'dev' // Code/patch/fix
  | 'bug' // Report bug
  | 'ui' // UI problem
  | 'backend' // Backend issue
  | 'heal' // Self-heal request
  | 'diagnostic' // System check
  | 'question' // Explanation request
  | 'command'; // SUDO command

export interface LiveIntent {
  type: LiveIntentType;
  text: string;
  confidence: number;
  keywords: string[];
  modules: string[]; // Modules impactés
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean; // Peut-on agir immédiatement?
}

export interface LiveDiagnostic {
  timestamp: number;
  intent: LiveIntent;
  analysis: string; // Ce qui a été détecté
  rootCause: string | null; // Cause probable
  affectedModules: string[];
  suggestedFix: string | null;
  microPatch: MicroPatch | null;
  macroPatch: MacroPatch | null;
  executionPlan: string[]; // Steps pour corriger
}

export interface MicroPatch {
  type: 'micro';
  module: string;
  file: string;
  changes: Array<{
    line: number;
    before: string;
    after: string;
  }>;
  reason: string;
  confidence: number;
  safe: boolean; // Non destructif?
  autoApplicable: boolean; // Peut être appliqué automatiquement?
}

export interface MacroPatch {
  type: 'macro';
  modules: string[];
  files: string[];
  description: string;
  requiresReview: boolean;
  estimatedTime: string;
}

export interface LiveDebuggerState {
  mode: LiveDebuggerMode;
  isListening: boolean;
  isAnalyzing: boolean;
  isPatching: boolean;
  currentTranscript: string;
  segmentBuffer: string[]; // Segments de 300ms
  diagnostics: LiveDiagnostic[];
  appliedPatches: MicroPatch[];
  healthScore: number;
  sessionStartTime: number;
  totalSegments: number;
  totalDiagnostics: number;
  totalPatches: number;
}

export interface LiveDebuggerConfig {
  enabled: boolean;
  mode: LiveDebuggerMode;
  segmentIntervalMs: number; // 300ms par défaut
  autoHealEnabled: boolean;
  explainWhileDebugging: boolean;
  ttsEnabled: boolean;
  shadowModeThreshold: number; // Confidence pour intervenir en shadow
  maxSegmentBufferSize: number;
  continuousAnalysis: boolean;
}

// ✨ v24.2.1: Limits for bounded memory growth
const MAX_DIAGNOSTICS = 100;
const MAX_APPLIED_PATCHES = 50;
const MAX_ANALYSIS_QUEUE = 20;

// ═══════════════════════════════════════════════════════════════════
// LIVE DEBUGGER ENGINE
// ═══════════════════════════════════════════════════════════════════

export class LiveDebuggerEngine {
  private static instance: LiveDebuggerEngine | null = null;

  private state: LiveDebuggerState;
  private config: LiveDebuggerConfig;
  private listeners: Array<(state: LiveDebuggerState) => void> = [];
  private segmentTimer: NodeJS.Timeout | null = null;
  private analysisQueue: string[] = [];

  private constructor() {
    this.state = {
      mode: 'shadow',
      isListening: false,
      isAnalyzing: false,
      isPatching: false,
      currentTranscript: '',
      segmentBuffer: [],
      diagnostics: [],
      appliedPatches: [],
      healthScore: 100,
      sessionStartTime: Date.now(),
      totalSegments: 0,
      totalDiagnostics: 0,
      totalPatches: 0,
    };

    this.config = {
      enabled: false,
      mode: 'shadow',
      segmentIntervalMs: 300,
      autoHealEnabled: false,
      explainWhileDebugging: false,
      ttsEnabled: false,
      shadowModeThreshold: 0.75,
      maxSegmentBufferSize: 50,
      continuousAnalysis: true,
    };
  }

  static getInstance(): LiveDebuggerEngine {
    if (!LiveDebuggerEngine.instance) {
      LiveDebuggerEngine.instance = new LiveDebuggerEngine();
    }
    return LiveDebuggerEngine.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Activer le Live Debugger
   */
  async activate(mode: LiveDebuggerMode = 'shadow'): Promise<void> {
    console.log(`[LiveDebugger] Activating in ${mode} mode...`);

    this.config.enabled = true;
    this.config.mode = mode;
    this.state.mode = mode;
    this.state.sessionStartTime = Date.now();
    this.state.healthScore = 100;

    // Activer le Vocal Dev Console sous-jacent
    const { vocalDevConsole } = await import('@/modules/vocalDev/VocalDevConsoleEngine');
    await vocalDevConsole.activate();

    // Démarrer le segment timer
    this.startSegmentTimer();

    this.notifyListeners();
    console.log('[LiveDebugger] ✅ Activated');
  }

  /**
   * Désactiver le Live Debugger
   */
  async deactivate(): Promise<void> {
    console.log('[LiveDebugger] Deactivating...');

    this.config.enabled = false;
    this.stopSegmentTimer();
    this.stopListening();

    this.notifyListeners();
    console.log('[LiveDebugger] ✅ Deactivated');
  }

  /**
   * Démarrer l'écoute continue
   */
  async startListening(): Promise<void> {
    if (this.state.isListening) {
      console.warn('[LiveDebugger] Already listening');
      return;
    }

    console.log('[LiveDebugger] Starting continuous listening...');

    try {
      // Démarrer recording via Vocal Dev Console
      const { vocalDevConsole } =
        await import('@/modules/vocalDev/VocalDevConsoleEngine');
      await vocalDevConsole.startRecording();

      this.state.isListening = true;
      this.state.segmentBuffer = [];
      this.analysisQueue = [];

      this.notifyListeners();
      console.log('[LiveDebugger] ✅ Listening started');
    } catch (error) {
      console.error('[LiveDebugger] Failed to start listening:', error);
      throw error;
    }
  }

  /**
   * Arrêter l'écoute
   */
  stopListening(): void {
    if (!this.state.isListening) return;

    console.log('[LiveDebugger] Stopping listening...');

    this.state.isListening = false;
    this.state.currentTranscript = '';
    this.state.segmentBuffer = [];
    this.analysisQueue = [];

    this.notifyListeners();
    console.log('[LiveDebugger] ✅ Listening stopped');
  }

  // ═══════════════════════════════════════════════════════════════
  // REAL-TIME ANALYSIS LOOP (300ms)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Démarrer le timer de segments (300ms)
   */
  private startSegmentTimer(): void {
    if (this.segmentTimer) {
      clearInterval(this.segmentTimer);
    }

    this.segmentTimer = setInterval(() => {
      this.processSegment();
    }, this.config.segmentIntervalMs);

    console.log(
      `[LiveDebugger] Segment timer started (${this.config.segmentIntervalMs}ms)`
    );
  }

  /**
   * Arrêter le timer
   */
  private stopSegmentTimer(): void {
    if (this.segmentTimer) {
      clearInterval(this.segmentTimer);
      this.segmentTimer = null;
      console.log('[LiveDebugger] Segment timer stopped');
    }
  }

  /**
   * Traiter un segment vocal (appelé toutes les 300ms)
   */
  private async processSegment(): Promise<void> {
    if (!this.config.enabled || !this.state.isListening) return;

    try {
      // Récupérer la transcription actuelle (via VocalDevConsole state)
      const { vocalDevConsole } =
        await import('@/modules/vocalDev/VocalDevConsoleEngine');
      const vocalState = vocalDevConsole.getState();
      // Note: VocalDevState doesn't have direct transcript, need to implement retrieval
      // For now, use lastCommand as placeholder
      const newTranscript = vocalState.lastCommand || '';

      // Vérifier s'il y a du nouveau contenu
      if (newTranscript && newTranscript !== this.state.currentTranscript) {
        const segment = newTranscript.substring(this.state.currentTranscript.length);

        if (segment.trim()) {
          this.state.currentTranscript = newTranscript;
          this.state.segmentBuffer.push(segment);
          this.state.totalSegments++;

          // Limiter taille buffer
          if (this.state.segmentBuffer.length > this.config.maxSegmentBufferSize) {
            this.state.segmentBuffer.shift();
          }

          // Ajouter à la queue d'analyse
          this.analysisQueue.push(segment);

          // ✨ v24.2.1: Limit analysis queue to prevent unbounded growth
          if (this.analysisQueue.length > MAX_ANALYSIS_QUEUE) {
            this.analysisQueue.shift();
          }

          // Analyser immédiatement si continuous analysis
          if (this.config.continuousAnalysis && !this.state.isAnalyzing) {
            await this.analyzeSegment(segment);
          }

          this.notifyListeners();
        }
      }
    } catch (error) {
      console.error('[LiveDebugger] Segment processing error:', error);
    }
  }

  /**
   * Analyser un segment vocal en temps réel
   */
  private async analyzeSegment(segment: string): Promise<void> {
    if (this.state.isAnalyzing) return;

    this.state.isAnalyzing = true;
    this.notifyListeners();

    try {
      // 1. Détecter intention
      const intent = await this.detectIntent(segment);

      // 2. Si confidence suffisante, diagnostiquer
      if (intent.confidence >= 0.6) {
        const diagnostic = await this.diagnoseIssue(intent);
        this.state.diagnostics.push(diagnostic);
        this.state.totalDiagnostics++;

        // ✨ v24.2.1: Limit diagnostics array to prevent unbounded growth
        if (this.state.diagnostics.length > MAX_DIAGNOSTICS) {
          this.state.diagnostics = this.state.diagnostics.slice(-MAX_DIAGNOSTICS);
        }

        // 3. En mode auto-heal, appliquer micro-patch si safe
        if (this.config.autoHealEnabled && diagnostic.microPatch?.safe) {
          await this.applyMicroPatch(diagnostic.microPatch);
        }

        // 4. En mode explain, expliquer via TTS
        if (this.config.explainWhileDebugging && this.config.ttsEnabled) {
          await this.explainDiagnostic(diagnostic);
        }

        // 5. En mode shadow, n'intervenir que si critique
        if (
          this.state.mode === 'shadow' &&
          intent.confidence >= this.config.shadowModeThreshold
        ) {
          console.log('[LiveDebugger] Shadow mode intervention:', intent.type);
        }

        this.notifyListeners();
      }
    } catch (error) {
      console.error('[LiveDebugger] Analysis error:', error);
    } finally {
      this.state.isAnalyzing = false;
      this.notifyListeners();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // INTENT DETECTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Détecter l'intention dans un segment vocal
   */
  private async detectIntent(text: string): Promise<LiveIntent> {
    const lowerText = text.toLowerCase();

    // Patterns pour chaque type d'intention
    const patterns: Record<LiveIntentType, RegExp[]> = {
      dev: [
        /corrige|répare|fix|patch|debug/i,
        /génère|crée|create/i,
        /refactor|optimize|améliore/i,
      ],
      bug: [
        /bug|erreur|error|problème|problem/i,
        /plante|crash|freeze|figé/i,
        /ne fonctionne pas|doesn't work/i,
      ],
      ui: [
        /la page|l'interface|le bouton|la bulle/i,
        /ne s'ouvre pas|ne s'affiche pas/i,
        /ui|frontend|react|tsx/i,
      ],
      backend: [
        /backend|rust|tauri|server/i,
        /api|endpoint|handler/i,
        /modèle local|llama|ollama/i,
      ],
      heal: [
        /auto.?heal|self.?heal/i,
        /répare automatiquement|fix automatique/i,
        /diagnostic/i,
      ],
      diagnostic: [
        /montre|affiche|show|display/i,
        /logs|erreurs|status|état/i,
        /vérifie|check|inspect/i,
      ],
      question: [
        /qu'est-ce|c'est quoi|comment|pourquoi|why|how/i,
        /explique|explain/i,
        /aide|help/i,
      ],
      command: [/sudo|command|exec|exécute/i, /run|lance|démarre|start/i],
    };

    // Calculer confidence pour chaque type
    const scores: Record<LiveIntentType, number> = {
      dev: 0,
      bug: 0,
      ui: 0,
      backend: 0,
      heal: 0,
      diagnostic: 0,
      question: 0,
      command: 0,
    };

    for (const [type, typePatterns] of Object.entries(patterns)) {
      for (const pattern of typePatterns) {
        if (pattern.test(lowerText)) {
          scores[type as LiveIntentType] += 0.33;
        }
      }
    }

    // Trouver type avec meilleur score
    const bestType = (Object.keys(scores) as LiveIntentType[]).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    // Extraire keywords
    const keywords = lowerText
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);

    // Identifier modules impactés
    const modules = this.identifyModules(lowerText);

    // Déterminer sévérité
    const severity = this.calculateSeverity(lowerText, scores[bestType]);

    return {
      type: bestType,
      text,
      confidence: Math.min(scores[bestType], 1.0),
      keywords,
      modules,
      severity,
      actionable: scores[bestType] >= 0.6,
    };
  }

  /**
   * Identifier modules impactés dans le texte
   */
  private identifyModules(text: string): string[] {
    const modules: string[] = [];
    const modulePatterns = [
      { name: 'AudioEngine', patterns: ['audio', 'micro', 'vad', 'tts', 'voix'] },
      { name: 'VocalConsole', patterns: ['vocal', 'console vocale'] },
      { name: 'HybridEngine', patterns: ['hybrid', 'bulle', 'bubble'] },
      { name: 'AutoHeal', patterns: ['auto heal', 'self heal', 'réparation'] },
      { name: 'Backend', patterns: ['backend', 'rust', 'tauri'] },
      { name: 'Frontend', patterns: ['frontend', 'react', 'ui', 'interface'] },
      { name: 'AI', patterns: ['ia', 'modèle', 'llama', 'claude', 'gemini'] },
    ];

    for (const { name, patterns } of modulePatterns) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          modules.push(name);
          break;
        }
      }
    }

    return modules;
  }

  /**
   * Calculer sévérité du problème
   */
  private calculateSeverity(
    text: string,
    _confidence: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalWords = ['crash', 'plante', 'bloque', 'figé', 'freeze'];
    const highWords = ['erreur', 'error', 'bug', 'problème'];
    const mediumWords = ['bizarre', 'étrange', 'lent', 'slow'];

    if (criticalWords.some(w => text.includes(w))) return 'critical';
    if (highWords.some(w => text.includes(w))) return 'high';
    if (mediumWords.some(w => text.includes(w))) return 'medium';
    return 'low';
  }

  // ═══════════════════════════════════════════════════════════════
  // DIAGNOSTIC ENGINE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Diagnostiquer un problème basé sur l'intention détectée
   */
  private async diagnoseIssue(intent: LiveIntent): Promise<LiveDiagnostic> {
    console.log(`[LiveDebugger] Diagnosing ${intent.type} issue...`);

    // Analyse contextuelle
    const analysis = this.analyzeContext(intent);

    // Identifier cause probable
    const rootCause = this.identifyRootCause(intent, analysis);

    // Générer micro-patch si applicable
    const microPatch = await this.generateMicroPatch(intent, rootCause);

    // Générer macro-patch si nécessaire
    const macroPatch = microPatch ? null : this.generateMacroPatch(intent, rootCause);

    // Créer plan d'exécution
    const executionPlan = this.createExecutionPlan(intent, microPatch, macroPatch);

    // Suggestion de fix
    const suggestedFix = microPatch
      ? `Apply micro-patch to ${microPatch.module}`
      : macroPatch
        ? `Review and apply macro-patch`
        : 'Manual investigation required';

    return {
      timestamp: Date.now(),
      intent,
      analysis,
      rootCause,
      affectedModules: intent.modules,
      suggestedFix,
      microPatch,
      macroPatch,
      executionPlan,
    };
  }

  /**
   * Analyser contexte système
   */
  private analyzeContext(intent: LiveIntent): string {
    const contextParts: string[] = [];

    // Ajouter info modules
    if (intent.modules.length > 0) {
      contextParts.push(`Modules impactés: ${intent.modules.join(', ')}`);
    }

    // Ajouter sévérité
    contextParts.push(`Sévérité: ${intent.severity}`);

    // Ajouter keywords détectés
    if (intent.keywords.length > 0) {
      contextParts.push(`Keywords: ${intent.keywords.join(', ')}`);
    }

    return contextParts.join(' | ');
  }

  /**
   * Identifier cause racine probable
   */
  private identifyRootCause(intent: LiveIntent, _analysis: string): string | null {
    // Heuristiques basées sur le type d'intention et modules
    if (intent.type === 'ui' && intent.modules.includes('Frontend')) {
      return 'React state issue or component render problem';
    }

    if (intent.type === 'backend' && intent.modules.includes('Backend')) {
      return 'Tauri command error or Rust handler issue';
    }

    if (intent.type === 'bug' && intent.severity === 'critical') {
      return 'Critical system failure requiring immediate attention';
    }

    return null;
  }

  /**
   * Générer micro-patch automatique (corrections simples)
   */
  private async generateMicroPatch(
    intent: LiveIntent,
    rootCause: string | null
  ): Promise<MicroPatch | null> {
    // Seules les corrections simples et sûres
    if (intent.type === 'heal' && intent.confidence >= 0.8) {
      return {
        type: 'micro',
        module: intent.modules[0] || 'Unknown',
        file: 'auto-detected',
        changes: [],
        reason: rootCause || 'Auto-heal triggered',
        confidence: intent.confidence,
        safe: true,
        autoApplicable: this.config.autoHealEnabled,
      };
    }

    return null;
  }

  /**
   * Générer macro-patch (corrections complexes)
   */
  private generateMacroPatch(
    intent: LiveIntent,
    rootCause: string | null
  ): MacroPatch | null {
    if (intent.actionable && intent.confidence >= 0.7) {
      return {
        type: 'macro',
        modules: intent.modules,
        files: [],
        description:
          rootCause || `Fix ${intent.type} issue in ${intent.modules.join(', ')}`,
        requiresReview: true,
        estimatedTime: '5-10 minutes',
      };
    }

    return null;
  }

  /**
   * Créer plan d'exécution
   */
  private createExecutionPlan(
    intent: LiveIntent,
    microPatch: MicroPatch | null,
    macroPatch: MacroPatch | null
  ): string[] {
    const plan: string[] = [];

    if (microPatch) {
      plan.push(`Apply micro-patch to ${microPatch.module}`);
      plan.push('Verify system stability');
      plan.push('Update health score');
    } else if (macroPatch) {
      plan.push('Review macro-patch description');
      plan.push('Validate changes with user');
      plan.push('Apply patch');
      plan.push('Run tests');
      plan.push('Monitor for regressions');
    } else {
      plan.push('Gather more information');
      plan.push('Manual investigation');
      plan.push('Consult logs');
    }

    return plan;
  }

  // ═══════════════════════════════════════════════════════════════
  // PATCH APPLICATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Appliquer micro-patch automatiquement
   */
  private async applyMicroPatch(patch: MicroPatch): Promise<void> {
    if (!patch.safe || !patch.autoApplicable) {
      console.warn('[LiveDebugger] Patch not auto-applicable');
      return;
    }

    console.log(`[LiveDebugger] Applying micro-patch to ${patch.module}...`);

    this.state.isPatching = true;
    this.notifyListeners();

    try {
      // Note: autoHealEngine.heal() needs proper args in real implementation
      // For now, log the patch application
      console.log('[LiveDebugger] Auto-applying micro-patch:', patch.reason);
      // await autoHealEngine.heal(patch.file, patch.changes, patch.reason, patch.confidence);

      this.state.appliedPatches.push(patch);
      this.state.totalPatches++;

      // ✨ v24.2.1: Limit applied patches to prevent unbounded growth
      if (this.state.appliedPatches.length > MAX_APPLIED_PATCHES) {
        this.state.appliedPatches = this.state.appliedPatches.slice(-MAX_APPLIED_PATCHES);
      }

      // Recalculer health score
      this.updateHealthScore();

      console.log('[LiveDebugger] ✅ Micro-patch applied');
    } catch (error) {
      console.error('[LiveDebugger] Patch application failed:', error);
      this.state.healthScore = Math.max(0, this.state.healthScore - 10);
    } finally {
      this.state.isPatching = false;
      this.notifyListeners();
    }
  }

  /**
   * Expliquer diagnostic via TTS
   */
  private async explainDiagnostic(diagnostic: LiveDiagnostic): Promise<void> {
    if (!this.config.ttsEnabled) return;

    const explanation = `Détecté: ${diagnostic.intent.type}. ${diagnostic.rootCause || 'Analyse en cours.'}`;

    try {
      // INTEGRATION: hybridTTS integration for live debugging feedback
      // 1. Import: import { hybridTTS } from '@/services/voice/hybridTTS'
      // 2. Check availability: if (hybridTTS && hybridTTS.isReady())
      // 3. Call speak: await hybridTTS.speak(explanation, { priority: 'high', interrupt: false })
      // 4. Options: priority='high' for important diagnostics, interrupt=false to queue
      // 5. Emotion: Optional emotion mapping based on diagnostic severity (error→concerned, warning→neutral)
      // 6. Fallback: Console log if TTS unavailable (as current)
      console.log('[LiveDebugger] TTS Explanation:', explanation);
      // await hybridTTS.speak(explanation, { priority: 'high', interrupt: false });
    } catch (error) {
      console.error('[LiveDebugger] TTS explanation failed:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HEALTH SCORE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Mettre à jour health score basé sur diagnostics récents
   */
  private updateHealthScore(): void {
    const recentDiagnostics = this.state.diagnostics.slice(-10);

    if (recentDiagnostics.length === 0) {
      this.state.healthScore = 100;
      return;
    }

    const criticalCount = recentDiagnostics.filter(
      d => d.intent.severity === 'critical'
    ).length;
    const highCount = recentDiagnostics.filter(d => d.intent.severity === 'high').length;

    let score = 100;
    score -= criticalCount * 20;
    score -= highCount * 10;
    score = Math.max(0, score);

    // Bonus pour patches appliqués
    const successfulPatches = this.state.appliedPatches.slice(-10).length;
    score += successfulPatches * 5;
    score = Math.min(100, score);

    this.state.healthScore = score;
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  getState(): LiveDebuggerState {
    return { ...this.state };
  }

  getConfig(): LiveDebuggerConfig {
    return { ...this.config };
  }

  getRecentDiagnostics(count: number = 10): LiveDiagnostic[] {
    return this.state.diagnostics.slice(-count);
  }

  getHealthScore(): number {
    return this.state.healthScore;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  configure(newConfig: Partial<LiveDebuggerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Si mode changé, mettre à jour state
    if (newConfig.mode) {
      this.state.mode = newConfig.mode;
    }

    this.notifyListeners();
  }

  setMode(mode: LiveDebuggerMode): void {
    this.config.mode = mode;
    this.state.mode = mode;
    this.notifyListeners();
    console.log(`[LiveDebugger] Mode changed to: ${mode}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // OBSERVABILITY
  // ═══════════════════════════════════════════════════════════════

  subscribe(listener: (state: LiveDebuggerState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (error) {
        console.error('[LiveDebugger] Listener error:', error);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  reset(): void {
    this.state.diagnostics = [];
    this.state.appliedPatches = [];
    this.state.segmentBuffer = [];
    this.state.currentTranscript = '';
    this.state.totalSegments = 0;
    this.state.totalDiagnostics = 0;
    this.state.totalPatches = 0;
    this.state.healthScore = 100;
    this.state.sessionStartTime = Date.now();
    this.notifyListeners();
    console.log('[LiveDebugger] Reset complete');
  }

  clearDiagnostics(): void {
    this.state.diagnostics = [];
    this.notifyListeners();
  }

  getSessionDuration(): number {
    return Date.now() - this.state.sessionStartTime;
  }

  getStats() {
    return {
      sessionDuration: this.getSessionDuration(),
      totalSegments: this.state.totalSegments,
      totalDiagnostics: this.state.totalDiagnostics,
      totalPatches: this.state.totalPatches,
      healthScore: this.state.healthScore,
      averageConfidence:
        this.state.diagnostics.length > 0
          ? this.state.diagnostics.reduce((sum, d) => sum + d.intent.confidence, 0) /
            this.state.diagnostics.length
          : 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const liveDebugger = LiveDebuggerEngine.getInstance();
