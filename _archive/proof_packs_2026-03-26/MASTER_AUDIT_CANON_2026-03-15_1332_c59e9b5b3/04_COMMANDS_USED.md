# 04_COMMANDS_USED.md — Commandes Exécutées

## Session Bootstrap (main agent)

```bash
# Git truth
git --no-pager status
git rev-parse --short HEAD
git branch --show-current
git --no-pager log -20 --oneline

# Version truth
node --version
pnpm --version
rustc --version
cargo --version
cat package.json | python3 -c "import json,sys; p=json.load(sys.stdin); print('app version:', p.get('version','?'))"

# Structure truth
ls src/ src-tauri/ docs/ .github/workflows/ registry/ proof_packs/ e2e/ tests/

# Commands extraction
grep -r "tauri::generate_handler" src-tauri/src/ --include="*.rs" -A5
cat src-tauri/src/main.rs | grep -A200 "invoke_handler(tauri::generate_handler"
python3 -c "import json; d=json.load(open('src-tauri/tauri.conf.json')); print('version:', d.get('version','?'))"

# Surface scan
grep -r "fetch\|axios\|http\|WebSocket" src/ --include="*.ts" --include="*.tsx" -l
grep -r "invoke(" src/ --include="*.ts" --include="*.tsx" -l
grep -rn "fetch(" src/ --include="*.ts" --include="*.tsx"

# IPC inspection
cat src/core/http/httpClient.ts | head -30
cat src/utils/invoke.ts | head -30
cat src/lib/tauriClient.ts | head -30

# Validators check
ls scripts/verify_instructions.sh scripts/autoheal/detect_recurrence.sh

# Dirty diff
git --no-pager diff src-tauri/tauri.conf.json | head -30

# Memory sources
ls memory/ && wc -l registry/*.jsonl && ls proof_packs/ | wc -l

# docs/canon creation
mkdir -p docs/canon
mkdir -p proof_packs/MASTER_AUDIT_CANON_2026-03-15_1332_c59e9b5b3
```

## Sorties Clés

- SHA HEAD : c59e9b5b3
- Total commandes Tauri : 378
- Node : 18.19.1 | pnpm : 10.30.2 | Rust : 1.94.0
- App version : 28.0.0 (cohérent package.json ↔ tauri.conf.json)
- Dirty files : 2 (tauri.conf.json, gradle.properties)
- proof_packs count : 160+
- registry total entries : 339

## Outils Non Utilisés Cette Session

- cargo check / cargo clippy (non exécuté)
- pnpm test / pnpm tauri build (non exécuté)
- E2E runner (non exécuté)
