# 🏗️ ARCHITECTURE EN ANNEAUX — TITANE∞

**Version**: v24.2.0  
**Date**: 15 décembre 2025  
**Statut**: DÉFINITIF

---

## 📐 Vue d'Ensemble

TITANE∞ suit une **architecture en anneaux concentriques** inspirée des principes de Clean Architecture et Domain-Driven Design. Cette organisation garantit la séparation des responsabilités, la testabilité et l'évolutivité du système.

## Diagrams

- Mermaid canon: [docs/diagrams/README.md](docs/diagrams/README.md)
- Anneaux: [architecture_4_ring](docs/diagrams/rendered/architecture_4_ring.md)

```
┌─────────────────────────────────────────────────────────┐
│                    ANNEAU 4: OS                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │             ANNEAU 3: SERVICES                    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │          ANNEAU 2: ENGINES                  │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │       ANNEAU 1: CORE                  │  │  │  │
│  │  │  │  ┌─────────────────────────────────┐  │  │  │  │
│  │  │  │  │   KERNEL (Pure Domain Logic)    │  │  │  │  │
│  │  │  │  └─────────────────────────────────┘  │  │  │  │
│  │  │  │                                       │  │  │  │
│  │  │  │  • Pipeline OMEGA v2                 │  │  │  │
│  │  │  │  • SingularityEngine                 │  │  │  │
│  │  │  │  • Types & Contracts                 │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  │                                             │  │  │
│  │  │  • 9 Moteurs Cognitifs (Pure Logic)        │  │  │
│  │  │  • Fonctions Pures & Testables             │  │  │
│  │  │  • ZÉRO I/O, ZÉRO Logs                     │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                    │  │
│  │  • Tauri Commands, FS, DB, APIs                   │  │
│  │  • I/O Operations, External Integrations          │  │
│  │  • NO Business Logic                              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  • Event Orchestration, Permissions, Lifecycle          │
│  • System-level Coordination                            │
│  • Logging & Monitoring                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Règles Fondamentales

### ⚖️ Principe de Dépendance

**La règle d'or** : **Les dépendances pointent TOUJOURS vers l'intérieur**

```
OS → Services → Engines → Core
 ✅              ✅         ✅
 ❌  ← ← ← ← ← ← ← ← ← ← ← 
```

- ✅ **AUTORISÉ**: Core → Types, Engines → Core, Services → Engines, OS → Services
- ❌ **INTERDIT**: Engines → Services, Core → Engines, Services → OS

### 🔒 Isolation des Responsabilités

| Anneau | Peut faire | Ne peut PAS faire |
|--------|------------|-------------------|
| **Core** | Définir types, contrats, pipeline | I/O, logs, invoke Tauri |
| **Engines** | Logique métier pure, calculs | I/O, appels API, logs |
| **Services** | I/O, API calls, Tauri invoke | Logique métier, décisions |
| **OS** | Orchestration, permissions, logs | Logique métier, calculs |

---

## 🧱 ANNEAU 1: CORE

**Rôle**: Définit les contrats, types et pipelines centraux du système.

### 📂 Structure Frontend

```
src/core/
├── index.ts                    # Exports centralisés
├── types/                      # Types TypeScript fondamentaux
│   ├── cognitive.types.ts
│   ├── memory.types.ts
│   └── omega.types.ts
├── kernels/                    # Kernels cognitifs (Phase 1 Option B)
│   ├── cognitiveKernel.ts     # Noyau cognitif v22Ω
│   ├── metaKernel.ts          # Méta-réflexivité v∞Ω
│   └── singularityKernel.ts   # Validation & cohérence
└── omega/                      # Pipeline OMEGA v2
    ├── pipeline.ts
    ├── types.ts
    └── utils.ts
```

### 📂 Structure Backend

```
src-tauri/src/core/
├── mod.rs                      # Module principal
├── engine.rs                   # SingularityEngine
├── state.rs                    # SingularityState
├── types.rs                    # Types Rust core
└── modules/
    ├── coherence_engine.rs
    ├── unified_memory.rs
    ├── harmonia_module.rs
    └── system_health.rs
