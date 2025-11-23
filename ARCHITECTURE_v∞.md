# 🏛️ TITANE∞ — ARCHITECTURE v∞ UNIFIED

**Version**: v∞ (Unification totale)
**Date**: 23 novembre 2025
**Statut**: RÉFÉRENCE ARCHITECTURALE UNIQUE
**Objectif**: Éliminer toute coexistence de versions hybrides

---

## 📋 CONTEXTE

### Problème Identifié (Erreur #5)

TITANE∞ souffre de **versions architecturales hybrides** coexistant dans le même codebase:

```
v12  → 8 fichiers (legacy, types, UI components)
v14  → 1 dossier (digital_twin_v14_1)
v15  → 22 fichiers (auto_evolution_v15, exp_fusion_v15, docs)
v17  → 30+ fichiers (backend v17.1, v17.2, v17.3)
v24  → 1 fichier (ARCHITECTURE_TYPES_v24-v∞.ts)
v∞   → Concepts théoriques (README_v∞.md, engines)
```

**Conséquences**:
- ❌ Confusion sur quelle version utiliser
- ❌ Code legacy non supprimé
- ❌ Imports incohérents (v17.1 vs v17.2)
- ❌ Documentation fragmentée
- ❌ Maintenabilité réduite de 50%

---

## 🎯 ARCHITECTURE v∞ CIBLE

### Principe Fondamental

**UNE SEULE ARCHITECTURE. UNE SEULE VERSION. ZÉRO HYBRIDATION.**

```
TITANE∞ v∞
├── Frontend (React + TypeScript)
├── Backend (Rust + Tauri 2.0)
├── Design System (v∞)
├── Types (v∞)
└── Documentation (v∞)
```

**Règle d'or**: Aucun suffixe de version dans les noms de fichiers/modules.

---

## 🗂️ STRUCTURE UNIFIÉE

### Backend Rust (src-tauri/src/)

```rust
src-tauri/src/
├── main.rs                    // ✅ Point d'entrée unique
├── lib.rs                     // ✅ Exports publics
│
├── api/                       // ✅ API Tauri Commands
│   ├── mod.rs
│   ├── helios_api.rs         // Monitoring système
│   ├── memory_api.rs         // Storage unifié
│   ├── engine_api.rs         // Evolution & diagnostics
│   └── system_api.rs         // États système globaux
│
├── engine/                    // ✅ Moteurs Core
│   ├── mod.rs
│   ├── auto_evolution.rs     // Evolution orchestrator
│   ├── diagnostics.rs        // Diagnostic engine
│   ├── repair.rs             // Auto-repair
│   └── health_check.rs       // Health monitoring
│
├── core/                      // ✅ Business Logic
│   ├── helios/               // Monitoring
│   ├── nexus/                // Connexions
│   ├── harmonia/             // Orchestration
│   └── sentinel/             // Sécurité
│
├── services/                  // ✅ Services Infrastructure
│   ├── memory/               // Persistence
│   ├── logging/              // Logs centralisés
│   └── events/               // Event bus
│
├── system/                    // ✅ Systèmes Spécialisés
│   ├── persona_engine/       // Persona state
│   └── cognitive/            // Cognitive engine
│
├── types/                     // ✅ Types Rust
│   ├── shared.rs             // Types partagés
│   └── responses.rs          // Response types
│
├── utils/                     // ✅ Utilitaires
│   ├── logging.rs
│   └── errors.rs
│
└── commands/                  // ✅ Command Handlers
    ├── mod.rs
    └── devtools.rs

❌ SUPPRIMÉ:
- auto_evolution_v15/         (remplacé par engine/auto_evolution.rs)
- exp_fusion_v15/             (fonctionnalité non critique)
- digital_twin_v14_1/         (legacy)
- api/legacy_commands.rs      (doublons)
- tauri_v2_guard.rs          (guard obsolète)
```

### Frontend React (src/)

