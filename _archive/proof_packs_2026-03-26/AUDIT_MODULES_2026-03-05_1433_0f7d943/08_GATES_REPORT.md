# 08_GATES_REPORT — CI/Workflows/Proof Packs

**Proof Pack:** AUDIT_MODULES_2026-03-05_1433_0f7d943  
**Timestamp:** 2026-03-05T14:33:25Z

---

## Workflows GitHub Actions

```bash
$ ls .github/workflows/ | wc -l
~40 workflows
```

### Workflows Principaux

| Fichier                      | Nom/Description                        | Triggers                        | Statut   |
| ---------------------------- | -------------------------------------- | ------------------------------- | -------- |
| `ci-unified.yml`             | TITANE∞ CI/CD Unified Pipeline v26.3.0 | push/PR main, workflow_dispatch | ✅ Actif |
| `codeql.yml`                 | CodeQL Security Analysis               | push/PR/schedule                | ✅ Actif |
| `constitution-audit.yml`     | Constitution Audit                     | dispatch                        | ✅ Actif |
| `p0-surface-guard.yml`       | P0 Surface Guard                       | dispatch                        | ✅ Actif |
| `p2-contract-guard.yml`      | P2 Contract Guard                      | dispatch                        | ✅ Actif |
| `p3-build-guard.yml`         | P3 Build Guard                         | dispatch                        | ✅ Actif |
| `p4-constitution-audit.yml`  | P4 Constitution Audit                  | dispatch                        | ✅ Actif |
| `mermaid-verify.yml`         | Mermaid Diagrams Verify                | dispatch                        | ✅ Actif |
| `registry-guard.yml`         | Registry Guard                         | dispatch                        | ✅ Actif |
| `stable-build.yml`           | Stable Build                           | dispatch                        | ✅ Actif |
| `release-unified.yml`        | Release Pipeline                       | tags                            | ✅ Actif |
| `gitguardian.yml`            | Secret Scanning                        | push                            | ✅ Actif |
| `dependabot-auto-review.yml` | Dependabot Auto Review                 | PRs                             | ✅ Actif |

### Jobs du CI Unifié (`ci-unified.yml`)

| Job                  | Timeout | Description                         |
| -------------------- | ------- | ----------------------------------- |
| `lint-and-typecheck` | 15min   | ESLint + TSC + Prettier             |
| `gates-phase-0`      | 20min   | Registry, IPC-only, Seal, CSP gates |
| `frontend-tests`     | 20min   | Vitest + coverage                   |
| (autres jobs)        | ...     | Build Rust, E2E, etc.               |

---

## Proof Packs Existants

```bash
$ ls proof_packs/
AUDIT360_20260304_132822
FINAL_AUDIT_MASTER_FIX_PLAN_a0a4eeb3
FIXPACK_2026-03-04_2205_4a3ab09a5
INSTRUCTIONS_PERFECT_2026-03-04_1711_4a3ab09a5
SEAL_PROD_2026-03-03_2143_98262da88
TESTS_PERFECT_2026-03-04_2138_4a3ab09a5
TESTS_ZERO_OMISSION_2026-03-04_1300_4a3ab09a5
UI_AUTOFIX_TESTIDS_AND_IPC_SYNC_2026-03-03_2056_98262da88
UI_E2E_ULTRA_2026-03-04_1809_2555e61a8
UI_INTERACTIVE_MAP_2026-03-03_1950
ULTRA_TESTS_2026-03-04_2151_4a3ab09a5
VERDICT_REMEDIATION_2026-03-03_2033_843b00530
AUDIT_MODULES_2026-03-05_1433_0f7d943  ← (ce proof pack)
```

**12 proof packs préexistants** + ce nouveau.

---

## Registry / Preuves

```bash
$ ls registry/
REGISTRY_APPEND_TITANE_FINAL.jsonl
REGISTRY_APPEND_TITANE_Ω∞.jsonl
autofix-autoheal-rules.jsonl
chat-events.jsonl
chat-mem-phases.jsonl
repo-events.jsonl
ui-events.jsonl
```

