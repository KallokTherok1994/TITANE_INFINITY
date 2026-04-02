# NO-SKIPS Gate
- Timestamp UTC: 2026-03-04T18:42:33Z
- Status: FAIL
- Pattern: SKIP:|Relance avec|passed 0|0 tests|([sS][kK][iI][pP].*exit 0)|(exit 0.*[sS][kK][iI][pP])
- Logs scanned: 33

## Extraits
```text
11:package.json:74:    "test:e2e:vitest": "bash -c 'if [[ \"${TITANE_E2E_TAURI:-}\" != \"1\" ]]; then echo \"SKIP: Vitest E2E (src/tests/e2e) nécessite un contexte Tauri réel. Relance avec TITANE_E2E_TAURI=1\"; exit 0; fi; cross-env RUN_E2E_TESTS=1 NODE_OPTIONS=\"--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs\" vitest run src/tests/e2e/titane_e2e.test.ts'",
309:scripts/network/validate-network.sh:40:    echo "⏭️  SKIP: No LAN IP detected"
310:scripts/network/validate-network.sh:81:    echo "⏭️  SKIP: No active tunnel (tests 3-4)"
311:scripts/network/validate-network.sh:101:    echo "⏭️  SKIP: No HTML fetched (dev server down?)"
772:scripts/qa/scan_no_skips.sh:32:PATTERN='SKIP:|Relance avec|passed 0|0 tests|([sS][kK][iI][pP].*exit 0)|(exit 0.*[sS][kK][iI][pP])'
1109:src-tauri/src/commands/web_research.rs:50:const M_CACHE_WRITE_SKIP: &str = "CACHE_WRITE_SKIPPED";
1110:src-tauri/src/commands/web_research.rs:51:const M_DISCOVERY_SKIP: &str = "DISCOVERY_SKIPPED_P3";
1111:src-tauri/src/commands/web_research.rs:53:const M_FETCH_SKIP: &str = "FETCH_SKIPPED_P3";
1112:src-tauri/src/commands/web_research.rs:58:const M_EXTRACT_SKIP: &str = "EXTRACT_SKIPPED_P6";
1113:src-tauri/src/commands/web_research.rs:69:const M_INDEX_SKIP: &str = "INDEX_SKIPPED_P6";
1114:src-tauri/src/commands/web_research.rs:70:const M_RETRIEVE_SKIP: &str = "RETRIEVE_SKIPPED_P6";
1115:src-tauri/src/commands/web_research.rs:75:const M_RAG_SKIP: &str = "RAG_SKIPPED_P6";
32956: [32m✓[39m [30m[45m core [49m[39m src/__tests__/memoryComponents.test.tsx [2m([22m[2m40 tests[22m[2m)[22m[32m 285[2mms[22m[39m
34240: [32m✓[39m [30m[45m core [49m[39m src/components/panels/__tests__/panels.spec.tsx [2m([22m[2m30 tests[22m[2m)[22m[32m 248[2mms[22m[39m
34642: [32m✓[39m [30m[45m core [49m[39m src/__tests__/omega/conversation-manager.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 223[2mms[22m[39m
49925: [32m✓[39m [30m[45m core [49m[39m tests/unit/realtime/RealTimeExecutionEngine.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 62[2mms[22m[39m
52510: [32m✓[39m [30m[45m core [49m[39m src/__tests__/components/devtools/EngineCard.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 47[2mms[22m[39m
52557: [32m✓[39m [30m[45m core [49m[39m src/__tests__/components/devtools/MetricCard.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 36[2mms[22m[39m
52558: [32m✓[39m [30m[45m core [49m[39m src/__tests__/components/devtools/LogLine.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 37[2mms[22m[39m
58821: [32m✓[39m [30m[45m core [49m[39m src/__tests__/hooks/useLocalStorage.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 22[2mms[22m[39m
63165: [32m✓[39m [30m[45m core [49m[39m src/__tests__/constitution-integration.test.ts [2m([22m[2m30 tests[22m[2m)[22m[32m 8[2mms[22m[39m
63282: [32m✓[39m [30m[45m core [49m[39m src/__tests__/c5-observability.test.ts [2m([22m[2m20 tests[22m[2m)[22m[32m 7[2mms[22m[39m
63283: [32m✓[39m [30m[45m core [49m[39m src/__tests__/chatEngine-memory-integration.test.ts [2m([22m[2m20 tests[22m[2m)[22m[32m 7[2mms[22m[39m
33400: [32m✓[39m [30m[45m core [49m[39m src/__tests__/memoryComponents.test.tsx [2m([22m[2m40 tests[22m[2m)[22m[33m 340[2mms[22m[39m
33879: [32m✓[39m [30m[45m core [49m[39m src/components/panels/__tests__/panels.spec.tsx [2m([22m[2m30 tests[22m[2m)[22m[32m 253[2mms[22m[39m
34715: [32m✓[39m [30m[45m core [49m[39m src/__tests__/omega/conversation-manager.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 223[2mms[22m[39m
49875: [32m✓[39m [30m[45m core [49m[39m tests/unit/realtime/RealTimeExecutionEngine.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 62[2mms[22m[39m
52547: [32m✓[39m [30m[45m core [49m[39m src/__tests__/components/devtools/EngineCard.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 44[2mms[22m[39m
53833: [32m✓[39m [30m[45m core [49m[39m src/__tests__/components/devtools/LogLine.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 33[2mms[22m[39m
53854: [32m✓[39m [30m[45m core [49m[39m src/__tests__/components/devtools/MetricCard.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 35[2mms[22m[39m
59691: [32m✓[39m [30m[45m core [49m[39m src/__tests__/hooks/useLocalStorage.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 22[2mms[22m[39m
63214: [32m✓[39m [30m[45m core [49m[39m src/__tests__/constitution-integration.test.ts [2m([22m[2m30 tests[22m[2m)[22m[32m 8[2mms[22m[39m
63251: [32m✓[39m [30m[45m core [49m[39m src/__tests__/chatEngine-memory-integration.test.ts [2m([22m[2m20 tests[22m[2m)[22m[32m 7[2mms[22m[39m
63356: [32m✓[39m [30m[45m core [49m[39m src/__tests__/c5-observability.test.ts [2m([22m[2m20 tests[22m[2m)[22m[32m 6[2mms[22m[39m
32998: [32m✓[39m [30m[45m core [49m[39m src/__tests__/memoryComponents.test.tsx [2m([22m[2m40 tests[22m[2m)[22m[32m 300[2mms[22m[39m
34282: [32m✓[39m [30m[45m core [49m[39m src/components/panels/__tests__/panels.spec.tsx [2m([22m[2m30 tests[22m[2m)[22m[32m 263[2mms[22m[39m
34685: [32m✓[39m [30m[45m core [49m[39m src/__tests__/omega/conversation-manager.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 235[2mms[22m[39m
49903: [32m✓[39m [30m[45m core [49m[39m tests/unit/realtime/RealTimeExecutionEngine.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 62[2mms[22m[39m
52461: [32m✓[39m [30m[45m core [49m[39m src/__tests__/components/devtools/EngineCard.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 45[2mms[22m[39m
52515: [32m✓[39m [30m[45m core [49m[39m src/__tests__/components/devtools/MetricCard.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 30[2mms[22m[39m
52677: [32m✓[39m [30m[45m core [49m[39m src/__tests__/components/devtools/LogLine.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 34[2mms[22m[39m
58869: [32m✓[39m [30m[45m core [49m[39m src/__tests__/hooks/useLocalStorage.test.tsx [2m([22m[2m10 tests[22m[2m)[22m[32m 22[2mms[22m[39m
63118: [32m✓[39m [30m[45m core [49m[39m src/__tests__/constitution-integration.test.ts [2m([22m[2m30 tests[22m[2m)[22m[32m 9[2mms[22m[39m
63259: [32m✓[39m [30m[45m core [49m[39m src/__tests__/chatEngine-memory-integration.test.ts [2m([22m[2m20 tests[22m[2m)[22m[32m 7[2mms[22m[39m
63274: [32m✓[39m [30m[45m core [49m[39m src/__tests__/c5-observability.test.ts [2m([22m[2m20 tests[22m[2m)[22m[32m 6[2mms[22m[39m
3:> bash -c 'if [[ "${TITANE_E2E_TAURI:-}" != "1" ]]; then echo "SKIP: Vitest E2E (src/tests/e2e) nécessite un contexte Tauri réel. Relance avec TITANE_E2E_TAURI=1"; exit 0; fi; cross-env RUN_E2E_TESTS=1 NODE_OPTIONS="--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs" vitest run src/tests/e2e/titane_e2e.test.ts'
```
# NO-SKIPS Gate
- Timestamp UTC: 2026-03-04T21:28:41Z
- Status: FAIL
- Pattern: SKIP:|Relance avec|\<passed[[:space:]]+0\>|\<0[[:space:]]+tests?\>|([sS][kK][iI][pP].*exit[[:space:]]*0)|(exit[[:space:]]*0.*[sS][kK][iI][pP])
- Logs scanned: 33

