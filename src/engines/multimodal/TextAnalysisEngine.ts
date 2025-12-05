/**
 * TITANE∞ vΩ∞ — TEXT ANALYSIS ENGINE
 * OPUS v∞.3: Analyse des features textuelles
 *
 * Extrait les caractéristiques textuelles des messages chat :
 * - Longueur, structure, cadence
 * - Marqueurs d'énergie, fatigue, stress
 * - Ponctuation, style d'écriture
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES:
 * - Indices uniquement, pas de diagnostic
 * - Aucune interprétation clinique
 * - 100% local
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  TextFeatures,
  TextScores,
  TextState,
  NormalizedScore,
  ModalityLevel,
  SelfDeclaration,
  BaselineTextProfile,
} from '@/types/multimodalFusion';

import {
  getDefaultBaselineTextProfile,
} from '@/types/multimodalFusion';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const TEXT_ANALYSIS_CONFIG = {
  // Fenêtre d'analyse
  cadenceWindowMs: 60000, // 1 minute
  minCharsForAnalysis: 3,

  // EMA
  emaAlpha: 0.2,

  // Seuils de niveau
  lowThreshold: 0.35,
  highThreshold: 0.65,
};

// ============================================================================
// MOTS-CLÉS ÉNERGÉTIQUES (FR + EN)
// ============================================================================

const HIGH_INTENSITY_WORDS = new Set([
  // Français
  'génial', 'super', 'incroyable', 'extraordinaire', 'excellent', 'parfait',
  'fantastique', 'magnifique', 'formidable', 'exceptionnel', 'urgent',
  'important', 'critique', 'vital', 'essentiel', 'absolument', 'totalement',
  'complètement', 'vraiment', 'énorme', 'immense', 'terrible', 'horrible',
  'catastrophe', 'désastre', 'wow', 'ouah', 'bravo', 'yes', 'hourra',
  // English
  'amazing', 'awesome', 'incredible', 'fantastic', 'perfect', 'excellent',
  'brilliant', 'wonderful', 'magnificent', 'outstanding', 'urgent',
  'critical', 'essential', 'absolutely', 'totally', 'completely',
  'really', 'huge', 'massive', 'terrible', 'horrible', 'disaster', 'wow'
]);

const FATIGUE_WORDS = new Set([
  // Français
  'fatigué', 'fatiguée', 'épuisé', 'épuisée', 'crevé', 'crevée',
  'exténué', 'exténuée', 'las', 'lasse', 'éreinté', 'éreintée',
  'claqué', 'claquée', 'ko', 'vidé', 'vidée', 'dormir', 'sommeil',
  // English
  'tired', 'exhausted', 'drained', 'worn', 'sleepy', 'sleep', 'rest'
]);

const STRESS_WORDS = new Set([
  // Français
  'stressé', 'stressée', 'anxieux', 'anxieuse', 'débordé', 'débordée',
  'submergé', 'submergée', 'pressé', 'pressée', 'deadline', 'urgence',
  'panique', 'paniqué', 'overwhelmed', 'inquiet', 'inquiète',
  // English
  'stressed', 'anxious', 'overwhelmed', 'worried', 'panic', 'deadline'
]);

const POSITIVE_WORDS = new Set([
  // Français
  'bien', 'bon', 'bonne', 'super', 'génial', 'excellent', 'parfait',
  'content', 'contente', 'heureux', 'heureuse', 'merci', 'bravo', 'top',
  // English
  'good', 'great', 'happy', 'thanks', 'perfect', 'love', 'like', 'yes'
]);

const NEGATIVE_WORDS = new Set([
  // Français
  'mal', 'mauvais', 'nul', 'horrible', 'terrible', 'problème', 'erreur',
  'bug', 'triste', 'déçu', 'déçue', 'merde', 'chiant', 'pénible',
  // English
  'bad', 'wrong', 'error', 'problem', 'hate', 'sad', 'angry', 'no'
]);

// ============================================================================
// TEXT ANALYSIS ENGINE
// ============================================================================

/**
 * Moteur singleton d'analyse textuelle
 */
class TextAnalysisEngine {
  private static instance: TextAnalysisEngine | null = null;

