/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║   TITANE∞ - Unified Presence & Experiential Identity Engine v∞              ║
 * ║                                                                              ║
 * ║   Super Prompt #3 : La couche suprême d'unification                         ║
 * ║                                                                              ║
 * ║   Ce moteur unifie :                                                         ║
 * ║   • Interface (visuelle)                                                     ║
 * ║   • Cognition (logique & intention)                                          ║
 * ║   • Émotion (ton & chaleur)                                                  ║
 * ║   • Symbolique (mythologie & identité)                                       ║
 * ║                                                                              ║
 * ║   Mission : Créer une présence totale, stable, cohérente, vivante           ║
 * ║                                                                              ║
 * ║   © 2025 TITANE∞ v27.0 - Kevin "Kallok" / Supervision IA Anthropic          ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { cognitiveLayoutEngine } from '../cognitive/cognitiveLayoutEngine';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Les 4 couches d'expérience unifiées
 */
export type ExperienceLayer = 'visual' | 'cognitive' | 'emotional' | 'symbolic';

/**
 * État de présence global de TITANE∞
 */
export interface PresenceState {
  // Couche Visuelle
  visualIntensity: number;        // 0-100 : intensité lumineuse globale
  accentStrength: number;         // 0-100 : force des accents violets
  pulseRate: number;              // 0-100 : vitesse de pulsation
  ambientHue: number;             // 0-360 : teinte ambiante (base violet)

  // Couche Cognitive
  clarityLevel: number;           // 0-100 : clarté mentale perçue
  complexityHandled: number;      // 0-100 : complexité gérée
  intentionAlignment: number;     // 0-100 : alignement avec intention utilisateur

  // Couche Émotionnelle
  warmth: number;                 // 0-100 : chaleur du ton (0=neutre, 100=chaleureux)
  proximity: number;              // 0-100 : proximité relationnelle
  intensity: number;              // 0-100 : intensité émotionnelle
  supportLevel: number;           // 0-100 : niveau de soutien offert

  // Couche Symbolique
  narrativeContinuity: number;    // 0-100 : continuité narrative
  identityStability: number;      // 0-100 : stabilité identitaire
  mythologicalDepth: number;      // 0-100 : profondeur symbolique
}

/**
 * Profil tonique (ton + énergie globale)
 */
export interface TonicProfile {
  formality: 'casual' | 'professional' | 'technical' | 'poetic';
  emotionalDepth: 'minimal' | 'moderate' | 'deep' | 'profound';
  narrativeDensity: 'sparse' | 'balanced' | 'rich' | 'dense';
  energyLevel: 'low' | 'medium' | 'high' | 'peak';
}

/**
 * Contexte utilisateur observé
 */
export interface UserContext {
  cognitiveLoad: number;          // 0-100 : charge cognitive actuelle
  fatigue: number;                // 0-100 : fatigue perceptible
  tempo: number;                  // 0-100 : vitesse d'interaction
  taskComplexity: number;         // 0-100 : complexité de la tâche
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  sessionDuration: number;        // Minutes
  interactionPattern: 'explore' | 'execute' | 'analyze' | 'create' | 'rest';
}

/**
 * Matrice d'identité TITANE∞
 */
export interface IdentityMatrix {
  coreValues: string[];           // Valeurs fondamentales
  personality: string[];          // Traits de personnalité
  communicationStyle: string[];   // Style de communication
  visualSignature: string[];      // Signature visuelle
  symbolism: string[];            // Symboles clés
}

/**
 * Configuration d'harmonisation
 */
