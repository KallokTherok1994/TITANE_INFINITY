# Types Migration Guide v17.3.0

## Problème Identifié

**Doublons critiques entre `types/` et `shared/types.rs` :**

### 1. HealthStatus (2 définitions incompatibles)

**types/helios.rs :**

```rust
pub enum HealthStatus {
    Healthy,
    Warning,
    Critical,
}
```

**shared/types.rs :**

```rust
pub enum HealthStatus {
    Healthy,
    Degraded,  // ← Différent !
    Critical,
    Offline,   // ← Variant supplémentaire
}
```

### 2. ModuleHealth (2 définitions complètement différentes)

**types/nexus.rs :**

```rust
pub enum ModuleHealth {  // ← ENUM
    Healthy,
    Degraded,
    Critical,
}
```

**shared/types.rs :**

```rust
pub struct ModuleHealth {  // ← STRUCT
    pub name: String,
    pub status: HealthStatus,
    pub uptime: u64,
    pub last_tick: u64,
    pub message: String,
}
```

### 3. LogEntry (doublon exact)

Défini dans `types/memory.rs` ET `shared/types.rs`

---

## Solution Recommandée

### Phase 1 : Créer `types/shared.rs` (canonical)

```rust
// types/shared.rs - Types partagés entre core et legacy modules

use serde::{Deserialize, Serialize};

/// Health status pour modules système
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum HealthStatus {
    Healthy,
    Warning,
    Critical,
    Offline,  // Pour modules non initialisés ou crashés
}

/// Informations complètes sur santé d'un module
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleHealthInfo {
    pub name: String,
    pub status: HealthStatus,
    pub uptime: u64,
    pub last_tick: u64,
    pub message: String,
}
```

### Phase 2 : Migrer types/nexus.rs

```rust
// Remplacer ModuleHealth enum par HealthStatus
pub use crate::types::shared::HealthStatus;

pub struct ModuleStatus {
    pub name: String,
    pub health: HealthStatus,  // ← Changé de ModuleHealth à HealthStatus
    pub uptime: u64,
    pub last_tick: i64,
    pub message: String,
}
```

### Phase 3 : Deprecate shared/types.rs

Ajouter en haut du fichier :

```rust
#[deprecated(since = "17.3.0", note = "Use types::shared instead")]
```

Puis progressivement migrer tous les imports.

### Phase 4 : Update tous les imports

```bash
# Rechercher tous les usages
rg "shared::types::" --type rust
rg "use.*shared.*types" --type rust
```

---

## Impact Analysis

### Modules Affectés

1. **Core v17.2.0** : Utilise `types/`
   - ✅ Pas de changement nécessaire (sauf types/nexus)

2. **Legacy modules** : Utilisent `shared/types`
   - ⚠️ Doivent migrer vers `types::shared`

3. **System extensions** : Mix des deux
   - ⚠️ Audit nécessaire

### Breaking Changes

- `ModuleHealth` enum → `HealthStatus`
- `ModuleHealth` struct → `ModuleHealthInfo`
- `shared::types::*` → `types::shared::*`

---

## Action Items

- [ ] Créer `types/shared.rs`
- [ ] Migrer `types/nexus.rs`
- [ ] Update `types/mod.rs` exports
- [ ] Deprecate `shared/types.rs`
- [ ] Migrer system/persona_engine
- [ ] Migrer overdrive modules
- [ ] Tests de compilation
- [ ] Update frontend TypeScript types si nécessaire

---

**Estimated effort : 3-4 heures**
**Risk level : Medium (breaking changes)**
**Recommended : Do after P1.1 (unwrap cleanup)**
