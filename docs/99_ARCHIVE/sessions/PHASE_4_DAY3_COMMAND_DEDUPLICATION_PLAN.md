# 🔗 PHASE 4 JOURS 3-4 — COMMAND DEDUPLICATION PLAN

**Date**: 23 novembre 2025
**Phase**: Phase 4 v14.0.0 (Jours 3-4/15)
**Objectif**: Déduplication 14 commandes Tauri + Cleanup legacy_commands.rs

---

## 📊 CONTEXTE

**Base de travail**: COMMAND_MAPPING_v14.md (303 lignes)
- **Commandes Rust totales**: 219 (avec doublons)
- **Doublons identifiés**: 14 commandes
- **Commandes uniques estimées**: ~170
- **Fichier problématique**: `src/api/legacy_commands.rs` (source de la majorité des doublons)

**Résumé Erreur #2**:
Désynchronisation Rust ↔ TypeScript causée par:
1. Commandes définies 2-3x (legacy vs nouveau)
2. Invokes TS pointant vers commandes non enregistrées
3. Commandes Rust définies mais absentes de main.rs

---

## ⚠️ DOUBLONS CRITIQUES (14 COMMANDES)

### 3x Duplications
```rust
memory_clear              // api/legacy_commands.rs + commands/ai_chat.rs + ???
```

### 2x Duplications
```rust
// Audio/Voice (4 commandes)
start_recording           // api/legacy_commands.rs + commands/ai_chat.rs
stop_recording            // api/legacy_commands.rs + commands/ai_chat.rs
speak                     // api/legacy_commands.rs + commands/ai_chat.rs

// Memory (4 commandes)
delete_conversation       // api/legacy_commands.rs + commands/ai_chat.rs
clear_all_memory          // api/legacy_commands.rs + commands/ai_chat.rs
memory_save_entry         // api/legacy_commands.rs + ???
memory_get_state          // api/legacy_commands.rs + api/memory_api.rs

// System Monitoring (4 commandes)
get_system_status         // api/legacy_commands.rs + ???
helios_get_metrics        // api/legacy_commands.rs + ???
harmonia_get_flows        // api/legacy_commands.rs + ???
nexus_get_graph           // api/legacy_commands.rs + ???

// Meta Mode (1 commande)
meta_mode_reset           // api/legacy_commands.rs + ???

// Auto-Heal (3 commandes NON dans main.rs)
auto_heal_scan            // auto_heal.rs (orpheline)
auto_heal_repair          // auto_heal.rs (orpheline)
auto_heal_get_logs        // auto_heal.rs (orpheline)
```

---

## 🎯 PLAN D'ACTION (2 JOURS)

### Jour 3: Analyse + Décisions (3-4 heures)

#### Step 1: Audit Usage Frontend (1 heure)
**Objectif**: Déterminer quelles commandes legacy sont encore utilisées

```bash
# Pour chaque commande doublon, vérifier usage TypeScript
grep -r "invoke('memory_clear')" src --include="*.ts" --include="*.tsx"
grep -r "invoke('delete_conversation')" src --include="*.ts" --include="*.tsx"
grep -r "invoke('speak')" src --include="*.ts" --include="*.tsx"
grep -r "invoke('get_system_status')" src --include="*.ts" --include="*.tsx"
# ... etc pour les 14 commandes
```

**Output attendu**: Matrice usage
```markdown
| Command                | Frontend Usage | Backend Location | Decision |
|------------------------|----------------|------------------|----------|
| memory_clear           | ✅ 3 files     | legacy + ai_chat | KEEP legacy, remove ai_chat |
| delete_conversation    | ✅ 2 files     | legacy + ai_chat | KEEP legacy, remove ai_chat |
| start_recording        | ❌ 0 files     | legacy + ai_chat | REMOVE both (unused) |
| get_system_status      | ❌ 0 files     | legacy           | REMOVE (replaced by get_system_health) |
...
```

#### Step 2: Décision Matrix (1 heure)
Pour chaque doublon, appliquer règle de décision:

1. **Si utilisé frontend**:
   - Garder version **NOUVELLE** (api/memory_api.rs, api/helios_api.rs, etc.)
   - Supprimer version **LEGACY** (api/legacy_commands.rs)
   - Migrer invokes TS si nécessaire

