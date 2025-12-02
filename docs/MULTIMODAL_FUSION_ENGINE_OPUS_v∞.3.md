# 🔥 MULTIMODAL FUSION ENGINE — OPUS v∞.3

## Documentation Technique TITANE∞ ONE

---

## 📋 Vue d'ensemble

Le **Multimodal Fusion Engine** est le cœur de l'intelligence adaptative de TITANE∞. Il unifie trois flux de signaux pour créer un **profil multimodal complet** de l'utilisateur :

```
Vision (BodyLanguage) ─┐
                       │
Voice (Audio FFT) ─────┼─► MultimodalFusionEngine ─► État Unifié ─► Chat IA Adaptatif
                       │          │
Text (NLP markers) ────┘          ▼
                           BaselineFusionProfile
```

### Principes Fondamentaux

1. **Indices, pas diagnostic** — Le système infère des tendances, jamais des états émotionnels profonds
2. **100% local** — Aucune donnée audio/vidéo n'est transmise ou stockée
3. **Toujours nuancé** — Les classifications sont prudentes et demandent confirmation
4. **Explicable** — Chaque estimation peut être justifiée

---

## 🏗️ Architecture

### Fichiers Principaux

| Fichier | Description |
|---------|-------------|
| `src/types/multimodalFusion.ts` | Types TypeScript complets |
| `src/engines/multimodal/VoiceAnalysisEngine.ts` | Extraction features vocales (FFT) |
| `src/engines/multimodal/TextAnalysisEngine.ts` | Extraction features textuelles |
| `src/engines/multimodal/MultimodalFusionEngine.ts` | Moteur de fusion principal |
| `src/services/multimodal/multimodalIntentHandler.ts` | Détection d'intentions |
| `src/stores/useMultimodalStore.ts` | Store Zustand persistant |

### Diagramme de Classes

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MultimodalFusionEngine                          │
│  ┌───────────────────┐  ┌───────────────────┐  ┌────────────────┐ │
│  │ VoiceAnalysisEngine│  │ TextAnalysisEngine │  │  VisionState   │ │
│  │ (Web Audio API)   │  │ (NLP Markers)      │  │ (BodyLanguage) │ │
│  └─────────┬─────────┘  └─────────┬──────────┘  └───────┬────────┘ │
│            │                      │                      │          │
│            └──────────────────────┼──────────────────────┘          │
│                                   ▼                                 │
│                         ┌─────────────────┐                        │
│                         │ Fusion Algorithm │                        │
│                         │ (Weighted + EMA) │                        │
│                         └────────┬────────┘                        │
│                                  ▼                                  │
│                         ┌─────────────────┐                        │
│                         │ MultimodalState  │                        │
│                         └─────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Modalités

### 1. Vision (v∞.1 + v∞.2)

**Source:** `BodyLanguageEngine` via MediaPipe Holistic

| Signal | Description | Range |
|--------|-------------|-------|
| `postureScore` | Score de posture corporelle | 0–1 |
| `movementScore` | Niveau de mouvement | 0–1 |
| `gazeStabilityScore` | Stabilité du regard | 0–1 |
| `visualEnergyLevel` | Énergie visuelle perçue | 0–1 |
| `visualTensionLevel` | Tension corporelle | 0–1 |

### 2. Voix (Audio)

**Source:** `VoiceAnalysisEngine` via Web Audio API (AnalyserNode + FFT)

| Feature | Description | Extraction |
|---------|-------------|------------|
| `intensity` | Intensité vocale | RMS du signal |
| `toneStability` | Stabilité du ton | Variance du pitch |
| `speechRate` | Vitesse d'élocution | Crossings/sec |
| `tremor` | Tremblements | HF variation RMS |
| `breathingLoad` | Charge respiratoire | Pause patterns |

### 3. Texte (Chat)

**Source:** `TextAnalysisEngine` via NLP markers

| Marker | Description | Indicateur |
|--------|-------------|------------|
| `messageLength` | Longueur du message | Charge cognitive |
| `wordComplexity` | Complexité lexicale | Clarté mentale |
| `punctuationDensity` | Usage ponctuation | Émotion/urgence |
| `energyMarkers` | "!!!", "..." etc. | État énergétique |
| `selfDeclarations` | "je suis fatigué" | État déclaré |

---

## 🧮 Algorithme de Fusion

### Étape 1 — Pondération Dynamique

```typescript
// Poids par défaut (multimodal complet)
const weights = {
  vision: 0.40,  // Si caméra active
  voice: 0.30,   // Si audio actif
  text: 0.30     // Toujours disponible
};

// Ajustement selon disponibilité
if (!cameraActive) weights.vision = 0;
if (!audioActive) weights.voice = 0;
// Redistribution automatique
```

### Étape 2 — Fusion Linéaire Pondérée

```typescript
global_energy = wv * v_energy + wa * a_energy + wt * t_energy
global_tension = wv * v_tension + wa * a_tension + wt * t_charge
global_engagement = wv * v_engagement + wa * a_stability + wt * t_engagement
```

### Étape 3 — Correction Baseline

```typescript
corrected_energy = global_energy - baselineEnergyShift
corrected_tension = global_tension - baselineTensionShift
corrected_engagement = global_engagement - baselineEngagementShift
```

### Étape 4 — Lissage Temporel (EMA)

```typescript
smoothed = α * current + (1-α) * previous
// α = 0.2 par défaut (réactivité modérée)
```

### Étape 5 — Classification Prudente

| Niveau | Range | Description |
|--------|-------|-------------|
| `low` | 0.0–0.35 | Faible |
| `medium` | 0.35–0.65 | Modéré |
| `high` | 0.65–1.0 | Élevé |

