// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.0 — FACIAL EXPRESSION ENGINE v2
//   Dynamic expressions + micro-gestures for ultra-realistic avatar
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 6 modes d'expression TITANE∞ (cohérents avec IA)
 */
export type ExpressionMode =
  | 'soft-smile' // Sourire doux (écoute bienveillante)
  | 'attention-focus' // Attention concentrée (analyse utilisateur)
  | 'active-listening' // Écoute active (compréhension)
  | 'explanation-mode' // Mode explication (pédagogie)
  | 'compassion-mode' // Compassion / empathie
  | 'curiosity-mode'; // Curiosité / découverte

/**
 * Expression weights (morph targets faciaux)
 */
export interface ExpressionWeights {
  // Bouche
  smileMouth: number; // 0.0-1.0 (coins bouche relevés)
  mouthOpen: number; // 0.0-1.0 (bouche ouverte neutre)

  // Yeux
  eyeBrowRaise: number; // 0.0-1.0 (sourcils levés)
  eyeBrowFurrow: number; // 0.0-1.0 (sourcils froncés)
  eyeWiden: number; // 0.0-1.0 (yeux écarquillés)
  eyeSquint: number; // 0.0-1.0 (yeux plissés)
  eyeLidLowerLeft: number; // 0.0-1.0 (paupière gauche baissée)
  eyeLidLowerRight: number; // 0.0-1.0 (paupière droite baissée)

  // Joues
  cheekRaise: number; // 0.0-1.0 (joues relevées)

  // Nez
  noseWrinkle: number; // 0.0-1.0 (nez plissé)

  // Global
  headTilt: number; // -1.0 to 1.0 (inclinaison tête)
}

/**
 * Micro-gestures (clignements, saccades oculaires, etc.)
 */
export interface MicroGesture {
  type: 'blink' | 'eyeSaccade' | 'pupilDilation' | 'microSmile' | 'browTwitch';
  intensity: number; // 0.0-1.0
  duration: number; // ms
  timestamp: number; // Date.now()
}

