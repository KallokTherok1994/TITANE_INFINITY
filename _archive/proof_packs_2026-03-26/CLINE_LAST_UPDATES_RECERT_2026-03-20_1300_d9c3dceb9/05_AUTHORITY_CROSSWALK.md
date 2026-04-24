# 05 — AUTHORITY CROSSWALK

## Crosswalk Matrix

| Layer                                                | Source-of-Truth | Runtime Role                            | Allowed Authority Level | Contradiction Risk         |
| ---------------------------------------------------- | --------------- | --------------------------------------- | ----------------------- | -------------------------- |
| Copilot kernel (`.github/copilot-instructions.md`)   | YES — canonical | Constitutional kernel, all sessions     | L1 - maximum authority  | NONE                       |
| CLINE active rules (`.clinerules/00-kernel.md`)      | NO — mirror     | Operationalize Copilot in CLINE runtime | L2 - mirror only        | LOW (self-declares mirror) |
| CLINE hooks (`hooks/TaskStart`, `PostToolUse`, etc.) | NO — enforce    | Runtime enforcement of mirror rules     | L3 - enforcement        | LOW                        |
| `AGENTS.md` (per path)                               | NO — compat     | Path-scoped compatibility               | L4 - scoped             | NONE                       |
| `.github/instructions/*.instructions.md`             | NO — scoped     | Copilot scoped instructions             | L2 - scoped             | NONE                       |
| `.github/prompts/*.prompt.md`                        | NO — guides     | Workflow prompts                        | L4 - advisory           | NONE                       |
| `scripts/autoheal/autoheal_rules.jsonl`              | NO — record     | AutoHeal learning data                  | L5 - data               | NONE                       |
| Proof packs (`proof_packs/**`)                       | NO — evidence   | Historical evidence only                | L5 - evidence           | NONE                       |

## Contradiction Check

- Copilot ↔ Cline kernel: NO CONTRADICTION. `00-kernel.md` explicitly cites `.github/copilot-instructions.md` as canonical.
- Cline kernel ↔ AGENTS.md: NO CONTRADICTION. AGENTS.md is path-scoped compatibility only.
- Hooks ↔ kernel rules: NO CONTRADICTION. Hooks enforce kernel rules, do not redefine them.
- Historical verdicts (now archived): RESOLVED by moving to proof pack. No longer competing.

## Authority Drift: NOT DETECTED
