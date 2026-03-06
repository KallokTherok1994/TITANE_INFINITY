# 06 — DOUBLONS ET CONTRADICTIONS
## FINAL_CONSOLIDATION_FRONTEND_BACKEND_2026-03-06_1450_29f9fe0

---

## Doublons de rapports

### Packs doublons identifiés

| Pack | Doublon de | Action |
|------|-----------|--------|
| `OPTION1_LIBSQL_TESTS_2026-03-05_1252_f0ec87ead` | `OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead` | IGNORE — doublon à 1 minute d'écart |
| `CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729` | Sessions UI/E2E antérieures | IGNORE — antérieur aux audits fusion |
| `FINAL_AUDIT_MASTER_FIX_PLAN_a0a4eeb3` | `FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5` | DOWNGRADE — le VERDICT est plus récent |

### Preuves partielles mal interprétées comme complètes

| Preuves | Description | Statut réel |
|---------|-------------|-------------|
| Gate G_COMMANDS_TRUTH = PASS dans AUDIT_1416 | Était PASS uniquement pour les cp_* corrigés | Maintenant PASS global après sessions 2+3 |
| Gate G_E2E dans packs antérieurs | Marqué BLOCKED_E2E_RUNTIME | Toujours BLOCKED sans binaire Tauri |

---

## Contradictions entre preuves

**Aucune contradiction majeure** n'a été détectée.

### Clarifications de non-contradiction

| Surface | Pack A | Pack B | Clarification |
|---------|--------|--------|--------------|
| IPC contract | AUDIT_1416 (PASS) | FINAL_AUDIT_VERDICT_2026-03-05 | Vérifications complémentaires — le contract est effectivement conforme |
| Rust build | CONTINUE_1439 (non testé) | FINAL_AUDIT_VERDICT_2026-03-05 (PASS) | Build précédent passait avant nos ajouts — à re-vérifier en CI |
| Commandes cp_* | `handlers.rs` (semble enregistré) | `main.rs` (non enregistré avant correction) | `handlers.rs` contient du code mort — `main.rs` est la source de vérité |

---

## Sources dégradées (DOWNGRADE)

| Source | Raison | Niveau |
|--------|--------|--------|
| `handlers.rs` macro `generate_titane_handlers!` | Code mort — induit en erreur les développeurs | Annotée P2, non supprimée |
| `proof_packs/FINAL_AUDIT_MASTER_FIX_PLAN_a0a4eeb3/` | Supplanté par les audits récents | HISTORICAL |
| `proof_packs/VERDICT_REMEDIATION_*` | Supplanté par le VERDICT 2026-03-05 | HISTORICAL |
| `proof_packs/SEAL_PROD_2026-03-03_*` | Antérieur à de nombreux changements | HISTORICAL |

---

## Résolution des contradictions

Aucune action de correction requise pour les contradictions.
Les non-contradictions sont documentées.
La source de vérité canonique est définie dans `04_CONSOLIDATED_TRUTH_MODEL.md`.
