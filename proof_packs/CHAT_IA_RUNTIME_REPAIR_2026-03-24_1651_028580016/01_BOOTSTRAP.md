# Bootstrap vérité

## Commandes
```text
git status --short
git rev-parse --short HEAD
git log -20 --oneline
node -v || true
pnpm -v || true
cargo -V || true
rustc -V || true
pnpm tauri -v || true
pnpm -s run || true
pwd
uname -a
echo $DISPLAY || true
printenv | grep -E 'OLLAMA|OPENAI|ANTHROPIC|GEMINI|TITANE|RUST_LOG' || true
```

## Extraits verbatim
```text
git rev-parse --short HEAD
028580016

node -v || true
v24.14.0

pnpm -v || true
10.30.2

cargo -V || true
cargo 1.94.0 (85eff7c80 2026-01-15)

rustc -V || true
rustc 1.94.0 (4a4ef493e 2026-03-02)

pnpm tauri -v || true
error: 'node node_modules/@tauri-apps/cli/tauri.js' requires a subcommand but one was not provided

pwd
/home/titane-os/Documents/GitHub/TITANE_INFINITY

uname -a
Linux TITANE-OS 6.17.0-19-generic #19~24.04.2-Ubuntu SMP PREEMPT_DYNAMIC Fri Mar  6 23:08:46 UTC 2 x86_64 x86_64 x86_64 GNU/Linux

echo $DISPLAY || true
:1
```

## Variables d'environnement
```text
TITANE_SECRETS_PASSPHRASE=63aa371563efcebd402eb1b354bdb753f8e1dfb75e140c0d97bc1bbb9c737f2b9a148c3fd3e40c6fa00f23021f7a7979
RUST_LOG=warn
```

## État réel
- worktree très sale avant intervention
- outillage Tauri/Node/Rust présent
- aucune preuve bootstrap que la sélection provider UI traverse le runtime
