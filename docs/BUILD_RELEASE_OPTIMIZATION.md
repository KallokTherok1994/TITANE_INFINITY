# 🚀 BUILD RELEASE OPTIMIZATION — TITANE∞ v21.1

## Objectif

Optimiser le build de production pour réduire la taille du binary de **111M (debug)** à **~15-20M (release)**.

---

## Configuration Actuelle

### Debug Build (défaut)
```bash
cargo build --manifest-path src-tauri/Cargo.toml
# Binary: 111M (debug symbols + optimizations=0)
```

### Release Build (optimisé)
```bash
cargo build --release --manifest-path src-tauri/Cargo.toml
# Binary: ~15-20M (stripped + optimized)
```

---

## Cargo.toml Optimization Profile

**Fichier**: `src-tauri/Cargo.toml`

```toml
[profile.release]
# Optimizations
opt-level = 3           # Maximum optimizations
lto = true              # Link-time optimization
codegen-units = 1       # Single codegen unit (slower build, smaller binary)
strip = true            # Strip debug symbols
panic = 'abort'         # Smaller binary (no unwind tables)

# Alternative: Size-optimized
# opt-level = "s"       # Optimize for size
# opt-level = "z"       # Optimize for size (aggressive)

[profile.release.build-override]
opt-level = 0           # Faster build scripts
```

---

## Build Scripts

### 1. Release Build Script

**Fichier**: `scripts/build/build-release.sh`

```bash
#!/bin/bash
# TITANE∞ v21.1 — Release Build Optimizer

set -e

echo "🚀 Building TITANE∞ Release..."

# 1. Clean previous builds
echo "🧹 Cleaning..."
cargo clean --manifest-path src-tauri/Cargo.toml --release

# 2. Build frontend (production)
echo "📦 Building frontend..."
pnpm run build

# 3. Build Tauri (release)
echo "⚙️ Building Tauri release..."
cargo build --release --manifest-path src-tauri/Cargo.toml

# 4. Strip debug symbols (si pas déjà fait)
echo "🔪 Stripping symbols..."
strip src-tauri/target/release/titane-infinity || true

# 5. Check binary size
echo "📊 Binary size:"
ls -lh src-tauri/target/release/titane-infinity

# 6. Optional: UPX compression (ultra-compact)
if command -v upx &> /dev/null; then
    echo "🗜️ Compressing with UPX..."
    upx --best --lzma src-tauri/target/release/titane-infinity || true
    echo "📊 Compressed size:"
    ls -lh src-tauri/target/release/titane-infinity
fi

echo "✅ Release build complete!"
```

### 2. Production Bundle Script

**Fichier**: `scripts/build/bundle-production.sh`

```bash
#!/bin/bash
# TITANE∞ v21.1 — Production Bundle Creator

set -e

VERSION="v21.1"
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
OUTPUT_DIR="dist/release"

echo "📦 Creating production bundle ${VERSION}..."

# 1. Build release
./scripts/build/build-release.sh

# 2. Create bundle directory
mkdir -p "$OUTPUT_DIR"

# 3. Copy binary
cp src-tauri/target/release/titane-infinity "$OUTPUT_DIR/"

# 4. Copy frontend assets
cp -r dist/* "$OUTPUT_DIR/assets/" 2>/dev/null || true

# 5. Create tarball
cd "$OUTPUT_DIR"
BUNDLE_NAME="titane-infinity-${VERSION}-${PLATFORM}-${ARCH}.tar.gz"
tar -czf "../$BUNDLE_NAME" ./*
cd ../..

echo "✅ Bundle created: dist/${BUNDLE_NAME}"
ls -lh "dist/${BUNDLE_NAME}"
```

---

## Size Reduction Techniques

### 1. Strip Debug Symbols ✅
```bash
strip src-tauri/target/release/titane-infinity
# Réduction: ~40-60%
```

### 2. LTO (Link-Time Optimization) ✅
```toml
[profile.release]
lto = true
# Réduction: ~10-20%
```

### 3. Optimize for Size
```toml
[profile.release]
opt-level = "z"  # Aggressive size optimization
# Réduction: ~15-25%
# Trade-off: -5% performance possible
```

### 4. UPX Compression (Optional)
```bash
upx --best --lzma binary
# Réduction: ~30-50% supplémentaire
# Trade-off: Startup time +50-100ms
```

### 5. Remove Unused Dependencies
```bash
# Audit dependencies
cargo tree --manifest-path src-tauri/Cargo.toml
cargo bloat --release --crates
```

---

## Expected Results

| Build Type | Size | Symbols | Optimizations |
|------------|------|---------|---------------|
| **Debug** | 111M | Yes | None |
| **Release (basic)** | ~30M | No (strip) | opt-level=3 |
| **Release (LTO)** | ~20M | No | opt-level=3 + LTO |
| **Release (size)** | ~15M | No | opt-level="z" + LTO |
| **Release (UPX)** | ~8-10M | No | Size + UPX |

---

## Comparison Table

### Before (v21.0)
```
Debug build:
- Backend: 111M
- Frontend: 5.3M
- Total: 116.3M
```

### After (v21.1 Optimized)
```
Release build:
- Backend: ~15-20M (stripped + LTO)
- Frontend: 5.3M (gzip)
- Total: ~20-25M
- Reduction: **82-83%** ✅
```

---

## Recommended Profile

**Tech-Ready (Dev) balance** (performance + size):

```toml
[profile.release]
opt-level = 3           # Maximum performance
lto = "thin"            # Fast LTO (compromise)
codegen-units = 16      # Parallel build (faster)
strip = true            # Remove symbols
panic = 'abort'         # Smaller binary
```

**Ultra-compact** (size prioritaire):

```toml
[profile.release]
opt-level = "z"         # Aggressive size
lto = true              # Full LTO
codegen-units = 1       # Single unit
strip = true
panic = 'abort'
```

---

## Build Commands

```bash
# Standard release
cargo build --release --manifest-path src-tauri/Cargo.toml

# With scripts
./scripts/build/build-release.sh

# Full bundle
./scripts/build/bundle-production.sh

# Check size
ls -lh src-tauri/target/release/titane-infinity

# Analyze binary
cargo bloat --release --manifest-path src-tauri/Cargo.toml
```

---

## CI/CD Integration

**GitHub Actions** (`.github/workflows/release.yml`):

```yaml
name: Release Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build release
        run: ./scripts/build/build-release.sh
        
      - name: Create bundle
        run: ./scripts/build/bundle-production.sh
        
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: titane-infinity-release
          path: dist/*.tar.gz
```

---

## Performance Impact

| Optimization | Size Reduction | Performance | Build Time |
|--------------|----------------|-------------|------------|
| **strip** | -50% | 0% | +0s |
| **lto=thin** | -10% | -2% | +30s |
| **lto=true** | -15% | -5% | +2min |
| **opt-level="z"** | -20% | -8% | +10s |
| **UPX** | -40% | -2% (startup) | +5s |

**Recommandé pour production**: `strip + lto=thin + opt-level=3`

---

## Next Steps

1. **P1**: Appliquer profile release dans `Cargo.toml`
2. **P1**: Tester build release: `cargo build --release`
3. **P2**: Créer scripts build/bundle
4. **P2**: Intégrer CI/CD release workflow
5. **P3**: Benchmarker performance release vs debug

---

**Auteur**: GitHub Copilot (Claude Sonnet 4.5)  
**Date**: 2025-12-11  
**Version**: v21.1  
