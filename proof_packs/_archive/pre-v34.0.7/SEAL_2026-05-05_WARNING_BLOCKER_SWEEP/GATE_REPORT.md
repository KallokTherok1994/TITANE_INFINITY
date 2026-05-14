# GATE REPORT — SEAL_2026-05-05_WARNING_BLOCKER_SWEEP

## 1) Worktree scope

Command:

```bash
git status --short
```

Output:

```text
 M memory/memory_core_state.json
 M memory/stm.json
```

Status: PASS (modifications runtime mémoire hors-scope code; commit ciblé requis)

## 2) TypeScript gate

Command:

```bash
pnpm run check
```

Output:

```text
> titane-infinity@33.0.8 check /home/titane-os/Documents/GitHub/TITANE_INFINITY
> tsc --noEmit
```

Status: PASS

## 3) Frontend tests gate

Command:

```bash
pnpm run test
```

Output (résumé):

```text
Test Files  505 passed (505)
Tests  7892 passed (7892)
Duration  315.47s
```

Status: PASS

## 4) Rust lib tests gate

Command:

```bash
cd src-tauri && cargo test --lib
```

Output (résumé):

```text
test result: ok. 4267 passed; 0 failed; 8 ignored; 0 measured; 0 filtered out
```

Status: PASS

## 5) AutoHeal recurrence gate

Command:

```bash
bash scripts/autoheal/detect_recurrence.sh
```

Output:

```text
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=1628
```

Status: PASS

## 6) Instructions compliance gate

Command:

```bash
bash scripts/verify_instructions.sh
```

Output (résumé):

```text
SUMMARY: PASS=33 FAIL=0
```

Status: PASS

## Consolidated gate result

Final gate classification: PASS