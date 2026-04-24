# 16 — ROOT CAUSES — TITANE_INFINITY

**Date:** 2026-03-14 | **HEAD:** e8b2c27b

---

## ROOT_CAUSE_01

| Field          | Value                                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ROOT_CAUSE_ID  | RC-01                                                                                                                                                        |
| DESCRIPTION    | G4 certification gate failing because P3 certification evidence files were never generated in the current branch or were not committed alongside the branch. |
| COUCHE         | Certification / Gate infrastructure                                                                                                                          |
| VÉRITÉ_TOUCHÉE | TEST_PASS != SYSTÈME_STABLE; RAPPORT_SANS_PREUVE = INVALIDE                                                                                                  |
| PROOFS_FOR     | G4 gate output explicitly lists 3 missing files: BASELINE.md, STRUCTURAL_TEST.log, STRUCTURAL_RUNS_SUMMARY.md                                                |
| PROOFS_AGAINST | None found — no evidence that these files ever existed in this branch                                                                                        |
| SCOPE          | scripts/gates/g4-provider-decision-certified.sh + missing evidence directory                                                                                 |
| PATCH_CLASS    | GENERATE: Run P3 certification process in a proper environment to produce these artifacts                                                                    |
| STATUS         | OPEN                                                                                                                                                         |

---

## ROOT_CAUSE_02

| Field          | Value                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ROOT_CAUSE_ID  | RC-02                                                                                                                                                                                 |
| DESCRIPTION    | CSP `unsafe-inline` in `script-src` is present because React/Tauri development mode injects inline scripts, and this was left in production CSP without explicit documented approval. |
| COUCHE         | Security / Tauri configuration                                                                                                                                                        |
| VÉRITÉ_TOUCHÉE | UI_PASS != CHAIN_PASS                                                                                                                                                                 |
| PROOFS_FOR     | CSP string: `"script-src 'self' 'unsafe-inline' asset: tauri:"` — python3 parse confirmed                                                                                             |
| PROOFS_AGAINST | G7 gate checks only `default-src 'self'` (not script-src specifically) and reports CSP as "restrictive" — this masks the issue                                                        |
| SCOPE          | src-tauri/tauri.conf.json script-src directive                                                                                                                                        |
| PATCH_CLASS    | CONFIG: Remove `unsafe-inline` OR document explicit approval with CSP_ALLOW_UNSAFE=1 env var and inline script inventory                                                              |
| STATUS         | OPEN                                                                                                                                                                                  |

---

## ROOT_CAUSE_03

| Field          | Value                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ROOT_CAUSE_ID  | RC-03                                                                                                                                                                            |
| DESCRIPTION    | The guardian.agent.md was created before the kernel doctrine was updated from "local-first" to "online-first governed with mandatory local fallback" and was never synchronized. |
| COUCHE         | Governance documentation                                                                                                                                                         |
| VÉRITÉ_TOUCHÉE | RAPPORT_SANS_PREUVE = INVALIDE (agents operating under wrong doctrine)                                                                                                           |
| PROOFS_FOR     | guardian.agent.md line 7: "local-first" as non-negotiable; kernel: "compatibility marker only"; TERMINOLOGY_ALIGNMENT_FINAL.md explicitly forbids "local-first only"             |
| PROOFS_AGAINST | verify_instructions.sh does not scan copilot-agents/ directory — this drift went undetected                                                                                      |
| SCOPE          | .github/copilot-agents/guardian.agent.md line 7                                                                                                                                  |
| PATCH_CLASS    | EDIT: One-line fix to align wording with kernel                                                                                                                                  |
| STATUS         | OPEN — Quick fix possible                                                                                                                                                        |

---

## ROOT_CAUSE_04

| Field          | Value                                                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ROOT_CAUSE_ID  | RC-04                                                                                                                                                                                                |
| DESCRIPTION    | E2E test suite does not assert answer quality (is_useful, answer_matches_question) — only presence of response text. The `is_useful` field exists in the SQLite schema but no E2E test validates it. |
| COUCHE         | E2E / Quality assurance                                                                                                                                                                              |
| VÉRITÉ_TOUCHÉE | TEXT_NON_VIDE != RÉPONSE_UTILE                                                                                                                                                                       |
| PROOFS_FOR     | grep of e2e/ and tests/ for `answer_is_useful`, `answer_matches_question` → 0 results; `is_useful` only found in DB schema definitions                                                               |
| PROOFS_AGAINST | Some E2E tests like `feedback-loop.spec.ts` may test quality implicitly — content unknown                                                                                                            |
| SCOPE          | e2e/ test suite                                                                                                                                                                                      |
| PATCH_CLASS    | ADD: E2E assertions validating that AI responses are non-trivial, relevant to prompt, and marked is_useful                                                                                           |
| STATUS         | OPEN — Architectural gap                                                                                                                                                                             |

---

## ROOT_CAUSE_05

| Field          | Value                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ROOT_CAUSE_ID  | RC-05                                                                                                                                                                    |
| DESCRIPTION    | ripgrep (`rg`) is not installed in the CI/audit environment, causing gate scripts that use `rg` to fall back silently or skip checks. This creates phantom PASS results. |
| COUCHE         | CI / Tooling                                                                                                                                                             |
| VÉRITÉ_TOUCHÉE | TEST_PASS != SYSTÈME_STABLE                                                                                                                                              |
| PROOFS_FOR     | Multiple gates output `"rg: command not found"` — G1, G2, G3 all hit this                                                                                                |
| PROOFS_AGAINST | Gates still PASS because they have grep fallbacks or the checks being skipped are non-critical                                                                           |
| SCOPE          | CI environment; gates using rg                                                                                                                                           |
| PATCH_CLASS    | INSTALL: `apt install ripgrep` in CI; OR replace rg with grep in gate scripts                                                                                            |
| STATUS         | OPEN — Low risk but CI quality concern                                                                                                                                   |

---

## ROOT_CAUSE_06

| Field          | Value                                                                                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ROOT_CAUSE_ID  | RC-06                                                                                                                                                                                                                 |
| DESCRIPTION    | Autoheal entries AH-0158→0162 have empty description/status fields. This is likely because they were created with a template that didn't fill the fields, or a bulk autoheal operation that created skeleton entries. |
| COUCHE         | AutoHeal system                                                                                                                                                                                                       |
| VÉRITÉ_TOUCHÉE | RAPPORT_SANS_PREUVE = INVALIDE                                                                                                                                                                                        |
| PROOFS_FOR     | python3 parse of last 5 entries shows empty strings for description and status                                                                                                                                        |
| PROOFS_AGAINST | detect_recurrence.sh still PASS — entries are valid JSON even if empty                                                                                                                                                |
| SCOPE          | scripts/autoheal/autoheal_rules.jsonl lines 185-189                                                                                                                                                                   |
| PATCH_CLASS    | EDIT: Fill in description and status for the 5 empty entries                                                                                                                                                          |
| STATUS         | OPEN — Low risk                                                                                                                                                                                                       |
