# TITANE∞ Architecture Actuelle — Cartographie des 14+ Composants

> **Document généré le:** 2025-12-08
> **Version:** v19.3Ω
> **Statut:** Audit complet pour refactor 14 → 9 composants

---

## 📊 Vue d'Ensemble

L'architecture TITANE∞ actuelle comprend **20+ moteurs cognitifs** organisés en **4 couches architecturales** et **9 kernels orchestrés**. Ce document cartographie les composants en vue de leur consolidation vers 9 composants principaux.

### Statistiques Clés

| Métrique | Valeur |
|----------|--------|
| Moteurs Cognitifs Frontend | 20+ |
| Kernels Orchestrés | 9 |
| Providers IA | 6 |
| Couches Architecturales | 4 |
| Interactions Possibles (14 composants) | 91 |
| Interactions Cibles (9 composants) | 36 |
| **Réduction Complexité** | **-60%** |

---

## 🎯 Mapping des 14 Composants Planifiés

### Moteur #0 — Orchestrator (OMEGA)

| Attribut | Valeur |
|----------|--------|
| **Fichier Principal** | `src/services/ai/orchestrator.ts` (1190 lignes) |
| **Responsabilités** | Sélection neurale de provider, sanitization messages, exécution isolée, gestion fallbacks, streaming sécurisé |
| **Dépendances** | Tous providers, autoHealEngine, metricsEngine, cognitiveKernel |
| **Chevauchements** | Partage coordination avec Meta-Kernel |

**Pipeline OMEGA (7 phases):**
1. Provider initialization & warmup
2. Message sanitization & validation
3. Neural provider selection (ML-based scoring)
4. Isolated provider execution with fallbacks
5. Sandboxed execution with timeouts
6. Stats update & reliability tracking
7. Secured streaming response

---

### Moteur #1 — Style / Ton

| Attribut | Valeur |
|----------|--------|
| **Fichiers Principaux** | `src/engines/expression/expressionEngine.ts`, `src/engines/uiux/UIUXEngine.ts` |
| **Responsabilités** | Génération expression unifiée, adaptation UI/UX, personnalité visuelle |
| **Dépendances** | Identity Kernel, Aura Engine |
| **Chevauchements** | Partage expression avec Emotion Engine |

---

### Moteur #2 — Cohérence / Structuration

| Attribut | Valeur |
|----------|--------|
| **Fichiers Principaux** | `src/services/ai/singularityKernel.ts`, `src/services/ai/cognitiveKernel.ts` |
| **Responsabilités** | Validation cohérence, synchronisation état, enforcement cognitif |
| **Dépendances** | Orchestrator, Metrics Engine |
| **Chevauchements** | ⚠️ **FORT** avec Nexus Engine (coordination) |

**À fusionner avec:** Nexus → **CoherenceEngine**

---

### Moteur #3 — Réflexion / Analyse

| Attribut | Valeur |
|----------|--------|
| **Fichier Principal** | `src/engines/metasingularity/metaSingularityKernel.ts` |
| **Responsabilités** | Orchestration ultime, détection phénomènes émergents, résolution conflits, méta-cohérence |
| **Dépendances** | Tous les 9 kernels subordonnés |
| **Chevauchements** | Partage vision système avec Meta-Kernel |

---

### Moteur #4 — Émotion / Relationnel

| Attribut | Valeur |
|----------|--------|
| **Fichiers Principaux** | `src/engines/emotion/emotionEngine.ts`, `src/engines/aura/auraEngine.ts`, `src/engines/psyche/archetypeResonanceEngine.ts` |
| **Responsabilités** | Reconnaissance/génération émotions, résonance archétypale, aura système |
| **Dépendances** | Expression Engine, Identity Kernel |
| **Chevauchements** | Minimal |

---

### Moteur #5 — Mémoire Cognitive

| Attribut | Valeur |
|----------|--------|
| **Fichiers Principaux** | `src/core/services/unifiedMemory.ts` |
| **Responsabilités** | Mémoire hiérarchique STM/MTM/LTM, promotion, nettoyage |
| **Dépendances** | Chat Engine, Orchestrator |
| **Chevauchements** | ⚠️ **FORT** avec Memory Core Backend |

