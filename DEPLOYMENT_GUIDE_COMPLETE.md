# 🚀 TITANE∞ Complete Deployment Guide

## Overview

This guide documents the ultra-complete deployment scripts for TITANE∞ v26.3.0. Two implementations are provided:

1. **Bash Script** (`deploy-complete.sh`) — Comprehensive shell-based deployment
2. **Python Orchestrator** (`deploy-orchestrator.py`) — Advanced deployment with reporting

---

## Prerequisites

### System Requirements
- **OS:** Linux (Ubuntu 20.04+, Debian 11+, Fedora 38+)
- **Architecture:** x86_64 (64-bit)
- **RAM:** 4 GB minimum recommended
- **Disk:** 5 GB free space

### Required Software
```bash
# Check prerequisites
which git node npm pnpm cargo rustc
```

Ensure you have:
- `git` — Version control
- `node` — JavaScript runtime (v18+)
- `npm` / `pnpm` — Package managers
- `cargo` / `rustc` — Rust toolchain

### Install Prerequisites (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y \
  git \
  curl \
  build-essential \
  pkg-config \
  libssl-dev \
  libgtk-3-dev \
  libwebkit2gtk-4.0-dev

# Install Node (if not present)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm (if not present)
npm install -g pnpm

# Install Rust (if not present)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

---

## 🚀 Quick Start

### Option 1: Complete Bash Deployment
```bash
cd /path/to/TITANE_INFINITY

# Make script executable
chmod +x scripts/deploy-complete.sh

# Run with default options
./scripts/deploy-complete.sh

# Or with specific options
./scripts/deploy-complete.sh --skip-tests --install
```

### Option 2: Python Orchestrator
```bash
cd /path/to/TITANE_INFINITY

# Make script executable
chmod +x scripts/deploy-orchestrator.py

# Run orchestrator
python3 scripts/deploy-orchestrator.py

# With options
python3 scripts/deploy-orchestrator.py --repo-root /path/to/repo --verbose
```

### Option 3: Quick Manual Deployment
```bash
cd /path/to/TITANE_INFINITY

# Install dependencies
pnpm install --frozen-lockfile

# Run tests
pnpm run lint
npx tsc --noEmit

# Build production
pnpm run build
pnpm run tauri:build

# Copy artifacts
mkdir -p deployment/v26.3.0
cp src-tauri/target/release/bundle/appimage/*.AppImage deployment/v26.3.0/
cp src-tauri/target/release/bundle/deb/*.deb deployment/v26.3.0/
```

---

## 📋 Bash Script Usage

### Full Syntax
```bash
./scripts/deploy-complete.sh [OPTIONS]
```

### Command Options

