]633;E;{   echo "# INVARIANTS CHECK"\x3b   echo\x3b   echo "## UI no-web primitives scan"\x3b   echo '```text'\x3b   echo 'pattern: fetch\\(|XMLHttpRequest|WebSocket\\(|EventSource\\(|axios\\.|superagent|node:http|node:https'\x3b   echo 'scope: src/components/** src/pages/** src/App.tsx src/main.tsx src/hooks/**'\x3b   rg -n "fetch\\(|XMLHttpRequest|WebSocket\\(|EventSource\\(|axios\\.|superagent|node:http|node:https" src/components src/pages src/App.tsx src/main.tsx src/hooks || true\x3b   echo '```'\x3b   echo\x3b   echo "## Ring integrity"\x3b   echo '```text'\x3b   pnpm test:architecture\x3b   echo '```'\x3b   echo\x3b   echo "## Registry append-only"\x3b   echo '```text'\x3b   git --no-pager diff -- registry/ui-events.jsonl | sed -n '1,120p'\x3b   echo '```'\x3b } > "$PACK/03_INVARIANTS_CHECK.md";93c203e2-ac30-43db-bbce-4a2257cdb6df]633;C# INVARIANTS CHECK

## UI no-web primitives scan
```text
pattern: fetch\(|XMLHttpRequest|WebSocket\(|EventSource\(|axios\.|superagent|node:http|node:https
scope: src/components/** src/pages/** src/App.tsx src/main.tsx src/hooks/**
```

## Ring integrity
```text

> titane-infinity@27.2.0 test:architecture /home/titane-os/Documents/GitHub/TITANE_INFINITY
> cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/architecture


[1m[46m RUN [49m[22m [36mv4.0.18 [39m[90m/home/titane-os/Documents/GitHub/TITANE_INFINITY[39m

 [32m✓[39m [30m[45m core [49m[39m src/__tests__/architecture/engine-isolation.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 18[2mms[22m[39m

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 09:12:51
[2m   Duration [22m 492ms[2m (transform 71ms, setup 185ms, import 8ms, tests 18ms, environment 178ms)[22m

```

## Registry append-only
```text
diff --git a/registry/ui-events.jsonl b/registry/ui-events.jsonl
index 324cf7f14..2d9dc80a3 100644
--- a/registry/ui-events.jsonl
+++ b/registry/ui-events.jsonl
@@ -100,3 +100,5 @@
 {"id":"ui-event-2026-02-25T23:55:00Z-debug-trace-panel-conversation-os","ts":"2026-02-25T23:55:00Z","category":"ui","scope":"debug|chat|trace","change_type":"feature","summary":"Ajout d’un TracePanel read-only pour exposer la trace Conversation OS dans le panneau debug chat","reason":"Rendre visibles les décisions Router/Policy/Resilience/Memory/Search sans silence UI et avec data-testid stables pour E2E.","files_changed":["src/components/debug/TracePanel.tsx","src/components/debug/ChatDebugPanel.tsx","src/components/debug/index.ts"],"ring":"Ring 4","stability_status":"EXPERIMENTAL","tests_run":[],"proofs":["TracePanel affiche trace JSON ou état vide explicite","data-testid: trace-panel, trace-panel-json, trace-panel-empty","ChatDebugPanel intègre TracePanel sans modifier le flux principal"],"risk_level":"low","rollback":"git restore -- src/components/debug/TracePanel.tsx src/components/debug/ChatDebugPanel.tsx src/components/debug/index.ts registry/ui-events.jsonl","status":"pending-validation"}
 {"id":"ui-029","ts":"2026-02-27T20:30:00Z","category":"ui","scope":"boot-error|governance","change_type":"fix","summary":"Bloque l'ouverture web externe depuis BootErrorFallback (Tauri-only)","reason":"Constitution Tauri-only: le frontend ne doit pas ouvrir le web directement.","files_changed":["src/components/BootErrorFallback.tsx"],"tests_run":["typecheck local file (no errors)"],"proofs":["window.open supprimé","message explicite utilisateur en remplacement"],"risk_level":"low","rollback":"git restore -- src/components/BootErrorFallback.tsx","status":"qualified"}
 {"id":"ui-040","ts":"2026-02-28T13:22:00Z","category":"ui","scope":"routing|singularity|ipc-discipline","change_type":"fix","summary":"Supprime la redirection dupliquée /singularity vers /dev et force le client IPC canonique pour identity_set_matrix","reason":"Éviter une route masquée (UI mapping incohérent) et supprimer un invoke direct hors client canonique TS↔Tauri.","files_changed":["src/App.tsx","src/core/identity/defaultIdentityMatrix.ts","docs/ui/UI_MAP.md","docs/ui/IA_FLOW.mmd"],"ring":"Ring 4","stability_status":"QUALIFIED","tests_run":["pnpm run test:architecture x3","pnpm run test:compliance x3","vitest src/tests/e2e/titane_e2e.test.ts x3"],"proofs":["/singularity route unique vers SingularityMonitor","saveIdentityMatrix utilise tauriClient.identitySetMatrix","Cartographie Mermaid UI/IA ajoutée"],"risk_level":"low","rollback":"git restore -- src/App.tsx src/core/identity/defaultIdentityMatrix.ts docs/ui/UI_MAP.md docs/ui/IA_FLOW.mmd registry/ui-events.jsonl","status":"qualified"}
+{"id":"ui-event-2026-03-02T10:40:00Z-splash-watchdog-boot-ready-alignment","ts":"2026-03-02T10:40:00Z","category":"ui","scope":"boot|watchdog|loading","change_type":"fix","summary":"Align boot readiness detection with BOOT:READY markers to prevent false infinite-loading timeout","reason":"SplashWatchdog only treated '[BOOT] App render' as ready, while runtime advances to BOOT:READY. This could trigger a false timeout overlay although boot had completed.","files_changed":["src/components/diagnostics/SplashWatchdog.tsx"],"ring":"Ring 4","stability_status":"QUALIFIED","tests_run":["pnpm test:architecture (pending)","targeted diagnostics validation (pending)"],"proofs":["isBootReady now accepts __TITANE_BOOT_READY__ and dom dataset titaneBootReady=1","isBootReady now accepts stage BOOT:READY before fallback visibility checks"],"risk_level":"low","rollback":"git restore -- src/components/diagnostics/SplashWatchdog.tsx registry/ui-events.jsonl","status":"pending-validation"}
+{"id":"ui-event-2026-03-02T13:05:00Z-splash-watchdog-no-silent-infinite-loading","ts":"2026-03-02T13:05:00Z","category":"ui","scope":"boot|watchdog|suspense-loading","change_type":"fix","summary":"Prevent watchdog premature ready state while route loading fallback is still visible","reason":"A BOOT ready marker could be set before route Suspense fallback disappeared, disabling watchdog and allowing perceived infinite loading.","files_changed":["src/components/diagnostics/SplashWatchdog.tsx"],"ring":"Ring 4","stability_status":"QUALIFIED","tests_run":["pnpm test:architecture (PASS)","AppImage smoke logs x2 PASS (x2/x3)","AppImage fixcheck smoke PASS (UI main page_load)"],"proofs":["isBootReady now requires fallback invisibility for BOOT-ready signals","Repeated AppImage logs show main window + page_load main with no watchdog timeout markers"],"risk_level":"low","rollback":"git restore -- src/components/diagnostics/SplashWatchdog.tsx registry/ui-events.jsonl","status":"validated"}
```
