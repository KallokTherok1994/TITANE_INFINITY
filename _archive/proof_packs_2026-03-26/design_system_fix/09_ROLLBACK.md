# 09 ROLLBACK

Rollback fichier par fichier (scope tokens/theme uniquement):

```bash
git restore -- src/App.tsx
git restore -- src/features/design-center/DesignCenterPage.tsx
git restore -- src/features/design-center/providers/UIThemeProvider.tsx
git restore -- src/features/design-center/tabs/DesignSystemTab.tsx
git restore -- src/features/design-center/__tests__/DesignCenter.truth-chain.test.tsx
git clean -f -- src/features/design-center/utils/contrast.ts
```

Rollback proof pack (si necessaire):
```bash
rm -rf proof_packs/design_system_fix/
```

Effet rollback:
- suppression provider global runtime
- suppression aliases CSS canoniques
- suppression auto-correction contraste
- retour comportement pre-fix