# E2E Harness Classification — Exact Configuration

---

## Playwright Runner Configuration

**File**: `playwright.config.ts`

**Exact Config**:
```typescript
const useWebServer = process.env.TITANE_E2E_USE_WEBSERVER !== '0';  // Default: TRUE

use: {
  baseURL: process.env.TITANE_E2E_PORT
    ? `http://127.0.0.1:${process.env.TITANE_E2E_PORT}`
    : 'http://127.0.0.1:5173',  // Web server, NOT native app
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  actionTimeout: 30000,
},

projects: [
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],  // Browser automation, NOT Tauri
      viewport: { width: 1280, height: 720 },
    },
  },
  // ... more browser projects
],
```

**Classification**: **WEB_BROWSER_AUTOMATION** (Playwright + Chromium)

---

## E2E Smoke Test Configuration

**File**: `e2e/total-dev-smoke.spec.ts`

**Exact Test Pattern**:
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173');  // Web server, not native
  await page.waitForLoadState('networkidle');
});

test('Route /total-dev RENDERS...', async ({ page }) => {
  await page.goto('http://localhost:5173/#/total-dev');  // Browser navigation
  const heading = page.locator('[data-testid="total-dev-header"]');
  await expect(heading).toBeVisible();  // Browser DOM selector
});
```

**Classification**: **WEB_BROWSER_SMOKE** (heading toward web interface, not native)

---

## Native Automation Options (NOT USED)

### Option A: Tauri WebDriver (Future)
```
⏳ FUTURE: Migrate to @tauri-apps/webdriver or similar
Status: NOT IMPLEMENTED
```

### Option B: Tauri CLI Test Mode (Future)
```
⏳ FUTURE: Use `tauri test` command with native harness
Status: NOT AVAILABLE in current setup
```

### Option C: Custom Native Bridge (Future)
```
⏳ FUTURE: Direct IPC command integration for E2E
Status: NOT CONFIGURED
```

---

##Classification Summary

| Aspect | Value | Type |
|--------|-------|------|
| **Test Target** | http://localhost:5173 | Web Server |
| **Browser** | Chromium (headless) | Desktop Browser |
| **Selectors** | [data-testid="..."] | Browser DOM |
| **Navigation** | page.goto() | Browser API |
| **Window Type** | Browser, NOT App | Headless Process |
| **Native Support** | NONE (configured) | 0% Native |

**Overall**: **100% WEB_HARNESS**, 0% NATIVE_HARNESS

---

## Honest Classification

**E2E Harness Type**: `WEB_SMOKE_ONLY`

**What It Tests**: 
- ✅ Vite web server responsiveness
- ✅ Browser rendering of TOTAL_DEV page
- ✅ Browser-side element selectors
- ❌ Native Tauri window interaction
- ❌ Real IPC command execution (called from native)
- ❌ Desktop-specific behavior

**Certification Value**: 
- STAGING/PREVIEW: Acceptable (desktop app reachable via web)
- PROD-NATIVE: NOT SUFFICIENT (no real desktop app automation)

---

*End E2E Harness Classification*
