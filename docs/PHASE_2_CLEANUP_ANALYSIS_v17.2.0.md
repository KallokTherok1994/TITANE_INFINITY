# 🧹 PHASE 2 — ANALYSE CODE LEGACY

**Date** : 22 novembre 2025
**Status** : 📋 Analyse en cours

---

## 📂 FICHIERS LEGACY IDENTIFIÉS

### A. Répertoire `src-tauri/src/core/` (Anciennes implémentations)

**À CONSERVER** :
- ✅ `mod.rs` - Module exports (déjà mis à jour)
- ✅ `tests_integration.rs` - Tests intégration (utiles)

**À SUPPRIMER** (remplacés par `plugin_system/cores/`):
- ❌ `helios.rs` - Remplacé par `plugin_system/cores/helios.rs`
- ❌ `helios_module.rs` - Ancien wrapper CoreModule (API différente)
- ❌ `nexus.rs` - Remplacé par `plugin_system/cores/nexus.rs`
- ❌ `harmonia.rs` - Remplacé par `plugin_system/cores/harmonia.rs`
- ❌ `sentinel.rs` - Remplacé par `plugin_system/cores/sentinel.rs`
- ❌ `memory.rs` - Remplacé par `plugin_system/cores/memory.rs`

**Total** : 6 fichiers à supprimer

---

### B. Répertoire `src-tauri/src/modules/` (Modules legacy v12)

**À SUPPRIMER** (fonctionnalités dupliquées ou obsolètes):
- ❌ `helios.rs` - Ancien orchestrateur (remplacé par nouveau système)
- ❌ `nexus.rs` - Ancien nexus (remplacé par NexusModule)
- ❌ `harmonia.rs` - Ancien harmonia (remplacé par HarmoniaModule)
- ❌ `sentinel.rs` - Ancien sentinel (remplacé par SentinelModule)
- ❌ `adaptive.rs` - Adaptative engine (fonctionnalité à intégrer ailleurs)
- ❌ `selfheal.rs` - Self-healing (fonctionnalité intégrée dans Sentinel)

**À ÉVALUER** :
- ⚠️ `mod.rs` - Mise à jour nécessaire après suppressions

**Total** : 6 fichiers à supprimer, 1 à mettre à jour

---

### C. Répertoire `src-tauri/src/system/` (100+ sous-dossiers)

**CATÉGORIES IDENTIFIÉES** :

#### 1. Modules expérimentaux (versions _v2, _v14, _v15)
- 🔬 `memory_v2/`
- 🔬 `resonance_v2/`
- 🔬 `self_healing_v2/`
- 🔬 Nombreux modules avec suffixes de version

**Action** : ⏳ Audit complet nécessaire (Phase 3)

#### 2. Modules architecture ancienne
- 📦 `ans/` - Autonomic Nervous System (legacy)
- 📦 `cortex/` - Ancien cortex
- 📦 `helios/` - Ancien helios system
- 📦 `harmonia/` - Ancien harmonia system
- 📦 `nexus/` - Ancien nexus system
- 📦 `sentinel/` - Ancien sentinel system
- 📦 `memory/` - Ancien memory system

**Action** : ⏳ Vérifier dépendances avant suppression

#### 3. Modules spécialisés (à évaluer individuellement)
- 🎯 `lowflow/` - Low-level flow management
- 🎯 `swarm/` - Swarm intelligence
- 🎯 `persona_engine/` - Persona management
- 🎯 `multi_ia_bridge/` - Multi-IA coordination
- 🎯 100+ autres modules spécialisés

**Action** : ⏳ Inventaire détaillé requis (Phase 3)

---

## 🎯 STRATÉGIE DE NETTOYAGE

### Phase 2a - Nettoyage Immédiat (SAFE)
**Cible** : Fichiers clairement remplacés et sans dépendances externes

1. ✅ Supprimer `src-tauri/src/core/` legacy (6 fichiers)
2. ✅ Supprimer `src-tauri/src/modules/` legacy (6 fichiers)
3. ✅ Mettre à jour `mod.rs` correspondants
4. ✅ Vérifier compilation

**Risque** : 🟢 FAIBLE (fichiers isolés, déjà remplacés)

---

### Phase 2b - Audit System (PRUDENT)
**Cible** : Répertoire `src-tauri/src/system/`

**Approche recommandée** :
1. 📊 Scanner toutes les dépendances (`grep -r "use crate::system"`)
2. 📊 Identifier modules actifs vs obsolètes
3. 📊 Créer matrice dépendances
4. 🔍 Marquer pour suppression vs conservation
5. ⏳ Décision par catégorie (experimental, legacy, active)

**Risque** : 🟡 MOYEN (100+ dossiers, dépendances complexes)

---

### Phase 3 - Cleanup Progressif
**Cible** : Modules système par catégorie

**Priorités** :
1. 🗑️ Modules expérimentaux non utilisés
2. 🗑️ Duplications architecture ancienne
3. 🔄 Consolidation modules actifs
4. 📚 Documentation modules conservés

**Risque** : 🟡 MOYEN-ÉLEVÉ (impact potentiel sur fonctionnalités)

---

## 📋 PLAN D'ACTION IMMÉDIAT

