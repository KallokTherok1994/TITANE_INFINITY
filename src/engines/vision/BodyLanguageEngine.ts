/**
 * TITANE∞ vΩ∞ — BODY LANGUAGE ENGINE
 * Super Prompt #9: Extraction landmarks + calcul scores langage corporel
 *
 * Responsabilités:
 * - Intégration MediaPipe Holistic
 * - Extraction des 540+ landmarks
 * - Calcul des scores : posture, mouvement, regard
 *
 * ⚠️ AVERTISSEMENT:
 * Ces scores sont des APPROXIMATIONS basées sur des heuristiques.
 * Ils ne représentent PAS une vérité sur l'état interne de l'utilisateur.
 * Biais potentiels : couleur de peau, genre, âge, culture, éclairage.
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  BodyLanguageState,
  HolisticLandmarks,
  NormalizedLandmark,
} from '@/types/visionAffect';

import { getDefaultBodyLanguageState } from '@/types/visionAffect';

import {
  POSE_LANDMARKS,
  CONFIDENCE_CONFIG,
  MEDIAPIPE_CONFIG,
} from '@/config/visionAffect.config';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface LandmarkBuffer {
  landmarks: HolisticLandmarks[];
  maxSize: number;
}

type BodyLanguageStateUpdater = (state: Partial<BodyLanguageState>) => void;

/**
 * Interface pour les résultats MediaPipe Holistic
 * (type externe non fourni par MediaPipe)
 */
interface MediaPipeHolisticResults {
  poseLandmarks?: NormalizedLandmark[];
  faceLandmarks?: NormalizedLandmark[];
  leftHandLandmarks?: NormalizedLandmark[];
  rightHandLandmarks?: NormalizedLandmark[];
}

/**
 * Interface pour l'instance MediaPipe Holistic
 * (types non officiels - approximation)
 */
interface MediaPipeHolistic {
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (callback: (results: MediaPipeHolisticResults) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close: () => void;
}

/**
 * Constructeur MediaPipe Holistic (global window)
 */
interface MediaPipeHolisticConstructor {
  new (config: { locateFile: (file: string) => string }): MediaPipeHolistic;
}

// Déclaration globale pour window.Holistic
declare global {
  interface Window {
    Holistic?: MediaPipeHolisticConstructor;
  }
}

// ============================================================================
// BODY LANGUAGE ENGINE CLASS
// ============================================================================

/**
 * BodyLanguageEngine v∞
 *
 * Analyse le langage corporel via MediaPipe Holistic.
 *
 * ⚠️ Les scores produits sont des estimations approximatives.
 * Ne pas les utiliser pour des décisions critiques.
 */
export class BodyLanguageEngine {
  private static instance: BodyLanguageEngine | null = null;

  // État
  private state: BodyLanguageState;
  private isInitialized: boolean = false;
  private isProcessing: boolean = false;

  // MediaPipe
  private holistic: MediaPipeHolistic | null = null;
  private camera: unknown = null;

  // Buffer pour calculs temporels
  private landmarkBuffer: LandmarkBuffer = {
    landmarks: [],
    maxSize: 30, // 2 secondes à 15 FPS
  };

  // Callbacks
  private stateUpdater: BodyLanguageStateUpdater | null = null;

  private constructor() {
    this.state = getDefaultBodyLanguageState();
  }

  /**
   * Singleton pattern
   */
  static getInstance(): BodyLanguageEngine {
    if (!BodyLanguageEngine.instance) {
      BodyLanguageEngine.instance = new BodyLanguageEngine();
    }
    return BodyLanguageEngine.instance;
  }

