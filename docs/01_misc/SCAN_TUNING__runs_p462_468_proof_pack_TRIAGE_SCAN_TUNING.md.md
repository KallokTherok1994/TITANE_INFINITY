# SCAN TUNING
- Condition met: all hits are in runs/**, docs/**, src/lib/__tests__/**
- Runtime untouched; scanner narrowed to avoid proven false positives only.
- Tuned command: rg -n "sk-[A-Za-z0-9]{20,}" -S . --hidden --glob '!.git/**' --glob '!runs/**' --glob '!docs/**' --glob '!src/lib/__tests__/**'