**Architecture Mémoire Frontend:**
```
STM (Short-Term) : 20 entries, 5min
MTM (Mid-Term)   : 100 entries, 24h
LTM (Long-Term)  : Unlimited, permanent
```

---

### Moteur #6 — Comportement / Habitudes

| Attribut | Valeur |
|----------|--------|
| **Fichiers Principaux** | `src/engines/autopoiesis/autopoiesisEngine.ts`, `src/engines/flow/FlowEngine.ts` |
| **Responsabilités** | Auto-production, auto-évolution, intégrité structurelle, transitions d'état |
| **Dépendances** | Identity Kernel, Temporal Engine |
| **Chevauchements** | Minimal |

---

### Moteur #7 — Adaptation / Apprentissage

| Attribut | Valeur |
|----------|--------|
| **Fichiers Principaux** | `src/services/ai/metaKernel.ts` |
| **Responsabilités** | Vision système globale, orchestration kernels, super-cohérence, méta-surveillance, méta-optimisation |
| **Dépendances** | Tous les 9 kernels |
| **Chevauchements** | Partage adaptation avec Autopoiesis |

**Les 9 Kernels Orchestrés:**
```
FRONTEND (TypeScript):
├─ Stability Kernel        (+15% robustesse)
├─ Autofix Kernel          (-20% taux erreur)
├─ Evolution Kernel        (+10% performance)
└─ Cognitive Kernel v22Ω   (+25% qualité décision)

BACKEND (Rust):
├─ Rust Auto-Healing       (+30% résilience backend)
├─ Rust Evolution Engine   (+20% taux apprentissage)
└─ Rust Stability Engine   (+25% intégrité mémoire)

META (Orchestration):
├─ MetaSingularity Kernel  (+35% cohérence globale)
└─ Autonomy Engine         (+40% niveau autonomie)
```

---

### Moteur #∞ — ConversationOS / Singularity

