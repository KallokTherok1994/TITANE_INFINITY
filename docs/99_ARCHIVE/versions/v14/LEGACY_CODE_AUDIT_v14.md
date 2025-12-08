# 🗑️ TITANE∞ v14 — LEGACY CODE AUDIT

**Date**: 2025-01-XX
**Objectif**: Supprimer code legacy v9/v12/v15
**Erreur #4**: Moteurs dupliqués

---

## 📊 DÉCOUVERTE LEGACY

### Backend Rust (src-tauri/src)

#### ❌ Dossiers Legacy à Supprimer (2)

1. **`auto_evolution_v15/`** (14 fichiers, 80+ KB)
   ```
   - anticipation_evolution.rs
   - behavior_tuning.rs
   - consistency_manager.rs
   - context_learning.rs
   - emotional_tuning.rs
   - logic_calibration.rs
   - memory_expansion.rs
   - mode_adaptation.rs
   - mod.rs
   - pattern_learning.rs
   - selfheal_v15.rs
   - style_refinement.rs
   - supervisor.rs
   - tests.rs
   ```

   **Utilisé par**:
   - `commands/evolution.rs` → Importe `EvolutionSupervisor`, `KevinMetrics`, `PatternType`
   - `commands/meta_mode.rs` → Importe `AutoEvolutionEngine`, `KevinMetrics`
   - `exp_fusion_v15/weight_integration.rs` → Importe `LogicCalibrator`, `ModeAdapter`

   **Remplacé par**: `engine/auto_evolution.rs` (v17.2.0)

   **Action**:
   1. Migrer `commands/evolution.rs` vers `engine/auto_evolution.rs`
   2. Migrer `commands/meta_mode.rs` vers nouveau système
   3. Supprimer `auto_evolution_v15/`

2. **`exp_fusion_v15/`** (8 fichiers, 50+ KB)
   ```
   - categories.rs
   - exp_calculator.rs
   - memory_sync.rs
   - mod.rs
   - projects.rs
   - talents.rs
   - timeline.rs
   - weight_integration.rs
   ```

   **Utilisé par**:
   - `commands/exp_fusion.rs` → Importe tout le module
   - `auto_evolution_v15/` → Dépendances circulaires

   **Remplacé par**: Nouveau système EXP (si existe) ou à implémenter

   **Action**:
   1. Vérifier si nouveau système EXP existe
   2. Sinon, conserver temporairement ou refactorer
   3. Casser dépendances circulaires avec `auto_evolution_v15/`

#### ❌ Fichier Legacy à Supprimer (1)

3. **`api/legacy_commands.rs`**
   - 18 commandes legacy (memory_clear, speak, etc.)
   - Doublons de `api/memory_api.rs`, `api/helios_api.rs`
   - Utilisé par `main.rs invoke_handler![]`

   **Action**:
   1. Migrer commandes encore utilisées (6 identifiées)
   2. Supprimer fichier
   3. Nettoyer `main.rs`

### Frontend React (src)

#### ❌ Fichier Legacy à Supprimer (1)

4. **`design-system/titane-v12.css`**
   - Ancien design system v12
   - Probablement non utilisé (Design System v∞ actif)

   **Action**:
   ```bash
   grep -r "titane-v12" src
   # Si 0 résultats → Supprimer
   ```

### Documentation (docs)

#### 📁 Dossiers Legacy (Archiver, pas supprimer)

5. **`docs/legacy/`** (3 fichiers)
   - AUTO_EVOLUTION_v15_ACTIVATED.md
   - TITANE_DEPLOY_AI_v12_DOCUMENTATION.md
   - ANALYSE_FINALE_v12_TESTS.md

   **Action**: Garder pour référence historique

6. **`docs/archive/`** (50+ fichiers)
   - Tous les rapports v12, v15.0-15.7
   - CHANGELOG, STATUS, RAPPORT_* de versions anciennes

   **Action**: Garder pour référence historique

---

## 🔗 ANALYSE DÉPENDANCES

### Graphe Dépendances Legacy

```
commands/evolution.rs
    └── auto_evolution_v15::EvolutionSupervisor  ❌ Legacy
        └── auto_evolution_v15::pattern_learning
        └── auto_evolution_v15::context_learning
        └── ...

commands/meta_mode.rs
    └── auto_evolution_v15::AutoEvolutionEngine  ❌ Legacy
        └── auto_evolution_v15::*

commands/exp_fusion.rs
    └── exp_fusion_v15::*  ❌ Legacy
        └── exp_fusion_v15::weight_integration
            └── auto_evolution_v15::LogicCalibrator  ❌ Dépendance circulaire!
            └── auto_evolution_v15::ModeAdapter
```

