# 09 ANTI-RECURRENCE MAP

## Known recurrence classes
1. Provider reset failure (fixed AH-2026-03-21-0119)
2. LTM write placeholder (fixed AH-2026-03-20-2214)
3. Memory injection missing (fixed AH-2026-03-20-2229)
4. Memory backup/restore absent (fixed AH-2026-03-20-2247)
5. Capability gap (fixed AH-2026-03-21-CAPS)

## Current protections
- verify_instructions.sh: PASS=20 FAIL=0
- detect_recurrence.sh: PASS
- verify-command-whitelist-sync.sh: G_COMMAND_WHITELIST_SYNC=PASS
- verify-capabilities-coverage.sh: G_CAP_COVERAGE=PASS (0 NEW dead entries)

## Pre-existing dead capability entries (16 — baseline documented)
test_ollama, autonomy_analyse_logs, autonomy_evolve_ia, autonomy_fix_states,
autonomy_heal_modules, autonomy_optimize_performance, autonomy_scan_avatar,
autonomy_scan_backend, autonomy_scan_ia, autonomy_scan_memory,
autonomy_scan_singularity_state, autonomy_scan_tts, autonomy_shield_state,
autonomy_test_ia_coherence, singularity_selftest_full, titan_validate_invariants

These are in self_heal.json and singularity.json capability files.
They do NOT block IPC for current session features.
They SHOULD be cleaned in a future dedicated session.

## Validator added this session
scripts/verify/verify-capabilities-coverage.sh
- Uses python3 for accurate extraction
- Has known-dead baseline allowlist
- Returns EXIT 0 on PASS, EXIT 1 on new dead entries
