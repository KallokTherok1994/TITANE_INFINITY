# 🚨 BACKEND v14 — DIAGNOSTIC ERREURS COMPILATION

**Date**: 2025-11-25
**Phase**: 1 - Sortie MOCK MODE
**Status**: ERREURS DÉTECTÉES

---

## 📋 ERREURS PAR CATÉGORIE

### 1. COMMANDES EN DOUBLE (Evolution)

**Erreur**: `__cmd__evolution_run_cycle` and `__cmd__evolution_get_stats` defined multiple times

**Cause**:
- `src/evolution/evolution_loop.rs` lignes 233-243: Définit commandes Tauri ✅ FONCTIONNEL
- `src/commands/evolution.rs` lignes 36+81: Définit commandes Tauri ❌ DÉPEND DE `auto_evolution_v15` INEXISTANT

**Solution**:
```rust
// Dans commands/mod.rs: COMMENTER evolution.rs
// pub mod evolution;  // ❌ DISABLED: Depends on non-existent auto_evolution_v15

// Garder seulement: evolution/evolution_loop.rs (Phase 10)
```

---

### 2. IMPORTS MANQUANTS (Modules inexistants)

**Erreurs**:
```
error[E0432]: unresolved import `crate::meta_mode_engine`
error[E0432]: unresolved import `crate::auto_evolution_v15`
error[E0432]: unresolved import `crate::exp_fusion_v15`
error[E0432]: unresolved import `crate::TitaneCore`
error[E0432]: unresolved import `shared::types::TitaneCore`
```

