# 15_ROLLBACK

## Portee rollback

Rollback limite aux patches de cette session:

- fermeture du lock `http_request`
- alignement des surfaces actives de version sur `28.88.0`
- reclassification du pack mock audit
- durcissement du workflow release

## Revert chirurgical

1. Retirer `pub mod http_commands` du sous-module `commands` dans `src-tauri/src/main.rs`.
2. Retirer `commands::http_commands::http_request` de `tauri::generate_handler!` dans `src-tauri/src/main.rs`.
3. Retirer l'entree `{ "command": "http_request" }` de `src-tauri/tauri.conf.json`.
4. Retirer l'entree `{ "command": "http_request" }` de `runtime/stable/tauri.conf.json`.
5. Restaurer les libelles/version strings precedentes dans `package.json`, `src-tauri/Cargo.toml`, `src/pages/DevPage.tsx`, `CHANGELOG.md`, `README.md` si ce second patch doit etre annule.
6. Restaurer le verdict/texte precedent de `proof_packs/MOCK_AUDIT_FINAL_2026-03-25_1140/00_EXEC_SUMMARY.md` si ce re-classement doit etre annule.
7. Retirer des steps de `release-unified.yml` les tests frontend/Rust et remettre les checksums en mode non bloquant si ce durcissement doit etre annule.
8. Rejouer:

```bash
pnpm run verify:command-whitelist-sync
cargo check --manifest-path src-tauri/Cargo.toml
pnpm exec prettier --check .github/workflows/release-unified.yml
```

## Risque

- faible
- aucun schema ou migration
- aucun refactor adjacent
