# Lock C2 — Knowledge Governance — Authority Map

## Ownership

| Dimension | Owner |
|---|---|
| Contract design | titane-conductor |
| Test design (C2-UNIT-01..08) | titane-conductor |
| Governance index seed entries | titane-conductor |
| Validator bash script | titane-conductor |
| Registry updates | titane-conductor |
| Content immutability enforcement | INVARIANT (kernel) |

## Ring Classification

| Surface | Ring | Boundary |
|---|---|---|
| `KnowledgeGovernanceContract.ts` | Ring 3 (service/engine) | Pure TS, no IPC, no runtime activation |
| `KNOWLEDGE_GOVERNANCE_INDEX.json` | T2 bounded data | Read-only sidecar, no network |
| `docs/knowledge/` | Documentation | No runtime surface |
| `scripts/verify/verify_knowledge_governance.sh` | Tooling | Validator only, no production path |

## IPC Impact

**NONE.** C2 adds no new IPC commands. No allowlist changes. No Rust changes.

## Feature Flag

`FF-C2 / VITE_TITANE_C2_KNOWLEDGE_GOVERNANCE` — T2 passive boundary.  
The sidecar governance index is read-only and requires no runtime activation.  
The policy enforcement functions are pure TypeScript and execute only when called explicitly.

## Desktop E2E Lane

`AI-DESKTOP-08` — Knowledge governance metadata used — **SCAFFOLDED** (blocker: E0 desktop execution authority).  
Contract + index + 77 tests complete. E2E spec skeleton in `e2e/advanced-intelligence/`.

## Agents Involved

- `titane-conductor` — primary (contract, tests, governance)
- `docs-registry` — registry sync verification
- `e2e-authority` — AI-DESKTOP-08 scaffolding (pending E0)
