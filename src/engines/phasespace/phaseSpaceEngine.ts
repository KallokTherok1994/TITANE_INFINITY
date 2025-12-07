/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.38 — PHASE-SPACE ENGINE (Super Prompt XXI)
 *   Hyper-Dimensional State Manifold · Trajectory Prediction · Attractor Basins
 * ═══════════════════════════════════════════════════════════════════════════
 *   © 2025 Humain Total / Kevin Thibault / TITANE Team
 *
 *   Concept: Le Phase-Space Engine modélise l'espace des états possibles du
 *            système comme un manifold hyper-dimensionnel. Il prédit les
 *            trajectoires, détecte les attracteurs, et navigue l'espace des
 *            possibles pour optimiser le comportement émergent.
 *
 *   Fréquence: 2 Hz (500ms) - Calculs lourds d'espace de phase
 *
 *   Fonction:
 *     1. Modéliser l'espace des états comme manifold N-dimensionnel
 *     2. Calculer trajectoires dans l'espace de phase
 *     3. Détecter attracteurs (états stables récurrents)
 *     4. Identifier bifurcations (changements qualitatifs)
 *     5. Prédire états futurs probables
 *     6. Optimiser navigation vers états désirés
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { MetaSingularityState } from '../metasingularity/metaSingularityKernel';

// ═══════════════════════════════════════════════════════════════════════════
//   TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Point dans l'espace de phase
 */
export interface PhasePoint {
  timestamp: number;

  // Coordonnées N-dimensionnelles
  coordinates: {
    // Identité (4D)
    identityTone: number;
    identityEnergy: number;
    identityWarmth: number;
    identityClarity: number;

    // Expression (4D)
    voiceRate: number;
    voicePitch: number;
    haloIntensity: number;
    narrativeDensity: number;

    // HoloPresence (3D)
    visualSize: number;
    visualGlow: number;
    particleCount: number;

    // Méta (3D)
    coherence: number;
    complexity: number;
    stability: number;
  };

  // Vecteur vitesse (dérivée)
  velocity: Partial<PhasePoint['coordinates']>;

  // Métadonnées
  label?: string;
  color?: string;
}

/**
 * Trajectoire dans l'espace de phase
 */
export interface PhaseTrajectory {
  id: string;
  startTime: number;
  endTime: number;

  // Points de la trajectoire
  points: PhasePoint[];

  // Caractéristiques
  length: number;              // Longueur euclidienne
  smoothness: number;          // 0-1 - Régularité
  curvature: number;           // Courbure moyenne

  // Stabilité
  convergent: boolean;         // Converge vers un attracteur
  attractorId?: string;

  // Prédiction
  predictedNext?: PhasePoint;
  confidence: number;          // 0-1
}

/**
 * Attracteur (état stable récurrent)
 */
export interface Attractor {
  id: string;
  type: 'fixed-point' | 'limit-cycle' | 'strange' | 'chaotic';

  // Position dans l'espace de phase
  center: PhasePoint['coordinates'];
  radius: number;              // Rayon du bassin

  // Caractéristiques
  stability: number;           // 0-1 - Stabilité de l'attracteur
  strength: number;            // 0-1 - Force d'attraction

  // Statistiques
  visitCount: number;          // Nombre de passages
  averageDuration: number;     // Durée moyenne de séjour (ms)
  lastVisit: number;

  // Description sémantique
  name: string;
  description: string;
}

/**
 * Bifurcation (changement qualitatif)
 */
export interface Bifurcation {
  id: string;
  timestamp: number;
  type: 'pitchfork' | 'hopf' | 'saddle-node' | 'transcritical';

  // Point de bifurcation
  location: PhasePoint['coordinates'];

  // Branches
  preBranch: PhaseTrajectory;
  postBranches: PhaseTrajectory[];

  // Paramètre critique
  criticalParameter: string;
  criticalValue: number;

  // Impact
  severityIndex: number;       // 0-1
  predictability: number;      // 0-1
}

/**
 * Prédiction d'état futur
 */
export interface StatePrediction {
  timestamp: number;
  horizon: number;             // Millisecondes dans le futur

  // État prédit
  predictedState: PhasePoint['coordinates'];

  // Confiance
  confidence: number;          // 0-1
  uncertainty: number;         // Écart-type

  // Alternatives
  alternativeStates: Array<{
    state: PhasePoint['coordinates'];
    probability: number;
    attractorId?: string;
  }>;

