#!/bin/bash
# Test TITANE∞ v12 - Diagnostic crash

echo "🔍 DIAGNOSTIC CORE DUMP TITANE∞ v12.0.0"
echo "========================================"

cd /home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY

echo ""
echo "1️⃣ Vérification dépendances binaire..."
flatpak-spawn --host bash -c "cd '$PWD' && ldd src-tauri/target/release/titane-infinity" | head -20

echo ""
echo "2️⃣ Test binaire avec GDB (backtrace)..."
flatpak-spawn --host bash -c "cd '$PWD' && gdb -batch -ex 'run --version' -ex 'bt' ./src-tauri/target/release/titane-infinity 2>&1" | tail -30

echo ""
echo "3️⃣ Vérification RUST_BACKTRACE..."
flatpak-spawn --host bash -c "cd '$PWD' && RUST_BACKTRACE=1 ./src-tauri/target/release/titane-infinity --version 2>&1" | head -50

echo ""
echo "4️⃣ Vérification variables environnement..."
flatpak-spawn --host bash -c "cd '$PWD' && env | grep -E 'LD_|RUST_|GTK_|WEBKIT_'" | head -10

echo ""
echo "✅ DIAGNOSTIC TERMINÉ"
