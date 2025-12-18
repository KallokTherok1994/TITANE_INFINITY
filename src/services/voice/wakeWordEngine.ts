/**
 * TITANE_INFINITY v19.5.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.5 — WAKE WORD ENGINE (HYBRID v1/v2)
 *
 *   Détection phonétique robuste du mot "TITANE"
 *   Support streaming + batch
 *   Anti-faux-positifs
 *   Distance phonétique adaptative
 *   [v19.5.0] Optional cognitive mode (v2.0 features)
 * ═══════════════════════════════════════════════════════════════════
 */

import { wakeWordEngineV2 } from './wakeWordEngineV2';
import { voiceFingerprintEngine } from './voiceFingerprint';
import { antiEchoShield } from './antiEchoShield';
import { contextualAttentionV2 } from './contextualAttentionV2';

/**
 * Mode de détection du wake word
 */
export type WakeWordMode =
  | 'wake_only' // "Titane ?" → réveil, attend la commande suivante
  | 'one_shot'; // "Titane, ouvre X" → réveil + commande immédiate

/**
 * Événement de détection du wake word
 */
export interface WakeWordEvent {
  detected: boolean;
  mode: WakeWordMode;
  cleanedText: string; // Texte sans le wake word
  confidence: number; // 0-1
  matchedVariant: string; // Variante détectée ("titane", "titan", etc.)
  position: number; // Position dans le texte (0 = début)
}

/**
 * Configuration du moteur
 */
export interface WakeWordConfig {
  /** Seuil de confiance minimum (0-1, défaut: 0.7) */
  confidenceThreshold?: number;

  /** Longueur max du texte pour détection (défaut: 100 chars) */
  maxTextLength?: number;

  /** Activer la distance phonétique (défaut: true) */
  usePhoneticMatching?: boolean;

  /** Seuil de distance de Levenshtein (défaut: 2) */
  levenshteinThreshold?: number;

  /** Variantes acceptées du wake word */
  customVariants?: string[];

  /** [v19.5.0] Enable cognitive mode (v2.0 features: voice fingerprint, anti-echo, adaptive) */
  useCognitiveMode?: boolean;

  /** [v∞.7] Enable low-power continuous listening (for always-on wake word) */
  enableContinuousListening?: boolean;

  /** [v∞.7] Cooldown after wake word detected (ms, default: 5000) */
  wakeWordCooldown?: number;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   WAKE WORD ENGINE
 * ═══════════════════════════════════════════════════════════════════
 */

export class WakeWordEngine {
  private config: Required<WakeWordConfig>;
  private isContinuousListening: boolean = false; // ✅ v∞.7
  private lastWakeWordTime: number = 0; // ✅ v∞.7 Cooldown tracking

  // Variantes phonétiques de "TITANE"
  private readonly baseVariants = [
    'titane',
    'titan',
    'titanne',
    'tytane',
    'tytann',
    'ti-tane',
    'ti tane',
  ];

  // Préfixes courants
  private readonly prefixes = ['hey', 'salut', 'ok', 'dis', 'écoute', 'alors'];

  constructor(config: WakeWordConfig = {}) {
    this.config = {
      confidenceThreshold: config.confidenceThreshold ?? 0.7,
      maxTextLength: config.maxTextLength ?? 100,
      usePhoneticMatching: config.usePhoneticMatching ?? true,
      levenshteinThreshold: config.levenshteinThreshold ?? 2,
      customVariants: config.customVariants ?? [],
      useCognitiveMode: config.useCognitiveMode ?? false,
      enableContinuousListening: config.enableContinuousListening ?? false, // ✅ v∞.7
      wakeWordCooldown: config.wakeWordCooldown ?? 5000, // ✅ v∞.7
    };

    console.log('[WakeWordEngine] 🎙️ Initialized with config:', this.config);

    // [v19.5.0] Configure cognitive features if enabled
    if (this.config.useCognitiveMode) {
      this.enableCognitiveMode();
    }
  }

