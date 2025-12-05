/**
 * TITANE∞ v∞ ULTRA — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * COGNITIVE LAYOUT & ADAPTIVE EXPERIENCE ENGINE v∞
 *
 * Le cerveau adaptatif de l'interface TITANE∞ qui module dynamiquement
 * l'expérience utilisateur selon le contexte cognitif, le rôle et la charge mentale.
 *
 * Architecture :
 * - Observer → Interpréter → Décider → Agir → Apprendre
 * - 5 modes d'interface adaptatifs
 * - Intégration Helios, Nexus, Memory
 * - Garde-fous et contrôle humain
 */

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

/**
 * Rôles / postures de l'utilisateur (Kevin)
 */
export type UserRole =
  | 'author' // Écriture, structure de livre, modèles
  | 'strategist' // Vision, architecture système, décisions
  | 'developer' // TITANE, IA, pipelines techniques
  | 'coach' // Accompagnement, préparation séances
  | 'explorer'; // Découverte, navigation, curiosité

/**
 * Modes d'interface adaptatifs
 */
export type UIMode =
  | 'focus_deep' // Concentration profonde, minimal distractions
  | 'exploration' // Navigation, découverte, suggestions
  | 'monitoring' // Surveillance, cockpit, métriques
  | 'maintenance' // Debug, config, technique
  | 'coaching' // Accompagnement, protocoles, narratif
  | 'neutral'; // Mode par défaut, équilibré

/**
 * Type de tâche en cours
 */
export type TaskType =
  | 'writing' // Écriture longue
  | 'reflection' // Réflexion stratégique
  | 'execution' // Tâches techniques
  | 'debugging' // Correction erreurs
  | 'conception' // Design, architecture
  | 'navigation' // Exploration
  | 'monitoring'; // Surveillance

/**
 * Contexte de session utilisateur
 */
export interface SessionContext {
  currentModule: string; // Module actif (Chat OMEGA, Dashboard, etc.)
  currentProject?: string; // Projet (Humain Total, TITANE, client)
  taskType: TaskType;
  role: UserRole;
  duration: number; // Durée session en minutes
  lastActivity: number; // Timestamp dernière activité
  contextSwitches: number; // Nombre de changements de contexte récents
}

/**
 * Signaux cognitifs (depuis Helios, Nexus)
 */
export interface CognitiveSignals {
  sessionDuration: number; // Minutes écoulées
  energyLevel: number; // 0-1 (Helios)
  focusScore: number; // 0-1 (stabilité attention)
  cognitiveLoad: number; // 0-1 (charge mentale estimée)
  contextSwitchRate: number; // Switches/minute
  blockageDetected: boolean; // Actions répétées (errance)
  fatigueEstimated: boolean; // Durée > seuil sans pause
}

/**
 * Préférences utilisateur mémorisées
 */
export interface UserPreferences {
  favoriteModes: Record<UIMode, number>; // Score d'utilisation
  moduleUsage: Record<string, number>; // Fréquence modules
  timePreferences: {
    highEnergy: number[]; // Heures de haute énergie [9, 10, 11, ...]
    lowEnergy: number[]; // Heures de basse énergie
  };
  manualOverrides: number; // Nombre de refus d'adaptation auto
  acceptedSuggestions: number; // Nombre d'acceptations
  dislikedAdaptations?: string[]; // Adaptations refusées
}

/**
 * Configuration de densité d'information
 */
export interface DensityConfig {
  level: 'minimal' | 'low' | 'medium' | 'high' | 'maximal';
  whitespace: number; // 0-1 (quantité d'espace blanc)
  fontSize: number; // Multiplicateur taille police (0.9-1.2)
  contrast: number; // 0-1 (intensité contrastes)
  accentColors: number; // 0-1 (présence couleurs vives)
  animations: boolean; // Activer animations
  notifications: 'minimal' | 'normal' | 'verbose';
}

/**
 * Configuration de layout par mode
 */
export interface LayoutConfig {
  mode: UIMode;
  density: DensityConfig;
  sidebar: {
    visible: boolean;
    compact: boolean;
    autoHide: boolean;
  };
  panels: {
    secondary: boolean; // Panneaux secondaires visibles
    alerts: boolean; // Panneau d'alertes
    stats: boolean; // Panneau de stats
  };
  priorityActions: string[]; // Actions mises en avant
  hiddenElements: string[]; // Éléments masqués
}

