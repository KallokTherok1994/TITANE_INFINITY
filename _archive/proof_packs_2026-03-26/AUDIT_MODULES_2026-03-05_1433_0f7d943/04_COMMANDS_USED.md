# 04_COMMANDS_USED — Journal des Commandes
**Proof Pack:** AUDIT_MODULES_2026-03-05_1433_0f7d943  
**Timestamp:** 2026-03-05T14:33:25Z

---

## Journal Chronologique

| Timestamp (approx) | Commande | Résultat |
|--------------------|----------|----------|
| 14:33:25 | `git rev-parse --short HEAD` | `0f7d943` |
| 14:33:25 | `git branch --show-current` | `copilot/audit-modules-and-generate-plan` |
| 14:33:25 | `ls -la` | Structure racine listée |
| 14:33:30 | `node -v` | `v24.14.0` |
| 14:33:30 | `pnpm -v` | `command not found` (BLOCKED) |
| 14:33:30 | `rustc -V` | `rustc 1.93.1` |
| 14:33:30 | `cargo -V` | `cargo 1.93.1` |
| 14:33:35 | `git log -20 --oneline` | 2 commits (shallow) |
| 14:33:35 | `find . -maxdepth 3 -type d \| sort \| head -200` | 200+ dirs catalogués |
| 14:33:40 | `cat package.json \| python3 scripts` | 60+ scripts listés |
| 14:33:40 | `ls src/ src/types/ src/engines/ src/services/ src/components/` | Structure 4-Ring explorée |
| 14:33:40 | `ls src-tauri/src/ && cat src-tauri/Cargo.toml` | Backend Rust exploré |
| 14:33:45 | `grep -rn "fetch(" src/ --include="*.ts"` | Pas de fetch direct production |
| 14:33:45 | `grep -rn "axios." src/ --include="*.tsx"` | Aucun résultat |
| 14:33:45 | `grep -rn "new WebSocket\|wss://" src/` | Aucun résultat |
| 14:33:50 | `grep -rn "invoke(" src/ --include="*.ts"` | Résultats classifiés |
| 14:33:50 | `grep -rn "#[tauri::command]" src-tauri/src/` | 40+ commands trouvées |
| 14:33:50 | `grep -rn "reqwest\|hyper::" src-tauri/src/` | reqwest centralisé |
| 14:33:55 | `grep -rn "express(\|fastify(" src/ --include="*.ts"` | Aucun résultat |
| 14:33:55 | `ls src-tauri/capabilities/` | 6 fichiers capabilities |
| 14:33:55 | `cat src-tauri/capabilities/chat_ai.json` | Capabilities chat AI lues |
| 14:34:00 | `grep -rn "http://\|https://" src/` | URLs classifiées |
| 14:34:00 | `cat src/core/http/httpClient.ts` | Client HTTP gouverné vérifié |
| 14:34:00 | `cat src/lib/tauriClient.ts` | Canonical client vérifié |
| 14:34:05 | `cat src/services/ai/providers/glm46v.ts` | Provider local vérifié |
| 14:34:05 | `cat src/config/offline-first.ts` | Config offline-first vérifiée |
| 14:34:10 | `ls .github/workflows/` | 40+ workflows listés |
| 14:34:10 | `cat .github/workflows/ci-unified.yml` | CI principal lu |
| 14:34:10 | `ls proof_packs/ && ls registry/` | Structures inventoriées |
| 14:34:15 | `cat scripts/autoheal/autoheal_rules.jsonl \| tail -n 5` | 3 règles AutoHeal lues |
| 14:34:15 | `npm run test -- --run` (via `node scripts`) | BLOCKED: cross-env not found |
| 14:34:20 | `node_modules/.bin/vitest run` | BLOCKED: no node_modules |
| 14:34:20 | `node_modules/.bin/eslint "src/**"` | BLOCKED: no node_modules |
| 14:34:25 | `cd src-tauri && cargo check` | BLOCKED: glib-2.0 not found |
| 14:34:30 | `du -sh . && du -h --max-depth=2 .` | Tailles calculées |
| 14:34:35 | `grep -rn "from.*engines" src/types/` | Aucun résultat (PASS) |
| 14:34:35 | `grep -rn "from.*services" src/engines/` | Aucun résultat (PASS) |
| 14:34:40 | `grep '"version"' package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json` | 27.2.0 aligné |
| 14:34:40 | `cat deployment/latest/MANIFEST.json` | 27.2.0 confirmé |

---

## Commandes Non Exécutées (BLOCKED)

| Commande | Raison | Next Action |
|----------|--------|-------------|
| `pnpm install` | pnpm non disponible | Installer pnpm: `npm install -g pnpm@10.28.2` |
| `pnpm test` | node_modules absent | Prérequis: pnpm install |
| `pnpm lint` | node_modules absent | Prérequis: pnpm install |
| `pnpm format:check` | node_modules absent | Prérequis: pnpm install |
| `pnpm test:architecture` | node_modules absent | Prérequis: pnpm install |
| `cargo check` | GTK/glib-2.0 absent | `sudo apt-get install libgtk-3-dev libwebkit2gtk-4.1-dev` |
| `pnpm test:e2e` | Runtime Tauri absent | Nécessite AppImage + tauri-driver + Xvfb |
