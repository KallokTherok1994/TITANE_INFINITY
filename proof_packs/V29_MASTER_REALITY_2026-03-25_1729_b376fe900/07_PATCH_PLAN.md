# 07_PATCH_PLAN

## Strategie appliquee

- ne toucher qu'a la fermeture du lock `http_request`
- ne pas etendre le scope aux autres commandes nouvelles du mock audit
- ne pas nettoyer les gros diffs preexistants dans les fichiers Tauri config
- corriger ensuite seulement les surfaces actives ou preuves mensongeres

## Fichiers reellement modifies pour le lock

- `src-tauri/src/main.rs`
- `src-tauri/tauri.conf.json`
- `runtime/stable/tauri.conf.json`
- `package.json`
- `src-tauri/Cargo.toml`
- `src/pages/DevPage.tsx`
- `CHANGELOG.md`
- `README.md`
- `proof_packs/MOCK_AUDIT_FINAL_2026-03-25_1140/00_EXEC_SUMMARY.md`
- `.github/workflows/release-unified.yml`

## Nature du patch

- exposition du module `http_commands`
- enregistrement de `http_request` dans `tauri::generate_handler!`
- ajout de `http_request` dans les allowlists/capabilities pertinentes
- alignement des surfaces actives de version sur `28.88.0`
- reclassification d'un proof pack incomplet de `DONE` vers `PARTIAL`
- durcissement du workflow release: vrais tests Linux + checksums redevenus bloquants

## Limite explicite

Les fichiers de config Tauri etaient deja fortement modifies avant cette session. Le patch utile de cette session se limite a l'entree `http_request`, a son cablage `main.rs`, a l'alignement explicite de quelques surfaces de version actives, a la reclassification d'un pack incomplet et au durcissement localise du workflow `release-unified.yml`.
