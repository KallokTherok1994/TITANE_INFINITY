# LANE_SELECTION — P1.12

## Auto lane router evaluation

| Gate | Condition | Result |
|------|-----------|--------|
| G1: Code path exists? | `apply_event_to_state` has xp/progress/knowledge/settings arms | YES |
| G2: IPC reachable? | `titan_persist_event` proven P1.11 | YES |
| G3: Requires new Rust code? | No — all reducers already in binary | NO |
| G4: Requires new IPC command? | No — same `titan_persist_event` command | NO |
| G5: Requires new E2E scenario? | Yes — 4-event batch test with multi-field assertions | YES |
| G6: All assertions expressible in JS? | Yes — field reads from state objects | YES |

## Lane selected: LANE A (E2E harness only)

**Rationale**: The reducers are already compiled into the binary. No Rust patch is needed. Proof requires only:
1. Adding a gated E2E test that emits the 4 new event types
2. Running X3 to confirm field mutations

**Lane A deliverables**:
- New `multiReducerProofTest` in `online-chat-proof-ui.wdio.test.js`
- X3 runtime runs under `TITANE_MULTI_REDUCER_PROOF=1`
- Proof pack files 00–18
- `MULTI_REDUCER_REPLAY_PROOF_SPEC.md` governance spec
- Registry entry

**LANE B (Rust patch) skipped**: No reducer is missing from `apply_event_to_state`. All 5 reducers confirmed present in `commands.rs`/`mod.rs`.
