# OPUS v∞.7 / v∞.8 / v∞.9 — Presence, Flow & Resonance

## Vue d'ensemble

Ce document décrit l'implémentation des trois moteurs conscients de TITANE∞ :

- **OPUS v∞.7 — Presence Engine** : Perception continue et alignement adaptatif
- **OPUS v∞.8 — Focus & Flow Engine** : Guidance vers et à travers l'état de flow
- **OPUS v∞.9 — Conversational Resonance Engine** : Synchronisation expressive et adaptabilité linguistique

---

## OPUS v∞.7 — Presence Engine

### Philosophie

La présence n'est pas une émotion. C'est :
- **Attention** : Où est dirigée la conscience ?
- **Cohérence** : Les signaux sont-ils alignés ?
- **Continuité** : L'état est-il stable dans le temps ?
- **Alignement** : La réponse correspond-elle au besoin ?

### Architecture

```
src/
├── types/
│   └── presence.ts           # Types et interfaces
└── engines/
    └── presence/
        ├── PresenceEngine.ts # Moteur principal
        ├── index.ts          # Exports
        └── __tests__/
            └── PresenceEngine.test.ts
```

### Types principaux

```typescript
// Intention émergente détectée
type EmergentIntent =
  | 'advance'     // Veut progresser
  | 'organize'    // Veut structurer
  | 'express'     // Veut s'exprimer
  | 'slow'        // Besoin de lenteur
  | 'anchor'      // Besoin d'ancrage
  | 'understand'  // Veut comprendre
  | 'unknown';    // Non déterminé

// Style de présence
type PresenceStyle =
  | 'concise'     // Bref et direct
  | 'spacious'    // Aéré, avec respiration
  | 'structured'  // Organisé, séquentiel
  | 'supportive'  // Soutenant, chaleureux
  | 'directive';  // Guidant, orienté action
```

### API principale

```typescript
const engine = PresenceEngine.getInstance();

// Détecter l'intention
const intent = engine.inferEmergentIntent(multimodalState, "Je veux avancer");

// Calculer le style approprié
const style = engine.computePresenceStyle(intent.intent, tension, energy);

// Calculer l'alignement
const alignment = engine.computeAlignmentScore(multimodalState, style.style);

// Calculer la modulation de réponse
const modulation = engine.computeResponseModulation(multimodalState);

// Processus complet
const result = engine.process(multimodalState, text, predictiveState);
```

### Détection d'intention

Le système analyse :
1. **Signaux textuels** : Verbes d'action, marqueurs d'hésitation, mots d'organisation
2. **Signaux multimodaux** : Énergie, tension, engagement, stabilité
3. **Contexte** : Moment de la journée, durée de session, intentions récentes

---

## OPUS v∞.8 — Focus & Flow Engine

### Philosophie

Le flow est cet état où :
- L'action et la conscience fusionnent
- Le temps s'écoule différemment
- La performance atteint son apogée

Le moteur guide l'utilisateur vers et à travers cet état.

### Architecture

```
src/
├── types/
│   └── flow.ts              # Types et interfaces
└── engines/
    └── flow/
        ├── FlowEngine.ts    # Moteur principal
        ├── index.ts         # Exports
        └── __tests__/
            └── FlowEngine.test.ts
```

### Types principaux

```typescript
// Zone de Csikszentmihalyi
type FlowZone =
  | 'anxiety'    // Challenge trop élevé
  | 'flow'       // Équilibre parfait
  | 'boredom'    // Challenge trop faible
  | 'apathy'     // Faible engagement
  | 'control'    // Maîtrise élevée
  | 'relaxation' // Détente
  | 'arousal'    // Proche du flow
  | 'worry';     // Inquiétude

// Phase du cycle
type FlowPhase =
  | 'preparation' // Préparation
  | 'struggle'    // Phase de lutte
  | 'release'     // Lâcher-prise
  | 'flow'        // Flow actif
  | 'recovery'    // Récupération
  | 'idle';       // Inactif
```

### API principale

```typescript
const engine = FlowEngine.getInstance();

// Évaluer la préparation au flow
const readiness = engine.computeFocusReadiness(multimodalState);

// Entrer en flow
const entry = engine.enterFlow(multimodalState);

// Maintenir le flow
const maintenance = engine.maintainFlow(multimodalState);

// Détecter les dérives
const drift = engine.detectFlowDrift(multimodalState);

// Sortir du flow
const exit = engine.exitFlow('graceful');

// Processus complet
const result = engine.process(multimodalState, predictiveState);
```

### Conditions de flow

Le système évalue :
- **Objectifs clairs** : L'utilisateur sait-il ce qu'il veut faire ?
- **Feedback immédiat** : Reçoit-il des retours rapides ?
- **Équilibre défi/compétence** : Le défi est-il adapté ?
- **Distractions** : L'environnement est-il propice ?
- **Énergie** : Le niveau d'énergie est-il suffisant ?

---

## OPUS v∞.9 — Conversational Resonance Engine

### Philosophie

