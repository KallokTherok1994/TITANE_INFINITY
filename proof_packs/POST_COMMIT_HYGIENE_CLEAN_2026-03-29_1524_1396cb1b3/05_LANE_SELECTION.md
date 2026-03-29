# P1.16 — LANE SELECTION

## Lane Router

| Lane | Label | Trigger |
|------|-------|---------|
| A | ENV_CLASSIFICATION_ONLY | Env gates absent, no mutation possible |
| **B** | **CLEAN_PROVEN_GARBAGE** | **Garbage artifacts identified, deletion safe** |
| C | APPLY_BOUNDED_FIX | Product code fix needed |
| D | TARGET_OR_ENV_BLOCKED | Cannot proceed without external action |

---

## Selection Rationale

**Selected: LANE B — CLEAN_PROVEN_GARBAGE**

| Gate | Value | Notes |
|------|-------|-------|
| Garbage clearly identified? | YES | 25 files across Groups A/B/C |
| All garbage 0-byte or partial-write? | YES | Largest is 2302B, no complete content |
| Any file has recovery value? | NO | All are truncated paths or 0-byte stubs |
| Local-only boundaries exist? | YES | `.claude/` + `PLANS/` → GITIGNORE |
| Intentional tracked files exist? | YES | `documentation/` → TRACK |
| Product code reopen needed? | NO | Hygiene only |
| External env required? | NO | Pure local filesystem operations |

**Lane B is the correct selection.** All mutations are local, reversible, and scoped to proven-garbage cleanup + boundary enforcement.

---

## Scope Constraints

- **NO_PRODUCT_REOPEN**: Do not touch any `.rs`, `.ts`, `.tsx` files
- **NO_FAKE_CLEANUP**: Only delete files confirmed as garbage (0-byte or proven partial write)
- **BOUNDARY-FIRST**: Document `.claude/` and `PLANS/` boundaries before deleting or ignoring
- **DISCOVERY_FIRST**: Bootstrap + classification complete before any mutation (✓)
