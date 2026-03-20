# 02_SCOPE

## REAL_STATE
- Desktop WDIO critical flow currently stable on latest x3 run set.
- Browser Playwright provider-flow suite remains failing (5/5 failed in latest run).
- Memory truth chain end-to-end (save/persist/recall/injection/consumption) not fully evidenced.

## TARGET_DELTA
- Remove silent memory visibility gap in frontend prompt assembly.
- Expose backend history-load truth markers in response metadata/trace.
- Stabilize desktop WDIO harness under variable model latency.

## CURRENT_REAL_LOCK
- `LOCK_MEMORY_CERT_CHAIN_UNPROVEN`: full LTM truth chain is unproven despite runtime chat path being operational.

## DEFECT_CLASSIFICATION
- PRODUCT: partial UI/runtime observability mismatch (backend alignment fields often empty in probe).
- MEMORY: save/recall/injection consumption chain not fully proven.
- HARNESS: legacy Playwright provider-flow selectors/timeouts stale vs current UI/runtime behavior.

