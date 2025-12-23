# 📚 Guide de Migration API — v24.30 → v26.2

**Date:** 2025-12-23  
**Version Source:** v24.30  
**Version Cible:** v26.2.0  
**Statut:** Guide Complet

---

## 🎯 VUE D'ENSEMBLE

Ce guide documente tous les changements API entre TITANE∞ v24.30 et v26.2.0, incluant les breaking changes, nouvelles features, et dépréciations.

**Changements Majeurs:**
- ✨ Pipeline OMEGA v2 (breaking change)
- ✨ 9 Moteurs Cognitifs (nouvelle architecture)
- ✨ Architecture 4-Ring stricte
- ✨ Systèmes Auto-Heal

**Impact:** Migration requise pour code utilisant API chat/conversation

---

## 🚨 BREAKING CHANGES

### 1. Pipeline OMEGA v2 (CRITIQUE)

**Version:** v25.x  
**Impact:** 🔴 BREAKING CHANGE

#### API Dépréciée (v1)

```typescript
// ❌ DEPRECATED - Ne plus utiliser
import { chat_send_message } from '@tauri-apps/api/tauri';

const response = await chat_send_message({
  message: "Bonjour TITANE",
  context: { ... }
});
```

#### Nouvelle API (v2)

```typescript
// ✅ À UTILISER - OMEGA v2
import { conversation_generate } from '@/services/omega/conversationService';

const response = await conversation_generate({
  conversationId: "uuid-123",  // ⚠️ OBLIGATOIRE
  message: "Bonjour TITANE",
  context: { ... }
});
```

**Changements:**
- ✅ `conversationId` maintenant **OBLIGATOIRE**
- ✅ Pipeline 10 étapes (vs 5 avant)
- ✅ Latence: 150ms (vs 250ms)
- ✅ Support mode conversationnel complet
- ✅ Intégration Singularity automatique

**Migration:**

```typescript
// AVANT (v24.30)
async function sendMessage(msg: string) {
  return await chat_send_message({
    message: msg
  });
}

// APRÈS (v26.2)
import { v4 as uuidv4 } from 'uuid';

async function sendMessage(msg: string, convId?: string) {
  const conversationId = convId || uuidv4();
  
  return await conversation_generate({
    conversationId,  // Nouveau paramètre requis
    message: msg
  });
}
```

**Guide Complet:** Voir `docs/guides/MIGRATION_OMEGA_V2.md`

---

### 2. Architecture 4-Ring — Imports Stricts

**Version:** v24.3+  
**Impact:** 🟡 BREAKING pour code non-conforme

#### Règles Import

**Ring 1 (Core):** `src/types/`, `src/constants/`
- ✅ Imports: AUCUN (auto-suffisant)
- ❌ Ne peut pas importer: Engines, Services, UI

**Ring 2 (Engines):** `src/engines/*/`
- ✅ Imports: Ring 1 uniquement
- ❌ Ne peut pas importer: Services (Ring 3), UI (Ring 4)

**Ring 3 (Services):** `src/services/*/`
- ✅ Imports: Ring 1 + Ring 2
- ❌ Ne peut pas importer: UI (Ring 4)

**Ring 4 (OS/UI):** Components React, Tauri backend
- ✅ Imports: TOUS les rings (accès total)

**Migration:**

```typescript
// ❌ INCORRECT - Engine importe Service
// src/engines/emotion/EmotionEngine.ts
import { cognitiveLayoutService } from '@/services/cognitive';

// ✅ CORRECT - Passer service en dépendance
// src/engines/emotion/EmotionEngine.ts
export class EmotionEngine {
  constructor(
    private layoutService?: CognitiveLayoutService
  ) {}
}

// Service/UI injecte la dépendance
const emotionEngine = new EmotionEngine(cognitiveLayoutService);
```

**Validation:** Tests automatiques dans `src/__tests__/architecture/`

---

## ✨ NOUVELLES FEATURES

