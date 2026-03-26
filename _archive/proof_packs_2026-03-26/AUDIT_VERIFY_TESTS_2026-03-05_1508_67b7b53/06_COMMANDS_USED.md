# 06_COMMANDS_USED — Journal des Commandes
**Proof Pack:** AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53  
**Timestamp:** 2026-03-05T15:08:56Z

---

## Journal Chronologique (2026-03-05)

| Timestamp | Commande | Résultat |
|-----------|----------|----------|
| 15:08:56 | `git rev-parse --short HEAD` | `67b7b53` |
| 15:08:56 | `git status --porcelain` | (vide — clean) |
| 15:08:56 | `git branch --show-current` | `copilot/audit-modules-and-generate-plan` |
| 15:09:00 | `uname -a` | Linux runnervm0kj6c 6.14.0-1017-azure x86_64 |
| 15:09:00 | `node -v` | `v24.14.0` |
| 15:09:00 | `pnpm -v` | command not found (BLOCKED) |
| 15:09:00 | `rustc -V` | `rustc 1.93.1` |
| 15:09:00 | `cargo -V` | `cargo 1.93.1` |
| 15:09:00 | `git log -20 --oneline` | 3 commits (shallow clone) |
| 15:09:05 | `du -sh .` | 1.2G |
| 15:09:05 | `du -h --max-depth=2 . \| sort -h \| tail -25` | Top directories listed |
| 15:09:05 | `ls -la .github/workflows/` | 44 fichiers YAML |
| 15:09:05 | `ls -la src-tauri/` | Structure Tauri listée |
| 15:09:05 | `ls -la src/` | Structure frontend listée |
| 15:09:10 | `find . -maxdepth 6 -name "package.json" -not -path "*/node_modules/*"` | 2 fichiers |
| 15:09:10 | `find . -maxdepth 6 -name "Cargo.toml" -not -path "*/target/*"` | 1 fichier |
| 15:09:10 | `find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.rs" \) \| wc -l` | 2622 total |
| 15:09:15 | `find . -type f -name "*.ts" -o -name "*.tsx" \| wc -l` | 1654 TS/TSX |
| 15:09:15 | `find . -type f -name "*.rs" -not -path "*/target/*" \| wc -l` | 968 RS |
| 15:09:15 | `find src -type f \( -name "*.ts" -o -name "*.tsx" \) \| wc -l` | 1521 |
| 15:09:15 | `find src-tauri/src -type f -name "*.rs" \| wc -l` | 940 |
| 15:09:20 | `grep -rn "from.*engines\|import.*engines" src/types/` | 0 résultats (PASS) |
| 15:09:20 | `grep -rn "from.*services" src/engines/` | 0 résultats (PASS) |
| 15:09:20 | `grep -rn "from.*services" src/types/` | 0 résultats (PASS) |
| 15:09:25 | `grep -rn "invoke(" src/ --include="*.ts" \| grep -v "...tauriClient..."` | 6 occurrences bridges |
| 15:09:25 | `grep -rn "#\[tauri::command\]" src-tauri/src/ \| wc -l` | 1283 |
| 15:09:25 | `grep -rn "use http_client\|HttpClient::new" src-tauri/src/` | 4 violations Ring 2 |
| 15:09:30 | `grep -rn "reqwest\b" src-tauri/src/ \| grep -v "pub use\|http_types"` | overdrive only |
| 15:09:30 | `grep -rn "fetch(" src/ --include="*.ts" \| grep -v "test\|mock\|//.*fetch"` | 0 résultats |
| 15:09:30 | `grep -rn "window.fetch\s*=" src/` | 1 → selfHealingObserver.ts:431 |
| 15:09:35 | `grep -rn "express(\|fastify(\|createServer" src/` | 0 résultats (PASS) |
| 15:09:35 | `ls src-tauri/capabilities/` | 6 fichiers JSON |
| 15:09:35 | `cat src-tauri/capabilities/chat_ai.json` | Capabilities lues |
| 15:09:40 | `cat src-tauri/capabilities/self_heal.json` | Capabilities lues |
| 15:09:40 | `cat src/utils/invoke.ts` | Retry borné (3) via secureInvoke |
| 15:09:40 | `cat .github/workflows/ci-unified.yml` | CI pipeline lu |
| 15:09:45 | `cat .github/workflows/p0-surface-guard.yml` | P0 gate lu |
| 15:09:45 | `cat .github/workflows/p2-contract-guard.yml` | P2 gate lu |
| 15:09:45 | `grep -rn "#[tauri::command]" src-tauri/src/ \| wc -l` | 1283 |
| 15:09:50 | `ls src-tauri/src/engines/` | 9 engine dirs |
| 15:09:50 | `ls src-tauri/src/overdrive/` | 8 fichiers |
| 15:09:50 | `grep -n "http\|reqwest\|Client" src-tauri/src/overdrive/chat_orchestrator.rs \| grep -v "//"` | Timeouts bornés |
| 15:09:55 | `find docs -maxdepth 6 -iname "*verdict*" -o -iname "*gates*" \| sort` | 30+ preuves docs |
| 15:09:55 | `find registry -maxdepth 3 -type f \| sort` | 7 registres JSONL |
| 15:09:55 | `ls reports/ \| head -20` | Reports présents |
| 15:10:00 | `ls proof_packs/` | 12 proof packs existants |

## Commandes BLOCKED (non exécutées par manque de prérequis)

| Commande | Raison | Prérequis |
|----------|--------|-----------|
| `pnpm run lint` | pnpm absent | `npm install -g pnpm@10.28.2` + deps |
| `pnpm run format:check` | pnpm absent | idem |
| `pnpm test` | node_modules absent | pnpm install |
| `pnpm test:architecture` | node_modules absent | pnpm install |
| `cargo check` | GTK/glib-2.0 absent | apt-get install libgtk-3-dev etc. |
| `cargo clippy` | idem | idem |
| `cargo fmt --check` | idem | idem |
| `pnpm test:e2e` | Runtime Tauri absent | AppImage + tauri-driver + Xvfb |
| `pnpm run guard:ipc-contract` | node_modules absent | pnpm install |
| `pnpm run verify:tauri-only` | node_modules absent | pnpm install |
