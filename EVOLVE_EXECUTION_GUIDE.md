# TITANE∞ — EVOLVE EXECUTION GUIDE vΩ.EVOLVE_EXEC
(Launch 1 governed evolution · Produce impact matrix · Implement · Prove · Register · Validate)

**Version:** vΩ.1  
**Date:** 2026-02-02  
**Status:** ACTIF — Guide opérationnel d'exécution pour cycles EVOLVE

---

## STATUT
STABLE (certifié) → EVOLUTION (cycle N)

---

## LOIS ABSOLUES (RAPPEL)
- ✅ L'état STABLE actuel est sacré : aucun compromis
- ✅ Local-first absolu
- ✅ Tauri-only strict
- ✅ Architecture 4-Ring intacte
- ✅ Append-only registry obligatoire
- ✅ Tests/CI = source de vérité
- ✅ Zéro refactor opportuniste
- ✅ Une seule évolution principale par cycle

---

## 🎯 INPUTS OBLIGATOIRES (À REMPLIR AVANT TOUTE ACTION)

**RÈGLE CRITIQUE:** Remplir ces 6 champs (texte complet, pas de "TODO", pas de "TBD").

```markdown
1) **TOPIC (titre court)** :
   [Ex: "Add AI Response Metrics Tracking"]

2) **CATÉGORIE** :
   [ ] UI/UX (nouvelle capacité, pas refonte)
   [ ] Sécurité (durcissement progressif)
   [ ] Performance/DX
   [ ] Fonctionnelle (nouveau comportement métier)
   [ ] Qualité/Observabilité
   [ ] Architecture interne (qualifiée)

3) **OBJECTIF (2-3 phrases)** :
   [Décrire le "pourquoi" clair et mesurable]

4) **VALEUR AJOUTÉE (mesurable/observable)** :
   [Impact concret, ex: "Réduction latence 20%", "Nouvelle capacité X"]

5) **SCOPE IN (liste précise)** :
   - [Fichier/Composant 1]
   - [Fichier/Composant 2]
   - [...]

6) **SCOPE OUT (liste précise)** :
   - [Ce qui N'EST PAS dans cette évolution]
   - [...]
```

**⛔ STOP IMMÉDIAT si un champ est vide ou contient "TODO".**

---

## 📋 CYCLE D'EXÉCUTION (7 PHASES)

### PHASE 1 — DÉFINITION (OUTPUT)

**Action:** Créer le document de définition.

**Fichier à créer:**
```
reports/EVOLVE_01_DEFINITION_<topic>.md
```

**Contenu obligatoire:**
```markdown
# ÉVOLUTION: [TOPIC]

**Catégorie:** [UI/Sécurité/Performance/etc.]  
**Date:** YYYY-MM-DD  
**Cycle:** N

---

## Objectif
[Reprendre INPUTS #3]

## Valeur Ajoutée
[Reprendre INPUTS #4]

## Scope IN (Périmètre Inclus)
[Reprendre INPUTS #5]

## Scope OUT (Hors Périmètre)
[Reprendre INPUTS #6]

## Critères d'Acceptation
- [ ] [Critère mesurable 1]
- [ ] [Critère mesurable 2]
- [ ] [Critère mesurable 3]
- [ ] Tests existants: 100% PASS
- [ ] Nouveaux tests: ajoutés + PASS
- [ ] Registry entries: créées
- [ ] Rollback: documenté

---

**Status:** PHASE 1 COMPLETE
```

**Registry Entry:**
```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
echo '{
  "id": "repo-evolve-NNN-phase1",
  "ts": "YYYY-MM-DDTHH:MM:SSZ",
  "category": "governance",
  "scope": "EVOLVE Cycle N",
  "change_type": "evolution-start",
  "summary": "EVOLVE cycle started: [TOPIC]",
  "topic": "[TOPIC]",
  "category_evolution": "[CATÉGORIE]",
  "objective": "[OBJECTIF résumé]",
  "status": "phase1-complete"
}' >> registry/repo-events.jsonl
```

**Validation Phase 1:**
- ✅ Document EVOLVE_01_DEFINITION créé
- ✅ Tous champs remplis (pas de TODO)
- ✅ Critères d'acceptation définis
- ✅ Registry entry phase1 ajoutée

---

### PHASE 2 — ANALYSE D'IMPACT (OUTPUT)

**Action:** Produire la matrice d'impact AVANT tout code.

**Fichier à créer:**
```
reports/EVOLVE_02_IMPACT_MATRIX_<topic>.md
```

