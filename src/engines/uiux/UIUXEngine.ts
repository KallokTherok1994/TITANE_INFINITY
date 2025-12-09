/**
 * TITANE∞ v20Ω — UI/UX Adaptive Engine
 * Moteur principal d'adaptation UI/UX
 */

import type {
  UIContext,
  CognitiveLoad,
  UserMode,
  UserProfile,
  AdaptationState,
  PolicyDecision,
  PolicyContext,
  DetectionSignal,
  UIUXEvent,
  UIUXEventHandler,
  AdaptationHistoryEntry,
} from './types';

import { ContextDetector } from './detectors/ContextDetector';
import { OverloadDetector } from './detectors/OverloadDetector';
import { BehaviorDetector } from './detectors/BehaviorDetector';
import { PerformanceDetector } from './detectors/PerformanceDetector';
import { ModeDetector } from './detectors/ModeDetector';

import { LayoutAdapter } from './adapters/LayoutAdapter';
import { DensityAdapter } from './adapters/DensityAdapter';
import { VisibilityAdapter } from './adapters/VisibilityAdapter';
import { MotionAdapter } from './adapters/MotionAdapter';
import { ThemeAdapter } from './adapters/ThemeAdapter';

import { CognitivePolicy } from './policies/CognitivePolicy';
import { SafetyPolicy } from './policies/SafetyPolicy';
import { PerformancePolicy } from './policies/PerformancePolicy';

/**
 * Configuration du moteur
 */
interface UIUXEngineConfig {
  autoAdapt: boolean;
  adaptInterval: number; // ms
  enableHistory: boolean;
  maxHistoryEntries: number;
}

const DEFAULT_CONFIG: UIUXEngineConfig = {
  autoAdapt: true,
  adaptInterval: 5000, // 5 secondes
  enableHistory: true,
  maxHistoryEntries: 100,
};

/**
 * État par défaut
 */
const DEFAULT_ADAPTATION_STATE: AdaptationState = {
  layout: {
    gridColumns: 2,
    spacing: 'normal',
    sidebarVisible: true,
    sidebarWidth: 280,
    headerHeight: 64,
    footerVisible: true,
    panelLayout: 'side-by-side',
  },
  density: {
    fontSize: 'medium',
    lineHeight: 1.6,
    padding: 'normal',
    iconSize: 20,
    buttonSize: 'md',
    cardDensity: 'standard',
  },
  visibility: {
    showAdvancedOptions: false,
    showMetrics: true,
    showDebugInfo: false,
    tooltipsEnabled: true,
    labelsVisible: true,
    helpersVisible: false,
    progressIndicatorsVisible: true,
  },
  motion: {
    animationsEnabled: true,
    transitionDuration: 200,
    parallaxEnabled: false,
    loadingAnimations: 'skeleton',
    hoverEffects: true,
    scrollBehavior: 'smooth',
  },
  theme: {
    colorScheme: 'auto',
    accentColor: '#6366f1',
    surfaceOpacity: 0.95,
    borderRadius: 'soft',
    shadowIntensity: 'subtle',
    contrastMode: 'normal',
  },
  timestamp: Date.now(),
  confidence: 1.0,
  source: 'auto',
};

/**
 * Profil utilisateur par défaut
 */
const DEFAULT_USER_PROFILE: UserProfile = {
  mode: 'standard',
  expertise: 0.5,
  preferences: {},
  history: [],
  lastSeen: Date.now(),
};

/**
 * Moteur UI/UX Adaptatif
 */
export class UIUXEngine {
  // Configuration
  private config: UIUXEngineConfig;

  // Detectors
  private contextDetector: ContextDetector;
  private overloadDetector: OverloadDetector;
  private behaviorDetector: BehaviorDetector;
  private performanceDetector: PerformanceDetector;
  private modeDetector: ModeDetector;

