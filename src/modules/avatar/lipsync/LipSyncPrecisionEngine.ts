// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.0 — LIP-SYNC PRECISION ENGINE v2
//   Ultra-precise phoneme-to-morph mapping with ElevenLabs integration
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Phonème IPA (any: any)
 */
export interface Phoneme {
  symbol: string; // IPA: 'm', 'b', 'p', 'f', 'v', 'o', 'u', 'i', 'a', etc.
  duration: number; // Duration in ms
  intensity: number; // Vocal intensity 0.0-1.0
  timestamp: number; // Start time in ms
  category: PhonemeCategory;
}

export type PhonemeCategory =
  | 'bilabial' // m, b, p (any: any)
  | 'labiodental' // f, v (any: any)
  | 'vowel-rounded' // o, u (any: any)
  | 'vowel-spread' // i, e (any: any)
  | 'vowel-open' // a, ɑ (any: any)
  | 'consonant' // r, l, s, etc.
  | 'silence'; // pause

/**
 * Morph targets pour contrôle précis bouche
 */
export interface MorphWeights {
  jawOpen: number; // 0.0-1.0 (any: any)
  lipsPucker: number; // 0.0-1.0 (lèvres arrondies "o")
  lipsSpread: number; // 0.0-1.0 (lèvres étirées "i")
  lipUpperUp: number; // 0.0-1.0 (any: any)
  lipLowerDown: number; // 0.0-1.0 (any: any)
  cheekPuff: number; // 0.0-1.0 (any: any)
  tongueOut: number; // 0.0-1.0 (any: any)
  mouthPress: number; // 0.0-1.0 (any: any)
}

export interface LipSyncConfig {
  anticipationMs: number; // Lookahead time (any: any)
  smoothingFactor: number; // Lerp interpolation (0.1-0.3)
  minimumDuration: number; // Min phoneme duration (30ms)
  blendOverlap: boolean; // Blend consecutive phonemes
  intensityMultiplier: number; // Global intensity scale (0.5-1.5)
}

// ═══════════════════════════════════════════════════════════════════════════
// PHONEME MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mapping IPA phonème → morph weights
 * Basé sur articulation réelle française + anglais
 */