**Contenu obligatoire:**
```markdown
# MATRICE D'IMPACT — [TOPIC]

**Date:** YYYY-MM-DD  
**Cycle:** N  
**Phase:** 2

---

## Matrice 4-Ring

| Ring | Fichiers Candidats | Risque | Mitigation |
|------|-------------------|--------|------------|
| **Types** | [liste chemins complets ou "Aucun"] | LOW/MED/HIGH/NONE | [action préventive si nécessaire] |
| **Engines** | [liste chemins complets ou "Aucun"] | LOW/MED/HIGH/NONE | [action préventive si nécessaire] |
| **Services** | [liste chemins complets ou "Aucun"] | LOW/MED/HIGH/NONE | [action préventive si nécessaire] |
| **UI** | [liste chemins complets ou "Aucun"] | LOW/MED/HIGH/NONE | [action préventive si nécessaire] |

**AUCUNE ligne vide tolérée.**

---

## Fichiers Impactés (Détail)

### Ring Types
- `src/types/[...].ts` — [raison modification]
- [...]

### Ring Engines
- `src/engines/[...].ts` — [raison modification]
- [...]

### Ring Services
- `src/services/[...].ts` — [raison modification]
- [...]

### Ring UI
- `src/components/[...].tsx` — [raison modification]
- [...]

---

## Invariants à Préserver

### Architecture
- [ ] Architecture 4-Ring intacte
- [ ] Pas de dépendance circulaire introduite
- [ ] Interfaces existantes non cassées

### Comportement
- [ ] [Invariant métier 1]
- [ ] [Invariant métier 2]

### Performance
- [ ] Temps de build stable (±10%)
- [ ] Temps de tests stable (±20%)

---

## Tests à Repasser (Checklist)

### Tests Obligatoires
```bash
# TypeScript compilation
pnpm run check
# Résultat attendu: 0 errors

# ESLint
pnpm run lint
# Résultat attendu: 0 errors

# Prettier
pnpm run format:check
# Résultat attendu: 0 YAML critical errors

# Vitest (unit tests)
pnpm run test
# Résultat attendu: all tests passing

# Verification (if exists)
pnpm run verify
# Résultat attendu: all checks passing
```

### Tests Conditionnels
```bash
# Rust tests (if Tauri backend modified)
cd src-tauri && cargo test
# Résultat attendu: test result: ok

# E2E tests (if UI critical path modified)
pnpm run test:e2e
# Résultat attendu: all scenarios passing
```

---

## Décision de Scope

**Analyse de Risque:**
- Rings impactés: [nombre]
- Risque MED ou HIGH: [nombre]

**Règle:** Si plus d'un Ring avec risque MED/HIGH, **réduire le scope**.

**Décision:**
- [ ] Scope validé tel quel
- [ ] Scope réduit (documenter ce qui est reporté à cycle ultérieur)

---

**Status:** PHASE 2 COMPLETE
```

**Registry Entry:**
```bash
echo '{
  "id": "repo-evolve-NNN-phase2",
  "ts": "YYYY-MM-DDTHH:MM:SSZ",
  "category": "governance",
  "scope": "EVOLVE Cycle N",
  "change_type": "impact-analysis",
  "summary": "EVOLVE impact matrix finalized: [TOPIC]",
  "rings_impacted": ["[liste]"],
  "files_count": N,
  "risk_level": "[LOW/MED/HIGH]",
  "status": "phase2-complete"
}' >> registry/repo-events.jsonl
```

**Validation Phase 2:**
- ✅ Matrice 4-Ring complète (aucune ligne vide)
- ✅ Fichiers identifiés avec chemins complets
- ✅ Invariants listés
- ✅ Tests identifiés (noms + commandes)
- ✅ Décision de scope prise
- ✅ Registry entry phase2 ajoutée

---

### PHASE 3 — STRATÉGIE & BRANCHE (OUTPUT)

**Action:** Créer branche dédiée et plan d'implémentation.

**Branche à créer:**
```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
git checkout -b feature/evolve-<topic>
git push -u origin feature/evolve-<topic>
```

**Fichier à créer:**
```
reports/EVOLVE_03_PLAN_<topic>.md
```