2. **Si NON utilisé frontend**:
   - Supprimer TOUTES versions
   - Nettoyer main.rs invoke_handler
   - Vérifier aucune dépendance interne Rust

3. **Si command remplacée par équivalent**:
   - Exemple: `get_system_status` → remplacé par `get_system_health`
   - Supprimer ancienne commande
   - Vérifier aucun invoke TS orphelin

**Output**: `DEDUPLICATION_DECISIONS_v14.md` (décisions pour les 14 commandes)

#### Step 3: Créer Migration Script (1-2 heures)
```bash
# dedupe_commands.sh
# Backup + suppression automatique des doublons décidés
# Vérification cargo check après chaque suppression
```

**Contenu script**:
```bash
#!/bin/bash
# 1. Backup legacy_commands.rs
# 2. Commenter les commandes à supprimer (test compilation)
# 3. Si cargo check OK → supprimer définitivement
# 4. Si cargo check FAIL → rollback + analyser dépendances
# 5. Mettre à jour main.rs invoke_handler (remove deleted commands)
```

---

### Jour 4: Exécution + Validation (3-4 heures)

#### Step 4: Suppression Doublons Backend (2 heures)

**4.1 Backup legacy_commands.rs**:
```bash
cp src/api/legacy_commands.rs src/api/legacy_commands.rs.backup_20251123
```

**4.2 Supprimer doublons selon matrice**:
Exemple pour `memory_clear`:
```bash
# Si décision: KEEP ai_chat version, remove legacy
# Éditer api/legacy_commands.rs → supprimer fn memory_clear
# Éditer main.rs → garder commands::ai_chat::memory_clear
# Cargo check
```

**4.3 Nettoyer main.rs invoke_handler**:
```rust
// AVANT (146 lignes, doublons)
.invoke_handler(tauri::generate_handler![
    api::legacy_commands::memory_clear,
    commands::ai_chat::memory_clear,     // Doublon!
    api::legacy_commands::speak,
    commands::ai_chat::speak,            // Doublon!
    // ... 60+ autres
])

// APRÈS (60-80 lignes, unique)
.invoke_handler(tauri::generate_handler![
    commands::ai_chat::memory_clear,     // Version unique gardée
    commands::ai_chat::speak,            // Version unique gardée
    api::memory_api::get_memory_state,   // v17.3.0
    api::helios_api::get_helios_state,   // v17.3.0
    // ... commandes core uniquement
])
```

**4.4 Supprimer legacy_commands.rs (si vide)**:
```bash
# Si TOUTES commandes legacy migrées/supprimées:
rm src/api/legacy_commands.rs

# Supprimer du main.rs:
mod api {
    // pub mod legacy_commands;  // ❌ SUPPRIMER cette ligne
    pub mod memory_api;
    pub mod helios_api;
    ...
}
```

#### Step 5: Vérification TypeScript (1 heure)

**5.1 Audit invokes orphelins**:
```bash
# Trouver tous les invoke() dans frontend
grep -r "invoke\('" src --include="*.ts" --include="*.tsx" -h \
  | sed "s/.*invoke('\([^']*\)'.*/\1/" \
  | sort -u \
  > frontend_invokes.txt

# Comparer avec commandes enregistrées main.rs
# Identifier invokes qui pointent vers commandes supprimées
```

**5.2 Migrer invokes si nécessaire**:
```typescript
// Si commande renommée/remplacée
// AVANT:
await invoke('get_system_status');

// APRÈS:
await invoke('get_system_health');
```

**5.3 Type-check frontend**:
```bash
pnpm type-check
# Vérifier 0 erreurs TypeScript
```

#### Step 6: Compilation + Tests (1 heure)

**6.1 Cargo check**:
```bash
cd src-tauri
cargo check --lib
# ⚠️ NOTE: WebKit GTK 4.1 manquant (Flatpak env)
# Vérifier uniquement erreurs Rust code (pas sys dependencies)
```

**6.2 Vérifier warnings compilation**:
```bash
cargo clippy -- -W clippy::pedantic
# Target: 0 warnings sur commandes modifiées
```

