# 🗺️ TITANE∞ — Carte des Risques Documentation (DOCS_RISK_MAP.md)

**Date:** 15 décembre 2025  
**Baseline:** 1738 fichiers .md  
**Objectif:** Identifier actions SAFE vs RISQUÉES  

---

## 🎯 PRINCIPE DIRECTEUR

**ZÉRO SUPPRESSION par défaut.**  
Toute action doit être **réversible**, **traçable** et **justifiée**.

---

## 🟢 ACTIONS SAFE (Risque Minimal)

### 1. Déplacements SANS modification de contenu

| Action | Nombre | Risque | Validation |
|--------|--------|--------|------------|
| Déplacer audits v19-v23 → `docs/99_ARCHIVE/versions/` | 60 fichiers | 🟢 SAFE | Git revert possible |
| Déplacer sessions 2025-12 → `docs/99_ARCHIVE/sessions/2025-12/` | 80 fichiers | 🟢 SAFE | Git revert possible |
| Créer `docs/00_core/` | 0 fichiers | 🟢 SAFE | Dossier nouveau |
| Créer `docs/01_architecture/` | 0 fichiers | 🟢 SAFE | Dossier nouveau |
| Créer `docs/04_guides/` | 0 fichiers | 🟢 SAFE | Dossier nouveau |

**Garantie** : `git mv fichier.md destination/fichier.md` → contenu INTACT.

---

### 2. Création de nouveaux fichiers (documentation réalité)

| Fichier | Source | Risque | Validation |
|---------|--------|--------|------------|
| `docs/01_architecture/ARCHITECTURE_CURRENT_v24.md` | Code réel (main.rs) | 🟢 SAFE | Nouveau fichier |
| `docs/01_architecture/DATA_FLOW_CHAT.md` | Analyse tauriBridge.ts | 🟢 SAFE | Nouveau fichier |
| `docs/00_core/GLOSSARY.md` | Termes code réels | 🟢 SAFE | Nouveau fichier |
| `docs/01_architecture/OMEGA_PIPELINE_DETAILED.md` | src-tauri/src/omega/ | 🟢 SAFE | Nouveau fichier |
| `docs/06_api/TAURI_COMMANDS_REFERENCE.md` | main.rs L538-700 | 🟢 SAFE | Nouveau fichier |

**Garantie** : Pas de modification fichiers existants.

---

### 3. Mise à jour liens internes (après déplacements)

| Fichier | Action | Risque | Validation |
|---------|--------|--------|------------|
| README.md | Mettre à jour liens → docs/ | 🟢 SAFE | Git diff visible |
| DEVELOPER_GUIDE.md | Mettre à jour liens archives | 🟢 SAFE | Git diff visible |
| docs/00_SYSTEME/TITANE_INDEX_MASTER.md | Enrichir index | 🟢 SAFE | Git diff visible |

**Garantie** : Modifications mineures, traçables git.

---

### 4. Génération fichiers index

| Fichier | Contenu | Risque | Validation |
|---------|---------|--------|------------|
| `docs/99_ARCHIVE/versions/INDEX.md` | Liste versions archivées | 🟢 SAFE | Nouveau fichier |
| `docs/99_ARCHIVE/sessions/INDEX.md` | Liste sessions 2025 | 🟢 SAFE | Nouveau fichier |
| `docs/04_guides/INDEX.md` | Index guides consolidés | 🟢 SAFE | Nouveau fichier |

**Garantie** : Nouveaux fichiers, pas de modifications.

---

## 🟡 ACTIONS MODÉRÉES (Validation Recommandée)

### 1. Consolidation guides (fusion fichiers redondants)

| Fichiers sources | Fichier cible | Risque | Validation requise |
|------------------|---------------|--------|-------------------|
| QUICK_START_v∞.3.md + QUICKSTART_UBUNTU_24.04.md | `docs/04_guides/quickstart/QUICKSTART.md` | 🟡 MODÉRÉ | Comparer contenu AVANT fusion |
| 5 fichiers GUIDE_*.md | `docs/04_guides/development/` | 🟡 MODÉRÉ | Vérifier redondance réelle |
| 3 fichiers MULTIMODAL_*.md | `docs/04_guides/features/MULTIMODAL.md` | 🟡 MODÉRÉ | Vérifier versions différentes |

**Procédure sécurisée** :
1. Analyser contenu chaque fichier
2. Créer fichier unifié NOUVEAU
3. Marquer sources comme "merged" (pas de suppression)
4. Commit dédié : `docs: consolidate X guides into Y`

---

### 2. Renommage fichiers (cohérence naming)

| Fichier actuel | Nom proposé | Risque | Validation |
|----------------|-------------|--------|------------|
| `ARCHITECTURE.md` (racine) | Conserver OU → `docs/01_architecture/OVERVIEW.md` | 🟡 MODÉRÉ | Vérifier liens entrants |
| `DEVELOPER_GUIDE.md` (racine) | Conserver (CORE) | 🟢 SAFE | N/A |
| `FINAL_ARCHITECTURE_v17.2.0.md` | → `docs/99_ARCHIVE/versions/v17/ARCHITECTURE_FINAL.md` | 🟡 MODÉRÉ | Vérifier usage actuel |

