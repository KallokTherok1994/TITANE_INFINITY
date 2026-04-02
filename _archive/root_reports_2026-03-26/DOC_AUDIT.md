# TITANE∞ — DOC AUDIT

**Version:** 28.0.0  
**Status:** PARTIAL  
**Date:** 2026-03-17

> Audit of all documentation files in the repository.
> For each file: path, language, purpose, authority level, action, reason, replacement path, legacy banner needed.

---

## Legend

| Action   | Meaning                                |
| -------- | -------------------------------------- |
| KEEP     | Keep as-is                             |
| REWRITE  | Needs substantial rewrite for accuracy |
| SPLIT    | Should be split into multiple docs     |
| MERGE    | Should be merged with another doc      |
| REDIRECT | Keep with legacy banner + redirect     |
| ARCHIVE  | Move to archive with banner            |

| Authority | Meaning                                  |
| --------- | ---------------------------------------- |
| CANONICAL | Single source of truth for its topic     |
| SECONDARY | Useful reference but not primary         |
| LEGACY    | Historical, not current                  |
| AUDIT     | Internal audit artifact, not user-facing |

---

## ROOT LEVEL

| Path                     | Language   | Purpose            | Authority | Action           | Reason                            | Replacement | Banner needed |
| ------------------------ | ---------- | ------------------ | --------- | ---------------- | --------------------------------- | ----------- | ------------- |
| `README.md`              | FR (mixed) | Main entry point   | CANONICAL | KEEP             | Primary surface, version accurate | —           | NO            |
| `CHANGELOG.md`           | EN         | Change history     | CANONICAL | KEEP             | Version authority corroboration   | —           | NO            |
| `CONTRIBUTING.md`        | —          | Contribution guide | SECONDARY | KEEP (if exists) | —                                 | —           | NO            |
| `SECURITY.md`            | —          | Security policy    | SECONDARY | KEEP (if exists) | —                                 | —           | NO            |
| `LICENSE.md`             | EN         | License            | CANONICAL | KEEP             | Legal                             | —           | NO            |
| `COMMANDS_INVENTORY.md`  | EN         | Commands audit     | AUDIT     | KEEP             | New audit artifact                | —           | NO            |
| `DOC_AUDIT.md`           | EN         | Doc audit          | AUDIT     | KEEP             | This file                         | —           | NO            |
| `GLOSSARY_FR_EN_LOCK.md` | EN         | Bilingual lock     | CANONICAL | KEEP             | New governance artifact           | —           | NO            |
| `LINKS_VALIDATION.md`    | EN         | Link validation    | AUDIT     | KEEP             | New audit artifact                | —           | NO            |

---

## docs/ ROOT

| Path                                   | Language | Purpose             | Authority | Action   | Reason                           | Replacement                             | Banner needed        |
| -------------------------------------- | -------- | ------------------- | --------- | -------- | -------------------------------- | --------------------------------------- | -------------------- |
| `docs/README.md`                       | FR       | Docs hub            | CANONICAL | KEEP     | Version accurate (28.0.0)        | —                                       | NO                   |
| `docs/INDEX.md`                        | FR       | Old index           | LEGACY    | REDIRECT | Superseded by INDEX_FR.md        | `docs/INDEX_FR.md`                      | YES                  |
| `docs/INDEX_FR.md`                     | FR       | FR index            | CANONICAL | KEEP     | New canonical index              | —                                       | NO                   |
| `docs/INDEX_EN.md`                     | EN       | EN index            | CANONICAL | KEEP     | New canonical index              | —                                       | NO                   |
| `docs/ARCHITECTURE.md`                 | FR       | Architecture        | SECONDARY | KEEP     | Valuable but older (v8.0 title)  | `docs/dev/fr/architecture.md`           | NO (already partial) |
| `docs/GETTING_STARTED.md`              | FR/EN    | Old getting started | LEGACY    | REDIRECT | Version v24.2.0, outdated        | `docs/dev/fr/setup-environnement.md`    | YES                  |
| `docs/IPC_CONTRACT.md`                 | FR       | IPC contract        | CANONICAL | KEEP     | Precise, referenced everywhere   | —                                       | NO                   |
| `docs/INVARIANTS_TITANE.md`            | FR       | System invariants   | LEGACY    | KEEP     | Historical, v19.3Ω, still useful | Note: pre-28.x baseline                 | Add version note     |
| `docs/TESTING_STRATEGY.md`             | EN       | Testing strategy    | SECONDARY | KEEP     | Referenced, partial accuracy     | `docs/dev/en/tests-proofs-and-gates.md` | NO                   |
| `docs/PROVIDERS.md`                    | EN       | AI providers        | SECONDARY | KEEP     | Still relevant                   | —                                       | NO                   |
| `docs/DEPLOYMENT.md`                   | —        | Deployment          | SECONDARY | KEEP     | Referenced                       | —                                       | NO                   |
| `docs/SECURITY.md`                     | EN       | Security            | SECONDARY | KEEP     | Referenced                       | `docs/governance/en/policies.md`        | NO                   |
| `docs/FAQ.md`                          | —        | Old FAQ             | LEGACY    | REDIRECT | Superseded by user/fr/faq.md     | `docs/user/fr/faq.md`                   | YES                  |
| `docs/MODULES.md`                      | EN       | Modules             | SECONDARY | KEEP     | Useful reference                 | —                                       | NO                   |
| `docs/MAP_ARCHITECTURE_4RING.md`       | FR       | 4-Ring map          | SECONDARY | KEEP     | Specific, referenced             | `docs/dev/fr/architecture.md`           | NO                   |
| `docs/MAP_GATES.md`                    | FR       | Gates map           | SECONDARY | KEEP     | Referenced                       | `docs/governance/fr/gates.md`           | NO                   |
| `docs/MAP_IPC.md`                      | FR       | IPC map             | SECONDARY | KEEP     | Referenced                       | —                                       | NO                   |
| `docs/MAP_IPC_COMMANDS.md`             | FR       | IPC commands map    | SECONDARY | KEEP     | Referenced                       | —                                       | NO                   |
| `docs/MAP_TESTS_GATES.md`              | FR       | Tests/gates map     | SECONDARY | KEEP     | Referenced                       | `docs/dev/fr/tests-preuves-et-gates.md` | NO                   |
| `docs/REPAIR_PLAYBOOK.md`              | EN       | Repair playbook     | SECONDARY | KEEP     | Referenced                       | `docs/dev/fr/depannage-dev.md`          | NO                   |
| `docs/ROLLBACK_INSTRUCTIONS_UPDATE.md` | EN       | Rollback            | SECONDARY | KEEP     | Referenced                       | `docs/governance/en/rollback.md`        | NO                   |
| `docs/OMEGA_v2_SPEC.md`                | EN       | OMEGA pipeline spec | SECONDARY | KEEP     | Technical spec                   | —                                       | NO                   |