  // État
  private isAnalyzing: boolean = false;
  private baseline: BaselineTextProfile;
  private lastFeatures: TextFeatures | null = null;
  private lastState: TextState | null = null;

  // Historique
  private messageHistory: { text: string; timestamp: number; features: TextFeatures }[] = [];
  private messageTimestamps: number[] = [];

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  private constructor() {
    this.baseline = getDefaultBaselineTextProfile();
  }

  public static getInstance(): TextAnalysisEngine {
    if (!TextAnalysisEngine.instance) {
      TextAnalysisEngine.instance = new TextAnalysisEngine();
    }
    return TextAnalysisEngine.instance;
  }

  public static resetInstance(): void {
    TextAnalysisEngine.instance = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE
  // ═══════════════════════════════════════════════════════════════════════

  public startAnalysis(): void {
    this.isAnalyzing = true;
    console.log('[TextAnalysisEngine] Analyse démarrée');
  }

  public stopAnalysis(): void {
    this.isAnalyzing = false;
    console.log('[TextAnalysisEngine] Analyse arrêtée');
  }

  public isActive(): boolean {
    return this.isAnalyzing;
  }

  /**
   * Analyse un message texte et retourne les features extraites
   */
  public analyzeText(text: string): TextFeatures | null {
    if (!this.isAnalyzing) {
      console.warn('[TextAnalysisEngine] Analyse non démarrée');
      return null;
    }

    if (!text || text.length < TEXT_ANALYSIS_CONFIG.minCharsForAnalysis) {
      return null;
    }

    const timestamp = Date.now();
    const features = this.extractFeatures(text, timestamp);

    // Enregistrer dans l'historique
    this.messageHistory.push({ text, timestamp, features });
    this.messageTimestamps.push(timestamp);

    // Nettoyer l'historique ancien
    this.pruneHistory();

    // Lisser avec EMA si précédent existe
    if (this.lastFeatures) {
      this.lastFeatures = this.applyEMA(this.lastFeatures, features);
    } else {
      this.lastFeatures = features;
    }

    // Mettre à jour l'état
    this.lastState = this.computeState(this.lastFeatures);

    return this.lastFeatures;
  }

  public getLastFeatures(): TextFeatures | null {
    return this.lastFeatures;
  }

  public getLastState(): TextState | null {
    return this.lastState;
  }

  public getBaseline(): BaselineTextProfile {
    return { ...this.baseline };
  }

  public updateBaseline(profile: Partial<BaselineTextProfile>): void {
    this.baseline = {
      ...this.baseline,
      ...profile,
      lastUpdated: Date.now()
    };
  }

  public resetBaseline(): void {
    this.baseline = getDefaultBaselineTextProfile();
    this.lastFeatures = null;
    this.lastState = null;
  }

  public clearHistory(): void {
    this.messageHistory = [];
    this.messageTimestamps = [];
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTRACTION DES FEATURES
  // ═══════════════════════════════════════════════════════════════════════

  private extractFeatures(text: string, timestamp: number): TextFeatures {
    const words = this.tokenize(text);
    const sentences = this.splitSentences(text);

    // Comptages de base
    const messageLength = text.length;
    const wordCount = words.length;
    const sentenceCount = Math.max(1, sentences.length);
    const avgWordLength = wordCount > 0
      ? words.reduce((sum, w) => sum + w.length, 0) / wordCount
      : 0;

    // Timing (simplifié - typingSpeed estimé)
    const responseDelay = this.estimateResponseDelay(timestamp);
    const typingSpeed = this.estimateTypingSpeed(messageLength, timestamp);

    // Ponctuation
    const punctuationDensity = this.countPunctuation(text) / messageLength;
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const ellipsisCount = (text.match(/\.{3,}/g) || []).length;
    const capsRatio = this.calculateCapsRatio(text);

    // Marqueurs
    const lowerWords = words.map(w => w.toLowerCase());
    const intensityMarkers = lowerWords.filter(w => HIGH_INTENSITY_WORDS.has(w)).length;
    const fatigueMarkers = lowerWords.filter(w => FATIGUE_WORDS.has(w)).length;
    const stressMarkers = lowerWords.filter(w => STRESS_WORDS.has(w)).length;
    const positiveMarkers = lowerWords.filter(w => POSITIVE_WORDS.has(w)).length;
    const negativeMarkers = lowerWords.filter(w => NEGATIVE_WORDS.has(w)).length;

    // Auto-déclarations
    const selfDeclarations = this.detectSelfDeclarations(text, lowerWords);

    // Confiance
    const confidence = this.computeConfidence(text, wordCount);

    return {
      messageLength,
      wordCount,
      sentenceCount,
      avgWordLength,
      responseDelay,
      typingSpeed,
      punctuationDensity,
      exclamationCount,
      questionCount,
      ellipsisCount,
      capsRatio,
      intensityMarkers,
      fatigueMarkers,
      stressMarkers,
      positiveMarkers,
      negativeMarkers,
      selfDeclarations,
      confidence,
      timestamp
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CALCUL DE L'ÉTAT
  // ═══════════════════════════════════════════════════════════════════════

  private computeState(features: TextFeatures): TextState {
    const scores = this.computeScores(features);

    return {
      features,
      scores,
      energyLevel: this.toLevel(scores.t_energy.value),
      chargeLevel: this.toLevel(scores.t_charge.value),
      engagementLevel: this.toLevel(scores.t_engagement_verbal.value),
      clarityLevel: this.toLevel(scores.t_clarity.value),
      confidence: features.confidence,
      timestamp: features.timestamp
    };
  }

  private computeScores(features: TextFeatures): TextScores {
    const now = Date.now();

    // Énergie textuelle (basée sur intensité, ponctuation, majuscules)
    let energyValue = 0.5;
    energyValue += features.intensityMarkers * 0.1;
    energyValue += features.exclamationCount * 0.08;
    energyValue += features.capsRatio * 0.3;
    energyValue -= features.fatigueMarkers * 0.15;
    energyValue = this.clamp(energyValue, 0, 1);

    // Charge mentale (stress, longueur, complexité)
    let chargeValue = 0.3;
    chargeValue += features.stressMarkers * 0.2;
    chargeValue += Math.min(features.wordCount / 100, 0.3);
    chargeValue += features.ellipsisCount * 0.1;
    chargeValue = this.clamp(chargeValue, 0, 1);

    // Engagement verbal
    let engagementValue = 0.5;
    engagementValue += Math.min(features.wordCount / 50, 0.3);
    engagementValue += features.questionCount * 0.1;
    engagementValue += features.exclamationCount * 0.05;
    engagementValue = this.clamp(engagementValue, 0, 1);

    // Clarté (inverse de l'ambiguïté)
    let clarityValue = 0.6;
    clarityValue -= features.ellipsisCount * 0.1;
    clarityValue -= Math.max(0, (features.avgWordLength - 6) * 0.05);
    clarityValue += Math.min(features.sentenceCount / features.wordCount * 10, 0.2);
    clarityValue = this.clamp(clarityValue, 0, 1);

    // Ambiguïté (inverse de clarité)
    const ambiguityValue = 1 - clarityValue;

    return {
      t_energy: this.createNormalizedScore(energyValue, features.confidence, now),
      t_charge: this.createNormalizedScore(chargeValue, features.confidence, now),
      t_engagement_verbal: this.createNormalizedScore(engagementValue, features.confidence, now),
      t_ambiguity: this.createNormalizedScore(ambiguityValue, features.confidence, now),
      t_clarity: this.createNormalizedScore(clarityValue, features.confidence, now)
    };
  }

  private createNormalizedScore(value: number, confidence: number, timestamp: number): NormalizedScore {
    return {
      value,
      confidence,
      variance: 0,
      origin: 'text',
      timestamp
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  private tokenize(text: string): string[] {
    return text
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  private splitSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 0);
  }

  private countPunctuation(text: string): number {
    return (text.match(/[.,!?;:'"()-]/g) || []).length;
  }

  private calculateCapsRatio(text: string): number {
    const letters = text.replace(/[^a-zA-Z]/g, '');
    if (letters.length === 0) return 0;
    const caps = (letters.match(/[A-Z]/g) || []).length;
    return caps / letters.length;
  }

  private estimateResponseDelay(currentTimestamp: number): number {
    if (this.messageTimestamps.length === 0) return 0;
    const lastTs = this.messageTimestamps[this.messageTimestamps.length - 1];
    return currentTimestamp - lastTs;
  }

  private estimateTypingSpeed(length: number, _timestamp: number): number {
    // Estimation simplifiée basée sur la longueur
    // Vitesse de frappe moyenne ~40 WPM = ~200 CPM
    // On normalise entre 0 et 1
    const avgSpeed = 200; // caractères par minute
    const estimatedTime = length / avgSpeed;
    return this.clamp(estimatedTime, 0, 1);
  }

  private detectSelfDeclarations(text: string, words: string[]): SelfDeclaration[] {
    const declarations: SelfDeclaration[] = [];
    const lowerText = text.toLowerCase();

    // Patterns d'auto-déclaration
    const patterns: { pattern: RegExp; type: SelfDeclaration['type'] }[] = [
      { pattern: /je\s+(suis|me\s+sens)\s+(fatigué|épuisé|crevé)/i, type: 'fatigue' },
      { pattern: /je\s+(suis|me\s+sens)\s+(stressé|anxieux|débordé)/i, type: 'stress' },
      { pattern: /j['']?ai\s+(beaucoup\s+de\s+)?travail/i, type: 'workload' },
      { pattern: /je\s+(suis|me\s+sens)\s+(bien|content|heureux|motivé)/i, type: 'mood' },
      { pattern: /j['']?ai\s+(de\s+l[''])?énergie/i, type: 'energy' },
      { pattern: /i['']?m\s+(tired|exhausted)/i, type: 'fatigue' },
      { pattern: /i['']?m\s+(stressed|anxious|overwhelmed)/i, type: 'stress' },
      { pattern: /i['']?m\s+(happy|good|great|fine)/i, type: 'mood' },
    ];

    for (const { pattern, type } of patterns) {
      const match = lowerText.match(pattern);
      if (match) {
        declarations.push({
          type,
          text: match[0],
          confidence: 0.8
        });
      }
    }

    // Détection simple par mots-clés
    if (words.some(w => FATIGUE_WORDS.has(w))) {
      declarations.push({ type: 'fatigue', text: 'fatigue keyword', confidence: 0.5 });
    }
    if (words.some(w => STRESS_WORDS.has(w))) {
      declarations.push({ type: 'stress', text: 'stress keyword', confidence: 0.5 });
    }

    return declarations;
  }

  private computeConfidence(text: string, wordCount: number): number {
    let confidence = 0.5;

    // Plus de mots = plus de confiance
    if (wordCount < 3) confidence -= 0.3;
    else if (wordCount > 10) confidence += 0.2;
    else if (wordCount > 30) confidence += 0.3;

    // Présence de structure
    if (/[.!?]/.test(text)) confidence += 0.1;

    return this.clamp(confidence, 0, 1);
  }

  private applyEMA(previous: TextFeatures, current: TextFeatures): TextFeatures {
    // Pour les features textuelles, on ne lisse que certains champs numériques
    // Les comptages restent tels quels
    return {
      ...current,
      // Les comptages directs ne sont pas lissés
    };
  }

  private pruneHistory(): void {
    const maxAge = TEXT_ANALYSIS_CONFIG.cadenceWindowMs * 5;
    const cutoff = Date.now() - maxAge;

    this.messageHistory = this.messageHistory.filter(m => m.timestamp >= cutoff);
    this.messageTimestamps = this.messageTimestamps.filter(t => t >= cutoff);

    // Limiter aussi le nombre max
    const maxMessages = 100;
    if (this.messageHistory.length > maxMessages) {
      this.messageHistory = this.messageHistory.slice(-maxMessages);
      this.messageTimestamps = this.messageTimestamps.slice(-maxMessages);
    }
  }

  private toLevel(value: number): ModalityLevel {
    if (value < TEXT_ANALYSIS_CONFIG.lowThreshold) return 'low';
    if (value > TEXT_ANALYSIS_CONFIG.highThreshold) return 'high';
    return 'medium';
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export { TextAnalysisEngine };
export default TextAnalysisEngine;
