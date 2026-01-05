#!/usr/bin/env bash
# TITANE∞ - Setup local Node.js toolchain in .tools/
# Usage: ./scripts/install/setup-local-tools.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS" in
  linux) OS="linux";;
  darwin) OS="darwin";;
  *) echo "Unsupported OS: $OS"; exit 2;;
 esac

case "$ARCH" in
  x86_64|amd64) ARCH="x64";;
  arm64|aarch64) ARCH="arm64";;
  *) echo "Unsupported arch: $ARCH"; exit 2;;
 esac

PLATFORM="${OS}-${ARCH}"
NODE_VERSION="${TITANE_NODE_VERSION:-24.0.0}"

TOOLS_ROOT="$REPO_ROOT/.tools/node"
EXTRACT_DIR="$TOOLS_ROOT/_extract"

mkdir -p "$EXTRACT_DIR"

TARBALL="node-v${NODE_VERSION}-${PLATFORM}.tar.xz"
BASE_URL="https://nodejs.org/dist/v${NODE_VERSION}"

# Extract (idempotent). We download into a temp file to avoid committing binaries into the repo.
if [[ ! -d "$EXTRACT_DIR/node-v${NODE_VERSION}-${PLATFORM}" ]]; then
  tmp_tar="$(mktemp -t titane-node.XXXXXX.tar.xz)"
  tmp_sums="$(mktemp -t titane-node.XXXXXX.SHASUMS256.txt)"
  trap 'rm -f "$tmp_tar" "$tmp_sums"' EXIT

  echo "[tools] Downloading $TARBALL"
  curl -fsSL -o "$tmp_tar" "$BASE_URL/$TARBALL"

  # Best-effort checksum verification (skip if SHASUMS fetch fails)
  if curl -fsSL -o "$tmp_sums" "$BASE_URL/SHASUMS256.txt" 2>/dev/null; then
    expected="$(grep " $TARBALL$" "$tmp_sums" | awk '{print $1}' || true)"
    if [[ -n "${expected:-}" ]]; then
      echo "${expected}  $tmp_tar" | sha256sum -c - >/dev/null
    fi
  fi

  echo "[tools] Extracting to $EXTRACT_DIR/node-v${NODE_VERSION}-${PLATFORM}"
  tar -xf "$tmp_tar" -C "$EXTRACT_DIR"
fi

ln -sfn "$EXTRACT_DIR/node-v${NODE_VERSION}-${PLATFORM}" "$TOOLS_ROOT/current"

echo "[tools] Current toolchain: $TOOLS_ROOT/current"
"$TOOLS_ROOT/current/bin/node" --version

# Ensure pnpm/pnpx shims exist (some Node distros expose pnpm via corepack only)
if [[ -f "$TOOLS_ROOT/current/lib/node_modules/corepack/dist/pnpm.js" ]]; then
  if [[ ! -e "$TOOLS_ROOT/current/bin/pnpm" ]]; then
    ln -s ../lib/node_modules/corepack/dist/pnpm.js "$TOOLS_ROOT/current/bin/pnpm"
  fi
  if [[ -f "$TOOLS_ROOT/current/lib/node_modules/corepack/dist/pnpx.js" && ! -e "$TOOLS_ROOT/current/bin/pnpx" ]]; then
    ln -s ../lib/node_modules/corepack/dist/pnpx.js "$TOOLS_ROOT/current/bin/pnpx"
  fi
fi

# Verify pnpm via the repo wrapper (uses corepack pnpm.js)
if [[ -x "$REPO_ROOT/pnpm-local.sh" ]]; then
  "$REPO_ROOT/pnpm-local.sh" --version
fi