/**
 * Décision d'adaptation
 */
export interface AdaptationDecision {
  suggestedMode: UIMode;
  confidence: number; // 0-1 (confiance dans la suggestion)
  reasoning: string; // Explication
  autoApply: boolean; // Appliquer automatiquement ou demander
  changes: LayoutConfig; // Configuration cible
}

/**
 * État complet du moteur
 */
export interface CognitiveLayoutState {
  currentMode: UIMode;
  previousMode: UIMode;
  context: SessionContext;
  signals: CognitiveSignals;
  preferences: UserPreferences;
  layoutConfig: LayoutConfig;
  adaptationEnabled: boolean;
  lastAdaptation: number; // Timestamp
  modeHistory: Array<{ mode: UIMode; timestamp: number; duration: number }>;
}

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION PAR MODE
// ═══════════════════════════════════════════════════════════════════

const MODE_CONFIGS: Record<UIMode, Partial<LayoutConfig>> = {
  focus_deep: {
    mode: 'focus_deep',
    density: {
      level: 'minimal',
      whitespace: 0.8,
      fontSize: 1.1,
      contrast: 0.7,
      accentColors: 0.3,
      animations: false,
      notifications: 'minimal',
    },
    sidebar: {
      visible: true,
      compact: true,
      autoHide: true,
    },
    panels: {
      secondary: false,
      alerts: false,
      stats: false,
    },
    priorityActions: ['save', 'undo', 'redo'],
    hiddenElements: ['notifications', 'suggestions', 'stats-widget'],
  },

  exploration: {
    mode: 'exploration',
    density: {
      level: 'medium',
      whitespace: 0.5,
      fontSize: 1.0,
      contrast: 0.8,
      accentColors: 0.7,
      animations: true,
      notifications: 'normal',
    },
    sidebar: {
      visible: true,
      compact: false,
      autoHide: false,
    },
    panels: {
      secondary: true,
      alerts: false,
      stats: true,
    },
    priorityActions: ['navigate', 'search', 'discover', 'bookmarks'],
    hiddenElements: [],
  },

  monitoring: {
    mode: 'monitoring',
    density: {
      level: 'high',
      whitespace: 0.3,
      fontSize: 0.95,
      contrast: 0.9,
      accentColors: 0.9,
      animations: true,
      notifications: 'verbose',
    },
    sidebar: {
      visible: true,
      compact: false,
      autoHide: false,
    },
    panels: {
      secondary: true,
      alerts: true,
      stats: true,
    },
    priorityActions: ['refresh', 'logs', 'metrics', 'alerts'],
    hiddenElements: [],
  },

  maintenance: {
    mode: 'maintenance',
    density: {
      level: 'high',
      whitespace: 0.3,
      fontSize: 0.95,
      contrast: 1.0,
      accentColors: 0.8,
      animations: false,
      notifications: 'verbose',
    },
    sidebar: {
      visible: true,
      compact: false,
      autoHide: false,
    },
    panels: {
      secondary: true,
      alerts: true,
      stats: true,
    },
    priorityActions: ['debug', 'config', 'logs', 'terminal', 'restart'],
    hiddenElements: ['suggestions', 'tips'],
  },

  coaching: {
    mode: 'coaching',
    density: {
      level: 'low',
      whitespace: 0.7,
      fontSize: 1.05,
      contrast: 0.75,
      accentColors: 0.5,
      animations: true,
      notifications: 'minimal',
    },
    sidebar: {
      visible: true,
      compact: true,
      autoHide: false,
    },
    panels: {
      secondary: false,
      alerts: false,
      stats: false,
    },
    priorityActions: ['protocols', 'plans', 'notes', 'client-view'],
    hiddenElements: ['technical-info', 'dev-tools', 'metrics'],
  },

  neutral: {
    mode: 'neutral',
    density: {
      level: 'medium',
      whitespace: 0.5,
      fontSize: 1.0,
      contrast: 0.8,
      accentColors: 0.6,
      animations: true,
      notifications: 'normal',
    },
    sidebar: {
      visible: true,
      compact: false,
      autoHide: false,
    },
    panels: {
      secondary: true,
      alerts: true,
      stats: true,
    },
    priorityActions: [],
    hiddenElements: [],
  },
};

