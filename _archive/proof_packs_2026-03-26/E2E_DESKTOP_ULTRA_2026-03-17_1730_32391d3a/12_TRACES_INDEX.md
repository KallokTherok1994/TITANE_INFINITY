# 12_TRACES_INDEX.md

## Playwright Traces
No Playwright browser E2E was run in this session.
Playwright traces would be stored in: test-results/
Current state: test-results/ directory not present (browser E2E not run).

Classification: N/A — browser E2E not in scope for this desktop certification session.

## Desktop E2E (WDIO) Traces

WDIO does not generate browser-style traces. Evidence artifacts:

### Logs (reports/e2e-desktop/)
- diagnostics.log — run metadata, timing, exit codes
- wdio.log — full WDIO session log (DOM reads, commands, results)
- tauri_driver.log — tauri-driver output
- webkit_driver.log — WebKitWebDriver output

### This Session Runs
```
RUN smoke-1: 2026-03-17T17:41:58Z → PASS (wdio close code=0)
RUN smoke-2: 2026-03-17T17:42:55Z → PASS (wdio close code=0)
RUN smoke-3: 2026-03-17T17:43:45Z → PASS (wdio close code=0)
RUN audio-tts-1: 2026-03-17T17:46:22Z → PASS (metrics verdict=PASS)
RUN audio-tts-2: 2026-03-17T17:49Z → PASS (metrics verdict=PASS)
RUN audio-tts-3: 2026-03-17T17:52Z → PASS (metrics verdict=PASS)
```

### Metrics JSON (truth source)
reports/e2e-desktop/audio_tts_runtime_controls_metrics.json
```json
{
  "verdict": "PASS",
  "assistantMessageDetected": true,
  "ttsControlsVisible": true,
  "ttsStatusAfterRead": "Préparation de la lecture...",
  "stopActionObserved": true,
  "replayButtonObserved": true,
  "audioCenterVisible": true,
  "speakerButtonVisible": true,
  "microphoneButtonVisible": true,
  "speakerResultObserved": true,
  "microphoneResultObserved": true
}
```

## WDIO Capabilities Log
reports/e2e-desktop/wdio_caps.json (created by wdio on each run)
