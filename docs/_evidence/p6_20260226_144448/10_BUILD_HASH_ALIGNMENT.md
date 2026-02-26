# 10_BUILD_HASH_ALIGNMENT.md

Phase: P6
Statut: QUALIFIED

## Alignement attendu
- App version: `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`
- Deployment: `deployment/latest/MANIFEST.json`, `SHA256SUMS_v<version>.txt`, `SIZES_v<version>.txt`

## État run courant
- Build PROD non autorisé (token absent), donc alignement artifact final non exécutable dans ce run.