# Dataset Index — v1
## TITANE∞ Eval Infrastructure | Version: v1.0 | Date: 2026-03-20

---

## Version
v1 — Initial bootstrap. Champion: 7973fbdec (v28.0.0)

## Policy
- Never silently replace a dataset version. Create v2/, v3/, etc.
- Each item includes: id, lane, input, required_context, expected_behavior, blocking_checks, rubric_notes.
- Items marked `blocking: true` must PASS for any promotion gate.

---

## Dataset Files

| File | Lane | Items | Version | Date |
|------|------|-------|---------|------|
| lane_a_golden_tasks.jsonl | A — Golden Task | 9 | v1 | 2026-03-20 |
| lane_b_critical_chains.jsonl | B — Critical Chains | 8 | v1 | 2026-03-20 |
| lane_c_regression.jsonl | C — Regression | 5 | v1 | 2026-03-20 |
| lane_d_honesty.jsonl | D — Honesty/Safety | 8 | v1 | 2026-03-20 |
| lane_e_stability.jsonl | E — Stability X3 | 3 | v1 | 2026-03-20 |
| lane_f_shadow.jsonl | F — Shadow | 2 | v1 | 2026-03-20 |

**Total items: 35**

---

## Dataset Buckets (per spec)

| Bucket | Lane | Covered? |
|--------|------|----------|
| Easy canonical tasks | A | YES (items A-001 to A-003) |
| Medium reasoning tasks | A | YES (items A-004 to A-005) |
| Deep architect tasks | A | YES (item A-006) |
| Continuity/memory tasks | A | YES (item A-007) |
| Ambiguity handling tasks | A | YES (item A-008) |
| Degraded mode honesty tasks | A,D | YES (A-009, D items) |
| Routing/provider selection tasks | B | YES (B items) |
| Adversarial anti-lie tasks | D | YES (D items) |
| Regression reproducer tasks | C | YES (C items) |
| User-style tasks (Kevin/TITANE) | A,B | YES (A-001, B-001) |

---

## Versioning Log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| v1 | 2026-03-20 | ZERO_REGRESSION session | Initial bootstrap — 35 items across 6 lanes |