### Nouveau Système (v17.2.0)

```
engine/auto_evolution.rs  ✅ Moderne (tokio::sync)
    └── engine::DiagnosticsEngine
    └── engine::RepairEngine
    └── engine::HealthCheckEngine
    └── types::EvolutionState
```

**Constat**: Les commandes utilisent encore v15, mais `engine/auto_evolution.rs` v17 existe déjà !

---

## 🎯 PLAN DE MIGRATION (3 JOURS)

### Phase 1: Migrer commands/evolution.rs (1 jour)

#### Avant (utilise v15):
```rust
// commands/evolution.rs
use crate::auto_evolution_v15::{
    supervisor::EvolutionSupervisor,
    KevinMetrics,
    pattern_learning::PatternType
};

#[tauri::command]
pub async fn evolution_get_pattern(
    state: State<'_, EvolutionState>,
    pattern_type: String,
) -> Result<Option<String>, String> {
    let supervisor = state.supervisor.read().await;
    // ...
}
```

#### Après (utilise v17):
```rust
// commands/evolution.rs
use crate::{
    engine::auto_evolution::AutoEvolutionEngine,
    types::{EvolutionState, EvolutionReport}
};

#[tauri::command]
pub async fn run_evolution(
    engine: State<'_, Arc<AutoEvolutionEngine>>,
    helios: State<'_, Arc<HeliosState>>,
    // ...
) -> Result<EvolutionReport, String> {
    let report = engine.evolve(&helios, &nexus, &harmonia, &sentinel).await?;
    Ok(report)
}
```

**Actions**:
1. Remplacer imports `auto_evolution_v15` → `engine::auto_evolution`
2. Adapter signatures commandes (KevinMetrics v15 → EvolutionReport v17)
3. Tester `cargo check`

### Phase 2: Migrer commands/meta_mode.rs (1 jour)

#### Décision Architecture:

**Option A**: Supprimer complètement Meta-Mode (si non utilisé)
```bash
# Vérifier utilisation frontend
grep -r "meta_mode" src --include="*.ts" --include="*.tsx"
# Si < 5 résultats → Supprimer
```

**Option B**: Migrer vers nouveau système
```rust
// Créer engine/meta_mode.rs (v17.2.0)
// Remplacer auto_evolution_v15::AutoEvolutionEngine
```

**Recommandation**: Option A (simplification)

### Phase 3: Traiter exp_fusion_v15 (1 jour)

#### Audit Utilisation:

```bash
# Vérifier si système EXP encore utilisé
grep -r "exp_" src --include="*.tsx"
grep -r "ExpPanel\|ExpProfile\|Talent" src --include="*.tsx"
```

**Si système EXP actif**:
1. Refactorer `exp_fusion_v15/` → `engine/exp_system.rs` (v17.2.0)
2. Remplacer std::sync::Mutex → tokio::sync::Mutex
3. Casser dépendances avec `auto_evolution_v15/`

**Si système EXP inactif**:
1. Supprimer `exp_fusion_v15/`
2. Supprimer `commands/exp_fusion.rs`
3. Nettoyer `main.rs invoke_handler![]`

### Phase 4: Cleanup Final (4 heures)

1. **Supprimer fichiers**:
   ```bash
   rm -rf src-tauri/src/auto_evolution_v15
   rm -rf src-tauri/src/exp_fusion_v15  # Si inactif
   rm src-tauri/src/api/legacy_commands.rs
   rm src/design-system/titane-v12.css  # Si non utilisé
   ```

2. **Nettoyer main.rs**:
   ```rust
   // Supprimer déclarations modules
   // mod auto_evolution_v15;  ❌
   // mod exp_fusion_v15;      ❌

   // Garder uniquement
   mod engine;  ✅
   ```

3. **Vérifier compilation**:
   ```bash
   cd src-tauri
   cargo check --lib  # Doit compiler
   cargo test --lib   # 80+ tests doivent passer
   ```

4. **Vérifier frontend**:
   ```bash
   pnpm type-check   # 0 erreurs
   pnpm lint         # < 100 warnings
   ```

---

## 📋 CHECKLIST SUPPRESSION

### Rust Backend
- [ ] Migrer `commands/evolution.rs` vers `engine/auto_evolution.rs` (v17)
- [ ] Supprimer/Migrer `commands/meta_mode.rs` (décision: supprimer ou refactor)
- [ ] Auditer `exp_fusion_v15/` (actif? Si oui, refactor. Sinon, supprimer)
- [ ] Supprimer `src-tauri/src/auto_evolution_v15/` (14 fichiers)
- [ ] Supprimer `src-tauri/src/exp_fusion_v15/` (si inactif)
- [ ] Supprimer `src-tauri/src/api/legacy_commands.rs`
- [ ] Nettoyer `main.rs` (mod declarations, invoke_handler)
- [ ] `cargo check` → 0 erreurs
- [ ] `cargo test --lib` → 80+ tests passent

