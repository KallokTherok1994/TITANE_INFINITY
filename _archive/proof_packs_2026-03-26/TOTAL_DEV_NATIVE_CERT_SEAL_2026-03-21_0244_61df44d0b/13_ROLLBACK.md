# 13_ROLLBACK

Minimal rollback for sealing/hardening patch:

```bash
git restore -- scripts/e2e/native-binary-policy.cjs \
  scripts/verify/verify-native-binary-freshness.sh \
  scripts/e2e/run-desktop-suite.js \
  wdio.desktop.conf.cjs \
  scripts/autoheal/autoheal_rules.jsonl
```

Optional proof-pack cleanup for this session only:

```bash
rm -rf proof_packs/TOTAL_DEV_NATIVE_CERT_SEAL_2026-03-21_0244_61df44d0b
```

No product rollback required because no feature/product code was introduced in this session.
