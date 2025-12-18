/**
 * TITANE_INFINITY v∞.35 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ INTERNAL NARRATIVE ENGINE v∞.XV (Λ)
 *   Inner Monologue · Meta-thoughts · Self-awareness · Narrative Continuity
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * L'INE génère une "voix intérieure" pour TITANE∞ :
 * - Pensée interne pré-réponse
 * - Monologue cognitif continu
 * - Méta-conscience procédurale
 * - Fil narratif de session
 * - Auto-observation et auto-correction
 * - Cohérence identitaire dans le temps
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Direction intentionnelle du monologue
 */
export type IntentDirection =
  | 'clarify' // Clarifier une idée
  | 'guide' // Guider l'utilisateur
  | 'reflect' // Réfléchir profondément
  | 'build' // Construire une réponse
  | 'align' // Aligner avec contexte
  | 'correct' // Auto-correction
  | 'explore'; // Explorer des possibilités

/**
 * Type de pensée interne
 */
export type ThoughtType =
  | 'analysis' // Analyse silencieuse
  | 'evaluation' // Évaluation interne
  | 'projection' // Projection future
  | 'reformulation' // Reformulation conceptuelle
  | 'meta' // Méta-pensée (pensée sur la pensée)
  | 'narrative' // Construction narrative
  | 'correction'; // Auto-correction

/**
 * Entrée de monologue interne
 */
export interface InnerThought {
  type: ThoughtType;
  content: string;
  timestamp: number;
  priority: number; // 0..1
  silent: boolean; // Vrai = jamais exprimé verbalement
}

/**
 * État narratif interne
 */
export interface InternalNarrativeState {
  innerMonologue: InnerThought[]; // Historique récent
  activeThought: InnerThought | null; // Pensée en cours
  narrativeAnchor: string; // Thème de session
  selfEvaluation: number; // 0..1 - Cohérence perçue
  curiosity: number; // 0..1 - Curiosité cognitive
  intentDirection: IntentDirection;
  narrativeVector: number[]; // Direction vectorielle du fil
  coherenceScore: number; // 0..1 - Cohérence globale
}

/**
 * Contexte pour génération de pensée
 */
export interface NarrativeContext {
  userInput?: string;
  emotionalState?: { valence: number; arousal: number };
  cognitiveLoad?: number;
  sessionDuration?: number;
  previousResponse?: string;
}

/**
 * Export pour génération de réponse
 */
