# TITANE∞ v24.30 - GUIDE UTILISATEUR COMPLET

## 📚 Table des Matières

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Premiers Pas](#premiers-pas)
4. [Système Autonome](#système-autonome)
5. [Optimisation Cognitive](#optimisation-cognitive)
6. [Mode Développeur](#mode-développeur)
7. [Configuration Avancée](#configuration-avancée)
8. [Dépannage](#dépannage)

---

## Introduction

TITANE∞ v24.30 est un système IA autonome de nouvelle génération intégrant :

- **Système Autonome** - Auto-maintenance, auto-réparation, auto-évolution
- **Optimisation Cognitive** - Contexte long 4-50k tokens, compression intelligente
- **Exécution Temps Réel** - 60 FPS, priorités audio/avatar/UI
- **Fusion Unifiée** - 14 engines orchestrés en 9 étapes
- **Mode Développeur** - 7 commandes de génération de code

---

## Installation

### Prérequis

```bash
- Node.js 18+
- Rust 1.70+
- npm 9+
```

### Installation Standard

```bash
# 1. Cloner le projet
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Installer dépendances
pnpm install

# 3. Build production
pnpm run build

# 4. Lancer TITANE∞
pnpm run tauri:dev
```

---

## Premiers Pas

### 1. Démarrage Interface

```typescript
import { FusionEngine } from '@/core/singularity/SingularityFusionEngine';
import { AutonomyEngine } from '@/core/autonomy/SingularityAutonomyEngine';

// Initialiser Fusion Engine
await FusionEngine.initialize(initialState);

// Démarrer système autonome
AutonomyEngine.start(); // Cycle 30s
```

### 2. Envoyer Message

```typescript
// Exécuter cycle complet
const result = await FusionEngine.executeSingularityCycle({
  userMessage: 'Bonjour TITANE',
  conversationHistory: [],
  userPreferences: {
    theme: 'metal',
    voice: 'default',
  },
});

console.log(result.response_text); // "Bonjour ! Comment puis-je vous aider ?"
```

### 3. Vérifier État Système

```typescript
import { AutonomyEngine } from '@/core/autonomy/SingularityAutonomyEngine';

const state = AutonomyEngine['autonomyState'];

console.log(`Health: ${state.health_score}/100`);
console.log(`Stability: ${state.stability_index}/100`);
console.log(`Cycles: ${state.cycle_count}`);
```

---

## Système Autonome

### Fonctions Automatiques (10)

Le système autonome s'exécute toutes les 30 secondes :

1. **auto_scan** - Scanner backend/frontend
2. **auto_detect** - Détecter anomalies
3. **auto_fix** - Corriger automatiquement
4. **auto_heal** - Guérir composants
5. **auto_optimize** - Optimiser performances
6. **auto_evolve** - Évoluer capacités
7. **auto_test** - Lancer tests automatiques
8. **auto_shield** - Activer protections
9. **auto_analyse** - Analyser causes racines
10. **auto_report** - Générer rapports

### Configuration

```typescript
// Démarrer avec configuration personnalisée
AutonomyEngine.start();

// Arrêter système autonome
AutonomyEngine.stop();

// Forcer cycle manuel
await AutonomyEngine['autonomousCycle']();
```

### Métriques

```typescript
const metrics = {
  health_score: 95,        // 0-100
  stability_index: 98,     // 0-100
  pipeline_integrity: 100, // 0-100
  cycle_count: 42,
  errors_fixed: 12,
  optimizations_applied: 8,
};
```

---

## Optimisation Cognitive

### Context Long (4-50k tokens)

```typescript
import { CognitiveOptimizer } from '@/core/cognitive/CognitiveOptimizationEngine';

// Optimiser contexte long
const result = await CognitiveOptimizer.optimizeFullPipeline(
  'Message utilisateur',
  longHistory // 200+ messages
);

console.log(`Tokens: ${result.optimized_context.total_tokens}`);
console.log(`Compression: ${result.optimized_context.compression_ratio}`);
```

### Compression Contextuelle

```typescript
import { ContextOptimizer } from '@/core/context/LongContextOptimizer';

// Compresser 50k → 8k tokens
const compressed = await ContextOptimizer.compressContext(messages, {
  maxTokens: 8000,
  targetRatio: 0.16, // 1:6 compression
  preserveRecent: 10,
});

console.log(`Saved: ${compressed.original_tokens - compressed.compressed_tokens} tokens`);
console.log(`Preservation: ${compressed.semantic_preservation * 100}%`);
```

### Grouping Sémantique

```typescript
// Grouper messages par similarité
const groups = await ContextOptimizer.semanticGrouping(messages, {
  numGroups: 5,
  algorithm: 'kmeans',
});

groups.forEach(group => {
  console.log(`Topic: ${group.topic} (${group.messages.length} messages)`);
});
```

---

## Mode Développeur

### Commandes Disponibles

```typescript
import { DevMode } from '@/core/devmode/DevModeEngine';

// 1. PATCH - Corriger bug
const patch = await DevMode.patch({
  location: {
    file_path: 'src/components/ChatPanel.tsx',
    start_line: 45,
    end_line: 60,
  },
  issue_description: 'Memory leak in useEffect',
  expected_behavior: 'Cleanup on unmount',
});

// 2. REFACTOR - Améliorer code
const refactor = await DevMode.refactor({
  location: { /* ... */ },
  refactor_type: 'extract_function',
});

// 3. AUDIT - Analyser qualité
const audit = await DevMode.audit({
  scope: 'file',
  target_path: 'src/core/autonomy/SingularityAutonomyEngine.ts',
  checks: ['quality', 'performance', 'security'],
});

console.log(`Issues: ${audit.total_issues}`);
console.log(`Quality: ${audit.code_quality_score}/100`);
```

### Auto-Fix Issues

```typescript
// Auto-corriger tous les issues détectés
const auditResult = await DevMode.audit({ /* ... */ });
const fixes = await DevMode.autoFixAuditIssues(auditResult);

console.log(`Fixed: ${fixes.fixed_count}`);
console.log(`Failed: ${fixes.failed_count}`);
```

---

## Configuration Avancée

### Real-Time Engine

```typescript
import { RealtimeEngine } from '@/core/realtime/RealTimeExecutionEngine';

// Démarrer à 120 FPS
RealtimeEngine.start(120);

// Enqueue tâches avec priorités
RealtimeEngine.enqueueAudio(audioBuffer, { /* options */ }); // critical
RealtimeEngine.enqueueAvatar(animation, { /* options */ });   // high
RealtimeEngine.enqueueUIEvent(event, { /* options */ });      // normal
RealtimeEngine.enqueueNetwork(payload, { /* options */ });    // low

// Métriques
const metrics = RealtimeEngine['metrics'];
console.log(`FPS: ${metrics.fps.toFixed(1)}`);
console.log(`Dropped: ${metrics.droppedFrames}`);
```

### Fusion Engine

```typescript
// Configurer pipeline 9 étapes
const result = await FusionEngine.executeSingularityCycle({
  userMessage: 'Message',
  conversationHistory: optimizedHistory,
  userPreferences: {
    theme: 'neon',
    intensity: 0.8,
    motion: true,
  },
});

// Statistiques par étape
console.log('Step 1 (Analyse):', result.stats.step1_analyse_ms, 'ms');
console.log('Step 4 (Generation):', result.stats.step4_generation_ms, 'ms');
console.log('Total:', result.stats.total_cycle_ms, 'ms');
```

---

## Dépannage

### Problème: Cycle Autonome Trop Lent

```typescript
// Solution: Augmenter intervalle
// Dans SingularityAutonomyEngine.ts
private readonly SCAN_INTERVAL_MS = 60000; // 60s au lieu de 30s
```

### Problème: Compression Trop Agressive

```typescript
// Solution: Ajuster ratio cible
const compressed = await ContextOptimizer.compressContext(messages, {
  targetRatio: 0.3, // Plus conservateur (1:3 au lieu de 1:5)
  preserveRecent: 15, // Garder plus de messages récents
});
```

### Problème: FPS Instable

```typescript
// Solution: Réduire charge de travail
RealtimeEngine.start(30); // 30 FPS au lieu de 60

// Ou augmenter budget frame
// Dans RealTimeExecutionEngine.ts
private readonly FRAME_TIME_BUDGET = 0.9; // 90% au lieu de 80%
```

### Logs Debug

```typescript
// Activer logs détaillés
console.log('[AutonomyEngine] State:', AutonomyEngine['autonomyState']);
console.log('[RealtimeEngine] Metrics:', RealtimeEngine['metrics']);
console.log('[DevMode] History:', DevMode.getRecentHistory(20));
```

---

## Support

- **Documentation**: `/docs`
- **Issues**: GitHub Issues
- **Email**: kevin.thibault@humaintotal.com

---

© 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
