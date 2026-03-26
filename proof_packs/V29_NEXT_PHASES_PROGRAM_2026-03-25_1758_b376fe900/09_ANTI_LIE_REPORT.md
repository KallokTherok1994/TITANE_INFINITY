# Rapport anti-lie

## Violations traitees

### 1. I18N_LABEL_HARDCODED

- Surface: `src/components/LanguageSwitcher.tsx`
- Cause: `aria-label` fixe en anglais
- Classification: `I18N_UI_HARDCODED`
- Fix minimal: relier le label a `settings.language`
- Rollback: restaurer le fichier

### 2. I18N_PROOF_MOCKED

- Surface: `src/__tests__/apps/Settings/Settings.test.tsx`
- Cause: ancien test base sur cles mockees
- Classification: `I18N_FALLBACK_LYING`
- Fix minimal: test reel pour traduction/switch/persistence/fallback
- Rollback: restaurer test + snapshot

### 3. AUTO_SYNC_UI_FAKE

- Surface: `src/pages/CloudCenter/SyncConfig.tsx`
- Cause: mode `auto` selectionnable sans boucle runtime
- Classification: `AUTO_SYNC_FAKE`
- Fix minimal: desactivation + message honnete + save bloque
- Rollback: restaurer SyncConfig

### 4. AUTO_SYNC_BACKEND_FAKE

- Surface: `src-tauri/src/cloud/commands.rs`
- Cause: backend acceptait `auto` sans implementation
- Classification: `AUTO_SYNC_FAKE`
- Fix minimal: rejet explicite
- Rollback: restaurer `commands.rs`

### 5. ADVANCED_FEATURE_PICKER_FALSE

- Surface: `src/ui/pages/KnowledgeFusionPage.tsx`
- Cause: bouton "selectionner" mais flux reel via `prompt()`
- Classification: `ADVANCED_FEATURES_PARTIAL`
- Fix minimal: relabel manuel + note `PARTIAL`
- Rollback: restaurer la page

## Violation restante non corrigee

### 6. INTERACTIVE_DOCS_NO_RUNTIME_SURFACE

- Surface: programme phase B
- Cause: docs presentes mais pas de surface in-app interactive prouvee
- Classification: `DOC_RUNTIME_DRIFT`
- Fix minimal non tente: necessite creation d'une vraie surface docs gouvernee
- Etat: ouvert
