# 10_VSCODE_CRASH_DIAG.md — Diagnostic VS Code Crash
**Generated:** 2026-02-28T18:41:19Z  
**Pack:** PREP_BG_2026-02-28_1613_a8b70c2

## VS Code Logs Directory

**Found:** `~/.config/Code/logs/20260227T234948/`

**Available logs:**
```
editSessions.log
main.log          ← Analysé
network-shared.log
ptyhost.log
remoteTunnelService.log
sharedprocess.log
telemetry.log
terminal.log
userDataSync.log
window1/         ← Répertoire window
```

## main.log Analysis

**Content:** Normal periodic update checks, no crash markers detected.

**Sample entries (last 20 lines):**
```
2026-02-28 03:50:19.045 [info] update#setState checking for updates
2026-02-28 03:50:19.239 [info] update#setState idle
[...pattern repeats hourly...]
2026-02-28 12:50:19.059 [info] update#setState checking for updates
2026-02-28 12:50:19.249 [info] update#setState idle
```

## Crash Evidence

**Status:** No explicit crash events found in accessible logs.

**Observations:**
- Log entries show normal VS Code lifecycle
- No error/fatal/exception markers in main.log
- window1/ directory not investigated (may contain renderer crash info)

## Extensions Analysis

**Status:** UNKNOWN — extension list not accessible via logs.

**Required for full analysis:**
- `code --list-extensions` (if VS Code available)
- window1/ renderer logs
- exthost logs (if present)

## Verdict

**UNKNOWN** — No conclusive crash evidence found.
VS Code appears to be running normally based on available main.log.
Further investigation requires access to renderer/extension logs.