  /**
   * Réinitialise l'instance
   */
  static resetInstance(): void {
    if (BodyLanguageEngine.instance) {
      BodyLanguageEngine.instance.cleanup();
      BodyLanguageEngine.instance = null;
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialise MediaPipe Holistic
   *
   * Note: MediaPipe doit être chargé via CDN ou bundle
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Vérifier si MediaPipe est disponible
      const Holistic = window.Holistic;

      if (!Holistic) {
        console.warn(
          '[BodyLanguageEngine] MediaPipe Holistic not loaded. Loading from CDN...'
        );

        // Charger dynamiquement MediaPipe
        await this.loadMediaPipeScript();

        if (!window.Holistic) {
          throw new Error('Failed to load MediaPipe Holistic');
        }
      }

      // Créer l'instance Holistic
      const HolisticClass = window.Holistic;
      if (!HolisticClass) {
        throw new Error('Holistic not available');
      }
      this.holistic = new HolisticClass({
        locateFile: MEDIAPIPE_CONFIG.locateFile,
      });

      // Configurer
      this.holistic.setOptions({
        modelComplexity: MEDIAPIPE_CONFIG.modelComplexity,
        smoothLandmarks: MEDIAPIPE_CONFIG.smoothLandmarks,
        enableSegmentation: MEDIAPIPE_CONFIG.enableSegmentation,
        refineFaceLandmarks: MEDIAPIPE_CONFIG.refineFaceLandmarks,
        minDetectionConfidence: MEDIAPIPE_CONFIG.minDetectionConfidence,
        minTrackingConfidence: MEDIAPIPE_CONFIG.minTrackingConfidence,
      });

      // Callback sur résultats
      this.holistic.onResults((results: MediaPipeHolisticResults) => {
        this.processResults(results);
      });

      this.isInitialized = true;
      console.log('[BodyLanguageEngine] MediaPipe Holistic initialized');
      return true;
    } catch (error) {
      console.error('[BodyLanguageEngine] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Charge le script MediaPipe dynamiquement
   */
  private loadMediaPipeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Vérifier si déjà chargé
      if (window.Holistic) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js';
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        console.log('[BodyLanguageEngine] MediaPipe script loaded');
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load MediaPipe Holistic script'));
      };

      document.head.appendChild(script);
    });
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Configure le callback de mise à jour d'état
   */
  setStateUpdater(updater: BodyLanguageStateUpdater): void {
    this.stateUpdater = updater;
  }

  // ============================================================================
  // PROCESSING
  // ============================================================================

  /**
   * Traite une frame vidéo
   */
  async processFrame(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.isInitialized || this.isProcessing || !this.holistic) {
      return;
    }

    this.isProcessing = true;

    try {
      await this.holistic.send({ image: videoElement });
    } catch (error) {
      console.error('[BodyLanguageEngine] Frame processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Traite les résultats MediaPipe
   */
  private processResults(results: MediaPipeHolisticResults): void {
    const timestamp = Date.now();

    // Extraire les landmarks
    const landmarks: HolisticLandmarks = {
      pose: results.poseLandmarks,
      face: results.faceLandmarks,
      leftHand: results.leftHandLandmarks,
      rightHand: results.rightHandLandmarks,
      timestamp,
    };

    // Ajouter au buffer
    this.addToBuffer(landmarks);

    // Vérifier si landmarks détectés
    const landmarksDetected = !!(landmarks.pose && landmarks.pose.length > 0);

    if (!landmarksDetected) {
      this.updateState({
        landmarksDetected: false,
        confidence: 0,
        lastUpdateTimestamp: timestamp,
      });
      return;
    }

    // Calculer les scores
    const postureScore = this.computePostureScore(landmarks);
    const movementScore = this.computeMovementScore(landmarks);
    const gazeStabilityScore = this.computeGazeStabilityScore(landmarks);
    const shoulderSymmetry = this.computeShoulderSymmetry(landmarks);
    const headTilt = this.computeHeadTilt(landmarks);
    const facialActivity = this.computeFacialActivity(landmarks);
    const confidence = this.computeConfidence(landmarks);

    // Mettre à jour l'état
    this.updateState({
      postureScore,
      movementScore,
      gazeStabilityScore,
      shoulderSymmetry,
      headTilt,
      facialActivity,
      confidence,
      landmarksDetected: true,
      lastUpdateTimestamp: timestamp,
    });
  }

  // ============================================================================
  // SCORE COMPUTATIONS
  // ============================================================================

  /**
   * Calcule le score de posture (0-1)
   *
   * Heuristique: Compare la position des épaules et de la tête
   * pour estimer si la posture est "ouverte/droite" vs "affaissée/fermée"
   *
   * ⚠️ APPROXIMATION: Ne représente pas l'état réel de l'utilisateur
   */
  private computePostureScore(landmarks: HolisticLandmarks): number {
    if (!landmarks.pose || landmarks.pose.length < 25) {
      return 0.5; // Valeur neutre par défaut
    }

    const pose = landmarks.pose;

    try {
      // Récupérer les points clés
      const nose = pose[POSE_LANDMARKS.NOSE];
      const leftShoulder = pose[POSE_LANDMARKS.LEFT_SHOULDER];
      const rightShoulder = pose[POSE_LANDMARKS.RIGHT_SHOULDER];
      const leftHip = pose[POSE_LANDMARKS.LEFT_HIP];
      const rightHip = pose[POSE_LANDMARKS.RIGHT_HIP];

      if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) {
        return 0.5;
      }

      // Calculer la hauteur relative de la tête par rapport aux épaules
      // Plus la tête est haute, meilleure est la posture
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
      const headRelativeHeight = shoulderMidY - nose.y;

      // Calculer l'alignement vertical (épaules au-dessus des hanches)
      const hipMidY = (leftHip.y + rightHip.y) / 2;
      const torsoAlignment = hipMidY - shoulderMidY;

      // Calculer la largeur des épaules (plus large = plus ouvert)
      const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);

      // Score combiné (normalisé 0-1)
      // Ces coefficients sont des heuristiques arbitraires
      let score = 0.5;

      // Tête haute = bon
      score += Math.min(headRelativeHeight * 2, 0.25);

      // Torse aligné = bon
      score += Math.min(torsoAlignment * 1.5, 0.15);

      // Épaules ouvertes = bon (seuil arbitraire de 0.3)
      if (shoulderWidth > 0.2) {
        score += Math.min((shoulderWidth - 0.2) * 0.5, 0.1);
      }

      return Math.max(0, Math.min(1, score));
    } catch {
      return 0.5;
    }
  }