| Option | Description |
|--------|-------------|
| `--skip-tests` | Skip code quality checks (TypeScript, ESLint) |
| `--skip-build` | Skip Tauri build, use existing artifacts |
| `--install` | Install artifacts to system |
| `--no-smoke-test` | Skip smoke testing |
| `--verbose` | Enable verbose output |
| `--help` | Show help message |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SKIP_TESTS` | `false` | Skip code quality checks |
| `SKIP_BUILD` | `false` | Skip production build |
| `INSTALL_SYSTEM` | `false` | Install to system |
| `SMOKE_TEST` | `true` | Enable smoke testing |
| `VERBOSE` | `false` | Verbose output |

### Examples

**Complete deployment (everything):**
```bash
./scripts/deploy-complete.sh
```

**Skip tests, build only:**
```bash
./scripts/deploy-complete.sh --skip-tests
```

**Build and install to system:**
```bash
./scripts/deploy-complete.sh --install
```

**Use existing artifacts, just test:**
```bash
./scripts/deploy-complete.sh --skip-build --no-smoke-test
```

**Skip tests and install:**
```bash
SKIP_TESTS=true INSTALL_SYSTEM=true ./scripts/deploy-complete.sh
```

---

## 🔄 Deployment Phases

Both scripts execute the following phases:

### Phase 1: Requirements Check
- Verify all system commands available
- Check repository structure
- Validate Node.js and Rust versions

### Phase 2: Environment Setup
- Create deployment directories
- Setup logging
- Prepare build paths

### Phase 3: Install Dependencies
- `pnpm install --frozen-lockfile`
- Resolve Rust crates
- Verify package managers

### Phase 4: Code Quality Checks
- **TypeScript:** `npx tsc --noEmit --skipLibCheck`
- **ESLint:** `pnpm exec eslint . --max-warnings 0`
- **Prettier:** Format validation
- **Cargo:** `cargo check`

### Phase 5: Vite Frontend Build
- Bundle JavaScript/TypeScript
- Optimize CSS/assets
- Generate source maps
- Duration: ~9-10 seconds

### Phase 6: Production Build (Tauri)
- Compile Rust backend
- Create native executables
- Bundle with frontend
- Generate AppImage + DEB

### Phase 7: Artifact Staging
- Copy AppImage to deployment directory
- Copy DEB package to deployment directory
- Generate SHA256 checksums
- Create manifest

### Phase 8: Installation (Optional)
- Install AppImage to `/opt/titane-infinity/`
- Install DEB with `sudo dpkg -i`
- Create symbolic links
- Update applications menu

### Phase 9: Smoke Testing
- Launch AppImage (30 second timeout)
- Test installed DEB binary
- Verify no fatal errors

### Phase 10: Report Generation
- Create deployment report
- Document all artifacts
- List checksums
- Save build logs

---

## 📦 Artifact Information

### AppImage
- **Filename:** `TITANE-Infinity_26.3.0_amd64.AppImage`
- **Size:** ~82 MB
- **Type:** Self-contained executable
- **Installation:** Direct execution (no install needed)
- **Use Case:** Portable deployment, universal Linux compatibility

**Installation:**
```bash
chmod +x TITANE-Infinity_26.3.0_amd64.AppImage
./TITANE-Infinity_26.3.0_amd64.AppImage
```

### DEB Package
- **Filename:** `TITANE-Infinity_26.3.0_amd64.deb`
- **Size:** ~9.1 MB
- **Type:** Debian package
- **Installation:** Via `dpkg` or `apt`
- **Use Case:** System integration, desktop entry, updates

**Installation:**
```bash
sudo dpkg -i TITANE-Infinity_26.3.0_amd64.deb
titane-infinity
```

### Checksums
- **File:** `CHECKSUMS.sha256`
- **Format:** Standard sha256sum format
- **Verification:**
```bash
sha256sum -c CHECKSUMS.sha256
```

---

## 🧪 Testing

### Smoke Testing
The scripts include automated smoke testing:

```bash
# Test AppImage (30 seconds)
timeout 30s ./TITANE-Infinity_26.3.0_amd64.AppImage

# Test installed DEB
timeout 30s titane-infinity
```

**Expected Results:**
- ✅ Application launches
- ✅ No WebKit errors
- ✅ No "Maximum update depth" errors
- ✅ Clean shutdown

### Manual Testing
```bash
# Extract AppImage for inspection
./TITANE-Infinity_26.3.0_amd64.AppImage --appimage-extract

# Check DEB contents
dpkg-deb -c TITANE-Infinity_26.3.0_amd64.deb

