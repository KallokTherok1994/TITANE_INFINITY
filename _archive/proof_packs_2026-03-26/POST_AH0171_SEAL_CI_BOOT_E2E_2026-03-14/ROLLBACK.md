## ROLLBACK — POST_AH0171_SEAL_CI_BOOT_E2E_2026-03-14

```bash
git restore -- \
  src-tauri/tests/omega_p2_performance_test.rs \
  scripts/autoheal/autoheal_rules.jsonl \
  proof_packs/POST_COPILOT_DELTA_VERIFY_2026-03-14/ \
  proof_packs/POST_AH0171_SEAL_CI_BOOT_E2E_2026-03-14/
```

Note : La restauration de `scripts/autoheal/autoheal_rules.jsonl` supprime les entrées
AH-2026-03-14-0170 et AH-2026-03-14-0171. Ceci rétablit l'état avant les deltas Prettier et Rust.
