A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4_DOCS
C) RISK: P1
D) PLAN: fournir rollback symetrique strictement derive des fichiers mission
E) PROOFS: `/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/DOCS_V28_CANONICAL_FUSION_2026-03-14_1554_3623cbdb3/09_FILES_TOUCHED.md`
F) ROLLBACK: commandes ci-dessous

# 10 ROLLBACK

EXACT_ROLLBACK_FROM_MISSION_DOC_FILES:
`git restore -- /home/titane-os/Documents/GitHub/TITANE_INFINITY/package.json /home/titane-os/Documents/GitHub/TITANE_INFINITY/CHANGELOG.md /home/titane-os/Documents/GitHub/TITANE_INFINITY/README.md /home/titane-os/Documents/GitHub/TITANE_INFINITY/docs/README.md /home/titane-os/Documents/GitHub/TITANE_INFINITY/docs/90_release/PRODUCTION_RELEASE_v28.0.0.md`

ROLLBACK_PROOF_PACK_ONLY:
`rm -rf /home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/DOCS_V28_CANONICAL_FUSION_2026-03-14_1554_3623cbdb3`

EXACT_RESTORE_COMMAND_FOR_OUT_OF_SCOPE:
`git restore -- /home/titane-os/Documents/GitHub/TITANE_INFINITY/src/services/conversationEngine.ts /home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/desktop/online-chat-proof-ui.wdio.test.js /home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/autoheal/autoheal_rules.jsonl /home/titane-os/Documents/GitHub/TITANE_INFINITY/deployment/latest/builds/hash_run_1.txt /home/titane-os/Documents/GitHub/TITANE_INFINITY/deployment/latest/builds/titane-infinity.run1.normalized`
