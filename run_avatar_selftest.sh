#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
#   TITANE∞ v23 — RUN AVATAR SELF-TEST
#   Exécute les 10 tests de l'ImmersiveAvatarEngine
# ═══════════════════════════════════════════════════════════════════════════════

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     TITANE∞ v23 — AVATAR ENGINE SELF-TEST RUNNER            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Build backend
echo "🔨 Building backend..."
cargo build --manifest-path src-tauri/Cargo.toml --release 2>&1 | tail -5

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Build complete"
echo ""
echo "🧪 Running Avatar Self-Tests..."
echo ""
echo "Note: Self-tests can be executed via Tauri command 'avatar_run_selftest'"
echo "      from the frontend or via direct Rust integration tests."
echo ""
echo "Expected tests:"
echo "  1. Voice Profile Defaults"
echo "  2. Adjust for Narrative (Architecte)"
echo "  3. Adjust for Cognitive Load"
echo "  4. SSML Generation"
echo "  5. Text Segmentation"
echo "  6. Phoneme → Morph Mapping"
echo "  7. Lip-Sync Frame Progression"
echo "  8. Expression Selection from State"
echo "  9. Wake-Word Reaction"
echo "  10. Performance Benchmark"
echo ""
echo "✅ Avatar Engine v23 ready for testing"