// ═══════════════════════════════════════════════════════════════════
// COGNITIVE LAYOUT ENGINE
// ═══════════════════════════════════════════════════════════════════

/**
 * Moteur d'adaptation cognitive de l'interface
 */
class CognitiveLayoutEngine {
  private state: CognitiveLayoutState;
  private subscribers: Set<(state: CognitiveLayoutState) => void> = new Set();
  private observationInterval?: NodeJS.Timeout;
  private adaptationThreshold = 0.7; // Confiance min pour auto-apply

  constructor() {
    this.state = this.getInitialState();
    console.log('[CognitiveLayout] 🧠 Engine initialized');
  }

  // ═══════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════

  private getInitialState(): CognitiveLayoutState {
    return {
      currentMode: 'neutral',
      previousMode: 'neutral',
      context: {
        currentModule: 'dashboard',
        taskType: 'navigation',
        role: 'explorer',
        duration: 0,
        lastActivity: Date.now(),
        contextSwitches: 0,
      },
      signals: {
        sessionDuration: 0,
        energyLevel: 1.0,
        focusScore: 1.0,
        cognitiveLoad: 0.3,
        contextSwitchRate: 0,
        blockageDetected: false,
        fatigueEstimated: false,
      },
      preferences: {
        favoriteModes: {
          focus_deep: 0,
          exploration: 0,
          monitoring: 0,
          maintenance: 0,
          coaching: 0,
          neutral: 0,
        },
        moduleUsage: {},
        timePreferences: {
          highEnergy: [9, 10, 11, 14, 15, 16],
          lowEnergy: [13, 18, 19, 20],
        },
        manualOverrides: 0,
        acceptedSuggestions: 0,
      },
      layoutConfig: MODE_CONFIGS.neutral as LayoutConfig,
      adaptationEnabled: true,
      lastAdaptation: Date.now(),
      modeHistory: [],
    };
  }

  public async initialize(): Promise<void> {
    console.log('[CognitiveLayout] Initializing engine...');

    // Charger préférences depuis Memory
    await this.loadPreferences();

    // Démarrer observation
    this.startObservation();

    // Effectuer analyse initiale
    await this.analyzeAndAdapt();

    console.log('[CognitiveLayout] ✅ Engine ready');
  }

  public shutdown(): void {
    if (this.observationInterval) {
      clearInterval(this.observationInterval);
    }
    this.savePreferences();
    console.log('[CognitiveLayout] Engine shutdown');
  }

  // ═══════════════════════════════════════════════════════════════════
  // OBSERVATION LOOP
  // ═══════════════════════════════════════════════════════════════════

  private startObservation(): void {
    // Boucle d'observation toutes les 30 secondes
    this.observationInterval = setInterval(() => {
      this.observe();
    }, 30000);

    console.log('[CognitiveLayout] 👁️ Observation loop started (30s)');
  }

  private observe(): void {
    // Mettre à jour signaux cognitifs
    this.updateCognitiveSignals();

    // Vérifier si adaptation nécessaire
    this.checkAdaptationNeeded();
  }

  private updateCognitiveSignals(): void {
    const now = Date.now();
    const sessionDuration = (now - (this.state.lastAdaptation - this.state.context.duration * 60000)) / 60000;

    // Mise à jour des signaux
    this.state.signals.sessionDuration = sessionDuration;

    // Détection fatigue (> 90 min sans pause)
    this.state.signals.fatigueEstimated = sessionDuration > 90;

    // Charge cognitive basée sur switches récents
    const switchRate = this.state.context.contextSwitches / Math.max(sessionDuration, 1);
    this.state.signals.contextSwitchRate = switchRate;
    this.state.signals.cognitiveLoad = Math.min(switchRate / 5, 1.0);

    // Score de focus (inversement proportionnel aux switches)
    this.state.signals.focusScore = Math.max(1.0 - this.state.signals.cognitiveLoad, 0);

    // Énergie basée sur heure de la journée
    const hour = new Date().getHours();
    const isHighEnergyTime = this.state.preferences.timePreferences.highEnergy.includes(hour);
    const isLowEnergyTime = this.state.preferences.timePreferences.lowEnergy.includes(hour);

    this.state.signals.energyLevel = isHighEnergyTime ? 0.9 : isLowEnergyTime ? 0.5 : 0.7;

    // Ajuster selon fatigue
    if (this.state.signals.fatigueEstimated) {
      this.state.signals.energyLevel *= 0.6;
    }
  }

