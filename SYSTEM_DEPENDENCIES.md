# 📦 System Dependencies - TITANE∞ v26.2.3

**Last Updated:** 2026-01-03  
**Platform Support:** Linux (Ubuntu/Debian), macOS, Windows

---

## 🎯 Quick Start

### Ubuntu/Debian (Recommended)

```bash
# Essential dependencies
sudo apt update
sudo apt install -y \
    build-essential \
    curl \
    wget \
    git \
    pkg-config \
    libssl-dev

# Audio support (optional - for audio-capture feature)
sudo apt install -y libasound2-dev

# Tauri dependencies
sudo apt install -y \
    libwebkit2gtk-4.0-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### macOS

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# No additional system dependencies required for basic functionality
```

### Windows

```bash
# Install via winget (Windows 11)
winget install Microsoft.VisualStudio.2022.BuildTools
winget install Git.Git

# Or download manually:
# - Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
# - Git: https://git-scm.com/download/win
```

---

## 📚 Detailed Dependencies

### Required (All Platforms)

| Dependency      | Purpose             | Installation                                                                                       |
| --------------- | ------------------- | -------------------------------------------------------------------------------------------------- |
| **Rust 1.83+**  | Backend compilation | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh`                                  |
| **Node.js 18+** | Frontend build      | `curl -fsSL https://deb.nodesource.com/setup_18.x \| sudo -E bash - && sudo apt install -y nodejs` |
| **pnpm 8+**     | Package manager     | `npm install -g pnpm`                                                                              |

### Platform-Specific

#### Linux (Ubuntu/Debian)

| Dependency                       | Purpose           | Feature  | Installation                                    |
| -------------------------------- | ----------------- | -------- | ----------------------------------------------- |
| **build-essential**              | Compilation tools | Core     | `sudo apt install build-essential`              |
| **libssl-dev**                   | SSL/TLS support   | Core     | `sudo apt install libssl-dev`                   |
| **pkg-config**                   | Library detection | Core     | `sudo apt install pkg-config`                   |
| **libwebkit2gtk-4.0-dev**        | Tauri webview     | Core     | `sudo apt install libwebkit2gtk-4.0-dev`        |
| **libgtk-3-dev**                 | GTK windowing     | Core     | `sudo apt install libgtk-3-dev`                 |
| **libayatana-appindicator3-dev** | System tray       | Core     | `sudo apt install libayatana-appindicator3-dev` |
| **librsvg2-dev**                 | SVG rendering     | Core     | `sudo apt install librsvg2-dev`                 |
| **libasound2-dev**               | Audio capture     | Optional | `sudo apt install libasound2-dev`               |

#### macOS

| Dependency          | Purpose     | Feature | Installation             |
| ------------------- | ----------- | ------- | ------------------------ |
| **Xcode CLI Tools** | Compilation | Core    | `xcode-select --install` |

#### Windows

| Dependency                    | Purpose       | Feature | Installation            |
| ----------------------------- | ------------- | ------- | ----------------------- |
| **Visual Studio Build Tools** | Compilation   | Core    | Download from Microsoft |
| **WebView2 Runtime**          | Tauri webview | Core    | Auto-installed by Tauri |

---

## 🔧 Optional Dependencies

### ONNX Runtime (AI Inference)

**Purpose:** Enable local AI model inference with ONNX  
**Feature Flag:** `onnx`

#### Linux

```bash
# Download ONNX Runtime
wget https://github.com/microsoft/onnxruntime/releases/download/v1.16.3/onnxruntime-linux-x64-1.16.3.tgz
tar -xzf onnxruntime-linux-x64-1.16.3.tgz

# Set environment variable
export LD_LIBRARY_PATH=/path/to/onnxruntime/lib:$LD_LIBRARY_PATH
```

#### macOS

```bash
# Download ONNX Runtime for macOS
wget https://github.com/microsoft/onnxruntime/releases/download/v1.16.3/onnxruntime-osx-x86_64-1.16.3.tgz
tar -xzf onnxruntime-osx-x86_64-1.16.3.tgz

# Set environment variable
export DYLD_LIBRARY_PATH=/path/to/onnxruntime/lib:$DYLD_LIBRARY_PATH
```