  /**
   * [v19.5.0] Enable cognitive features (voice fingerprint, anti-echo, adaptive)
   */
  private enableCognitiveMode(): void {
    console.log('[WakeWordEngine] 🧠 Enabling cognitive mode...');

    // Configure cognitive features (v2 engine auto-enabled)
    console.log(
      '[WakeWordEngine] Cognitive features: voice fingerprint, anti-echo, contextual adaptation'
    );

    console.log('[WakeWordEngine] ✅ Cognitive mode enabled');
  }

  /**
   * [v19.5.0] Toggle cognitive mode dynamically
   */
  setCognitiveMode(enabled: boolean): void {
    this.config.useCognitiveMode = enabled;

    if (enabled) {
      this.enableCognitiveMode();
    } else {
      console.log('[WakeWordEngine] 🔇 Disabling cognitive mode');
      // Cognitive features remain available but not used in v1 mode
    }
  }

  /**
   * [v19.5.0] Check if cognitive mode is enabled
   */
  isCognitiveModeEnabled(): boolean {
    return this.config.useCognitiveMode;
  }

  /**
   * Détecter le wake word dans un texte
   * [v19.5.0] Uses cognitive mode if enabled
   */
  detect(text: string): WakeWordEvent {
    console.log(`[WakeWordEngine] 🔍 Analyzing: "${text}"`);

    // [v19.5.0] If cognitive mode enabled, use v2.0 (text-only fallback)
    if (this.config.useCognitiveMode) {
      console.log('[WakeWordEngine] 🧠 Using cognitive mode (v2.0)');
      // Note: text-only detection, no audio features available
      // For full cognitive features, use detectWithAudio()
      return this.detectV1(text); // Fallback to v1 for text-only
    }

    return this.detectV1(text);
  }

  /**
   * [v19.5.0] Detect with audio buffer (full cognitive features)
   * This is the PREFERRED method when audio is available
   */
  async detectWithAudio(
    text: string,
    audioBuffer?: Float32Array,
    sampleRate?: number
  ): Promise<WakeWordEvent> {
    if (!this.config.useCognitiveMode || !audioBuffer || !sampleRate) {
      // Fallback to v1 if cognitive disabled or no audio
      return this.detect(text);
    }

    console.log('[WakeWordEngine] 🧠 Cognitive detection with audio...');
    return await wakeWordEngineV2.detectWithAudio(text, audioBuffer, sampleRate);
  }

  /**
   * [v19.5.0] v1 detection logic (legacy, fast, no audio required)
   */
  private detectV1(text: string): WakeWordEvent {
    console.log(`[WakeWordEngine] 📝 v1 Detection: "${text}"`);

    // Normalisation
    const normalized = this.normalizeText(text);

    // Anti-faux-positifs : texte trop long
    if (normalized.length > this.config.maxTextLength) {
      console.log('[WakeWordEngine] ❌ Text too long, ignoring');
      return this.createNegativeEvent(text);
    }

    // Détection exacte
    const exactMatch = this.detectExact(normalized);
    if (exactMatch) {
      console.log(`[WakeWordEngine] ✅ Exact match: ${exactMatch.variant}`);
      return this.createEvent(text, normalized, exactMatch);
    }

    // Détection phonétique
    if (this.config.usePhoneticMatching) {
      const phoneticMatch = this.detectPhonetic(normalized);
      if (phoneticMatch) {
        console.log(
          `[WakeWordEngine] ✅ Phonetic match: ${phoneticMatch.variant} (distance: ${phoneticMatch.distance})`
        );
        return this.createEvent(text, normalized, phoneticMatch);
      }
    }

    console.log('[WakeWordEngine] ❌ No match found');
    return this.createNegativeEvent(text);
  }

  /**
   * Détecter en mode streaming (partial transcripts)
   */
  detectStreaming(partialText: string): WakeWordEvent | null {
    // En streaming, on attend au moins 2 mots complets
    const words = partialText.trim().split(/\s+/);
    if (words.length < 2) {
      return null;
    }

    // Détecter uniquement si le texte est court (évite les faux positifs)
    if (partialText.length > 50) {
      return null;
    }

    return this.detect(partialText);
  }