---

## 🎯 Intentions Détectées

Le `multimodalIntentHandler` détecte 7 intentions principales :

| Intent | Déclencheur | Action Chat IA |
|--------|-------------|----------------|
| `askClarification` | Haute ambiguité textuelle | Reformuler la réponse |
| `expressEmotionalNeed` | Haute tension multimodale | Ton empathique |
| `seekTechnicalHelp` | Marqueurs techniques | Mode expert |
| `givePositiveFeedback` | Signaux positifs | Renforcement |
| `expressConfusion` | Faible clarté + engagement | Simplifier |
| `requestPause` | Faible énergie globale | Proposer pause |
| `continueNormally` | Signaux stables | Conversation standard |

---

## 🔧 API Publique

### MultimodalFusionEngine

```typescript
// Singleton
const engine = MultimodalFusionEngine.getInstance();

// Démarrage
await engine.start();

// Obtenir l'état actuel
const state: MultimodalState = engine.getCurrentState();

// Analyser un message texte
engine.processTextMessage(message: string);

// Injecter état vision externe
engine.setVisionCallback(() => visionState);

// Mettre à jour le baseline
engine.updateFusionBaseline();

// Ajuster les poids
engine.setWeights({ vision: 0.5, voice: 0.25, text: 0.25 });

// Arrêt
engine.stop();
```

### multimodalIntentHandler

```typescript
import { detectMultimodalIntent, generateAdaptiveResponse } from '@/services/multimodal';

// Détecter l'intention
const intent = detectMultimodalIntent(multimodalState, userMessage);

// Générer une réponse adaptée
const response = generateAdaptiveResponse(intent, multimodalState);
```

### useMultimodalStore (Zustand)

```typescript
import { useMultimodalStore } from '@/stores/useMultimodalStore';

// Dans un composant React
const {
  state,
  isRunning,
  baseline,
  startEngine,
  stopEngine,
  processMessage,
  updateBaseline
} = useMultimodalStore();
```

---

## 📈 Baseline Profile

Le système apprend les patterns personnels de l'utilisateur :

### Profils par Modalité

```typescript
interface BaselineVoiceProfile {
  baselineVoiceEnergy: number;
  baselineVoiceStability: number;
  baselineVoiceRhythm: number;
  baselineVoiceRange: [number, number];
}

interface BaselineTextProfile {
  baselineTextEnergy: number;
  baselineTextClarity: number;
  baselineTextCadence: number;
  avgMessageLength: number;
}
```

### Profil Fusion Global

```typescript
interface BaselineFusionProfile {
  globalEnergyCurve: number[];      // Historique énergie
  globalTensionCurve: number[];     // Historique tension
  globalStabilityMap: Map<string, number>;
  correlationMatrix: CorrelationMatrix;
  sampleCount: number;
  lastUpdate: number;
}
```

### Apprentissage

```
"Enregistre cet état" → Snapshot multimodal → Update baseline

Patterns appris:
- Le matin: voix plus lente, énergie stable
- Le soir: messages plus courts
- Concentration: posture ouverte, texte clair
- Stress: voix accélérée, regard instable
```

---

## 💬 Intégration Chat IA

### Commandes Utilisateur

| Commande | Action |
|----------|--------|
| "Comment tu me perçois ?" | Rapport multimodal complet |
| "Mon état maintenant ?" | Estimation instantanée |
| "Analyse-moi" | Déclenchement ANALYZE_MULTIMODAL |
| "Enregistre cet état" | TRAIN_BASELINE_MULTIMODAL |
| "C'est mon calme" | Label + baseline update |

### Exemple de Réponse

```
"D'après les indices visuels (posture stable, mouvement faible),
vocaux (voix fluide, rythme constant) et textuels (phrases courtes
mais claires), je perçois une énergie légèrement sous ta moyenne,
une tension modérée, et une bonne capacité d'attention.

Ce n'est qu'une estimation. Est-ce que ça te paraît juste ?"
```

---

## ⚠️ Règles Éthiques

1. **Jamais d'interprétation clinique** — Pas de diagnostic médical
2. **Toujours nuancé** — Classifications prudentes
3. **Toujours explicable** — Origine des indices transparente
4. **100% local** — Aucune transmission de données
5. **Jamais de certitude** — Probabilités, pas d'affirmations
6. **Demander confirmation** — Valider avec l'utilisateur
7. **Pas de stockage brut** — Features uniquement, pas audio/vidéo

---

## 🧪 Tests

```bash
# Lancer les tests multimodaux
npm run test -- src/__tests__/multimodal-fusion.test.ts

# Avec couverture
npm run test:coverage -- src/__tests__/multimodal-fusion.test.ts
```

### Scénarios Couverts

- ✅ Mode vision-only
- ✅ Mode voice-only
- ✅ Mode text-only
- ✅ Mode full multimodal
- ✅ Apprentissage baseline
- ✅ Ajustement des poids
- ✅ Détection d'intentions
- ✅ Lissage temporel EMA
- ✅ Seuils de confiance

---

## 📦 Dépendances

| Package | Usage |
|---------|-------|
| `zustand` | State management |
| `@mediapipe/holistic` | Vision (externe) |
| Web Audio API | Voice analysis (natif) |
| TypeScript | Types stricts |

---

## 🚀 Évolutions Futures

- [ ] Modèle ML embarqué pour prédictions avancées
- [ ] Détection de patterns temporels (journée/semaine)
- [ ] Intégration calendrier pour contexte
- [ ] Export anonymisé des baselines
- [ ] Mode "coach" avec suggestions proactives

---

© 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
