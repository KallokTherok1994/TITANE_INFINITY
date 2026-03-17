# 16_ROLLBACK.md

## Session Rollback Plan

### Rollback: Bounded Fix (audio-tts navigation retry)
```bash
# Revert commit:
git revert 411862be2 --no-edit

# OR hard reset (caution — drops all changes since):
git reset --hard 32391d3ab
```

### Rollback: AutoHeal Entry
```bash
# Remove last line (the AH-2026-03-17-E2E-001 entry):
python3 -c "
lines = open('scripts/autoheal/autoheal_rules.jsonl').readlines()
open('scripts/autoheal/autoheal_rules.jsonl', 'w').writelines(lines[:-1])
print('removed last entry')
"
```

### Rollback: Proof Pack Files
```bash
# The proof_packs/ directory is append-only — do NOT delete.
# These are evidence artifacts, not product code.
# If proof pack must be retracted:
git rm -r proof_packs/E2E_DESKTOP_ULTRA_2026-03-17_1730_32391d3a/
git commit -m "retract(proof): E2E_DESKTOP_ULTRA session retracted"
```

### Rollback: Xvfb
```bash
# Kill Xvfb on :99:
kill $(cat /tmp/.X99-lock 2>/dev/null) 2>/dev/null || pkill -f "Xvfb :99"
```

## No Product Rollback Required
Zero product files modified in this session.
No src/, src-tauri/, capabilities, or configuration changes.

## Stable State After Rollback
Rolling back commit 411862be2 restores the previous inline waitUntil implementation.
Tests will still pass but will be more fragile under slow boot conditions.