```

### ✅ Règles Core

1. **Pureté**: Aucune entrée/sortie (pas de `fs`, `fetch`, `invoke`)
2. **Types stricts**: TypeScript strict mode, Rust sans `unwrap()`
3. **Testabilité**: 100% de couverture de tests
4. **Documentation**: Chaque fonction publique documentée

### ❌ Interdictions Core

```typescript
// ❌ INTERDIT
import { invoke } from '@tauri-apps/api/core';
import { readFile } from 'fs/promises';
console.log('Hello'); // Logging direct

// ✅ AUTORISÉ
import { Memory } from '../types/memory';
export function processMemory(data: Memory): ProcessedMemory {
  return { ...data, processed: true };
}
```

---

## ⚙️ ANNEAU 2: ENGINES

**Rôle**: Logique métier pure, algorithmes cognitifs, traitement de données.

### 📂 Structure (9 Moteurs)

```
src/engines/
├── index.ts                    # Exports moteurs
├── orchestrator/               # #0 OMEGA Orchestrator
│   └── OmegaOrchestrator.ts
├── style/                      # #1 Style Engine
│   ├── expressionEngine.ts
│   └── uiuxEngine.ts
├── coherence/                  # #2 CoherenceEngine (NEW)
│   ├── CoherenceEngine.ts
│   ├── validation/
│   ├── coordination/
│   └── registry/
├── reflection/                 # #3 Reflection Engine
│   └── metaSingularityKernel.ts
├── emotion/                    # #4 Emotion Engine
│   └── emotionEngine.ts
├── memory/                     # #5 UnifiedMemory
│   ├── UnifiedMemoryEngine.ts
│   ├── stm/                    # Short-term
│   ├── mtm/                    # Medium-term
│   └── ltm/                    # Long-term
├── behavior/                   # #6 Behavior Engine
│   └── behaviorEngine.ts
├── adaptation/                 # #7 Adaptation Engine
│   └── adaptationEngine.ts
├── systemHealth/               # #8 SystemHealth
│   ├── SystemHealthEngine.ts
│   ├── monitoring/
│   ├── healing/
│   └── balance/
└── conversation/               # #9 ConversationOS
    └── ConversationOS.ts
```

### 🎯 Caractéristiques Engines

1. **Fonctions pures**: Pas d'effets de bord
2. **Testabilité**: Tests unitaires isolés
3. **Composition**: Engines communiquent via interfaces
4. **Stateless**: Pas d'état interne mutable (sauf caches locaux)

### ✅ Exemple Conforme

```typescript
// ✅ Engine pur - emotionEngine.ts
export class EmotionEngine {
  // Fonction pure: même input → même output
  analyzeEmotion(text: string): EmotionResult {
    const sentiment = this.detectSentiment(text);
    const intensity = this.calculateIntensity(text);
    
    return {
      dominant: sentiment,
      intensity,
      confidence: 0.85,
    };
  }

  // Pas de I/O, pas de logs
  private detectSentiment(text: string): Emotion {
    // Logique pure
    if (text.includes('joyeux')) return 'joy';
    if (text.includes('triste')) return 'sadness';
    return 'neutral';
  }
}
```

### ❌ Exemple Non-Conforme

```typescript
// ❌ Engine avec I/O - INTERDIT
export class BadEngine {
  async processData(input: string): Promise<Result> {
    // ❌ Appel I/O dans un engine
    const data = await invoke('fetch_data', { input });
    
    // ❌ Logging direct
    console.log('Processing:', input);
    
    // ❌ Accès service
    await this.saveToDatabase(data);
    
    return data;
  }
}
```

### 🔍 Imports Autorisés

```typescript
// ✅ AUTORISÉ
import { Memory } from '@/core/types/memory';
import { cognitiveKernel } from '@/core/kernels/cognitiveKernel';
import { EmotionEngine } from '@/engines/emotion';