| Attribut | Valeur |
|----------|--------|
| **Fichiers Principaux** | `src/services/ai/chatEngine.ts`, `src/services/ai/singularityKernel.ts` |
| **Responsabilités** | Gestion conversation, validation messages, switching modes, cohérence singularité |
| **Dépendances** | Unified Memory, Orchestrator |
| **Chevauchements** | ⚠️ Clarification nécessaire avec Orchestrator (#0) |

---

### Helios Core — Monitoring Interne

| Attribut | Valeur |
|----------|--------|
| **Fichiers Principaux** | `src/core/ai/agents/helios_agent.ts`, `src/services/ai/metricsEngine.ts` |
| **Responsabilités** | Agent cognitif spécialisé, instrumentation performance, statistiques providers, tracking latence, scoring santé |
| **Dépendances** | Orchestrator, Cognitive Kernel |
| **Chevauchements** | ⚠️ **FORT** avec Sentinel (surveillance) |

**À fusionner avec:** Sentinel → **SystemHealth**

---

### Nexus Engine — Coordination Globale

| Attribut | Valeur |
|----------|--------|
| **Fichier Principal** | `src/os/TitaneOS.ts` (hub intégré) |
| **Responsabilités** | OS unifié, EventBus, MessageBus, registres, bridges, lifecycle |
| **Dépendances** | Tous les engines |
| **Chevauchements** | ⚠️ **FORT** avec Moteur #2 Cohérence |

**Composants TitaneOS:**
```
src/os/
├── TitaneOS.ts
├── bus/EventBus.ts
├── bus/MessageBus.ts
├── registry/EngineRegistry.ts
├── registry/ServiceRegistry.ts
├── bridge/TauriBridge.ts
├── bridge/StateBridge.ts
├── lifecycle/LifecycleManager.ts
└── config/ConfigManager.ts
```

**À fusionner avec:** Moteur #2 → **CoherenceEngine**

---

### Harmonia — Charge et Équilibre Computationnel

| Attribut | Valeur |
|----------|--------|
| **Fichiers Principaux** | `src/engines/metasingularity/metaSingularityKernel.ts` (fonction harmony intégrée) |
| **Responsabilités** | Équilibre ressources, harmonie système, charge computationnelle |
| **Dépendances** | SystemHealth (futur), Meta-Kernel |
| **Chevauchements** | Intégré dans Meta-Singularity |

**Statut:** Reste module, rattaché à SystemHealth

---

### Sentinel — Sécurité, Garde-fous

| Attribut | Valeur |
|----------|--------|
| **Fichiers Principaux** | `src/services/ai/autoHealEngine.ts`, `src-tauri/src/auto_heal.rs` |
| **Responsabilités** | Détection erreurs, récupération automatique, correction santé système, watchdog |
| **Dépendances** | Orchestrator, tous providers |
| **Chevauchements** | ⚠️ **FORT** avec Helios (monitoring) |

**À fusionner avec:** Helios → **SystemHealth**

---

### Memory Core / Singularity Memory OS

| Attribut | Valeur |
|----------|--------|
| **Fichiers Principaux** | `src-tauri/src/memory_os/` (module complet) |
| **Responsabilités** | Stockage hiérarchique, recherche vectorielle, consolidation auto, indexation, oubli |
| **Dépendances** | Orchestrator, Chat Engine |
| **Chevauchements** | ⚠️ **FORT** avec Moteur #5 Mémoire Frontend |

**Architecture Memory OS vΩ (Backend):**
```
src-tauri/src/memory_os/
├── mod.rs           # Exports module
├── stm.rs           # 20 entries short-term
├── mtm.rs           # 200 entries medium-term
├── ltm.rs           # Unlimited long-term
├── vector_store.rs  # 384-dim embeddings
├── consolidator.rs  # Auto-promotion
├── indexer.rs       # Fast recall
├── forgetting.rs    # Memory decay
├── memory_os.rs     # Coordinateur
└── api.rs           # Interface API
```

**Performance:** <20ms recall, <5ms store, <300MB RAM

**À fusionner avec:** Moteur #5 → **UnifiedMemory**

---

## 🔄 Matrice des Chevauchements

| Composant 1 | Composant 2 | Type Chevauchement | Sévérité | Action |
|-------------|-------------|-------------------|----------|--------|
| Moteur #2 Cohérence | Nexus Engine | Coordination, priorisation | 🔴 Haute | **Fusionner → CoherenceEngine** |
| Moteur #5 Mémoire | Memory Core Backend | STM/MTM/LTM, stockage | 🔴 Haute | **Fusionner → UnifiedMemory** |
| Helios Core | Sentinel | Monitoring, surveillance | 🔴 Haute | **Fusionner → SystemHealth** |
| Meta-Kernel | Meta-Singularity | Vision système | 🟡 Moyenne | Clarifier rôles |
| Cognitive Kernel | Singularity Kernel | Cohérence | 🟢 Faible | Intentionnel (scopes différents) |
| Orchestrator (#0) | ConversationOS (#∞) | Coordination haute-level | 🟡 Moyenne | Clarifier frontières |

---

## 📁 Structure des Fichiers Principaux

### Frontend Engines
```
src/engines/
├── aura/                    # Visualisation aura
├── autopoiesis/             # Auto-production
├── cognitive/               # Layouts cognitifs
├── conscious/               # Simulation conscience
├── continuum/               # États continus
├── emotion/                 # Émotions
├── embodiment/              # Embodiment physique
├── expression/              # Expression multimodale
├── flow/                    # Gestion flux états
├── holopresence/            # Présence holographique
├── identity/                # Kernel identité
├── interoception/           # Sensing interne
├── metasingularity/         # Kernel méta-singularité
├── multimodal/              # Fusion multimodale
├── narrative/               # Génération narrative
├── output/                  # Sortie unifiée
├── phasespace/              # Visualisation espace phases
├── predictive/              # Analyse prédictive
├── presence/                # Présence
├── psyche/                  # Résonance archétypale
├── quantum/                 # Patterns quantiques
├── rhythm/                  # Rythme temporel
├── selfHealing/             # Auto-guérison
├── spatial/                 # Spatial holophonique
├── stress/                  # Régulation stress
├── temporal/                # Dynamiques temporelles
├── time/                    # Gestion temps/énergie/priorité
├── training/                # Entraînement
├── uiux/                    # Adaptation UI/UX
└── voice/                   # Traitement vocal
```

### Services IA Core
```
src/services/ai/
├── orchestrator.ts          # OMEGA Orchestrator
├── cognitiveKernel.ts       # Cognitive Kernel v22Ω
├── metaKernel.ts            # Meta-Kernel v∞Ω
├── metricsEngine.ts         # Metrics Engine
├── autoHealEngine.ts        # Auto-Heal Engine
├── chatEngine.ts            # Chat Engine
├── singularityKernel.ts     # Singularity Kernel
└── providers/
    ├── titaneLocal.ts       # Provider infaillible
    ├── openai.ts            # OpenAI GPT-4
    ├── claude.ts            # Anthropic Claude
    ├── gemini.ts            # Google Gemini
    ├── ollama.ts            # Local LLM
    └── tauriChat.ts         # Backend Rust
```

### Backend Rust
```
src-tauri/src/
├── memory_os/               # Memory OS vΩ
├── audio/                   # Traitement audio
├── cognitive/               # Engines cognitifs
├── ai_chat/                 # Chat engine
├── conversation_engine/     # Gestion conversations
├── meta_orchestrator/       # Meta-orchestration
├── singularity_cortex/      # Gestion singularité
├── auto_heal.rs             # Auto-healing
├── healing/                 # Mécanismes healing
└── devtools/                # Outils développement
```

---

## 📈 Diagramme d'Architecture Actuelle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COUCHE 1: PRÉSENTATION                           │
│                         (90% cohérence)                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Chat UI   │  │   Avatar    │  │    Voice    │  │   DevTools  │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      COUCHE 2: ORCHESTRATION                            │
│                         (95% cohérence)                                 │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐   │
│  │  OMEGA Orchestrator│  │ Cognitive Kernel  │  │Meta-Singularity   │   │
│  │      (1190 LOC)   │  │      v22Ω         │  │    Kernel         │   │
│  └─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘   │
│            │                      │                      │             │
│            └──────────────────────┼──────────────────────┘             │
│                                   ▼                                     │
│                    ┌───────────────────────────┐                       │
│                    │    Meta-Kernel v∞Ω       │                       │
│                    │   (Super-Conscience)      │                       │
│                    └───────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       COUCHE 3: PROVIDERS                               │
│                         (85% cohérence)                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ titane-  │ │  tauri-  │ │  openai  │ │  claude  │ │  gemini  │      │
│  │  local   │ │   chat   │ │          │ │          │ │          │      │
│  │(infaillible)│ │ (Rust) │ │  (API)   │ │  (API)   │ │  (API)   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        COUCHE 4: SERVICES                               │
│                         (90% cohérence)                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │  Memory OS vΩ │  │   Auto-Heal   │  │   Metrics     │               │
│  │   (Backend)   │  │    Engine     │  │    Engine     │               │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
│                                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │   TitaneOS    │  │  Governance   │  │    IA Service │               │
│  │  (EventBus)   │  │  (Secrets)    │  │ (Validation)  │               │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Conclusion

Cette cartographie révèle **3 zones majeures de chevauchement** nécessitant consolidation:

1. **CoherenceEngine** ← (Moteur #2 + Nexus Engine)
2. **UnifiedMemory** ← (Moteur #5 + Memory Core + Singularity Memory OS)
3. **SystemHealth** ← (Helios Core + Sentinel)

La réduction de 14 → 9 composants permettra:
- **-60% d'interactions** (91 → 36)
- **Clarification des responsabilités**
- **Maintenance simplifiée**
- **Tests plus ciblés**

---

*Document généré dans le cadre du SUPER PROMPT #2 — Simplification Architecture TITANE∞*
