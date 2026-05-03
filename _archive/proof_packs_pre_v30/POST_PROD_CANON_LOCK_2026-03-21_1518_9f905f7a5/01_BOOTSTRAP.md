# Bootstrap

- HEAD: 9f905f7a5 (MAIN, origin/MAIN)
- Branch: MAIN
- git status: CLEAN
- Node v20.20.0 / pnpm 10.30.2 / cargo 1.94.0 / rustc 1.94.0

## Post-release commits (since seal at 43d74641a)
- 9f905f7a5 fix(post-prod): docs/README.md version drift [THIS SESSION]
- 700f0ba92 chore(proof): Omega runtime recert — online/Ollama desktop truth [QUALIFIED]
- 54478c390 chore(proof): PREPROD_LOCAL_FINAL_GATE proof pack — STABLE v28.6.0
- 2f9461f90 fix(rust-test): version assertion uses CARGO_PKG_VERSION
- 5bd4a6448 chore(docs+registry): post-prod truth reconciliation v28.6.0
- d15e2a692 fix(preprod-gate): v28.6.0 doc sync + native freshness dist-input fix

All post-release commits: governance/docs/tests/proof-packs only. No product changes.

## Gate Baseline
- G_NATIVE_BINARY_FRESHNESS: PASS (FRESH_RELEASE_BINARY)
- verify_instructions: PASS=20 FAIL=0
- detect_recurrence: G_AH_RECURRENCE_GUARD_PASS (512 entries)