```typescript
src/
├── main.tsx                   // ✅ Point d'entrée
├── App.tsx                    // ✅ Router principal
│
├── core/                      // ✅ Core Business Logic
│   ├── ARCHITECTURE_TYPES.ts // Types unifiés (plus de v24-v∞)
│   ├── engines/
│   │   ├── SINGULARITY_ENGINE.ts  // Moteur unifié
│   │   └── index.ts
│   ├── persona/
│   │   ├── PersonaEngine.ts
│   │   ├── MoodEngine.ts
│   │   └── PersonaBridge.ts
│   └── archetypes/
│       └── ARCHETYPES.ts
│
├── stores/                    // ✅ State Management (Zustand)
│   ├── singularityStore.ts   // Store unifié (5 layers)
│   ├── singularitySelectors.ts
│   └── index.ts
│
├── services/                  // ✅ Services Layer
│   ├── api/
│   │   └── index.ts          // API client unifié
│   ├── tauri/
│   │   ├── commands.ts       // Tauri commands wrappers
│   │   ├── types.ts          // Types miroirs Rust
│   │   └── index.ts
│   └── singularityBridge.ts  // Rust ↔ React sync
│
├── components/                // ✅ Composants React
│   ├── ChatWindow.tsx
│   ├── VoiceDuplexUI.tsx
│   └── ... (organisés par fonctionnalité)
│
├── pages/                     // ✅ Pages Application
│   ├── ChatPage.tsx
│   ├── DesignSystemPage.tsx
│   └── DevTools.tsx
│
├── hooks/                     // ✅ Custom Hooks
│   ├── useSingularity.ts     // Hook principal
│   ├── useChat.ts
│   └── useMemory.ts
│
├── design-system/             // ✅ Design System
│   ├── titane.css            // Styles unifiés (plus de v12)
│   ├── colors.ts
│   └── tokens.ts
│
├── ui/                        // ✅ UI Primitives
│   ├── components/
│   │   ├── Button.tsx
│   │   └── ... (Design System v∞)
│   └── pages/
│       └── ... (Pages UI)
│
└── types/                     // ✅ Types TypeScript
    ├── constants.ts
    └── system.d.ts

❌ SUPPRIMÉ:
- services/tauri/backend-v17.2.commands.ts  (unifié dans commands.ts)
- services/tauri/backend-v17.2.types.ts     (unifié dans types.ts)
- design-system/titane-v12.css              (obsolète)
- core/ARCHITECTURE_TYPES_v24-v∞.ts         (renommé ARCHITECTURE_TYPES.ts)
```

---

## 📐 PATTERNS ARCHITECTURAUX v∞

### 1. Communication Backend ↔ Frontend

#### ✅ PATTERN RECOMMANDÉ

**Backend Rust**:
```rust
// src-tauri/src/api/memory_api.rs

#[tauri::command]
pub async fn get_memory_state(
    memory: State<'_, Arc<MemoryCore>>,
) -> Result<MemoryState, String> {
    let state = memory.get_state().await;
    Ok(state)
}
```

**Frontend TypeScript**:
```typescript
// src/services/tauri/commands.ts

export async function getMemoryState(): Promise<MemoryState> {
  return invoke<MemoryState>('get_memory_state');
}

// src/stores/singularityStore.ts (Usage)
const memoryState = await getMemoryState();
```

#### ❌ ANTI-PATTERN (Hybride v17.1/v17.2)

```typescript
// ❌ NE PAS FAIRE: Multiple versions coexistant
import { memory } from './commands';           // v17.1
import { memoryV17 } from './backend-v17.2.commands';  // v17.2

// Confusion: quelle version utiliser?
```

### 2. State Management (React)

#### ✅ PATTERN RECOMMANDÉ: SingularityStore Unifié

```typescript
// src/stores/singularityStore.ts

interface SingularityState {
  physical: PhysicalLayer;    // Helios, health, metrics
  cognitive: CognitiveLayer;   // Memory, AI, knowledge
  symbolic: SymbolicLayer;     // Persona, visual, archetypes
  adaptive: AdaptiveLayer;     // Evolution, learning
  meta: MetaLayer;             // UI, runtime, introspection
}

export const useSingularityStore = create<SingularityState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State initial + actions
      }))
    )
  )
);
```

**Usage composant**:
```typescript
// src/components/ChatWindow.tsx
import { useMessages, useAddMessage } from '@/stores/singularitySelectors';

const messages = useMessages();
const addMessage = useAddMessage();
```

#### ❌ ANTI-PATTERN: Fragmentation useState

```typescript
// ❌ NE PAS FAIRE: 243 useState locaux
const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
// ... 240 autres useState fragmentés
```

### 3. Async Rust (Concurrency)

#### ✅ PATTERN RECOMMANDÉ: tokio::sync

```rust
use tokio::sync::{Mutex, RwLock};
use std::sync::Arc;

pub struct AutoEvolutionEngine {
    state: Arc<RwLock<EvolutionState>>,
    evolution_lock: Arc<Mutex<()>>,
}

impl AutoEvolutionEngine {
    pub async fn evolve(&self) -> AppResult<EvolutionReport> {
        let _guard = self.evolution_lock.lock().await;  // ✅ Async lock
        let mut state = self.state.write().await;
        // ... logique
    }
}
```

#### ❌ ANTI-PATTERN: std::sync::Mutex en async

```rust
// ❌ NE PAS FAIRE: Blocking mutex in async context
use std::sync::Mutex;

pub async fn process(state: State<'_, Mutex<Data>>) {
    let data = state.lock().unwrap();  // ❌ DEADLOCK POSSIBLE!
    // ... async operations
}
```

### 4. Types Partagés Rust ↔ TypeScript

