# 04_OPEN_LOCKS

## Etat

Le lock primaire de cette session a ete ferme. Les locks ci-dessous restent ouverts pour une preparation V29 honnete.

| lock_id | Lieux exacts | Gravite | Type de preuve | Pourquoi ca compte maintenant | Scope V29 | Impact rollback | Chaine de dependance |
|---|---|---|---|---|---|---|---|
| `L-SUPPLY-CHAIN-001` | `proof_packs/RELEASE_SEAL_2026-03-15_1606_773f2a89e/06_SUPPLY_CHAIN_TRUTH.md`, `.github/workflows/release-unified.yml` | haute | preuve historique + workflow | V29 seal ne peut pas etre factuel avec SBOM absent et signing CI-only | oui, pour seal | nul | release -> updater/signing/SBOM |
| `L-RUNTIME-COVERAGE-001` | packs TWINS/TOTAL_DEV/E2E desktop | moyenne | runtime historique | runtime desktop n'est pas uniformement re-prouve pour toutes les lanes | oui, pour seal | nul | desktop proof -> V29 seal |

## Lock ferme dans cette session

| lock_id | Lieux exacts | Gravite | Type de preuve | Pourquoi ca comptait maintenant | Scope V29 | Impact rollback | Chaine de dependance |
|---|---|---|---|---|---|---|---|
| `L-HTTP-IPC-001` | `src/core/http/httpClient.ts`, `src-tauri/src/main.rs`, `src-tauri/tauri.conf.json`, `runtime/stable/tauri.conf.json` | critique | build + config | le frontend appelait `http_request` sans fermeture complete de la chaine Tauri | oui | faible | UI -> secureInvoke -> main invoke -> allowlist |
| `L-VERSION-TRUTH-001` | `package.json`, `src-tauri/Cargo.toml`, `src/pages/DevPage.tsx`, `CHANGELOG.md`, `README.md` | critique | statique | les surfaces actives annoncaient des versions incoherentes avec `28.88.0` | oui | faible | version surfaces -> docs -> UI -> release truth |
| `L-PROOF-TRUTH-001` | `proof_packs/MOCK_AUDIT_FINAL_2026-03-25_1140/00_EXEC_SUMMARY.md` | haute | documentaire | le pack annonçait `DONE` avec un seul fichier et sans preuves runtime/build associees | oui | nul | claims -> confiance evidence -> release truth |
| `L-RELEASE-GATING-001` | `.github/workflows/release-unified.yml` | haute | workflow | le chemin release n'imposait pas de vrais tests et laissait encore des checksums non bloquants | oui | faible | release pipeline -> test gate -> artifact integrity |
