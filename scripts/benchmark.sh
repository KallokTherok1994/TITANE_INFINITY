#!/bin/bash

echo "⚡ Running performance benchmarks..."

# Rust benchmarks
cd src-tauri
cargo bench

# Frontend performance
cd ..
npm run build
npx lighthouse http://localhost:1420 --output html --output-path ./benchmark-results.html

echo "📊 Results saved to benchmark-results.html"
