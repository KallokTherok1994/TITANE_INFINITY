# E2E Testing Guide — TITANE∞

## Overview

TITANE∞ has **two types of E2E tests**:

1. **Playwright E2E** (`e2e/**/*.spec.ts`) — Browser-based UI tests
2. **Vitest E2E** (`src/tests/e2e/titane_e2e.test.ts`) — Backend integration tests

Both require the **Tauri application running** to test real backend interactions.

---

## Quick Start

### 1. Playwright E2E Tests (Recommended)

Tests complete user workflows through the browser UI.

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run Playwright tests
npm run test:e2e
```

**What it tests:**

- App launch & initialization
- Chat interactions
- Visual engine rendering
- Navigation & routing
- System resilience

**Test files:**

- `e2e/critical/app-launch.spec.ts`
- `e2e/critical/chat-interaction.spec.ts`
- `e2e/critical/visual-engine.spec.ts`
- `e2e/critical/engine-navigation.spec.ts`
- `e2e/critical/system-resilience.spec.ts`

---

### 2. Vitest E2E Tests (Advanced)

Tests backend API integration via Tauri commands.

```bash
# Terminal 1: Start Titan-Dev runtime
npm run dev  # or use VS Code task: 🟢 Launch Titan-Dev

# Terminal 2: Run Vitest E2E tests
npm run test:e2e:vitest
```

**What it tests:**

- New user onboarding flow
- Legal designer workflow
- Advanced web search
- Complete cognitive loop
- Complex multi-module interactions

**Test file:**

- `src/tests/e2e/titane_e2e.test.ts` (5 scenarios, 16 tests)

---

## Test Status

### Currently Active

| Test Type      | Status     | Count | Coverage            |
| -------------- | ---------- | ----- | ------------------- |
| Unit Tests     | ✅ Active  | 2306  | 99.3%               |
| Playwright E2E | ✅ Active  | 11    | UI Critical Path    |
| Vitest E2E     | ⏭️ Skipped | 16    | Backend Integration |

### Why Vitest E2E Tests Are Skipped

The 16 Vitest E2E tests are **skipped by default** in CI/unit test runs because:

1. **Require running Tauri backend** (invoke() calls)
2. **Take longer** (30s+ per scenario)
3. **Platform-specific** (OS-dependent behavior)
4. **Tested separately** via Playwright E2E

**Enable them with:** `RUN_E2E_TESTS=1` environment variable

---

## Detailed Setup

### Prerequisites

- ✅ Tauri development environment configured
- ✅ Node.js 20+ with pnpm installed
- ✅ Playwright browsers installed (`npx playwright install`)

### Running Tests Locally

#### Option 1: Interactive Development

Best for debugging specific tests.

```bash
# Terminal 1: Start dev with hot reload
npm run dev

# Terminal 2: Run specific Playwright test
npx playwright test e2e/critical/chat-interaction.spec.ts --headed --debug

# Or run all E2E tests
npm run test:e2e
```

#### Option 2: Full E2E Suite

Runs all E2E tests (Playwright + Vitest).

```bash
# Start dev server in background
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Run Playwright tests
npm run test:e2e

# Run Vitest E2E tests (requires RUN_E2E_TESTS=1)
npm run test:e2e:vitest

# Clean up
kill $DEV_PID
```

#### Option 3: CI/CD Pipeline

Automated E2E testing in GitHub Actions.

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Start dev server
        run: pnpm run dev &
      - name: Wait for server
        run: npx wait-on http://localhost:5173
      - name: Run Playwright tests
        run: pnpm run test:e2e
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  e2e-vitest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Build Tauri app
        run: cd src-tauri && cargo build
      - name: Start Tauri app
        run: ./src-tauri/target/debug/titane-infinity &
      - name: Wait for backend
        run: sleep 10
      - name: Run Vitest E2E tests
        run: RUN_E2E_TESTS=1 pnpm run test:e2e:vitest
```

---

## Test Configuration

### Playwright Config

**File:** `playwright.config.ts`

Key settings:

- `baseURL`: `http://localhost:5173`
- `timeout`: 30s per test
- `retries`: 2 in CI, 0 locally
- `workers`: 1 in CI (sequential), auto locally

### Vitest E2E Config

**File:** `src/tests/e2e/titane_e2e.test.ts`

Key features:

- Conditional skip: `describe.skipIf(!process.env.RUN_E2E_TESTS)`
- Performance tracing: `measureStep()` utility
- JSON traces: Logs detailed step-by-step execution

---

## Troubleshooting

### "Cannot invoke Tauri command" Error

**Cause:** Tauri backend not running

**Solution:**

```bash
# Check if dev server is running
curl http://localhost:5173

# Start dev server
npm run dev
```

### Playwright "Browser not found" Error

**Cause:** Playwright browsers not installed

**Solution:**

```bash
npx playwright install chromium
```

