# 10 — NON_SEALED_FAMILY_MATRIX — TITANE_INFINITY

> Updated: 2026-04-02 vΩ.FINAL | Mode: AUDIT_PLUS_SENTINEL

---

## Familles non scellées — classification complète (mise à jour)

| Famille | État | Rupture exacte | Pourquoi non scellée | Preuve manquante | Type de blocage | Next lock | Action locale honnête ? |
|---------|------|----------------|---------------------|-----------------|----------------|-----------|------------------------|
| ~~RELEASE_TRUTH~~ | ~~FALSE_GREEN_RISK~~ | ~~MANIFEST version~~ | ✅ RÉSOLU session précédente | — | — | — | — |
| ~~GATES_MONOTONICITY~~ | ~~8/9~~ | ~~G9 FAIL~~ | ✅ RÉSOLU session précédente | — | — | — | — |
| ~~SBOM_EXPORT~~ | ~~UNKNOWN~~ | ~~SBOM stale + pas de SPDX~~ | ✅ RÉSOLU cette session | — | — | — | — |
| SECRET_SCANNING | UNKNOWN | Pas d'accès API GitHub | Non confirmé GitHub-native | Confirmation API/UI | EXTERNAL | Owner confirme via Settings | NON (HOLD_EXTERNAL) |
| PUSH_PROTECTION | UNKNOWN | Pas d'accès API GitHub | Non confirmé GitHub-native | Confirmation API/UI | EXTERNAL | Owner confirme via Settings | NON (HOLD_EXTERNAL) |
| RULESETS_BRANCH_PROTECTION | DECLARED_ONLY | Pas de confirmation API | CODEOWNERS présent mais enforcement inconnu | branch_protection API | EXTERNAL | Owner confirme rulesets | NON (HOLD_EXTERNAL) |
| ATTESTATION_VERIFICATION | UNKNOWN | Aucune release déclenchée | Step présent, jamais exécuté | Release réelle + vérification attestation | ENV | Déclencher une release tag v* | NON (HOLD_ENV) |
| REUSABLE_WORKFLOWS_TRUST | UNKNOWN | Pas d'analyse | Workflows reusables non audités | Audit caller/callee | LOCAL | Analyser appels workflow_call | OUI |
| FINAL_GLOBAL_SEAL | NON REVENDIQUÉ | Multiple familles non résolues | Règle monotonie globale | Résoudre toutes familles critiques | MULTIPLE | Séquencer les locks | PARTIEL |

---

## Blocages par type (état post vΩ.FINAL)

| Type | Familles | Action |
|------|----------|--------|
| LOCAL | ~~RELEASE_TRUTH, GATES_MONOTONICITY, SBOM_EXPORT~~ → ✅ tous résolus | — |
| ENV | ATTESTATION_VERIFICATION | Nécessite CI actif |
| EXTERNAL | SECRET_SCANNING, PUSH_PROTECTION, RULESETS | Nécessite owner GitHub |
| TRUST_GRADE | ATTESTATION_VERIFICATION | Nécessite vérification runtime |

---

## Prochain lock causal unique

**Aucun lock local restant.** Tous les locks locaux ont été résolus (MANIFEST + SBOM).

**HOLD_EXTERNAL** : Les familles restantes nécessitent une action du propriétaire GitHub :
- Confirmer secret scanning + push protection dans GitHub Security Settings
- Confirmer branch protection + rulesets
- Déclencher une release pour valider l'attestation

**REUSABLE_WORKFLOWS_TRUST** reste un lock local potentiel pour la session suivante.