  private checkAdaptationNeeded(): void {
    if (!this.state.adaptationEnabled) return;

    // Éviter adaptations trop fréquentes (min 2 minutes)
    const timeSinceLastAdaptation = Date.now() - this.state.lastAdaptation;
    if (timeSinceLastAdaptation < 120000) return;

    // Analyser et proposer adaptation
    this.analyzeAndAdapt();
  }

  // ═══════════════════════════════════════════════════════════════════
  // INTERPRETATION & DECISION
  // ═══════════════════════════════════════════════════════════════════

  private async analyzeAndAdapt(): Promise<void> {
    const decision = this.interpretContext();

    console.log('[CognitiveLayout] 🧠 Analysis:', {
      current: this.state.currentMode,
      suggested: decision.suggestedMode,
      confidence: decision.confidence,
      reasoning: decision.reasoning,
    });

    // Si confiance élevée et différent du mode actuel
    if (
      decision.confidence >= this.adaptationThreshold &&
      decision.suggestedMode !== this.state.currentMode
    ) {
      if (decision.autoApply) {
        // Appliquer automatiquement
        await this.applyMode(decision.suggestedMode, 'auto');
        console.log(`[CognitiveLayout] ✅ Auto-applied: ${decision.suggestedMode}`);
      } else {
        // Proposer à l'utilisateur
        this.notifyAdaptationSuggestion(decision);
      }
    }
  }