### 1. 9 Moteurs Cognitifs

**Version:** v24.3+

**Architecture:**

```
Orchestrator (coordinateur)
    ├─ StyleEngine
    ├─ CoherenceEngine
    ├─ ReflectionEngine
    ├─ EmotionEngine
    ├─ UnifiedMemory
    ├─ BehaviorEngine
    ├─ AdaptationEngine
    └─ SystemHealth
```

**API:**

```typescript
import { Orchestrator } from '@/engines/orchestrator';

const orchestrator = new Orchestrator();

// Accès moteurs individuels
const styleEngine = orchestrator.getEngine('style');
const emotionEngine = orchestrator.getEngine('emotion');

// Ou utilisation directe
import { EmotionEngine } from '@/engines/emotion';
const emotion = new EmotionEngine();

const state = emotion.analyzeEmotion({
  text: "Je suis heureux!",
  context: { ... }
});
```

**Modules Disponibles:**

| Moteur | Localisation | Fonction |
|--------|--------------|----------|
| Orchestrator | `src/engines/orchestrator/` | Coordination globale |
| StyleEngine | `src/engines/style/` | Thèmes & apparence |
| CoherenceEngine | `src/engines/coherence/` | Cohérence contextuelle |
| ReflectionEngine | `src/engines/reflection/` | Analyse réflexive |
| EmotionEngine | `src/engines/emotion/` | États émotionnels |
| UnifiedMemory | `src/engines/memory/` | Mémoire persistante |
| BehaviorEngine | `src/engines/behavior/` | Patterns comportementaux |
| AdaptationEngine | `src/engines/adaptation/` | Adaptation contextuelle |
| SystemHealth | `src/engines/health/` | Monitoring santé |

**Référence Complète:** Voir section "Engines API" ci-dessous

---

### 2. Systèmes Auto-Heal

**Version:** v26.2.0

**Scripts Bash:**

```bash
# Health check complet avec auto-repair
./scripts/maintenance/health-check-enhanced.sh

# Options
./scripts/maintenance/health-check-enhanced.sh --dry-run
./scripts/maintenance/health-check-enhanced.sh --verbose
./scripts/maintenance/health-check-enhanced.sh --no-auto-fix

# Monitoring proactif
./scripts/maintenance/proactive-monitor.sh

# Validation pré-déploiement
./scripts/verify/pre-deployment-check.sh
./scripts/verify/pre-deployment-check.sh --quick

# Auto-fix ciblé
./scripts/audit/06-auto-fix.sh --lint
./scripts/audit/06-auto-fix.sh --format
```

**Documentation:** `docs/AUTO_HEAL_SYSTEMS.md`

---

### 3. Nouveaux Tauri Commands

**Version:** v25.x - v26.2

**Commandes Ajoutées:**

```rust
// Conversation (OMEGA v2)
conversation_generate(conversationId, message, context)
conversation_get_history(conversationId)
conversation_delete(conversationId)

// Memory Enhanced
memory_search_semantic(query, limit)
memory_get_context(conversationId)
memory_update_metadata(memoryId, metadata)

// System Health
system_health_check()
system_health_get_metrics()
system_health_auto_repair()

// Evolution
evolution_track_change(type, data)
evolution_get_insights()
evolution_apply_adaptation()
```

**Usage TypeScript:**

```typescript
import { invoke } from '@tauri-apps/api/tauri';

// Nouveau command conversation
const response = await invoke('conversation_generate', {
  conversationId: 'uuid-123',
  message: 'Bonjour',
  context: {}
});

// Nouveau command health
const health = await invoke('system_health_check');
```

**Référence Complète:** `docs/COMMANDES_TAURI_COMPLETE_v26.3.0.md`

---

## 🔄 DÉPRÉCIATIONS

### API Dépréciées (Encore Supportées)

