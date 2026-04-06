# EXEC HEADER — PROD GATE 2026-03-21 0608

A) EXEC_MODE: PROD_BUILD + PROD_DEPLOY
B) SCOPE_RING: Ring 4 (Tauri binary + bundles)
C) RISK: HIGH — production artifact generation
D) PLAN: verify gates → tauri build → checksums → cargo check x3 → proof pack → commit
E) PROOFS: artifacts + sha256 + gate outputs below
F) ROLLBACK: git restore -- src-tauri/tauri.conf.json && rm -rf src-tauri/target/release/bundle
