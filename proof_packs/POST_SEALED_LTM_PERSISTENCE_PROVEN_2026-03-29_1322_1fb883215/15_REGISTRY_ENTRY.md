# REGISTRY_ENTRY — P1.13a

## Entry to append to registry/proofpack-index.jsonl

```json
{"ts":"2026-03-29T13:22:00Z","source_pack":"proof_packs/POST_SEALED_LTM_PERSISTENCE_PROVEN_2026-03-29_1322_1fb883215","classification":"LTM_PERSISTENCE_PROVEN","verdict":"LTM_PERSISTENCE_PROVEN","ltm_system":"persistent_memory_v19","scenarios_proven":["write_entry","get_stats","read"],"x3_runs":3,"pre_long_term_run1":0,"post_long_term_run3":3,"read_total_count_run3":89,"break_documented":"BREAK_AT_RECALL_WRITE_MISMATCH","head":"1fb883215","version":"28.88.0","retention_rule":"append_only_proof_pack"}
```

## Registry gate

- X3 independent runs: PASS
- All 5 assertions per run: PASS
- No Rust code changes: CONFIRMED
- Verdict is commit-eligible: LTM_PERSISTENCE_PROVEN ✓
