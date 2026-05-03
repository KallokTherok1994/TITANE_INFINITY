# 11 Auto Fix Decisions

Decision 1:
- Type: SAFE_AUTO_RECOVERY
- Trigger: FAIL_UI_RUNTIME_ENV (session timeout)
- Action: pkill tauri-driver and titane-infinity, rerun WDIO
- Impact: bounded to runtime process state
- Rollback: none required beyond restarting normal flow
- Outcome: PASS healthcheck + PASS run1 + PASS run2

Decision 2:
- Type: SAFE_AUTO_FIX (already applied pre-merge, V8 continuation)
- Trigger: PR check format failure on WDIO test file
- Action: Prettier write on single file + AutoHeal capture
- Outcome: PR checks green, merge completed
