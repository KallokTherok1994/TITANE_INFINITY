# TITANE∞ — PHASE ÉVOLUTION CONTRÔLÉE PROMPT vΩ.EVOLVE
(Evolve without regress · Governed growth · Stability preserved)

**Version:** vΩ.1  
**Date:** 2026-02-02  
**Status:** ACTIF — Framework de gouvernance pour évolutions post-STABLE

---

## STATUT
STABLE (certifié) → EVOLUTION (contrôlée)

---

## LOIS ABSOLUES (INVARIANTS NON NÉGOCIABLES)

### Sacralité de l'État STABLE
- L'état STABLE actuel est sacré
- Aucune régression fonctionnelle, UI, test ou CI
- Local-first absolu
- Tauri-only strict
- Architecture 4-Ring intacte
- Registres append-only obligatoires
- Toute évolution doit être :
  - **isolée** (branche dédiée, scope limité)
  - **testée** (tous tests existants + nouveaux)
  - **traçable** (registry entries obligatoires)
  - **réversible** (rollback documenté)

**AUCUNE exception implicite.**

---

## OBJECTIF DE LA PHASE
Faire évoluer TITANE∞ **sans jamais repasser par une phase de stabilisation d'urgence**.

Cette phase sert à :
1. Ajouter des capacités ou améliorations
2. Renforcer la qualité long terme
3. Préserver la stabilité acquise
4. Maintenir une gouvernance stricte

---

## CYCLE D'ÉVOLUTION (6 PHASES OBLIGATOIRES)

### PHASE 1 — DÉFINITION DE L'ÉVOLUTION (OBLIGATOIRE)

**Règle:** UNE évolution principale (et une seule) par cycle.

**Catégories disponibles:**
- [ ] UI / UX (nouvelle capacité, pas refonte)
- [ ] Sécurité (durcissement progressif)
- [ ] Performance / DX
- [ ] Fonctionnelle (nouveau comportement métier)
- [ ] Qualité / Observabilité
- [ ] Architecture interne (qualifiée)

**Documentation obligatoire:**
```markdown
## Évolution: [TITRE CLAIR]
### Objectif
[Décrire le "pourquoi" en 2-3 phrases]

### Valeur Ajoutée
[Impact mesurable ou observable]

### Périmètre Précis
[Ce qui EST dans le scope]

### Hors Scope Explicite
[Ce qui N'EST PAS dans le scope]
```

**Critère de validation Phase 1:**
- ✅ Une seule évolution identifiée
- ✅ Objectif clair et mesurable
- ✅ Périmètre défini et hors-scope explicite
- ✅ Valeur ajoutée justifiée

---

### PHASE 2 — ANALYSE D'IMPACT AVANT CODE

**Obligation:** Produire une **matrice d'impact** AVANT toute modification.

**Template obligatoire:**
| Ring | Fichiers | Risque | Mitigation |
|------|----------|--------|------------|
| Types | [liste] | [LOW/MED/HIGH] | [action préventive] |
| Engines | [liste] | [LOW/MED/HIGH] | [action préventive] |
| Services | [liste] | [LOW/MED/HIGH] | [action préventive] |
| UI | [liste] | [LOW/MED/HIGH] | [action préventive] |

**Pour chaque Ring impacté, documenter:**
- Quels fichiers seront touchés (chemins complets)
- Quels invariants doivent rester vrais (interfaces, contrats)
- Quels tests existants doivent continuer à passer (noms de suites)

**AUCUNE ligne vide tolérée.**

**Critère de validation Phase 2:**
- ✅ Matrice d'impact complète (tous Rings couverts)
- ✅ Fichiers identifiés (chemins absolus)
- ✅ Risques évalués (LOW/MED/HIGH)
- ✅ Mitigations documentées

---

### PHASE 3 — STRATÉGIE D'IMPLÉMENTATION ISOLÉE

**Règles strictes:**
1. **Branche dédiée obligatoire:** `feature/evolve-<topic>`
2. **Un domaine à la fois:** Ne pas modifier Types + UI simultanément
3. **Zéro refactor gratuit:** Pas de "nettoyage opportuniste"
4. **Justification explicite:** Chaque changement doit avoir une raison

