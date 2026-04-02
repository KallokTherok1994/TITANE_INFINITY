# 10 — NON_SEALED_FAMILY_MATRIX — TITANE_INFINITY

> Generated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL

---

## Familles non scellées — classification complète

| Famille | État | Rupture exacte | Pourquoi non scellée | Preuve manquante | Type de blocage | Next lock | Action locale honnête ? |
|---------|------|----------------|---------------------|-----------------|----------------|-----------|------------------------|
| RELEASE_TRUTH | FALSE_GREEN_RISK | MANIFEST version 28.88.0 ≠ 29.0.0 | G9 FAIL deployment metadata | Version sync MANIFEST | LOCAL | Fix MANIFEST.json version | OUI |
| GATES_MONOTONICITY | PARTIAL_RUNTIME | G9 FAIL | 1/9 gate échoue | G9 pass | LOCAL | Fix MANIFEST ou aligner release | OUI |
| SECRET_SCANNING | UNKNOWN | Pas d'accès API GitHub | Non confirmé GitHub-native | Confirmation API/UI | EXTERNAL | Owner confirme via Settings | NON (HOLD_EXTERNAL) |
| PUSH_PROTECTION | UNKNOWN | Pas d'accès API GitHub | Non confirmé GitHub-native | Confirmation API/UI | EXTERNAL | Owner confirme via Settings | NON (HOLD_EXTERNAL) |
| RULESETS_BRANCH_PROTECTION | DECLARED_ONLY | Pas de confirmation API | CODEOWNERS présent mais enforcement inconnu | branch_protection API | EXTERNAL | Owner confirme rulesets | NON (HOLD_EXTERNAL) |
| ATTESTATION_VERIFICATION | UNKNOWN | Aucune release déclenchée | Step présent, jamais exécuté | Release réelle + vérification attestation | ENV | Déclencher une release tag v* | NON (HOLD_ENV) |
| SBOM_EXPORT | UNKNOWN | Pas de workflow SBOM | Aucun fichier sbom/ trouvé | SPDX SBOM généré | LOCAL | Ajouter step SBOM à release-unified.yml | OUI |
| REUSABLE_WORKFLOWS_TRUST | UNKNOWN | Pas d'analyse | Workflows reusables non audités | Audit caller/callee | LOCAL | Analyser appels workflow_call | OUI |
| FINAL_GLOBAL_SEAL | NON REVENDIQUÉ | Multiple familles non résolues | Règle monotonie globale | Résoudre toutes familles critiques | MULTIPLE | Séquencer les locks | PARTIEL |

---

## Blocages par type

| Type | Familles | Action |
|------|----------|--------|
| LOCAL | RELEASE_TRUTH, GATES_MONOTONICITY, SBOM_EXPORT | Patchable localement |
| ENV | ATTESTATION_VERIFICATION | Nécessite CI actif |
| EXTERNAL | SECRET_SCANNING, PUSH_PROTECTION, RULESETS | Nécessite owner GitHub |
| TRUST_GRADE | ATTESTATION_VERIFICATION | Nécessite vérification runtime |

---

## Prochain lock causal unique

**CURRENT_REAL_LOCK = RELEASE_TRUTH / MANIFEST_VERSION_SYNC**

Corriger le mismatch 28.88.0 → 29.0.0 dans MANIFEST.json permettrait de :
- Débloquer G9
- Aligner RELEASE_TRUTH
- Améliorer GATES_MONOTONICITY vers 9/9

C'est le seul lock local résoluble immédiatement sans dépendance externe.