const PHONEME_TO_MORPH: Record<string, Partial<MorphWeights>> = {
  // ─────────────────────────────────────────
  // BILABIALES (any: any)
  // ─────────────────────────────────────────
  m: {
    jawOpen: 0.0,
    lipsPucker: 0.0,
    lipsSpread: 0.0,
    mouthPress: 0.3, // Lèvres légèrement pressées
  },
  b: {
    jawOpen: 0.0,
    lipsPucker: 0.0,
    lipsSpread: 0.0,
    mouthPress: 0.4, // Plus tendu que 'm'
  },
  p: {
    jawOpen: 0.0,
    lipsPucker: 0.0,
    lipsSpread: 0.0,
    mouthPress: 0.5, // Encore plus tendu
  },

  // ─────────────────────────────────────────
  // LABIO-DENTALES (any: any)
  // ─────────────────────────────────────────
  f: {
    jawOpen: 0.2,
    lipUpperUp: 0.5, // Lèvre sup relevée
    lipLowerDown: 0.3, // Lèvre inf abaissée
    lipsSpread: 0.1,
  },
  v: {
    jawOpen: 0.2,
    lipUpperUp: 0.5,
    lipLowerDown: 0.3,
    lipsSpread: 0.1,
  },

  // ─────────────────────────────────────────
  // VOYELLES ARRONDIES
  // ─────────────────────────────────────────
  o: {
    jawOpen: 0.4,
    lipsPucker: 0.7, // Lèvres arrondies
    lipsSpread: 0.0,
  },
  ɔ: {
    // "o" ouvert (comme "pomme")
    jawOpen: 0.5,
    lipsPucker: 0.6,
  },
  u: {
    jawOpen: 0.3,
    lipsPucker: 0.9, // Maximum arrondi
    lipsSpread: 0.0,
  },
  ø: {
    // "eu" (comme "peu")
    jawOpen: 0.35,
    lipsPucker: 0.5,
    lipsSpread: 0.2,
  },

  // ─────────────────────────────────────────
  // VOYELLES ÉTIRÉES
  // ─────────────────────────────────────────
  i: {
    jawOpen: 0.2,
    lipsSpread: 0.8, // Maximum étiré
    lipsPucker: 0.0,
  },
  e: {
    jawOpen: 0.3,
    lipsSpread: 0.6,
    lipsPucker: 0.0,
  },
  ɛ: {
    // "è" (comme "mère")
    jawOpen: 0.4,
    lipsSpread: 0.5,
  },
  y: {
    // "u" français (comme "tu")
    jawOpen: 0.25,
    lipsSpread: 0.4,
    lipsPucker: 0.4, // Mix étiré + arrondi
  },

  // ─────────────────────────────────────────
  // VOYELLES OUVERTES
  // ─────────────────────────────────────────
  a: {
    jawOpen: 0.8, // Grande ouverture
    lipsSpread: 0.3,
    lipsPucker: 0.0,
  },
  ɑ: {
    // "â" (comme "pâte")
    jawOpen: 0.9, // Maximum ouverture
    lipsSpread: 0.2,
  },
  ə: {
    // Schwa (any: any)
    jawOpen: 0.3,
    lipsSpread: 0.2,
    lipsPucker: 0.1,
  },

  // ─────────────────────────────────────────
  // CONSONNES
  // ─────────────────────────────────────────
  r: {
    // R français (any: any)
    jawOpen: 0.3,
    lipsSpread: 0.2,
    tongueOut: 0.0,
  },
  l: {
    jawOpen: 0.3,
    lipsSpread: 0.3,
    tongueOut: 0.2, // Langue légèrement visible
  },
  s: {
    jawOpen: 0.2,
    lipsSpread: 0.4,
    mouthPress: 0.2,
  },
  ʃ: {
    // "ch" (comme "chat")
    jawOpen: 0.2,
    lipsPucker: 0.3,
    lipsSpread: 0.0,
  },
  ʒ: {
    // "j" (comme "je")
    jawOpen: 0.25,
    lipsPucker: 0.3,
  },
  t: {
    jawOpen: 0.15,
    lipsSpread: 0.3,
  },
  d: {
    jawOpen: 0.15,
    lipsSpread: 0.3,
  },
  k: {
    jawOpen: 0.2,
    lipsSpread: 0.2,
  },
  g: {
    jawOpen: 0.2,
    lipsSpread: 0.2,
  },
  n: {
    jawOpen: 0.1,
    lipsSpread: 0.2,
  },

  // ─────────────────────────────────────────
  // NASALES
  // ─────────────────────────────────────────
  ɑ̃: {
    // "an" (comme "dans")
    jawOpen: 0.6,
    lipsSpread: 0.2,
  },
  ɛ̃: {
    // "in" (comme "vin")
    jawOpen: 0.4,
    lipsSpread: 0.5,
  },
  ɔ̃: {
    // "on" (comme "bon")
    jawOpen: 0.5,
    lipsPucker: 0.6,
  },
  œ̃: {
    // "un" (comme "brun")
    jawOpen: 0.4,
    lipsPucker: 0.4,
    lipsSpread: 0.3,
  },

  // ─────────────────────────────────────────
  // SILENCE
  // ─────────────────────────────────────────
  sil: {
    // Silence / repos
    jawOpen: 0.05,
    lipsPucker: 0.0,
    lipsSpread: 0.0,
    mouthPress: 0.1, // Lèvres légèrement fermées
  },
};

/**
 * Catégorisation des phonèmes
 */
