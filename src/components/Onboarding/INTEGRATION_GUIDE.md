# 🎯 Guide d'Intégration du Système d'Onboarding

## ✅ Composants Créés

Tous les fichiers suivants ont été créés avec succès :

### Frontend (TypeScript/React)
- ✅ `src/components/Onboarding/types.ts` - Définitions TypeScript
- ✅ `src/components/Onboarding/OnboardingFlow.tsx` - Composant principal
- ✅ `src/components/Onboarding/WelcomeStep.tsx` - Step 1 : Accueil
- ✅ `src/components/Onboarding/PrivacyStep.tsx` - Step 2 : Confidentialité
- ✅ `src/components/Onboarding/FeaturesStep.tsx` - Step 3 : Fonctionnalités
- ✅ `src/components/Onboarding/CustomizationStep.tsx` - Step 4 : Personnalisation
- ✅ `src/components/Onboarding/ReadyStep.tsx` - Step 5 : Prêt
- ✅ `src/components/Onboarding/OnboardingFlow.css` - Styles complets
- ✅ `src/components/Onboarding/index.ts` - Exports publics

### Backend (Rust/Tauri)
- ✅ `src-tauri/src/onboarding/mod.rs` - Module onboarding complet

---

## 🔧 Étapes d'Intégration

### 1. Ajouter le module onboarding dans `src-tauri/src/main.rs`

Ouvrez `src-tauri/src/main.rs` et ajoutez :

```rust
// ✨ Ajouter en haut avec les autres modules
mod onboarding;

use std::sync::Mutex;
use onboarding::{OnboardingState};

// ✨ Dans la fonction main(), avant tauri::Builder::default()
fn main() {
    // ... code existant ...

    // Initialiser l'état de l'onboarding
    let onboarding_state = Mutex::new(OnboardingState::default());

    tauri::Builder::default()
        .manage(onboarding_state)
        .invoke_handler(tauri::generate_handler![
            // ... commandes existantes ...

            // ✨ Ajouter ces 4 commandes onboarding
            onboarding::is_onboarding_complete,
            onboarding::complete_onboarding,
            onboarding::get_onboarding_preferences,
            onboarding::reset_onboarding,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 2. Intégrer dans `src/App.tsx`

Modifiez `src/App.tsx` pour ajouter la détection du premier lancement :

```tsx
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { OnboardingFlow } from './components/Onboarding';

const App: React.FC = () => {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // Vérifier si l'onboarding est complété
    const checkOnboarding = async () => {
      try {
        const isComplete = await invoke<boolean>('is_onboarding_complete');
        setOnboardingComplete(isComplete);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'onboarding:', error);
        // En cas d'erreur, vérifier localStorage en fallback
        const localStorage Complete = localStorage.getItem('onboarding_completed') === 'true';
        setOnboardingComplete(localStorageComplete);
      }
    };

    checkOnboarding();
  }, []);

  // Loading state
  if (onboardingComplete === null) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}>
        ⚡ Chargement...
      </div>
    );
  }

  // Afficher l'onboarding si pas complété
  if (!onboardingComplete) {
    return (
      <OnboardingFlow onComplete={() => setOnboardingComplete(true)} />
    );
  }

  // Afficher l'app normale
  return (
    <ThemeProvider>
      <AnimationProvider fpsThreshold={40} cpuThreshold={80}>
        <TitanStateProvider>
          <BrowserRouter>
            <AutoHealErrorBoundary>
              <AppRouter />
            </AutoHealErrorBoundary>
          </BrowserRouter>
        </TitanStateProvider>
      </AnimationProvider>
    </ThemeProvider>
  );
};

export default App;
```

### 3. Build et Test

```bash
# 1. Rebuild le backend Rust
cd src-tauri
cargo build

# 2. Retour au projet
cd ..

# 3. Lancer en mode dev
npm run dev

# 4. Tester l'onboarding
# Au premier lancement, l'onboarding devrait s'afficher automatiquement

# 5. Pour tester à nouveau (réinitialiser l'onboarding)
# Ouvrez la console DevTools et lancez :
await invoke('reset_onboarding');
window.location.reload();
```

---

## 🎨 Personnalisation des Styles

Les styles sont dans `OnboardingFlow.css`. Vous pouvez personnaliser :

- **Gradient principal** : Lignes 17-18 (`.onboarding-overlay`)
- **Couleurs primaires** : `#667eea` et `#764ba2` (rechercher/remplacer)
- **Thème sombre** : Sections `@media (prefers-color-scheme: dark)`
- **Animations** : Durées et types dans les composants TSX

---

## 🧪 Tests E2E

Créez `e2e/onboarding.test.ts` :

