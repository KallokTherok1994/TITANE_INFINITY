#!/bin/bash
# TITANE∞ v22.0.0 - E2E Test Runner
# Automated execution of critical path tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║   🧪 TITANE∞ E2E Test Suite v22.0.0                              ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Check Playwright installation
echo "📦 Checking Playwright installation..."
if ! npx playwright --version &>/dev/null; then
  echo "❌ Playwright not found. Installing..."
  npm install -D @playwright/test
  npx playwright install
else
  PLAYWRIGHT_VERSION=$(npx playwright --version)
  echo "✅ $PLAYWRIGHT_VERSION"
fi

echo ""
echo "🔍 Test Categories:"
echo "   1. App Launch (performance, initialization)"
echo "   2. Chat Interaction (AI pipeline)"
echo "   3. Visual Engine (signatures, rendering)"
echo "   4. Engine Navigation (9 engines)"
echo "   5. System Resilience (error handling)"
echo ""

# Run specific test suite or all
TEST_SUITE="${1:-all}"

case "$TEST_SUITE" in
  critical|all)
    echo "🚀 Running Critical Path Tests..."
    npx playwright test e2e/critical --reporter=list
    ;;
  smoke)
    echo "💨 Running Smoke Tests..."
    npx playwright test e2e/smoke.test.ts --reporter=list
    ;;
  launch)
    echo "🚀 Running App Launch Tests..."
    npx playwright test e2e/critical/app-launch.spec.ts --reporter=list
    ;;
  chat)
    echo "💬 Running Chat Interaction Tests..."
    npx playwright test e2e/critical/chat-interaction.spec.ts --reporter=list
    ;;
  visual)
    echo "🎨 Running Visual Engine Tests..."
    npx playwright test e2e/critical/visual-engine.spec.ts --reporter=list
    ;;
  resilience)
    echo "🛡️ Running Resilience Tests..."
    npx playwright test e2e/critical/system-resilience.spec.ts --reporter=list
    ;;
  ui)
    echo "🎭 Running Tests with UI Mode..."
    npx playwright test --ui
    ;;
  debug)
    echo "🐛 Running Tests in Debug Mode..."
    npx playwright test --debug
    ;;
  *)
    echo "❌ Unknown test suite: $TEST_SUITE"
    echo ""
    echo "Usage: $0 [critical|smoke|launch|chat|visual|resilience|ui|debug|all]"
    exit 1
    ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║   ✅ E2E Tests Complete                                           ║"
echo "║                                                                    ║"
echo "║   📊 Report: playwright-report/index.html                         ║"
echo "║   📹 Videos: test-results/ (on failure)                           ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
