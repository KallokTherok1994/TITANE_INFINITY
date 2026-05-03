# 06 — HOOK BEHAVIOR MAP

## Hook: TaskStart

| Attribute | Value |
|---|---|
| Trigger | Task starts in CLINE |
| Payload consumed | `clineVersion`, `hookName`, `timestamp`, `taskId`, `workspaceRoots`, `taskStart.taskMetadata` |
| Payload emitted | `{"cancel": false, "contextModification": "<7-line context>"}` |
| Verbosity | LOW — 7 lines only |
| Repair behavior | NONE — context injection only |
| Risk: overreach | LOW — project detection only (checks `src-tauri/Cargo.toml` + `package.json`) |
| Risk: false narrative | LOW — injects factual project type + 3 safeguards |
| Rollback ease | N/A — no state mutated |
| Verdict | SOBER — passes CHECK 3 |

### Context injected (verbatim):
```
PROJECT_TYPE: TITANE∞ - Tauri + React + TypeScript project detected.
CONSTITUTIONAL_AUTHORITY: .clinerules/00-kernel.md
STATUS_VOCABULARY: PASS/FAIL/BLOCKED/DONE/SEALED
CRITICAL SAFEGUARDS:
- DEPLOYMENT: NEVER deploy without explicit authorization from Kevin Thibault
- BUILD_GATE: NEVER run production builds without explicit request
- DEV_ONLY: Use '🟢 Launch Titan-Dev' task for development
```

---

## Hook: PostToolUse

| Attribute | Value |
|---|---|
| Trigger | Any tool completes |
| Payload consumed | `executionTimeMs`, `toolName`, `success`, `postToolUse.description` |
| Payload emitted | `contextModification` with STATUS classification |
| Verbosity | MEDIUM — status + optional performance + optional error details |
| Repair behavior | AutoHeal auto-capture IF `toolName` in `{write_to_file, execute_command}` AND `success=true` AND `description` matches fix patterns |
| Risk: overreach | MEDIUM — auto-capture writes JSONL with `files_changed: []` always empty (schema violation, but DORMANT: 0 entries fired in production) |
| Risk: false narrative | LOW — status vocabulary is honest (PASS/FAIL/BLOCKED) |
| Rollback ease | EASY — no external state other than optional JSONL append |

### AutoHeal auto-capture assessment:
- Pattern: `(^fix:|fix\s|\sfix\s|resolve\s+bug|correct\s+error|patch\s|heal\s+defect|bugfix)`
- Exclusion: `(align|address|configuration|style|format)`
- `description` field from CLINE payload: usually absent/empty in practice → capture rarely fires
- When fired: `files_changed: []` is hardcoded empty → violates mandatory JSONL schema
- Production evidence: **0 CLINE-EXPLICIT entries** found in `autoheal_rules.jsonl` (confirmed by `grep "CLINE-EXPLICIT" | wc -l` = 0)
- Risk classification: DORMANT DEFECT — not currently causing harm but technically non-compliant

### Recommendation (not patched — dormant, out of scope for this one-lock cycle):
The auto-capture block in PostToolUse should either be removed OR should populate `files_changed` from the write_to_file path parameter. One future lock.

---

## Hook: PreToolUse

| Attribute | Value |
|---|---|
| Purpose | Architecture boundary validation before file operations |
| Verbosity | LOW |
| Risk | LOW |
| Verdict | NOT the primary CLINE inspection target — stable since Jan 4 |

---

## Hook: UserPromptSubmit

| Attribute | Value |
|---|---|
| Purpose | User prompt entry classification |
| Verbosity | LOW |
| Risk | LOW |
| Verdict | NOT the primary CLINE inspection target — stable since Jan 4 |
