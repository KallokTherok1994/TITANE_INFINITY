# X3_RUNS

## Run configuration

- Harness: e2e/desktop/online-chat-proof-ui.wdio.test.js
- Runner: scripts/e2e/run-online-chat-proof-ui.sh
- Env: TITANE_EVENT_REPLAY_PROOF=1, TITANE_NATIVE_BINARY_MODE=debug
- Binary: src-tauri/target/debug/titane-infinity (18:30 UTC-4, post-P1.10c)
- Driver: tauri-driver --port 4444
- Display: :1 (Xvfb)
- Ollama model: gemma2:2b

---

## Run 1 — Cold start for events (preEventsInFile=0)

- Session: 146775f3-4723-43dd-95eb-dda796f0cdd8
- singleTurnTest: PASS (chat response received)
- eventReplayProofTest flow:
  1. titan_persistence_init → OK
  2. titan_get_persistence_status → events_persisted=0
  3. titan_get_events_since({timestamp: 0}) → [] (0 events in file)
  4. titan_load_state → preEventState (from snap[3], total_memories=0)
  5. preMemoryCount=0
  6. titan_persist_event({event: {module: "memory", event_type: "add", payload: {source: "event_replay_proof_p1_11"}}}) → OK
  7. titan_get_events_since({timestamp: 0}) → [ev0] (1 event)
  8. titan_get_persistence_status → events_persisted=1
  9. titan_load_state → postEventState (snap[3] + ev0 replayed, total_memories=1)
  10. postMemoryCount=1
  11. Assertions: postEventsCount(1)>=preEventsCount(0)+1 ✓, events_persisted 0→1 ✓, 1===0+1 ✓
- Exit: 0 (PASS)

---

## Run 2 — WRY crash (non-persistence, pre-existing)

- singleTurnTest: FAIL — invalid session id (WRY crash before test body)
- eventReplayProofTest: FAIL — invalid session id (WRY crash in prepareChatSurface)
- Classification: PRE-EXISTING WRY session instability (~25% rate)
- Impact: None on event persistence proof
- Exit: 1 (FAIL — WRY)

---

## Run 2 Retry — Warm start for events (preEventsInFile=1)

- Session: b3da613c-7edc-4c11-bb60-8ea61c52afcd
- singleTurnTest: PASS
- eventReplayProofTest flow:
  1. titan_persistence_init → OK
  2. titan_get_events_since({timestamp: 0}) → [ev0] (1 event from Run 1)
  3. titan_load_state → preEventState (snap[3] + ev0 replayed, total_memories=1)
  4. preMemoryCount=1 (Run 1's event already replayed)
  5. titan_persist_event → ev1 written → file now has 2 events
  6. titan_load_state → postEventState (snap[3] + ev0 + ev1 replayed, total_memories=2)
  7. postMemoryCount=2
  8. Assertions: 2>=1+1 ✓, events_persisted 0→1 ✓, 2===1+1 ✓
- Exit: 0 (PASS)

---

## Run 3 — Warm start for events (preEventsInFile=2)

- Session: 85d83462-c67f-4d17-9b74-fee0976a0b20
- singleTurnTest: PASS
- eventReplayProofTest flow:
  1. titan_persistence_init → OK
  2. titan_get_events_since({timestamp: 0}) → [ev0, ev1] (2 events from runs 1+2r)
  3. titan_load_state → preEventState (snap[3] + ev0 + ev1 replayed, total_memories=2)
  4. preMemoryCount=2
  5. titan_persist_event → ev2 written → file now has 3 events
  6. titan_load_state → postEventState (snap[3] + ev0+ev1+ev2 replayed, total_memories=3)
  7. postMemoryCount=3
  8. Assertions: 3>=2+1 ✓, events_persisted 0→1 ✓, 3===2+1 ✓
- Exit: 0 (PASS)

---

## X3 summary table

| Run | preMemoryCount | postMemoryCount | preEventsInFile | postEventsInFile | events_persisted | Exit |
|-----|---------------|-----------------|-----------------|------------------|------------------|------|
| 1 | 0 | 1 | 0 | 1 | 0→1 | 0 PASS |
| 2 | — | — | — | — | — | 1 WRY |
| 2r | 1 | 2 | 1 | 2 | 0→1 | 0 PASS |
| 3 | 2 | 3 | 2 | 3 | 0→1 | 0 PASS |

3 successful runs. total_memories increments +1 each run. Events accumulate correctly.

## DB state after P1.11 X3

```
events.json: [
  {module: "memory", event_type: "add", ts: 1774739078237, payload: {source: "event_replay_proof_p1_11"}},
  {module: "memory", event_type: "add", ts: 1774739194213, payload: {source: "event_replay_proof_p1_11"}},
  {module: "memory", event_type: "add", ts: 1774739259729, payload: {source: "event_replay_proof_p1_11"}}
]
```
All timestamps > snap[3].timestamp (1774737743232) — replay filter is correct.