**Contenu obligatoire:**
```markdown
# PLAN D'IMPLÉMENTATION — [TOPIC]

**Date:** YYYY-MM-DD  
**Cycle:** N  
**Phase:** 3  
**Branche:** `feature/evolve-<topic>`

---

## Stratégie d'Implémentation

### Étapes Séquentielles

**Étape 1:** [Description]
- Fichiers: [liste]
- Ring: [Types/Engines/Services/UI]
- Durée estimée: [temps]
- Commit attendu: `evolve([ring]): [action] - [justification]`

**Étape 2:** [Description]
- Fichiers: [liste]
- Ring: [Types/Engines/Services/UI]
- Durée estimée: [temps]
- Commit attendu: `evolve([ring]): [action] - [justification]`

[... répéter pour N étapes]

---

## Commits Attendus (Format)

```
commit 1: evolve(types): add [interface] - [raison]
commit 2: evolve(services): implement [logic] - [raison]
commit 3: evolve(ui): integrate [component] - [raison]
commit 4: evolve(tests): add [test suite] - [raison]
```

**Règles:**
- Commits atomiques (1 étape = 1 commit si possible)
- Format strict: `evolve([ring]): [verb] [noun] - [raison courte]`
- Pas de "WIP" commits
- Chaque commit doit compiler

---

## Rollback Plan (10 min max)

### Si problème détecté AVANT merge:
```bash
# Retour à MAIN
git checkout MAIN

# Suppression branche locale
git branch -D feature/evolve-<topic>

# Suppression branche remote
git push origin --delete feature/evolve-<topic>
```

### Si problème détecté APRÈS merge:
```bash
# Identifier commit de merge
git log --oneline -10

# Revert du merge (conserver historique)
git revert -m 1 [merge-commit-hash]

# Push revert
git push origin MAIN
```

**Durée estimée:** < 10 minutes

---

## Critères de STOP

**STOP immédiat si:**
- [ ] 1 erreur TypeScript non prévue
- [ ] 1 erreur ESLint non prévue
- [ ] 1 test fail non prévu
- [ ] 1 gate CI fail
- [ ] Scope dépasse ce qui est défini en Phase 1
- [ ] Refactor "gratuit" détecté
- [ ] Modification d'un invariant sans RFC

**Action si STOP:**
1. Commit état actuel avec message `WIP: stopped - [raison]`
2. Documenter raison dans issue GitHub
3. Retourner en Phase appropriée (1, 2 ou 3)

---

**Status:** PHASE 3 COMPLETE
```

**Registry Entry:**
```bash
echo '{
  "id": "repo-evolve-NNN-phase3",
  "ts": "YYYY-MM-DDTHH:MM:SSZ",
  "category": "governance",
  "scope": "EVOLVE Cycle N",
  "change_type": "branch-created",
  "summary": "EVOLVE branch + plan created: [TOPIC]",
  "branch": "feature/evolve-<topic>",
  "commits_planned": N,
  "rollback_time": "< 10min",
  "status": "phase3-complete"
}' >> registry/repo-events.jsonl
```

**Validation Phase 3:**
- ✅ Branche `feature/evolve-<topic>` créée
- ✅ Plan d'implémentation documenté (étapes séquentielles)
- ✅ Commits attendus formatés
- ✅ Rollback plan < 10min documenté
- ✅ Critères de STOP définis
- ✅ Registry entry phase3 ajoutée

---

### PHASE 4 — IMPLÉMENTATION ISOLÉE (RULES)

**Action:** Implémenter l'évolution selon le plan Phase 3.

**Règles d'Implémentation:**

1. **Commits Atomiques**
   - 1 étape = 1 commit (si possible)
   - Chaque commit doit compiler sans erreur
   - Pas de "fix typo" commits séparés

2. **Un Seul Domaine à la Fois**
   - Ne pas modifier Types + UI dans le même commit
   - Respecter la séquence définie en Phase 3
   - Si blocage, STOP et documenter

3. **Zéro Refactor Gratuit**
   - Pas de "nettoyage opportuniste"
   - Pas de "tant qu'à faire, je refactor X"
   - Si refactor nécessaire: documenter dans `REFACTOR_JUSTIFICATION_<topic>.md`

4. **Justification Explicite**
   - Chaque modification doit citer l'objectif Phase 1
   - Format commit: `evolve([ring]): [action] - [raison liée à l'objectif]`

**Format Commit Strict:**
```
evolve(ui): add metrics panel component - enable real-time AI response tracking
evolve(services): implement metrics collection service - persist tracking data
evolve(types): add MetricsData interface - support new metrics structure
evolve(tests): add metrics service tests - validate data collection logic
```

**Checklist pendant Implémentation:**
- [ ] Chaque commit respecte le format
- [ ] Aucun fichier hors scope IN
- [ ] Aucun refactor non justifié
- [ ] Code compile à chaque commit
- [ ] Pas de console.log/debugging code

**Si Problème Détecté:**
- Appliquer critères STOP de Phase 3
- Documenter dans issue GitHub
- Ne pas continuer "en espérant que ça passe"

