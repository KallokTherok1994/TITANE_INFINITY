# NEXT_LOCK — Lock A1

**Lock**: A1  
**Date**: 2026-05-06  
**Status**: DRIFT_FOUND_FIXED  
**Commit**: TBD (pending commit in this lock closure)

---

## A2 Authorization

**NEXT_LOCK**: A2 — External AI Engineering Source Map  
**A2_ALLOWED**: YES  

### Prerequisites Confirmed

- [x] A1 VERDICT = DRIFT_FOUND_FIXED (addressable drift fixed)
- [x] verify_instructions.sh PASS=51
- [x] detect_recurrence.sh PASS
- [x] README.md patched to reflect accurate version state
- [x] RELEASE_SURFACE_INVENTORY.md current-status note appended
- [x] docs/reports/VERSION_RELEASE_AUTHORITY_MATRIX.md created
- [x] A1 proof pack complete (7 files)
- [x] AutoHeal entry appended

### A2 Scope

Lock A2 — External AI Engineering Source Map (T0/T1):
- Required file: `docs/research/AI_ENGINEERING_SOURCE_MAP.md`
- Required categories: LLM eval, RAG eval, agent orchestration, LLM observability, AI governance/safety, tool-use reliability, memory architectures, knowledge freshness, model routing, prompt/instruction governance, security/prompt injection, red teaming
- Source schema: source_id, source_title, url, source_type, date_accessed, category, claim_summary, relevance_to_TITANE, status, doctrine_impact, scorecard_influence
- Must include min 12 sources (one per category minimum)
- Validator: `bash scripts/verify_instructions.sh` + `bash scripts/autoheal/detect_recurrence.sh` must pass after
- No runtime code changes

### Hard Stoplines for A2

1. If source map validation script fails with FAIL (not PARTIAL): BLOCKED_RESEARCH_AUTHORITY
2. If no legitimate external source can be found for a required category: note as NO_SOURCE_FOUND, continue to next
3. No fabricated sources — every URL must be a real, verifiable document
