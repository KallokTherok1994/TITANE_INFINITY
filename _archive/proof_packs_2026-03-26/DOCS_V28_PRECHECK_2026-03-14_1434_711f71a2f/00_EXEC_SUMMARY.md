A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (`proof_packs/DOCS_V28_PRECHECK_2026-03-14_1434_711f71a2f/**` + lecture bornée de `README.md`, `docs/**`, `package.json`, `CHANGELOG.md`)
C) RISK: P0
D) PLAN: 1) A1 gate Git 2) A2 inventaire borné 3) A3 audit version 4) A4 décision.
E) PROOFS: obtenues = `_A1_git_gate.log`, `_A2_docs_inventory.log`, `_A3_version_authority.log`; attendues = verdict unique de précheck.
F) ROLLBACK: `rm -rf proof_packs/DOCS_V28_PRECHECK_2026-03-14_1434_711f71a2f`

# 00 EXEC SUMMARY

- Exécution: **Phase A uniquement** (conformité mode strict 2-gates).
- A1 Local Truth Gate: échec (`DIVERGED_FROM_MAIN`).
- A2: surfaces canoniques bornées inventoriées.
- A3: V28 non prouvé; dérive versionnelle détectée.
- Décision A4: arrêt stopline, aucun passage en B1/B2.
- Verdict session: `BLOCKED_LOCAL_TRUTH`.