#### Windows

```powershell
# Download and extract ONNX Runtime
# Add to PATH in System Environment Variables
```

### Ollama (Local LLM)

**Purpose:** Run local language models  
**Optional:** For offline AI functionality

```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
ollama serve

# Pull a model
ollama pull llama2
```

---

## 🚀 Building TITANE∞

### Development Build

```bash
# Install Rust dependencies
cd src-tauri
cargo build

# Install Node dependencies
cd ..
pnpm install

# Run development server
pnpm tauri dev
```

### Production Build

```bash
# Build release version
pnpm tauri build

# Output locations:
# - Linux: src-tauri/target/release/bundle/
# - macOS: src-tauri/target/release/bundle/macos/
# - Windows: src-tauri/target/release/bundle/msi/
```

---

## 🧪 Testing Dependencies

### Cargo Test

```bash
cd src-tauri
cargo test --all --features full
```

### Frontend Tests

```bash
pnpm test
pnpm test:e2e
```

---

## 🔍 Verification Commands

### Check System Dependencies

```bash
# Linux
dpkg -l | grep -E "libssl-dev|libasound2-dev|libwebkit2gtk"

# macOS
xcode-select -p

# Check Rust
rustc --version  # Should be 1.83+

# Check Node
node --version   # Should be 18+

# Check pnpm
pnpm --version   # Should be 8+
```

### Verify Cargo Features

```bash
cd src-tauri

# List available features
cargo metadata --format-version 1 | jq '.packages[] | select(.name == "titane-infinity") | .features'

# Build with specific features
cargo build --features "audio-capture,onnx"
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. `pkg-config not found`

```bash
sudo apt install pkg-config
```

#### 2. `libssl-dev not found`

```bash
sudo apt install libssl-dev
```

#### 3. `libasound2-dev not found` (audio-capture feature)

```bash
sudo apt install libasound2-dev
```

#### 4. `webkit2gtk not found`

```bash
sudo apt install libwebkit2gtk-4.0-dev
```

#### 5. ONNX Runtime linking errors

```bash
# Ensure LD_LIBRARY_PATH is set correctly
export LD_LIBRARY_PATH=/path/to/onnxruntime/lib:$LD_LIBRARY_PATH

# Verify library exists
ls /path/to/onnxruntime/lib/libonnxruntime.so
```

#### 6. Cargo build fails with linker errors

```bash
# Linux: Install build essentials
sudo apt install build-essential

# macOS: Install Xcode CLI tools
xcode-select --install
```

---

## 📋 Dependency Matrix

| Feature           | Linux Packages                          | macOS                | Windows              | Optional |
| ----------------- | --------------------------------------- | -------------------- | -------------------- | -------- |
| **Core Build**    | build-essential, libssl-dev, pkg-config | Xcode CLI            | VS Build Tools       | ❌       |
| **Tauri UI**      | libwebkit2gtk-4.0-dev, libgtk-3-dev     | Built-in             | WebView2             | ❌       |
| **Audio Capture** | libasound2-dev                          | Core Audio           | WinAPI               | ✅       |
| **ONNX Runtime**  | Download from GitHub                    | Download from GitHub | Download from GitHub | ✅       |
| **System Tray**   | libayatana-appindicator3-dev            | Built-in             | Built-in             | ❌       |

---

## 🔄 Updating Dependencies

### System Packages

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade

# macOS
brew update && brew upgrade
```

### Rust Dependencies

```bash
cd src-tauri
cargo update
cargo audit  # Check for security vulnerabilities
```

### Node Dependencies

```bash
pnpm update
pnpm audit  # Check for security vulnerabilities
```

---

## 📞 Support

**Issues:** GitHub Issues  
**Documentation:** docs/  
**Community:** Discord (link in README.md)

---

**Maintainers:** TITANE∞ Team  
**Last Review:** 2026-01-03

---

✅ **System Dependencies Documentation Complete**