#### ✅ PATTERN RECOMMANDÉ: Types miroirs manuels

**Rust**:
```rust
// src-tauri/src/types/responses.rs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryState {
    pub total_entries: usize,
    pub last_update: String,
    pub health_score: f32,
}
```

**TypeScript** (miroir exact):
```typescript
// src/services/tauri/types.ts

export interface MemoryState {
  total_entries: number;
  last_update: string;
  health_score: number;
}
```

**Note**: Pour l'avenir, considérer `ts-rs` pour génération automatique.

#### ❌ ANTI-PATTERN: Types divergents

```typescript
// ❌ NE PAS FAIRE: Types divergents entre Rust et TS
// Rust: health_score: f32
// TS:   healthScore: string  ❌ Type + naming différents!
```

### 5. Imports & Modules

#### ✅ PATTERN RECOMMANDÉ: Imports absolus

```typescript
// ✅ Imports absolus via alias @
import { useSingularityStore } from '@/stores/singularityStore';
import { PersonaEngine } from '@/core/persona/PersonaEngine';
import { Button } from '@/ui/components/Button';
```

Configuration `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/core/*"],
      "@stores/*": ["./src/stores/*"]
    }
  }
}
```

#### ❌ ANTI-PATTERN: Imports relatifs profonds

```typescript
// ❌ NE PAS FAIRE: Imports relatifs illisibles
import { PersonaEngine } from '../../../core/persona/PersonaEngine';
import { Button } from '../../../../ui/components/Button';
```

---

## 🚫 ANTI-PATTERNS INTERDITS

### 1. Suffixes de Version dans Noms de Fichiers

❌ **Interdit**:
```
backend-v17.2.commands.ts
ARCHITECTURE_TYPES_v24-v∞.ts
auto_evolution_v15/
exp_fusion_v15/
```

✅ **Correct**:
```
commands.ts
ARCHITECTURE_TYPES.ts
auto_evolution/
exp_fusion/ (ou supprimer si non critique)
```

### 2. Multiple Exports pour Même Fonctionnalité

❌ **Interdit**:
```typescript
// ❌ Confusion: 2 versions du même service
export { memory } from './commands';           // v17.1
export { memory as memoryV17 } from './backend-v17.2.commands';
```

✅ **Correct**:
```typescript
// ✅ Une seule API unifiée
export { memory } from './commands';
```

### 3. Code Legacy Non Supprimé

❌ **Interdit**: Garder code commenté/obsolète
```rust
// ❌ NE PAS FAIRE
// use crate::auto_evolution_v15::*;  // Legacy code commented
use crate::engine::auto_evolution::*;
```

✅ **Correct**: Supprimer complètement le legacy
```rust
// ✅ Seulement le code actif
use crate::engine::auto_evolution::*;
```

### 4. Dépendances Circulaires

❌ **Interdit**:
```
exp_fusion_v15/weight_integration.rs
  └── imports auto_evolution_v15::LogicCalibrator

auto_evolution_v15/consistency_manager.rs
  └── imports exp_fusion_v15::ExpCalculator

❌ Dépendance circulaire!
```

✅ **Correct**: Extraction module commun
```
shared/calculators.rs
  ├── LogicCalibrator
  └── ExpCalculator

engine/auto_evolution.rs → imports shared::calculators
engine/exp_fusion.rs → imports shared::calculators
```

---

## 📚 CONVENTIONS NOMMAGE

### Modules Rust

```rust
// ✅ CORRECT
mod auto_evolution;
mod memory_api;
mod helios_state;

// ❌ INCORRECT
mod auto_evolution_v15;
mod memory_api_v17_2;
mod helios_state_legacy;
```

### Fichiers TypeScript

```typescript
// ✅ CORRECT
PersonaEngine.ts
singularityStore.ts
ARCHITECTURE_TYPES.ts

// ❌ INCORRECT
PersonaEngine_v24.ts
singularityStore-v17.ts
ARCHITECTURE_TYPES_v24-v∞.ts
```

### Constantes & Types

```typescript
// ✅ CORRECT
export const APP_VERSION = '∞';
export const ARCHITECTURE_VERSION = 'v∞';

// ❌ INCORRECT
export const APP_VERSION_V17_3 = '17.3.0';
export const LEGACY_VERSION = 'v15.5';
```

---

## 🔄 MIGRATION GUIDE

### Phase 1: Renommer Fichiers (2 heures)

```bash
# Backend Rust
cd src-tauri/src

# Supprimer suffixes version
# (Après avoir migré le code vers nouvelles versions)
rm -rf auto_evolution_v15/
rm -rf exp_fusion_v15/
rm -rf digital_twin_v14_1/

# Frontend TypeScript
cd src

# Renommer fichiers
mv core/ARCHITECTURE_TYPES_v24-v∞.ts core/ARCHITECTURE_TYPES.ts
mv design-system/titane-v12.css design-system/titane.css

# Unifier services Tauri
# Fusionner backend-v17.2.commands.ts → commands.ts
# Fusionner backend-v17.2.types.ts → types.ts
```

