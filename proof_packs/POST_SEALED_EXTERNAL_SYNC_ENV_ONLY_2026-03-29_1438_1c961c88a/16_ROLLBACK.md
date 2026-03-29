# P1.15 — ROLLBACK

## 1. PRODUCT: NO_PATCH_NEEDED

## 2. GOVERNANCE
```bash
rm -rf proof_packs/POST_SEALED_EXTERNAL_SYNC_ENV_ONLY_2026-03-29_1438_1c961c88a/
# Remove last registry entry:
head -n -1 registry/proofpack-index.jsonl > /tmp/r.jsonl && mv /tmp/r.jsonl registry/proofpack-index.jsonl
```

## 3. PERSISTENCE / TEST ARTIFACTS
None created.

## 4. RUNTIME PROOF IMPACT
- External sync: **NOT_RUNNABLE** — chain closed after 5 consecutive BLOCKED_ENV
- Next step: provision Turso database, set 3 env vars, open new live proof lock
- Until then: no productive re-entry