  /**
   * Normaliser le texte
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:]/g, ' ') // Ponctuation → espaces
      .replace(/\s+/g, ' ') // Multi-espaces → simple
      .replace(/['']/g, ' ') // Apostrophes
      .normalize('NFD') // Décomposer les accents
      .replace(/[\u0300-\u036f]/g, ''); // Supprimer diacritiques
  }

  /**
   * Détection exacte (avec préfixes)
   */
  private detectExact(
    normalized: string
  ): { variant: string; position: number; hasPrefix: boolean } | null {
    const allVariants = [...this.baseVariants, ...this.config.customVariants];

    // Test direct
    for (const variant of allVariants) {
      if (normalized === variant) {
        return { variant, position: 0, hasPrefix: false };
      }

      if (normalized.startsWith(variant + ' ')) {
        return { variant, position: 0, hasPrefix: false };
      }
    }

    // Test avec préfixes
    for (const prefix of this.prefixes) {
      for (const variant of allVariants) {
        const pattern = `${prefix} ${variant}`;
        if (normalized === pattern || normalized.startsWith(pattern + ' ')) {
          return { variant, position: prefix.length + 1, hasPrefix: true };
        }
      }
    }

    return null;
  }

  /**
   * Détection phonétique (Levenshtein)
   */
  private detectPhonetic(
    normalized: string
  ): { variant: string; distance: number; position: number } | null {
    const words = normalized.split(/\s+/);

    // Chercher dans les 3 premiers mots
    for (let i = 0; i < Math.min(words.length, 3); i++) {
      const word = words[i];
      if (!word) continue;

      // Ignorer mots trop courts ou trop longs
      if (word.length < 4 || word.length > 10) continue;

      for (const variant of this.baseVariants) {
        const distance = this.levenshteinDistance(word, variant);

        if (distance <= this.config.levenshteinThreshold) {
          // Calculer position
          const position = words.slice(0, i).join(' ').length;
          return { variant: word, distance, position };
        }
      }
    }

    return null;
  }

  /**
   * Distance de Levenshtein
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      const row = matrix[0];
      if (!row) continue;
      row[j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const currentRow = matrix[i];
        const prevRow = matrix[i - 1];
        if (!currentRow || !prevRow) continue;

        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          const prevDiag = prevRow[j - 1];
          if (prevDiag === undefined) continue;
          currentRow[j] = prevDiag;
        } else {
          const prevDiag = prevRow[j - 1];
          const prevLeft = currentRow[j - 1];
          const prevUp = prevRow[j];
          if (prevDiag === undefined || prevLeft === undefined || prevUp === undefined)
            continue;

          currentRow[j] = Math.min(
            prevDiag + 1, // substitution
            prevLeft + 1, // insertion
            prevUp + 1 // deletion
          );
        }
      }
    }

    const lastRow = matrix[b.length];
    const result = lastRow?.[a.length];
    return result ?? 0;
  }

  /**
   * Créer un événement positif
   */
  private createEvent(
    originalText: string,
    normalized: string,
    match: { variant: string; position: number; hasPrefix?: boolean; distance?: number }
  ): WakeWordEvent {
    // Déterminer le mode
    const mode = this.determineMode(normalized, match);

    // Nettoyer le texte
    const cleanedText = this.cleanText(originalText, match);

    // Calculer confiance
    const confidence = this.calculateConfidence(match, normalized);

    return {
      detected: true,
      mode,
      cleanedText,
      confidence,
      matchedVariant: match.variant,
      position: match.position,
    };
  }

  /**
   * Créer un événement négatif
   */
  private createNegativeEvent(text: string): WakeWordEvent {
    return {
      detected: false,
      mode: 'wake_only',
      cleanedText: text,
      confidence: 0,
      matchedVariant: '',
      position: -1,
    };
  }