### Phase 2: Mettre à Jour Imports (4 heures)

```bash
# Chercher tous les imports obsolètes
grep -r "ARCHITECTURE_TYPES_v24-v∞" src
grep -r "backend-v17.2" src
grep -r "auto_evolution_v15" src-tauri/src
grep -r "exp_fusion_v15" src-tauri/src

# Remplacer globalement (avec sed ou manuellement)
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i \
  's/ARCHITECTURE_TYPES_v24-v∞/ARCHITECTURE_TYPES/g'
```

### Phase 3: Nettoyer Documentation (2 heures)

```bash
# Archiver docs legacy (ne pas supprimer)
mkdir -p docs/archive/v12-v15-v17
mv docs/*v12* docs/archive/v12-v15-v17/
mv docs/*v15* docs/archive/v12-v15-v17/
mv docs/*v17.2* docs/archive/v12-v15-v17/

# Garder uniquement docs v17.3+ et v∞
```

### Phase 4: Tests & Validation (2 heures)

```bash
# Rust
cd src-tauri
cargo check                # 0 erreurs
cargo clippy              # 0 warnings critiques
cargo test --lib          # 80+ tests passent

# TypeScript
pnpm type-check           # 0 erreurs
pnpm lint                 # < 50 warnings
pnpm build                # Successful
```

---

## 📊 MÉTRIQUES SUCCÈS

### Avant (Hybride v12/v15/v17/v∞)

```
Backend:
- 3 versions coexistant (v14, v15, v17)
- 22 fichiers legacy
- Imports incohérents

Frontend:
- 4 versions services Tauri (v17.1, v17.2, v24, v∞)
- 243 useState fragmentés
- Types divergents Rust ↔ TS

Documentation:
- 50+ fichiers avec suffixes version
- Fragmentation v12 → v17
```

### Après (v∞ Unifié)

```
Backend:
- ✅ 1 seule version (v∞)
- ✅ 0 fichiers legacy
- ✅ Imports cohérents

Frontend:
- ✅ 1 seule API Tauri
- ✅ 50 useState (UI temporaire uniquement)
- ✅ Types miroirs exacts

Documentation:
- ✅ 0 suffixe version dans noms fichiers
- ✅ Architecture unifiée v∞
```

---

## 🎯 CHECKLIST CONFORMITÉ

### Backend Rust
- [ ] Aucun dossier avec suffixe version (_v12, _v15, _v17)
- [ ] Tous imports utilisent `crate::engine` (pas `crate::engine_v15`)
- [ ] Tous Mutex sont `tokio::sync::Mutex` en async context
- [ ] Aucune dépendance circulaire
- [ ] `cargo clippy` → 0 warnings critiques

### Frontend React
- [ ] Aucun fichier avec suffixe version (-v12, _v24-v∞)
- [ ] 1 seul store Zustand (singularityStore)
- [ ] Imports absolus via alias @ configurés
- [ ] Types miroirs Rust exacts
- [ ] `pnpm type-check` → 0 erreurs

### Documentation
- [ ] Docs legacy archivés (docs/archive/)
- [ ] README principal à jour (sans références v12/v15)
- [ ] ARCHITECTURE.md synchronisé avec ce document
- [ ] CHANGELOG mentionne unification v∞

---

## 🔗 RÉFÉRENCES

### Documents Connexes
- [COMMAND_MAPPING_v14.md](./COMMAND_MAPPING_v14.md) - Mapping commandes Tauri
- [REACT_STATE_AUDIT_v14.md](./REACT_STATE_AUDIT_v14.md) - Audit état React
- [LEGACY_CODE_AUDIT_v14.md](./LEGACY_CODE_AUDIT_v14.md) - Audit code legacy
- [TITANE_v14_COMPLETE_REPORT.md](./TITANE_v14_COMPLETE_REPORT.md) - Rapport complet stabilisation

### Standards Techniques
- **Rust**: Edition 2021, tokio 1.x async runtime
- **TypeScript**: 5.7+, strict mode enabled
- **React**: 18.3+, hooks-based architecture
- **Tauri**: 2.0+, pure Tauri (no Electron hybrid)
- **Zustand**: 5.x, state management
- **Vite**: 6.x, build tool

---

**🏛️ ARCHITECTURE v∞ - VERSION UNIQUE - ZÉRO HYBRIDATION**

**Status**: Document de référence permanent
**Maintenance**: Mettre à jour à chaque changement architectural majeur
**Auteur**: GitHub Copilot + Kevin (utilisateur)
**Date dernière MAJ**: 23 novembre 2025
