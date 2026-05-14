# Lock C2 — Knowledge Governance — Desktop Lane Linkage

## AI-DESKTOP-08 Status

**Lane ID:** AI-DESKTOP-08  
**Description:** Knowledge governance metadata used  
**Lock dependency:** C2/E0  
**Current status:** SCAFFOLDED  
**Blocker:** E0 desktop execution authority not yet granted  

## What is Complete (C2 side)

- `KnowledgeGovernanceContract.ts` — sidecar policy enforcement functions (7)
- `KNOWLEDGE_GOVERNANCE_INDEX.json` — 8 seed entries, all required domains
- 77 unit tests (C2-UNIT-01..08) — all PASS
- Desktop harness scaffold: `e2e/advanced-intelligence/` spec skeleton exists

## What Requires E0

- Full desktop app launch in E0 execution authority
- Playwright E2E spec execution against running Tauri instance
- Log capture: `DESKTOP_E2E.log` evidence
- Screenshot proof of governance metadata access in UI (if surface is visible)

## E2E Spec Location

```
e2e/advanced-intelligence/
  └── knowledge-governance.spec.ts  (scaffold pending E0 verification)
```

## Linkage to Registry

| Registry | Entry | Status |
|---|---|---|
| `TITANE_DESKTOP_E2E_REGISTRY.md` | AI-DESKTOP-08 | SCAFFOLDED |
| `TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md` | REG-AI-C2 | CLEAN |

## Activation Condition

AI-DESKTOP-08 moves from SCAFFOLDED → EXECUTED when:
1. E0 desktop execution authority is granted
2. `pnpm run test:e2e:advanced-intelligence` passes with AI-DESKTOP-08 evidence
3. DESKTOP_E2E.log contains governance metadata proof