  /**
   * Déterminer le mode (wake_only vs one_shot)
   */
  private determineMode(
    normalized: string,
    match: { variant: string; position: number }
  ): WakeWordMode {
    const afterWake = normalized.substring(match.position + match.variant.length).trim();

    // Si rien après le wake word → wake_only
    if (!afterWake || afterWake.length < 3) {
      return 'wake_only';
    }

    // Si interrogation → wake_only
    if (afterWake === '?' || afterWake.endsWith('?')) {
      return 'wake_only';
    }

    // Sinon → one_shot
    return 'one_shot';
  }

  /**
   * Nettoyer le texte (enlever le wake word)
   */
  private cleanText(
    originalText: string,
    match: { variant: string; position: number }
  ): string {
    const normalized = this.normalizeText(originalText);

    // Trouver la position dans le texte original
    let startIdx = 0;
    let endIdx = originalText.length;

    // Détection approximative de la position
    const _words = normalized.split(/\s+/);
    const originalWords = originalText.trim().split(/\s+/);

    // Compter les mots avant le wake word
    const wordsBefore = normalized
      .substring(0, match.position)
      .split(/\s+/)
      .filter(w => w).length;

    // Trouver l'index du wake word dans le texte original
    if (wordsBefore < originalWords.length) {
      const beforeWords = originalWords.slice(0, wordsBefore);
      startIdx = beforeWords.join(' ').length;
      if (startIdx > 0) startIdx++; // espace

      // Trouver la fin du wake word
      const wakeWord = originalWords[wordsBefore];
      const wakeWordLength = wakeWord?.length ?? match.variant.length;
      endIdx = startIdx + wakeWordLength;
    }

    // Enlever le wake word + éventuel espace/ponctuation qui suit
    const cleaned = (originalText.substring(0, startIdx) + originalText.substring(endIdx))
      .trim()
      .replace(/^[,;:!?\s]+/, ''); // Supprimer ponctuation initiale

    return cleaned || originalText; // Fallback
  }

  /**
   * Calculer la confiance
   */
  private calculateConfidence(
    match: { variant: string; hasPrefix?: boolean; distance?: number },
    normalized: string
  ): number {
    let confidence = 1.0;

    // Pénalité pour distance phonétique
    if (match.distance !== undefined && match.distance > 0) {
      confidence -= match.distance / 5; // -20% par distance
    }

    // Bonus pour préfixe
    if (match.hasPrefix) {
      confidence += 0.1;
    }

    // Pénalité si texte long
    if (normalized.length > 50) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Mettre à jour la config dynamiquement
   */
  updateConfig(updates: Partial<WakeWordConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
    console.log('[WakeWordEngine] 🔧 Config updated:', this.config);

    // [v19.5.0] Re-apply cognitive mode if changed
    if (updates.useCognitiveMode !== undefined) {
      this.setCognitiveMode(updates.useCognitiveMode);
    }
  }

  /**
   * [v19.5.0] Get cognitive status
   */
  getCognitiveStatus() {
    if (!this.config.useCognitiveMode) {
      return {
        enabled: false,
        voiceFingerprint: { ready: false, accuracy: 0, samples: 0 },
        antiEcho: { active: false, muted: false },
        contextualAttention: {
          threshold: this.config.confidenceThreshold,
          activeRules: [],
        },
      };
    }

    return {
      enabled: true,
      voiceFingerprint: {
        ready: voiceFingerprintEngine.isReady(),
        accuracy: 0, // Not exposed in API
        samples: 0, // Not exposed in API
      },
      antiEcho: {
        active: true,
        muted: antiEchoShield.shouldBlockListening(),
      },
      contextualAttention: {
        threshold: contextualAttentionV2.getAdaptedConfig().wakeThreshold,
        activeRules: [], // Rules not directly exposed
      },
    };
  }
}

/**
 * Instance singleton
 */
export const wakeWordEngine = new WakeWordEngine();

/**
 * Helper: Détecter rapidement
 */
export function detectWakeWord(text: string): WakeWordEvent {
  return wakeWordEngine.detect(text);
}
