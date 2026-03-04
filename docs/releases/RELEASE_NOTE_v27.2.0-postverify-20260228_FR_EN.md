# Release Note — v27.2.0-postverify-20260228 (FR/EN)

Date: 2026-02-28
Tag: `v27.2.0-postverify-20260228`
Base: `v27.2.0`
Head: `a8c824a00`

## Métadonnées de changement

- Ring impacté: Documentation/Gouvernance (hors runtime applicatif)
- Statut: QUALIFIED

## FR — Résumé

Ce seal post-verify confirme l’état stable de `MAIN` après synchronisation Git, nettoyage des artefacts runtime locaux et validation de la chaîne `verify`.

Points clés:
- Vérification complète relancée et validée après exclusion des artefacts générés `proof_packs` du contrôle de format.
- Hygiène Git renforcée avec exclusion de `runtime/memory/`.
- Tag de sealing créé et publié: `v27.2.0-postverify-20260228`.

Commits opérationnels récents:
- `a8c824a00` — ignore generated proof_packs in prettier checks
- `e044f139c` — ignore runtime memory artifacts
- `f5b7b4063` — sync release prep, e2e updates, memory tests and tooling scripts

## EN — Summary

This post-verify seal confirms a stable `MAIN` state after Git synchronization, local runtime artifact cleanup, and successful `verify` chain validation.

Key points:
- Full verification rerun passed after excluding generated `proof_packs` from format checks.
- Git hygiene reinforced by ignoring `runtime/memory/`.
- Sealing tag created and published: `v27.2.0-postverify-20260228`.

Recent operational commits:
- `a8c824a00` — ignore generated proof_packs in prettier checks
- `e044f139c` — ignore runtime memory artifacts
- `f5b7b4063` — sync release prep, e2e updates, memory tests and tooling scripts