**Si un refactor est nécessaire:**
- Le documenter dans un fichier `REFACTOR_JUSTIFICATION_<topic>.md`
- Le tracer dans le registry
- Le justifier par rapport à l'évolution principale
- L'isoler dans un commit séparé si possible

**Workflow Git:**
```bash
# Créer branche dédiée
git checkout -b feature/evolve-<topic>

# Travailler par commits atomiques
git commit -m "evolve(<ring>): <action> - <justification>"

# Pousser régulièrement
git push origin feature/evolve-<topic>
```

**Critère de validation Phase 3:**
- ✅ Branche dédiée créée
- ✅ Un seul domaine modifié à la fois
- ✅ Aucun refactor non justifié
- ✅ Commits atomiques et traçables

---

### PHASE 4 — TESTS & NON-RÉGRESSION

**Obligation:** Repasser TOUS les tests existants AVANT validation.

**Checklist obligatoire:**
```bash
# 1. TypeScript compilation
pnpm run check
# Résultat attendu: 0 errors

# 2. ESLint
pnpm run lint
# Résultat attendu: 0 errors

# 3. Prettier
pnpm run format:check
# Résultat attendu: 0 critical errors

# 4. Vitest (unit tests)
pnpm run test
# Résultat attendu: all tests passing

# 5. Rust tests (if applicable)
cd src-tauri && cargo test
# Résultat attendu: test result: ok

# 6. E2E tests (if applicable)
pnpm run test:e2e
# Résultat attendu: all scenarios passing
```