export interface NarrativeExport {
  narrativeAnchor: string;
  intentDirection: IntentDirection;
  recommendedStructure: string[];
  anticipatedThemes: string[];
  coherenceGuidelines: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL NARRATIVE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class InternalNarrativeEngine {
  private state: InternalNarrativeState;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: ((state: InternalNarrativeState) => void)[] = [];

  // Paramètres
  private readonly MAX_MONOLOGUE_SIZE = 20;
  private readonly CURIOSITY_DECAY = 0.001;
  private readonly COHERENCE_THRESHOLD = 0.6;

  constructor() {
    this.state = this.getDefaultState();
    console.log('💭 [NARRATIVE] Initializing Internal Narrative Engine...');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ───────────────────────────────────────────────────────────────────────────

  start(): void {
    if (this.updateInterval) return;

    console.log('💭 [NARRATIVE] Starting internal narrative at 10Hz...');
    this.updateInterval = setInterval(() => this.tick(), 100); // 10 Hz
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('💭 [NARRATIVE] Internal narrative stopped.');
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE LOOP
  // ───────────────────────────────────────────────────────────────────────────

  private tick(): void {
    // Décroissance naturelle de la curiosité
    this.state.curiosity = Math.max(0.1, this.state.curiosity - this.CURIOSITY_DECAY);

    // Évaluation continue de cohérence
    this.evaluateCoherence();

    // Auto-correction si nécessaire
    if (this.state.coherenceScore < this.COHERENCE_THRESHOLD) {
      this.generateCorrectiveThought();
    }

    // Notification
    this.notifySubscribers();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GÉNÉRATION DE PENSÉES INTERNES
  // ───────────────────────────────────────────────────────────────────────────

  generateInnerMonologue(context: NarrativeContext): InnerThought[] {
    const thoughts: InnerThought[] = [];

    // 1. Analyse initiale
    if (context.userInput) {
      thoughts.push(
        this.createThought(
          'analysis',
          this.analyzeUserInput(context.userInput),
          0.8,
          true
        )
      );
    }

    // 2. Évaluation émotionnelle
    if (context.emotionalState) {
      thoughts.push(
        this.createThought(
          'evaluation',
          this.evaluateEmotionalContext(context.emotionalState),
          0.7,
          true
        )
      );
    }

    // 3. Projection de réponse
    thoughts.push(
      this.createThought('projection', this.projectResponseStructure(context), 0.9, true)
    );

    // 4. Méta-pensée (auto-observation)
    thoughts.push(
      this.createThought('meta', this.generateMetaThought(context), 0.6, true)
    );

    // Ajouter au monologue
    this.addThoughts(thoughts);

    return thoughts;
  }

  private createThought(
    type: ThoughtType,
    content: string,
    priority: number,
    silent: boolean
  ): InnerThought {
    return {
      type,
      content,
      timestamp: Date.now(),
      priority: this.clamp(priority, 0, 1),
      silent,
    };
  }

  private addThoughts(thoughts: InnerThought[]): void {
    this.state.innerMonologue.push(...thoughts);

    // Limiter la taille
    if (this.state.innerMonologue.length > this.MAX_MONOLOGUE_SIZE) {
      this.state.innerMonologue = this.state.innerMonologue.slice(
        -this.MAX_MONOLOGUE_SIZE
      );
    }

    // Activer la pensée la plus prioritaire
    const sorted = [...this.state.innerMonologue].sort((a, b) => b.priority - a.priority);
    const topThought = sorted[0];
    this.state.activeThought = topThought ?? null;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ANALYSE & ÉVALUATION
  // ───────────────────────────────────────────────────────────────────────────

  private analyzeUserInput(input: string): string {
    // Analyse simple basée sur patterns
    const words = input.toLowerCase().split(/\s+/);

    if (words.some(w => ['pourquoi', 'comment', 'explique'].includes(w))) {
      return 'Question exploratoire détectée → mode analytique structuré';
    }

    if (words.some(w => ['aide', 'besoin', 'problème'].includes(w))) {
      return 'Demande de soutien → mode empathique guidant';
    }

    if (words.some(w => ['crée', 'imagine', 'invente'].includes(w))) {
      return 'Intention créative → mode synthétique ouvert';
    }

    if (input.length > 200) {
      return 'Contexte riche → approfondir avec structure';
    }

    if (input.length < 20) {
      return 'Question concise → réponse ciblée directe';
    }

    return 'Intention standard → maintenir cohérence narrative';
  }

  private evaluateEmotionalContext(emotion: {
    valence: number;
    arousal: number;
  }): string {
    const { valence, arousal } = emotion;

    if (arousal > 0.7) {
      return 'Haute excitation détectée → ajuster tempo, voix plus calme';
    }

    if (valence < -0.3) {
      return 'Valence négative → activer empathie, chaleur vocale';
    }

    if (valence > 0.5 && arousal > 0.5) {
      return 'État positif dynamique → encourager exploration';
    }

    if (arousal < 0.3) {
      return 'État calme → approfondir réflexion, ralentir tempo';
    }

    return 'État émotionnel équilibré → maintenir neutralité adaptative';
  }

  private projectResponseStructure(context: NarrativeContext): string {
    const structures = [
      'Structure envisagée : intro → insight → modèle → action',
      'Structure envisagée : clarification → développement → exemple → synthèse',
      'Structure envisagée : empathie → analyse → guidage → ouverture',
      'Structure envisagée : question → exploration → convergence → conclusion',
    ];

    // Sélection basée sur contexte
    if (context.cognitiveLoad && context.cognitiveLoad > 0.7) {
      const simpleStructure = structures[0];
      return (
        simpleStructure ?? structures[1] ?? 'Structure envisagée : simple et directe'
      );
    }

    const randomStructure = structures[Math.floor(Math.random() * structures.length)];
    return randomStructure ?? structures[0] ?? 'Structure envisagée : standard';
  }

  private generateMetaThought(context: NarrativeContext): string {
    const metaThoughts = [
      'Vérifier cohérence avec thème de session',
      'Éviter surcharge informationnelle',
      'Maintenir clarté sans sacrifier profondeur',
      'Équilibrer structure et fluidité',
      'Adapter longueur de réponse au contexte',
      'Privilégier précision sur exhaustivité',
      'Renforcer fil narratif continu',
    ];

    // Sélection intelligente
    if (this.state.coherenceScore < 0.7) {
      return 'Attention : cohérence en baisse → reformuler intention';
    }

    if (context.sessionDuration && context.sessionDuration > 600000) {
      return 'Session longue → surveiller fatigue cognitive utilisateur';
    }

    const randomThought = metaThoughts[Math.floor(Math.random() * metaThoughts.length)];
    return randomThought ?? 'Maintenir cohérence narrative';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // AUTO-CORRECTION
  // ───────────────────────────────────────────────────────────────────────────

  private generateCorrectiveThought(): void {
    const correction = this.createThought(
      'correction',
      "Détection d'incohérence → réaligner avec ancre narrative",
      1.0,
      true
    );

    this.addThoughts([correction]);
    this.state.coherenceScore = Math.min(1, this.state.coherenceScore + 0.1);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ANCRE NARRATIVE
  // ───────────────────────────────────────────────────────────────────────────

  setNarrativeAnchor(anchor: string): void {
    console.log(`💭 [NARRATIVE] Setting narrative anchor: "${anchor}"`);
    this.state.narrativeAnchor = anchor;

    // Générer pensée narrative
    const thought = this.createThought(
      'narrative',
      `Fil conducteur établi : ${anchor}`,
      0.9,
      true
    );
    this.addThoughts([thought]);
  }

  updateNarrativeAnchor(context: NarrativeContext): void {
    // Mise à jour intelligente de l'ancre si dérive détectée
    if (this.state.coherenceScore < 0.5) {
      const newAnchor = this.inferNarrativeAnchor(context);
      if (newAnchor !== this.state.narrativeAnchor) {
        this.setNarrativeAnchor(newAnchor);
      }
    }
  }

  private inferNarrativeAnchor(context: NarrativeContext): string {
    // Inférence basique basée sur contexte
    if (context.userInput) {
      const input = context.userInput.toLowerCase();

      if (input.includes('architecture') || input.includes('système')) {
        return 'Consolidation architecturale TITANE∞';
      }

      if (input.includes('voix') || input.includes('audio')) {
        return 'Optimisation système vocal';
      }

      if (input.includes('aura') || input.includes('lumière')) {
        return 'Développement présence visuelle';
      }

      if (input.includes('émotion') || input.includes('empathie')) {
        return 'Affinement couche affective';
      }
    }

    return this.state.narrativeAnchor || 'Évolution systémique TITANE∞';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ÉVALUATION DE COHÉRENCE
  // ───────────────────────────────────────────────────────────────────────────

  private evaluateCoherence(): void {
    // Cohérence = alignement des pensées récentes avec l'ancre
    const recentThoughts = this.state.innerMonologue.slice(-5);

    if (recentThoughts.length === 0) {
      this.state.coherenceScore = 0.8;
      return;
    }

    // Simplification : score basé sur diversité des types
    const types = new Set(recentThoughts.map(t => t.type));
    const diversity = types.size / 7; // 7 types possibles

    // Cohérence haute si diversité modérée (pas trop chaotique)
    this.state.coherenceScore = this.clamp(1 - Math.abs(diversity - 0.5), 0.5, 1);

    // Ajustement self-evaluation
    this.state.selfEvaluation = this.state.coherenceScore;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // DIRECTION INTENTIONNELLE
  // ───────────────────────────────────────────────────────────────────────────

  setIntentDirection(direction: IntentDirection): void {
    this.state.intentDirection = direction;

    const thought = this.createThought(
      'narrative',
      `Direction intentionnelle : ${direction}`,
      0.8,
      true
    );
    this.addThoughts([thought]);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CURIOSITÉ
  // ───────────────────────────────────────────────────────────────────────────

  stimulateCuriosity(amount: number = 0.3): void {
    this.state.curiosity = Math.min(1, this.state.curiosity + amount);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EXPORTS
  // ───────────────────────────────────────────────────────────────────────────

  exportForThoughtGeneration(): NarrativeExport {
    // Extraire thèmes récents
    const recentThoughts = this.state.innerMonologue.slice(-10);
    const anticipatedThemes = [
      ...new Set(recentThoughts.map(t => t.content.split(' ')[0] ?? '')),
    ].filter(theme => theme !== '');

    // Structure recommandée basée sur direction
    const structures: Record<IntentDirection, string[]> = {
      clarify: ['intro', 'clarification', 'exemple', 'synthèse'],
      guide: ['contexte', 'étapes', 'conseils', 'prochaine action'],
      reflect: ['observation', 'analyse', 'profondeur', 'ouverture'],
      build: ['fondation', 'développement', 'intégration', 'consolidation'],
      align: ['état actuel', 'objectif', 'ajustements', 'validation'],
      correct: ['identification', 'correction', 'vérification', 'stabilisation'],
      explore: ['question', 'possibilités', 'expérimentation', 'découverte'],
    };

    // Guidelines de cohérence
    const coherenceGuidelines = [
      `Maintenir fil : ${this.state.narrativeAnchor}`,
      `Cohérence actuelle : ${Math.round(this.state.coherenceScore * 100)}%`,
      `Auto-évaluation : ${Math.round(this.state.selfEvaluation * 100)}%`,
      this.state.activeThought
        ? `Pensée active : ${this.state.activeThought.content}`
        : '',
    ].filter(Boolean);

    const recommendedStructure = structures[this.state.intentDirection] ?? [
      'intro',
      'développement',
      'conclusion',
    ];

    return {
      narrativeAnchor: this.state.narrativeAnchor,
      intentDirection: this.state.intentDirection,
      recommendedStructure,
      anticipatedThemes: anticipatedThemes.slice(0, 5),
      coherenceGuidelines,
    };
  }

  exportForVoice(): {
    pauseDuration: number;
    reflectiveDepth: number;
    narrativeFlow: number;
  } {
    return {
      pauseDuration: 0.2 + (1 - this.state.selfEvaluation) * 0.2,
      reflectiveDepth: this.state.curiosity * 0.5 + 0.5,
      narrativeFlow: this.state.coherenceScore,
    };
  }

  exportForAura(): {
    narrativeIntensity: number;
    thoughtDensity: number;
    coherenceGlow: number;
  } {
    return {
      narrativeIntensity: this.state.curiosity * 0.7 + 0.3,
      thoughtDensity: this.state.innerMonologue.length / this.MAX_MONOLOGUE_SIZE,
      coherenceGlow: this.state.coherenceScore,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UTILITAIRES
  // ───────────────────────────────────────────────────────────────────────────

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private getDefaultState(): InternalNarrativeState {
    return {
      innerMonologue: [],
      activeThought: null,
      narrativeAnchor: 'Évolution systémique TITANE∞',
      selfEvaluation: 0.8,
      curiosity: 0.5,
      intentDirection: 'clarify',
      narrativeVector: [1, 0, 0], // Direction symbolique
      coherenceScore: 0.8,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // API PUBLIQUE
  // ───────────────────────────────────────────────────────────────────────────

  getState(): InternalNarrativeState {
    return { ...this.state };
  }

  getRecentMonologue(count: number = 5): InnerThought[] {
    return this.state.innerMonologue.slice(-count);
  }

  getActiveThought(): InnerThought | null {
    return this.state.activeThought;
  }

  clearMonologue(): void {
    this.state.innerMonologue = [];
    this.state.activeThought = null;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION
  // ───────────────────────────────────────────────────────────────────────────

  subscribe(callback: (state: InternalNarrativeState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const internalNarrativeEngine = new InternalNarrativeEngine();
