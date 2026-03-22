# 07_DELETIONS_EXECUTED.md — Suppressions exécutées

**Politique**: Suppression seulement si ALL 3 prouvés: non-canonique + non-référencé + résidu reproductible

## nohup.out — SUPPRIMÉ ✓

| Critère | Preuve |
|---------|--------|
| Non-canonique | ✓ — fichier de sortie de process, pas de preuve intentionnelle |
| Non-référencé | ✓ — grep dans README, docs, scripts: 0 correspondances |
| Résidu reproductible | ✓ — contenu: 3 lignes démarrage vite (114 bytes), reproductible via `pnpm dev` |

```bash
git rm nohup.out
# rm 'nohup.out' ✓
```

**Contenu archivé mentalement**: `VITE v7.3.1 ready in 557ms → http://localhost:5173/`

## Autres suppressions proposées mais BLOQUÉES

| Fichier | Raison du blocage |
|---------|------------------|
| build_log.txt | Référencé dans `scripts/advanced-diagnostic.sh` |
| dev_tauri_*.txt | Listé dans `docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17:42:42Z.txt` |
| CAMPAIGN_COMPLETE_v27.0.2.txt | Preuve historique v27, non prouvé comme résidu pur |
| *.sh root scripts | Référencés dans docs/90_release/ |