| API | Statut | Remplacement | Suppression Prévue |
|-----|--------|--------------|-------------------|
| `chat_send_message` | Déprécié v25.x | `conversation_generate` | v27.0 |
| `localStorage` direct | Déprécié v26.0 | `UnifiedMemory` service | v28.0 |
| `window.__TAURI__` | Déprécié v25.x | `@tauri-apps/api` imports | v27.0 |

**Warnings:**

```typescript
// ⚠️ Warning émis mais fonctionne encore
const result = await chat_send_message({ message: "test" });
// Console: "Warning: chat_send_message deprecated, use conversation_generate"
```

---

## 📋 CHECKLIST MIGRATION

### Phase 1: Analyse (1-2h)

- [ ] Identifier usages `chat_send_message` dans codebase
- [ ] Lister imports Ring violations (si tests architecture échouent)
- [ ] Vérifier dépendances obsolètes
- [ ] Lire guide MIGRATION_OMEGA_V2.md

### Phase 2: Migration Code (4-8h)

- [ ] Remplacer `chat_send_message` par `conversation_generate`
- [ ] Ajouter gestion `conversationId` partout
- [ ] Corriger imports Ring violations
- [ ] Mettre à jour calls Tauri commands
- [ ] Adapter tests unitaires

### Phase 3: Tests (2-4h)

- [ ] Exécuter tests unitaires (`npm test`)
- [ ] Exécuter tests architecture (`npm run test:architecture`)
- [ ] Exécuter tests E2E (`npm run test:e2e` avec `SKIP_E2E=false`)
- [ ] Validation manuelle workflows critiques

### Phase 4: Documentation (1-2h)

- [ ] Mettre à jour README projet
- [ ] Documenter breaking changes équipe
- [ ] Créer guides utilisateur si nécessaire

**Temps Total Estimé:** 8-16 heures selon taille codebase

---

## 🆕 NOUVELLES APIS — RÉFÉRENCE RAPIDE

### Engines API

#### EmotionEngine

```typescript
import { EmotionEngine, type EmotionalState } from '@/engines/emotion';

const engine = new EmotionEngine();

// Analyser émotion
const state: EmotionalState = engine.analyzeEmotion({
  text: "Je suis ravi!",
  context: { previousEmotion: "neutral" }
});

console.log(state);
// {
//   emotion: "joy",
//   intensity: 0.85,
//   valence: "positive",
//   confidence: 0.92
// }
```

#### CoherenceEngine

```typescript
import { CoherenceEngine } from '@/engines/coherence';

const engine = new CoherenceEngine();

// Vérifier cohérence
const coherence = engine.checkCoherence({
  currentContext: { topic: "IA", sentiment: "positive" },
  messageHistory: [...]
});

if (coherence.score < 0.7) {
  console.log("Drift détecté:", coherence.issues);
}
```

#### UnifiedMemory

```typescript
import { UnifiedMemory } from '@/engines/memory';

const memory = new UnifiedMemory();

// Sauver conversation
await memory.saveConversation({
  conversationId: 'uuid-123',
  messages: [...],
  metadata: { topic: 'development' }
});

// Recherche sémantique
const results = await memory.searchSemantic({
  query: "Comment déployer TITANE?",
  limit: 5
});
```

### Services API

#### CognitiveLayoutService

```typescript
import { cognitiveLayoutService } from '@/services/cognitive';

// Obtenir état layout actuel
const layout = cognitiveLayoutService.getCurrentLayout();
// Returns: 'helios' | 'nexus' | 'fusion'

// Changer layout
cognitiveLayoutService.setLayout('nexus');

// Écouter changements
cognitiveLayoutService.onLayoutChange((newLayout) => {
  console.log('Layout changé:', newLayout);
});
```

#### AgendaService

```typescript
import { agendaService } from '@/services/agenda';

// CRUD événements
const event = await agendaService.createEvent({
  title: "Meeting",
  startDate: new Date(),
  duration: 3600
});

const events = await agendaService.getEvents({
  startDate: new Date(),
  endDate: new Date(Date.now() + 86400000)
});

await agendaService.updateEvent(event.id, {
  title: "Meeting Updated"
});

await agendaService.deleteEvent(event.id);
```