// ❌ INTERDIT
import { invoke } from '@tauri-apps/api/core';
import { tauriService } from '@/services/tauri';
import { logger } from '@/os/logging';
```

---

## 🌐 ANNEAU 3: SERVICES

**Rôle**: Interface avec le monde extérieur (I/O, APIs, Tauri, FS, DB).

### 📂 Structure

```
src/services/
├── index.ts
├── tauri/                      # Tauri IPC Layer
│   ├── backend-v17.2.commands.ts
│   ├── conversationService.ts
│   └── memoryService.ts
├── ai/                         # AI Providers
│   ├── geminiService.ts
│   ├── ollamaService.ts
│   └── openaiService.ts
├── storage/                    # Storage Layer
│   ├── fileService.ts
│   └── dbService.ts
├── audio/                      # Audio I/O
│   ├── ttsService.ts
│   └── vadService.ts
└── search/                     # External Search
    └── webSearchService.ts
```

### 🎯 Responsabilités Services

1. **Traduction**: Convertir données externes → formats internes
2. **Validation**: Valider inputs/outputs externes
3. **Error Handling**: Gérer erreurs I/O
4. **Retry Logic**: Réessayer opérations échouées
5. **Caching**: Cache pour optimiser I/O

### ✅ Exemple Conforme

```typescript
// ✅ Service correct - tauriService.ts
export class TauriService {
  // Service fait I/O, pas de logique métier
  async invokeOmegaPipeline(
    message: string,
    conversationId: string
  ): Promise<OmegaResponse> {
    try {
      // I/O: invoke Tauri
      const response = await invoke('conversation_generate', {
        message,
        conversationId,
        mode: 'coach',
      });

      // Traduction: externe → interne
      return this.mapToInternalFormat(response);
    } catch (error) {
      // Error handling
      throw new ServiceError('OMEGA_INVOKE_FAILED', error);
    }
  }

  // Pas de logique métier complexe
  private mapToInternalFormat(data: any): OmegaResponse {
    return {
      content: data.content,
      conversationId: data.conversationId,
      latency: data.latencyMs,
    };
  }
}
```

### ❌ Exemple Non-Conforme

```typescript
// ❌ Service avec logique métier - INTERDIT
export class BadService {
  async processConversation(message: string): Promise<string> {
    const response = await invoke('chat', { message });

    // ❌ Logique métier dans le service
    const emotion = this.analyzeEmotion(response.content);
    const sentiment = this.detectSentiment(emotion);
    const priority = this.calculatePriority(sentiment);

    // ❌ Décisions métier
    if (priority > 0.8) {
      return this.formatUrgentResponse(response);
    }

    return response.content;
  }
}
```

### 🔍 Imports Autorisés

```typescript
// ✅ AUTORISÉ
import { invoke } from '@tauri-apps/api/core';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { fetch } from '@tauri-apps/plugin-http';
import { EmotionEngine } from '@/engines/emotion'; // Appeler un engine OK

// ❌ INTERDIT
import { logger } from '@/os/logging'; // Service ne doit pas logger directement
```

---

## 🎛️ ANNEAU 4: OS

**Rôle**: Orchestration système, permissions, événements, monitoring.

### 📂 Structure

```
src/os/
├── index.ts
├── orchestration/              # Coordination globale
│   ├── eventBus.ts
│   └── lifecycle.ts
├── permissions/                # Gestion permissions
│   ├── permissionManager.ts
│   └── securityGuards.ts
├── monitoring/                 # Observabilité
│   ├── logger.ts
│   ├── metrics.ts
│   └── telemetry.ts
└── scheduling/                 # Planification tâches
    └── taskScheduler.ts
```

### 🎯 Responsabilités OS

1. **Events**: Distribuer événements système
2. **Permissions**: Vérifier autorisations avant actions
3. **Monitoring**: Logs, métriques, traces
4. **Lifecycle**: Initialisation, shutdown, cycles
5. **Scheduling**: Planifier tâches asynchrones

### ✅ Exemple Conforme

```typescript
// ✅ OS Layer - eventBus.ts
export class EventBus {
  private listeners = new Map<string, EventListener[]>();