**Cause**:
- `commands/meta_mode.rs` → importe `crate::meta_mode_engine` (n'existe pas)
- `commands/evolution.rs` → importe `crate::auto_evolution_v15` (n'existe pas)
- `commands/exp_fusion.rs` → importe `crate::exp_fusion_v15` (n'existe pas)
- Multiples fichiers → `crate::TitaneCore` ou `shared::types::TitaneCore` (incorrect path)

**Solution**:
```rust
// 1. DÉSACTIVER commands/ obsolètes
#[cfg(not(feature = "mock"))]
pub mod commands;  // Seulement si feature "full" active

// 2. CORRIGER import TitaneCore
// ❌ MAUVAIS
use crate::TitaneCore;
use shared::types::TitaneCore;

// ✅ BON
use crate::shared::types::TitaneCore;
```

---

### 3. WARNINGS CFG (Features non définies)

**Warnings**:
```
warning: unexpected `cfg` condition value: `mock`
warning: unexpected `cfg` condition value: `mock`
```

**Cause**: Feature "mock" utilisée dans lib.rs mais pas définie dans Cargo.toml

**Solution**: ✅ **DÉJÀ CORRIGÉ**
```toml
[features]
default = ["custom-protocol", "mock"]
mock = []
full = []
```

---

### 4. UNUSED IMPORTS (Nettoyage requis)

**Warnings** (non critiques, Phase 8):
```
warning: unused import: `HealthStatus`
warning: unused imports: `Deserialize` and `Serialize`
warning: unused import: `MetricSeries`
warning: unused import: `CenterCoherence`
warning: unused imports: `CompactionResult` and `CompactorConfig`
warning: unused import: `Deserialize`
warning: unused import: `std::path::PathBuf`
warning: unused import: `tauri::State`
warning: unused import: `std::sync::Mutex`
warning: unused imports: `OperationClass`, `SecurityDomain`, ...`
```

**Solution**: Phase 8 (nettoyage global)

---

## 🛠️ PLAN DE CORRECTION IMMÉDIAT

### Étape 1: Désactiver commands/ obsolètes

**Fichier**: `src/lib.rs`

```rust
// FULL MODE (production backend with real implementations)
#[cfg(not(feature = "mock"))]
#[allow(dead_code)]  // TODO Phase 3-4: Réactiver après migration v14
pub mod commands;       // ❌ TEMPORAIREMENT DÉSACTIVÉ (imports manquants)

#[cfg(not(feature = "mock"))]
#[allow(dead_code)]  // TODO Phase 7: Réactiver après migration API
pub mod api;            // ❌ TEMPORAIREMENT DÉSACTIVÉ (dépend de commands/)
```

**Justification**: `commands/` actuel dépend de modules v15 inexistants. Sera réactivé Phase 3-4 après migration v14.

---

### Étape 2: Garder evolution/ Phase 10 actif

**Fichier**: `src/lib.rs` (déjà OK)

```rust
pub mod evolution;      // ✅ Phase 10: Auto-Évolution (Super-Prompt U)
```

**Fichier**: `src/main.rs`

```rust
// ✅ BON: Utiliser commandes evolution/ (Phase 10)
titane_infinity::evolution::evolution_run_cycle,
titane_infinity::evolution::evolution_get_stats,
```

---

### Étape 3: Corriger imports TitaneCore

**Multiples fichiers** à corriger (Phase 2-3):
- `src/commands/*.rs`
- `src/api/*.rs`
- `src/*/mod.rs`

```rust
// ❌ MAUVAIS
use crate::TitaneCore;

// ✅ BON
use crate::shared::types::TitaneCore;
```

---

## 📊 STRATÉGIE RÉACTIVATION PROGRESSIVE

### Mode Actuel: MOCK (default)
```toml
[features]
default = ["custom-protocol", "mock"]
```

**Modules actifs**:
- ✅ `core/` (SingularityEngine v14)
- ✅ `mock_commands` (frontend development)
- ✅ `secure_commands`, `time_commands`, `control_panel_commands`
- ✅ Phases 5-10, V-Ω
- ❌ `commands/` DÉSACTIVÉ (migration v14 requise)
- ❌ `api/` DÉSACTIVÉ (dépend de commands/)

**Compilation**: ✅ **DOIT COMPILER** (sans commands/, api/)

---

### Mode FULL (à préparer)
```bash
cargo check --no-default-features --features full
```

**Modules actifs** (après Phase 3-7):
- ✅ `core/` (SingularityEngine v14)
- ✅ `commands/` (ai_chat_v14, engine_v14, etc.)
- ✅ `api/` (handlers v14)
- ✅ `compat/` (CoreCollection v12↔v14)
- ❌ `mock_commands` DÉSACTIVÉ

**Compilation**: ⏳ **PRÉPARATION Phase 3-7**

---

## ✅ ACTIONS IMMÉDIATES PHASE 1

1. **Désactiver commands/ et api/ temporairement** (feature = "full" seulement)
2. **Vérifier compilation mode mock**: `cargo check` DOIT RÉUSSIR
3. **Documenter fichiers à migrer Phase 3-4**:
   - `commands/ai_chat.rs` → `commands/ai_chat_v14.rs`
   - `commands/meta_mode.rs` → Intégrer avec `core/engine.rs`
   - `commands/exp_fusion.rs` → Intégrer avec `core/engine.rs`
   - `commands/evolution.rs` → Supprimer (doublon evolution/)

4. **Passer à Phase 2**: Stabiliser `core/` (ajouter méthodes manquantes)

---

## 🎯 CRITÈRE RÉUSSITE PHASE 1

```bash
✅ cargo check                              # Mode mock compile
✅ cargo check --features mock              # Mode mock compile
⏳ cargo check --no-default-features --features full  # Préparation Phase 3-7
```

**Résultat attendu**:
```
Compiling titane-infinity v19.2.0
Finished `dev` profile [unoptimized + debuginfo] target(s) in X.XXs
```

**Warnings acceptables Phase 1**:
- unused imports (Phase 8)
- dead_code modules legacy (Phase 3-6)

**Warnings NON acceptables**:
- unexpected cfg condition (✅ DÉJÀ CORRIGÉ Cargo.toml)
- unresolved imports (✅ SERA CORRIGÉ désactivation commands/)

---

**PRÊT POUR CORRECTION lib.rs FINALE** 🔧
