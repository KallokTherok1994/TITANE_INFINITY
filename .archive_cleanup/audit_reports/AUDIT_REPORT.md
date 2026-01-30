# TITANE_INFINITY — AUDIT_REPORT (Phase 0)

Date: 2026-01-15  
Branche: MAIN  
Portée: audit factuel + plan P0→P2 (aucun refactor gratuit)

## Résumé exécutif (10 lignes)
1) Le dépôt contient des fichiers sensibles *versionnés* à la racine: `.env.deploy`, `.env.gpg`, `.env.ollama`, `.tunnel-access.txt`, `.current-server-info` (risque P0: fuite de secrets / accès).  
2) La surface IPC Tauri est très large: ~1255 occurrences de `#[tauri::command]`, ~1122 noms uniques extraits (risque P0: exposition de capacités).  
3) Côté front, on observe 201 usages de `invoke(` et 91 noms de command littéraux distincts (risque P1: contrat interne non centralisé, régressions silencieuses).  
4) `pnpm audit --prod` ne remonte aucune vulnérabilité connue sur la date du scan (bon signal, mais à automatiser en CI).  
5) `cargo audit` remonte des avertissements (ex: crates GTK3/gtk-rs “unmaintained”, et autres), sans preuve immédiate de vulnérabilités critiques dans la sortie capturée (risque P1: dette supply-chain).  
6) Le workspace contient un volume élevé d’artefacts générés (ex: `src-tauri/target/**` domine le top tailles), ce qui augmente le risque de contamination du build stable si les whitelists packaging sont incomplètes (risque P1).  
7) Git LFS suit des binaires/artefacts (AppImage/DEB, binaire Node sous `.tools/`, wav cache) — à traiter explicitement dans la gouvernance build et le périmètre stable (risque P1/P2).

## Matrice des risques (P0 / P1 / P2)

### P0 — Critique (bloquant sécurité)
- Secrets & accès potentiels versionnés: `.env.deploy`, `.env.gpg`, `.env.ollama`, `.tunnel-access.txt`, `.current-server-info`.
- Surface Tauri très large (1122 commands uniques): plus de points d’entrée = plus de chemins d’abus possibles (FS/process/réseau).

### P1 — Important (stabilité + reproductibilité)
- Contrat TS↔Tauri non centralisé (invoke dispersés) → régressions et review difficiles.
- Artefacts build (ex: `src-tauri/target/**`) dominants en volume → risque d’inclusion accidentelle si packaging basé sur blacklists.
- Supply-chain Rust: warnings cargo-audit “unmaintained” (gtk-rs GTK3 etc.) → suivi/mitigation.

### P2 — Hygiène / dette mentale
- LFS contient des artefacts lourds (AppImage/DEB, binaires, caches audio) → clarifier la politique (quoi versionner, où, pourquoi).
- Répertoires legacy/data/etc. à isoler explicitement pour éviter les imports involontaires et contaminations.

## Preuves / Artefacts (Phase 0)
Tous les artefacts ci-dessous sont générés dans: [docs/_evidence/audit-2026-01-15/](docs/_evidence/audit-2026-01-15/)