```typescript
import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete full onboarding flow', async ({ page }) => {
    // Réinitialiser l'onboarding
    await page.evaluate(() => {
      localStorage.removeItem('onboarding_completed');
    });

    // Charger l'app
    await page.goto('http://localhost:5173');

    // Vérifier que l'onboarding s'affiche
    await expect(page.locator('.onboarding-overlay')).toBeVisible();

    // Step 1 : Welcome
    await expect(page.locator('.welcome-step')).toBeVisible();
    await page.click('text=Suivant →');

    // Step 2 : Privacy
    await expect(page.locator('.privacy-step')).toBeVisible();
    await page.click('text=Suivant →');

    // Step 3 : Features
    await expect(page.locator('.features-step')).toBeVisible();
    await page.click('text=Suivant →');

    // Step 4 : Customization
    await expect(page.locator('.customization-step')).toBeVisible();
    // Sélectionner un thème
    await page.click('text=Sombre');
    await page.click('text=Suivant →');

    // Step 5 : Ready
    await expect(page.locator('.ready-step')).toBeVisible();
    await page.click('text=Commencer →');

    // Vérifier que l'app principale s'affiche
    await expect(page.locator('.app-shell')).toBeVisible();
  });

  test('should navigate back in onboarding', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('onboarding_completed');
    });

    await page.goto('http://localhost:5173');

    // Avancer jusqu'au step 3
    await page.click('text=Suivant →');
    await page.click('text=Suivant →');

    // Revenir en arrière
    await page.click('text=← Précédent');

    // Vérifier qu'on est au step 2
    await expect(page.locator('.privacy-step')).toBeVisible();
  });
});
```

Lancer les tests :
```bash
npm run test:e2e
```

---

## 📝 Commandes Tauri Disponibles

| Commande | Description |
|----------|-------------|
| `is_onboarding_complete()` | Vérifie si l'onboarding est complété |
| `complete_onboarding(preferences)` | Marque l'onboarding comme complété et sauvegarde les préférences |
| `get_onboarding_preferences()` | Récupère les préférences sauvegardées |
| `reset_onboarding()` | Réinitialise l'onboarding (pour tests) |

### Exemple d'utilisation

```typescript
import { invoke } from '@tauri-apps/api/core';

// Vérifier si complété
const isComplete = await invoke<boolean>('is_onboarding_complete');

// Compléter l'onboarding
await invoke('complete_onboarding', {
  preferences: {
    theme: 'dark',
    language: 'fr',
    enable_analytics: false,
    completed_at: new Date().toISOString(),
  },
});

// Récupérer les préférences
const prefs = await invoke('get_onboarding_preferences');

// Réinitialiser (debug/test)
await invoke('reset_onboarding');
```

---

## 🐛 Débogage

### L'onboarding ne s'affiche pas

1. Vérifier que le module Rust est compilé :
   ```bash
   cd src-tauri && cargo build
   ```

2. Vérifier les logs Tauri :
   ```bash
   npm run dev
   # Ouvrir DevTools → Console
   ```

3. Vérifier localStorage :
   ```javascript
   // Dans la console DevTools
   console.log(localStorage.getItem('onboarding_completed'));
   ```

### Réinitialiser l'onboarding

```javascript
// Dans la console DevTools
await invoke('reset_onboarding');
localStorage.removeItem('onboarding_completed');
localStorage.removeItem('onboarding_preferences');
window.location.reload();
```

### Le backend Rust ne compile pas

```bash
# Vérifier les erreurs
cd src-tauri
cargo check

# Rebuild complet
cargo clean
cargo build
```

---

## ✅ Checklist d'Intégration

- [ ] Ajouter `mod onboarding;` dans `src-tauri/src/main.rs`
- [ ] Ajouter `OnboardingState` dans `.manage()`
- [ ] Ajouter les 4 commandes dans `.invoke_handler()`
- [ ] Modifier `src/App.tsx` pour détecter first-run
- [ ] Rebuild Rust : `cd src-tauri && cargo build`
- [ ] Tester : `npm run dev`
- [ ] Vérifier que l'onboarding s'affiche au premier lancement
- [ ] Vérifier que les préférences sont sauvegardées
- [ ] Tester le bouton "Précédent"
- [ ] Tester le bouton "Commencer"
- [ ] Créer les tests E2E
- [ ] Lancer les tests : `npm run test:e2e`

---

## 🎉 Résultat Attendu

1. **Premier lancement** : L'utilisateur voit l'onboarding (5 steps)
2. **Personnalisation** : L'utilisateur peut choisir thème, langue, analytics
3. **Sauvegarde** : Les préférences sont persistées dans `~/.config/TITANE/onboarding.json`
4. **Lancements suivants** : L'app démarre directement sans onboarding
5. **Performance** : L'onboarding se charge instantanément (<500ms)

---

## 📚 Documentation

- **Framer Motion** : https://www.framer.com/motion/
- **Tauri Commands** : https://tauri.app/v2/reference/javascript/api/
- **Playwright Tests** : https://playwright.dev/

---

**Auteur** : Claude Sonnet 4.5
**Date** : 6 Décembre 2025
**Version** : v19.5.2
