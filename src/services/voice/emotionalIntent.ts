/**
 * TITANE_INFINITY v19.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3.1 — EMOTIONAL INTENT TYPES
 *
 *   Types et interfaces pour le moteur émotionnel vocal
 *   Permet à TITANE∞ de parler avec intention, émotion et nuances
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Émotions supportées par le moteur
 */
export type EmotionType =
  | 'calm' // Calme, posé, zen
  | 'gentle' // Doux, tendre, chaleureux
  | 'confident' // Confiant, assuré, stable
  | 'inspiring' // Inspirant, motivant, énergisant
  | 'playful' // Joueur, léger, amusant
  | 'empathetic' // Empathique, compréhensif, soutenant
  | 'serious' // Sérieux, formel, sobre
  | 'excited' // Excité, enthousiaste, vibrant
  | 'thoughtful' // Pensif, réfléchi, profond
  | 'warm' // Chaleureux, accueillant, bienveillant
  | 'neutral'; // Neutre, standard, sans modulation

/**
 * Intensité émotionnelle (0.0 - 1.0)
 */
export type EmotionalIntensity = number; // 0.0 = très subtil, 1.0 = très prononcé

/**
 * Intention émotionnelle complète
 */
export interface EmotionalIntent {
  /** Type d'émotion principale */
  emotion: EmotionType;

  /** Intensité globale (0.0 - 1.0) */
  intensity: EmotionalIntensity;

  /** Chaleur vocale (0.0 = froid, 1.0 = très chaleureux) */
  warmth: number;

  /** Vitesse de parole (0.0 = lent, 1.0 = rapide) */
  speed: number;

  /** Hauteur tonale (0.0 = grave, 1.0 = aigu) */
  pitch: number;

  /** Énergie vocale (0.0 = faible, 1.0 = forte) */
  energy: number;

  /** Émotion secondaire optionnelle (pour nuances) */
  secondaryEmotion?: EmotionType;

  /** Confiance de l'analyse (0.0 - 1.0) */
  confidence?: number;
}

/**
 * Contexte d'analyse émotionnelle
 */
export interface EmotionalContext {
  /** Historique des émotions récentes */
  history?: EmotionType[];

  /** Sujet de la conversation */
  topic?: string;

  /** État de l'utilisateur détecté */
  userState?: 'stressed' | 'calm' | 'curious' | 'confused' | 'happy';

  /** Moment de la journée */
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

/**
 * Profil émotionnel prédéfini
 */
export interface EmotionalProfile {
  /** Nom du profil */
  name: string;

  /** Description */
  description: string;

  /** Intention par défaut */
  defaultIntent: EmotionalIntent;

  /** Modificateurs contextuels */
  contextModifiers?: {
    topic?: Record<string, Partial<EmotionalIntent>>;
    userState?: Record<string, Partial<EmotionalIntent>>;
    timeOfDay?: Record<string, Partial<EmotionalIntent>>;
  };
}

/**
 * Résultat d'analyse émotionnelle
 */
export interface EmotionalAnalysisResult {
  /** Intention détectée */
  intent: EmotionalIntent;

  /** Mots-clés émotionnels détectés */
  keywords: string[];

  /** Indices utilisés pour l'analyse */
  indicators: {
    lexical: number; // Analyse lexicale (mots émotionnels)
    syntactic: number; // Analyse syntaxique (structure)
    semantic: number; // Analyse sémantique (sens)
  };

  /** Suggestions alternatives */
  alternatives?: EmotionalIntent[];
}

/**
 * Configuration du moteur émotionnel
 */
export interface EmotionalEngineConfig {
  /** Activer l'analyse émotionnelle */
  enabled: boolean;

  /** Profil émotionnel par défaut */
  defaultProfile: string;

  /** Intensité globale (multiplicateur) */
  globalIntensity: number;

  /** Adapter selon l'utilisateur */
  adaptToUser: boolean;

  /** Historique à conserver */
  historySize: number;

  /** Utiliser l'IA pour l'analyse (vs heuristiques) */
  useAIAnalysis: boolean;
}