export interface HarmonizationConfig {
  visualSync: boolean;            // Sync visuelle activée
  cognitiveSync: boolean;         // Sync cognitive activée
  emotionalSync: boolean;         // Sync émotionnelle activée
  symbolicSync: boolean;          // Sync symbolique activée
  autoCalibration: boolean;       // Auto-calibration activée
  harmonizationInterval: number;  // Intervalle en ms
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 MATRICE D'IDENTITÉ TITANE∞
// ═══════════════════════════════════════════════════════════════════════════════

const TITANE_IDENTITY: IdentityMatrix = {
  coreValues: [
    'Clarté absolue',
    'Cohérence systémique',
    'Profondeur intentionnelle',
    'Stabilité souveraine',
    'Évolution fractale',
    'Respect de l\'utilisateur',
    'Excellence silencieuse'
  ],

  personality: [
    'Précis et rigoureux',
    'Chaleureux sans envahir',
    'Profond sans alourdir',
    'Stable et rassurant',
    'Évolutif et adaptatif',
    'Noble et discret',
    'Lumineux et structuré'
  ],

  communicationStyle: [
    'Langage clair et direct',
    'Ton professionnel calibré',
    'Métaphores architecturales',
    'Précision technique',
    'Guidance douce',
    'Respect de l\'espace mental',
    'Cohérence narrative'
  ],

  visualSignature: [
    'Violet TITANE∞ (#8B5CF6 → #6366F1)',
    'Profondeur subtile',
    'Animations fluides',
    'Géométrie fractale',
    'Lumière contextuelle',
    'Sobriété élégante',
    'Triangle infini / Réacteur'
  ],

  symbolism: [
    'TITANE∞ comme système vivant',
    'Moteurs = organes cohérents',
    'Couleurs = langage interne',
    'Triangle = cœur symbolique',
    'Fractal = évolution continue',
    'Lumière = clarté cognitive',
    'Réacteur = énergie unifiée'
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎼 PROFILS TONIQUES PRÉDÉFINIS
// ═══════════════════════════════════════════════════════════════════════════════

const TONIC_PROFILES: Record<string, TonicProfile> = {
  // Travail intense
  deep_focus: {
    formality: 'technical',
    emotionalDepth: 'minimal',
    narrativeDensity: 'sparse',
    energyLevel: 'high'
  },

  // Exploration créative
  exploration: {
    formality: 'professional',
    emotionalDepth: 'moderate',
    narrativeDensity: 'balanced',
    energyLevel: 'medium'
  },

  // Maintenance système
  maintenance: {
    formality: 'technical',
    emotionalDepth: 'minimal',
    narrativeDensity: 'sparse',
    energyLevel: 'medium'
  },

  // Dialogue profond
  deep_dialogue: {
    formality: 'professional',
    emotionalDepth: 'profound',
    narrativeDensity: 'rich',
    energyLevel: 'medium'
  },

  // Repos / transition
  rest: {
    formality: 'casual',
    emotionalDepth: 'moderate',
    narrativeDensity: 'sparse',
    energyLevel: 'low'
  },

  // Coaching / guidance
  coaching: {
    formality: 'professional',
    emotionalDepth: 'deep',
    narrativeDensity: 'balanced',
    energyLevel: 'medium'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🌌 UNIFIED PRESENCE ENGINE - CORE
// ═══════════════════════════════════════════════════════════════════════════════

class UnifiedPresenceEngine {
  private state: PresenceState;
  private userContext: UserContext;
  private currentProfile: TonicProfile;
  private config: HarmonizationConfig;
  private harmonizationLoop: NodeJS.Timeout | null = null;
  private subscribers: Set<(state: PresenceState) => void> = new Set();
  private isRunning = false;

  constructor() {
    this.state = this.getDefaultState();
    this.userContext = this.getDefaultContext();
    this.currentProfile = TONIC_PROFILES.exploration;
    this.config = this.getDefaultConfig();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🎬 Lifecycle
  // ─────────────────────────────────────────────────────────────────────────────

  start(): void {
    if (this.isRunning) return;

    console.log('🌌 [Presence Engine] Démarrage du moteur de présence unifiée...');

    this.isRunning = true;
    this.loadState();
    this.observeUserContext();
    this.startHarmonizationLoop();

    console.log('✅ [Presence Engine] Moteur de présence actif');
  }

  stop(): void {
    if (!this.isRunning) return;

    console.log('🌌 [Presence Engine] Arrêt du moteur de présence...');

    if (this.harmonizationLoop) {
      clearInterval(this.harmonizationLoop);
      this.harmonizationLoop = null;
    }

    this.saveState();
    this.isRunning = false;

    console.log('✅ [Presence Engine] Moteur de présence arrêté');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔄 Harmonization Loop (OODA Cycle)
  // ─────────────────────────────────────────────────────────────────────────────

  private startHarmonizationLoop(): void {
    // Boucle d'harmonisation toutes les 5 secondes
    this.harmonizationLoop = setInterval(() => {
      this.runHarmonizationCycle();
    }, this.config.harmonizationInterval);

    // Premier cycle immédiat
    this.runHarmonizationCycle();
  }

  private runHarmonizationCycle(): void {
    if (!this.isRunning) return;

    // OBSERVE
    this.observeUserContext();
    const cognitiveState = cognitiveLayoutEngine.getState();

    // INTERPRET
    const needsAdjustment = this.interpretNeeds(cognitiveState);

    // DECIDE
    const adjustments = this.decideAdjustments(needsAdjustment);

    // ACT
    if (adjustments.visual) this.harmonizeVisualLayer();
    if (adjustments.cognitive) this.harmonizeCognitiveLayer();
    if (adjustments.emotional) this.harmonizeEmotionalLayer();
    if (adjustments.symbolic) this.harmonizeSymbolicLayer();

    // LEARN
    this.learnFromCycle();

    // Notifier les abonnés
    this.notifySubscribers();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 👁️ OBSERVE - Observation du contexte utilisateur
  // ─────────────────────────────────────────────────────────────────────────────

  private observeUserContext(): void {
    const now = new Date();
    const hour = now.getHours();

    // Déterminer le moment de la journée
    let timeOfDay: UserContext['timeOfDay'];
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Observer le moteur cognitif
    const cognitiveState = cognitiveLayoutEngine.getState();

    // Mettre à jour le contexte utilisateur
    this.userContext = {
      ...this.userContext,
      timeOfDay,
      cognitiveLoad: cognitiveState.signals.cognitiveLoad * 100, // Convertir 0-1 en 0-100
      taskComplexity: cognitiveState.signals.focusScore > 0.7 ? 80 : 50, // Estimation basée sur le focus
      // Les autres métriques seraient enrichies par Helios/Nexus
      fatigue: this.estimateFatigue(),
      tempo: this.estimateTempo(),
      interactionPattern: this.detectInteractionPattern()
    };
  }  private estimateFatigue(): number {
    // Estimation basique : augmente avec la durée de session
    const sessionMinutes = this.userContext.sessionDuration;
    if (sessionMinutes < 30) return 0;
    if (sessionMinutes < 60) return 20;
    if (sessionMinutes < 120) return 40;
    if (sessionMinutes < 180) return 60;
    return 80;
  }

  private estimateTempo(): number {
    // Tempo basé sur le mode cognitif actuel
    const mode = cognitiveLayoutEngine.getState().currentMode;
    const tempoMap: Record<string, number> = {
      focus_deep: 30,      // Lent, concentré
      exploration: 60,     // Moyen
      monitoring: 70,      // Moyen-rapide
      maintenance: 50,     // Moyen
      coaching: 40,        // Moyen-lent
      neutral: 50          // Moyen
    };
    return tempoMap[mode] || 50;
  }

  private detectInteractionPattern(): UserContext['interactionPattern'] {
    const mode = cognitiveLayoutEngine.getState().currentMode;
    const patternMap: Record<string, UserContext['interactionPattern']> = {
      focus_deep: 'execute',
      exploration: 'explore',
      monitoring: 'analyze',
      maintenance: 'rest',
      coaching: 'create',
      neutral: 'explore'
    };
    return patternMap[mode] || 'explore';
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🧠 INTERPRET - Interprétation des besoins
  // ─────────────────────────────────────────────────────────────────────────────

  private interpretNeeds(cognitiveState: any): {
    visualAdjustment: boolean;
    cognitiveAdjustment: boolean;
    emotionalAdjustment: boolean;
    symbolicAdjustment: boolean;
    confidence: number;
  } {
    const load = this.userContext.cognitiveLoad;
    const fatigue = this.userContext.fatigue;
    const complexity = this.userContext.taskComplexity;

    // Besoin d'ajustement visuel si charge élevée ou fatigue
    const visualAdjustment = load > 70 || fatigue > 60;

    // Besoin d'ajustement cognitif si complexité change
    const cognitiveAdjustment = complexity > 60;

    // Besoin d'ajustement émotionnel si fatigue ou mode change
    const emotionalAdjustment = fatigue > 50 || load > 80;

    // Ajustement symbolique pour continuité narrative
    const symbolicAdjustment = true; // Toujours actif

    const confidence = 75; // Confiance de base

    return {
      visualAdjustment,
      cognitiveAdjustment,
      emotionalAdjustment,
      symbolicAdjustment,
      confidence
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🎯 DECIDE - Décision des ajustements
  // ─────────────────────────────────────────────────────────────────────────────

  private decideAdjustments(needs: ReturnType<typeof this.interpretNeeds>): {
    visual: boolean;
    cognitive: boolean;
    emotional: boolean;
    symbolic: boolean;
  } {
    const threshold = 70; // Seuil de confiance pour agir

    if (needs.confidence < threshold) {
      return { visual: false, cognitive: false, emotional: false, symbolic: true };
    }

    return {
      visual: this.config.visualSync && needs.visualAdjustment,
      cognitive: this.config.cognitiveSync && needs.cognitiveAdjustment,
      emotional: this.config.emotionalSync && needs.emotionalAdjustment,
      symbolic: this.config.symbolicSync && needs.symbolicAdjustment
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🎨 ACT - Harmonisation des 4 couches
  // ─────────────────────────────────────────────────────────────────────────────

  private harmonizeVisualLayer(): void {
    const { cognitiveLoad, fatigue, timeOfDay } = this.userContext;

    // Réduire l'intensité si charge élevée ou fatigue
    if (cognitiveLoad > 70 || fatigue > 60) {
      this.state.visualIntensity = Math.max(40, this.state.visualIntensity - 5);
      this.state.accentStrength = Math.max(30, this.state.accentStrength - 5);
      this.state.pulseRate = Math.max(20, this.state.pulseRate - 5);
    } else {
      this.state.visualIntensity = Math.min(80, this.state.visualIntensity + 2);
      this.state.accentStrength = Math.min(70, this.state.accentStrength + 2);
      this.state.pulseRate = Math.min(60, this.state.pulseRate + 2);
    }

    // Ajuster la teinte selon le moment de la journée
    const hueMap = {
      morning: 260,   // Violet clair
      afternoon: 250, // Violet standard
      evening: 240,   // Violet chaud
      night: 230      // Violet profond
    };
    this.state.ambientHue = hueMap[timeOfDay];

    this.applyVisualStyles();
  }

  private harmonizeCognitiveLayer(): void {
    const { taskComplexity, cognitiveLoad } = this.userContext;

    // Ajuster la clarté cognitive perçue
    this.state.clarityLevel = Math.max(0, 100 - cognitiveLoad);

    // Complexité gérée
    this.state.complexityHandled = Math.min(100, taskComplexity * 1.2);

    // Alignement avec l'intention (toujours élevé pour TITANE∞)
    this.state.intentionAlignment = 90;
  }

  private harmonizeEmotionalLayer(): void {
    const { fatigue, cognitiveLoad, interactionPattern } = this.userContext;

    // Chaleur : augmenter si fatigue élevée (soutien)
    if (fatigue > 60) {
      this.state.warmth = Math.min(70, this.state.warmth + 5);
      this.state.supportLevel = Math.min(80, this.state.supportLevel + 5);
    } else {
      this.state.warmth = 50; // Neutre professionnel
      this.state.supportLevel = 50;
    }

    // Intensité émotionnelle : réduire si charge élevée
    if (cognitiveLoad > 70) {
      this.state.intensity = Math.max(30, this.state.intensity - 5);
    } else {
      this.state.intensity = 50;
    }

    // Proximité basée sur le pattern d'interaction
    const proximityMap: Record<UserContext['interactionPattern'], number> = {
      explore: 40,
      execute: 30,
      analyze: 35,
      create: 60,
      rest: 50
    };
    this.state.proximity = proximityMap[interactionPattern];
  }

  private harmonizeSymbolicLayer(): void {
    // Maintenir une continuité narrative élevée
    this.state.narrativeContinuity = Math.min(100, this.state.narrativeContinuity + 1);

    // Stabilité identitaire (toujours maximale)
    this.state.identityStability = 95;

    // Profondeur mythologique selon le contexte
    const { interactionPattern } = this.userContext;
    const depthMap: Record<UserContext['interactionPattern'], number> = {
      explore: 60,
      execute: 40,
      analyze: 50,
      create: 80,
      rest: 30
    };
    this.state.mythologicalDepth = depthMap[interactionPattern];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 📚 LEARN - Apprentissage continu
  // ─────────────────────────────────────────────────────────────────────────────

  private learnFromCycle(): void {
    // Incrémenter la durée de session
    this.userContext.sessionDuration += this.config.harmonizationInterval / 60000;

    // Sauvegarder l'état périodiquement
    if (this.userContext.sessionDuration % 5 === 0) {
      this.saveState();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🎨 Application des styles visuels
  // ─────────────────────────────────────────────────────────────────────────────

  private applyVisualStyles(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Intensité visuelle
    root.style.setProperty('--presence-intensity', `${this.state.visualIntensity / 100}`);

    // Force des accents
    root.style.setProperty('--presence-accent-strength', `${this.state.accentStrength / 100}`);

    // Taux de pulsation
    root.style.setProperty('--presence-pulse-rate', `${this.state.pulseRate / 100}`);

    // Teinte ambiante
    root.style.setProperty('--presence-ambient-hue', `${this.state.ambientHue}`);

    // Chaleur émotionnelle
    root.style.setProperty('--presence-warmth', `${this.state.warmth / 100}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 💾 Persistence
  // ─────────────────────────────────────────────────────────────────────────────

  private saveState(): void {
    try {
      localStorage.setItem('titane_presence_state', JSON.stringify(this.state));
      localStorage.setItem('titane_presence_context', JSON.stringify(this.userContext));
    } catch (error) {
      console.warn('⚠️ [Presence Engine] Impossible de sauvegarder l\'état:', error);
    }
  }

  private loadState(): void {
    try {
      const savedState = localStorage.getItem('titane_presence_state');
      const savedContext = localStorage.getItem('titane_presence_context');

      if (savedState) {
        this.state = { ...this.state, ...JSON.parse(savedState) };
      }

      if (savedContext) {
        this.userContext = { ...this.userContext, ...JSON.parse(savedContext) };
      }
    } catch (error) {
      console.warn('⚠️ [Presence Engine] Impossible de charger l\'état:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔧 API Publique
  // ─────────────────────────────────────────────────────────────────────────────

  getState(): PresenceState {
    return { ...this.state };
  }

  getUserContext(): UserContext {
    return { ...this.userContext };
  }

  getIdentityMatrix(): IdentityMatrix {
    return TITANE_IDENTITY;
  }

  getCurrentProfile(): TonicProfile {
    return { ...this.currentProfile };
  }

  setProfile(profileName: keyof typeof TONIC_PROFILES): void {
    const profile = TONIC_PROFILES[profileName];
    if (profile) {
      this.currentProfile = profile;
      console.log(`🎼 [Presence Engine] Profil tonique changé: ${profileName}`);
    }
  }

  subscribe(callback: (state: PresenceState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🏗️ Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private getDefaultState(): PresenceState {
    return {
      visualIntensity: 60,
      accentStrength: 50,
      pulseRate: 40,
      ambientHue: 250,
      clarityLevel: 80,
      complexityHandled: 50,
      intentionAlignment: 90,
      warmth: 50,
      proximity: 40,
      intensity: 50,
      supportLevel: 50,
      narrativeContinuity: 80,
      identityStability: 95,
      mythologicalDepth: 50
    };
  }

  private getDefaultContext(): UserContext {
    return {
      cognitiveLoad: 50,
      fatigue: 0,
      tempo: 50,
      taskComplexity: 50,
      timeOfDay: 'afternoon',
      sessionDuration: 0,
      interactionPattern: 'explore'
    };
  }

  private getDefaultConfig(): HarmonizationConfig {
    return {
      visualSync: true,
      cognitiveSync: true,
      emotionalSync: true,
      symbolicSync: true,
      autoCalibration: true,
      harmonizationInterval: 5000 // 5 secondes
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌟 Export singleton
// ═══════════════════════════════════════════════════════════════════════════════

export const unifiedPresenceEngine = new UnifiedPresenceEngine();
export default unifiedPresenceEngine;
