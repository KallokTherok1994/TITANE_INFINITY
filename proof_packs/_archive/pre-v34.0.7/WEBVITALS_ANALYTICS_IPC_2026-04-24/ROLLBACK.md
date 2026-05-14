# ROLLBACK — WebVitals Analytics IPC (2026-04-24)

## Procédure de rollback
- Restaurer la version précédente de `src/utils/webVitals.ts` (avant secureInvoke)
- Supprimer `src-tauri/src/commands/web_vitals_commands.rs`
- Retirer l’enregistrement de la commande dans `src-tauri/src/main.rs`
- Restaurer les versions précédentes de `UI_SURFACE_MAP.md`, `ARCHITECTURE.md`, `docs/CARTOGRAPHY_COMPLETE.md`
- Supprimer le test E2E `e2e/desktop/webvitals-analytics-proof.e2e.ts`
- Supprimer l’entrée correspondante dans `scripts/autoheal/autoheal_rules.jsonl`
- Supprimer le pack de preuve `proof_packs/WEBVITALS_ANALYTICS_IPC_2026-04-24/`

## Commandes recommandées
- `git restore --staged && git restore` sur les fichiers listés ci-dessus
- Vérifier l’absence de la surface analytics WebVitals IPC dans la cartographie et les artefacts

---
*Rollback documenté, conforme doctrine TITANE (One Door, rollback prêt, artefact, mapping, preuve, test)*