export interface ExpressionConfig {
  blinkFrequency: [number, number]; // [min, max] blinks per minute
  saccadeFrequency: number; // Saccades per minute
  microGestureIntensity: number; // Global intensity multiplier
  expressionTransitionSpeed: number; // Lerp factor (0.05-0.3)
  emotionalDamping: number; // Damping for sudden changes
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPRESSION PRESETS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Presets pour chaque mode d'expression
 */
const EXPRESSION_PRESETS: Record<ExpressionMode, Partial<ExpressionWeights>> = {
  // ─────────────────────────────────────────
  // SOFT-SMILE (sourire doux, bienveillant)
  // ─────────────────────────────────────────
  'soft-smile': {
    smileMouth: 0.4, // Sourire léger
    eyeSquint: 0.2, // Yeux légèrement plissés
    cheekRaise: 0.3, // Joues relevées
    eyeBrowRaise: 0.1, // Sourcils légèrement levés
    headTilt: 0.05, // Légère inclinaison tête
  },

  // ─────────────────────────────────────────
  // ATTENTION-FOCUS (concentration intense)
  // ─────────────────────────────────────────
  'attention-focus': {
    eyeWiden: 0.3, // Yeux un peu plus ouverts
    eyeBrowRaise: 0.2, // Sourcils légèrement levés
    mouthOpen: 0.1, // Bouche légèrement entrouverte
    headTilt: 0.0, // Tête droite
  },

  // ─────────────────────────────────────────
  // ACTIVE-LISTENING (écoute active)
  // ─────────────────────────────────────────
  'active-listening': {
    eyeBrowRaise: 0.15, // Sourcils légèrement levés
    eyeWiden: 0.2, // Yeux attentifs
    headTilt: 0.08, // Légère inclinaison (intérêt)
    smileMouth: 0.15, // Micro-sourire
  },

  // ─────────────────────────────────────────
  // EXPLANATION-MODE (pédagogie, explication)
  // ─────────────────────────────────────────
  'explanation-mode': {
    eyeBrowRaise: 0.25, // Sourcils levés (expressivité)
    eyeWiden: 0.25, // Yeux ouverts
    smileMouth: 0.2, // Sourire léger
    mouthOpen: 0.15, // Bouche un peu ouverte
    headTilt: 0.0, // Tête stable
  },

  // ─────────────────────────────────────────
  // COMPASSION-MODE (empathie, douceur)
  // ─────────────────────────────────────────
  'compassion-mode': {
    smileMouth: 0.3, // Sourire doux
    eyeBrowRaise: 0.2, // Sourcils légèrement levés
    eyeSquint: 0.15, // Yeux doux
    cheekRaise: 0.25, // Joues relevées
    headTilt: 0.1, // Inclinaison marquée
  },

  // ─────────────────────────────────────────
  // CURIOSITY-MODE (curiosité, découverte)
  // ─────────────────────────────────────────
  'curiosity-mode': {
    eyeWiden: 0.4, // Yeux grands ouverts
    eyeBrowRaise: 0.3, // Sourcils levés
    mouthOpen: 0.2, // Bouche entrouverte (surprise légère)
    headTilt: 0.12, // Inclinaison marquée
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class FacialExpressionEngine {
  private config: ExpressionConfig;
  private currentMode: ExpressionMode = 'soft-smile';
  private currentWeights: ExpressionWeights;
  private targetWeights: ExpressionWeights;

  // Micro-gestures
  private lastBlinkTime: number = 0;
  private nextBlinkDelay: number = 0;
  private lastSaccadeTime: number = 0;
  private nextSaccadeDelay: number = 0;
  private activeMicroGestures: MicroGesture[] = [];

  constructor(config: Partial<ExpressionConfig> = {}) {
    this.config = {
      blinkFrequency: [3, 8], // 3-8 blinks/min (naturel)
      saccadeFrequency: 12, // 12 saccades/min
      microGestureIntensity: 1.0, // Intensité normale
      expressionTransitionSpeed: 0.15, // Smooth transitions
      emotionalDamping: 0.8, // Damping modéré
      ...config,
    };

    // Initialize neutral expression
    this.currentWeights = this.createNeutralWeights();
    this.targetWeights = this.createNeutralWeights();

    // Schedule first blink
    this.scheduleNextBlink();
    this.scheduleNextSaccade();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Change expression mode
   */
  public setExpressionMode(mode: ExpressionMode): void {
    if (this.currentMode === mode) return;

    this.currentMode = mode;

    // Apply preset
    const preset = EXPRESSION_PRESETS[mode];
    this.targetWeights = {
      ...this.createNeutralWeights(),
      ...preset,
    };
  }

  /**
   * Get current expression mode
   */
  public getCurrentMode(): ExpressionMode {
    return this.currentMode;
  }

  /**
   * Update manual (override preset temporairement)
   */
  public setCustomWeights(weights: Partial<ExpressionWeights>): void {
    this.targetWeights = {
      ...this.targetWeights,
      ...weights,
    };
  }

  /**
   * Update avec vocal intensity (modulation dynamique)
   */
  public updateWithVocalIntensity(intensity: number): void {
    // Intensity 0.0-1.0 → modulation subtile expressions
    const modulationFactor = 1.0 + intensity * 0.2; // Max +20%

    // Apply modulation to target weights (bouche + sourcils)
    this.targetWeights.smileMouth *= modulationFactor;
    this.targetWeights.eyeBrowRaise *= modulationFactor;

    // Clamp to [0, 1]
    this.targetWeights.smileMouth = Math.min(1.0, this.targetWeights.smileMouth);
    this.targetWeights.eyeBrowRaise = Math.min(1.0, this.targetWeights.eyeBrowRaise);
  }

  /**
   * Main update loop (appelé chaque frame)
   */
  public update(_deltaTime: number): ExpressionWeights {
    const now = Date.now();

    // ─────────────────────────────────────────
    // 1. MICRO-GESTURES
    // ─────────────────────────────────────────
    this.updateMicroGestures(now);

    // ─────────────────────────────────────────
    // 2. INTERPOLATION VERS TARGET
    // ─────────────────────────────────────────
    this.currentWeights = this.interpolateWeights(
      this.currentWeights,
      this.targetWeights,
      this.config.expressionTransitionSpeed
    );

    // ─────────────────────────────────────────
    // 3. APPLY MICRO-GESTURES
    // ─────────────────────────────────────────
    const finalWeights = this.applyMicroGestures(this.currentWeights);

    return finalWeights;
  }

  /**
   * Get current expression weights
   */
  public getCurrentWeights(): ExpressionWeights {
    return { ...this.currentWeights };
  }

  /**
   * Trigger manual blink
   */
  public triggerBlink(intensity: number = 0.8): void {
    this.activeMicroGestures.push({
      type: 'blink',
      intensity,
      duration: 150, // 150ms blink
      timestamp: Date.now(),
    });
  }

  /**
   * Trigger eye saccade (mouvement oculaire rapide)
   */
  public triggerSaccade(intensity: number = 0.5): void {
    this.activeMicroGestures.push({
      type: 'eyeSaccade',
      intensity,
      duration: 50, // 50ms saccade
      timestamp: Date.now(),
    });
  }

  /**
   * Reset to neutral expression
   */
  public reset(): void {
    this.currentMode = 'soft-smile';
    this.currentWeights = this.createNeutralWeights();
    this.targetWeights = this.createNeutralWeights();
    this.activeMicroGestures = [];
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Update micro-gestures (blinks, saccades, etc.)
   */
  private updateMicroGestures(now: number): void {
    // ─────────────────────────────────────────
    // AUTO-BLINK
    // ─────────────────────────────────────────
    if (now - this.lastBlinkTime > this.nextBlinkDelay) {
      this.triggerBlink(0.8);
      this.lastBlinkTime = now;
      this.scheduleNextBlink();
    }

    // ─────────────────────────────────────────
    // AUTO-SACCADE
    // ─────────────────────────────────────────
    if (now - this.lastSaccadeTime > this.nextSaccadeDelay) {
      this.triggerSaccade(0.3);
      this.lastSaccadeTime = now;
      this.scheduleNextSaccade();
    }

    // ─────────────────────────────────────────
    // CLEANUP EXPIRED GESTURES
    // ─────────────────────────────────────────
    this.activeMicroGestures = this.activeMicroGestures.filter(
      g => now - g.timestamp < g.duration
    );
  }

  /**
   * Apply active micro-gestures to weights
   */
  private applyMicroGestures(baseWeights: ExpressionWeights): ExpressionWeights {
    const result = { ...baseWeights };
    const now = Date.now();

    for (const gesture of this.activeMicroGestures) {
      const progress = (now - gesture.timestamp) / gesture.duration;
      const easedProgress = this.easeInOutCubic(progress);

      // Ease-in-out for natural movement
      let intensity = gesture.intensity;
      if (progress < 0.5) {
        intensity *= easedProgress * 2; // Ramp up
      } else {
        intensity *= (1 - easedProgress) * 2; // Ramp down
      }

      // Apply gesture
      switch (gesture.type) {
        case 'blink':
          result.eyeLidLowerLeft = Math.min(1.0, result.eyeLidLowerLeft + intensity);
          result.eyeLidLowerRight = Math.min(1.0, result.eyeLidLowerRight + intensity);
          break;

        case 'eyeSaccade':
          // Saccade → slight eye squint
          result.eyeSquint = Math.min(1.0, result.eyeSquint + intensity * 0.3);
          break;

        case 'pupilDilation':
          // Pupil dilation → eye widen
          result.eyeWiden = Math.min(1.0, result.eyeWiden + intensity * 0.2);
          break;

        case 'microSmile':
          result.smileMouth = Math.min(1.0, result.smileMouth + intensity * 0.15);
          result.cheekRaise = Math.min(1.0, result.cheekRaise + intensity * 0.1);
          break;

        case 'browTwitch':
          result.eyeBrowRaise = Math.min(1.0, result.eyeBrowRaise + intensity * 0.2);
          break;
      }
    }

    return result;
  }

  /**
   * Schedule next auto-blink
   */
  private scheduleNextBlink(): void {
    const [minFreq, maxFreq] = this.config.blinkFrequency;
    const blinksPerMinute = this.randomRange(minFreq, maxFreq);
    const msPerBlink = 60000 / blinksPerMinute;

    this.nextBlinkDelay = msPerBlink + this.randomRange(-500, 500); // +/- 500ms jitter
  }

  /**
   * Schedule next auto-saccade
   */
  private scheduleNextSaccade(): void {
    const msPerSaccade = 60000 / this.config.saccadeFrequency;
    this.nextSaccadeDelay = msPerSaccade + this.randomRange(-1000, 1000); // +/- 1s jitter
  }

  /**
   * Interpolate between two weight sets
   */
  private interpolateWeights(
    from: ExpressionWeights,
    to: ExpressionWeights,
    t: number
  ): ExpressionWeights {
    return {
      smileMouth: this.lerp(from.smileMouth, to.smileMouth, t),
      mouthOpen: this.lerp(from.mouthOpen, to.mouthOpen, t),
      eyeBrowRaise: this.lerp(from.eyeBrowRaise, to.eyeBrowRaise, t),
      eyeBrowFurrow: this.lerp(from.eyeBrowFurrow, to.eyeBrowFurrow, t),
      eyeWiden: this.lerp(from.eyeWiden, to.eyeWiden, t),
      eyeSquint: this.lerp(from.eyeSquint, to.eyeSquint, t),
      eyeLidLowerLeft: this.lerp(from.eyeLidLowerLeft, to.eyeLidLowerLeft, t),
      eyeLidLowerRight: this.lerp(from.eyeLidLowerRight, to.eyeLidLowerRight, t),
      cheekRaise: this.lerp(from.cheekRaise, to.cheekRaise, t),
      noseWrinkle: this.lerp(from.noseWrinkle, to.noseWrinkle, t),
      headTilt: this.lerp(from.headTilt, to.headTilt, t),
    };
  }

  /**
   * Create neutral expression weights
   */
  private createNeutralWeights(): ExpressionWeights {
    return {
      smileMouth: 0.0,
      mouthOpen: 0.0,
      eyeBrowRaise: 0.0,
      eyeBrowFurrow: 0.0,
      eyeWiden: 0.0,
      eyeSquint: 0.0,
      eyeLidLowerLeft: 0.0,
      eyeLidLowerRight: 0.0,
      cheekRaise: 0.0,
      noseWrinkle: 0.0,
      headTilt: 0.0,
    };
  }

  /**
   * Linear interpolation
   */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Ease-in-out cubic
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Random range helper
   */
  private randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Select expression mode based on context
 */
export function selectExpressionForContext(context: {
  isListening: boolean;
  isSpeaking: boolean;
  emotionalTone?: 'neutral' | 'positive' | 'empathetic' | 'curious';
}): ExpressionMode {
  if (context.isListening) {
    return 'active-listening';
  }

  if (context.isSpeaking) {
    switch (context.emotionalTone) {
      case 'positive':
        return 'soft-smile';
      case 'empathetic':
        return 'compassion-mode';
      case 'curious':
        return 'curiosity-mode';
      default:
        return 'explanation-mode';
    }
  }

  // Default: soft smile
  return 'soft-smile';
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default FacialExpressionEngine;