---

### PHASE 5 — TESTS & NON-RÉGRESSION (PROOF)

**Action:** Exécuter TOUS les tests et capturer outputs.

**Commandes Obligatoires:**
```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# 1. TypeScript compilation
pnpm run check > /tmp/evolve_test_typescript.log 2>&1
echo "TypeScript: $(tail -1 /tmp/evolve_test_typescript.log)"

# 2. ESLint
pnpm run lint > /tmp/evolve_test_eslint.log 2>&1
echo "ESLint: $(tail -5 /tmp/evolve_test_eslint.log)"

# 3. Prettier
pnpm run format:check > /tmp/evolve_test_prettier.log 2>&1
echo "Prettier: $(grep -E '(error|warning)' /tmp/evolve_test_prettier.log | wc -l) issues"

# 4. Vitest
pnpm run test > /tmp/evolve_test_vitest.log 2>&1
echo "Vitest: $(grep -E 'Test Files|Tests' /tmp/evolve_test_vitest.log)"

# 5. Verify (if exists)
if grep -q '"verify"' package.json; then
  pnpm run verify > /tmp/evolve_test_verify.log 2>&1
  echo "Verify: $(tail -5 /tmp/evolve_test_verify.log)"
fi

# 6. Rust tests (if applicable)
if [ -f "src-tauri/Cargo.toml" ]; then
  cd src-tauri
  cargo test > /tmp/evolve_test_cargo.log 2>&1
  echo "Cargo: $(grep 'test result' /tmp/evolve_test_cargo.log)"
  cd ..
fi

# 7. E2E tests (if applicable)
if grep -q '"test:e2e"' package.json; then
  pnpm run test:e2e > /tmp/evolve_test_e2e.log 2>&1
  echo "E2E: $(tail -10 /tmp/evolve_test_e2e.log)"
fi
```

**Fichier à créer:**
```
reports/EVOLVE_05_TEST_RESULTS_<topic>.md
```

**Contenu obligatoire:**
```markdown
# RÉSULTATS TESTS — [TOPIC]

**Date:** YYYY-MM-DD  
**Cycle:** N  
**Phase:** 5  
**Branche:** `feature/evolve-<topic>`

---

## Résumé Exécutif

| Test Suite | Status | Errors | Warnings | Notes |
|------------|--------|--------|----------|-------|
| TypeScript | [PASS/FAIL] | N | N | [...] |
| ESLint | [PASS/FAIL] | N | N | [...] |
| Prettier | [PASS/FAIL] | N | N | [...] |
| Vitest | [PASS/FAIL] | N/N | N | [...] |
| Verify | [PASS/FAIL/N/A] | N | N | [...] |
| Cargo | [PASS/FAIL/N/A] | N | N | [...] |
| E2E | [PASS/FAIL/N/A] | N | N | [...] |

**Global:** [ALL PASS / BLOCKED]

---

## Détails par Suite

### TypeScript Compilation
```
[Copier output complet ou résumé]
```
**Erreurs:** [liste ou "Aucune"]  
**Status:** [PASS/FAIL]

### ESLint
```
[Copier output complet ou résumé]
```
**Erreurs:** [liste ou "Aucune"]  
**Status:** [PASS/FAIL]

### Prettier
```
[Copier output complet ou résumé]
```
**Erreurs:** [liste ou "Aucune"]  
**Warnings:** [liste ou "Aucun"]  
**Status:** [PASS/FAIL]

### Vitest
```
[Copier output complet ou résumé]
```
**Tests:** X passing / Y total  
**Durée:** Xs  
**Status:** [PASS/FAIL]

### Verify (if applicable)
```
[Copier output]
```
**Status:** [PASS/FAIL/N/A]

### Cargo Tests (if applicable)
```
[Copier output]
```
**Tests:** X passing / Y total  
**Status:** [PASS/FAIL/N/A]

### E2E Tests (if applicable)
```
[Copier output]
```
**Scenarios:** X passing / Y total  
**Status:** [PASS/FAIL/N/A]

---

## Warnings Classés

### Bloquants (STOP si présent)
- [Aucun ou liste]

### Acceptables (Non-bloquants)
- [Liste avec justification]

---

## Comparaison Avant/Après

| Métrique | Avant (MAIN) | Après (branch) | Delta |
|----------|--------------|----------------|-------|
| TypeScript errors | N | N | [+/-/=] |
| ESLint errors | N | N | [+/-/=] |
| Vitest tests | N | N | [+/-/=] |
| Build time | Xs | Xs | [+/-/=] |
| Test duration | Xs | Xs | [+/-/=] |

---

## Décision Phase 5

**Critères STOP:**
- [ ] 1 erreur TS: [OUI/NON]
- [ ] 1 erreur ESLint: [OUI/NON]
- [ ] 1 test fail: [OUI/NON]
- [ ] 1 gate fail: [OUI/NON]
- [ ] Warning critique non justifié: [OUI/NON]

**Résultat:**
- ✅ ALL PASS — Continuer Phase 6
- ❌ BLOCKED — [Documenter causes + retour Phase appropriée]

---

**Status:** PHASE 5 [COMPLETE / BLOCKED]
```

