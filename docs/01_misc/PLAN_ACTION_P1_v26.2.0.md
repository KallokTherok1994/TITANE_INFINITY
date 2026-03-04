# 📋 PLAN D'ACTION P1 — TITANE∞ v26.2.0

**Date:** 2025-12-23  
**Statut:** En cours d'exécution  
**Priorité:** P1 (Important - 1 sprint)

---

## 🎯 OBJECTIF GLOBAL

Adresser les 3 items P1 identifiés dans l'audit de déploiement pour améliorer la qualité et la testabilité de TITANE∞.

---

## ✅ P1.1: Investiguer et Corriger 49 Tests Skipped

### Statut: ✅ **EN COURS — Partiellement Résolu**

**Effort:** 4-8 heures  
**Progression:** 50% complété

#### Actions Réalisées ✅

1. **Analyse Complète** (2 heures)
   - ✅ Identification de toutes les occurrences de tests skipped
   - ✅ Catégorisation en 5 groupes distincts
   - ✅ Documentation complète dans `P1_ANALYSE_TESTS_SKIPPED.md`

2. **Corrections Web Vitals** (1 heure)
   - ✅ Corrigé `it.skip` → `it` pour test "send analytics report every 30 seconds"
   - ✅ Corrigé `it.skip` → `it` pour test "initialize monitor on mount"
   - ✅ Corrigé `it.skip` → `it` pour test "update metrics over time"
   - ✅ Ajouté gestion appropriée des timers (fake/real selon contexte)
   - ✅ Ajouté timeouts explicites pour tests async

**Fichiers Modifiés:**

- `src/utils/__tests__/webVitals.test.ts` — 3 tests réactivés

#### Résultats Attendus

**Avant:**

```
Tests: 2170 passed, 49 skipped (2219 total)
Taux: 97.8%
```

**Après:**

```
Tests: 2173 passed, 46 skipped (2219 total)
Taux: 97.93%
```

**Réduction:** -3 tests skipped (-6%)

#### Prochaines Étapes 📋

**P1.1.2: Documentation E2E** (1-2 heures restantes)

- [ ] Documenter raison `SKIP_E2E = true` dans code
- [ ] Ajouter README tests E2E
- [ ] Proposer job CI séparé pour E2E (optionnel)

**P1.1.3: Validation Tests Conditionnels** (30 min)

- [ ] Documenter tests conditionnels dans AUTO_HEAL_SYSTEMS.md
- [ ] Clarifier quand SQLite/Three.js tests s'exécutent
- [ ] Accepter ~2% tests conditionnels comme design feature

#### Conclusion P1.1 ✅

**État:** Tests critiques corrigés, reste documentation

---

## 📦 P1.2: Setup Docker pour Tests Rust CI

### Statut: ⏳ **NON DÉMARRÉ**

**Effort:** 2-4 heures  
**Impact:** Permet validation backend en CI

#### Problème Actuel

```bash
$ cargo check
# Erreur: glib-sys — dépendances système manquantes (glib-2.0)
# Raison: CI sans bibliothèques système Tauri/GTK
```

**Limitation:** Tests Rust ne peuvent pas s'exécuter en CI GitHub Actions

#### Solution Proposée

**Option 1: Docker avec Dépendances Système** (Recommandé)

Créer `.github/workflows/rust-tests-docker.yml`:

```yaml
name: Rust Tests (Docker)

on:
  push:
    branches: [MAIN, dev]
  pull_request:
    branches: [MAIN]

jobs:
  test-rust-docker:
    runs-on: ubuntu-latest
    container:
      image: rust:1.83-slim

    steps:
      - uses: actions/checkout@v4

      - name: Install System Dependencies
        run: |
          apt-get update
          apt-get install -y \
            libwebkit2gtk-4.1-dev \
            libgtk-3-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev \
            patchelf

      - name: Cache Cargo
        uses: actions/cache@v4
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            target
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}

      - name: Run Rust Tests
        working-directory: src-tauri
        run: cargo test --verbose
```

**Avantages:**

- ✅ Tests backend validés en CI
- ✅ Détection précoce erreurs Rust
- ✅ Pas d'impact sur tests rapides (job séparé)

#### Actions Requises

1. Créer fichier workflow Docker
2. Tester en CI
3. Documenter dans README
4. Mettre à jour badge statut tests

#### Timeline

- **Sprint actuel:** Analyse et design (ce document)
- **Sprint suivant:** Implémentation et tests

---