# Verify installation
which titane-infinity
titane-infinity --version
```

---

## 📊 Build Reports

### Location
- **Bash Script:** Saves to `deployment/v26.3.0/DEPLOYMENT_REPORT_*.md`
- **Python Orchestrator:** Saves to `deployment/v26.3.0/deployment_report.json`
- **Build Log:** `/tmp/titane_deploy_*.log`

### Report Contents

**Markdown Report:**
- Build metadata
- Artifact listing with sizes
- SHA256 checksums
- Installation instructions
- Test results

**JSON Report:**
```json
{
  "timestamp": "2026-01-18T10:30:00.000Z",
  "duration_seconds": 450,
  "status": "SUCCESS",
  "phases_completed": ["Prerequisites", "Dependencies", ...],
  "artifacts_created": ["TITANE-Infinity_26.3.0_amd64.AppImage (82.0 MB)", ...],
  "warnings": [],
  "errors": []
}
```

---

## 🚨 Troubleshooting

### Issue: "pnpm: command not found"
```bash
npm install -g pnpm
# or
corepack enable pnpm
```

### Issue: "cargo: command not found"
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Issue: Permission denied when installing DEB
```bash
# Use sudo
sudo dpkg -i TITANE-Infinity_26.3.0_amd64.deb
```

### Issue: AppImage won't execute
```bash
# Make executable
chmod +x TITANE-Infinity_26.3.0_amd64.AppImage

# Run with debug
./TITANE-Infinity_26.3.0_amd64.AppImage --help
```

### Issue: Build fails with WebKit error
```bash
# Install WebKit dependencies
sudo apt-get install -y libwebkit2gtk-4.0-dev

# Clean and rebuild
rm -rf src-tauri/target
cargo clean
pnpm run tauri:build
```

### Issue: Port already in use
```bash
# Find and kill process
lsof -i :4000
kill -9 <PID>

# or just wait for timeout
```

---

## 🔐 Security Considerations

### Checksum Verification
Always verify artifacts with checksums:
```bash
cd deployment/v26.3.0
sha256sum -c CHECKSUMS.sha256
```

### AppImage Integrity
```bash
file TITANE-Infinity_26.3.0_amd64.AppImage
```

### DEB Signature
```bash
dpkg-deb --info TITANE-Infinity_26.3.0_amd64.deb
```

---

## 📈 Performance Metrics

### Build Times
- **TypeScript Check:** 2-3 seconds
- **ESLint Validation:** 5-10 seconds
- **Vite Build:** 9-10 seconds
- **Rust Compilation:** 60-120 seconds
- **Total Build:** ~2-3 minutes

### Artifact Sizes
- **AppImage:** 82 MB (universal, self-contained)
- **DEB:** 9.1 MB (system package)
- **Build Cache:** 500 MB+ (src-tauri/target/)

### System Requirements
- **RAM Usage:** 2-4 GB during build
- **Disk Space:** 5+ GB required
- **CPU Cores:** 4+ cores recommended

---

## 🎯 Next Steps

### After Successful Deployment

1. **Verify Installation:**
   ```bash
   titane-infinity --version
   which titane-infinity
   ```

2. **Run Application:**
   ```bash
   # From desktop menu or terminal
   titane-infinity
   ```

3. **Check Logs:**
   ```bash
   ~/.local/share/titane-infinity/logs/
   ```

4. **Update Website:**
   - Update download link to GitHub release
   - Update version number
   - Publish release notes

5. **Community Notification:**
   - Post announcement in Discord
   - Send email newsletter
   - Update social media

---

## 📝 Advanced Usage

### CI/CD Integration
```bash
# In GitHub Actions
- name: Deploy TITANE∞
  run: ./scripts/deploy-complete.sh --skip-tests
```

### Docker Deployment
```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y [dependencies]
COPY . /app
WORKDIR /app
RUN ./scripts/deploy-complete.sh
```

### Custom Installation Path
```bash
INSTALL_DIR=/usr/local/titane ./scripts/deploy-complete.sh --install
```

---

## 📞 Support

### Get Help
```bash
./scripts/deploy-complete.sh --help
python3 scripts/deploy-orchestrator.py --help
```

### Report Issues
- GitHub Issues: https://github.com/KallokTherok1994/TITANE_INFINITY/issues
- Include:
  - OS and version
  - Output from `uname -a`
  - Build log file
  - Error messages

### Check Build Log
```bash
cat /tmp/titane_deploy_*.log
tail -f /tmp/titane_deploy.log
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-18 | Initial release |

---

**Last Updated:** 2026-01-18  
**Status:** Production Ready ✅
