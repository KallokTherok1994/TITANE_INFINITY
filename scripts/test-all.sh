#!/bin/bash

set -e

echo "🧪 Running all tests for TITANE_INFINITY..."

# Frontend tests
echo "📦 Frontend unit tests..."
npm test -- --coverage --silent

# Backend tests
echo "🦀 Rust tests..."
cargo test --quiet

# Linting
echo "🔍 Linting..."
npm run lint

# Type checking
echo "📝 Type checking..."
npm run check

# E2E tests
echo "🎭 E2E tests..."
npm run test:e2e

# Security scan
echo "🔐 Security audit..."
npm audit --production
cargo audit

# A11y tests
echo "♿ Accessibility tests..."
npm run test:a11y

echo "✅ All tests passed!"
