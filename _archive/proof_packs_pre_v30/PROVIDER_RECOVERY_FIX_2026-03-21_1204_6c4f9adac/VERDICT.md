# TITANE∞ — Proof Pack: Provider Recovery Triple Fix
## Session: 2026-03-21
## Verdict: PASS

### Fixes Applied
| ID | Bug | Fix | Status |
|----|-----|-----|--------|
| A | TypeId 'state not managed' classified unknown → FALLBACK_OFFLINE → recovery UI | Added `/state not managed/i` to IPC_ERROR_PATTERNS → CONTRACT_VIOLATION_CLAMPED | FIXED |
| B | Circuit breaker deadlock: failure count never reset after heartbeat success | Reset failure count to 0 when heartbeat succeeds in is_provider_available() | FIXED |
| C | is_ollama_auto_enabled() returns false in release builds → Ollama never probed | Default true in all builds; opt-out via TITANE_OLLAMA_AUTO_DISABLED=1 | FIXED |

### Gates
- cargo check: PASS (exit=0, 34.79s)
- verify_instructions.sh: PASS=20 FAIL=0
- detect_recurrence.sh: G_AH_RECURRENCE_GUARD_PASS (505 entries)
- pnpm tauri build: PASS — 3 bundles produced
- GitHub release v28.5.0 assets: refreshed (4 assets uploaded)

### Commits
- 664728743 — fix(provider): resolve recovery-mode triple root cause
- 6c4f9adac — chore(release): refresh v28.5.0 checksums

### AutoHeal
- AH-2026-03-21-PROVIDER-RECOVERY-TRIPLE (entry 505)

### Files Changed
- src/lib/errorClassification.ts (+5 patterns)
- src-tauri/src/overdrive/chat_orchestrator.rs (+7 lines: circuit breaker reset + is_ollama_auto_enabled)
- scripts/autoheal/autoheal_rules.jsonl (entry 505)
- RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt (refreshed)