**Validation requise** : Scanner tous .md pour liens internes avant renommage.

---

### 3. Mise à jour contenus (alignement code actuel)

| Fichier | Modification | Risque | Validation |
|---------|--------------|--------|------------|
| README.md | Mettre à jour "9 Moteurs" avec liste réelle | 🟡 MODÉRÉ | Comparer avec main.rs |
| docs/TITANE_OS/TITANE_OMEGA_PIPELINE.md | Vérifier 10 étapes vs code | 🟡 MODÉRÉ | Comparer avec omega/pipeline.rs |
| ARCHITECTURE.md | Ajouter section Dual Runtime | 🟡 MODÉRÉ | Comparer avec README |

**Procédure** :
1. Identifier écart code ↔ docs
2. Proposer modification précise (oldString → newString)
3. Commit atomique : `docs(X): align with code v24.2.0`

---

## 🔴 ACTIONS RISQUÉES (NE PAS FAIRE SANS ADR)

### 1. Suppression fichiers "redondants"

| Fichier | Raison suppression proposée | Risque | Blocage |
|---------|----------------------------|--------|---------|
| Audits v14-v17 | "Obsolètes" | 🔴 CRITIQUE | **Contiennent décisions architecturales** |
| Rapports sessions 2025-11 | "Anciens" | 🔴 CRITIQUE | **Traçabilité évolution** |
| SUPER_PROMPT_*.md (17 fichiers) | "Specs non implémentées" | 🔴 CRITIQUE | **Certains implémentés** |

**INTERDICTION** : Suppression AVANT audit exhaustif contenu.

**Alternative SAFE** :
- Déplacer → `docs/99_ARCHIVE/`
- Marquer `[OBSOLETE]` dans nom fichier
- Garder traçabilité git

---

### 2. Refactoring conceptuel (renommage termes)

