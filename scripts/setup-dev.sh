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

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install

# Setup pre-commit hooks
echo "🔧 Setting up pre-commit hooks..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
npm run lint
npm test
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

echo "✅ Setup complete! Run 'npm run dev' to start."