**Vérifications supplémentaires:**
- [ ] **UI:** Aucune régression visuelle (smoke test manuel si nécessaire)
- [ ] **CI:** Durée stable (pas d'augmentation >20%)
- [ ] **Tests:** Zéro nouveau warning critique
- [ ] **Console:** Aucune nouvelle erreur/warning en dev mode

**Règle absolue:**
**Tout échec = STOP immédiat.**
- Pas de "je corrige après"
- Pas de "c'est non-bloquant"
- Pas de "TODO" dans le code

**Critère de validation Phase 4:**
- ✅ Tous tests existants PASS
- ✅ Nouveaux tests ajoutés (si applicable)
- ✅ Aucune régression détectée
- ✅ CI duration stable

---

### PHASE 5 — REGISTRES APPEND-ONLY

**Obligation:** Toute modification DOIT être enregistrée.

#### 5.1 Repo Registry
**Pour toute modification infra / logique / CI:**
Append une entrée dans `registry/repo-events.jsonl`

**Template obligatoire:**
```json
{
  "id": "repo-evolve-XXX",
  "ts": "YYYY-MM-DDTHH:MM:SSZ",
  "category": "evolution",
  "scope": "[Ring impacté]",
  "change_type": "[ui/security/performance/functional/quality/architecture]",
  "summary": "[Description concise]",
  "objective": "[Pourquoi cette évolution]",
  "value": "[Bénéfice mesurable]",
  "files_changed": ["[liste complète]"],
  "tests_run": ["[toutes suites exécutées]"],
  "proofs": {
    "typescript": "0 errors",
    "eslint": "0 errors",
    "prettier": "0 critical errors",
    "vitest": "X/X passing",
    "rust": "ok (if applicable)"
  },
  "risk_level": "[LOW/MED/HIGH]",
  "rollback": "[Procédure de retour arrière]",
  "status": "evolution-validated"
}
```

#### 5.2 UI Registry
**Si UI impactée:**
Append une entrée dans `registry/ui-events.jsonl`

**Template obligatoire:**
```json
{
  "id": "ui-XXX",
  "ts": "YYYY-MM-DDTHH:MM:SSZ",
  "category": "evolution",
  "scope": "[Composant/Page]",
  "change_type": "[new-feature/enhancement/refinement]",
  "summary": "[Description UI visible]",
  "reason": "[Pourquoi cette modification UI]",
  "files_changed": ["[liste composants]"],
  "tests_run": ["[tests UI exécutés]"],
  "visual_regression": "[none/smoke-tested/fully-tested]",
  "proofs": ["[screenshots/logs si applicable]"],
  "risk_level": "[LOW/MED/HIGH]",
  "rollback": "[Procédure UI]",
  "status": "deployed-testing"
}
```

**Champs obligatoires:**
- cause / objective
- fichiers touchés (complet)
- tests re-exécutés (tous)
- rollback (procédure claire)

**Règle absolue:**
**Aucune modification sans registre.**

**Critère de validation Phase 5:**
- ✅ Registry entry créée (repo et/ou UI)
- ✅ Tous champs obligatoires remplis
- ✅ Rollback documenté
- ✅ Proofs attachées

---

### PHASE 6 — VALIDATION & DÉCISION

**Obligation:** Produire un rapport court de validation.

**Template obligatoire:**
```markdown
# VALIDATION ÉVOLUTION — [TOPIC]

## 1. Objectif de l'Évolution
[Rappel de la Phase 1]

## 2. Changements Appliqués
| Ring | Fichiers | Nature | Commits |
|------|----------|--------|---------|
[Tableau complet]

## 3. Résultats des Tests
| Test Suite | Before | After | Status |
|------------|--------|-------|--------|
| TypeScript | X errors | Y errors | [PASS/FAIL] |
| ESLint | X errors | Y errors | [PASS/FAIL] |
| Vitest | X/X | Y/Y | [PASS/FAIL] |
| E2E | X scenarios | Y scenarios | [PASS/FAIL] |

## 4. Risques Résiduels
[S'il y en a, les documenter explicitement]
[Si aucun: "Aucun risque résiduel identifié"]

## 5. Registry Entries
- repo-evolve-XXX: [lien/résumé]
- ui-XXX: [lien/résumé si applicable]

## 6. Décision Finale
- ✅ EVOLUTION VALIDÉE — Prête pour merge dans MAIN
- ❌ BLOCKED — [Causes précises]
```

**Critères de validation Phase 6:**
- ✅ Rapport complet généré
- ✅ Tous tests documentés
- ✅ Risques identifiés (ou "aucun")
- ✅ Décision explicite (VALIDÉE ou BLOCKED)

**Si VALIDÉE:**
```bash
# Merge dans MAIN
git checkout MAIN
git merge --no-ff feature/evolve-<topic>
git push origin MAIN
```

**Si BLOCKED:**
- Documenter les causes
- Créer issues GitHub pour chaque blocage
- Ne pas merger
- Retourner en Phase appropriée

---

## INTERDICTIONS ABSOLUES

### ❌ Repasser en "mode correction"
- Toute évolution doit être proactive, pas réactive
- Si bugs découverts, traiter dans un cycle séparé

### ❌ Modifier un invariant sans décision explicite
- Architecture 4-Ring: intouchable
- Registres append-only: intouchables
- Local-first / Tauri-only: intouchables

### ❌ Introduire une dette "temporaire"
- Aucun TODO dans le code sans issue GitHub liée
- Aucun commentaire "fix later"
- Aucun test skip sans justification documentée

### ❌ Toucher à une zone stable sans test
- Chaque fichier modifié doit avoir:
  - Tests existants qui passent
  - Nouveaux tests si comportement ajouté

### ❌ Déclarer "OK" sans preuves
- Toute validation nécessite logs/screenshots
- Toute assertion nécessite test automatisé
- Toute régression doit être détectée et documentée

---

## PHILOSOPHIE

> **TITANE∞ n'évolue pas pour aller plus vite.**  
> **Il évolue pour pouvoir continuer sans s'effondrer.**

### Principes Directeurs

1. **Stabilité > Vitesse**
   - Préférer 1 évolution validée par mois à 10 changements non testés

2. **Traçabilité > Innovation**
   - Chaque changement doit pouvoir être expliqué dans 6 mois

3. **Isolation > Optimisation**
   - Un scope limité bien testé > Un refactor global fragile

4. **Documentation > Code**
   - Si pas documenté, ça n'existe pas

5. **Réversibilité > Perfection**
   - Toute évolution doit pouvoir être annulée en <10min

---

## CYCLE D'ÉVOLUTION — RÉSUMÉ VISUEL

```
┌─────────────────────────────────────────────────┐
│ ÉTAT STABLE (certifié)                          │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ PHASE 1        │
         │ Définition     │ ◄── UNE évolution uniquement
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ PHASE 2        │
         │ Analyse Impact │ ◄── Matrice obligatoire
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ PHASE 3        │
         │ Implémentation │ ◄── Branche dédiée isolée
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ PHASE 4        │
         │ Tests Non-Reg  │ ◄── TOUS tests existants
         └────────┬───────┘
                  │
         ┌────────┴───────┐
         │ PASS?          │
         └────┬──────┬────┘
              │ NO   │ YES
              │      │
              ▼      ▼
         ┌─────┐  ┌────────────────┐
         │STOP │  │ PHASE 5        │
         │     │  │ Registres      │ ◄── Append-only
         └─────┘  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ PHASE 6        │
                  │ Validation     │ ◄── Rapport + Décision
                  └────────┬───────┘
                           │
                  ┌────────┴────────┐
                  │ VALIDÉE?        │
                  └────┬──────┬─────┘
                       │ NO   │ YES
                       │      │
                       ▼      ▼
                  ┌──────┐ ┌──────────────────┐
                  │BLOCK │ │ Merge MAIN       │
                  │      │ │ STABLE préservé  │
                  └──────┘ └──────────────────┘
```

---

## EXEMPLES D'ÉVOLUTIONS VALIDES

### ✅ Évolution Valide: Ajout métriques performance
- **Phase 1:** Ajouter tracking temps réponse AI
- **Phase 2:** Ring Services impacté, risque LOW
- **Phase 3:** Branche `feature/evolve-perf-metrics`
- **Phase 4:** Tous tests passent + nouveaux tests métriques
- **Phase 5:** `repo-evolve-001` créé
- **Phase 6:** VALIDÉE — Merge dans MAIN

### ✅ Évolution Valide: Nouveau composant UI
- **Phase 1:** Ajouter panneau latéral paramètres
- **Phase 2:** Ring UI impacté, risque MED
- **Phase 3:** Branche `feature/evolve-settings-panel`
- **Phase 4:** Tests UI + smoke test visuel OK
- **Phase 5:** `ui-010` + `repo-evolve-002` créés
- **Phase 6:** VALIDÉE — Merge dans MAIN

### ❌ Évolution Invalide: "Refactor global"
- **Phase 1:** "Améliorer architecture globale"
  - ❌ Pas de scope précis
  - ❌ Trop de Rings impactés
  - ❌ Pas de valeur mesurable

### ❌ Évolution Invalide: "Corriger bug critique"
- **Phase 1:** "Fix crash au démarrage"
  - ❌ C'est une correction, pas une évolution
  - ❌ Doit passer par STABLE+ protocol
  - ❌ Urgence ≠ évolution contrôlée

---

## GOUVERNANCE DU PROTOCOL

### Modifications du Protocol vΩ.EVOLVE
Ce protocol lui-même peut évoluer, mais nécessite:
1. RFC documentée (Request for Comments)
2. Validation Kevin Thibault (TITANE∞ creator)
3. Entry dans `registry/repo-events.jsonl` catégorie "governance"
4. Version bump (vΩ.1 → vΩ.2)

### Audits Périodiques
- **Mensuel:** Review des évolutions appliquées
- **Trimestriel:** Analyse des risques résiduels cumulés
- **Semestriel:** Validation que STABLE est toujours STABLE

### Escalation
Si une évolution:
- Casse la stabilité
- Introduit une dette technique
- Viole un invariant

**Action immédiate:**
1. Revert du merge (si déjà mergé)
2. Post-mortem obligatoire
3. RFC pour correction du protocol

---

## CONCLUSION

**Ce protocol existe pour UNE raison:**

> Éviter de JAMAIS repasser par une phase de stabilisation d'urgence comme celle qui a produit les Phases 1-4 documentées dans EXECUTIVE_FINAL_REPORT_PHASES_1-4.md.

**STOP.**

Toute nouvelle évolution nécessite un nouveau cycle EVOLVE complet.

Aucune exception. Aucun raccourci. Aucune "urgence" qui justifie de skip une phase.

---

*Protocol vΩ.EVOLVE*  
*Créé: 2026-02-02*  
*Version: vΩ.1*  
*Status: ACTIF — Gouvernance évolutions post-STABLE*

**FIN DU PROTOCOL**