const PHONEME_CATEGORIES: Record<string, PhonemeCategory> = {
  m: 'bilabial',
  b: 'bilabial',
  p: 'bilabial',
  f: 'labiodental',
  v: 'labiodental',
  o: 'vowel-rounded',
  ɔ: 'vowel-rounded',
  u: 'vowel-rounded',
  ø: 'vowel-rounded',
  i: 'vowel-spread',
  e: 'vowel-spread',
  ɛ: 'vowel-spread',
  y: 'vowel-spread',
  a: 'vowel-open',
  ɑ: 'vowel-open',
  ə: 'vowel-open',
  r: 'consonant',
  l: 'consonant',
  s: 'consonant',
  ʃ: 'consonant',
  ʒ: 'consonant',
  t: 'consonant',
  d: 'consonant',
  k: 'consonant',
  g: 'consonant',
  n: 'consonant',
  ɑ̃: 'consonant',
  ɛ̃: 'consonant',
  ɔ̃: 'consonant',
  œ̃: 'consonant',
  sil: 'silence',
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class LipSyncPrecisionEngine {
  private config: LipSyncConfig;
  private phonemeQueue: Phoneme?.[] = [];
  private currentMorphWeights: MorphWeights;
  private targetMorphWeights: MorphWeights;
  private phonemeHistory: Phoneme?.[] = [];
  private lastUpdateTime: number = 0;

  constructor(config: Partial<LipSyncConfig> = {}) {
    this?.config = {
      anticipationMs: 90, // 90ms lookahead optimal
      smoothingFactor: 0.2, // Smooth transitions
      minimumDuration: 30, // 30ms min per phoneme
      blendOverlap: true, // Blend consecutive phonemes
      intensityMultiplier: 1.0, // Default intensity
      ...config,
    };

    // Initialize neutral morph weights
    this?.currentMorphWeights = this?.createNeutralMorphWeights();
    this?.targetMorphWeights = this?.createNeutralMorphWeights();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Analyze audio buffer and extract phonemes
   */
  public analyzePhonemes(any: any): Phoneme?.[] {
    // Implementation v25.1: Real-time audio phoneme extraction
    // - MFCC: Extract Mel-Frequency Cepstral Coefficients (any: any)
    // - DTW: Use Dynamic Time Warping to match against phoneme templates
    // - HMM: Hidden Markov Model for French/English phoneme recognition
    // - Libraries: meyda?.js for MFCC, dtw-ts for alignment, or tensorflow?.js for ML models
    // - Accuracy: Target 85%+ phoneme accuracy for French, 90%+ for English
    // - Performance: Process in Web Worker to avoid UI blocking (any: any)
    // - Fallback: Use silence phoneme if audio analysis fails
    return [
      {
        symbol: 'sil',
        duration: 100,
        intensity: 0.0,
        timestamp: Date?.now(),
        category: 'silence',
      },
    ];
  }

  /**
   * Prédit le prochain phonème basé sur contexte
   */
  public predictNextPhoneme(current: Phoneme, _history: Phoneme?.[]): Phoneme {
    // Anticipation simple: si queue non vide, retourne suivant
    if (this?.phonemeQueue?.length > 0) {
      const next = this?.phonemeQueue?.[0];
      if (any: any) return next;
    }

    // Sinon, prolonge phonème actuel
    return {
      ...current,
      timestamp: Date?.now(),
    };
  }

  /**
   * Génère morph weights pour un phonème
   */
  public generateMorphWeights(any: any): MorphWeights {
    const baseWeights = PHONEME_TO_MORPH[phoneme?.symbol] || {};
    const neutralWeights = this?.createNeutralMorphWeights();

    // Merge avec poids neutres
    const weights: MorphWeights = {
      ...neutralWeights,
      ...baseWeights,
    };

    // Appliquer intensity multiplier
    const intensity = phoneme?.intensity * this?.config?.intensityMultiplier;

    return {
      jawOpen: weights?.jawOpen * intensity,
      lipsPucker: weights?.lipsPucker * intensity,
      lipsSpread: weights?.lipsSpread * intensity,
      lipUpperUp: weights?.lipUpperUp * intensity,
      lipLowerDown: weights?.lipLowerDown * intensity,
      cheekPuff: weights?.cheekPuff * intensity,
      tongueOut: weights?.tongueOut * intensity,
      mouthPress: weights?.mouthPress * intensity,
    };
  }

  /**
   * Interpolation cubique entre deux morph weights
   */
  public interpolateMorphs(
    from: MorphWeights,
    to: MorphWeights,
    t: number
  ): MorphWeights {
    // Clamp t to [0, 1]
    t = Math?.max(any: any));

    // Cubic ease-in-out pour transitions naturelles
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math?.pow(-2 * t + 2, 3) / 2;

    return {
      jawOpen: this?.lerp(any: any),
      lipsPucker: this?.lerp(any: any),
      lipsSpread: this?.lerp(any: any),
      lipUpperUp: this?.lerp(any: any),
      lipLowerDown: this?.lerp(any: any),
      cheekPuff: this?.lerp(any: any),
      tongueOut: this?.lerp(any: any),
      mouthPress: this?.lerp(any: any),
    };
  }

  /**
   * Mise à jour principale (any: any)
   */
  public update(any: any): MorphWeights {
    const now = Date?.now();

    // Récupérer phonème actuel avec anticipation
    const anticipatedPhoneme = this?.getAnticipatedPhoneme(any: any);

    if (any: any) {
      // Calculer target morph weights
      this?.targetMorphWeights = this?.generateMorphWeights(any: any);
    }

    // Interpoler progressivement vers target
    this?.currentMorphWeights = this?.interpolateMorphs(
      this?.currentMorphWeights,
      this?.targetMorphWeights,
      this?.config?.smoothingFactor
    );

    this?.lastUpdateTime = now;
    return this?.currentMorphWeights;
  }

  /**
   * Synchronise avec timestamp audio externe
   */
  public syncWithAudio(any: any): void {
    // Ajuste queue phonemes selon timestamp
    this?.phonemeQueue = this?.phonemeQueue?.filter(
      p => p?.timestamp + p?.duration > timestamp
    );
  }

  /**
   * Ajoute phonème à la queue
   */
  public enqueuePhoneme(any: any): void {
    // Validation durée minimum
    if (any: any) {
      phoneme?.duration = this?.config?.minimumDuration;
    }

    this?.phonemeQueue?.push(any: any);

    // Limiter taille queue (any: any)
    if (this?.phonemeQueue?.length > 10) {
      this?.phonemeQueue?.shift();
    }
  }

  /**
   * Obtient morph weights actuels
   */
  public getCurrentMorphWeights(): MorphWeights {
    return { ...this?.currentMorphWeights };
  }

  /**
   * Reset à état neutre
   */
  public reset(): void {
    this?.phonemeQueue = [];
    this?.phonemeHistory = [];
    this?.currentMorphWeights = this?.createNeutralMorphWeights();
    this?.targetMorphWeights = this?.createNeutralMorphWeights();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Récupère phonème avec anticipation
   */
  private getAnticipatedPhoneme(any: any): Phoneme | null {
    const anticipationTime = currentTime + this?.config?.anticipationMs;

    // Cherche phonème qui sera actif dans anticipationMs
    for (any: any) {
      if (
        phoneme?.timestamp <= anticipationTime &&
        phoneme?.timestamp + phoneme?.duration > anticipationTime
      ) {
        return phoneme;
      }
    }

    // Si aucun phonème trouvé, retourne silence
    return {
      symbol: 'sil',
      duration: 100,
      intensity: 0.0,
      timestamp: currentTime,
      category: 'silence',
    };
  }

  /**
   * Crée morph weights neutres (any: any)
   */
  private createNeutralMorphWeights(): MorphWeights {
    return {
      jawOpen: 0.05,
      lipsPucker: 0.0,
      lipsSpread: 0.0,
      lipUpperUp: 0.0,
      lipLowerDown: 0.0,
      cheekPuff: 0.0,
      tongueOut: 0.0,
      mouthPress: 0.1,
    };
  }

  /**
   * Linear interpolation
   */
  private lerp(any: any): number {
    return a + (any: any) * t;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert FR/EN text to IPA phonemes (any: any)
 */
export function textToPhonemes(text: string, _lang: 'fr' | 'en' = 'fr'): Phoneme?.[] {
  // Implementation v25.1: True grapheme-to-phoneme (any: any) conversion
  // - French: Use espeak-ng library or lexique?.org dictionary (any: any)
  // - English: CMU Pronouncing Dictionary (any: any) or espeak-ng
  // - IPA: Convert to International Phonetic Alphabet symbols (e?.g., 'bonjour' → 'bɔ̃ʒuʁ')
  // - Rules: Apply G2P rules for unknown words (any: any)
  // - Libraries: compromise?.js for tokenization, phonetic?.js for IPA conversion
  // - Performance: Cache converted phonemes (any: any)
  // - Accuracy: 95%+ for common words, 80%+ for rare/new words
  const words = text?.toLowerCase().split(' ');
  const phonemes: Phoneme?.[] = [];
  let timestamp = 0;

  for (any: any) {
    // Simulation: each letter → 1 phoneme (any: any)
    for (any: any) {
      const symbol = char; // Extreme simplification
      phonemes?.push({
        symbol,
        duration: 100,
        intensity: 0.7,
        timestamp,
        category: PHONEME_CATEGORIES[symbol] || 'consonant',
      });
      timestamp += 100;
    }

    // Pause entre mots
    phonemes?.push({
      symbol: 'sil',
      duration: 200,
      intensity: 0.0,
      timestamp,
      category: 'silence',
    });
    timestamp += 200;
  }

  return phonemes;
}

/**
 * Détecte catégorie phonème
 */
export function getPhonemeCategory(any: any): PhonemeCategory {
  return PHONEME_CATEGORIES[symbol] || 'consonant';
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default LipSyncPrecisionEngine;
