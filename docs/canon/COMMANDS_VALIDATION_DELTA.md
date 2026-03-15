# COMMANDS_VALIDATION_DELTA.md
# Canonical Command Count — Delta Proof and Method
# Generated: 2026-03-15T14:08:00Z — POST_AUDIT_CANON_VALIDATION session
# SHA: c59e9b5b3

---

## Problem Statement

Previous session claimed **378 commands** in docs/canon. This was **WRONG**.

### Root Cause

```bash
# Method used (WRONG — output truncated):
grep -A 400 'tauri::generate_handler!\[' src-tauri/src/main.rs
# -A 400 insufficient for generate_handler block length (~640 lines)
# Result: 378 names extracted (block truncated)
```

---

## Correct Method and Results

### Python re.findall (CANONICAL METHOD)

```python
import re
content = open('src-tauri/src/main.rs').read()
m = re.findall(r'\.invoke_handler\(tauri::generate_handler!\[(.*?)\]\)', content, re.DOTALL)
cmds = [c.strip().rstrip(',') for c in m[0].split(',')
        if c.strip() and not c.strip().startswith('//')]
print(len(cmds))
```

### Results

| State | Count | Method | Proof |
|-------|-------|--------|-------|
| SHA c59e9b5b3 (stash state) | **401** | Python re.findall | stash-confirmed |
| Current workspace (uncommitted) | **408** | Python re.findall | AUDIO_VOICE_AUDIT +7 |
| Previous session claim | ~~378~~ | grep -A 400 (TRUNCATED) | **RETRACTED** |

### Delta: +7 commands (AUDIO_VOICE_AUDIT_2026-03-15_1321)

| Command | File | Session |
|---------|------|---------|
| audio::commands::transcribe_audio | src-tauri/src/audio/commands.rs | AUDIO_VOICE_AUDIT |
| audio::commands::is_recording | src-tauri/src/audio/commands.rs | AUDIO_VOICE_AUDIT |
| titane_infinity::control_panel_commands::cp_get_status | src-tauri/src/main.rs | AUDIO_VOICE_AUDIT |
| titane_infinity::control_panel_commands::cp_reset | src-tauri/src/main.rs | AUDIO_VOICE_AUDIT |
| titane_infinity::control_panel_commands::cp_set_mode | src-tauri/src/main.rs | AUDIO_VOICE_AUDIT |
| titane_infinity::control_panel_commands::cp_get_config | src-tauri/src/main.rs | AUDIO_VOICE_AUDIT |
| titane_infinity::control_panel_commands::cp_update_config | src-tauri/src/main.rs | AUDIO_VOICE_AUDIT |

---

## handlers.rs Validation

### Finding

`src-tauri/src/handlers.rs` contains:
- `macro_rules! generate_titane_handlers! {}` — v16 legacy
- Block 1: ~51 command names (conditional cfg)
- Block 2: ~42 command names (conditional cfg)

### Verification

```bash
grep -n "mod handlers\|use handlers\|generate_titane_handlers!()" src-tauri/src/main.rs
# Result: (no output) — macro NEVER invoked from main.rs
```

**Conclusion: handlers.rs = dead code — ZERO shadowing risk**

---

## IPC Wrapper Validation

File: `src/utils/invoke.ts`
- Confirmed: `CanonicalIpcResult<T> { ok: boolean; content?: T; error?: string }`
- Confirmed: all commands pass through `secureInvoke` / `invoke`
- No raw fetch in src/ (grep-confirmed)

---

## Summary of Docs Corrected

All 9 docs that contained "378" have been patched to reflect 401/408.
Method for future re-counts: Python re.findall (above) — NOT grep -A N.
