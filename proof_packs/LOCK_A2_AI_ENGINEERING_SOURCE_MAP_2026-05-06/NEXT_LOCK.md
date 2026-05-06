# NEXT_LOCK — Lock A2

**Lock**: A2  
**Date**: 2026-05-06  
**Status**: CLEAN  
**Commit**: TBD (pending commit in this lock closure)

---

## B0 Authorization

**NEXT_LOCK**: B0 — Eval Champion Realignment  
**B0_ALLOWED**: YES  

### Prerequisites Confirmed

- [x] A2 VERDICT = CLEAN
- [x] 12 sources created (all 12 required categories covered)
- [x] No fabricated sources
- [x] verify_instructions.sh PASS=51
- [x] detect_recurrence.sh PASS

### B0 Scope

Lock B0 — Eval Champion Realignment (T1):
- Detect champion drift (all 6 existing scorecards pinned to v28.0.0 — 5 major versions behind)
- Create 12 new scorecard stubs in `evals/scorecards/`: INTELLIGENCE_TRUTH, COGNITIVE_CORE_TRUTH, KEVIN_AXIS, RESEARCH_TRUTH, AGENT_EFFECTIVENESS, PROVIDER_ROUTING_TRUTH, MEMORY_RETRIEVAL_QUALITY, KNOWLEDGE_GOVERNANCE, OMEGA_HANDLER_REALITY, SINGULARITY_MEASUREMENT, TWIN_CONSENT, SELF_IMPROVEMENT_GOVERNANCE
- Each stub must reference a source_id from `docs/research/AI_ENGINEERING_SOURCE_MAP.md`
- Each stub must use CHALLENGER_TEMPLATE.json as base format
- Do NOT change existing scorecard champion commits (backward-compatible stubs only)
- Run `bash scripts/verify/verify_evals_scaffold.sh` — must pass after
- Run `bash scripts/verify_instructions.sh` and `bash scripts/autoheal/detect_recurrence.sh`

### Hard Stoplines for B0

1. If verify_evals_scaffold fails after adding stubs: BLOCKED_EVAL_AUTHORITY
2. If CHALLENGER_TEMPLATE schema changes break existing scorecard format: BLOCKED — revert
3. Champion commit history for existing scorecards must not be changed