  // Orchestration pure
  emit(event: SystemEvent): void {
    const listeners = this.listeners.get(event.type) || [];
    
    // Log système
    logger.info('[EventBus] Emitting:', event.type);
    
    // Distribution
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        // Error tracking
        logger.error('[EventBus] Listener failed:', error);
      }
    });
  }

  subscribe(eventType: string, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }
}
```

### 🔍 Ce que l'OS PEUT faire

```typescript
// ✅ AUTORISÉ
import { invoke } from '@tauri-apps/api/core';
import { EmotionEngine } from '@/engines/emotion';
import { TauriService } from '@/services/tauri';

// Orchestrer
eventBus.emit({ type: 'conversation.started' });

// Logger
logger.info('System initialized');

// Vérifier permissions
await permissionManager.check('memory.write');

// Planifier
scheduler.schedule('daily-cleanup', cleanupTask);
```

---

## 📊 Matrice de Dépendances

| Depuis ↓ / Vers → | Core | Engines | Services | OS |
|-------------------|------|---------|----------|-----|
| **Core**          | ✅   | ❌      | ❌       | ❌  |
| **Engines**       | ✅   | ✅      | ❌       | ❌  |
| **Services**      | ✅   | ✅      | ✅       | ❌  |
| **OS**            | ✅   | ✅      | ✅       | ✅  |

---

## 🔍 Comment Vérifier la Conformité

### 1. Audit des Imports

```bash
# Détecter imports interdits dans engines/
grep -r "from '@tauri-apps" src/engines/
grep -r "from '@/services" src/engines/
grep -r "console.log" src/engines/

# Détecter logique métier dans services/
grep -r "analyzeEmotion\|detectSentiment\|calculatePriority" src/services/
```

### 2. Tests d'Isolation

```typescript
// Test: Engine ne doit pas dépendre de services
import { dependencies } from './engineDependencies';

test('Engines ne doivent pas importer services', () => {
  dependencies.engines.forEach(dep => {
    expect(dep.imports).not.toContain('@/services');
    expect(dep.imports).not.toContain('@tauri-apps');
  });
});
```

### 3. Linter Custom

```json
// .eslintrc.json - Règles custom
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["@/services/*", "@tauri-apps/*"],
        "message": "Engines ne peuvent pas importer services ou Tauri"
      }]
    }]
  }
}
```

---

## 🚀 Migration d'un Code Non-Conforme

### ❌ Avant (Non-Conforme)

```typescript
// emotionEngine.ts - ❌ Engine avec I/O
export class EmotionEngine {
  async analyzeEmotion(text: string): Promise<EmotionResult> {
    // ❌ I/O dans engine
    const history = await invoke('get_emotion_history');
    
    // ❌ Logging direct
    console.log('Analyzing emotion:', text);
    
    const sentiment = this.detectSentiment(text);
    
    // ❌ I/O save
    await invoke('save_emotion', { sentiment });
    
    return { sentiment };
  }
}
```

### ✅ Après (Conforme)

```typescript
// 1. Engine pur
// emotionEngine.ts
export class EmotionEngine {
  // Fonction pure
  analyzeEmotion(text: string, history?: EmotionHistory): EmotionResult {
    const sentiment = this.detectSentiment(text);
    const contextualScore = history 
      ? this.adjustWithHistory(sentiment, history)
      : sentiment.score;
    
    return {
      sentiment: sentiment.type,
      score: contextualScore,
      confidence: 0.85,
    };
  }
}

// 2. Service pour I/O
// emotionService.ts
export class EmotionService {
  private engine = new EmotionEngine();

  async analyzeWithContext(text: string): Promise<EmotionResult> {
    // I/O: récupérer historique
    const history = await invoke('get_emotion_history');
    
    // Appeler engine pur
    const result = this.engine.analyzeEmotion(text, history);
    
    // I/O: sauvegarder
    await invoke('save_emotion', { sentiment: result.sentiment });
    
    return result;
  }
}

// 3. OS pour logging
// os/monitoring/emotionMonitor.ts
export class EmotionMonitor {
  private service = new EmotionService();