- Inventaire fichiers (hors `.git/`): [docs/_evidence/audit-2026-01-15/inventory_files.txt](docs/_evidence/audit-2026-01-15/inventory_files.txt)
- Top 300 fichiers les plus lourds: [docs/_evidence/audit-2026-01-15/top_300_files_by_size.tsv](docs/_evidence/audit-2026-01-15/top_300_files_by_size.tsv)
- État Git LFS: [docs/_evidence/audit-2026-01-15/git_lfs_ls-files.txt](docs/_evidence/audit-2026-01-15/git_lfs_ls-files.txt)
- Scan patterns secrets (large): [docs/_evidence/audit-2026-01-15/secrets_scan_files.txt](docs/_evidence/audit-2026-01-15/secrets_scan_files.txt)
- Scan patterns secrets (scopé code/config): [docs/_evidence/audit-2026-01-15/secrets_scan_files_scoped.txt](docs/_evidence/audit-2026-01-15/secrets_scan_files_scoped.txt)
- JS deps audit (prod): [docs/_evidence/audit-2026-01-15/pnpm_audit_prod.txt](docs/_evidence/audit-2026-01-15/pnpm_audit_prod.txt)
- Rust deps audit: [docs/_evidence/audit-2026-01-15/cargo_audit.txt](docs/_evidence/audit-2026-01-15/cargo_audit.txt)
- Surface Tauri: emplacements `#[tauri::command]`: [docs/_evidence/audit-2026-01-15/tauri_commands_attribute_locations.txt](docs/_evidence/audit-2026-01-15/tauri_commands_attribute_locations.txt)
- Surface Tauri: inventaire des commands (TSV): [docs/_evidence/audit-2026-01-15/tauri_command_names.tsv](docs/_evidence/audit-2026-01-15/tauri_command_names.tsv)
- Surface Tauri: top fichiers par nombre de commands: [docs/_evidence/audit-2026-01-15/tauri_commands_by_file_top50.tsv](docs/_evidence/audit-2026-01-15/tauri_commands_by_file_top50.tsv)
- Usages `invoke(` (brut): [docs/_evidence/audit-2026-01-15/ts_invoke_usages.txt](docs/_evidence/audit-2026-01-15/ts_invoke_usages.txt)
- Commands littérales côté TS (TSV + liste unique):
  - [docs/_evidence/audit-2026-01-15/ts_invoke_command_strings.tsv](docs/_evidence/audit-2026-01-15/ts_invoke_command_strings.tsv)
  - [docs/_evidence/audit-2026-01-15/ts_invoke_command_strings_unique.txt](docs/_evidence/audit-2026-01-15/ts_invoke_command_strings_unique.txt)

## Plan de commits proposé (P0 → P2)

### P0 — Sécurité (Secrets + CI)
P0-1) Retirer les fichiers sensibles versionnés + `.gitignore` strict + `*.example` uniquement (root).  
P0-2) Ajouter une politique claire `docs/SECRETS.md` (rotation, stockage local, exceptions).  
P0-3) Ajouter un workflow CI bloquant “secret scan” (gitleaks ou équivalent) + conserver/clarifier GitGuardian si déjà présent.

### P0 — Sécurité (Surface Tauri)
P0-4) Durcir les commands SENSITIVE/DANGEROUS: validation d’inputs (paths allowlist/canonicalize), erreurs propres, logs safe.  
P0-5) Réduire `capabilities`/allowlist Tauri au strict nécessaire + doc courte “Tauri Surface”.

### P1 — Stabilité (Contrat TS↔Tauri)
P1-1) Centraliser `invoke()` dans `src/lib/tauriClient.ts` (1 fonction typée par command).  
P1-2) Ajouter un test contractuel minimal: liste statique des commands attendues côté TS.

### P1 — Toolchain & hooks robustes
P1-3) Ajouter `scripts/dev-env.sh` + exécution husky via `bash -lc "source scripts/dev-env.sh && …"`; ajuster lint-staged pour warnings non-bloquants.

### P1 — Build stable reproductible (CI)
P1-4) Durcir `runtime/stable/build.sh`: whitelists, exclusions explicites `.env*` (sauf `*.example`), logs/tunnels/data.  
P1-5) Workflow CI obligatoire: exécuter `./runtime/stable/build.sh` sur Linux (sans lancer de packaging interdit localement).

### P2 — Hygiène / quarantaine
P2-1) Ajouter `docs/INDEX.md` canonique (en cours / archive).  
P2-2) Quarantiner `legacy/` + `dist_stub/` (exclusions build + empêcher imports involontaires) + policy data/training (PII + LFS + ignores).

## Notes (limitations / hypothèses)
- Le scan “secrets” est basé sur des patterns/keywords: il produit des faux positifs (ex: docs/archives). Il est volontairement conservateur.
- `cargo audit` a été exécuté et a téléchargé la base d’avisories (nécessite accès réseau). Si un environnement strict offline est requis, on devra vendoriser/mettre en cache la DB ou adapter la stratégie.
