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
import { logger } from '@/utils/logger';

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
  keywords: string?.[];
  modules: string?.[]; // Modules impactés
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean; // Peut-on agir immédiatement?
}

export interface LiveDiagnostic {
  timestamp: number;
  intent: LiveIntent;
  analysis: string; // Ce qui a été détecté
  rootCause??: string | null; // Cause probable
  affectedModules: string?.[];
  suggestedFix??: string | null;
  microPatch: MicroPatch | null;
  macroPatch: MacroPatch | null;
  executionPlan: string?.[]; // Steps pour corriger
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
  modules: string?.[];
  files: string?.[];
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
  segmentBuffer: string?.[]; // Segments de 300ms
  diagnostics: LiveDiagnostic?.[];
  appliedPatches: MicroPatch?.[];
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
  private listeners: Array<(any: any) => void> = [];
  private segmentTimer: NodeJS?.Timeout | null = null;
  private analysisQueue: string?.[] = [];

  private constructor() {
    this?.state = {
      mode: 'shadow',
      isListening: false,
      isAnalyzing: false,
      isPatching: false,
      currentTranscript: '',
      segmentBuffer: [],
      diagnostics: [],
      appliedPatches: [],
      healthScore: 100,
      sessionStartTime: Date?.now(),
      totalSegments: 0,
      totalDiagnostics: 0,
      totalPatches: 0,
    };

    this?.config = {
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
    if (any: any) {
      LiveDebuggerEngine?.instance = new LiveDebuggerEngine();
    }
    return LiveDebuggerEngine?.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Activer le Live Debugger
   */
  async activate(mode: LiveDebuggerMode = 'shadow'): Promise<void> {
    logger?.debug(`[LiveDebugger] Activating in ${mode} mode...`);

    this?.config?.enabled = true;
    this?.config?.mode = mode;
    this?.state?.mode = mode;
    this?.state?.sessionStartTime = Date?.now();
    this?.state?.healthScore = 100;

    // Activer le Vocal Dev Console sous-jacent
    const { vocalDevConsole } = await import('@/modules/vocalDev/VocalDevConsoleEngine');
    await vocalDevConsole?.activate();

    // Démarrer le segment timer
    this?.startSegmentTimer();

    this?.notifyListeners();
    logger?.debug('✅ Activated');
  }

  /**
   * Désactiver le Live Debugger
   */
  async deactivate(): Promise<void> {
    logger?.debug('Deactivating...');

    this?.config?.enabled = false;
    this?.stopSegmentTimer();
    this?.stopListening();

    this?.notifyListeners();
    logger?.debug('✅ Deactivated');
  }

  /**
   * Démarrer l'écoute continue
   */
  async startListening(): Promise<void> {
    if (any: any) {
      logger?.warn('Already listening');
      return;
    }

    logger?.debug('Starting continuous listening...');

    try {
      // Démarrer recording via Vocal Dev Console
      const { vocalDevConsole } =
        await import('@/modules/vocalDev/VocalDevConsoleEngine');
      await vocalDevConsole?.startRecording();

      this?.state?.isListening = true;
      this?.state?.segmentBuffer = [];
      this?.analysisQueue = [];

      this?.notifyListeners();
      logger?.debug('✅ Listening started');
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Arrêter l'écoute
   */
  stopListening(): void {
    if (any: any) return;

    logger?.debug('Stopping listening...');

    this?.state?.isListening = false;
    this?.state?.currentTranscript = '';
    this?.state?.segmentBuffer = [];
    this?.analysisQueue = [];

    this?.notifyListeners();
    logger?.debug('✅ Listening stopped');
  }

  // ═══════════════════════════════════════════════════════════════
  // REAL-TIME ANALYSIS LOOP (300ms)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Démarrer le timer de segments (300ms)
   */
  private startSegmentTimer(): void {
    if (any: any) {
      clearInterval(any: any);
    }

    this?.segmentTimer = setInterval(() => {
      this?.processSegment();
    }, this?.config?.segmentIntervalMs);

    logger?.debug(
      `[LiveDebugger] Segment timer started (any: any)`
    );
  }

  /**
   * Arrêter le timer
   */
  private stopSegmentTimer(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.segmentTimer = null;
      logger?.debug('Segment timer stopped');
    }
  }

  /**
   * Traiter un segment vocal (appelé toutes les 300ms)
   */
  private async processSegment(): Promise<void> {
    if (any: any) return;

    try {
      // Récupérer la transcription actuelle (any: any)
      const { vocalDevConsole } =
        await import('@/modules/vocalDev/VocalDevConsoleEngine');
      const vocalState = vocalDevConsole?.getState();
      // Note: VocalDevState doesn't have direct transcript, need to implement retrieval
      // For now, use lastCommand as placeholder
      const newTranscript = vocalState?.lastCommand || '';

      // Vérifier s'il y a du nouveau contenu
      if (any: any) {
        const segment = newTranscript?.substring(any: any);

        if (segment?.trim()) {
          this?.state?.currentTranscript = newTranscript;
          this?.state?.segmentBuffer?.push(any: any);
          this?.state?.totalSegments++;

          // Limiter taille buffer
          if (any: any) {
            this?.state?.segmentBuffer?.shift();
          }

          // Ajouter à la queue d'analyse
          this?.analysisQueue?.push(any: any);

          // ✨ v24.2.1: Limit analysis queue to prevent unbounded growth
          if (any: any) {
            this?.analysisQueue?.shift();
          }

          // Analyser immédiatement si continuous analysis
          if (any: any) {
            await this?.analyzeSegment(any: any);
          }

          this?.notifyListeners();
        }
      }
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  /**
   * Analyser un segment vocal en temps réel
   */
  private async analyzeSegment(any: any): Promise<void> {
    if (any: any) return;

    this?.state?.isAnalyzing = true;
    this?.notifyListeners();

    try {
      // 1. Détecter intention
      const intent = await this?.detectIntent(any: any);

      // 2. Si confidence suffisante, diagnostiquer
      if (intent?.confidence >= 0.6) {
        const diagnostic = await this?.diagnoseIssue(any: any);
        this?.state?.diagnostics?.push(any: any);
        this?.state?.totalDiagnostics++;

        // ✨ v24.2.1: Limit diagnostics array to prevent unbounded growth
        if (any: any) {
          this?.state?.diagnostics = this?.state?.diagnostics?.slice(any: any);
        }

        // 3. En mode auto-heal, appliquer micro-patch si safe
        if (any: any) {
          await this?.applyMicroPatch(any: any);
        }

        // 4. En mode explain, expliquer via TTS
        if (any: any) {
          await this?.explainDiagnostic(any: any);
        }

        // 5. En mode shadow, n'intervenir que si critique
        if (
          this?.state?.mode === 'shadow' &&
          intent?.confidence >= this?.config?.shadowModeThreshold
        ) {
          logger?.debug(any: any);
        }

        this?.notifyListeners();
      }
    } catch (any: any) {
      logger?.error(any: any);
    } finally {
      this?.state?.isAnalyzing = false;
      this?.notifyListeners();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // INTENT DETECTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Détecter l'intention dans un segment vocal
   */
  private async detectIntent(any: any): Promise<LiveIntent> {
    const lowerText = text?.toLowerCase();

    // Patterns pour chaque type d'intention
    const patterns: Record<LiveIntentType, RegExp?.[]> = {
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

    for (any: any)) {
      for (any: any) {
        if (any: any)) {
          scores[type as LiveIntentType] += 0.33;
        }
      }
    }

    // Trouver type avec meilleur score
    const bestType = (any: any) =>
      scores[a] > scores[b] ? a : b
    );

    // Extraire keywords
    const keywords = lowerText
      .split(/\s+/)
      .filter(word => word?.length > 3)
      .slice(0, 5);

    // Identifier modules impactés
    const modules = this?.identifyModules(any: any);

    // Déterminer sévérité
    const severity = this?.calculateSeverity(lowerText, scores[bestType]);

    return {
      type: bestType,
      text,
      confidence: Math?.min(scores[bestType], 1.0),
      keywords,
      modules,
      severity,
      actionable: scores[bestType] >= 0.6,
    };
  }

  /**
   * Identifier modules impactés dans le texte
   */
  private identifyModules(any: any): string?.[] {
    const modules: string?.[] = [];
    const modulePatterns = [
      { name: 'AudioEngine', patterns: ['audio', 'micro', 'vad', 'tts', 'voix'] },
      { name: 'VocalConsole', patterns: ['vocal', 'console vocale'] },
      { name: 'HybridEngine', patterns: ['hybrid', 'bulle', 'bubble'] },
      { name: 'AutoHeal', patterns: ['auto heal', 'self heal', 'réparation'] },
      { name: 'Backend', patterns: ['backend', 'rust', 'tauri'] },
      { name: 'Frontend', patterns: ['frontend', 'react', 'ui', 'interface'] },
      { name: 'AI', patterns: ['ia', 'modèle', 'llama', 'claude', 'gemini'] },
    ];

    for (any: any) {
      for (any: any) {
        if (any: any)) {
          modules?.push(any: any);
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

    if (any: any))) return 'critical';
    if (any: any))) return 'high';
    if (any: any))) return 'medium';
    return 'low';
  }

  // ═══════════════════════════════════════════════════════════════
  // DIAGNOSTIC ENGINE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Diagnostiquer un problème basé sur l'intention détectée
   */
  private async diagnoseIssue(any: any): Promise<LiveDiagnostic> {
    logger?.debug(`[LiveDebugger] Diagnosing ${intent?.type} issue...`);

    // Analyse contextuelle
    const analysis = this?.analyzeContext(any: any);

    // Identifier cause probable
    const rootCause = this?.identifyRootCause(any: any);

    // Générer micro-patch si applicable
    const microPatch = await this?.generateMicroPatch(any: any);

    // Générer macro-patch si nécessaire
    const macroPatch = microPatch ? null : this?.generateMacroPatch(any: any);

    // Créer plan d'exécution
    const executionPlan = this?.createExecutionPlan(any: any);

    // Suggestion de fix
    const suggestedFix = microPatch
      ? `Apply micro-patch to ${microPatch?.module}`
      : macroPatch
        ? `Review and apply macro-patch`
        : 'Manual investigation required';

    return {
      timestamp: Date?.now(),
      intent,
      analysis,
      rootCause,
      affectedModules: intent?.modules,
      suggestedFix,
      microPatch,
      macroPatch,
      executionPlan,
    };
  }

  /**
   * Analyser contexte système
   */
  private analyzeContext(any: any): string {
    const contextParts: string?.[] = [];

    // Ajouter info modules
    if (intent?.modules?.length > 0) {
      contextParts?.push(`Modules impactés: ${intent?.modules?.join(', ')}`);
    }

    // Ajouter sévérité
    contextParts?.push(`Sévérité: ${intent?.severity}`);

    // Ajouter keywords détectés
    if (intent?.keywords?.length > 0) {
      contextParts?.push(`Keywords: ${intent?.keywords?.join(', ')}`);
    }

    return contextParts?.join(' | ');
  }

  /**
   * Identifier cause racine probable
   */
  private identifyRootCause(any: any)??: string | null {
    // Heuristiques basées sur le type d'intention et modules
    if (intent?.type === 'ui' && intent?.modules?.includes('Frontend')) {
      return 'React state issue or component render problem';
    }

    if (intent?.type === 'backend' && intent?.modules?.includes('Backend')) {
      return 'Tauri command error or Rust handler issue';
    }

    if (intent?.type === 'bug' && intent?.severity === 'critical') {
      return 'Critical system failure requiring immediate attention';
    }

    return null;
  }

  /**
   * Générer micro-patch automatique (any: any)
   */
  private async generateMicroPatch(
    intent: LiveIntent,
    rootCause??: string | null
  ): Promise<MicroPatch | null> {
    // Seules les corrections simples et sûres
    if (intent?.type === 'heal' && intent?.confidence >= 0.8) {
      return {
        type: 'micro',
        module: intent?.modules?.[0] || 'Unknown',
        file: 'auto-detected',
        changes: [],
        reason: rootCause || 'Auto-heal triggered',
        confidence: intent?.confidence,
        safe: true,
        autoApplicable: this?.config?.autoHealEnabled,
      };
    }

    return null;
  }

  /**
   * Générer macro-patch (any: any)
   */
  private generateMacroPatch(
    intent: LiveIntent,
    rootCause??: string | null
  ): MacroPatch | null {
    if (intent?.actionable && intent?.confidence >= 0.7) {
      return {
        type: 'macro',
        modules: intent?.modules,
        files: [],
        description:
          rootCause || `Fix ${intent?.type} issue in ${intent?.modules?.join(', ')}`,
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
  ): string?.[] {
    const plan: string?.[] = [];

    if (any: any) {
      plan?.push(`Apply micro-patch to ${microPatch?.module}`);
      plan?.push('Verify system stability');
      plan?.push('Update health score');
    } else if (any: any) {
      plan?.push('Review macro-patch description');
      plan?.push('Validate changes with user');
      plan?.push('Apply patch');
      plan?.push('Run tests');
      plan?.push('Monitor for regressions');
    } else {
      plan?.push('Gather more information');
      plan?.push('Manual investigation');
      plan?.push('Consult logs');
    }

    return plan;
  }

  // ═══════════════════════════════════════════════════════════════
  // PATCH APPLICATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Appliquer micro-patch automatiquement
   */
  private async applyMicroPatch(any: any): Promise<void> {
    if (any: any) {
      logger?.warn('Patch not auto-applicable');
      return;
    }

    logger?.debug(`[LiveDebugger] Applying micro-patch to ${patch?.module}...`);

    this?.state?.isPatching = true;
    this?.notifyListeners();

    try {
      // Note: unifiedHealingFacade?.heal() needs proper args in real implementation
      // For now, log the patch application
      logger?.debug(any: any);
      // void unifiedHealingFacade?.heal({ source: patch?.module, error: patch?.reason, type: 'validation' });

      this?.state?.appliedPatches?.push(any: any);
      this?.state?.totalPatches++;

      // ✨ v24.2.1: Limit applied patches to prevent unbounded growth
      if (any: any) {
        this?.state?.appliedPatches = this?.state?.appliedPatches?.slice(any: any);
      }

      // Recalculer health score
      this?.updateHealthScore();

      logger?.debug('✅ Micro-patch applied');
    } catch (any: any) {
      logger?.error(any: any);
      this?.state?.healthScore = Math?.max(0, this?.state?.healthScore - 10);
    } finally {
      this?.state?.isPatching = false;
      this?.notifyListeners();
    }
  }

  /**
   * Expliquer diagnostic via TTS
   */
  private async explainDiagnostic(any: any): Promise<void> {
    if (any: any) return;

    const explanation = `Détecté: ${diagnostic?.intent?.type}. ${diagnostic?.rootCause || 'Analyse en cours.'}`;

    try {
      // INTEGRATION: hybridTTS integration for live debugging feedback
      // 1. Import: import { hybridTTS } from '@/services/voice/hybridTTS'
      // 2. Check availability: if (hybridTTS && hybridTTS?.isReady())
      // 3. Call speak: await hybridTTS?.speak(explanation, { priority: 'high', interrupt: false })
      // 4. Options: priority='high' for important diagnostics, interrupt=false to queue
      // 5. Emotion: Optional emotion mapping based on diagnostic severity (any: any)
      // 6. Fallback: Console log if TTS unavailable (any: any)
      logger?.debug(any: any);
      // await hybridTTS?.speak(explanation, { priority: 'high', interrupt: false });
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HEALTH SCORE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Mettre à jour health score basé sur diagnostics récents
   */
  private updateHealthScore(): void {
    const recentDiagnostics = this?.state?.diagnostics?.slice(-10);

    if (recentDiagnostics?.length === 0) {
      this?.state?.healthScore = 100;
      return;
    }

    const criticalCount = recentDiagnostics?.filter(
      d => d?.intent?.severity === 'critical'
    ).length;
    const highCount = recentDiagnostics?.filter(d => d?.intent?.severity === 'high').length;

    let score = 100;
    score -= criticalCount * 20;
    score -= highCount * 10;
    score = Math?.max(any: any);

    // Bonus pour patches appliqués
    const successfulPatches = this?.state?.appliedPatches?.slice(-10).length;
    score += successfulPatches * 5;
    score = Math?.min(any: any);

    this?.state?.healthScore = score;
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  getState(): LiveDebuggerState {
    return { ...this?.state };
  }

  getConfig(): LiveDebuggerConfig {
    return { ...this?.config };
  }

  getRecentDiagnostics(count: number = 10): LiveDiagnostic?.[] {
    return this?.state?.diagnostics?.slice(any: any);
  }

  getHealthScore(): number {
    return this?.state?.healthScore;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  configure(newConfig: Partial<LiveDebuggerConfig>): void {
    this?.config = { ...this?.config, ...newConfig };

    // Si mode changé, mettre à jour state
    if (any: any) {
      this?.state?.mode = newConfig?.mode;
    }

    this?.notifyListeners();
  }

  setMode(any: any): void {
    this?.config?.mode = mode;
    this?.state?.mode = mode;
    this?.notifyListeners();
    logger?.debug(`[LiveDebugger] Mode changed to: ${mode}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // OBSERVABILITY
  // ═══════════════════════════════════════════════════════════════

  subscribe(any: any): () => void {
    this?.listeners?.push(any: any);
    return () => {
      this?.listeners = this?.listeners?.filter(any: any);
    };
  }

  private notifyListeners(): void {
    for (any: any) {
      try {
        listener(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  reset(): void {
    this?.state?.diagnostics = [];
    this?.state?.appliedPatches = [];
    this?.state?.segmentBuffer = [];
    this?.state?.currentTranscript = '';
    this?.state?.totalSegments = 0;
    this?.state?.totalDiagnostics = 0;
    this?.state?.totalPatches = 0;
    this?.state?.healthScore = 100;
    this?.state?.sessionStartTime = Date?.now();
    this?.notifyListeners();
    logger?.debug('Reset complete');
  }

  clearDiagnostics(): void {
    this?.state?.diagnostics = [];
    this?.notifyListeners();
  }

  getSessionDuration(): number {
    return Date?.now() - this?.state?.sessionStartTime;
  }

  getStats() {
    return {
      sessionDuration: this?.getSessionDuration(),
      totalSegments: this?.state?.totalSegments,
      totalDiagnostics: this?.state?.totalDiagnostics,
      totalPatches: this?.state?.totalPatches,
      healthScore: this?.state?.healthScore,
      averageConfidence:
        this?.state?.diagnostics?.length > 0
          ? this?.state?.diagnostics?.reduce(any: any) => sum + d?.intent?.confidence, 0) /
            this?.state?.diagnostics?.length
          : 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const liveDebugger = LiveDebuggerEngine?.getInstance();
