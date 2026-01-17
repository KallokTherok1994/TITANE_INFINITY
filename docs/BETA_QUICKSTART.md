# BETA QUICKSTART — TITANE∞ v26.3.0

## Prérequis
- OS: Linux (Ubuntu 24.04 recommandé)
- Node.js: v20+ (via .tools/node/current/bin)
- Rust: 1.75+
- Tauri CLI: v2.0+
- Git LFS: requis

## Installation
```bash
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY
git lfs install && git lfs pull
export PATH="$PWD/.tools/node/current/bin:$PATH"
corepack pnpm install
# Ou: ./titane.sh repair
```

## Lancer Beta (Dev)
```bash
pnpm run dev:tauri
```
Démarre 10/10 après install propre.

## Build Stable
```bash
./runtime/stable/build.sh
```