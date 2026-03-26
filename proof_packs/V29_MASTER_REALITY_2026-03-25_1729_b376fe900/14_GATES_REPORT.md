# 14_GATES_REPORT

| Gate | Etat | Note |
|---|---|---|
| `G_BOOT_TRUTH` | PASS | bootstrap complet execute |
| `G_VERSION_SURFACES_ALIGNED` | PASS | surfaces actives et canoniques alignees sur `28.88.0` |
| `G_CLAIMS_VS_PROOFS_MAP_COMPLETE` | PASS | matrice construite |
| `G_PRIMARY_LOCK_IDENTIFIED` | PASS | `L-HTTP-IPC-001` |
| `G_SCOPE_BUCKETS_VALID` | PASS | A/B/C fixes sans broad refactor |
| `G_MINIMAL_PATCH_ONLY` | PASS | patch cible sur `http_request` |
| `G_BUILD_RELEVANT_PASS` | PASS | `pnpm run check` + `cargo check` |
| `G_TESTS_RELEVANT_PASS` | PASS | validateurs cibles passent |
| `G_RUNTIME_RELEVANT_PROVEN_OR_BLOCKED` | PASS | lock causal prouve au build, runtime global classe honnetement |
| `G_DOCS_ALIGNED_IF_TOUCHED` | PASS | proof pack de session coherent |
| `G_REGISTRY_ALIGNED_IF_TOUCHED` | PASS | registry non touche |
| `G_PROOF_PACK_COMPLETE` | PASS | pack V29_MASTER_REALITY cree complet |
| `G_ROLLBACK_READY` | PASS | rollback chirurgical defini |
| `G_V29_BUMP_JUSTIFIED` | FAIL | locks v28 restants hors version |
| `G_V29_SEAL_READY` | FAIL | seal non soutenable factuellement |

## Note

Le sous-lock release-gating a progresse, mais `G_V29_SEAL_READY` reste en echec pour des raisons plus profondes que le seul workflow.
