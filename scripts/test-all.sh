#!/bin/bash

set -e

echo "🧪 Running all tests for TITANE_INFINITY..."

# Frontend tests
echo "📦 Frontend unit tests..."
pnpm test -- --coverage --silent

# Backend tests
echo "🦀 Rust tests..."
cargo test --quiet

# Linting
echo "🔍 Linting..."
pnpm run lint

# Type checking
echo "📝 Type checking..."
pnpm run check

# E2E tests
echo "🎭 E2E tests..."
pnpm run test:e2e

# Security scan
echo "🔐 Security audit..."
pnpm audit --production
cargo audit

# A11y tests
echo "♿ Accessibility tests..."
pnpm run test:a11y

echo "✅ All tests passed!"