---

## docs/user/ (existing flat structure)

| Path                        | Language | Purpose          | Authority | Action   | Reason                                 | Replacement                                  | Banner needed |
| --------------------------- | -------- | ---------------- | --------- | -------- | -------------------------------------- | -------------------------------------------- | ------------- |
| `docs/user/README.md`       | FR       | Old user README  | LEGACY    | REDIRECT | Version 19.4.3, "100% local" overclaim | `docs/user/fr/README.md`                     | YES           |
| `docs/user/installation.md` | FR       | Old installation | LEGACY    | REDIRECT | Version mismatch                       | `docs/user/fr/installation.md`               | YES           |
| `docs/user/quickstart.md`   | FR       | Old quickstart   | LEGACY    | REDIRECT | Outdated                               | `docs/user/fr/demarrage-rapide.md`           | YES           |
| `docs/user/faq.md`          | FR       | Old FAQ          | LEGACY    | REDIRECT | Superseded                             | `docs/user/fr/faq.md`                        | YES           |
| `docs/user/features/`       | FR       | Feature docs     | SECONDARY | KEEP     | Still relevant content                 | `docs/user/fr/fonctionnalites-et-centres.md` | NO            |
| `docs/user/tutorials/`      | —        | Tutorials        | SECONDARY | KEEP     | Supplementary                          | —                                            | NO            |

---

## docs/governance/ (existing flat structure)

| Path                                                  | Language | Purpose             | Authority | Action | Reason               | Replacement                      | Banner needed |
| ----------------------------------------------------- | -------- | ------------------- | --------- | ------ | -------------------- | -------------------------------- | ------------- |
| `docs/governance/ANTI-RECURSIVE_SYSTEM_RULE.md`       | EN       | Anti-recursive rule | SECONDARY | KEEP   | Governance reference | `docs/governance/en/policies.md` | NO            |
| `docs/governance/GOVERNANCE_PATTERN_LESSONS.md`       | EN       | Pattern lessons     | SECONDARY | KEEP   | Lessons learned      | —                                | NO            |
| `docs/governance/POST_GOVERNANCE_REFOCUS.md`          | EN       | Refocus doc         | SECONDARY | KEEP   | Historical context   | —                                | NO            |
| `docs/governance/UI_NAVIGATION_CONSTITUTION.md`       | EN       | UI constitution     | SECONDARY | KEEP   | Referenced           | —                                | NO            |
| `docs/governance/UI_GOVERNED_FIX_vΩ3_FINAL_REPORT.md` | EN       | Fix report          | AUDIT     | KEEP   | Historical proof     | —                                | NO            |

---

## docs/reference/ (existing)

| Path                                     | Language | Purpose            | Authority | Action   | Reason                  | Replacement                               | Banner needed |
| ---------------------------------------- | -------- | ------------------ | --------- | -------- | ----------------------- | ----------------------------------------- | ------------- |
| `docs/reference/TAURI_COMMANDS_v26.2.md` | EN       | Old Tauri commands | LEGACY    | REDIRECT | Version v26.2, outdated | `docs/reference/en/commands-reference.md` | YES           |

---

## SUMMARY

| Action   | Count                                  |
| -------- | -------------------------------------- |
| KEEP     | ~200+ (most historical docs kept)      |
| REDIRECT | ~10 (key docs superseded by canonical) |
| ARCHIVE  | 0 (no deletion)                        |
| REWRITE  | 0 (new canonical docs created instead) |

**Key redirects needed (legacy banners):**

1. `docs/user/README.md` → `docs/user/fr/README.md`
2. `docs/GETTING_STARTED.md` → `docs/dev/fr/setup-environnement.md`
3. `docs/INDEX.md` → `docs/INDEX_FR.md`
4. `docs/user/installation.md` → `docs/user/fr/installation.md`
5. `docs/user/quickstart.md` → `docs/user/fr/demarrage-rapide.md`
6. `docs/user/faq.md` → `docs/user/fr/faq.md`
7. `docs/FAQ.md` → `docs/user/fr/faq.md`
8. `docs/reference/TAURI_COMMANDS_v26.2.md` → `docs/reference/fr/commandes-reference.md`

---

_Generated: 2026-03-17 | Authority: repo audit_
