# 🚀 TITANE∞ — INSTALLATION & SETUP GUIDE v27.0.5

**Version:** 27.0.5 | **Date:** 22 February 2026

---

## 📖 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Linux Installation](#linux-installation)
3. [macOS Installation](#macos-installation)
4. [Windows Installation](#windows-installation)
5. [Initial Configuration](#initial-configuration)
6. [Setup AI Providers](#setup-ai-providers)
7. [Performance Optimization](#performance-optimization)
8. [Installation Troubleshooting](#installation-troubleshooting)

---

## 📋 PREREQUISITES

### Minimum Configuration

```
CPU:        2 GHz (4 cores recommended)
RAM:        512 MB (4 GB recommended)
Disk:       500 MB free space
Resolution: 1024x768 minimum (1920x1080 optimal)
```

### Recommended Configuration (Production)

```
CPU:        Intel i5+ / AMD Ryzen 5+
RAM:        8 GB
Disk:       SSD, 2 GB space
Resolution: 1920x1080 or higher
Internet:   Optional (for cloud providers)
```

### System Dependencies

#### Linux (Ubuntu/Debian)

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Essential dependencies
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev

# Optional dependencies (recommended)
sudo apt install -y \
    ffmpeg \
    sox
```

#### macOS

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Via Homebrew (recommended)
brew install git curl
```

#### Windows 10/11

```powershell
# Via chocolatey (if installed)
choco install git curl

# Or download manually:
# - Git: https://git-scm.com/download/win
# - curl: https://curl.se/download.html
```

---

## 🐧 LINUX INSTALLATION

### Method 1: AppImage (Recommended)

**Advantages:** Easy, no dependencies, portable

```bash
# 1. Download
cd ~/Downloads
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/TITANE-Infinity_27.0.5_amd64.AppImage

# 2. Make executable
chmod +x TITANE-Infinity_27.0.5_amd64.AppImage

# 3. Launch
./TITANE-Infinity_27.0.5_amd64.AppImage
```

**Duration:** ~2 minutes

### Method 2: APK/DEB Package

**Prerequisite:** Ubuntu 20.04+ or Debian 11+

```bash
# Download .deb
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/TITANE-Infinity_27.0.5_amd64.deb

# Install
sudo dpkg -i TITANE-Infinity_27.0.5_amd64.deb

# Or via apt (if repository enabled)
sudo apt install titane-infinity

# Launch
titane-infinity
# Or via applications menu
```

**Duration:** ~1 minute

### Method 3: Build from Source

**For developers & contributors**

```bash
# 1. Clone repo
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Install Node.js (18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 4. Install frontend dependencies
pnpm install  # or npm install

# 5. Build production
pnpm run build  # creates dist/

# 6. Build Tauri (desktop app)
pnpm run tauri build

# 7. Resulting AppImage
ls src-tauri/target/release/bundle/appimage/Titan-Stable_*.AppImage
```

**Duration:** ~10-15 minutes (first time)

---

## 🍎 MACOS INSTALLATION

### Method 1: DMG (Recommended)

**For non-technical users**

```bash
# 1. Download
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/TITANE-Infinity_27.0.5_x64.dmg

# 2. Mount DMG
open TITANE-Infinity_27.0.5_x64.dmg

# 3. Drag-drop to Applications
# Appears in DMG automount

# 4. Launch from Launchpad or Applications
open /Applications/TITANE.app
```

**Duration:** ~2 minutes

### Method 2: Homebrew

**If you use Homebrew**

```bash
# Install (if tap available)
brew tap KallokTherok1994/titane
brew install titane

# Launch
titane
```

### Method 3: Build for M1/M2 (Apple Silicon)

```bash
# On Apple Silicon Mac (M1/M2)
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# Install Rust (auto-detects ARM64)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node
brew install node@18

# Install dependencies
pnpm install

# Build for M1/M2
pnpm run tauri build  # Auto-detects arch

# Result
ls src-tauri/target/release/bundle/macos/
```

---

## 🪟 WINDOWS INSTALLATION

### Method 1: MSI Installer (Recommended)

**For standard Windows users**

```powershell
# 1. Download MSI
Invoke-WebRequest -Uri "https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/TITANE-Infinity_27.0.5_x64.msi" `
  -OutFile "$env:USERPROFILE\Downloads\TITANE-Infinity_27.0.5_x64.msi"

# 2. Launch installer
& "$env:USERPROFILE\Downloads\TITANE-Infinity_27.0.5_x64.msi"

# 3. Follow wizard (Next → Next → Finish)

# 4. TITANE appears in Start Menu
```

**Duration:** ~2-3 minutes

### Method 2: Portable EXE

```powershell
# 1. Download portable ZIP
Invoke-WebRequest -Uri "https://github.com/.../TITANE-Infinity_27.0.5_portable.zip" `
  -OutFile "TITANE_portable.zip"

# 2. Extract
Expand-Archive "TITANE_portable.zip" -DestinationPath "$env:USERPROFILE\TITANE"

# 3. Launch
& "$env:USERPROFILE\TITANE\TITANE.exe"

# Advantage: No installation, works immediately
```

### Method 3: Winget (Windows 11+)

```powershell
# If winget is available
winget install titane.titane-infinity

# Launch
titane
```

### Method 4: Build from Source

**For Windows developers**

```powershell
# 1. Install Rust
# Visit: https://rustup.rs/
# Download & run: rustup-init.exe

# 2. Install Node.js
# Visit: https://nodejs.org/
# Download & install LTS (18.x)

# 3. Install pnpm
npm install -g pnpm

# 4. Clone repo
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 5. Install dependencies
pnpm install

# 6. Build
pnpm run tauri build

# 7. MSI result
ls src-tauri\target\release\bundle\msi\
```

**Duration:** ~15-20 minutes (first time)

---

## ⚙️ INITIAL CONFIGURATION

💡 **After setup:** Discover all features in the [Complete User Manual](./USER_MANUAL_COMPLETE_v27.0.0_EN.md).

### First Launch

On first startup, TITANE displays a **Setup Wizard**:

```
┌──────────────────────────────────────────────┐
│  Welcome to TITANE∞ v27.0.5                 │
│                                              │
│  🎯 Step 1/4: Accept Terms                  │
└──────────────────────────────────────────────┘

Please read & accept:
□ Terms of Use (EN)
□ Privacy Policy
□ Proprietary License

[Decline]  [Accept & Continue]
```

**Go through 4 steps:**

1. **Terms of Use** — Read & accept
2. **Profile Configuration** — Your name, email, role
3. **AI Provider** — Choose: Ollama, Gemini, Local?
4. **Memory** — Initialize database

### Step 1: Legal Terms

```
✅ Read all terms
✅ Check all 3 boxes
✅ Click [Accept & Continue]
```

**Files created:**
```
~/.titane/
  ├─ config.json (configuration)
  ├─ memory/ (database)
  └─ logs/ (log files)
```

### Step 2: User Profile

```
┌──────────────────────────────────┐
│ 📋 Step 2/4: Profile Setup     │
├──────────────────────────────────┤
│                                  │
│ First Name: _________ Alice      │
│ Last Name: _______________ Dubois│
│                                  │
│ Email: __________________ │
│ alice@example.com       │
│                                  │
│ Role:                            │
│ ○ Developer    ○ Creative       │
│ ○ Manager      ○ Student        │
│ ○ Researcher   ○ Other          │
│                                  │
│ Language: [English ▼]            │
│ Timezone: [Europe/Paris ▼]      │
│                                  │
│            [Back] [Next]         │
│                                  │
└──────────────────────────────────┘
```

**Fill honestly** (used for personalization):
- Full name
- Valid email (optional but recommended)
- Primary role
- Preferred language

### Step 3: AI Provider

```
┌──────────────────────────────────────────┐
│ 🧠 Step 3/4: Select AI Provider        │
├──────────────────────────────────────────┤
│                                          │
│ Which AI provider do you want?           │
│                                          │
│ ○ Ollama (Local, free)                  │
│  └ Recommended! Private & fast          │
│  └ Requires: https://ollama.com        │
│                                          │
│ ○ Gemini API (Google Cloud)             │
│  └ Performant but cloud                │
│  └ Requires: API Key                    │
│                                          │
│ ○ Local Provider (Fallback)             │
│  └ Always available                     │
│  └ Basic but reliable                   │
│                                          │
│ [Installation Recommendations]          │
│                                          │
│      [Back] [Next]                      │
│                                          │
└──────────────────────────────────────────┘
```

**Recommended choice: Ollama**
- Maximum privacy (local)
- Excellent performance
- Free
- Open-source

**If you choose Ollama:**
```
1. Visit: https://ollama.com
2. Download & install for your OS
3. Launch: ollama serve
4. TITANE auto-detects
```

### Step 4: Memory Initialization

```
┌────────────────────────────────────────┐
│ 💾 Step 4/4: Initialize Memory         │
├────────────────────────────────────────┤
│                                        │
│ ✅ Creating STM database              │
│ ✅ Creating MTM cache                 │
│ ✅ Initializing LTM vault             │
│ ✅ Configuring encryption (AES-256)   │
│                                        │
│ Ready! TITANE will start...           │
│                                        │
│      [Finish Setup]                    │
│                                        │
└────────────────────────────────────────┘
```

Click [Finish Setup] and you're ready! 🚀

---

## 🔧 SETUP AI PROVIDERS

### Provider: Ollama (Local)

**Optimal Configuration**

```bash
# 1. Install Ollama
# Linux/Mac/Windows: https://ollama.com/download

# 2. Launch server
ollama serve

# 3. In another terminal, download a model
ollama pull llama2:latest  # Default model (~4GB)
# OR
ollama pull mistral:latest # Alternative model (~5GB)
# OR
ollama pull neural-chat   # Optimized for conversation

# 4. TITANE auto-detects at http://localhost:11434
```

**Verify connection:**
```bash
curl http://localhost:11434/api/version
# Should return: {"version": "..."}
```

**TITANE Settings:**
```
Settings → AI Providers
✅ Ollama: http://localhost:11434
   Model: llama2:latest ✅ Connected
```

**Performance:**
- Latency: ~2-5 seconds per response
- GPU accelerated: ~500ms if NVIDIA CUDA
- CPU: ~5-10 seconds

### Provider: Gemini API (Google)

**To use Claude/GPT-style cloud**

```bash
# 1. Create Google Cloud account
# Visit: https://cloud.google.com

# 2. Create project & enable Generative AI API
# Console: https://console.cloud.google.com

# 3. Create API Key
# Visit: https://aistudio.google.com/app/apikey

# 4. Copy the key
GEMINI_API_KEY="sk-..."
```

**TITANE Configuration:**
```
Settings → AI Providers → + Add

Type: Gemini API
API Key: [Paste your key]
Model: gemini-pro
Temperature: 0.7

[Test] → ✅ Connected!
```

**Pricing:**
- Free: ~100 requests/day
- Paid: $0.00025 per 1K input tokens

### Provider: Local (Builtin)

**Always Available (Fallback)**

No configuration needed! It's the ultimate fallback.

```
Advantage: Never "provider down" errors
Quality: Basic but reliable
Latency: ~1 second (very fast)
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Adjust AI Temperature

**Impact:** Changes creativity vs determinism

```
Settings → Chat

Temperature: [========●] 0.7 (default)

Recommendations:
• Development/Code: 0.3-0.5 (deterministic)
• Normal/Chat: 0.7 (balanced) ← Recommended
• Brainstorming: 0.9-1.0 (creative)
```

### Reduce Max Tokens

**Impact:** Shorter responses = faster

```
Settings → Chat

Max Tokens: [======●] 3000

Reduce to 2000 if:
- Responses too slow
- Limited RAM
- Slow model (Ollama CPU)

Increase to 4000 if:
- You need longer responses
- RAM available (8GB+)
- Fast model (GPU CUDA)
```

### Optimize Ollama

**For maximum performance:**

```bash
# Use fast model (7B instead of 13B)
ollama pull mistral:7b       # ⚡ Fast
ollama pull neural-chat:7b   # ⚡ Conversation
ollama pull tinyllama        # ⚡ Very light

# Don't: llama2:13b (too heavy)
```

### GPU Acceleration

**If you have NVIDIA GPU:**

```bash
# Install CUDA support for Ollama
# Visit: https://ollama.com/download

# TITANE will automatically use GPU
# Performance: 10-100x faster!

# Check GPU usage
nvidia-smi
# Should show ollama using vRAM
```

### Cache & Memory

**Clean cache periodically:**

```bash
Settings → Memory → STM → [Clear]
# This doesn't delete conversations, just cache

Settings → Memory → [Export/Import]
# For regular backup
```

---

## 🐛 INSTALLATION TROUBLESHOOTING

### "AppImage doesn't start (Linux)"

**Symptom:** Permission or FUSE error

**Solution 1 — Check permissions:**
```bash
chmod +x TITANE-Infinity_27.0.5_amd64.AppImage
./TITANE-Infinity_27.0.5_amd64.AppImage --help
```

**Solution 2 — Install FUSE:**
```bash
# Ubuntu/Debian
sudo apt install fuse libfuse2

# Fedora/RHEL
sudo dnf install fuse libfuse
```

**Solution 3 — Extract & launch:**
```bash
# Extract AppImage
./TITANE-Infinity_27.0.5_amd64.AppImage --appimage-extract
cd squashfs-root
./AppRun
```

### "Ollama: connection refused"

**Symptom:** TITANE can't find Ollama

**Checks:**
```bash
# 1. Is Ollama running?
ps aux | grep ollama
# Should show: ollama serve

# 2. Is port 11434 active?
netstat -tlnp | grep 11434
# Should show: LISTEN on :11434

# 3. Test connection manually
curl http://localhost:11434/api/version
# Should return JSON

# 4. Restart Ollama
ollama serve
```

**Solution:**
```bash
# Kill all Ollama processes
pkill -9 ollama

# Restart
ollama serve

# TITANE re-detects automatically
```

### "Not enough RAM"

**Symptom:** TITANE very slow or crashes

**Diagnosis:**
```bash
free -h  # See available RAM
```

**Solutions:**
1. **Reduce Max Token:** Settings → Chat → 2000 (instead 3000)
2. **Close other apps:** Chrome, Slack consume RAM
3. **Use light model:** Ollama → `tinyllama` (1.1GB)
4. **Upgrade RAM:** If serious, add 4GB+

### "GPU not detected (Ollama)"

**Symptom:** Ollama uses CPU even with NVIDIA GPU

**Checks:**
```bash
nvidia-smi  # NVIDIA GPU present?
# Should list your GPU

nvidia-smi -l 1  # Monitor GPU live
```

**Solutions:**
```bash
# Install Ollama with CUDA support
# Visit: https://ollama.com
# Re-download for GPU version

# Restart Ollama
pkill ollama
ollama serve

# Check nvidia-smi
# GPU vRAM should increase
```

### "Gemini API Key invalid"

**Symptom:** "API Key rejected"

**Checks:**
```bash
# 1. Key copied correctly?
# Check: no extra spaces

# 2. Key valid?
# Visit: https://aistudio.google.com/app/apikey
# Verify key is active

# 3. Generative AI API enabled?
# Google Cloud Console → APIs → Generative AI API
# Status must be: ENABLED
```

**Solution:**
```bash
# Generate new key
1. Visit: https://aistudio.google.com/app/apikey
2. Click [Create API Key]
3. Copy-paste in Settings
4. [Test] → ✅
```

### "Very slow startup (10+ seconds)"

**Possible causes:**
- Slow hard disk (SSD recommended)
- Too much cache accumulated
- Fragmented memory

**Solutions:**
```bash
# 1. Clean cache
rm -rf ~/.titane/cache

# 2. Reset STM
Settings → Memory → STM → [Clear]

# 3. Defragment (Linux)
sudo fstrim -v /

# 4. Migrate to SSD if HDD
```

### "Build from Source fails (Rust)"

**Symptom:** Error during `pnpm run tauri build`

```bash
# 1. Update Rust
rustup update

# 2. Install dependencies
# See "Prerequisites" section for your OS

# 3. Clean Rust cache
cargo clean

# 4. Re-build
pnpm run tauri build
```

---

## ✅ POST-INSTALLATION CHECKLIST

Before using TITANE in production:

- [ ] ✅ TITANE starts without error
- [ ] ✅ First chat works
- [ ] ✅ AI Provider connected (verify /status)
- [ ] ✅ Camera detected (if Vision enabled)
- [ ] ✅ Memory initialized
- [ ] ✅ No errors in logs
- [ ] ✅ Performance acceptable (responses < 5s)
- [ ] ✅ Memory export works
- [ ] ✅ Initial backup done
- [ ] ✅ 5 essential shortcuts learned
- [ ] ✅ Settings configured
- [ ] ✅ Backup policy defined

---

## 🎓 COMPLEMENTARY RESOURCES

### Documentation

- 📚 **User Manual:** `USER_MANUAL_COMPLETE_v27.0.0_EN.md`
- 🎓 **Tutorials:** `TUTORIALS_PRACTICAL_EXAMPLES_v27.0.0_EN.md`
- 📖 **Index:** `DOCUMENTATION_INDEX_v27.0.0_EN.md`
- 🔧 **API Reference:** `/docs/06_api/TAURI_COMMANDS_REFERENCE.md`

### Support

- 💬 **Discord Community:** `discord.gg/titane`
- 🐛 **Issue Tracker:** `github.com/KallokTherok1994/TITANE_INFINITY/issues`
- 📧 **Email Support:** `support@titane.dev`
- 📺 **Video Tutorials:** `youtube.com/@titane-infinity`

### Useful Links

- 🌐 **Website:** `titane-infinity.dev`
- 📦 **Releases:** `github.com/KallokTherok1994/TITANE_INFINITY/releases`
- 📝 **Blog:** `blog.titane-infinity.dev`
- 🎨 **Design System:** `/docs/design/`

---

**TITANE∞ v27.0.5 — Complete Installation & Setup Guide**
*Created: 31 January 2026 | Validated by Kevin Thibault*
*Last updated: 31 January 2026 | Version: 27.0.0*
*For detailed support: support@titane.dev or Discord community*
*Copyright © 2025 Humain Total / TITANE Team. All rights reserved.*
