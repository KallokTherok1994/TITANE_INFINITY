# 10_COMMANDS_USED — Commandes Qualité Utilisées
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## Commandes de Découverte (EXÉCUTÉES)

```bash
# Git
git status --porcelain=v1
git rev-parse --short HEAD
git branch --show-current
git log -5 --oneline

# Env
node -v      → v24.14.0
rustc -V     → rustc 1.93.1
cargo -V     → cargo 1.93.1

# Inventaire
find . -maxdepth 3 -type d | sed 's|^\./||' | sort | head -n 80
find . -maxdepth 6 -name "package.json" -not -path "*/node_modules/*" | sort
ls src-tauri/capabilities/
ls .github/workflows/ | wc -l
ls proof_packs/ | wc -l
find proof_packs -maxdepth 2 -type f | wc -l

# Versions
cat package.json → version 27.2.0
grep "^version" src-tauri/Cargo.toml → 27.2.0
python3 -c ... src-tauri/tauri.conf.json → 27.2.0
find deployment -name MANIFEST.json → 27.2.0

# Scans invariants
grep -rn "fetch(|axios\.|window\.fetch\s*=" src/ --include="*.ts"
grep -rn "use http_client|HttpClient::new" src-tauri/src/ --include="*.rs"
grep -rn "invoke(" src/ --include="*.ts" --include="*.tsx"
grep -rn "express(|fastify(|createServer|listen(" src/ --include="*.ts"

# Capabilities
cat src-tauri/capabilities/chat_ai.json
wc -c src-tauri/allowlist.whitelist.stable.json

# Architecture ring
grep -rn "from.*@/services|@/lib|@tauri-apps" src/engines/ --include="*.ts"
grep -rn "use http_client|use reqwest|use hyper" src-tauri/src/engines/ --include="*.rs"

# IPC
grep -rn "#\[tauri::command\]" src-tauri/src/ --include="*.rs" | wc -l
cat src/lib/tauriClient.ts | head -n 60
cat src-tauri/src/commands/ia_context_commands.rs | head -n 40

# AutoHeal
bash scripts/autoheal/detect_recurrence.sh
```

---

## Commandes de Qualité Réelles (pnpm)

| Commande | Statut | Raison |
|----------|--------|--------|
| `pnpm lint` | 🔴 BLOCKED | pnpm absent |
| `pnpm format:check` | 🔴 BLOCKED | pnpm absent |
| `pnpm check` | 🔴 BLOCKED | pnpm absent |
| `pnpm test` | 🔴 BLOCKED | node_modules absent |
| `pnpm test:all` | 🔴 BLOCKED | node_modules absent |
| `pnpm test:architecture` | 🔴 BLOCKED | node_modules absent |
| `pnpm guard:ipc-contract` | 🔴 BLOCKED | node_modules absent |
| `pnpm verify` | 🔴 BLOCKED | node_modules absent |

## Commandes Rust

| Commande | Statut | Raison |
|----------|--------|--------|
| `cargo fmt --all -- --check` | 🔴 BLOCKED | GTK/glib absent |
| `cargo clippy --all-targets` | 🔴 BLOCKED | GTK/glib absent |
| `cargo test --all` | 🔴 BLOCKED | GTK/glib absent |
| `cargo check` | 🔴 BLOCKED | GTK/glib absent |

## Commandes AutoHeal (EXÉCUTÉES)

| Commande | Statut | Résultat |
|----------|--------|---------|
| `bash scripts/autoheal/detect_recurrence.sh` | ✅ PASS | 7 règles, PASS |
