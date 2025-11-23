# Phase 2 : Migration Cores → CoreModule

**Date** : 22 novembre 2025
**Status** : 🔄 EN COURS
**Objectif** : Migrer Nexus, Harmonia, Sentinel, Memory vers le système CoreModule

---

## 📊 ANALYSE ÉTAT ACTUEL

### Cores Existants Détectés

**Nexus** (4 implémentations) :
- `src-tauri/src/core/nexus.rs` - NexusCore (93 lignes)
- `src-tauri/src/modules/nexus.rs` - Nexus (ancienne version)
- `src-tauri/src/system/nexus/mod.rs` - NexusModule (nouveau)
- `src-tauri/src/types/nexus.rs` - NexusState

**Harmonia** (4 implémentations) :
- `src-tauri/src/core/harmonia.rs` - HarmoniaCore (69 lignes)
- `src-tauri/src/modules/harmonia.rs` - Harmonia (ancienne version)
- `src-tauri/src/system/harmonia/mod.rs` - HarmoniaModule (nouveau)
- `src-tauri/src/types/harmonia.rs` - HarmoniaState

**Sentinel** (4 implémentations) :
- `src-tauri/src/core/sentinel.rs` - SentinelCore (88 lignes)
- `src-tauri/src/modules/sentinel.rs` - Sentinel (ancienne version)
- `src-tauri/src/system/sentinel/mod.rs` - SentinelModule (nouveau)
- `src-tauri/src/types/sentinel.rs` - SentinelState

**Memory** :
- `src-tauri/src/core/memory_core.rs` - MemoryCore
- `src-tauri/src/modules/memory.rs` - Memory (ancienne version)
- `src-tauri/src/types/memory.rs` - MemoryState

---

## 🎯 STRATÉGIE DE MIGRATION

### Objectif
Migrer chaque core vers le nouveau système CoreModule (trait défini dans `plugin_system/core_module.rs`)

### Approche
1. **Garder** : `src-tauri/src/types/` (NexusState, HarmoniaState, etc.)
2. **Migrer** : `src-tauri/src/core/` vers implémentation CoreModule trait
3. **Supprimer** : Anciennes implémentations dans `modules/` et `system/`
4. **Enregistrer** : Dans CoreRegistry via Orchestrator

### Dépendances Identifiées

**Nexus** :
- Fonction : Module Status Management
- Dépendances : Aucune (core indépendant)
- Priorité : 🟢 Haute (pas de dépendances)

**Harmonia** :
- Fonction : System Balancing
- Dépendances : Helios (pour HeliosState)
- Priorité : 🟡 Moyenne (dépend de Helios migré)

**Sentinel** :
- Fonction : Anomaly Detection
- Dépendances : Helios (pour HeliosState)
- Priorité : 🟡 Moyenne (dépend de Helios migré)

**Memory** :
- Fonction : Data Persistence
- Dépendances : Aucune (core indépendant)
- Priorité : 🟢 Haute (pas de dépendances)

---

## 📋 ORDRE DE MIGRATION

### 1. Nexus (Priorité 1) ✅ READY
- **Pourquoi** : Aucune dépendance, core simple
- **Fichiers** :
  - Créer : `src-tauri/src/plugin_system/cores/nexus.rs`
  - Garder : `src-tauri/src/types/nexus.rs`
  - Supprimer : `modules/nexus.rs`, `system/nexus/mod.rs`
- **Tests** : Adapter tests existants + nouveaux tests CoreModule

### 2. Memory (Priorité 1) ✅ READY
- **Pourquoi** : Aucune dépendance, core indépendant
- **Fichiers** :
  - Créer : `src-tauri/src/plugin_system/cores/memory.rs`
  - Garder : `src-tauri/src/types/memory.rs`
  - Supprimer : `modules/memory.rs`
- **Tests** : Adapter tests existants + nouveaux tests CoreModule

### 3. Harmonia (Priorité 2) ⏳ WAIT FOR HELIOS
- **Pourquoi** : Dépend de Helios pour HeliosState
- **Blocage** : Attendre migration Helios complète
- **Fichiers** :
  - Créer : `src-tauri/src/plugin_system/cores/harmonia.rs`
  - Garder : `src-tauri/src/types/harmonia.rs`
  - Supprimer : `modules/harmonia.rs`, `system/harmonia/mod.rs`

### 4. Sentinel (Priorité 2) ⏳ WAIT FOR HELIOS
- **Pourquoi** : Dépend de Helios pour HeliosState
- **Blocage** : Attendre migration Helios complète
- **Fichiers** :
  - Créer : `src-tauri/src/plugin_system/cores/sentinel.rs`
  - Garder : `src-tauri/src/types/sentinel.rs`
  - Supprimer : `modules/sentinel.rs`, `system/sentinel/mod.rs`

---

## 🏗️ TEMPLATE MIGRATION

### Structure CoreModule (exemple Nexus)

