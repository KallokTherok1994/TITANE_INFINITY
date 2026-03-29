# P1.14d — ROLLBACK

## 1. PRODUCT ROLLBACK

**NO_PATCH_NEEDED** — No product code modified.

## 2. GOVERNANCE ROLLBACK

To undo governance spec update:
```bash
git restore -- docs/governance/EXTERNAL_SYNC_RUNTIME_PROOF_SPEC.md
```

To undo proof pack:
```bash
rm -rf proof_packs/POST_SEALED_EXTERNAL_SYNC_ENV_ONLY_2026-03-29_1426_1c961c88a/
```

## 3. PERSISTENCE / TEST ARTIFACTS

No test artifacts created. No persistence changes.

## 4. RUNTIME PROOF IMPACT

- External sync remains **NOT_RUNNABLE** — BLOCKED_ENV stable after 4 cycles
- **Terminal state** for P1.14x chain
- Next entry point: P1.15 (new lock, LANE B) once env is configured
- Until env is provided, no productive re-entry is warranted

## 5. REGISTRY ROLLBACK

```bash
# Remove last 1 line (P1.14d entry)
head -n -1 registry/proofpack-index.jsonl > /tmp/reg_tmp.jsonl
mv /tmp/reg_tmp.jsonl registry/proofpack-index.jsonl
```