**Registry Entry (si ALL PASS):**
```bash
echo '{
  "id": "repo-evolve-NNN-phase5",
  "ts": "YYYY-MM-DDTHH:MM:SSZ",
  "category": "governance",
  "scope": "EVOLVE Cycle N",
  "change_type": "tests-validated",
  "summary": "EVOLVE tests passed: [TOPIC]",
  "test_results": {
    "typescript": "0 errors",
    "eslint": "0 errors",
    "prettier": "0 YAML errors",
    "vitest": "X/X passing",
    "cargo": "ok",
    "e2e": "X/X passing"
  },
  "status": "phase5-complete"
}' >> registry/repo-events.jsonl
```

**Validation Phase 5:**
- ✅ Toutes commandes exécutées
- ✅ Outputs capturés
- ✅ Rapport EVOLVE_05_TEST_RESULTS créé
- ✅ Warnings classés (bloquants vs acceptables)
- ✅ Comparaison avant/après documentée
- ✅ Décision PASS/BLOCKED prise
- ✅ Registry entry phase5 ajoutée (si PASS)

**⛔ STOP si BLOCKED:**
- Ne pas passer en Phase 6
- Retourner en phase appropriée
- Documenter causes précises

---

### PHASE 6 — REGISTRES (APPEND-ONLY)

**Action:** Créer entries complètes dans registres.

#### 6.1 Repo Registry (OBLIGATOIRE)

**Entry à créer:**
```bash
echo '{
  "id": "repo-evolve-NNN",
  "ts": "YYYY-MM-DDTHH:MM:SSZ",
  "category": "evolution",
  "scope": "[Ring(s) impacté(s)]",
  "change_type": "[ui/security/performance/functional/quality/architecture]",
  "summary": "[TOPIC] - [Description concise]",
  "objective": "[Rappel objectif Phase 1]",
  "value": "[Rappel valeur ajoutée Phase 1]",
  "files_changed": [
    "chemin/fichier1.ts",
    "chemin/fichier2.tsx",
    "..."
  ],
  "commits": [
    "commit-hash-1",
    "commit-hash-2",
    "..."
  ],
  "tests_run": [
    "pnpm run check",
    "pnpm run lint",
    "pnpm run format:check",
    "pnpm run test",
    "pnpm run verify",
    "cargo test",
    "pnpm run test:e2e"
  ],
  "proofs": {
    "typescript": "0 errors",
    "eslint": "0 errors",
    "prettier": "0 critical errors",
    "vitest": "X/X passing",
    "verify": "all checks passing",
    "cargo": "test result: ok",
    "e2e": "X/X scenarios passing"
  },
  "risk_level": "[LOW/MED/HIGH]",
  "rollback": "git revert -m 1 [merge-commit] ou git reset --hard [commit-before]",
  "reports": [
    "reports/EVOLVE_01_DEFINITION_<topic>.md",
    "reports/EVOLVE_02_IMPACT_MATRIX_<topic>.md",
    "reports/EVOLVE_03_PLAN_<topic>.md",
    "reports/EVOLVE_05_TEST_RESULTS_<topic>.md",
    "reports/EVOLVE_07_VALIDATION_<topic>.md"
  ],
  "status": "evolution-validated"
}' >> registry/repo-events.jsonl
```

#### 6.2 UI Registry (SI UI IMPACTÉE)

**Entry à créer (si applicable):**
```bash
echo '{
  "id": "ui-XXX",
  "ts": "YYYY-MM-DDTHH:MM:SSZ",
  "category": "evolution",
  "scope": "[Composant/Page impacté(e)]",
  "change_type": "[new-feature/enhancement/refinement]",
  "summary": "[Description UI visible par utilisateur]",
  "reason": "[Pourquoi cette modification UI]",
  "files_changed": [
    "src/components/[...].tsx",
    "src/components/[...].css",
    "..."
  ],
  "tests_run": [
    "pnpm run test (UI tests)",
    "smoke test manuel",
    "..."
  ],
  "visual_regression": "[none/smoke-tested/fully-tested]",
  "proofs": [
    "reports/EVOLVE_05_TEST_RESULTS_<topic>.md",
    "screenshots (if applicable)"
  ],
  "risk_level": "[LOW/MED/HIGH]",
  "rollback": "[Procédure UI spécifique]",
  "status": "deployed-testing"
}' >> registry/ui-events.jsonl
```