| Terme actuel | Terme proposé | Risque | Blocage |
|--------------|---------------|--------|---------|
| "OMEGA Pipeline" | "Cognitive Pipeline" | 🔴 CRITIQUE | **Terme ancré dans code** |
| "Singularity State" | "Unified State" | 🔴 CRITIQUE | **Modules Rust nommés singularity_state/** |
| "Titan-Dev" | "Dev Runtime" | 🔴 CRITIQUE | **Scripts + tasks.json utilisent "Titan-Dev"** |

**INTERDICTION** : Renommage conceptuel SANS ADR + migration code.

**Alternative** : Documenter alias dans GLOSSARY.md.

---

### 3. Réorganisation structure code (hors scope docs)

| Action | Risque | Blocage |
|--------|--------|---------|
| Déplacer `src/engines/` → `src/core/engines/` | 🔴 CRITIQUE | **Rupture imports** |
| Renommer `src-tauri/src/omega/` → `cognitive/` | 🔴 CRITIQUE | **Modules Rust** |
| Fusionner `overdrive/` dans `conversation_engine/` | 🔴 CRITIQUE | **Architecture backend** |

**INTERDICTION ABSOLUE** : Mission = docs UNIQUEMENT. Code intouché.

---

### 4. Modification fichiers d'instructions IA sans validation

| Fichier | Risque modification | Conséquence |
|---------|---------------------|-------------|
| `.copilot-rules-permanent.md` | 🔴 CRITIQUE | Altération comportement IA |
| `.github/instructions/titane.instructions.md` | 🔴 CRITIQUE | Rupture workflow agents |
| `docs/03_copilot/*.md` | 🟡 MODÉRÉ | Confusion Copilot temporaire |

**Procédure OBLIGATOIRE** :
1. Analyser règles existantes
2. Détecter contradictions
3. Proposer consolidation (SANS suppression)
4. Valider avec utilisateur AVANT commit

---

## ⚫ ACTIONS INTERDITES

### 1. Suppression sans backup

❌ **INTERDIT** : `rm fichier.md` sans `git mv → 99_ARCHIVE/`

**Raison** : Perte irréversible décisions historiques.

---

### 2. Modification en masse sans review

❌ **INTERDIT** : Script automatique modifiant 100+ fichiers simultanément.

**Raison** : Impossible de valider cohérence.

**Alternative** : Batch de 10-20 fichiers max par commit.

---

### 3. Changement de versions dans README/Cargo.toml

❌ **INTERDIT** : Modifier `"version": "24.2.0"` → `"25.0.0"` dans mission docs.

**Raison** : Hors scope (gestion versions = processus séparé).

---

### 4. Modification code applicatif

❌ **INTERDIT** : Tout changement dans `src/`, `src-tauri/src/` (sauf commentaires docs).

**Raison** : Mission = documentation UNIQUEMENT.

---

## 📊 MATRICE DE RISQUES

| Action | Fichiers | Risque | Réversibilité | Validation |
|--------|----------|--------|---------------|------------|
| **Déplacement (git mv)** | 1500 | 🟢 SAFE | ✅ 100% | Git revert |
| **Création nouveau fichier** | 10 | 🟢 SAFE | ✅ 100% | Git rm |
| **Mise à jour liens** | 20 | 🟢 SAFE | ✅ 100% | Git revert |
| **Consolidation guides** | 10 | 🟡 MODÉRÉ | ✅ 80% | Comparer contenu |
| **Renommage fichier** | 5 | 🟡 MODÉRÉ | ✅ 90% | Scanner liens |
| **Mise à jour contenu** | 10 | 🟡 MODÉRÉ | ✅ 100% | Git diff |
| **Suppression fichier** | 0 | 🔴 INTERDIT | ❌ Partiel | ADR requis |
| **Refactoring conceptuel** | 0 | 🔴 INTERDIT | ❌ Complexe | ADR + migration code |
| **Modif instructions IA** | 3 | 🔴 CRITIQUE | ✅ 50% | Validation utilisateur |
| **Modif code applicatif** | 0 | ⚫ INTERDIT | N/A | Hors scope |

---

## 🛡️ PROTOCOLE DE SÉCURITÉ

### Avant TOUTE action

1. ✅ **Checkpoint git** : Branche dédiée + commit initial
2. ✅ **Backup préventif** : `cp fichier.md fichier.md.backup`
3. ✅ **Validation scope** : Est-ce dans mission "docs evolution"?

### Pendant l'action

4. ✅ **Commits atomiques** : 1 action = 1 commit
5. ✅ **Messages explicites** : `docs(type): action précise`
6. ✅ **Logs détaillés** : Documenter chaque décision

### Après l'action

7. ✅ **Validation liens** : Scanner liens morts
8. ✅ **Test compilation** : `pnpm run build` + `cargo check`
9. ✅ **Review finale** : `git diff MAIN...chore/docs-evolution-phase0`

---

## 📋 CHECKLIST PRÉ-COMMIT

```markdown
Phase 3 — Réorganisation SAFE
- [ ] Checkpoint git créé
- [ ] Aucune suppression effectuée
- [ ] Tous déplacements via `git mv` (contenu intact)
- [ ] Nouveaux fichiers = documentation réalité code
- [ ] Liens internes mis à jour (si déplacements)
- [ ] Commits atomiques (<20 fichiers)
- [ ] Messages commits explicites
- [ ] `pnpm run build` ✅
- [ ] `cargo check` ✅
- [ ] Aucune modification code applicatif
- [ ] Aucune modification versions (package.json, Cargo.toml)
```

---

## 🎯 PROCHAINES ÉTAPES VALIDÉES

### Phase 2 — Documentation Réalité (100% SAFE)

1. ✅ Analyser `src-tauri/src/main.rs` (60+ commandes)
2. ✅ Reconstituer flux Chat (tauriBridge.ts → chat_orchestrator)
3. ✅ Documenter Pipeline OMEGA (omega/pipeline.rs)
4. ✅ Générer GLOSSARY.md (termes code réels)
5. ✅ Créer ARCHITECTURE_CURRENT_v24.md

**Risque** : 🟢 SAFE (création nouveaux fichiers uniquement).

---

### Phase 3 — Réorganisation (90% SAFE)

1. ✅ Déplacer audits → `docs/99_ARCHIVE/versions/`
2. ✅ Déplacer sessions → `docs/99_ARCHIVE/sessions/`
3. ✅ Créer structure `docs/00_core/`, `01_architecture/`, `04_guides/`
4. 🟡 Consolider guides redondants (validation contenu)
5. ✅ Mettre à jour liens internes (README, INDEX)

**Risque** : 🟢 SAFE (git mv) + 🟡 MODÉRÉ (consolidation).

---

### Phase 4 — Instructions IA (80% SAFE)

1. ✅ Inventorier fichiers instructions existants
2. 🔴 Détecter contradictions (validation utilisateur)
3. ✅ Créer `COPILOT_MASTER.md` (nouveau fichier)
4. 🟡 Marquer autres fichiers comme "SUPPORT" (pas suppression)

**Risque** : 🟢 SAFE (création) + 🟡 MODÉRÉ (consolidation).

---

## ✅ VALIDATION FINALE

**Fichiers générés** : 3/3 ✅  
**Actions autorisées** : Déplacements (git mv) + Création nouveaux fichiers  
**Actions interdites** : Suppression + Refactoring conceptuel + Modif code  
**Prochaine étape** : **PHASE 2 — Analyse Code → Documentation Réalité**

---

## 📚 DOCUMENTS PHASE 1

- [📊 PRE_UPDATE_ANALYSIS.md](./PRE_UPDATE_ANALYSIS.md) — Analyse baseline (1738 .md, conflits, vérité code)
- [📂 DOCS_INVENTORY.md](./DOCS_INVENTORY.md) — Inventaire exhaustif (CORE/SUPPORT/MÉMOIRE/ARCHIVE)
- [🗺️ DOCS_RISK_MAP.md](./DOCS_RISK_MAP.md) — Ce document (matrice risques + protocole sécurité)

---

*TITANE∞ Documentation Evolution Engine vΩ — 15 décembre 2025*