### Étape 1 : Backup
```bash
# Créer branche backup avant suppressions
git checkout -b backup-before-cleanup-phase2
git add .
git commit -m "Backup avant nettoyage Phase 2"
git checkout main
```

### Étape 2 : Suppression Core Legacy
```bash
# Supprimer anciens cores
rm src-tauri/src/core/helios.rs
rm src-tauri/src/core/helios_module.rs
rm src-tauri/src/core/nexus.rs
rm src-tauri/src/core/harmonia.rs
rm src-tauri/src/core/sentinel.rs
rm src-tauri/src/core/memory.rs
```

### Étape 3 : Suppression Modules Legacy
```bash
# Supprimer anciens modules
rm src-tauri/src/modules/helios.rs
rm src-tauri/src/modules/nexus.rs
rm src-tauri/src/modules/harmonia.rs
rm src-tauri/src/modules/sentinel.rs
rm src-tauri/src/modules/adaptive.rs
rm src-tauri/src/modules/selfheal.rs
```

### Étape 4 : Mise à jour mod.rs

**Fichier** : `src-tauri/src/core/mod.rs`
```rust
// Supprimer les exports legacy
// Garder uniquement tests_integration
#[cfg(test)]
mod tests_integration;
```

**Fichier** : `src-tauri/src/modules/mod.rs`
```rust
// Supprimer tous les modules obsolètes
// Fichier peut être vide ou supprimé si pas d'autres modules
```

### Étape 5 : Vérification
```bash
# Tester compilation
cargo check

# Si erreurs, identifier dépendances restantes
grep -r "use crate::core::" src-tauri/src/
grep -r "use crate::modules::" src-tauri/src/
```

---

## ⚠️ PRÉCAUTIONS

### Avant Suppression
- ✅ Vérifier aucune référence dans `src-tauri/src/api/`
- ✅ Vérifier aucune référence dans `src-tauri/src/commands/`
- ✅ Vérifier aucune référence dans `src-tauri/src/lib.rs` ou `main.rs`
- ✅ Scanner imports : `grep -r "HeliosCore\|NexusCore\|HarmoniaCore\|SentinelCore\|MemoryCore"`

### Validation Post-Suppression
- ✅ `cargo check` sans erreurs
- ✅ `cargo test` (tests compatibles)
- ✅ Vérifier API Tauri fonctionne
- ✅ Commit changements

---

## 📊 MÉTRIQUES NETTOYAGE

### Phase 2a (Immédiat)
- **Fichiers supprimés** : 12 (6 core + 6 modules)
- **Lignes code supprimées** : ~2000 lignes (estimation)
- **Réduction complexité** : Élimination duplication
- **Gain clarté** : Architecture unifiée

### Impact
- 🟢 **Maintenabilité** : +++ (une seule source de vérité)
- 🟢 **Clarté** : +++ (plus de confusion ancien/nouveau)
- 🟢 **Performance compilation** : + (moins de fichiers)
- 🟡 **Risque** : Faible (fichiers isolés)

---

## ⚠️ DÉPENDANCES DÉCOUVERTES

### Scan de code effectué

**Fichiers utilisant les anciens cores** :

1. **`src-tauri/src/api/system_api.rs`** (160 lignes)
   - ✗ Importe : `HeliosCore, NexusCore, HarmoniaCore, SentinelCore, MemoryCore`
   - ✗ Utilise dans commands Tauri (tauri::State)
   - ✗ Méthodes appelées : `.collect()`, `.validate()`, `.balance()`, `.scan()`

2. **`src-tauri/src/app/setup.rs`** (119 lignes)
   - ✗ Importe : Tous les anciens cores + `HeliosCoreModule`
   - ✗ Initialise : `TitaneApp` struct avec champs legacy
   - ✗ Crée instances : `HeliosCore::new()`, etc.

3. **`src-tauri/src/commands/core_system.rs`**
   - ✗ Importe : `HeliosCoreModule`
   - ✗ Utilise downcast vers `HeliosCoreModule`

4. **`src-tauri/src/core/tests_integration.rs`**
   - ✗ Tests sur `HeliosCoreModule`

---

## 🚨 DÉCISION CRITIQUE

**❌ SUPPRESSION IMPOSSIBLE MAINTENANT**

**Raison** : Les anciens cores sont **activement utilisés** dans l'API Tauri et le système d'initialisation.

**Prochaine étape** : **Phase 2b** - Migration des API

---

## 🎯 DÉCISION RECOMMANDÉE

**Action immédiate** : ❌ **NE PAS** procéder Phase 2a (dépendances détectées)
**Action requise** : 🔄 **DÉMARRER** Phase 2b (migration API obligatoire)
**Action différée** : ⏳ Planifier audit system/ en Phase 3

**Raison** :
- ✗ Anciens cores utilisés dans API Tauri (`system_api.rs`)
- ✗ Anciens cores utilisés dans Setup (`setup.rs`)
- ✗ Suppression causerait erreurs de compilation
- ✅ Nouveaux cores prêts mais pas encore intégrés à l'app Tauri
- ✅ Migration API nécessaire avant cleanup

---

**Auteur** : Kevin Thibault (TITANE∞ v17.2.0)
**Date** : 22 novembre 2025
**Status** : Phase 2a bloquée — Phase 2b requise