  // Adapters
  private layoutAdapter: LayoutAdapter;
  private densityAdapter: DensityAdapter;
  private visibilityAdapter: VisibilityAdapter;
  private motionAdapter: MotionAdapter;
  private themeAdapter: ThemeAdapter;

  // Policies
  private cognitivePolicy: CognitivePolicy;
  private safetyPolicy: SafetyPolicy;
  private performancePolicy: PerformancePolicy;

  // State
  private currentState: AdaptationState;
  private userProfile: UserProfile;
  private adaptationHistory: AdaptationHistoryEntry[] = [];
  private eventListeners: Set<UIUXEventHandler> = new Set();
  private adaptIntervalId: ReturnType<typeof setInterval> | null = null;
  private initialized = false;

  constructor(config: Partial<UIUXEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize detectors
    this.contextDetector = new ContextDetector();
    this.overloadDetector = new OverloadDetector();
    this.behaviorDetector = new BehaviorDetector();
    this.performanceDetector = new PerformanceDetector();
    this.modeDetector = new ModeDetector();

    // Initialize adapters
    this.layoutAdapter = new LayoutAdapter();
    this.densityAdapter = new DensityAdapter();
    this.visibilityAdapter = new VisibilityAdapter();
    this.motionAdapter = new MotionAdapter();
    this.themeAdapter = new ThemeAdapter();

    // Initialize policies
    this.cognitivePolicy = new CognitivePolicy();
    this.safetyPolicy = new SafetyPolicy();
    this.performancePolicy = new PerformancePolicy();

    // Initialize state
    this.currentState = { ...DEFAULT_ADAPTATION_STATE };
    this.userProfile = { ...DEFAULT_USER_PROFILE };
  }

  /**
   * Initialise le moteur
   */
  init(): void {
    if (this.initialized) return;

    // Initialize detectors
    this.contextDetector.init();
    this.overloadDetector.init();
    this.behaviorDetector.init();
    this.performanceDetector.init();

    // Listen for context changes
    this.contextDetector.onChange(() => {
      this.adapt();
    });

    // Auto-adapt at interval
    if (this.config.autoAdapt) {
      this.adaptIntervalId = setInterval(() => {
        this.adapt();
      }, this.config.adaptInterval);
    }

    // Initial adaptation
    this.adapt();

    this.initialized = true;
    this.emit({ type: 'adaptation:started', timestamp: Date.now(), data: null });
  }

  /**
   * Arrête le moteur
   */
  destroy(): void {
    if (this.adaptIntervalId) {
      clearInterval(this.adaptIntervalId);
    }

    this.contextDetector.destroy();
    this.performanceDetector.destroy();
    this.eventListeners.clear();
    this.initialized = false;
  }

  /**
   * Exécute une adaptation complète
   */
  adapt(): AdaptationState {
    // Collect signals
    const signals = this.collectSignals();

    // Get current context
    const context = this.contextDetector.detect();
    const behavior = this.behaviorDetector.analyze();
    const cognitiveLoad = this.overloadDetector.evaluateCognitiveLoad();

    // Detect user mode
    const mode = this.modeDetector.detect(behavior, context);
    this.userProfile.mode = mode;
    this.userProfile.expertise = this.modeDetector.calculateExpertise();

    // Build policy context
    const policyContext: PolicyContext = {
      uiContext: context,
      userBehavior: behavior,
      cognitiveLoad,
      userProfile: this.userProfile,
      currentState: this.currentState,
      signals,
    };

    // Evaluate policies
    const decisions = this.evaluatePolicies(policyContext);

    // Apply adaptations
    const previousState = { ...this.currentState };
    this.applyDecisions(decisions, context, mode, cognitiveLoad);

    // Record history
    if (this.config.enableHistory) {
      this.recordHistory(previousState, this.currentState, 'auto_adapt');
    }

    // Apply to document
    this.applyToDocument();

    this.emit({
      type: 'adaptation:completed',
      timestamp: Date.now(),
      data: { state: this.currentState, decisions },
    });

    return this.currentState;
  }

