# SCREENSHOTS INDEX

**Date:** 2026-03-17 23:00

## Status

No screenshots captured in this certification run.

## Rationale

- All 3 desktop E2E runs returned verdict="PASS" via metrics.json (machine-readable)
- TTS state confirmed via ttsStatusAfterRead="Lecture en cours..." (deterministic text assertion)
- No failures requiring visual debugging occurred
- Screenshots are support evidence only (not final truth, per selector policy)

## If Failures Occur (Future Runs)

Screenshots would be captured to `reports/e2e-desktop/screenshots/` by:

```javascript
await browser.saveScreenshot(`reports/e2e-desktop/screenshots/failure_${Date.now()}.png`);
```

This is wired into `captureFailureScreenshot()` in `e2e/desktop/ui-driver.wdio.js`.