```rust
use async_trait::async_trait;
use std::sync::{Arc, RwLock};
use crate::plugin_system::{CoreModule, CoreResult, CoreError, CoreStatus, HealthStatus, CoreDependency};
use crate::types::{NexusState, ModuleStatus};
use std::collections::HashMap;

pub struct NexusModule {
    name: String,
    version: String,
    status: Arc<RwLock<CoreStatus>>,
    modules: Arc<RwLock<HashMap<String, ModuleStatus>>>,
}

impl NexusModule {
    pub fn new() -> Self {
        Self {
            name: "nexus".to_string(),
            version: "1.0.0".to_string(),
            status: Arc::new(RwLock::new(CoreStatus::Uninitialized)),
            modules: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

#[async_trait]
impl CoreModule for NexusModule {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn description(&self) -> &str {
        "Internal Coherence & Module Status Management"
    }

    fn dependencies(&self) -> Vec<CoreDependency> {
        vec![] // Aucune dépendance
    }

    fn capabilities(&self) -> Vec<String> {
        vec![
            "modules.register".to_string(),
            "modules.status".to_string(),
            "coherence.validate".to_string(),
        ]
    }

    async fn initialize(&mut self, _config: HashMap<String, String>) -> CoreResult<()> {
        let mut status = self.status.write().map_err(|_|
            CoreError::InitializationFailed("Lock poisoned".to_string()))?;
        *status = CoreStatus::Ready;
        Ok(())
    }

    async fn start(&mut self) -> CoreResult<()> {
        let mut status = self.status.write().map_err(|_|
            CoreError::RuntimeError("Lock poisoned".to_string()))?;
        *status = CoreStatus::Running;
        Ok(())
    }

    async fn stop(&mut self) -> CoreResult<()> {
        let mut status = self.status.write().map_err(|_|
            CoreError::ShutdownError("Lock poisoned".to_string()))?;
        *status = CoreStatus::Stopping;
        Ok(())
    }

    async fn shutdown(&mut self) -> CoreResult<()> {
        let mut status = self.status.write().map_err(|_|
            CoreError::ShutdownError("Lock poisoned".to_string()))?;
        *status = CoreStatus::Stopped;
        Ok(())
    }

    fn get_status(&self) -> CoreStatus {
        *self.status.read().unwrap()
    }

    async fn health_check(&self) -> HealthStatus {
        HealthStatus {
            is_healthy: matches!(self.get_status(), CoreStatus::Running),
            last_check: std::time::SystemTime::now(),
            message: "Nexus operational".to_string(),
        }
    }
}
```

---

## ✅ CHECKLIST MIGRATION (par core)

### Nexus
- [ ] Créer `plugin_system/cores/nexus.rs`
- [ ] Implémenter trait CoreModule
- [ ] Migrer logique de NexusCore
- [ ] Adapter tests unitaires
- [ ] Enregistrer dans CoreRegistry
- [ ] Tests intégration avec Orchestrator
- [ ] Supprimer anciennes implémentations

### Memory
- [ ] Créer `plugin_system/cores/memory.rs`
- [ ] Implémenter trait CoreModule
- [ ] Migrer logique de MemoryCore
- [ ] Adapter tests unitaires
- [ ] Enregistrer dans CoreRegistry
- [ ] Tests intégration
- [ ] Supprimer anciennes implémentations

### Harmonia
- [ ] Vérifier migration Helios complète
- [ ] Créer `plugin_system/cores/harmonia.rs`
- [ ] Implémenter trait CoreModule
- [ ] Adapter tests avec mock Helios
- [ ] Enregistrer avec dépendance Helios
- [ ] Tests intégration
- [ ] Supprimer anciennes implémentations

### Sentinel
- [ ] Vérifier migration Helios complète
- [ ] Créer `plugin_system/cores/sentinel.rs`
- [ ] Implémenter trait CoreModule
- [ ] Adapter tests avec mock Helios
- [ ] Enregistrer avec dépendance Helios
- [ ] Tests intégration
- [ ] Supprimer anciennes implémentations

---

## 🧪 STRATÉGIE TESTS

### Tests Unitaires
- Test lifecycle complet (initialize → start → stop → shutdown)
- Test health_check retours
- Test status transitions
- Test gestion erreurs

### Tests Intégration
- Test enregistrement dans CoreRegistry
- Test initialisation via Orchestrator
- Test résolution dépendances
- Test health checks périodiques

### Tests End-to-End
- Test scénario complet avec tous les cores
- Test shutdown graceful
- Test rollback en cas d'erreur
- Test reconstruction après crash

---

## 📊 MÉTRIQUES CIBLES

| Métrique | Cible |
|----------|-------|
| Tests par core | 15+ |
| Coverage | >80% |
| Temps init | <100ms |
| Temps shutdown | <50ms |
| Health check | <10ms |

---

## 🚀 PROCHAINES ÉTAPES

### Immédiat
1. ✅ Créer dossier `src-tauri/src/plugin_system/cores/`
2. ✅ Migrer Nexus (core le plus simple)
3. ✅ Tests complets Nexus
4. ✅ Migrer Memory
5. ✅ Tests complets Memory

### Court terme
1. ⏳ Vérifier status migration Helios
2. ⏳ Migrer Harmonia (avec dépendance Helios)
3. ⏳ Migrer Sentinel (avec dépendance Helios)
4. ⏳ Tests intégration complets

### Moyen terme
1. ⏳ Supprimer code legacy (modules/, system/)
2. ⏳ Documentation migration complète
3. ⏳ Mise à jour README Phase 2

---

**Status** : 🔄 EN COURS
**Phase** : Analyse complète ✅ → Migration Nexus (next)
**Date** : 22 novembre 2025