  /**
   * Collecte tous les signaux de détection
   */
  private collectSignals(): DetectionSignal[] {
    return [
      this.contextDetector.toSignal(),
      this.overloadDetector.toSignal(),
      this.behaviorDetector.toSignal(),
      this.performanceDetector.toSignal(),
      this.modeDetector.toSignal(
        this.behaviorDetector.analyze(),
        this.contextDetector.detect()
      ),
    ];
  }

  /**
   * Évalue toutes les politiques
   */
  private evaluatePolicies(context: PolicyContext): PolicyDecision[] {
    const allDecisions: PolicyDecision[] = [];

    // Safety policy first (highest priority)
    allDecisions.push(...this.safetyPolicy.evaluate(context));

    // Performance policy
    allDecisions.push(...this.performancePolicy.evaluate(context));

    // Cognitive policy
    allDecisions.push(...this.cognitivePolicy.evaluate(context));

    // Sort by priority (highest first)
    return allDecisions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Applique les décisions
   */
  private applyDecisions(
    decisions: PolicyDecision[],
    context: UIContext,
    mode: UserMode,
    cognitiveLoad: CognitiveLoad
  ): void {
    // Start with adapter defaults for current mode
    const layout = this.layoutAdapter.adapt(context, mode, cognitiveLoad);
    const density = this.densityAdapter.adapt(context, mode, cognitiveLoad);
    const visibility = this.visibilityAdapter.adapt(context, mode, cognitiveLoad);
    const motion = this.motionAdapter.adapt(context, mode, this.performanceDetector.toSignal());
    const theme = this.themeAdapter.adapt(context, mode);

    // Apply policy decisions (higher priority overrides)
    for (const decision of decisions) {
      if (decision.adaptation.layout) {
        Object.assign(layout, decision.adaptation.layout);
      }
      if (decision.adaptation.density) {
        Object.assign(density, decision.adaptation.density);
      }
      if (decision.adaptation.visibility) {
        Object.assign(visibility, decision.adaptation.visibility);
      }
      if (decision.adaptation.motion) {
        Object.assign(motion, decision.adaptation.motion);
      }
      if (decision.adaptation.theme) {
        Object.assign(theme, decision.adaptation.theme);
      }

      this.emit({
        type: 'policy:applied',
        timestamp: Date.now(),
        data: decision,
      });
    }

    // Update current state
    this.currentState = {
      layout,
      density,
      visibility,
      motion,
      theme,
      timestamp: Date.now(),
      confidence: this.calculateConfidence(decisions),
      source: 'auto',
    };
  }

  /**
   * Calcule la confiance de l'adaptation
   */
  private calculateConfidence(decisions: PolicyDecision[]): number {
    if (decisions.length === 0) return 1.0;

    // Non-overridable decisions = high confidence
    const nonOverridable = decisions.filter(d => !d.overridable).length;
    const total = decisions.length;

    return 0.7 + (nonOverridable / total) * 0.3;
  }

  /**
   * Enregistre dans l'historique
   */
  private recordHistory(
    before: AdaptationState,
    after: AdaptationState,
    trigger: string
  ): void {
    this.adaptationHistory.push({
      timestamp: Date.now(),
      trigger,
      before,
      after,
      userAccepted: true, // Par défaut accepté
    });

    // Limit history size
    if (this.adaptationHistory.length > this.config.maxHistoryEntries) {
      this.adaptationHistory.shift();
    }
  }

  /**
   * Applique l'état au document
   */
  private applyToDocument(): void {
    this.layoutAdapter.applyToDocument();
    this.densityAdapter.applyToDocument();
    this.visibilityAdapter.applyToDocument();
    this.motionAdapter.applyToDocument();
    this.themeAdapter.applyToDocument();
  }

  /**
   * Émet un événement
   */
  private emit(event: UIUXEvent): void {
    for (const handler of this.eventListeners) {
      try {
        handler(event);
      } catch (error) {
        console.error('[UIUXEngine] Event handler error:', error);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Change le mode utilisateur
   */
  setUserMode(mode: UserMode): void {
    this.modeDetector.setMode(mode);
    this.userProfile.mode = mode;
    this.adapt();
    this.emit({ type: 'mode:changed', timestamp: Date.now(), data: mode });
  }

  /**
   * Retourne le mode actuel
   */
  getUserMode(): UserMode {
    return this.userProfile.mode;
  }

  /**
   * Override manuel d'une partie de l'état
   */
  override(adaptation: Partial<AdaptationState>): void {
    const previousState = { ...this.currentState };

    if (adaptation.layout) {
      this.layoutAdapter.setLayout(adaptation.layout);
    }
    if (adaptation.density) {
      this.densityAdapter.setDensity(adaptation.density);
    }
    if (adaptation.visibility) {
      Object.entries(adaptation.visibility).forEach(([key, value]) => {
        this.visibilityAdapter.setUserOverride(
          key as keyof typeof adaptation.visibility,
          value as boolean
        );
      });
    }
    if (adaptation.theme) {
      if (adaptation.theme.colorScheme) {
        this.themeAdapter.setColorScheme(adaptation.theme.colorScheme);
      }
      if (adaptation.theme.accentColor) {
        this.themeAdapter.setAccentColor(adaptation.theme.accentColor);
      }
    }

    this.currentState = {
      ...this.currentState,
      ...adaptation,
      source: 'user',
      timestamp: Date.now(),
    };

    this.applyToDocument();
    this.recordHistory(previousState, this.currentState, 'user_override');
    this.emit({ type: 'user:override', timestamp: Date.now(), data: adaptation });
  }

  /**
   * Retourne l'état actuel
   */
  getState(): AdaptationState {
    return { ...this.currentState };
  }

  /**
   * Retourne le profil utilisateur
   */
  getUserProfile(): UserProfile {
    return { ...this.userProfile };
  }

  /**
   * Retourne l'historique d'adaptation
   */
  getHistory(): AdaptationHistoryEntry[] {
    return [...this.adaptationHistory];
  }

  /**
   * Écoute les événements
   */
  on(handler: UIUXEventHandler): () => void {
    this.eventListeners.add(handler);
    return () => this.eventListeners.delete(handler);
  }

  /**
   * Enregistre une action utilisateur
   */
  recordAction(action: string): void {
    this.modeDetector.recordAction(action);
  }

  /**
   * Enregistre une navigation
   */
  recordNavigation(path: string, durationMs: number): void {
    this.overloadDetector.recordNavigation(path);
    this.modeDetector.recordNavigation(durationMs);
  }

  /**
   * Réinitialise tout
   */
  reset(): void {
    this.layoutAdapter.reset();
    this.densityAdapter.reset();
    this.visibilityAdapter.reset();
    this.motionAdapter.reset();
    this.themeAdapter.reset();
    this.overloadDetector.reset();
    this.behaviorDetector.reset();
    this.modeDetector.reset();
    this.performanceDetector.reset();

    this.currentState = { ...DEFAULT_ADAPTATION_STATE };
    this.userProfile = { ...DEFAULT_USER_PROFILE };
    this.adaptationHistory = [];
  }

  /**
   * Génère un rapport de diagnostic
   */
  getDiagnostics(): {
    state: AdaptationState;
    profile: UserProfile;
    performance: ReturnType<PerformanceDetector['collect']>;
    cognitiveLoad: CognitiveLoad;
    signals: DetectionSignal[];
  } {
    return {
      state: this.getState(),
      profile: this.getUserProfile(),
      performance: this.performanceDetector.collect(),
      cognitiveLoad: this.overloadDetector.evaluateCognitiveLoad(),
      signals: this.collectSignals(),
    };
  }
}

export default UIUXEngine;
