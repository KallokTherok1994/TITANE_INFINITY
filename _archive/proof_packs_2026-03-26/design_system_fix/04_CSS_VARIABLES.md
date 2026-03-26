# 04 CSS VARIABLES

## Variables CSS ecrites au runtime (extraits)
- Couleurs base: `--color-primary`, `--color-secondary`, `--color-accent`.
- Surfaces: `--color-background`, `--color-surface`, `--color-surface-elevated`.
- Texte contraste: `--color-text`, `--color-text-muted`, `--color-text-on-*`.
- Canoniques: `--background`, `--surface`, `--surface-elevated`, `--text-primary`, `--text-muted`, `--border`, `--border-focus`.
- Legacy shell: `--color-bg-primary`, `--color-text-primary`, `--color-border-default`.
- Admin: `--admin-bg-start`, `--admin-bg-end`, `--badge-accent-color`.

## Preuve de mise a jour runtime
Dans tests truth-chain:
- changement token accent -> `--color-accent` mis a jour;
- aliases verifies: `--background`, `--surface`, `--text-primary`.

## Correction de rupture
Avant: classes/feuilles s'appuyaient sur vars jamais ecrites par provider.
Apres: provider alimente explicitement les variables attendues par l'UI.