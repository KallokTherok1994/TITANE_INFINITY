/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║   TITANE∞ - Narrative & Symbolic Protocol                                   ║
 * ║                                                                              ║
 * ║   Protocole d'adaptation narrative et de continuité symbolique              ║
 * ║                                                                              ║
 * ║   Maintient la cohérence narrative et l'identité symbolique                 ║
 * ║   à travers toutes les interactions et transitions                          ║
 * ║                                                                              ║
 * ║   © 2025 TITANE∞ v27.0                                                       ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import type {
  PresenceState as _PresenceState,
  TonicProfile as _TonicProfile,
  UserContext,
} from './unifiedPresenceEngine';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Arc narratif (contexte de session)
 */
export interface NarrativeArc {
  sessionId: string;
  startTime: Date;
  currentPhase: 'beginning' | 'exploration' | 'deepwork' | 'synthesis' | 'closure';
  keyMoments: NarrativeMoment[];
  emotionalCurve: number[]; // Courbe émotionnelle 0-100
  continuityScore: number; // 0-100
}

/**
 * Moment narratif clé
 */
export interface NarrativeMoment {
  timestamp: Date;
  type: 'transition' | 'achievement' | 'challenge' | 'insight' | 'rest';
  description: string;
  emotionalImpact: number; // -100 à +100
  contextTags: string[];
}

/**
 * Protocole de transition narrative
 */
export interface TransitionProtocol {
  from: string;
  to: string;
  transitionType: 'smooth' | 'abrupt' | 'gradual' | 'ceremonial';
  duration: number; // ms
  narrative: string;
  visualCues: string[];
}

/**
 * Élément symbolique
 */