## 📚 P1.3: Mettre à Jour API Reference (v24.30 → v26.2)

### Statut: ⏳ **NON DÉMARRÉ**

**Effort:** 4-8 heures  
**Impact:** Documentation développeurs à jour

#### Gap Actuel

**Documentation API:** v24.30  
**Version Code:** v26.2.0  
**Écart:** ~20 versions

#### Changements à Documenter

**Modules Ajoutés/Modifiés depuis v24.30:**

1. **Auto-Heal Systems** (v26.2.0)
   - health-check-enhanced.sh
   - proactive-monitor.sh
   - pre-deployment-check.sh

2. **OMEGA Pipeline v2** (v25.x)
   - conversation_generate command
   - conversationId mandatory

3. **9 Moteurs Cognitifs** (v24.3+)
   - Orchestrator
   - StyleEngine
   - CoherenceEngine
   - ReflectionEngine
   - EmotionEngine
   - UnifiedMemory
   - BehaviorEngine
   - AdaptationEngine
   - SystemHealth

4. **Architecture 4-Ring Model** (v24.3+)
   - Validation stricte
   - Règles import

#### Actions Requises

1. **Générer API Docs** via TypeDoc

   ```bash
   npm run docs
   ```

2. **Mettre à Jour Manuellement:**
   - README API section
   - ARCHITECTURE.md
   - Scripts bash documentation
   - Tauri commands reference

3. **Ajouter Guides:**
   - Migration guide v24.30 → v26.2
   - Breaking changes (OMEGA v1 → v2)
   - New features showcase

#### Structure Proposée

```
docs/
├── api/
│   ├── frontend/          # TypeDoc auto-generated
│   ├── backend/           # Rust docs (cargo doc)
│   └── scripts/           # Bash scripts reference
├── guides/
│   ├── MIGRATION_OMEGA_V2.md  (existe)
│   ├── MIGRATION_v24_to_v26.md (à créer)
│   └── AUTO_HEAL_SYSTEMS.md   (existe)
└── reference/
    ├── TAURI_COMMANDS.md  (à créer)
    └── ENGINE_SPECS.md    (à créer)
```

#### Timeline

- **Sprint actuel:** Design structure (ce document)
- **Sprint suivant:** Génération + rédaction

---

## 📊 PROGRESSION GLOBALE P1

### Résumé

| Item      | Statut         | Effort     | Complété | Restant   |
| --------- | -------------- | ---------- | -------- | --------- |
| P1.1      | 🟢 En cours    | 4-8h       | 3h       | 1-5h      |
| P1.2      | ⏳ Non démarré | 2-4h       | 0h       | 2-4h      |
| P1.3      | ⏳ Non démarré | 4-8h       | 0h       | 4-8h      |
| **TOTAL** | **30%**        | **10-20h** | **3h**   | **7-17h** |

### Priorisation

**Sprint Actuel (Semaine 1):**

1. ✅ P1.1: Finaliser corrections tests (1-2h restantes)
2. 🎯 P1.1: Documenter stratégie E2E (1h)

**Sprint Suivant (Semaine 2):**

1. 🎯 P1.2: Docker Rust CI (2-4h)
2. 🎯 P1.3: API Reference update (4-8h)

### Impact Attendu

**Après P1 Complet:**

- ✅ Tests: 97.93%+ passing
- ✅ Backend: Validé en CI
- ✅ Docs: À jour v26.2
- ✅ Score audit: 94/100 (+1.5 points)

---

## 🎯 NEXT STEPS IMMÉDIATS

### Cette Session

1. ✅ **Corriger tests Web Vitals** — FAIT
2. ✅ **Créer documentation P1.1** — FAIT
3. ✅ **Créer plan P1 global** — Ce document

### Prochaine Session

1. 📋 Documenter stratégie E2E
2. 📋 Commit et push changements
3. 📋 Reply au commentaire utilisateur

---

## 💡 RECOMMANDATIONS

### Court Terme

- Finaliser P1.1 (documentation E2E)
- Commit changements tests Web Vitals
- Mettre à jour métriques audit

### Moyen Terme

- Implémenter P1.2 (Docker Rust CI)
- Démarrer P1.3 (API docs)

### Long Terme

- Automatiser génération API docs en CI
- Monitoring continu taux tests skipped
- Version docs synchronisée avec code

---

**Créé Par:** GitHub Copilot Coding Agent  
**Date:** 2025-12-23  
**Session:** P1 Items Resolution  
**Progression:** 30% (3/10-20 heures)
