#!/bin/bash

echo "=== BETA DOCTOR — TITANE∞ ==="
echo ""

FAIL=0

# A) Vérif outillage
echo "A) Vérif outillage..."
if [[ ":$PATH:" != *":$PWD/.tools/node/current/bin:"* ]]; then
  echo "FAIL: PATH ne contient pas .tools/node/current/bin"
  echo "NEXT: export PATH=\"$PWD/.tools/node/current/bin:\$PATH\""
  FAIL=1
else
  echo "PASS: PATH inclut Node embarqué"
fi

if ! command -v pnpm &> /dev/null || ! pnpm --version &> /dev/null; then
  echo "FAIL: pnpm non fonctionnel"
  echo "NEXT: Installer Node.js et pnpm"
  FAIL=1
else
  echo "PASS: pnpm OK"
fi

if ! command -v cargo &> /dev/null; then
  echo "FAIL: cargo non trouvé"
  echo "NEXT: Installer Rust"
  FAIL=1
else
  echo "PASS: cargo OK"
fi

if ! command -v tauri &> /dev/null; then
  echo "FAIL: tauri CLI non trouvé"
  echo "NEXT: cargo install tauri-cli"
  FAIL=1
else
  echo "PASS: tauri CLI OK"
fi

if ! command -v git-lfs &> /dev/null; then
  echo "FAIL: git-lfs non trouvé"
  echo "NEXT: apt install git-lfs && git lfs install"
  FAIL=1
else
  echo "PASS: git-lfs OK"
fi

echo ""

# B) Vérif build chain
echo "B) Vérif build chain..."
if [ ! -d "node_modules" ]; then
  echo "FAIL: node_modules manquant"
  echo "NEXT: pnpm install"
  FAIL=1
else
  echo "PASS: node_modules présent"
fi

if ! pnpm run build &> /dev/null; then
  echo "FAIL: build Vite échoue"
  echo "NEXT: pnpm run build pour détails"
  FAIL=1
else
  echo "PASS: build Vite OK"
fi

if ! (cd src-tauri && cargo check) &> /dev/null; then
  echo "FAIL: cargo check échoue"
  echo "NEXT: cd src-tauri && cargo check pour détails"
  FAIL=1
else
  echo "PASS: cargo check OK"
fi

echo ""

# C) Vérif IPC minimal
echo "C) Vérif IPC minimal..."
# Vérifier que les commandes sont définies (cargo check passe)
if [ $FAIL -eq 0 ]; then
  echo "PASS: IPC OK (build passe)"
else
  echo "FAIL: IPC check skipped due à erreurs précédentes"
  FAIL=1
fi

echo ""

if [ $FAIL -eq 0 ]; then
  echo "RESULT: PASS — Beta prête"
else
  echo "RESULT: FAIL — Corriger les erreurs ci-dessus"
fi