**Validation Phase 6:**
- ✅ Entry `repo-evolve-NNN` créée (tous champs obligatoires)
- ✅ Entry `ui-XXX` créée (si UI impactée)
- ✅ Rollback procedures documentées
- ✅ Proofs attachées (rapports)
- ✅ Status "evolution-validated" ou "deployed-testing"

**Règle absolue:**
**Aucune évolution sans registry entries complètes.**

---

### PHASE 7 — VALIDATION & DÉCISION (FINAL)

**Action:** Produire rapport de validation et décider merge.

**Fichier à créer:**
```
reports/EVOLVE_07_VALIDATION_<topic>.md
```

**Contenu obligatoire:**
```markdown
# VALIDATION FINALE — [TOPIC]

**Date:** YYYY-MM-DD  
**Cycle:** N  
**Phase:** 7  
**Branche:** `feature/evolve-<topic>`

---

## 1. Objectif de l'Évolution (Rappel Phase 1)

[Copier objectif complet de EVOLVE_01_DEFINITION]

---

## 2. Changements Appliqués

| Ring | Fichiers Modifiés | Nature Changement | Commits |
|------|-------------------|-------------------|---------|
| Types | [liste] | [add/modify/refactor] | [hashes] |
| Engines | [liste] | [add/modify/refactor] | [hashes] |
| Services | [liste] | [add/modify/refactor] | [hashes] |
| UI | [liste] | [add/modify/refactor] | [hashes] |

**Total Fichiers:** N  
**Total Commits:** N  
**Lignes Ajoutées:** +N  
**Lignes Supprimées:** -N

---

## 3. Résultats des Tests/CI

| Test Suite | Before (MAIN) | After (branch) | Status | Delta |
|------------|---------------|----------------|--------|-------|
| TypeScript | 0 errors | 0 errors | ✅ PASS | = |
| ESLint | 0 errors | 0 errors | ✅ PASS | = |
| Prettier | 0 YAML errors | 0 YAML errors | ✅ PASS | = |
| Vitest | X/X passing | Y/Y passing | ✅ PASS | +Z tests |
| Verify | all passing | all passing | ✅ PASS | = |
| Cargo | test: ok | test: ok | ✅ PASS | = |
| E2E | X/X scenarios | Y/Y scenarios | ✅ PASS | +Z scenarios |

**CI Duration:**
- Before: Xs
- After: Xs
- Delta: [+/-]X% (acceptable si < 20%)

---

## 4. Risques Résiduels

[Si aucun risque:]
**Aucun risque résiduel identifié.**

[Si risques présents:]
### Risque 1: [Description]
- **Probabilité:** [LOW/MED/HIGH]
- **Impact:** [LOW/MED/HIGH]
- **Mitigation:** [Action préventive]

### Risque 2: [...]

---

## 5. Registry Entries

### Repo Registry
- **ID:** `repo-evolve-NNN`
- **Lien:** [registry/repo-events.jsonl#line-X](../registry/repo-events.jsonl)
- **Status:** evolution-validated

### UI Registry (if applicable)
- **ID:** `ui-XXX`
- **Lien:** [registry/ui-events.jsonl#line-Y](../registry/ui-events.jsonl)
- **Status:** deployed-testing

---

## 6. Critères d'Acceptation (Phase 1)

- [✅/❌] [Critère 1]
- [✅/❌] [Critère 2]
- [✅/❌] [Critère 3]
- ✅ Tests existants: 100% PASS
- ✅ Nouveaux tests: ajoutés + PASS
- ✅ Registry entries: créées
- ✅ Rollback: documenté

**Résultat:** [ALL MET / PARTIAL / BLOCKED]

---

## 7. Décision Finale

**Analyse:**
- Objectif atteint: [OUI/NON]
- Valeur ajoutée démontrée: [OUI/NON]
- Scope respecté: [OUI/NON]
- Tests 100% PASS: [OUI/NON]
- Aucune régression: [OUI/NON]
- Registry complète: [OUI/NON]
- Rollback documenté: [OUI/NON]

**Décision:**

### ✅ EVOLUTION VALIDÉE — Prête pour merge dans MAIN

**Raison:** [Tous critères satisfaits, aucun risque bloquant]

**Procédure de merge:**
```bash
# Checkout MAIN
git checkout MAIN
git pull origin MAIN