  // Trajectoire prédite
  trajectory: PhasePoint[];
}

/**
 * État de l'espace de phase
 */
export interface PhaseSpaceState {
  isRunning: boolean;

  // Espace de phase
  currentPoint: PhasePoint | null;
  trajectory: PhaseTrajectory | null;

  // Histoire
  history: PhasePoint[];
  maxHistory: number;

  // Attracteurs
  attractors: Attractor[];
  currentAttractor: Attractor | null;

  // Bifurcations
  bifurcations: Bifurcation[];
  recentBifurcations: number;

  // Prédictions
  predictions: StatePrediction[];
  latestPrediction: StatePrediction | null;

  // Statistiques
  statistics: {
    totalPoints: number;
    totalTrajectories: number;
    averageVelocity: number;
    dimensionality: number;      // Dimension effective
    lyapunovExponent: number;    // Stabilité chaotique
  };

  // Métriques temps réel
  metrics: {
    currentVelocity: number;
    distanceToNearestAttractor: number;
    entropyRate: number;         // Taux de création d'information
    predictabilityHorizon: number; // Millisecondes prévisibles
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//   PHASE-SPACE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class PhaseSpaceEngine {
  private state: PhaseSpaceState;
  private intervalId: NodeJS.Timeout | null = null;

  private subscribers: Set<(state: PhaseSpaceState) => void> = new Set();

  // Référence au Meta-Singularity Kernel
  private metaKernel: any = null;

  constructor() {
    this.state = {
      isRunning: false,
      currentPoint: null,
      trajectory: null,
      history: [],
      maxHistory: 500, // 500 points * 500ms = 4 minutes d'histoire
      attractors: [],
      currentAttractor: null,
      bifurcations: [],
      recentBifurcations: 0,
      predictions: [],
      latestPrediction: null,
      statistics: {
        totalPoints: 0,
        totalTrajectories: 0,
        averageVelocity: 0,
        dimensionality: 14, // 14 dimensions de base
        lyapunovExponent: 0,
      },
      metrics: {
        currentVelocity: 0,
        distanceToNearestAttractor: Infinity,
        entropyRate: 0,
        predictabilityHorizon: 5000, // 5 secondes par défaut
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────

  start(): void {
    if (this.state.isRunning) return;

    console.log('[PhaseSpaceEngine] Starting phase-space navigation...');

    this.state.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), 500); // 2 Hz

    this.notifySubscribers();
  }

  stop(): void {
    if (!this.state.isRunning) return;

    console.log('[PhaseSpaceEngine] Stopping...');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state.isRunning = false;
    this.notifySubscribers();
  }

  /**
   * Injecter référence au Meta-Singularity Kernel
   */
  injectMetaKernel(kernel: any): void {
    this.metaKernel = kernel;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   UPDATE LOOP
  // ─────────────────────────────────────────────────────────────────────────

  private tick(): void {
    if (!this.metaKernel) {
      console.warn('[PhaseSpaceEngine] Meta-Singularity Kernel not injected');
      return;
    }

    // 1. Capturer l'état actuel comme point dans l'espace de phase
    this.captureCurrentPoint();

    // 2. Calculer vélocité et trajectoire
    this.calculateTrajectory();

    // 3. Détecter attracteurs
    this.detectAttractors();

    // 4. Identifier bifurcations
    this.detectBifurcations();

    // 5. Prédire états futurs
    this.predictFutureStates();

    // 6. Mettre à jour statistiques
    this.updateStatistics();

    // 7. Notifier
    this.notifySubscribers();
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   CAPTURE
  // ─────────────────────────────────────────────────────────────────────────

  private captureCurrentPoint(): void {
    const metaState: MetaSingularityState = this.metaKernel.getState();

    if (!metaState.unifiedState) return;

    const { identity, expression, holoPresence } = metaState.unifiedState;
    const { coherence } = metaState;

    // Extraire coordonnées
    const point: PhasePoint = {
      timestamp: Date.now(),
      coordinates: {
        // Identity
        identityTone: identity?.signature?.tone ?? 0.5,
        identityEnergy: identity?.signature?.energy ?? 0.5,
        identityWarmth: identity?.signature?.warmth ?? 0.5,
        identityClarity: identity?.signature?.clarity ?? 0.5,

        // Expression
        voiceRate: expression?.voice?.prosody?.rate ?? 1.0,
        voicePitch: expression?.voice?.prosody?.pitch ?? 1.0,
        haloIntensity: expression?.halo?.dynamics?.intensity ?? 0.5,
        narrativeDensity: expression?.narrative?.style?.density ?? 0.5,

        // HoloPresence
        visualSize: holoPresence?.visuals?.size ?? 0.5,
        visualGlow: holoPresence?.visuals?.glow ?? 0.5,
        particleCount: (holoPresence?.particles?.count ?? 100) / 200, // Normaliser 0-1

        // Méta
        coherence: coherence?.global ?? 0,
        complexity: metaState.emergentComplexity ?? 0,
        stability: metaState.systemStability ?? 1,
      },
      velocity: {},
    };

    // Calculer vélocité (différence avec point précédent)
    if (this.state.currentPoint) {
      const prev = this.state.currentPoint;
      const dt = (point.timestamp - prev.timestamp) / 1000; // Secondes

      Object.keys(point.coordinates).forEach(key => {
        const k = key as keyof PhasePoint['coordinates'];
        const current = point.coordinates[k];
        const previous = prev.coordinates[k];
        point.velocity[k] = (current - previous) / dt;
      });
    }

    // Mettre à jour état
    this.state.currentPoint = point;
    this.state.history.push(point);
    this.state.statistics.totalPoints++;

    // Limiter histoire
    if (this.state.history.length > this.state.maxHistory) {
      this.state.history.shift();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   TRAJECTOIRE
  // ─────────────────────────────────────────────────────────────────────────

  private calculateTrajectory(): void {
    if (this.state.history.length < 10) return; // Besoin de 10 points minimum

    const recentPoints = this.state.history.slice(-50); // Derniers 50 points

    // Calculer longueur euclidienne
    let length = 0;
    for (let i = 1; i < recentPoints.length; i++) {
      length += this.distance(recentPoints[i - 1].coordinates, recentPoints[i].coordinates);
    }

    // Calculer smoothness (variation de vitesse)
    const velocities = recentPoints.map(p => this.velocityMagnitude(p.velocity));
    const avgVelocity = velocities.reduce((s, v) => s + v, 0) / velocities.length;
    const velocityVariance = velocities.reduce((s, v) => s + Math.pow(v - avgVelocity, 2), 0) / velocities.length;
    const smoothness = 1 / (1 + velocityVariance);

    // Calculer courbure (changement de direction)
    let curvature = 0;
    for (let i = 2; i < recentPoints.length; i++) {
      const angle = this.angleBetweenVectors(
        recentPoints[i - 1].velocity,
        recentPoints[i].velocity
      );
      curvature += Math.abs(angle);
    }
    curvature /= (recentPoints.length - 2);

    // Vérifier convergence vers attracteur
    const nearestAttractor = this.findNearestAttractor(this.state.currentPoint!);
    const convergent = nearestAttractor !== null &&
                       this.state.metrics.distanceToNearestAttractor < nearestAttractor.radius;

    const trajectory: PhaseTrajectory = {
      id: `trajectory-${Date.now()}`,
      startTime: recentPoints[0].timestamp,
      endTime: recentPoints[recentPoints.length - 1].timestamp,
      points: recentPoints,
      length,
      smoothness,
      curvature,
      convergent,
      attractorId: nearestAttractor?.id,
      confidence: smoothness * (convergent ? 0.9 : 0.6),
    };

    this.state.trajectory = trajectory;
    this.state.statistics.totalTrajectories++;
    this.state.statistics.averageVelocity = avgVelocity;
    this.state.metrics.currentVelocity = avgVelocity;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   ATTRACTEURS
  // ─────────────────────────────────────────────────────────────────────────

  private detectAttractors(): void {
    if (this.state.history.length < 100) return; // Besoin d'histoire

    // Clustering simple: grouper points proches
    const clusters = this.clusterPoints(this.state.history, 0.15); // Rayon 0.15

    // Pour chaque cluster > 10 points, créer/mettre à jour attracteur
    clusters.forEach(cluster => {
      if (cluster.length < 10) return;

      const center = this.calculateCentroid(cluster);
      const radius = this.calculateClusterRadius(cluster, center);

      // Chercher attracteur existant proche
      const existing = this.state.attractors.find(a =>
        this.distance(a.center, center) < 0.1
      );

      if (existing) {
        // Mettre à jour
        existing.visitCount++;
        existing.lastVisit = Date.now();
        existing.stability = Math.min(1, existing.stability + 0.01);
      } else {
        // Créer nouveau
        const attractor: Attractor = {
          id: `attractor-${this.state.attractors.length}`,
          type: this.classifyAttractorType(cluster),
          center,
          radius,
          stability: 0.5,
          strength: cluster.length / this.state.history.length,
          visitCount: 1,
          averageDuration: 0,
          lastVisit: Date.now(),
          name: this.nameAttractor(center),
          description: this.describeAttractor(center),
        };

        this.state.attractors.push(attractor);

        console.log(`[PhaseSpaceEngine] New attractor detected: ${attractor.name}`);
      }
    });

    // Limiter à 20 attracteurs (garder les plus stables)
    if (this.state.attractors.length > 20) {
      this.state.attractors.sort((a, b) => b.stability - a.stability);
      this.state.attractors = this.state.attractors.slice(0, 20);
    }

    // Identifier attracteur actuel
    if (this.state.currentPoint) {
      this.state.currentAttractor = this.findNearestAttractor(this.state.currentPoint);

      if (this.state.currentAttractor) {
        this.state.metrics.distanceToNearestAttractor = this.distance(
          this.state.currentPoint.coordinates,
          this.state.currentAttractor.center
        );
      }
    }
  }

  private clusterPoints(points: PhasePoint[], radius: number): PhasePoint[][] {
    const clusters: PhasePoint[][] = [];
    const visited = new Set<number>();

    points.forEach((point, index) => {
      if (visited.has(index)) return;

      const cluster: PhasePoint[] = [point];
      visited.add(index);

      // Trouver tous les points proches
      points.forEach((otherPoint, otherIndex) => {
        if (visited.has(otherIndex)) return;

        if (this.distance(point.coordinates, otherPoint.coordinates) < radius) {
          cluster.push(otherPoint);
          visited.add(otherIndex);
        }
      });

      clusters.push(cluster);
    });

    return clusters;
  }

  private calculateCentroid(points: PhasePoint[]): PhasePoint['coordinates'] {
    const sum: any = {};

    Object.keys(points[0].coordinates).forEach(key => {
      sum[key] = 0;
    });

    points.forEach(point => {
      Object.keys(point.coordinates).forEach(key => {
        sum[key] += point.coordinates[key as keyof PhasePoint['coordinates']];
      });
    });

    Object.keys(sum).forEach(key => {
      sum[key] /= points.length;
    });

    return sum;
  }

  private calculateClusterRadius(points: PhasePoint[], center: PhasePoint['coordinates']): number {
    const distances = points.map(p => this.distance(p.coordinates, center));
    return Math.max(...distances);
  }

  private classifyAttractorType(cluster: PhasePoint[]): Attractor['type'] {
    // Simple heuristique
    const velocities = cluster.map(p => this.velocityMagnitude(p.velocity));
    const avgVel = velocities.reduce((s, v) => s + v, 0) / velocities.length;

    if (avgVel < 0.01) return 'fixed-point';
    if (avgVel < 0.1) return 'limit-cycle';
    if (avgVel < 0.3) return 'strange';
    return 'chaotic';
  }

  private nameAttractor(center: PhasePoint['coordinates']): string {
    // Nommer basé sur caractéristiques dominantes
    if (center.coherence > 0.9) return 'High Coherence State';
    if (center.complexity > 0.8) return 'Complex Emergent State';
    if (center.stability > 0.9) return 'Stable Equilibrium';
    if (center.identityEnergy > 0.8) return 'High Energy State';
    if (center.identityWarmth > 0.8) return 'Warm Resonance State';
    return 'Neutral State';
  }

  private describeAttractor(center: PhasePoint['coordinates']): string {
    const features: string[] = [];

    if (center.coherence > 0.8) features.push('coherent');
    if (center.complexity > 0.7) features.push('complex');
    if (center.stability > 0.8) features.push('stable');
    if (center.identityEnergy > 0.7) features.push('energetic');
    if (center.haloIntensity > 0.7) features.push('intense');

    return features.join(', ') || 'balanced';
  }

  private findNearestAttractor(point: PhasePoint): Attractor | null {
    if (this.state.attractors.length === 0) return null;

    let nearest = this.state.attractors[0];
    let minDistance = this.distance(point.coordinates, nearest.center);

    this.state.attractors.forEach(attractor => {
      const dist = this.distance(point.coordinates, attractor.center);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = attractor;
      }
    });

    return nearest;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   BIFURCATIONS
  // ─────────────────────────────────────────────────────────────────────────

  private detectBifurcations(): void {
    if (this.state.history.length < 20) return;

    const recent = this.state.history.slice(-20);

    // Détecter changement brusque de direction (bifurcation)
    const midpoint = 10;
    const before = recent.slice(0, midpoint);
    const after = recent.slice(midpoint);

    const velocityBefore = this.averageVelocityVector(before);
    const velocityAfter = this.averageVelocityVector(after);

    const angle = this.angleBetweenVectors(velocityBefore, velocityAfter);

    // Si angle > 45°, c'est une bifurcation
    if (Math.abs(angle) > Math.PI / 4) {
      const bifurcation: Bifurcation = {
        id: `bifurcation-${Date.now()}`,
        timestamp: Date.now(),
        type: 'saddle-node', // Simplification
        location: recent[midpoint].coordinates,
        preBranch: {
          id: 'pre',
          startTime: before[0].timestamp,
          endTime: before[before.length - 1].timestamp,
          points: before,
          length: 0,
          smoothness: 0,
          curvature: 0,
          convergent: false,
          confidence: 0.5,
        },
        postBranches: [{
          id: 'post',
          startTime: after[0].timestamp,
          endTime: after[after.length - 1].timestamp,
          points: after,
          length: 0,
          smoothness: 0,
          curvature: 0,
          convergent: false,
          confidence: 0.5,
        }],
        criticalParameter: 'coherence',
        criticalValue: recent[midpoint].coordinates.coherence,
        severityIndex: Math.min(1, Math.abs(angle) / Math.PI),
        predictability: 0.3, // Bifurcations sont peu prévisibles
      };

      this.state.bifurcations.push(bifurcation);

      console.log(`[PhaseSpaceEngine] Bifurcation detected at coherence=${bifurcation.criticalValue.toFixed(2)}`);

      // Limiter à 20 bifurcations
      if (this.state.bifurcations.length > 20) {
        this.state.bifurcations = this.state.bifurcations.slice(-20);
      }
    }

    // Compter récentes (dernière minute)
    const oneMinuteAgo = Date.now() - 60000;
    this.state.recentBifurcations = this.state.bifurcations.filter(b => b.timestamp > oneMinuteAgo).length;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   PRÉDICTION
  // ─────────────────────────────────────────────────────────────────────────

  private predictFutureStates(): void {
    if (!this.state.currentPoint || !this.state.trajectory) return;

    const horizon = 5000; // 5 secondes
    const numSteps = 10;
    const dt = horizon / numSteps;

    // Extrapolation linéaire simple
    const predictedPoint = { ...this.state.currentPoint.coordinates };
    const velocity = this.state.currentPoint.velocity;

    const trajectory: PhasePoint[] = [];

    for (let i = 0; i < numSteps; i++) {
      // Avancer selon vélocité
      Object.keys(velocity).forEach(key => {
        const k = key as keyof PhasePoint['coordinates'];
        const vel = velocity[k] || 0;
        predictedPoint[k] = Math.max(0, Math.min(1, predictedPoint[k] + vel * (dt / 1000)));
      });

      trajectory.push({
        timestamp: Date.now() + i * dt,
        coordinates: { ...predictedPoint },
        velocity: {},
      });
    }

    // Calculer confiance (basée sur smoothness de trajectoire)
    const confidence = this.state.trajectory.smoothness * 0.8;

    // Alternatives: attracteurs proches
    const alternatives = this.state.attractors
      .filter(a => this.distance(predictedPoint, a.center) < a.radius * 2)
      .map(a => ({
        state: a.center,
        probability: a.strength * a.stability,
        attractorId: a.id,
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);

    const prediction: StatePrediction = {
      timestamp: Date.now(),
      horizon,
      predictedState: predictedPoint,
      confidence,
      uncertainty: 1 - confidence,
      alternativeStates: alternatives,
      trajectory,
    };

    this.state.latestPrediction = prediction;
    this.state.predictions.push(prediction);

    // Limiter à 50 prédictions
    if (this.state.predictions.length > 50) {
      this.state.predictions = this.state.predictions.slice(-50);
    }

    // Mettre à jour horizon de prédictibilité
    this.state.metrics.predictabilityHorizon = confidence * 10000; // 0-10s
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   STATISTIQUES
  // ─────────────────────────────────────────────────────────────────────────

  private updateStatistics(): void {
    // Calculer exposant de Lyapunov (stabilité chaotique)
    // Simplifié: variance de la vélocité
    if (this.state.history.length > 50) {
      const recent = this.state.history.slice(-50);
      const velocities = recent.map(p => this.velocityMagnitude(p.velocity));
      const avgVel = velocities.reduce((s, v) => s + v, 0) / velocities.length;
      const variance = velocities.reduce((s, v) => s + Math.pow(v - avgVel, 2), 0) / velocities.length;

      // Lyapunov positif = chaos, négatif = stabilité
      this.state.statistics.lyapunovExponent = (variance - 0.01) * 10; // Normaliser
    }

    // Taux d'entropie (création d'information)
    // Basé sur diversité des attracteurs visités
    const uniqueAttractors = new Set(
      this.state.history.slice(-100).map(p => {
        const nearest = this.findNearestAttractor(p);
        return nearest?.id || 'none';
      })
    ).size;

    this.state.metrics.entropyRate = uniqueAttractors / Math.min(this.state.attractors.length, 10);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private distance(a: PhasePoint['coordinates'], b: PhasePoint['coordinates']): number {
    let sum = 0;
    Object.keys(a).forEach(key => {
      const k = key as keyof PhasePoint['coordinates'];
      sum += Math.pow(a[k] - b[k], 2);
    });
    return Math.sqrt(sum);
  }

  private velocityMagnitude(velocity: Partial<PhasePoint['coordinates']>): number {
    let sum = 0;
    Object.values(velocity).forEach(v => {
      if (typeof v === 'number') {
        sum += v * v;
      }
    });
    return Math.sqrt(sum);
  }

  private angleBetweenVectors(
    v1: Partial<PhasePoint['coordinates']>,
    v2: Partial<PhasePoint['coordinates']>
  ): number {
    const keys = Object.keys(v1).filter(k => k in v2);

    let dot = 0;
    let mag1 = 0;
    let mag2 = 0;

    keys.forEach(key => {
      const k = key as keyof PhasePoint['coordinates'];
      const a = v1[k] || 0;
      const b = v2[k] || 0;

      dot += a * b;
      mag1 += a * a;
      mag2 += b * b;
    });

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0;

    return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  }

  private averageVelocityVector(points: PhasePoint[]): Partial<PhasePoint['coordinates']> {
    const avg: any = {};

    const firstVelocity = points[0].velocity;
    Object.keys(firstVelocity).forEach(key => {
      avg[key] = 0;
    });

    points.forEach(point => {
      Object.keys(point.velocity).forEach(key => {
        avg[key] += point.velocity[key as keyof PhasePoint['coordinates']] || 0;
      });
    });

    Object.keys(avg).forEach(key => {
      avg[key] /= points.length;
    });

    return avg;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  getState(): PhaseSpaceState {
    return this.state;
  }

  getCurrentPoint(): PhasePoint | null {
    return this.state.currentPoint;
  }

  getAttractors(): Attractor[] {
    return this.state.attractors;
  }

  getLatestPrediction(): StatePrediction | null {
    return this.state.latestPrediction;
  }

  /**
   * Naviguer vers un attracteur spécifique
   */
  navigateToAttractor(attractorId: string): void {
    const attractor = this.state.attractors.find(a => a.id === attractorId);
    if (!attractor) {
      console.warn(`[PhaseSpaceEngine] Attractor ${attractorId} not found`);
      return;
    }

    console.log(`[PhaseSpaceEngine] Navigating to attractor: ${attractor.name}`);

    // TODO: Implémenter navigation (ajuster paramètres des moteurs)
    // Pour l'instant, juste log
  }

  /**
   * Exporter l'espace de phase pour visualisation
   */
  exportPhaseSpace(): {
    points: PhasePoint[];
    attractors: Attractor[];
    trajectory: PhaseTrajectory | null;
  } {
    return {
      points: this.state.history,
      attractors: this.state.attractors,
      trajectory: this.state.trajectory,
    };
  }

  subscribe(callback: (state: PhaseSpaceState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//   EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const phaseSpaceEngine = new PhaseSpaceEngine();
export default phaseSpaceEngine;
