# ROOT CAUSE — MIXED_CAUSE

## Cause 1 — UI_BOOT_DUPLICATION [P0]
tauri.conf.json defines avatar-floating window with no dedicated URL → loads dist/index.html (same as main).
Tauri v2 creates ALL app.windows at startup even with visible:false.
Result: 2× App.tsx useEffect mount → duplicate initializeOllama(), duplicate backend probes.
Evidence: tauri.conf.json:47-63

## Cause 2 — OLLAMA_PROBE_STORM [P0]
4 concurrent probes: main.rs:952 (initialize_providers_async), main.rs:976 (ai_check_ollama_status),
App.tsx:456 (main window initializeOllama), App.tsx:456 again (avatar-floating window).
Evidence: main.rs:952+976, App.tsx:456

## Cause 3 — BREAKER_FALSE_OFFLINE [P1]
HEALTH_CHECK_INTERVAL=45s applied uniformly. If Ollama starts in 3-8s but first probe fails,
endpointHealthy=false cached 45s. No distinction: warming_up / timeout_probe / offline.
Evidence: ollama.ts:156-165

## Cause 4 — WEBKIT_RUNTIME_CRASH [P1]
transparent=true + decorations=false + visible=false + full React bundle load in hidden WebKit window
= GTK compositing crash on Linux. avatar-floating trigger.
Evidence: tauri.conf.json:55-58
