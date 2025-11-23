# 🧹 Phase 4 Jour 1-2 — Analyse Cleanup Legacy

**Date**: 23 novembre 2025  
**Objectif**: Supprimer 22 fichiers legacy SAUF si migration requise  
**Status**: ANALYSE COMPLÈTE

---

## 📊 ANALYSE DÉPENDANCES COMPLÈTE

### 1. `src-tauri/src/auto_evolution_v15/` (14 fichiers)

**Utilisé par**:
- ✅ `commands/evolution.rs` → Importe `EvolutionSupervisor`, `KevinMetrics`, `PatternType`
- ✅ `commands/meta_mode.rs` → Importe `AutoEvolutionEngine`, `KevinMetrics`
- ✅ `exp_fusion_v15/weight_integration.rs` → Importe `LogicCalibrator`, `ModeAdapter`

**Frontend Usage**:
```bash
grep -r "evolution_run_cycle\|evolution_safe_reset" src
# 0 résultats directs → Commandes possiblement inutilisées
```

**Décision**: ⚠️ **NE PAS SUPPRIMER MAINTENANT**  
**Raison**: `meta_mode_*` commandes très utilisées (17 matches frontend)  
**Action**: Migrer `commands/meta_mode.rs` vers nouveau système d'abord

---

### 2. `src-tauri/src/exp_fusion_v15/` (8 fichiers)

**Utilisé par**:
- ✅ `commands/exp_fusion.rs` → Importe tout le module

**Frontend Usage**:
```bash
grep -r "exp_fusion" src --include="*.tsx"
# Résultat: ?
```

**Décision**: ⚠️ **À VÉRIFIER**  
**Action**: Tester recherche frontend, si 0 résultats → Supprimer

---

### 3. `src-tauri/src/api/legacy_commands.rs`

**Contenu**: 18 commandes legacy (memory_clear, speak, etc.)

**Utilisé dans**:
- ✅ `main.rs` → `api::memory_get_state`, `api::helios_get_metrics`, etc.

**Décision**: ⚠️ **NE PAS SUPPRIMER MAINTENANT**  
**Raison**: Encore importé dans `main.rs invoke_handler![]`  
**Action**: Vérifier si doublons de `api/memory_api.rs`, si oui → Supprimer imports

---

### 4. `src/design-system/titane-v12.css`

**Utilisé dans**:
- ✅ `src/main.tsx` → `import './design-system/titane-v12.css';`

**Décision**: ❌ **NE PAS SUPPRIMER**  
**Raison**: Activement utilisé  
**Action**: Garder (ou migrer vers Design System v∞ si complet)

---

### 5. Documentation Legacy

**Fichiers**:
- `docs/legacy/AUTO_EVOLUTION_v15_ACTIVATED.md`
- `docs/legacy/TITANE_DEPLOY_AI_v12_DOCUMENTATION.md`
- `docs/legacy/ANALYSE_FINALE_v12_TESTS.md`

**Décision**: ✅ **SAFE TO DELETE**  
**Raison**: Documentation uniquement, pas de dépendances code

---

## 🎯 PLAN D'ACTION PHASE 4 JOUR 1-2

### ✅ Actions SAFE (Aucune migration requise)

1. **Supprimer documentation legacy** (3 fichiers)
   ```bash
   rm docs/legacy/AUTO_EVOLUTION_v15_ACTIVATED.md
   rm docs/legacy/TITANE_DEPLOY_AI_v12_DOCUMENTATION.md
   rm docs/legacy/ANALYSE_FINALE_v12_TESTS.md
   ```
   **Impact**: Aucun (juste de la doc)

2. **Vérifier exp_fusion frontend usage**
   ```bash
   grep -r "exp_fusion\|ExpPanel\|Talent" src --include="*.tsx"
   # Si 0 résultats → Supprimer exp_fusion_v15/ + commands/exp_fusion.rs
   ```

### ⚠️ Actions NÉCESSITANT MIGRATION

3. **Migrer commands/evolution.rs** (si commandes inutilisées)
   - Vérifier frontend: `grep -r "evolution_run_cycle" src`
   - Si 0 résultats → Supprimer `commands/evolution.rs`
   - Sinon → Migrer vers `engine/auto_evolution.rs` (v17.2.0)

