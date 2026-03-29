# X3_RUNS — P1.13a

## Run 1

```
TITANE_LTM_PATH_PROOF=1 TITANE_NATIVE_BINARY_MODE=debug bash scripts/e2e/run-online-chat-proof-ui.sh
```

```
[LTM_PATH] stats_before: long_term=0 full={"long_term":0,"session":0,"intermediate":86}
[LTM_PATH] write_entry id=73cc4a20-c11e-4320-bae8-82878e5ac33b type=string
[LTM_PATH] stats_after: long_term=1 (pre=0)
[LTM_PATH] read total_count=87 entries=87
✓ proves LTM runtime path: persistent_memory IPC round-trip + isolation from conversation recall
2 passing (24.8s)
```

| Assertion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| get_stats reachable | non-null | {count_by_level: {long_term:0, session:0, intermediate:86}} | PASS |
| write_entry returns UUID | string | 73cc4a20-c11e-4320-bae8-82878e5ac33b | PASS |
| long_term count: pre→post | 0→1 | 0→1 | PASS |
| read entries array | Array | Array(87) | PASS |
| read total_count ≥ 1 | ≥1 | 87 | PASS |

## Run 2

```
[LTM_PATH] stats_before: long_term=1 full={"long_term":1,"session":0,"intermediate":86}
[LTM_PATH] write_entry id=8c74e502-2a9e-4a6a-af28-6b005c5f90fb type=string
[LTM_PATH] stats_after: long_term=2 (pre=1)
[LTM_PATH] read total_count=88 entries=88
✓ proves LTM runtime path: persistent_memory IPC round-trip + isolation from conversation recall
2 passing (30.2s)
```

| Assertion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| get_stats reachable | non-null | {count_by_level: {long_term:1, session:0, intermediate:86}} | PASS |
| write_entry returns UUID | string | 8c74e502-2a9e-4a6a-af28-6b005c5f90fb | PASS |
| long_term count: pre→post | 1→2 | 1→2 | PASS |
| read entries array | Array | Array(88) | PASS |
| read total_count ≥ 1 | ≥1 | 88 | PASS |

## Run 3

```
[LTM_PATH] stats_before: long_term=2 full={"long_term":2,"session":0,"intermediate":86}
[LTM_PATH] write_entry id=3824b693-e72d-4c0e-99b1-644f40a0c037 type=string
[LTM_PATH] stats_after: long_term=3 (pre=2)
[LTM_PATH] read total_count=89 entries=89
✓ proves LTM runtime path: persistent_memory IPC round-trip + isolation from conversation recall
2 passing (49.7s)
```

| Assertion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| get_stats reachable | non-null | {count_by_level: {long_term:2, session:0, intermediate:86}} | PASS |
| write_entry returns UUID | string | 3824b693-e72d-4c0e-99b1-644f40a0c037 | PASS |
| long_term count: pre→post | 2→3 | 2→3 | PASS |
| read entries array | Array | Array(89) | PASS |
| read total_count ≥ 1 | ≥1 | 89 | PASS |

## Cross-run summary

- long_term entries: 0 → 1 → 2 → 3 (monotonic, +1 per run)
- UUIDs: all distinct (73cc4a20, 8c74e502, 3824b693)
- total_count: 87 → 88 → 89 (monotonic, cross-run accumulation)
- intermediate entries: 86 (unchanged — pre-existing data, not modified by proof)