**Observation**: Le registre `ui-events.jsonl` est utilisé pour tracer les changements UI.

---

## Docs MAP (Cartographie)

```bash
$ ls docs/ | grep "MAP_"
MAP_ARCHITECTURE_4RING.md
MAP_GATES.md
MAP_INDEX.md
MAP_IPC.md
MAP_IPC_COMMANDS.md
MAP_MERMAID_OVERVIEW.md
MAP_SURFACES_NETWORK.md
MAP_TESTS_GATES.md
```

**PASS**: Tous les artefacts obligatoires de la cartographie sont présents.

---

## Gates Identifiées

### Gates Critiques (scripts/verify/)

| Gate                             | Script                                             | Description         |
| -------------------------------- | -------------------------------------------------- | ------------------- |
| `verify:tauri-only`              | `scripts/verify/enforce-tauri-only.sh`             | Pas de serveur web  |
| `verify:online-first`            | `scripts/verify/enforce-online-first.sh`           | Réseau online-first |
| `verify:invariants-governed`     | `scripts/verify/enforce-invariants-governed.sh`    | Invariants          |
| `verify:network-guard`           | `scripts/guards/guard-network-policy.sh`           | Policy réseau       |
| `verify:instructions`            | `scripts/verify/verify-copilot-instructions.sh`    | Instructions        |
| `verify:tauri-configs`           | `scripts/verify/validate-tauri-configs.sh`         | Configs Tauri       |
| `guard:ipc-contract`             | `tests/contract/tauri-ipc-contract.test.ts`        | IPC contract        |
| `verify:seal-post-certification` | `scripts/verify/verify-seal-post-certification.sh` | Seal                |
| `verify:docs:mermaid`            | `scripts/verify/verify-mermaid-diagrams.sh`        | Mermaid             |

### AutoHeal Gates

| Gate                              | Script                                  | Règles              |
| --------------------------------- | --------------------------------------- | ------------------- |
| `G_AH_RULE_CAPTURED_FOR_EACH_FIX` | `scripts/autoheal/detect_recurrence.sh` | 3 règles existantes |
| `G_AH_RECURRENCE_GUARD_PASS`      | `scripts/autoheal/detect_recurrence.sh` | Anti-récurrence     |

---

## Gates NON PROUVÉES (BLOCKED par env)

| Gate                  | Raison                              | Impact               |
| --------------------- | ----------------------------------- | -------------------- |
| Vitest tests pass     | node_modules absent                 | BLOCKED              |
| ESLint pass           | node_modules absent                 | BLOCKED              |
| Prettier check        | node_modules absent                 | BLOCKED              |
| TypeScript check      | node_modules absent                 | BLOCKED              |
| Cargo check           | GTK libs absent                     | BLOCKED              |
| E2E desktop           | Runtime absent                      | BLOCKED_E2E_RUNTIME  |
| `verify:tauri-only`   | bash disponible mais dépend de node | NON PROUVÉ           |
| `verify:online-first` | bash disponible                     | PARTIELLEMENT PROUVÉ |

---

## Résumé Gates

| Catégorie              | Total  | PASS         | FAIL  | BLOCKED |
| ---------------------- | ------ | ------------ | ----- | ------- |
| Architecture 4-Ring    | 1      | 1 (statique) | 0     | 0       |
| Tauri-Only             | 1      | 1 (statique) | 0     | 0       |
| Version Sync           | 1      | 1            | 0     | 0       |
| Allowlist/Capabilities | 1      | 1            | 0     | 0       |
| Tests (Vitest)         | 1      | 0            | 0     | 1       |
| Build (Vite+Cargo)     | 2      | 0            | 0     | 2       |
| Lint/Format/TSC        | 3      | 0            | 0     | 3       |
| E2E Desktop            | 1      | 0            | 0     | 1       |
| **TOTAL**              | **11** | **4**        | **0** | **7**   |
