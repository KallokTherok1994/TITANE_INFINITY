# Lock C2 — Knowledge Governance — Files Changed

## New Files Created

| File | Purpose |
|---|---|
| `data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json` | Sidecar governance index — 8 seed entries, all required domains covered |
| `docs/knowledge/KNOWLEDGE_GOVERNANCE_POLICY.md` | Human-readable governance policy (12 sections) |
| `docs/knowledge/KNOWLEDGE_GOVERNANCE_SCHEMA.md` | Schema reference for KnowledgeItemMetadata and KnowledgeGovernanceIndex |
| `scripts/verify/verify_knowledge_governance.sh` | Bash validator (13 checks) |
| `reports/knowledge_governance_audit.md` | Audit report for C2 |
| `docs/roadmap/C2_INGRESS_AUDIT.md` | Ingress audit — C2_PARTIAL_COMMITTED classification + normalization plan |

## Modified Files

| File | Change | Content Immutable? |
|---|---|---|
| `src/services/knowledge_governance/KnowledgeGovernanceContract.ts` | Additive extension: +sidecar types, +schemas, +policy functions. Original 240 lines untouched. | Yes (original unchanged) |
| `src/services/knowledge_governance/__tests__/KnowledgeGovernanceContract.test.ts` | Added 36 tests (C2-UNIT-01..08). Original 41 tests untouched. | Yes (original unchanged) |
| `docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md` | Lock: C1→C2; REG-AI-C2 row added | N/A |
| `docs/registry/TITANE_TEST_REGISTRY.md` | Lock: C1→C2; TREG-009 row added | N/A |
| `docs/registry/TITANE_RUNTIME_FEATURE_FLAGS.md` | Lock: C1→C2; FF-C2 row added | N/A |
| `docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md` | AI-DESKTOP-08 status: PLANNED→SCAFFOLDED | N/A |
| `docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md` | C2 row filled with commit/proof/validators | N/A |
| `scripts/autoheal/autoheal_rules.jsonl` | LOCK_C2_KNOWLEDGE_GOVERNANCE_2026_05_06 entry appended | N/A |
| `proof_packs/LOCK_C2_KNOWLEDGE_GOVERNANCE_2026-05-06/VERDICT.md` | Updated with all sidecar deliverables, full gate table | N/A |

## Not Modified (INVARIANT)

- `data/knowledge_base/default/` — 277 knowledge files — **NEVER modified**
- `src-tauri/` — no Rust changes in C2
- `src/components/` — no UI changes in C2
- Any existing governance contract logic (original 240 lines preserved)
