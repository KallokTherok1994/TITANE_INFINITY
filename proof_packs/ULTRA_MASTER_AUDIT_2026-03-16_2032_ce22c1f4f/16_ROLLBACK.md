# ROLLBACK

## Rollback État Working Directory

```bash
# Restaurer les fichiers modifiés (pre-audit) à leur état HEAD
git restore -- e2e/desktop/online-chat-proof-ui.wdio.test.js
git restore -- scripts/autoheal/autoheal_rules.jsonl

# Supprimer le proof pack (optionnel, cet audit)
rm -rf proof_packs/ULTRA_MASTER_AUDIT_2026-03-16_2032_ce22c1f4f/
```

## Rollback Patches Recommandés (Si Appliqués)

```bash
# PATCH-001 — version header
git restore -- src-tauri/src/main.rs

# PATCH-002 — evolution stub truth label
git restore -- src-tauri/src/commands/engine_commands.rs

# Rollback instruction architecture
git restore -- .github/copilot-instructions.md .github/instructions/titane.instructions.md
git restore -- .github/prompts .github/agents src/AGENTS.md src-tauri/AGENTS.md
git restore -- scripts/verify governance
```

## Rollback Complet — Retour au Commit Précédent

```bash
# Retour au commit avant ce22c1f4f (4e0ddc44b)
git reset --hard 4e0ddc44b

# Ou retour au tag v28.0.0 certifié
git reset --hard v28.0.0-gov-e2e-hardening-20260316
```

## Variables d'Environnement Critiques

```bash
# P0 — Définir avant tout démarrage en production
export TITANE_SECRETS_PASSPHRASE="$(openssl rand -hex 32)"

# P1 — Activer LTM si désiré
export CONVOS_MEMORY_LTM=true

# P1 — Confirmer modèle Ollama
export TITANE_OLLAMA_MODEL="gemma2:2b"  # ou modèle disponible

# P1 — Confirmer URL Ollama
export OLLAMA_BASE_URL="http://127.0.0.1:11434"
```

## Rollback Feature Flag

```bash
# Si build défaut ne contient pas "full" (vérifier Cargo.toml)
# Build explicite avec full:
cd src-tauri && cargo build --features full --release

# Ou via Tauri:
pnpm exec tauri build --config src-tauri/tauri.conf.json
# Vérifier que tauri.conf.json inclut --features full dans beforeBuildCommand
```

## Vérification Post-Rollback

```bash
git --no-pager status
git rev-parse --short HEAD
cargo check --manifest-path src-tauri/Cargo.toml --features full
```
