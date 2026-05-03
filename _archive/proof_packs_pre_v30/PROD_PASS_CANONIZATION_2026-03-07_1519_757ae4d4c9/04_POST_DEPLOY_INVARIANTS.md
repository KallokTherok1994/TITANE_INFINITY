# 04_POST_DEPLOY_INVARIANTS

A) EXEC_MODE: LOCAL
B) SCOPE_RING: Invariant freeze post-prod
C) RISK: P0
D) PLAN (<=7 steps):
1. Pin version parity invariant.
2. Pin smoke marker invariant.
3. Pin no-mixed-version invariant.
4. Pin scoped-security invariant.
5. Pin governance-pass invariant.
6. Pin minimal-scope invariant.
E) PROOFS:
- `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/04_post_checks.env`
- `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/04_smoke_appimage.log`
- `deployment/latest/MANIFEST.json`
- `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/raw/05_required_gates.log`
F) ROLLBACK:
- N/A (invariant declaration only).

Canonical post-deploy invariants:
1. `APP_VERSION_MATCH = YES`
2. `package.json version == AppImage version == deployment/latest/MANIFEST.json version == 27.2.0`
3. Canonical smoke marker `BOOT:READY` must remain present in smoke evidence.
4. No inter-version mixing (`27.0.5` and `27.2.0`) in active stable artifact surface.
5. P3 security gate remains active and scoped; not disabled.
6. Governance checks remain PASS for the validated prod baseline chain.
7. No scope expansion beyond minimal prod artifact alignment fix.