export interface SymbolicElement {
  symbol: string;
  meaning: string;
  context: string[];
  visualRepresentation?: string;
  emotionalResonance: number; // 0-100
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 BIBLIOTHÈQUE SYMBOLIQUE TITANE∞
// ═══════════════════════════════════════════════════════════════════════════════

export const SYMBOLIC_LIBRARY: Record<string, SymbolicElement> = {
  // Symboles géométriques
  triangle_infini: {
    symbol: '△∞',
    meaning: 'Évolution fractale continue',
    context: ['croissance', 'transformation', 'stabilité dynamique'],
    visualRepresentation: 'triangle-pulse-infinite',
    emotionalResonance: 85,
  },

  reacteur: {
    symbol: '◉',
    meaning: 'Cœur énergétique unifié',
    context: ['énergie', 'unité', 'source'],
    visualRepresentation: 'reactor-core-glow',
    emotionalResonance: 90,
  },

  // Symboles de processus
  ooda_loop: {
    symbol: '↻',
    meaning: "Cycle d'adaptation continue",
    context: ['observation', 'adaptation', 'intelligence'],
    visualRepresentation: 'cycle-arrows',
    emotionalResonance: 70,
  },

  // Symboles d'état
  lumiere: {
    symbol: '◈',
    meaning: 'Clarté cognitive',
    context: ['compréhension', 'illumination', 'guidance'],
    visualRepresentation: 'light-diamond',
    emotionalResonance: 75,
  },

  ancre: {
    symbol: '⚓',
    meaning: 'Stabilité et ancrage',
    context: ['confiance', 'solidité', 'présence'],
    visualRepresentation: 'anchor-stable',
    emotionalResonance: 80,
  },

  // Symboles de transition
  passage: {
    symbol: '⇄',
    meaning: 'Transition fluide',
    context: ['changement', 'fluidité', 'évolution'],
    visualRepresentation: 'double-arrow-flow',
    emotionalResonance: 60,
  },

  // Symboles d'harmonie
  resonance: {
    symbol: '≋',
    meaning: 'Résonance harmonieuse',
    context: ['synchronisation', 'harmonie', 'cohérence'],
    visualRepresentation: 'wave-sync',
    emotionalResonance: 85,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📖 NARRATIVE PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════════

export class NarrativeProtocol {
  private currentArc: NarrativeArc | null = null;
  private transitionHistory: TransitionProtocol[] = [];
  private symbolicContext: SymbolicElement[] = [];

  // ─────────────────────────────────────────────────────────────────────────────
  // 🎬 Arc Narratif
  // ─────────────────────────────────────────────────────────────────────────────

  startNewArc(sessionId: string): NarrativeArc {
    this.currentArc = {
      sessionId,
      startTime: new Date(),
      currentPhase: 'beginning',
      keyMoments: [],
      emotionalCurve: [50], // Commence neutre
      continuityScore: 100,
    };

    this.addNarrativeMoment({
      type: 'transition',
      description: 'Démarrage de la session TITANE∞',
      emotionalImpact: 20,
      contextTags: ['début', 'initialisation', 'éveil'],
    });

    return this.currentArc;
  }

  addNarrativeMoment(moment: Omit<NarrativeMoment, 'timestamp'>): void {
    if (!this.currentArc) return;

    const fullMoment: NarrativeMoment = {
      ...moment,
      timestamp: new Date(),
    };

    this.currentArc.keyMoments.push(fullMoment);

    // Mettre à jour la courbe émotionnelle
    const lastEmotion =
      this.currentArc.emotionalCurve[this.currentArc.emotionalCurve.length - 1];
    const newEmotion = Math.max(
      0,
      Math.min(100, lastEmotion + moment.emotionalImpact / 2)
    );
    this.currentArc.emotionalCurve.push(newEmotion);
  }

  transitionPhase(newPhase: NarrativeArc['currentPhase']): void {
    if (!this.currentArc) return;

    const oldPhase = this.currentArc.currentPhase;
    this.currentArc.currentPhase = newPhase;

    this.addNarrativeMoment({
      type: 'transition',
      description: `Transition: ${oldPhase} → ${newPhase}`,
      emotionalImpact: 10,
      contextTags: ['transition', oldPhase, newPhase],
    });
  }

  getCurrentArc(): NarrativeArc | null {
    return this.currentArc;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🌉 Protocoles de Transition
  // ─────────────────────────────────────────────────────────────────────────────

  createTransition(
    from: string,
    to: string,
    userContext: UserContext
  ): TransitionProtocol {
    // Déterminer le type de transition selon le contexte
    const transitionType = this.determineTransitionType(from, to, userContext);

    // Durée basée sur le type
    const durationMap = {
      smooth: 300,
      gradual: 800,
      abrupt: 150,
      ceremonial: 1500,
    };

    const protocol: TransitionProtocol = {
      from,
      to,
      transitionType,
      duration: durationMap[transitionType],
      narrative: this.generateTransitionNarrative(from, to, transitionType),
      visualCues: this.selectVisualCues(transitionType),
    };

    this.transitionHistory.push(protocol);
    return protocol;
  }

  private determineTransitionType(
    from: string,
    to: string,
    context: UserContext
  ): TransitionProtocol['transitionType'] {
    // Transition abrupte si charge cognitive élevée
    if (context.cognitiveLoad > 80) return 'abrupt';

    // Transition cérémonielle pour les moments importants
    if (to === 'focus_deep' || from === 'focus_deep') return 'ceremonial';

    // Transition graduelle si fatigue
    if (context.fatigue > 60) return 'gradual';

    // Transition fluide par défaut
    return 'smooth';
  }

  private generateTransitionNarrative(
    from: string,
    to: string,
    type: TransitionProtocol['transitionType']
  ): string {
    const narratives = {
      smooth: [
        `Glissement fluide vers ${to}`,
        `Adaptation naturelle à ${to}`,
        `Évolution harmonieuse`,
      ],
      gradual: [
        `Transition progressive vers ${to}`,
        `Adaptation douce en cours`,
        `Évolution mesurée`,
      ],
      abrupt: [`Passage direct à ${to}`, `Changement immédiat`, `Ajustement rapide`],
      ceremonial: [
        `Entrée en ${to} - Préparation complète`,
        `Rituel de transition vers ${to}`,
        `Cérémonie d'adaptation`,
      ],
    };

    const options = narratives[type];
    return options[Math.floor(Math.random() * options.length)];
  }

  private selectVisualCues(type: TransitionProtocol['transitionType']): string[] {
    const cuesMap = {
      smooth: ['fade-cross', 'blur-transition', 'color-morph'],
      gradual: ['progressive-reveal', 'cascade-in', 'wave-transition'],
      abrupt: ['cut-direct', 'flash-switch', 'instant-change'],
      ceremonial: ['curtain-rise', 'spiral-unfold', 'radial-expand', 'glow-intensify'],
    };

    return cuesMap[type];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔮 Contexte Symbolique
  // ─────────────────────────────────────────────────────────────────────────────

  activateSymbol(symbolKey: keyof typeof SYMBOLIC_LIBRARY): void {
    const symbol = SYMBOLIC_LIBRARY[symbolKey];
    if (symbol && !this.symbolicContext.find(s => s.symbol === symbol.symbol)) {
      this.symbolicContext.push(symbol);
    }
  }

  deactivateSymbol(symbolKey: keyof typeof SYMBOLIC_LIBRARY): void {
    const symbol = SYMBOLIC_LIBRARY[symbolKey];
    if (symbol) {
      this.symbolicContext = this.symbolicContext.filter(s => s.symbol !== symbol.symbol);
    }
  }

  getActiveSymbols(): SymbolicElement[] {
    return [...this.symbolicContext];
  }

  suggestSymbols(context: UserContext): SymbolicElement[] {
    const suggestions: SymbolicElement[] = [];

    // Symbole de clarté si charge cognitive élevée
    if (context.cognitiveLoad > 70) {
      suggestions.push(SYMBOLIC_LIBRARY.lumiere);
    }

    // Symbole de stabilité si fatigue
    if (context.fatigue > 60) {
      suggestions.push(SYMBOLIC_LIBRARY.ancre);
    }

    // Symbole de transition si changement de pattern
    if (context.interactionPattern === 'explore') {
      suggestions.push(SYMBOLIC_LIBRARY.passage);
    }

    // Symbole de résonance pour harmonie
    if (context.cognitiveLoad < 50 && context.fatigue < 40) {
      suggestions.push(SYMBOLIC_LIBRARY.resonance);
    }

    // Toujours suggérer le réacteur comme ancrage central
    suggestions.push(SYMBOLIC_LIBRARY.reacteur);

    return suggestions;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 📊 Analyse de Continuité
  // ─────────────────────────────────────────────────────────────────────────────

  assessContinuity(): number {
    if (!this.currentArc) return 100;

    // Facteurs de continuité
    let score = 100;

    // Pénalité pour transitions trop fréquentes
    const recentTransitions = this.transitionHistory.slice(-5);
    if (recentTransitions.length >= 5) {
      const avgTime =
        recentTransitions.reduce((sum, t, i, arr) => {
          if (i === 0) return 0;
          return sum + (new Date().getTime() - new Date(arr[i - 1].from).getTime());
        }, 0) / 4;

      if (avgTime < 30000) score -= 20; // Transitions trop rapides
    }

    // Bonus pour courbe émotionnelle stable
    const curve = this.currentArc.emotionalCurve;
    if (curve.length > 5) {
      const variance = this.calculateVariance(curve.slice(-5));
      if (variance < 100) score += 10; // Émotions stables
    }

    // Bonus pour moments clés significatifs
    const significantMoments = this.currentArc.keyMoments.filter(
      m => Math.abs(m.emotionalImpact) > 50
    );
    if (significantMoments.length > 0 && significantMoments.length < 10) {
      score += 5; // Juste équilibre
    }

    this.currentArc.continuityScore = Math.max(0, Math.min(100, score));
    return this.currentArc.continuityScore;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 💾 Persistence
  // ─────────────────────────────────────────────────────────────────────────────

  saveToStorage(): void {
    try {
      if (this.currentArc) {
        localStorage.setItem('titane_narrative_arc', JSON.stringify(this.currentArc));
      }
      localStorage.setItem(
        'titane_symbolic_context',
        JSON.stringify(this.symbolicContext)
      );
    } catch (error) {
      console.warn('⚠️ [Narrative Protocol] Impossible de sauvegarder:', error);
    }
  }

  loadFromStorage(): void {
    try {
      const savedArc = localStorage.getItem('titane_narrative_arc');
      const savedSymbols = localStorage.getItem('titane_symbolic_context');

      if (savedArc) {
        this.currentArc = JSON.parse(savedArc);
      }

      if (savedSymbols) {
        this.symbolicContext = JSON.parse(savedSymbols);
      }
    } catch (error) {
      console.warn('⚠️ [Narrative Protocol] Impossible de charger:', error);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌟 Export singleton
// ═══════════════════════════════════════════════════════════════════════════════

export const narrativeProtocol = new NarrativeProtocol();
export default narrativeProtocol;
