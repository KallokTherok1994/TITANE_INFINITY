# 04_COMMANDS_USED.md — POST_AUDIT_CANON_VALIDATION
# Date: 2026-03-15T14:08:00Z | SHA: c59e9b5b3

## Bootstrap Commands

```bash
git rev-parse --short HEAD          # → c59e9b5b3
git branch --show-current           # → MAIN
wc -l scripts/autoheal/autoheal_rules.jsonl  # → 260 (now 261)
tail -n 3 scripts/autoheal/autoheal_rules.jsonl
```

## Command Count Reproof

```python
import re
content = open('src-tauri/src/main.rs').read()
m = re.findall(r'\.invoke_handler\(tauri::generate_handler!\[(.*?)\]\)', content, re.DOTALL)
cmds = [c.strip().rstrip(',') for c in m[0].split(',')
        if c.strip() and not c.strip().startswith('//')]
print(len(cmds))
# → 401 (stash state) / 408 (current)
```

## C003 Verification

```bash
grep -n "mod handlers\|use handlers\|generate_titane_handlers!()" src-tauri/src/main.rs
# → (no output) — macro NOT invoked
grep -c "macro_rules! generate_titane_handlers" src-tauri/src/handlers.rs
# → 1 — macro defined (dead code)
```

## Registry Validation

```bash
python3 -c "import json; [json.loads(l) for l in open('scripts/autoheal/autoheal_rules.jsonl') if l.strip()]"
# → All JSON valid
python3 -c "import json; [json.loads(l) for l in open('registry/canon-events.jsonl') if l.strip()]"
# → All JSON valid (after fix)
```

## Verification Runs

```bash
bash scripts/verify_instructions.sh     # → PASS=20 FAIL=0
bash scripts/autoheal/detect_recurrence.sh  # → G_AH_RECURRENCE_GUARD_PASS entries=261
```

## File Operations

```
grep -rn "378" docs/canon/ | grep -v CORRECTION  # → (no output after patches)
ls proof_packs/ | wc -l                           # → 160
ls memory/                                         # → 5 files
ls registry/ | wc -l                               # → 12 files
wc -l registry/*.jsonl                             # → 340 total
```
