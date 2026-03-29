# P1.14c — ROLLBACK

## 1. PRODUCT ROLLBACK

**NO_PATCH_NEEDED**

No product code was modified in P1.14c. No product rollback needed.

Restore command (if proof pack creation needs to be undone):
```bash
rm -rf proof_packs/POST_SEALED_EXTERNAL_SYNC_ENV_ONLY_2026-03-29_1404_1c961c88a/
```

---

## 2. GOVERNANCE ROLLBACK

If the governance spec needs to be removed:
```bash
rm docs/governance/EXTERNAL_SYNC_RUNTIME_PROOF_SPEC.md
```

---

## 3. PERSISTENCE / TEST ARTIFACTS

No test artifacts were created. No persistence changes were made.

The proof pack itself is the artifact:
```
proof_packs/POST_SEALED_EXTERNAL_SYNC_ENV_ONLY_2026-03-29_1404_1c961c88a/
```

To clean up:
```bash
rm -rf proof_packs/POST_SEALED_EXTERNAL_SYNC_ENV_ONLY_2026-03-29_1404_1c961c88a/
```

---

## 4. RUNTIME PROOF IMPACT

- External sync is **NOT runnable** — BLOCKED_ENV condition persists
- Next step is: provide TURSO_DATABASE_URL + TURSO_AUTH_TOKEN + OPTION1_SYNC_ENABLED=true
- Then run P1.14d as LANE B (VERIFY_AND_PROVE_EXTERNAL_SYNC)
- Until env is provided, BLOCKED_ENV is the honest and stable classification

## 5. REGISTRY ROLLBACK

To remove the two registry entries appended by P1.14c:
```bash
# Remove last 2 lines from registry/proofpack-index.jsonl
# (P1.14b entry + P1.14c entry)
head -n -2 registry/proofpack-index.jsonl > /tmp/registry_backup.jsonl
mv /tmp/registry_backup.jsonl registry/proofpack-index.jsonl
```
