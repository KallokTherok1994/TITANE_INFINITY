# Rollback Plan — LOCK C3 Research Truth Engine

**Lock:** C3  
**Date:** 2026-05-06  
**Mode:** DURABLE  

## Scope

All changes in this lock are **additive** and **passive** (T3 flag-gated). No runtime behavior was activated.

## Rollback Steps

### 1. Contract extension rollback

```bash
# Remove v11 sidecar additions (additive block after original line 303)
git restore src/services/research_truth/ResearchTruthContract.ts
```

### 2. Tests rollback

```bash
git restore src/services/research_truth/__tests__/ResearchTruthContract.test.ts
```

### 3. Docs rollback

```bash
git restore docs/research/
# Or delete if created in this session:
rm -rf docs/research/RESEARCH_TRUTH_ENGINE_CONTRACT.md docs/research/RESEARCH_TRUTH_POLICY.md
```

### 4. Validator rollback

```bash
git restore scripts/verify/verify_research_truth_engine.sh
# Or delete:
rm scripts/verify/verify_research_truth_engine.sh
```

### 5. Registries rollback

```bash
git restore docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md
git restore docs/registry/TITANE_TEST_REGISTRY.md
git restore docs/registry/TITANE_RUNTIME_FEATURE_FLAGS.md
git restore docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md
git restore docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md
```

### 6. AutoHeal rollback

Remove last line from `scripts/autoheal/autoheal_rules.jsonl` (entry `LOCK_C3_RESEARCH_TRUTH_ENGINE_2026_05_06`).

```bash
# Remove last JSONL line:
sed -i '$d' scripts/autoheal/autoheal_rules.jsonl
```

### 7. Proof pack cleanup

```bash
rm -rf proof_packs/LOCK_C3_RESEARCH_TRUTH_ENGINE_2026-05-06/
```

## Impact Assessment

- **Runtime impact:** NONE — C3 is T3 flag-gated, `VITE_TITANE_C3_RESEARCH_TRUTH` defaults to `false`.
- **User-visible impact:** NONE — contract is passive (no live inference path activated).
- **Data impact:** NONE — no knowledge content was modified.
- **IPC impact:** NONE — no new Tauri commands added.

## Verification After Rollback

```bash
pnpm vitest run src/services/research_truth/__tests__/ResearchTruthContract.test.ts
# Expected: 31/31 PASS (back to base state)
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```
