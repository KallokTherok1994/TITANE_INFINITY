# 07_COMMANDS_USED

## Commandes exécutées (chronologique)

```bash
# Phase 0
git status
git rev-parse --short HEAD
git branch --show-current
git log -20 --oneline
cat package.json (scripts section)
head -50 src-tauri/tauri.conf.json
head -40 src-tauri/Cargo.toml
ls src/pages/ src/features/ src/modules/ src/components/ src/stores/ src/hooks/ src-tauri/src/commands/

# Phase 1
rg -rn "twins|twin|Twin|Twins" src-tauri/ 2>/dev/null
cat src/hooks/useTwinBehavior.ts useTwinEvolution.ts useTwinIdentity.ts
ls src-tauri/src/numeric_twin/
rg -rn "Twin|twin" src/pages/ src/features/ src/modules/ src/components/
ls src/services/api/ && ls src/types/ | grep -i twin

# Phase 2
cat src/services/api/numericTwin.ts
grep -n "#[tauri::command]" src-tauri/src/numeric_twin/twin_commands.rs -A 5
grep -n "twin_get_state|twin_submit_observation|..." src-tauri/src/
grep -n "twin|Twin" src-tauri/src/lib.rs
grep -rn "numeric_twin|NumericTwin" src-tauri/src/main.rs src-tauri/src/handlers.rs
find src-tauri/src -name "*.rs" | xargs grep -l "generate_handler|invoke_handler"
sed -n '1280,1350p' src-tauri/src/main.rs
sed -n '855,870p' src-tauri/src/main.rs
python3 (parse tauri.conf.json structure)

# Phase 5 (patches)
edit src-tauri/src/main.rs (+manage NumericTwinState)
edit src-tauri/src/main.rs (+generate_handler 8 twin commands)
python3 (add 8 twin commands to tauri.conf.json allow list)

# Phase 6 (autoheal)
python3 (append AH-2026-03-15-TWINS-001 to autoheal_rules.jsonl)
python3 (fix AH-2026-03-15-AUDIO-003 missing fields)
bash scripts/autoheal/detect_recurrence.sh  → PASS
bash scripts/verify_instructions.sh         → PASS (20/20)

# Phase 7 (tests)
cargo check --manifest-path=src-tauri/Cargo.toml  → EXIT 0
pnpm exec vitest run src/__tests__/architecture    → 4/4 PASS
pnpm exec vitest run src/__tests__/compliance      → 6/6 PASS
```