  /**
   * Calcule le score de mouvement (0-1)
   *
   * Compare les landmarks actuels avec les précédents pour
   * détecter le niveau d'agitation
   *
   * ⚠️ APPROXIMATION: Peut être affecté par le bruit caméra
   */
  private computeMovementScore(landmarks: HolisticLandmarks): number {
    if (this.landmarkBuffer.landmarks.length < 2) {
      return 0.5;
    }

    const previous =
      this.landmarkBuffer.landmarks[this.landmarkBuffer.landmarks.length - 2];

    if (!landmarks.pose || !previous.pose) {
      return 0.5;
    }

    try {
      // Calculer le déplacement moyen des points clés
      let totalMovement = 0;
      let pointsCompared = 0;

      const keyPoints = [
        POSE_LANDMARKS.NOSE,
        POSE_LANDMARKS.LEFT_SHOULDER,
        POSE_LANDMARKS.RIGHT_SHOULDER,
        POSE_LANDMARKS.LEFT_WRIST,
        POSE_LANDMARKS.RIGHT_WRIST,
      ];

      for (const idx of keyPoints) {
        const current = landmarks.pose[idx];
        const prev = previous.pose[idx];

        if (current && prev) {
          const dx = current.x - prev.x;
          const dy = current.y - prev.y;
          totalMovement += Math.sqrt(dx * dx + dy * dy);
          pointsCompared++;
        }
      }

      if (pointsCompared === 0) return 0.5;

      const avgMovement = totalMovement / pointsCompared;

      // Normaliser (seuils arbitraires)
      // < 0.01 = très calme, > 0.05 = agité
      const normalizedScore = Math.min(avgMovement / 0.05, 1);

      return normalizedScore;
    } catch {
      return 0.5;
    }
  }

  /**
   * Calcule la stabilité du regard (0-1)
   *
   * Basé sur la position relative des yeux et du nez
   *
   * ⚠️ APPROXIMATION: Difficile à estimer sans eye tracking précis
   */
  private computeGazeStabilityScore(landmarks: HolisticLandmarks): number {
    if (this.landmarkBuffer.landmarks.length < 5) {
      return 0.5;
    }

    if (!landmarks.face || landmarks.face.length < 10) {
      return 0.5;
    }

    try {
      // Utiliser la variance de la position du nez comme proxy de stabilité
      const recentLandmarks = this.landmarkBuffer.landmarks.slice(-10);
      const nosePositions: { x: number; y: number }[] = [];

      for (const lm of recentLandmarks) {
        if (lm.pose && lm.pose[POSE_LANDMARKS.NOSE]) {
          nosePositions.push({
            x: lm.pose[POSE_LANDMARKS.NOSE].x,
            y: lm.pose[POSE_LANDMARKS.NOSE].y,
          });
        }
      }

      if (nosePositions.length < 5) return 0.5;

      // Calculer la variance
      const avgX = nosePositions.reduce((s, p) => s + p.x, 0) / nosePositions.length;
      const avgY = nosePositions.reduce((s, p) => s + p.y, 0) / nosePositions.length;

      let variance = 0;
      for (const p of nosePositions) {
        variance += (p.x - avgX) ** 2 + (p.y - avgY) ** 2;
      }
      variance /= nosePositions.length;

      // Faible variance = regard stable
      // Inverser le score (moins de variance = plus stable = score plus haut)
      const stabilityScore = Math.max(0, 1 - variance * 100);

      return Math.min(1, stabilityScore);
    } catch {
      return 0.5;
    }
  }

