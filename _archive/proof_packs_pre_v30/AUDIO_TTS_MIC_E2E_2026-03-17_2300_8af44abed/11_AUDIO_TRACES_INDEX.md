# AUDIO TRACES INDEX
**Date:** 2026-03-17 23:00

## Primary Artifact
- `reports/e2e-desktop/audio_tts_runtime_controls_metrics.json` — last run (Run 3) full metrics JSON

## Key Trace Data (from all 3 runs)
```
assistantMessageDetected: true    ← real LLM response received
ttsControlsVisible: true          ← TTS button rendered in chat
ttsStatusAfterRead: "Lecture en cours..."  ← TTS engine started (piper or espeak)
ttsStatusFinal: "Lecture arrêtée."        ← TTS engine stopped (real termination)
pauseResumePath: "executed"              ← SIGSTOP/SIGCONT round-trip completed
stopActionObserved: true                 ← tts_stop IPC invoked
replayButtonObserved: true              ← UI shows replay option after stop
audioCenterVisible: true                ← Audio Center accessible in Admin tab
speakerButtonVisible: true              ← Speaker test button present
microphoneButtonVisible: true           ← Mic test button present
speakerResultObserved: true             ← Speaker test executed and returned result
microphoneResultObserved: true          ← Mic test executed and returned result
verdict: "PASS"                         ← All gates passed
```

## WDIO Logs
- `reports/e2e-desktop/wdio.log` — full WDIO session log (last run)
- `reports/e2e-desktop/diagnostics.log` — tauri-driver diagnostics
- `reports/e2e-desktop/tauri_driver.log` — tauri-driver stdio
- `reports/e2e-desktop/webkit_driver.log` — WebKitWebDriver stdio

## Driver Chain
```
WDIO → tauri-driver (port 4444) → WebKitWebDriver (/usr/bin/WebKitWebDriver) → Tauri binary (WebKitGTK WebView)
```

## No Screenshots
No screenshots captured (not required for PASS runs — UI state confirmed via testid selectors and metrics.json).
