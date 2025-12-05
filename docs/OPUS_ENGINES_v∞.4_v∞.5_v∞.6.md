# TITANE∞ — OPUS ENGINES v∞.4, v∞.5, v∞.6

## Documentation Technique Complète

**Version**: v∞.4, v∞.5, v∞.6
**Date**: 2025
**Auteur**: Kevin Thibault / TITANE Team
**Tests**: 53/53 ✅

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [OPUS v∞.4 — Predictive State Engine](#opus-v4--predictive-state-engine)
3. [OPUS v∞.5 — Stress Regulation Engine](#opus-v5--stress-regulation-engine)
4. [OPUS v∞.6 — Human Rhythm Engine](#opus-v6--human-rhythm-engine)
5. [Intégration des Engines](#intégration-des-engines)
6. [Tests et Validation](#tests-et-validation)
7. [Garde-fous Éthiques](#garde-fous-éthiques)

---

## Vue d'Ensemble

Les OPUS Engines forment le cœur prédictif et adaptatif de TITANE∞. Ils travaillent ensemble pour:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OPUS ENGINE STACK                               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                   MultimodalFusionEngine (v∞.3)                   │ │
│  │            Fusion voix + texte + vision → état unifié              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │              PredictiveStateEngine (v∞.4)                         │ │
│  │        Tendances + Prévisions + Détection de ruptures             │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                    ┌───────────────┴───────────────┐                   │
│                    ▼                               ▼                    │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐ │
│  │   StressRegulationEngine      │  │   HumanRhythmEngine           │ │
│  │         (v∞.5)                │  │         (v∞.6)                │ │
│  │   Micro-interventions         │  │   Cycles circadiens           │ │
│  │   adaptatives                 │  │   + Chronotype                │ │
│  └───────────────────────────────┘  └───────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## OPUS v∞.4 — Predictive State Engine

### Objectif

Analyser les tendances émotionnelles et comportementales pour prédire les changements d'état et déclencher des alertes proactives.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PredictiveStateEngine                            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │  Trend    │  │ Forecast  │  │  Pattern  │  │  Trigger  │       │
│  │ Analyzer  │  │  Module   │  │ Detector  │  │  System   │       │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘       │
│        │              │              │              │              │
│        └──────────────┴──────────────┴──────────────┘              │
│                             │                                       │
│                             ▼                                       │
│                     PredictiveState                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Fonctionnalités

#### 1. Analyse de Tendance (Trend Analyzer)
- **EMA (Exponential Moving Average)** pour lissage temporel
- **Régression linéaire** pour calcul de pente
- Directions: `rising`, `falling`, `stable`

```typescript
// Calcul de tendance
const trend = engine.computeTrend(history, 'energy');
// → { direction: 'rising', slope: 0.02, r2: 0.85 }
```

#### 2. Prévisions (Forecast Module)
- Prédiction court/moyen/long terme
- Intervalle de confiance
- Explication humaine

```typescript
// Prévision d'énergie
const forecast = engine.forecastDimension('energy', horizonMs);
// → { predictedValue: 0.65, confidence: 0.78, trend: {...} }
```

#### 3. Détection de Ruptures (Pattern Detector)
- Z-score pour anomalies
- Types: `sudden_spike`, `gradual_drift`, `baseline_shift`, `oscillation`

```typescript
// Détection de rupture
const shift = engine.detectPatternShift(currentDataPoint);
// → { detected: true, type: 'sudden_spike', severity: 0.8, zScore: 2.5 }
```

#### 4. Alertes Proactives (Trigger System)
- Déclenchement basé sur seuils configurables
- Cooldown entre alertes
- Messages contextuels

### Types Principaux

```typescript
interface PredictiveState {
  energyTrend: TrendDirection;
  tensionTrend: TrendDirection;
  engagementTrend: TrendDirection;
  energyForecast: DimensionForecast;
  tensionForecast: DimensionForecast;
  engagementForecast: DimensionForecast;
  changeProbability: number;
  patternShiftDetected: boolean;
  patternShiftType: PatternShiftType;
  requiresAttention: boolean;
  attentionLevel: 'none' | 'low' | 'medium' | 'high';
  explanations: string[];
  lastUpdate: number;
}
```

### Utilisation

```typescript
import { PredictiveStateEngine } from '@/engines/predictive';

const engine = PredictiveStateEngine.getInstance();
engine.start();

// Configuration
engine.setConfig({ risingThreshold: 0.03 });
engine.setBaseline(userBaseline);

// Traitement
const multimodalState = getMultimodalState();
const predictiveState = engine.processMultimodalState(multimodalState);

// Résumé
console.log(engine.generatePredictiveSummary());
// → "Énergie: stable | Tension: ↗ en hausse | Engagement: stable"
```

---

## OPUS v∞.5 — Stress Regulation Engine

### Objectif

Proposer des micro-interventions simples et adaptatives pour aider l'utilisateur à gérer sa tension (respiration, pauses, recentrage).

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    StressRegulationEngine                           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │ Trigger   │  │ Selection │  │ Protocol  │  │ Learning  │       │
│  │ Evaluator │  │ Engine    │  │ Runner    │  │ Module    │       │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘       │
│        │              │              │              │              │
│        └──────────────┴──────────────┴──────────────┘              │
│                             │                                       │
│                             ▼                                       │
│                 StressRegulationState                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Types d'Interventions

| Type | Nom | Durée | Description |
|------|-----|-------|-------------|
| `breath` | Respiration guidée | 45s | 4-6 respirations profondes |
| `pause` | Micro-pause | 90s | Étirements et hydratation |
| `body` | Scan corporel | 30s | Observer et relâcher tensions |
| `focus` | Recentrage cognitif | 20s | Identifier UNE tâche |
| `agenda` | Ajustement agenda | 30s | Réorganiser si surchargé |
| `reassurance` | Rappel bienveillant | 15s | Auto-bienveillance |

### Protocole Exemple: Respiration

```typescript
const BREATH_PROTOCOL = {
  type: 'breath',
  name: 'Respiration guidée courte',
  durationSeconds: 45,
  steps: [
    { instruction: 'Inspire doucement par le nez pendant 4 secondes...', durationSeconds: 4 },
    { instruction: 'Garde l\'air 2 secondes...', durationSeconds: 2 },
    { instruction: 'Expire lentement par la bouche pendant 6 secondes...', durationSeconds: 6 },
    // ... répété 3 fois
  ],
  suitableFor: ['medium', 'high'],
};
```

### Évaluation des Triggers

```typescript
const evaluation = engine.shouldTriggerIntervention(
  multimodalState,
  predictiveState,
  agendaLoad,      // 0-1
  userDeclaredStress
);

// → {
//   shouldTrigger: true,
//   reason: 'Tension élevée détectée',
//   priority: 'medium',
//   suggestedType: 'breath',
//   conditions: { tensionAboveBaseline: true, ... }
// }
```

### Apprentissage Adaptatif

Le moteur apprend des préférences utilisateur:

```typescript
// Après une intervention
engine.recordInterventionResult('breath', 'helpful', tensionBefore, tensionAfter);

// Les poids sont ajustés automatiquement
// → interventionWeights.breath augmente si 'helpful'
// → interventionWeights.breath diminue si 'rejected'
```

### Garde-fous

- ⏰ **Cooldown**: 15 minutes entre interventions
- 🔢 **Fréquence max**: 4 interventions/heure
- 🚫 **Auto-désactivation**: après 5 refus consécutifs
- ✋ **Respect du refus**: jamais d'imposition

### Utilisation

```typescript
import { StressRegulationEngine } from '@/engines/stress';

const engine = StressRegulationEngine.getInstance();
engine.start();
engine.setAutoRegulationEnabled(true);

// Évaluation
const trigger = engine.shouldTriggerIntervention(multimodal, predictive, 0.7, false);

if (trigger.shouldTrigger) {
  // Recommandation
  const recommendation = engine.selectInterventionType({
    stressLevel: 'high',
    agendaLoad: 0.8,
  });

  // Démarrage
  const protocol = engine.startIntervention(recommendation.type);

  // Afficher les étapes...
  for (const step of protocol.steps) {
    console.log(step.instruction);
    await sleep(step.durationSeconds * 1000);
  }

  // Feedback
  engine.recordInterventionResult(protocol.type, 'helpful', 0.7, 0.4);
}
```

---

## OPUS v∞.6 — Human Rhythm Engine

### Objectif

Apprendre les rythmes circadiens de l'utilisateur pour adapter le pacing des interactions et suggérer des fenêtres optimales par type de tâche.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      HumanRhythmEngine                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │ Circadian │  │  Weekly   │  │Chronotype │  │ Adaptive  │       │
│  │ Detector  │  │  Pattern  │  │ Learning  │  │   Pacer   │       │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘       │
│        │              │              │              │              │
│        └──────────────┴──────────────┴──────────────┘              │
│                             │                                       │
│                             ▼                                       │
│                    HumanRhythmState                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Moments de la Journée

| Moment | Heures | Description |
|--------|--------|-------------|
| `earlyMorning` | 05:00-08:00 | Réveil, transition |
| `morning` | 08:00-12:00 | Pic matinal typique |
| `midday` | 12:00-14:00 | Pause, dip post-prandial |
| `afternoon` | 14:00-18:00 | Récupération, second pic |
| `evening` | 18:00-22:00 | Déclin, créativité |
| `night` | 22:00-05:00 | Repos, énergie basse |

### Chronotypes

| Chronotype | Pic | Creux | Description |
|------------|-----|-------|-------------|
| `earlyBird` | 9h | 15h | Lève-tôt, productif le matin |
| `neutral` | 10h | 14h | Pas de préférence marquée |
| `nightOwl` | 15h | 9h | Couche-tard, productif le soir |

### Patterns Appris

```typescript
// Pattern journalier
const dailyPattern = engine.getDailyPattern();
// → {
//   patterns: [MomentEnergyPattern, ...],
//   peakMoment: 'morning',
//   dipMoment: 'midday',
//   averageEnergy: 0.65
// }

// Pattern hebdomadaire
const weeklyPattern = engine.getWeeklyPattern();
// → {
//   weekdayPattern: DailyPattern,
//   weekendPattern: DailyPattern,
//   weekdayPeakDay: 'tuesday',
//   weekdayDipDay: 'friday'
// }
```

### Fenêtres Optimales par Tâche

| Type de Tâche | Fenêtre Optimale | Raison |
|---------------|------------------|--------|
| `deepWork` | Autour du pic | Concentration maximale |
| `creative` | 15h-18h | Fatigue légère favorise créativité |
| `routine` | Pendant le creux | Économiser l'énergie |
| `meetings` | 10h-12h | Éveillé mais pas au pic |
| `learning` | Matin tôt | Mémoire optimale |

```typescript
// Vérifier si c'est un bon moment
const result = engine.isGoodTimeFor('deepWork');
// → { isGood: true, reason: 'Fenêtre optimale...', score: 0.85 }

// Obtenir toutes les fenêtres
const windows = engine.getOptimalWindows('creative');
// → [{ taskType: 'creative', startHour: 15, endHour: 18, score: 0.75 }]
```

### Recommandations de Pacing

```typescript
const pacing = engine.getCurrentPacing();
// → {
//   suggestedIntensity: 'focused',      // light | moderate | focused | deep
//   suggestedBreakInterval: 35,         // minutes
//   suggestedSessionLength: 60,         // minutes
//   reason: 'Bonne énergie pour concentration',
//   confidence: 0.8
// }
```

### Utilisation

```typescript
import { HumanRhythmEngine } from '@/engines/rhythm';

const engine = HumanRhythmEngine.getInstance();
engine.start();

// Observation d'énergie
engine.recordEnergyObservation(0.75, { sleepQuality: 0.8, caffeine: true });

// Ou depuis l'état multimodal
engine.observeFromMultimodal(multimodalState, predictiveState);

// Chronotype détecté
const { type, confidence } = engine.getChronotype();
// → { type: 'earlyBird', confidence: 'medium' }

// État circadien
const circadian = engine.getCurrentCircadianState();
// → {
//   currentMoment: 'morning',
//   currentEnergy: 'high',
//   energyTrend: 'stable',
//   optimalForComplexTask: true,
//   optimalForCreativeTask: false,
//   ...
// }

// Résumé
console.log(engine.generateRhythmSummary());
// → "Chronotype: lève-tôt (confiance: medium)
//    Moment: matin, énergie élevé
//    Rythme suggéré: focused
//    Pause toutes les 35 min
//    Bon moment pour: travail en profondeur"
```

---

## Intégration des Engines

### Chaîne d'Analyse Complète

```typescript
import { MultimodalFusionEngine } from '@/engines/multimodal';
import { PredictiveStateEngine } from '@/engines/predictive';
import { StressRegulationEngine } from '@/engines/stress';
import { HumanRhythmEngine } from '@/engines/rhythm';

// 1. Démarrer tous les engines
const fusion = MultimodalFusionEngine.getInstance();
const predictive = PredictiveStateEngine.getInstance();
const stress = StressRegulationEngine.getInstance();
const rhythm = HumanRhythmEngine.getInstance();

fusion.start();
predictive.start();
stress.start();
rhythm.start();

// 2. Traitement d'un signal multimodal
const multimodalState = fusion.computeFusedState(voiceState, textState, visionState);

// 3. Analyse prédictive
const predictiveState = predictive.processMultimodalState(multimodalState);

// 4. Évaluation stress
const trigger = stress.shouldTriggerIntervention(
  multimodalState,
  predictiveState,
  agendaLoad,
  false
);

// 5. Observation rythme
rhythm.observeFromMultimodal(multimodalState, predictiveState);

// 6. Actions adaptées
if (trigger.shouldTrigger) {
  const recommendation = stress.selectInterventionType();
  // Proposer l'intervention à l'utilisateur
}

// Adapter le pacing selon le rythme
const pacing = rhythm.getCurrentPacing();
updateUIIntensity(pacing.suggestedIntensity);
scheduleBreak(pacing.suggestedBreakInterval);
```

### Callbacks de Mise à Jour

```typescript
// Notifications cross-engine
predictive.setStateUpdateCallback((state) => {
  if (state.requiresAttention) {
    stress.evaluateProactively(state);
  }
});

stress.setInterventionStartCallback((protocol) => {
  logToAnalytics('intervention_started', protocol.type);
});

rhythm.setStateUpdateCallback((state) => {
  updateCircadianUI(state.circadianState);
});
```

---

## Tests et Validation

### Résultats

```
 ✓ OPUS v∞.4 - PredictiveStateEngine (12 tests)
 ✓ OPUS v∞.5 - StressRegulationEngine (15 tests)
 ✓ OPUS v∞.6 - HumanRhythmEngine (16 tests)
 ✓ Utilitaires Human Rhythm (8 tests)
 ✓ Intégration OPUS Engines (2 tests)

 Test Files  1 passed (1)
      Tests  53 passed (53)
```

### Couverture

| Engine | Types | Engine | Index | Tests |
|--------|-------|--------|-------|-------|
| v∞.4 Predictive | ✅ | ✅ | ✅ | ✅ |
| v∞.5 Stress | ✅ | ✅ | ✅ | ✅ |
| v∞.6 Rhythm | ✅ | ✅ | ✅ | ✅ |

---

## Garde-fous Éthiques

### Principes Fondamentaux

1. **Non-clinique, non-thérapeutique**
   - Les interventions sont des suggestions de bien-être
   - Aucune prétention médicale ou psychologique

2. **Propositions, jamais d'impositions**
   - L'utilisateur peut toujours refuser
   - Pas de notifications intrusives

3. **Respect du refus**
   - Auto-désactivation après refus répétés
   - Pas de culpabilisation

4. **Transparence**
   - Explications humaines des prédictions
   - Raisons claires des suggestions

5. **Contrôle utilisateur**
   - Activation/désactivation de chaque feature
   - Configuration des seuils et fréquences

### Implémentation

```typescript
// Auto-désactivation après refus
if (consecutiveRejections >= 5) {
  console.log('Trop de refus, suggestion suspendue');
  return { shouldTrigger: false };
}

// Cooldown entre interventions
if (isCooldownActive()) {
  return { shouldTrigger: false, reason: 'Cooldown actif' };
}

// Fréquence max
if (hasReachedMaxFrequency()) {
  return { shouldTrigger: false, reason: 'Fréquence max atteinte' };
}
```

---

## Fichiers Créés

### OPUS v∞.4
- `src/types/predictiveState.ts` — Types (304 lignes)
- `src/engines/predictive/PredictiveStateEngine.ts` — Engine (873 lignes)
- `src/engines/predictive/index.ts` — Exports

### OPUS v∞.5
- `src/types/stressRegulation.ts` — Types (419 lignes)
- `src/engines/stress/StressRegulationEngine.ts` — Engine (704 lignes)
- `src/engines/stress/index.ts` — Exports

### OPUS v∞.6
- `src/types/humanRhythm.ts` — Types (420 lignes)
- `src/engines/rhythm/HumanRhythmEngine.ts` — Engine (760 lignes)
- `src/engines/rhythm/index.ts` — Exports

### Tests
- `src/__tests__/opus-engines.test.ts` — 53 tests

---

## Prochaines Étapes

1. **Intégration UI** — Composants React pour les interventions
2. **Persistence** — Sauvegarde des patterns appris
3. **Analytics** — Métriques d'usage et efficacité
4. **Personnalisation** — Configuration avancée par utilisateur

---

**© 2025 Kevin Thibault / TITANE Team. Tous droits réservés.**

*OPUS v∞.4, v∞.5, v∞.6 — Intelligence prédictive et adaptative pour TITANE∞*
