#!/bin/bash

echo "⚡ Running performance benchmarks..."

echo "❌ TAURI-ONLY: benchmark web (lighthouse sur localhost) désactivé"
echo "   Utilisez le profiling interne dans l'app ou des outils OS côté window Tauri."
exit 1

# Rust benchmarks
cd src-tauri
cargo bench

# Frontend performance
cd ..
pnpm run build
echo "📊 Build OK (TAURI-only)"