# Merge sans fast-forward (conserver historique)
git merge --no-ff feature/evolve-<topic> -m "merge: EVOLVE [TOPIC] - [description courte]

Refs:
- Definition: reports/EVOLVE_01_DEFINITION_<topic>.md
- Impact Matrix: reports/EVOLVE_02_IMPACT_MATRIX_<topic>.md
- Test Results: reports/EVOLVE_05_TEST_RESULTS_<topic>.md
- Validation: reports/EVOLVE_07_VALIDATION_<topic>.md
- Registry: repo-evolve-NNN, ui-XXX

Status: EVOLUTION VALIDATED - All criteria met"

# Push MAIN
git push origin MAIN

# Optionnel: supprimer branche feature (conserver sur remote pour traçabilité)
# git branch -d feature/evolve-<topic>
```

**OU**

### ❌ BLOCKED — Causes précises

**Raisons du blocage:**
1. [Raison 1 avec détail]
2. [Raison 2 avec détail]
3. [...]

**Actions correctives:**
1. [Action requise pour débloquer]
2. [...]

**Retour en Phase:** [1/2/3/4/5]

**Ne pas merger.**

---

**Status:** [EVOLUTION VALIDÉE / BLOCKED]
```

**Registry Entry Finale (si VALIDÉE):**
```bash
echo '{
  "id": "repo-evolve-NNN-phase7",
  "ts": "YYYY-MM-DDTHH:MM:SSZ",
  "category": "governance",
  "scope": "EVOLVE Cycle N",
  "change_type": "evolution-merged",
  "summary": "EVOLVE cycle complete: [TOPIC] merged to MAIN",
  "merge_commit": "[hash]",
  "branch": "feature/evolve-<topic>",
  "decision": "VALIDÉE",
  "status": "cycle-complete"
}' >> registry/repo-events.jsonl
```

**Validation Phase 7:**
- ✅ Rapport EVOLVE_07_VALIDATION créé
- ✅ Tous changements documentés (table Ring/Fichiers/Commits)
- ✅ Résultats tests complets (table avant/après)
- ✅ Risques résiduels documentés (ou "aucun")
- ✅ Registry entries référencées
- ✅ Critères d'acceptation vérifiés
- ✅ Décision explicite prise (VALIDÉE ou BLOCKED)
- ✅ Procédure merge documentée (si VALIDÉE)
- ✅ Registry entry phase7 ajoutée (si VALIDÉE)

**Si VALIDÉE:**
- Exécuter procédure merge `--no-ff`
- Push MAIN
- Cycle EVOLVE terminé

**Si BLOCKED:**
- Ne pas merger
- Créer issues GitHub pour chaque cause
- Documenter retour en Phase appropriée
- Itérer jusqu'à validation

**⛔ STOP.**

**Ce cycle EVOLVE est maintenant complet.**

---

## 🚫 INTERDICTIONS ABSOLUES

### ❌ Démarrer sans INPUTS remplis
- Tous les 6 champs INPUTS doivent être texte complet
- Pas de "TODO", pas de "TBD", pas de champs vides
- Si incomplet: STOP immédiat, ne pas passer en Phase 1

### ❌ Toucher plusieurs Rings sans réduction de scope
- Si matrice Phase 2 montre risque MED/HIGH sur >1 Ring: réduire scope
- Ne pas se dire "ça va passer"
- Préférer cycle plus petit validé que scope large bloqué

### ❌ Masquer un problème par un retry
- Si test fail: investiguer cause, ne pas juste relancer
- Si erreur TS/ESLint: corriger, ne pas ignorer
- Si gate fail: comprendre pourquoi, ne pas skip

### ❌ Modifier sans registry
- Aucun merge sans entry `repo-evolve-NNN` complète
- Si UI impactée: entry `ui-XXX` obligatoire
- Pas de "j'ajoute le registry après"

### ❌ Déclarer "OK" sans preuves
- Toute validation nécessite rapport EVOLVE_05_TEST_RESULTS
- Toute assertion nécessite log/output capturé
- Pas de "ça marche chez moi" sans CI proof

---

## 📊 RÉSUMÉ CYCLE COMPLET

