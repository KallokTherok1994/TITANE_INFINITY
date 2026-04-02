#!/bin/bash

echo "🚀 Setting up TITANE_INFINITY development environment..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current: $(node -v)"
    exit 1
fi

# Check Rust
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust not found. Install from https://rustup.rs/"
    exit 1
fi

# Install pnpm dependencies
echo "📦 Installing pnpm dependencies..."
pnpm install

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
if command -v corepack >/dev/null 2>&1; then
    corepack pnpm exec playwright install
elif command -v pnpm >/dev/null 2>&1; then
    pnpm exec playwright install
else
    echo "❌ pnpm requis (corepack/pnpm introuvable)." >&2
    exit 1
fi

# Setup pre-commit hooks
echo "🔧 Setting up pre-commit hooks..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
pnpm run lint
pnpm test
EOF
chmod +x .git/hooks/pre-commit

# Create local config
echo "⚙️  Creating local config..."
mkdir -p config
if [ ! -f config/local.toml ]; then
    cp config/security.toml config/local.toml
fi

# Build Rust backend
echo "🦀 Building Rust backend..."
cd src-tauri && cargo build && cd ..

echo "✅ Setup complete! Run 'pnpm run dev' to start."
