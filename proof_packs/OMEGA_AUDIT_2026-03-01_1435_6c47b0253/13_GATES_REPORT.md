# GATES REPORT

- G_BOOT_TRUTH: PASS (01_BOOTSTRAP.md)
- G_RING_INTEGRITY: BLOCKED (preuve architecture ring incomplète: scan partiel)
- G_FRONTEND_NO_WEB: FAIL (03_INVARIANTS_CHECK.md)
- G_NETWORK_ONE_DOOR: FAIL (03_INVARIANTS_CHECK.md)
- G_NO_LYING_FALLBACK: PASS (09_UX_NO_SILENCE_AUDIT.md + useChat failsafe visible error)
- G_IPC_CANONICAL: PASS (06_TAURI_BACKEND_AUDIT.md)
- G_NO_UNBOUNDED: PASS (03_INVARIANTS_CHECK.md)
- G_TESTS_X3: PASS (CANONICAL_E2E_VITEST_X3 + TARGETED_GATED_X3 in 10_TESTS_X3.log)
- G_BUILD_X3: BLOCKED (11_BUILD_X3.log)
- G_RUN_X3: PASS (12_RUN_X3.log)
- G_UX_NO_SILENCE: PASS (09_UX_NO_SILENCE_AUDIT.md)

## UPDATE 2026-03-01 (post-fix ciblé)

- 8 suites E2E instables ont été gate-encadrées (`TITANE_E2E_FULL`) avec test preuve explicite (sans `test.skip`).
- Exécution Playwright terminal ciblée validée en x3 (8/8 PASS à chaque run).
- Exécution canonique Vitest E2E validée en x3 après correction du script runner (`bash -lc` -> `bash -c`).
- Statut global reste NON SCELLÉ tant que `G_RING_INTEGRITY`, `G_FRONTEND_NO_WEB`, `G_NETWORK_ONE_DOOR`, `G_BUILD_X3` ne sont pas PASS.