  /**
   * Calcule la symétrie des épaules (0-1)
   */
  private computeShoulderSymmetry(landmarks: HolisticLandmarks): number {
    if (!landmarks.pose) return 0.5;

    try {
      const leftShoulder = landmarks.pose[POSE_LANDMARKS.LEFT_SHOULDER];
      const rightShoulder = landmarks.pose[POSE_LANDMARKS.RIGHT_SHOULDER];

      if (!leftShoulder || !rightShoulder) return 0.5;

      // Différence de hauteur entre épaules
      const heightDiff = Math.abs(leftShoulder.y - rightShoulder.y);

      // Plus la différence est faible, plus c'est symétrique
      return Math.max(0, 1 - heightDiff * 5);
    } catch {
      return 0.5;
    }
  }

  /**
   * Calcule l'inclinaison de la tête (-1 à 1)
   * Négatif = penché à gauche, Positif = penché à droite
   */
  private computeHeadTilt(landmarks: HolisticLandmarks): number {
    if (!landmarks.pose) return 0;

    try {
      const leftEar = landmarks.pose[POSE_LANDMARKS.LEFT_EAR];
      const rightEar = landmarks.pose[POSE_LANDMARKS.RIGHT_EAR];

      if (!leftEar || !rightEar) return 0;

      // Différence de hauteur entre oreilles
      const tilt = rightEar.y - leftEar.y;

      // Normaliser entre -1 et 1
      return Math.max(-1, Math.min(1, tilt * 10));
    } catch {
      return 0;
    }
  }

  /**
   * Calcule l'activité faciale (0-1)
   *
   * ⚠️ Très approximatif sans modèle d'expression dédié
   */
  private computeFacialActivity(landmarks: HolisticLandmarks): number {
    if (!landmarks.face || landmarks.face.length < 100) {
      return 0.5;
    }

    // Pour l'instant, retourner une valeur neutre
    // Un vrai calcul nécessiterait un modèle d'expressions faciales
    return 0.5;
  }

  /**
   * Calcule le score de confiance global
   */
  private computeConfidence(landmarks: HolisticLandmarks): number {
    let confidence = 0;

    // Qualité des landmarks pose
    if (landmarks.pose && landmarks.pose.length > 20) {
      const avgVisibility =
        landmarks.pose.slice(0, 25).reduce((sum, lm) => sum + (lm.visibility || 0), 0) /
        25;
      confidence += avgVisibility * CONFIDENCE_CONFIG.weights.landmarkQuality;
    }

    // Visage détecté
    if (landmarks.face && landmarks.face.length > 100) {
      confidence += CONFIDENCE_CONFIG.weights.faceVisibility;
    }

    // Stabilité temporelle (si buffer suffisant)
    if (this.landmarkBuffer.landmarks.length >= 5) {
      confidence += CONFIDENCE_CONFIG.weights.temporalStability * 0.7;
    }

    return Math.min(1, confidence);
  }

  // ============================================================================
  // BUFFER MANAGEMENT
  // ============================================================================

  /**
   * Ajoute des landmarks au buffer
   */
  private addToBuffer(landmarks: HolisticLandmarks): void {
    this.landmarkBuffer.landmarks.push(landmarks);

    // Limiter la taille
    while (this.landmarkBuffer.landmarks.length > this.landmarkBuffer.maxSize) {
      this.landmarkBuffer.landmarks.shift();
    }
  }

  /**
   * Vide le buffer
   */
  clearBuffer(): void {
    this.landmarkBuffer.landmarks = [];
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /**
   * Met à jour l'état et notifie
   */
  private updateState(partial: Partial<BodyLanguageState>): void {
    this.state = { ...this.state, ...partial };

    if (this.stateUpdater) {
      this.stateUpdater(partial);
    }
  }

  /**
   * Retourne l'état actuel
   */
  getState(): BodyLanguageState {
    return { ...this.state };
  }

  /**
   * Retourne si le moteur est initialisé
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Nettoie les ressources
   */
  cleanup(): void {
    this.holistic = null;
    this.camera = null;
    this.landmarkBuffer.landmarks = [];
    this.stateUpdater = null;
    this.isInitialized = false;
    this.isProcessing = false;
  }
}

// ============================================================================
// EXPORTS FONCTIONNELS
// ============================================================================

let engineInstance: BodyLanguageEngine | null = null;

/**
 * Initialise le BodyLanguageEngine
 */
export async function initBodyLanguageEngine(): Promise<BodyLanguageEngine> {
  engineInstance = BodyLanguageEngine.getInstance();
  await engineInstance.initialize();
  return engineInstance;
}

/**
 * Récupère l'instance
 */
export function getBodyLanguageEngine(): BodyLanguageEngine | null {
  return engineInstance;
}

/**
 * Traite une frame
 */
export async function processVideoFrame(videoElement: HTMLVideoElement): Promise<void> {
  await engineInstance?.processFrame(videoElement);
}
