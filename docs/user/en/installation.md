# TITANE∞ — Installation (EN)

**Version:** 28.0.0  
**Status:** PARTIAL  
**Date:** 2026-03-17

---

## Supported systems

> Status: PROVEN for v27.0.5 (last published binary release)

| System | Support | Notes |
|---|---|---|
| Ubuntu 20.04+ | ✅ PROVEN | AppImage + DEB tested |
| Debian 11+ | ✅ PROVEN | DEB tested |
| Linux Mint 20+ | ✅ PROVEN | AppImage tested |
| Pop!_OS 20.04+ | ✅ PROVEN | AppImage tested |
| Windows | ⚠️ PARTIAL | Declared, not CI-verified |
| macOS | ⚠️ PARTIAL | Declared, not CI-verified |

---

## Option A — Install from published binary (Linux, recommended)

### 1. Download the latest release

```bash
# DEB (Debian/Ubuntu)
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/TITANE-Infinity_27.0.5_amd64.deb

# AppImage (universal Linux)
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/Titan-Stable_27.0.5_amd64.AppImage
```

### 2. Install

```bash
# For DEB:
sudo dpkg -i TITANE-Infinity_27.0.5_amd64.deb
sudo apt-get install -f  # Resolve missing dependencies if needed

# For AppImage:
chmod +x Titan-Stable_27.0.5_amd64.AppImage
./Titan-Stable_27.0.5_amd64.AppImage
```

### 3. Verify checksums (recommended)

```bash
cat deployment/latest/SHA256SUMS_v27.0.5.txt
sha256sum -c SHA256SUMS_v27.0.5.txt
```

---

## Option B — Install from source (developers)

> For source installation, see: [docs/dev/en/environment-setup.md](../../dev/en/environment-setup.md)

### Minimum prerequisites

- Node.js ≥ 20.x
- pnpm ≥ 9.x
- Rust (2021 edition)
- Cargo (stable)
- Tauri CLI v2.x

```bash
# Clone the repository
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# Install dependencies
pnpm install

# Launch in dev mode
pnpm run dev
```

---

## Initial configuration

After installation, TITANE∞ requires configuring at least one AI provider.

See: [Settings, Security and Privacy](./settings-security-and-privacy.md)

---

## Installation issues?

See: [Troubleshooting](./troubleshooting.md)

---

*French documentation: [docs/user/fr/installation.md](../fr/installation.md)*
