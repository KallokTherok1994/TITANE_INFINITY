# Rollback

## Portee

Rollback strictement chirurgical.

## Fichiers code/tests

1. Restaurer:
   - `src/components/LanguageSwitcher.tsx`
   - `src/__tests__/apps/Settings/Settings.test.tsx`
   - `src/__tests__/apps/Settings/__snapshots__/Settings.test.tsx.snap`
   - `src/pages/CloudCenter/SyncConfig.tsx`
   - `src/pages/CloudCenter/VaultStatus.tsx`
   - `src-tauri/src/cloud/commands.rs`
   - `src/__tests__/pages/CloudSyncTruth.test.tsx`
   - `src/ui/pages/KnowledgeFusionPage.tsx`
   - `src/__tests__/pages/KnowledgeFusionTruth.test.tsx`

2. Rejouer:

```bash
pnpm exec vitest run src/__tests__/apps/Settings/Settings.test.tsx
pnpm exec vitest run src/__tests__/pages/CloudSyncTruth.test.tsx
pnpm exec vitest run src/__tests__/pages/KnowledgeFusionTruth.test.tsx
pnpm run check
cargo check --manifest-path src-tauri/Cargo.toml
```

## Proof pack

- Le proof pack est append-only.
- Aucun rollback requis sur le pack pour restaurer le produit.