## Extraits
```text
309:scripts/network/validate-network.sh:40:    echo "⏭️  SKIP: No LAN IP detected"
310:scripts/network/validate-network.sh:81:    echo "⏭️  SKIP: No active tunnel (tests 3-4)"
311:scripts/network/validate-network.sh:101:    echo "⏭️  SKIP: No HTML fetched (dev server down?)"
772:scripts/qa/scan_no_skips.sh:32:PATTERN='SKIP:|Relance avec|passed 0|0 tests|([sS][kK][iI][pP].*exit 0)|(exit 0.*[sS][kK][iI][pP])'
1109:src-tauri/src/commands/web_research.rs:50:const M_CACHE_WRITE_SKIP: &str = "CACHE_WRITE_SKIPPED";
1110:src-tauri/src/commands/web_research.rs:51:const M_DISCOVERY_SKIP: &str = "DISCOVERY_SKIPPED_P3";
1111:src-tauri/src/commands/web_research.rs:53:const M_FETCH_SKIP: &str = "FETCH_SKIPPED_P3";
1112:src-tauri/src/commands/web_research.rs:58:const M_EXTRACT_SKIP: &str = "EXTRACT_SKIPPED_P6";
1113:src-tauri/src/commands/web_research.rs:69:const M_INDEX_SKIP: &str = "INDEX_SKIPPED_P6";
1114:src-tauri/src/commands/web_research.rs:70:const M_RETRIEVE_SKIP: &str = "RETRIEVE_SKIPPED_P6";
1115:src-tauri/src/commands/web_research.rs:75:const M_RAG_SKIP: &str = "RAG_SKIPPED_P6";
2:> titane-infinity@27.2.0 test:coverage:check /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:coverage:check /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:coverage:check /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:architecture /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:architecture /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:architecture /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:compliance /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:compliance /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:compliance /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:e2e:playwright /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:e2e:playwright /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:e2e:playwright /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:rust /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:rust /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:rust /home/titane-os/Documents/GitHub/TITANE_INFINITY
2:> titane-infinity@27.2.0 test:e2e:vitest /home/titane-os/Documents/GitHub/TITANE_INFINITY
```
