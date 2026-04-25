#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ Remote Access — Install Cloudflare Tunnel (cloudflared)
#   Installs cloudflared on Linux (amd64/arm64) or macOS.
#   Must be run once before setup-tunnel.sh.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

CLOUDFLARED_VERSION="${CLOUDFLARED_VERSION:-2025.5.0}"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"

detect_arch() {
    local arch
    arch=$(uname -m)
    case "$arch" in
        x86_64|amd64) echo "amd64" ;;
        aarch64|arm64) echo "arm64" ;;
        armv7l) echo "arm" ;;
        *) echo "unsupported: $arch" ; exit 1 ;;
    esac
}

detect_os() {
    case "$(uname -s)" in
        Linux) echo "linux" ;;
        Darwin) echo "darwin" ;;
        *) echo "unsupported"; exit 1 ;;
    esac
}

install_linux() {
    local arch="$1"
    echo "[cloudflared] Installing cloudflared ${CLOUDFLARED_VERSION} (linux/${arch})..."

    # Prefer package manager on Debian/Ubuntu
    if command -v apt-get &>/dev/null; then
        curl -fsSL "https://pkg.cloudflare.com/cloudflare-main.gpg" \
            | sudo tee /usr/share/keyrings/cloudflare-main.gpg > /dev/null
        echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main' \
            | sudo tee /etc/apt/sources.list.d/cloudflared.list
        sudo apt-get update -q
        sudo apt-get install -y cloudflared
        echo "[cloudflared] ✅ Installed via apt"
        return
    fi

    # Fallback: direct binary download
    local url="https://github.com/cloudflare/cloudflared/releases/download/${CLOUDFLARED_VERSION}/cloudflared-linux-${arch}"
    echo "[cloudflared] Downloading from: $url"
    curl -fsSL "$url" -o /tmp/cloudflared
    chmod +x /tmp/cloudflared
    sudo mv /tmp/cloudflared "${INSTALL_DIR}/cloudflared"
    echo "[cloudflared] ✅ Installed to ${INSTALL_DIR}/cloudflared"
}

install_macos() {
    if command -v brew &>/dev/null; then
        echo "[cloudflared] Installing via Homebrew..."
        brew install cloudflared
        echo "[cloudflared] ✅ Installed via Homebrew"
    else
        echo "[cloudflared] Homebrew not found. Install from: https://brew.sh"
        exit 1
    fi
}

main() {
    if command -v cloudflared &>/dev/null; then
        echo "[cloudflared] ✅ Already installed: $(cloudflared --version)"
        exit 0
    fi

    local os arch
    os=$(detect_os)
    arch=$(detect_arch)

    case "$os" in
        linux) install_linux "$arch" ;;
        darwin) install_macos ;;
    esac

    echo "[cloudflared] Verification: $(cloudflared --version)"
    echo "[cloudflared] ✅ Ready. Run scripts/remote/setup-tunnel.sh to configure."
}

main "$@"