```
INPUTS REMPLIS (6 champs)
    │
    ▼
PHASE 1: Definition
    │ → reports/EVOLVE_01_DEFINITION_<topic>.md
    │ → registry entry phase1
    ▼
PHASE 2: Impact Matrix
    │ → reports/EVOLVE_02_IMPACT_MATRIX_<topic>.md
    │ → registry entry phase2
    │ → Décision scope (réduire si MED/HIGH >1)
    ▼
PHASE 3: Plan + Branch
    │ → git checkout -b feature/evolve-<topic>
    │ → reports/EVOLVE_03_PLAN_<topic>.md
    │ → registry entry phase3
    ▼
PHASE 4: Implémentation
    │ → Commits atomiques (format strict)
    │ → Un Ring à la fois
    │ → Zéro refactor gratuit
    ▼
PHASE 5: Tests + Proofs
    │ → Exécuter TOUS tests
    │ → reports/EVOLVE_05_TEST_RESULTS_<topic>.md
    │ → registry entry phase5 (si PASS)
    ├─ BLOCKED? → STOP + retour Phase appropriée
    ▼ ALL PASS
PHASE 6: Registres
    │ → registry entry repo-evolve-NNN (complet)
    │ → registry entry ui-XXX (si UI)
    ▼
PHASE 7: Validation + Décision
    │ → reports/EVOLVE_07_VALIDATION_<topic>.md
    │ → Décision VALIDÉE ou BLOCKED
    ├─ BLOCKED? → Issues GitHub + retour Phase
    ▼ VALIDÉE
MERGE MAIN (--no-ff)
    │ → registry entry phase7
    ▼
CYCLE COMPLETE ✅
```

---

## 📚 CHECKLIST COMPLÈTE

### Pré-requis
- [ ] 6 INPUTS remplis (texte complet, pas de TODO)
- [ ] Protocol GOVERNANCE_EVOLUTION_PROTOCOL.md lu
- [ ] État STABLE certifié vérifié

### Phase 1
- [ ] Document EVOLVE_01_DEFINITION créé
- [ ] Critères d'acceptation définis
- [ ] Registry entry phase1 ajoutée

### Phase 2
- [ ] Document EVOLVE_02_IMPACT_MATRIX créé
- [ ] Matrice 4-Ring complète (aucune ligne vide)
- [ ] Fichiers identifiés (chemins complets)
- [ ] Tests identifiés (noms + commandes)
- [ ] Décision scope prise (réduire si MED/HIGH >1)
- [ ] Registry entry phase2 ajoutée

### Phase 3
- [ ] Branche `feature/evolve-<topic>` créée
- [ ] Document EVOLVE_03_PLAN créé
- [ ] Stratégie implémentation documentée
- [ ] Commits attendus formatés
- [ ] Rollback plan < 10min documenté
- [ ] Critères STOP définis
- [ ] Registry entry phase3 ajoutée

### Phase 4
- [ ] Commits atomiques appliqués (format strict)
- [ ] Un Ring à la fois respecté
- [ ] Aucun refactor gratuit
- [ ] Chaque commit compile
- [ ] Scope IN respecté

### Phase 5
- [ ] Toutes commandes tests exécutées
- [ ] Outputs capturés (logs)
- [ ] Document EVOLVE_05_TEST_RESULTS créé
- [ ] Warnings classés (bloquants vs acceptables)
- [ ] Comparaison avant/après documentée
- [ ] Décision PASS ou BLOCKED prise
- [ ] Registry entry phase5 ajoutée (si PASS)

### Phase 6
- [ ] Entry `repo-evolve-NNN` créée (complète)
- [ ] Entry `ui-XXX` créée (si UI impactée)
- [ ] Rollback documenté
- [ ] Proofs attachées

### Phase 7
- [ ] Document EVOLVE_07_VALIDATION créé
- [ ] Changements appliqués documentés
- [ ] Résultats tests documentés
- [ ] Risques résiduels documentés (ou "aucun")
- [ ] Registry entries référencées
- [ ] Critères acceptation vérifiés
- [ ] Décision VALIDÉE ou BLOCKED prise
- [ ] Procédure merge documentée (si VALIDÉE)
- [ ] Registry entry phase7 ajoutée (si VALIDÉE)

### Merge (si VALIDÉE)
- [ ] git merge --no-ff exécuté
- [ ] Commit merge avec refs rapports
- [ ] Push MAIN effectué
- [ ] Cycle EVOLVE complet

---

*EVOLVE Execution Guide vΩ.EVOLVE_EXEC*  
*Créé: 2026-02-02*  
*Version: vΩ.1*  
*Status: ACTIF — Guide opérationnel pour cycles d'évolution contrôlée*

**FIN DU GUIDE**
