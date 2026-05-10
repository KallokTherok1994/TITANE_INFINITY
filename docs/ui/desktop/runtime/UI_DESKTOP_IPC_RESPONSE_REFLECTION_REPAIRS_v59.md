# UI Desktop IPC Response — Repairs v59

**Session**: `TITANE_UI_DESKTOP_IPC_RESPONSE_REFLECTION_AND_REMOTE_SYNC_v59`
**Date**: 2026-05-10

---

## Bug Fixed: `navigateAndWait` API Misuse

### Root Cause

All 5 v59 spec files were created with incorrect `navigateAndWait` call patterns.

**`navigateAndWait` signature** (`e2e/desktop/helpers/uiDesktopFunctionalFlows.js` line 16):
```js
async function navigateAndWait(route, rootTestId, timeout = 10000) {
  await browser.url(`tauri://localhost${route}`);                    // prepends base
  await browser.waitUntil(
    async () => {
      const els = await browser.$$(`[data-testid="${rootTestId}"]`); // wraps testid
      return els.length > 0;
    }, ...
  );
}
```

### Wrong Calls (before fix)

```js
await navigateAndWait('tauri://localhost/titane', '[data-testid="page-titane"]', 8000);
// Produced selector: [data-testid="[data-testid="page-titane"]"] — INVALID
```

### Fixed Calls (after fix)

```js
await navigateAndWait('/titane', 'page-titane', 8000);
```

### Fix Method

Python regex replace across all 5 spec files:
```python
pattern = re.compile(
    r"navigateAndWait\('tauri://localhost(/[^']+)',\s*'\[data-testid=\"([^\"]+)\"\]',\s*(\d+)\)"
)
repl = r"navigateAndWait('\1', '\2', \3)"
```

Template literal form in utility spec (Tier 3 loop):
```js
// Before: navigateAndWait(`tauri://localhost${route}`, `[data-testid="${testid}"]`, 8000)
// After:  navigateAndWait(route, testid, 8000)
```

### Files Repaired

- `e2e/desktop/ui-desktop-ipc-response-reflection-core.wdio.test.js` — 6 calls fixed
- `e2e/desktop/ui-desktop-ipc-response-reflection-admin-dev.wdio.test.js` — 2 calls fixed
- `e2e/desktop/ui-desktop-ipc-response-reflection-utility.wdio.test.js` — 7 named + 1 loop fixed
- `e2e/desktop/ui-desktop-ipc-response-reflection-agent-chat.wdio.test.js` — 8 calls fixed
- `e2e/desktop/ui-desktop-ipc-response-reflection-sandbox.wdio.test.js` — 5 calls fixed

### Note: probeInvokeAndReflect uiSelector — NOT changed

`probeInvokeAndReflect` calls with `'[data-testid="page-titane"]'` as `uiSelector` are correct — that function passes to `document.querySelector()` which accepts full CSS selectors.

---

## Verification

After fix:
```
WDIO_SPEC='e2e/desktop/ui-desktop-ipc-response-reflection-*.wdio.test.js' node scripts/e2e/run-desktop-suite.js
wdio close: code=0 signal=null
```