---

## 🔧 OUTILS MIGRATION

### Script Automatique (Aide)

```bash
# Trouver usages deprecated
grep -r "chat_send_message" src/ --include="*.ts" --include="*.tsx"

# Trouver imports Ring violations
npm run test:architecture

# Vérifier compatibilité
npm run check
npm run lint
```

### Patterns Communs

#### Pattern 1: Chat Simple

```typescript
// AVANT
async function sendChat(message: string) {
  return await invoke('chat_send_message', { message });
}

// APRÈS
import { v4 as uuidv4 } from 'uuid';

class ChatManager {
  private conversationId = uuidv4();
  
  async sendChat(message: string) {
    return await invoke('conversation_generate', {
      conversationId: this.conversationId,
      message
    });
  }
}
```

#### Pattern 2: Import Ring Fix

```typescript
// AVANT (violation Ring 2 → Ring 3)
// src/engines/myEngine/MyEngine.ts
import { someService } from '@/services/someService';

// APRÈS (injection dépendance)
// src/engines/myEngine/MyEngine.ts
export class MyEngine {
  constructor(private someService?: SomeServiceType) {}
  
  doSomething() {
    if (this.someService) {
      this.someService.call();
    }
  }
}

// src/services/orchestrator.ts (Ring 3)
import { MyEngine } from '@/engines/myEngine';
import { someService } from '@/services/someService';

const engine = new MyEngine(someService);
```

---

## 📚 RESSOURCES

### Documentation Complète

- **Migration OMEGA v2:** `docs/guides/MIGRATION_OMEGA_V2.md`
- **Architecture 4-Ring:** `docs/ARCHITECTURE_RINGS.md`
- **Auto-Heal Systems:** `docs/AUTO_HEAL_SYSTEMS.md`
- **Commandes Tauri:** `docs/COMMANDES_TAURI_COMPLETE_v26.3.0.md`
- **Tests E2E:** `docs/STRATEGIE_TESTS_E2E.md`

### Guides Spécifiques

- **Guide Développeur:** `docs/DEVELOPER_GUIDE.md`
- **Guide Performance:** `docs/QUICK_START_PERFORMANCE.md`
- **Guide Utilisateur:** `docs/USER_GUIDE_v24.30.md` (⚠️ à mettre à jour)

### Exemples Code

- **Tests Architecture:** `src/__tests__/architecture/`
- **Tests Engines:** `src/engines/**/__tests__/`
- **Tests E2E:** `src/tests/e2e/`

---

## ❓ FAQ

**Q: Mon code utilise `chat_send_message`, dois-je migrer immédiatement?**  
R: Non urgent mais recommandé. API fonctionne encore jusqu'à v27.0. Migrer avant v27.0.

**Q: Comment savoir si j'ai des Ring violations?**  
R: Exécuter `npm run test:architecture`. Tests échoueront si violations.

**Q: Puis-je utiliser OMEGA v1 et v2 simultanément?**  
R: Oui pendant transition. Migrer progressivement. v1 sera supprimée en v27.0.

**Q: Les anciens tests passent-ils avec v26.2?**  
R: Oui si pas de breaking changes utilisés. Mettre à jour progressivement.

**Q: Où trouver exemples conversation_generate?**  
R: `src/services/omega/__tests__/` et `docs/guides/MIGRATION_OMEGA_V2.md`

---

## ✅ SUPPORT

**Bugs Migration:**
- Ouvrir issue GitHub avec tag `migration`
- Inclure version source/cible
- Joindre code problématique

**Questions:**
- Consulter docs/ complètes
- Rechercher issues GitHub fermées
- Canal Discord #support (si disponible)

---

**Version Guide:** 1.0  
**Date:** 2025-12-23  
**Auteur:** TITANE∞ Team  
**Status:** ✅ Complet
