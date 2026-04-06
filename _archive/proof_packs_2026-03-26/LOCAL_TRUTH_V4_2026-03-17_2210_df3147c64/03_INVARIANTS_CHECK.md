# 03 — INVARIANTS CHECK

| Invariant | Status | Evidence |
|-----------|--------|----------|
| Minimal patch only | PASS | 1 semantic field rename + 1 autoheal entry append |
| Proof before verdict | PASS | detect_recurrence PASS, verify_instructions PASS=20 FAIL=0, tests/checks green |
| 4-Ring boundaries | PASS | no src/ or src-tauri/ code changes |
| Tauri-only production runtime | PASS | enforce-tauri-only.sh green |
| One Door network governance | PASS | network-one-door.sh PASS |
| IPC canonical contract | PASS | untouched this session; prior seal intact |
| Online-first + local fallback | PASS | no runtime policy change |
| Stop-the-line | PASS | governance FAIL was treated as main lock |
| NO_SKIPS | PASS | unavailable proofs explicitly marked N/A or QUALIFIED |
| AutoHeal capture per fix | PASS | AH-2026-03-17-GOVERNANCE-DUPLICATE-ID-FIX appended |
| Proof pack + rollback | PASS | numbered files + VERDICT/ROLLBACK wrappers added in this session |