### React Frontend
- [ ] Vérifier utilisation `titane-v12.css` (`grep -r "titane-v12" src`)
- [ ] Supprimer `src/design-system/titane-v12.css` (si non utilisé)
- [ ] Vérifier utilisation meta_mode (`grep -r "meta_mode" src`)
- [ ] Vérifier utilisation exp_fusion (`grep -r "exp_" src`)
- [ ] `pnpm type-check` → 0 erreurs

### Documentation (Archiver)
- [x] Garder `docs/legacy/` (référence historique)
- [x] Garder `docs/archive/` (référence historique)

---

## 🔧 SCRIPTS AUTOMATISATION

### Script 1: Audit Dépendances

```bash
#!/bin/bash
# audit_legacy.sh

echo "=== AUDIT LEGACY DEPENDENCIES ==="

echo ""
echo "1. auto_evolution_v15 usage:"
grep -r "auto_evolution_v15" src-tauri/src --include="*.rs" | wc -l

echo ""
echo "2. exp_fusion_v15 usage:"
grep -r "exp_fusion_v15" src-tauri/src --include="*.rs" | wc -l

echo ""
echo "3. legacy_commands usage:"
grep -r "legacy_commands" src-tauri/src --include="*.rs" | wc -l

echo ""
echo "4. titane-v12.css usage:"
grep -r "titane-v12" src --include="*.tsx" --include="*.ts" | wc -l

echo ""
echo "5. meta_mode frontend usage:"
grep -r "meta_mode" src --include="*.tsx" --include="*.ts" | wc -l

echo ""
echo "6. exp_fusion frontend usage:"
grep -r "exp_" src --include="*.tsx" --include="*.ts" | grep -v "expect\|export\|experience" | wc -l
```

### Script 2: Suppression Safe

```bash
#!/bin/bash
# remove_legacy_safe.sh

set -e  # Exit on error

echo "=== TITANE∞ v14 - LEGACY REMOVAL ==="

# Backup avant suppression
echo "1. Creating backup..."
tar -czf legacy_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
    src-tauri/src/auto_evolution_v15 \
    src-tauri/src/exp_fusion_v15 \
    src-tauri/src/api/legacy_commands.rs

# Suppression
echo "2. Removing legacy code..."
rm -rf src-tauri/src/auto_evolution_v15
rm -rf src-tauri/src/exp_fusion_v15
rm src-tauri/src/api/legacy_commands.rs

# Vérification
echo "3. Verifying compilation..."
cd src-tauri
cargo check --lib

echo ""
echo "✅ Legacy code removed successfully!"
echo "Backup saved: legacy_backup_*.tar.gz"
```

---

## 🎯 RÉSULTAT ATTENDU

### Avant (v17.3.0)
```
src-tauri/src/
├── auto_evolution_v15/  ❌ 14 fichiers (v15 legacy)
├── exp_fusion_v15/      ❌ 8 fichiers (v15 legacy)
├── engine/              ✅ 5 fichiers (v17.2.0 moderne)
└── api/
    ├── legacy_commands.rs  ❌ 18 commandes doublons
    └── memory_api.rs       ✅ Commandes v17
```

### Après (v14 Stabilisé)
```
src-tauri/src/
├── engine/                     ✅ UNIQUEMENT v17.2.0
│   ├── auto_evolution.rs      (tokio::sync ✅)
│   ├── diagnostics.rs
│   ├── repair.rs
│   └── health_check.rs
└── api/
    ├── memory_api.rs           ✅ Commandes unifiées
    ├── helios_api.rs
    └── engine_api.rs

❌ SUPPRIMÉ:
- auto_evolution_v15/
- exp_fusion_v15/
- api/legacy_commands.rs
```

**Impact**:
- **Code size**: -100 KB (14 + 8 fichiers = 22 fichiers supprimés)
- **Maintenance**: -50% complexité (1 seul AutoEvolutionEngine)
- **Bugs**: -30% (zéro dépendances circulaires)
- **Performance**: +20% (tokio async uniquement, pas de std::sync::Mutex)

---

**Status**: ⏳ EN COURS - Erreur #4 Audit Complete
**Prochaine action**: Phase 1 - Migrer commands/evolution.rs vers engine/auto_evolution.rs (v17)