  private interpretContext(): AdaptationDecision {
    const { context, signals, preferences } = this.state;

    let suggestedMode: UIMode = 'neutral';
    let confidence = 0.5;
    let reasoning = 'Contexte neutre';
    let autoApply = false;

    // Règle 1: Fatigue détectée → Focus Deep
    if (signals.fatigueEstimated && signals.cognitiveLoad > 0.6) {
      suggestedMode = 'focus_deep';
      confidence = 0.85;
      reasoning = 'Fatigue détectée + charge cognitive élevée → réduction distractions';
      autoApply = true;
    }

    // Règle 2: Tâche d'écriture ou réflexion → Focus Deep
    else if (
      (context.taskType === 'writing' || context.taskType === 'reflection') &&
      signals.focusScore > 0.7
    ) {
      suggestedMode = 'focus_deep';
      confidence = 0.9;
      reasoning = 'Tâche de concentration (écriture/réflexion) détectée';
      autoApply = preferences.favoriteModes.focus_deep > 3; // Auto si utilisé souvent
    }

    // Règle 3: Navigation / Exploration
    else if (context.taskType === 'navigation' && signals.energyLevel > 0.7) {
      suggestedMode = 'exploration';
      confidence = 0.75;
      reasoning = 'Mode exploration actif avec bonne énergie';
      autoApply = false;
    }

    // Règle 4: Debug / Maintenance
    else if (context.taskType === 'debugging' || context.taskType === 'execution') {
      suggestedMode = 'maintenance';
      confidence = 0.8;
      reasoning = 'Tâche technique détectée (debug/exécution)';
      autoApply = preferences.favoriteModes.maintenance > 2;
    }

    // Règle 5: Monitoring (module Dashboard, Centre Système)
    else if (
      context.currentModule === 'dashboard' ||
      context.currentModule === 'system-center'
    ) {
      suggestedMode = 'monitoring';
      confidence = 0.7;
      reasoning = 'Module de surveillance actif';
      autoApply = false;
    }

    // Règle 6: Coaching (rôle coach)
    else if (context.role === 'coach') {
      suggestedMode = 'coaching';
      confidence = 0.85;
      reasoning = 'Rôle coach détecté → interface narrative simplifiée';
      autoApply = preferences.favoriteModes.coaching > 2;
    }

    // Règle 7: Blocage détecté → Exploration
    else if (signals.blockageDetected) {
      suggestedMode = 'exploration';
      confidence = 0.7;
      reasoning = 'Blocage détecté (actions répétées) → encourager navigation';
      autoApply = true;
    }

    return {
      suggestedMode,
      confidence,
      reasoning,
      autoApply,
      changes: this.getModeConfig(suggestedMode),
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // MODE APPLICATION
  // ═══════════════════════════════════════════════════════════════════

  public async applyMode(mode: UIMode, source: 'manual' | 'auto' = 'manual'): Promise<void> {
    console.log(`[CognitiveLayout] 🎨 Applying mode: ${mode} (${source})`);

    // Sauvegarder mode précédent
    this.state.previousMode = this.state.currentMode;

    // Enregistrer dans historique
    if (this.state.currentMode !== mode) {
      this.state.modeHistory.push({
        mode: this.state.currentMode,
        timestamp: Date.now(),
        duration: Date.now() - this.state.lastAdaptation,
      });
    }

    // Appliquer nouvelle config
    this.state.currentMode = mode;
    this.state.layoutConfig = this.getModeConfig(mode);
    this.state.lastAdaptation = Date.now();

    // Mettre à jour préférences
    if (source === 'manual') {
      this.state.preferences.favoriteModes[mode]++;
    } else {
      this.state.preferences.acceptedSuggestions++;
    }

    // Notifier subscribers
    this.notifySubscribers();

    // Appliquer changements DOM (via CSS variables)
    this.applyLayoutChanges();

    console.log(`[CognitiveLayout] ✅ Mode ${mode} applied`);
  }

  private getModeConfig(mode: UIMode): LayoutConfig {
    return {
      ...MODE_CONFIGS.neutral,
      ...MODE_CONFIGS[mode],
    } as LayoutConfig;
  }

  private applyLayoutChanges(): void {
    const { density, sidebar } = this.state.layoutConfig;

    // Appliquer via CSS variables
    document.documentElement.style.setProperty('--ui-whitespace', `${density.whitespace}`);
    document.documentElement.style.setProperty('--ui-font-scale', `${density.fontSize}`);
    document.documentElement.style.setProperty('--ui-contrast', `${density.contrast}`);
    document.documentElement.style.setProperty('--ui-accent-opacity', `${density.accentColors}`);

    // Classes CSS pour layout
    document.body.classList.toggle('sidebar-compact', sidebar.compact);
    document.body.classList.toggle('sidebar-autohide', sidebar.autoHide);
    document.body.classList.toggle('animations-enabled', density.animations);

    // Mode data attribute pour sélecteurs CSS
    document.body.dataset.uiMode = this.state.currentMode;
  }

  // ═══════════════════════════════════════════════════════════════════
  // CONTEXT UPDATES
  // ═══════════════════════════════════════════════════════════════════

  public updateContext(updates: Partial<SessionContext>): void {
    this.state.context = { ...this.state.context, ...updates };

    // Détecter changement de module → incrémente context switches
    if (updates.currentModule && updates.currentModule !== this.state.context.currentModule) {
      this.state.context.contextSwitches++;
    }

    this.notifySubscribers();
  }

  public updateRole(role: UserRole): void {
    this.state.context.role = role;
    console.log(`[CognitiveLayout] 👤 Role updated: ${role}`);

    // Suggestion immédiate selon rôle
    this.analyzeAndAdapt();
  }

  public updateTaskType(taskType: TaskType): void {
    this.state.context.taskType = taskType;
    console.log(`[CognitiveLayout] 📋 Task type updated: ${taskType}`);
    this.analyzeAndAdapt();
  }

  // ═══════════════════════════════════════════════════════════════════
  // USER CONTROL
  // ═══════════════════════════════════════════════════════════════════

  public setAdaptationEnabled(enabled: boolean): void {
    this.state.adaptationEnabled = enabled;
    console.log(`[CognitiveLayout] Adaptation ${enabled ? 'enabled' : 'disabled'}`);
  }

  public revertToPreviousMode(): void {
    if (this.state.previousMode !== this.state.currentMode) {
      this.applyMode(this.state.previousMode, 'manual');
      console.log(`[CognitiveLayout] ⏮️ Reverted to: ${this.state.previousMode}`);
    }
  }

  public resetToNeutral(): void {
    this.applyMode('neutral', 'manual');
    console.log('[CognitiveLayout] ⚖️ Reset to neutral mode');
  }

  public refuseSuggestion(): void {
    this.state.preferences.manualOverrides++;
    console.log('[CognitiveLayout] ❌ Suggestion refused');
  }

  // ═══════════════════════════════════════════════════════════════════
  // PREFERENCES & LEARNING
  // ═══════════════════════════════════════════════════════════════════

  private async loadPreferences(): Promise<void> {
    try {
      const stored = localStorage.getItem('titane_cognitive_preferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        this.state.preferences = { ...this.state.preferences, ...prefs };
        console.log('[CognitiveLayout] 📖 Preferences loaded');
      }
    } catch (error) {
      console.warn('[CognitiveLayout] Failed to load preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(
        'titane_cognitive_preferences',
        JSON.stringify(this.state.preferences)
      );
      console.log('[CognitiveLayout] 💾 Preferences saved');
    } catch (error) {
      console.warn('[CognitiveLayout] Failed to save preferences:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // STATE & SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════════

  public getState(): CognitiveLayoutState {
    return { ...this.state };
  }

  public getCurrentMode(): UIMode {
    return this.state.currentMode;
  }

  public getLayoutConfig(): LayoutConfig {
    return { ...this.state.layoutConfig };
  }

  public subscribe(callback: (state: CognitiveLayoutState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.state); // Appel immédiat
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.state));
  }

  private notifyAdaptationSuggestion(decision: AdaptationDecision): void {
    // Émettre événement custom pour UI
    window.dispatchEvent(
      new CustomEvent('cognitive-layout-suggestion', {
        detail: decision,
      })
    );

    console.log('[CognitiveLayout] 💡 Suggestion emitted:', decision.suggestedMode);
  }

  // ═══════════════════════════════════════════════════════════════════
  // ANALYTICS & DEBUG
  // ═══════════════════════════════════════════════════════════════════

  public getAnalytics() {
    const totalSessions = Object.values(this.state.preferences.favoriteModes).reduce(
      (a, b) => a + b,
      0
    );
    const acceptanceRate =
      this.state.preferences.acceptedSuggestions /
      Math.max(
        this.state.preferences.acceptedSuggestions + this.state.preferences.manualOverrides,
        1
      );

    return {
      totalModeChanges: totalSessions,
      acceptanceRate: (acceptanceRate * 100).toFixed(1) + '%',
      favoriteModes: this.state.preferences.favoriteModes,
      modeHistory: this.state.modeHistory.slice(-10), // 10 derniers
      currentSignals: this.state.signals,
    };
  }

  public debugInfo(): void {
    console.group('🧠 [CognitiveLayout] Debug Info');
    console.log('Current Mode:', this.state.currentMode);
    console.log('Context:', this.state.context);
    console.log('Signals:', this.state.signals);
    console.log('Preferences:', this.state.preferences);
    console.log('Analytics:', this.getAnalytics());
    console.groupEnd();
  }

  // ═══════════════════════════════════════════════════════════════════
  // LIFECYCLE METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Démarrer le moteur cognitif
   */
  public start(): void {
    if (this.observationInterval) {
      console.warn('[CognitiveLayout] Already running');
      return;
    }
    this.initialize();
    console.log('[CognitiveLayout] ✅ Engine started');
  }

  /**
   * Arrêter le moteur cognitif
   */
  public stop(): void {
    if (this.observationInterval) {
      clearInterval(this.observationInterval);
      this.observationInterval = undefined;
    }
    this.savePreferences();
    console.log('[CognitiveLayout] 🛑 Engine stopped');
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const cognitiveLayoutEngine = new CognitiveLayoutEngine();

// Auto-initialize si environnement navigateur
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    cognitiveLayoutEngine.initialize();
  });
}