### Vitest E2E Tests Still Skipped

**Cause:** `RUN_E2E_TESTS` environment variable not set

**Solution:**

```bash
# Linux/macOS
RUN_E2E_TESTS=1 npm run test:e2e:vitest

# Windows PowerShell
$env:RUN_E2E_TESTS=1; npm run test:e2e:vitest

# Windows CMD
set RUN_E2E_TESTS=1 && npm run test:e2e:vitest
```

### Flaky Tests / Timeouts

**Cause:** Slow backend initialization or race conditions

**Solutions:**

1. Increase timeout: `expect(...).timeout(10000)`
2. Add explicit waits: `await page.waitForSelector('.chat-ready')`
3. Disable parallelization: `fullyParallel: false` in Playwright config
4. Check backend logs: `tail -f runtime/dev/logs/tauri.log`

---

## Writing New E2E Tests

### Playwright Example

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should perform action', async ({ page }) => {
    await page.goto('/');

    // Wait for app initialization
    await page.waitForSelector('.app-ready', { timeout: 10000 });

    // Interact with UI
    await page.click('[data-testid="my-button"]');

    // Assert result
    await expect(page.locator('.result')).toHaveText('Success');
  });
});
```

### Vitest E2E Example

```typescript
// src/tests/e2e/my-integration.test.ts
import { describe, it, expect } from 'vitest';
import { invoke } from '@tauri-apps/api/core';

describe.skipIf(!process.env.RUN_E2E_TESTS)('My Integration', () => {
  it('should call backend command', async () => {
    const result = await invoke('my_command', { param: 'value' });

    expect(result).toBeDefined();
    expect(result.status).toBe('success');
  });
});
```

---

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Clean up state in `afterEach` hooks
- Use unique identifiers (timestamps, UUIDs)

### 2. Explicit Waits

- Avoid `page.waitForTimeout()` (flaky)
- Use `page.waitForSelector()` instead
- Set reasonable timeouts (5-10s)

### 3. Descriptive Assertions

```typescript
// ❌ Bad
expect(result).toBe(true);

// ✅ Good
expect(result.success, 'Command should succeed').toBe(true);
```

### 4. Visual Debugging

```typescript
// Playwright
test('my test', async ({ page }) => {
  await page.pause(); // Opens Playwright Inspector
  await page.screenshot({ path: 'debug.png' });
});
```

### 5. Selective Test Execution

```bash
# Run specific test file
npx playwright test chat-interaction.spec.ts

# Run tests matching pattern
npx playwright test --grep "critical path"

# Run in headed mode (see browser)
npx playwright test --headed
```

---

## Performance Tips

### 1. Parallel Execution

Playwright runs tests in parallel by default. Disable for debugging:

```typescript
// playwright.config.ts
fullyParallel: false,
workers: 1,
```

### 2. Browser Reuse

Reuse browser context across tests:

```typescript
// e2e/setup.ts
test.use({ storageState: 'state.json' });
```

### 3. Skip Heavy Tests in CI

Use `@slow` tag for optional tests:

```typescript
test('@slow should run intensive test', async ({ page }) => {
  // ...
});
```

```bash
# Skip slow tests
npx playwright test --grep-invert @slow
```

---

## CI Integration

### GitHub Actions

See `.github/workflows/e2e-tests.yml` (template above)

### Key Considerations

- Use `ubuntu-latest` for consistency
- Install Playwright with `--with-deps`
- Use `wait-on` to ensure server readiness
- Upload artifacts for failed test debugging
- Run E2E tests on PR and merge to main

---

## Metrics

### Current E2E Coverage

| Category                   | Tests  | Status        | Runtime   |
| -------------------------- | ------ | ------------- | --------- |
| Playwright Critical Path   | 5      | ✅ Active     | ~30s      |
| Playwright Extended        | 6      | ✅ Active     | ~45s      |
| Vitest Backend Integration | 16     | ⏭️ Skipped    | ~60s      |
| **Total E2E Tests**        | **27** | **11 active** | **~2min** |

### Target Coverage

- ✅ **Critical path**: 100% (app launch, chat, visual engine)
- ⚠️ **Extended features**: 50% (admin, settings, advanced)
- 📊 **Backend integration**: 0% (Vitest E2E currently skipped)

**Goal:** Enable all 27 E2E tests for **100% E2E coverage**

---

## Related Documentation

- [Testing Strategy](../TESTING_STRATEGY.md)
- [Issue #80](https://github.com/KallokTherok1994/TITANE_INFINITY/issues/80) — Enable 16 Skipped Tests
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Vitest E2E Testing](https://vitest.dev/guide/features.html)
- [Tauri Testing Guide](https://tauri.app/v1/guides/testing/)

---

**Last Updated:** 2026-01-03  
**Maintainer:** TITANE∞ Team  
**Status:** ✅ Production Ready (Playwright), 🚧 In Progress (Vitest E2E)
