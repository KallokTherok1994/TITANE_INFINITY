A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4
C) RISK: P1
D) PLAN: provide exact rollback derived only from mission docs list
E) PROOFS: `/home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/DOCS_CANON_PARTIAL_2026-03-14_1528_ab049915b/10_FILES_TOUCHED.md`
F) ROLLBACK: commands below

# 11 ROLLBACK

EXACT_ROLLBACK_FROM_MISSION_DOC_FILES:
`git restore -- /home/titane-os/Documents/GitHub/TITANE_INFINITY/README.md /home/titane-os/Documents/GitHub/TITANE_INFINITY/docs/README.md /home/titane-os/Documents/GitHub/TITANE_INFINITY/docs/diagrams/README.md /home/titane-os/Documents/GitHub/TITANE_INFINITY/docs/INDEX.md /home/titane-os/Documents/GitHub/TITANE_INFINITY/docs/current/INDEX.md`

ROLLBACK_PROOF_PACK_ONLY:
`rm -rf /home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/DOCS_CANON_PARTIAL_2026-03-14_1528_ab049915b`

OUT_OF_SCOPE_CLEANUP_BEFORE_DOCS_ONLY_COMMIT:
`git restore -- /home/titane-os/Documents/GitHub/TITANE_INFINITY/src/services/conversationEngine.ts /home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/autoheal/autoheal_rules.jsonl /home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/desktop/online-chat-proof-ui.wdio.test.js`