  async trackEmotion(text: string): Promise<EmotionResult> {
    logger.info('[EmotionMonitor] Analyzing:', text);
    
    const result = await this.service.analyzeWithContext(text);
    
    logger.info('[EmotionMonitor] Result:', result.sentiment);
    metrics.record('emotion.analyzed', 1);
    
    return result;
  }
}
```

---

## 📚 Exemples Pratiques

### Scénario 1: Analyse d'un Message

```typescript
// ❌ MAUVAIS: Tout dans un seul endroit
async function analyzeMessage(text: string) {
  console.log('Analyzing:', text); // ❌ Log direct
  const emotion = detectEmotion(text);
  await invoke('save_analysis', { emotion }); // ❌ I/O mélangé
  return emotion;
}

// ✅ BON: Architecture en anneaux
// 1. Engine (logique pure)
class AnalysisEngine {
  analyze(text: string): Analysis {
    return {
      emotion: this.detectEmotion(text),
      intent: this.detectIntent(text),
      confidence: 0.9,
    };
  }
}

// 2. Service (I/O)
class AnalysisService {
  private engine = new AnalysisEngine();

  async analyzeAndSave(text: string): Promise<Analysis> {
    const result = this.engine.analyze(text);
    await invoke('save_analysis', result);
    return result;
  }
}

// 3. OS (orchestration + logs)
class AnalysisOrchestrator {
  private service = new AnalysisService();

  async processMessage(text: string): Promise<Analysis> {
    logger.info('[Analysis] Starting:', text);
    
    await permissionManager.check('analysis.run');
    
    const result = await this.service.analyzeAndSave(text);
    
    eventBus.emit({ type: 'analysis.complete', data: result });
    metrics.record('analysis.latency', Date.now());
    
    return result;
  }
}
```

---

## 🎯 Checklist de Conformité

### Pour un Engine

- [ ] Aucun import de `@tauri-apps` ou `@/services`
- [ ] Aucun `console.log`, `console.error`
- [ ] Aucun `invoke`, `fetch`, `readFile`
- [ ] Fonctions pures (même input → même output)
- [ ] Tests unitaires >80% coverage
- [ ] Documentation JSDoc complète

### Pour un Service

- [ ] Pas de logique métier complexe
- [ ] Validation des inputs/outputs
- [ ] Error handling robuste
- [ ] Retry logic si applicable
- [ ] Pas de logging direct (retourner erreurs)

### Pour l'OS

- [ ] Logging centralisé
- [ ] Métriques et monitoring
- [ ] Gestion permissions
- [ ] Event emission appropriée

---

## 🔧 Outils de Vérification

### Script de Validation

```bash
#!/bin/bash
# scripts/validate-architecture.sh

echo "🔍 Validating Architecture Rings..."

# Check 1: Engines purity
echo "Checking engines purity..."
if grep -r "from '@tauri-apps" src/engines/ 2>/dev/null; then
  echo "❌ FAIL: Engines importing Tauri"
  exit 1
fi

# Check 2: Services no business logic
echo "Checking services isolation..."
if grep -r "analyzeEmotion\|detectIntent" src/services/ 2>/dev/null; then
  echo "⚠️  WARNING: Possible business logic in services"
fi

# Check 3: TypeScript strict
echo "Checking TypeScript strict mode..."
if ! grep -q '"strict": true' tsconfig.json; then
  echo "❌ FAIL: TypeScript strict mode disabled"
  exit 1
fi

echo "✅ Architecture validation passed!"
```

---

## 📖 Ressources

- **Constitution TITANE∞**: Principes fondamentaux
- **OMEGA Pipeline v2**: Pipeline central
- **Tests Architecture**: `src/__tests__/architecture/`

---

**Document établi le**: 15 décembre 2025  
**Auteur**: Architecture Team TITANE∞  
**Validé par**: Kevin Thibault  
**Version**: 1.0 (DÉFINITIF)

---

*Toute violation de cette architecture doit être documentée et justifiée dans un ADR (Architecture Decision Record).*