**6.3 Tests unitaires Rust**:
```bash
cargo test --lib
# Vérifier tests passent (80+ tests)
```

**6.4 Build frontend**:
```bash
cd ..
pnpm build
# Vérifier build OK (383 KB bundle)
```

---

## 📋 OUTPUT ATTENDU (Jour 4 EOD)

### Fichiers Créés/Modifiés

**1. DEDUPLICATION_DECISIONS_v14.md** (NEW - Jour 3):
```markdown
# Command Deduplication Decisions

| Command | Frontend Usage | Decision | Action |
|---------|----------------|----------|--------|
| memory_clear | ✅ 3 usages | KEEP ai_chat | Remove legacy version |
| start_recording | ❌ 0 usages | REMOVE both | Delete + clean main.rs |
...
```

**2. dedupe_commands.sh** (NEW - Jour 3):
- Script automatisation backup + suppression
- Vérification cargo check après chaque op
- Rollback si erreur

**3. src/api/legacy_commands.rs** (MODIFIED ou DELETED):
- Si migrations complètes → SUPPRIMER fichier entier
- Sinon → Vider de tous les doublons

**4. src-tauri/src/main.rs** (MODIFIED):
- invoke_handler: 146 lignes → 60-80 lignes
- 0 doublons
- Alphabétique + groupé par module

**5. Frontend files** (MODIFIED si nécessaire):
- Mise à jour invokes si commandes renommées
- Exemple: hooks/useMemoryCore.ts, services/api/index.ts

**6. PHASE_4_DAY4_DEDUPLICATION_COMPLETE.md** (NEW - Jour 4):
```markdown
# Deduplication Complete Report

## Summary
- 14 doublons éliminés
- 146 → 70 commandes enregistrées main.rs
- 0 invokes TypeScript orphelins
- cargo check: OK (modulo WebKit deps)
- pnpm build: OK (383 KB)

## Changes
- Deleted: api/legacy_commands.rs (150+ lignes)
- Modified: main.rs (-76 lignes)
- Modified: 5 frontend files (invoke updates)

## Metrics
- Backend commands: 219 → 170 (49 deleted)
- Duplicates: 14 → 0
- Frontend invokes verified: 50/50
```

---

## 🔧 CRITÈRES DE SUCCÈS

- ✅ 0 doublons dans backend Rust (verified by script)
- ✅ api/legacy_commands.rs supprimé OU vidé de doublons
- ✅ main.rs invoke_handler: 60-80 commandes (unique, alphabétique)
- ✅ 100% invokes TS ont backend Rust (verified by grep audit)
- ✅ cargo check: 0 erreurs code Rust (ignorer WebKit deps si Flatpak)
- ✅ pnpm build: OK (bundle < 400 KB)
- ✅ pnpm type-check: 0 erreurs TypeScript

---

## 📌 PROCHAINES ÉTAPES (Après Jour 4)

**Phase 4 Week 2 (Jours 5-10)**: useState Migration (PRIORITÉ)
- Créer useSingularityStore() hook
- Migrer top 10 composants (243 → 50 useState)
- Performance profiling
- Documentation migration pattern

**Phase 4 Week 3 (Jours 11-15)**: Final Validation
- E2E tests Playwright
- Lighthouse audit > 95
- Bundle size < 150 KB gzip
- Release v14.0.0

---

## ⚠️ LIMITATIONS CONNUES

**Environnement Flatpak SDK**:
- ❌ WebKit GTK 4.1 non disponible (cargo check partiel)
- ❌ Tauri dev mode non fonctionnel (compilation fail)
- ✅ Frontend Vite build OK (383 KB)
- ✅ Rust code verification OK (cargo check --lib modulo sys deps)

**Workaround**: Vérifier code Rust via:
- `cargo check --lib` (erreurs code uniquement)
- `cargo clippy` (linting)
- `cargo test --lib` (tests unitaires)
- Ignorer erreurs `javascriptcore-rs-sys` (système, pas code)

---

**Status**: 📋 READY TO EXECUTE
**Prochaine action**: Jour 3 Step 1 - Audit Usage Frontend (grep search 14 commandes)