La résonance conversationnelle, c'est l'art de parler la même langue émotionnelle que l'autre.

Le moteur :
- Analyse le style linguistique de l'utilisateur
- Adapte dynamiquement le ton et le rythme
- Synchronise l'expression
- Apprend les préférences

### Architecture

```
src/
├── types/
│   └── resonance.ts                    # Types et interfaces
└── engines/
    └── resonance/
        ├── ConversationalResonanceEngine.ts
        ├── index.ts
        └── __tests__/
            └── ConversationalResonanceEngine.test.ts
```

### Types principaux

```typescript
// Style linguistique
type LinguisticStyle =
  | 'formal'      // Professionnel
  | 'casual'      // Familier
  | 'technical'   // Précis
  | 'poetic'      // Métaphorique
  | 'direct'      // Concis
  | 'elaborated'  // Détaillé
  | 'empathetic'  // Chaleureux
  | 'neutral';    // Équilibré

// Ton émotionnel
type EmotionalTone =
  | 'warm'        // Chaleureux
  | 'calm'        // Calme
  | 'energetic'   // Énergique
  | 'supportive'  // Soutenant
  | 'focused'     // Concentré
  | 'playful'     // Ludique
  | 'serious'     // Sérieux
  | 'reassuring'  // Rassurant
  | 'neutral';    // Neutre
```

### API principale

```typescript
const engine = ConversationalResonanceEngine.getInstance();

// Analyser un message utilisateur
const analysis = engine.analyzeUserMessage(text, multimodalState);

// Adapter le ton
const tone = engine.adaptTone('neutral', multimodalState, presenceState);

// Synchroniser le rythme
const rhythm = engine.synchronizeRhythm(analysis.analysis, multimodalState);

// Générer les paramètres de réponse
const params = engine.generateResponseParameters(text, multimodalState);

// Processus complet
const result = engine.process(text, multimodalState, presenceState);
```

### Analyse linguistique

Le système analyse :
- **Métriques de base** : Nombre de mots, phrases, longueurs moyennes
- **Complexité** : Vocabulaire, lisibilité
- **Style** : Formel, casual, technique...
- **Ton** : Chaleureux, énergique, calme...
- **Rythme** : Rapide, modéré, lent

---

## Intégration entre moteurs

### Flux de données

```
MultimodalState ─┬─► PresenceEngine ─────► PresenceState
                 │
                 ├─► FlowEngine ──────────► FlowState
                 │
                 └─► ResonanceEngine ─────► ResonanceState
                           │
                           ▼
                   ResponseModulation
```

### Exemple d'utilisation combinée

```typescript
// 1. Analyser la présence
const presence = presenceEngine.process(multimodalState, userText);

// 2. Évaluer le flow
const flow = flowEngine.process(multimodalState, predictiveState);

// 3. Calculer la résonance
const resonance = resonanceEngine.process(userText, multimodalState, presence);

// 4. Combiner pour la réponse
const responseParams = {
  style: presence.style.style,
  tone: resonance.parameters.toneModulation.baseTone,
  length: presence.modulation.targetLength,
  rhythm: resonance.parameters.rhythmSync.baseRhythm,
  inFlow: flow.phase === 'flow',
};
```

---

## Tests

### Couverture

| Module | Tests | Statut |
|--------|-------|--------|
| PresenceEngine | 32 | ✅ |
| FlowEngine | 35 | ✅ |
| ConversationalResonanceEngine | 40 | ✅ |
| **Total** | **107** | **✅** |

### Exécution

```bash
# Tests des trois moteurs
npx vitest run src/engines/presence src/engines/flow src/engines/resonance

# Avec couverture
npx vitest run --coverage src/engines/presence src/engines/flow src/engines/resonance
```

---

## Fichiers créés

### Types
- `src/types/presence.ts` (~300 lignes)
- `src/types/flow.ts` (~350 lignes)
- `src/types/resonance.ts` (~400 lignes)

### Moteurs
- `src/engines/presence/PresenceEngine.ts` (~650 lignes)
- `src/engines/flow/FlowEngine.ts` (~700 lignes)
- `src/engines/resonance/ConversationalResonanceEngine.ts` (~600 lignes)

### Tests
- `src/engines/presence/__tests__/PresenceEngine.test.ts` (~300 lignes)
- `src/engines/flow/__tests__/FlowEngine.test.ts` (~350 lignes)
- `src/engines/resonance/__tests__/ConversationalResonanceEngine.test.ts` (~400 lignes)

---

## Prochaines étapes

### OPUS v∞.10+
- [ ] **Temporal Coherence Engine** : Mémoire et continuité temporelle
- [ ] **Adaptive Learning Engine** : Apprentissage des patterns utilisateur
- [ ] **Multi-Agent Orchestrator** : Coordination des moteurs

### Intégrations
- [ ] Connecter au VoiceAnalysisEngine pour speechRate
- [ ] Connecter à l'AgendaEngine pour le contexte calendrier
- [ ] Intégrer dans le ChatManager principal

---

*© 2025 Kevin Thibault / TITANE Team. Tous droits réservés.*
