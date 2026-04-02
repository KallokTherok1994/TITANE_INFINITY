# 13_SCREENSHOTS_INDEX.md

## Screenshots Policy
- Desktop E2E: screenshots on failure only (captureFailureScreenshot in ui-driver.wdio.js)
- Browser E2E (Playwright): screenshots on failure only (playwright.config.ts: screenshot: 'only-on-failure')
- Screenshots are SUPPORTING EVIDENCE only — NOT final truth (per selector policy section 7)

## This Session — No New Failure Screenshots
No new failure screenshots generated in this session (all runs PASS).

## Existing Failure Screenshots (from prior sessions — reports/e2e-desktop/)
These are historical artifacts. Not evidence of current failures.

```
failure-audio-tts-runtime-controls-...2026-03-17T15-27-36-072Z.png  → resolved
failure-audio-tts-runtime-controls-...2026-03-17T15-39-51-283Z.png  → resolved
failure-audio-tts-runtime-controls-...2026-03-17T15-43-57-961Z.png  → resolved
failure-audio-tts-runtime-controls-...2026-03-17T15-47-49-526Z.png  → resolved
failure-audio-tts-runtime-controls-...2026-03-17T15-49-24-524Z.png  → resolved
failure-audio-tts-runtime-controls-...2026-03-17T15-51-31-848Z.png  → resolved
failure-audio-tts-runtime-controls-...2026-03-17T16-21-33-184Z.png  → resolved (AUDIO_TTS_CONTINUE session)
failure-audio-tts-runtime-controls-...2026-03-17T17-15-52-040Z.png  → resolved (current session)
failure-ui-desktop-ultra-full-coverage-...2026-03-15T.png × 4       → historical
failure-ui-desktop-ultra-smoke-...2026-03-15T.png × 2               → historical
```

## Current Session Truth
- No failure screenshots for smoke.wdio.test.js (x3 PASS, no screenshots)
- No failure screenshots for audio-tts-runtime-controls.wdio.test.js (x3 PASS, no screenshots)

## Anti-Lie Note
The existence of historical failure screenshots does NOT indicate current failures.
All audio-tts failures shown above were resolved in the AUDIO_TTS_CONTINUE session and confirmed fixed here (x3 PASS this session).
