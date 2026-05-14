# Lock C2 — Knowledge Governance — Rollback Plan

## Rollback Scope

C2 is a **pure sidecar layer**. Knowledge content in `data/knowledge_base/default/` (277 files) was **never modified**.
Rollback only affects: governance contract extension, governance index, docs, tests.

## Rollback Commands

```bash
# 1. Revert governance contract to base (41-test version)
git restore src/services/knowledge_governance/KnowledgeGovernanceContract.ts

# 2. Revert tests to 41-test version
git restore src/services/knowledge_governance/__tests__/KnowledgeGovernanceContract.test.ts

# 3. Remove governance index (sidecar — no content impact)
git restore data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json
# Or if not tracked:
rm -f data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json

# 4. Remove docs/knowledge (new directory)
git rm -rf docs/knowledge/

# 5. Remove validator
git restore scripts/verify/verify_knowledge_governance.sh

# 6. Remove audit report
git restore reports/knowledge_governance_audit.md

# 7. Revert registries to C1 state
git restore docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md
git restore docs/registry/TITANE_TEST_REGISTRY.md
git restore docs/registry/TITANE_RUNTIME_FEATURE_FLAGS.md
git restore docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md
git restore docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md
```

## Content Safety Guarantee

```
INVARIANT: data/knowledge_base/default/ — NEVER modified.
No knowledge content was rewritten, moved, or deleted during C2.
Rollback of sidecar governance has zero impact on content accessibility.
```

## Verification After Rollback

```bash
pnpm vitest run src/services/knowledge_governance/__tests__/KnowledgeGovernanceContract.test.ts
# Expected: PASS=41 (base contract only)

bash scripts/verify_instructions.sh
# Expected: PASS=51 FAIL=0
```
