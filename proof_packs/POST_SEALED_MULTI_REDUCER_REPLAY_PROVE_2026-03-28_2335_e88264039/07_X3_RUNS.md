# X3_RUNS — P1.12

## Run 1

**Session**: 20260328T233022Z
**Gate**: `TITANE_MULTI_REDUCER_PROOF=1 TITANE_NATIVE_BINARY_MODE=debug`
**Exit**: 0 (PASS)

### Pre-state
```
ticks=0
depth=0
memories=3
active_thoughts=0
metrics_last_update=1774737315894
preStatus.events_persisted=0
```

### Emit sequence
1. `titan_persist_event({ module: 'xp', event_type: 'gain', payload: { amount: 100 } })`
2. `titan_persist_event({ module: 'progress', event_type: 'set', payload: { level: 7 } })`
3. `titan_persist_event({ module: 'knowledge', event_type: 'learn', payload: {} })`
4. `titan_persist_event({ module: 'settings', event_type: 'update', payload: {} })`

### Post-state
```
ticks=100
depth=7
memories=4
active_thoughts=1
metrics_last_update=1774740677988
last_sync_ms=1774740677988
postStatus.events_persisted=4
```

### Assertion results
- `ticks === 0 + 100` → PASS
- `depth === 7` → PASS
- `memories === 3 + 1` → PASS
- `active_thoughts === 0 + 1` → PASS
- `metrics_last_update > 1774737315894` → PASS
- `metrics_last_update === last_sync_ms` → PASS (1774740677988 === 1774740677988)
- `events_persisted >= 0 + 4` → PASS (4 >= 4)

**Run 1 verdict: PASS**

---

## Run 2

**Session**: 20260328T233128Z
**Gate**: `TITANE_MULTI_REDUCER_PROOF=1 TITANE_NATIVE_BINARY_MODE=debug`
**Exit**: 0 (PASS)

### Pre-state (cross-run monotonic: prior 4 events replayed)
```
ticks=100
depth=7
memories=4
active_thoughts=1
metrics_last_update=1774740677988
preStatus.events_persisted=0
```

### Post-state
```
ticks=200
depth=7
memories=5
active_thoughts=2
metrics_last_update=1774740733055
last_sync_ms=1774740733055
postStatus.events_persisted=4
```

### Assertion results
- `ticks === 100 + 100` → PASS
- `depth === 7` → PASS
- `memories === 4 + 1` → PASS
- `active_thoughts === 1 + 1` → PASS
- `metrics_last_update > 1774740677988` → PASS
- `metrics_last_update === last_sync_ms` → PASS (1774740733055 === 1774740733055)
- `events_persisted >= 0 + 4` → PASS (4 >= 4)

**Run 2 verdict: PASS**

---

## Run 3

**Session**: 20260328T233217Z
**Gate**: `TITANE_MULTI_REDUCER_PROOF=1 TITANE_NATIVE_BINARY_MODE=debug`
**Exit**: 0 (PASS)

### Pre-state (cross-run monotonic: prior 8 events replayed)
```
ticks=200
depth=7
memories=5
active_thoughts=2
metrics_last_update=1774740733055
preStatus.events_persisted=0
```

### Post-state
```
ticks=300
depth=7
memories=6
active_thoughts=3
metrics_last_update=1774740779785
last_sync_ms=1774740779785
postStatus.events_persisted=4
```

### Assertion results
- `ticks === 200 + 100` → PASS
- `depth === 7` → PASS
- `memories === 5 + 1` → PASS
- `active_thoughts === 2 + 1` → PASS
- `metrics_last_update > 1774740733055` → PASS
- `metrics_last_update === last_sync_ms` → PASS (1774740779785 === 1774740779785)
- `events_persisted >= 0 + 4` → PASS (4 >= 4)

**Run 3 verdict: PASS**

---

## X3 summary

| Run | ticks | depth | memories | active_thoughts | metrics_last_update | = last_sync_ms |
|-----|-------|-------|----------|-----------------|---------------------|----------------|
| 1   | 0→100 | 0→7   | 3→4      | 0→1             | ...894→...988       | ✓              |
| 2   | 100→200 | 7→7 | 4→5     | 1→2             | ...988→...055       | ✓              |
| 3   | 200→300 | 7→7 | 5→6     | 2→3             | ...055→...785       | ✓              |

**X3 verdict: ALL_PASS**

No WRY session crashes in P1.12 (0/3 runs affected).
Total events in events.json after P1.12: 15 (3 P1.11 + 12 P1.12).