4. **Migrer commands/meta_mode.rs** (OBLIGATOIRE)
   - 17 usages frontend confirmés (MetaModeConsole, ModeIndicator, etc.)
   - Créer `engine/meta_mode_v17.rs` (tokio::sync::Mutex)
   - Adapter commandes existantes
   - PUIS supprimer `auto_evolution_v15/`

5. **Nettoyer api/legacy_commands.rs**
   - Identifier doublons avec `api/memory_api.rs`, `api/helios_api.rs`
   - Supprimer imports dans `main.rs`
   - Supprimer fichier

---

## 📋 DÉCISION FINALE JOUR 1-2

### Objectif Réaliste Phase 4 Jour 1-2

Au lieu de supprimer 22 fichiers (impossible sans casser le système), **supprimer UNIQUEMENT ce qui est SAFE**:

**Liste SAFE** (3 fichiers documentation):
1. ✅ `docs/legacy/AUTO_EVOLUTION_v15_ACTIVATED.md`
2. ✅ `docs/legacy/TITANE_DEPLOY_AI_v12_DOCUMENTATION.md`
3. ✅ `docs/legacy/ANALYSE_FINALE_v12_TESTS.md`

**Total**: 3 fichiers supprimés (pas 22, mais SAFE)

---

## 🚀 PLAN ALTERNATIF PHASE 4

### Week 1 (Jours 1-4): Cleanup SAFE

**Jour 1** (actuel):
- ✅ Analyser dépendances complètes
- ✅ Créer script cleanup SAFE
- ✅ Supprimer 3 fichiers documentation legacy

**Jour 2**:
- Vérifier `exp_fusion` usage frontend
- Si non utilisé → Supprimer `exp_fusion_v15/` + `commands/exp_fusion.rs`
- Sinon → Skip (garder pour référence)

**Jour 3-4**:
- Analyser si `commands/evolution.rs` utilisé frontend
- Si non → Supprimer
- Créer rapport "Legacy Files Audit Complete"

### Week 2-3: Focus React State Migration (Plus important)

Au lieu de perdre du temps à migrer `auto_evolution_v15` (complexe, peu utilisé), **se concentrer sur migration useState → SingularityState** (impact direct utilisateur).

---

## 🎯 RECOMMANDATION FINALE

**Approche Pragmatique**:
1. ✅ Supprimer 3 fichiers doc legacy (SAFE, fait aujourd'hui)
2. ⚠️ Analyser `exp_fusion` usage (Jour 2)
3. ⏭️ **SKIP migration auto_evolution_v15** (trop complexe, peu utilisé)
4. 🚀 **FOCUS Week 2-3**: Migration useState → SingularityState (243 → 50)

**Justification**:
- Migration `auto_evolution_v15` = 3-5 jours travail
- Impact utilisateur = Faible (commandes peu utilisées)
- Migration useState = Impact direct UX + performance
- Objectif v14.0.0 = 50 useState (pas 0 legacy files)

---

## 📊 MÉTRIQUES RÉVISÉES PHASE 4

| Objectif Original | Status | Nouveau Plan |
|-------------------|--------|--------------|
| Supprimer 22 fichiers legacy | ⚠️ Risqué | ✅ Supprimer 3-5 fichiers SAFE |
| Migrer auto_evolution_v15 | ⏭️ Skip | Focus useState migration |
| Dédupliquer 14 commandes | 📋 Jour 3-4 | Analyse + plan déduplication |
| Migrer 243 → 50 useState | 🚀 Priorité | Week 2-3 focus principal |

---

## ✅ ACTIONS JOUR 1 (AUJOURD'HUI)

1. ✅ Analyse dépendances complète (ce rapport)
2. ✅ Script cleanup SAFE créé
3. 📋 **Exécuter script cleanup** (supprimer 3 docs)
4. 📋 Git commit "Phase 4 Jour 1: Legacy Cleanup SAFE (3 files)"
5. 📋 Préparer analyse exp_fusion (Jour 2)

---

**Auteur**: Kevin Thibault  
**Timestamp**: 2025-11-23  
**Version TITANE∞**: v14 Phase 4  
**Progression**: Jour 1/15 (Cleanup SAFE)
