# Configuration des Tests E2E pour TITANE_INFINITY

## Prérequis

1. **Système** : Linux
2. **Dépendances système** :
   - Node.js (via pnpm et Corepack)
   - Rust et Cargo (https://rustup.rs/)
3. **Installer les dépendances** :
   ```bash
   pnpm install
   ./scripts/install-tauri-driver.sh
   ```

## Commandes

1. **Installer `tauri-driver`** :
   ```bash
   ./scripts/install-tauri-driver.sh
   ```

2. **Lancer les tests E2E (Playwright)** :
   ```bash
   pnpm run test:e2e
   ```

3. **Option avancée (Playwright direct)** :
   ```bash
   pnpm run test:e2e:playwright
   ```

## Dépannage

- **Port occupé** : Assurez-vous que le port `5173` est libre.
- **Rust manquant** : Installez Rust via [rustup](https://rustup.rs/).
- **Timeouts** : Ajustez les timeouts Playwright si nécessaire.
- **Problèmes avec `tauri-driver`** :
  - Vérifiez que `tauri-driver` est installé :
    ```bash
    tauri-driver --help
    ```
  - Réinstallez-le si nécessaire :
    ```bash
    ./scripts/install-tauri-driver.sh
    ```

## Structure des Tests

1. **Dossier des tests** : `e2e/`
   - `specs/` : Contient les fichiers de tests.
   - `helpers/` : Contient les utilitaires pour les tests.

2. **Tests disponibles** :
   - `app-launch.spec.ts` : Vérifie que l'application se lance correctement.
   - `readiness.spec.ts` : Vérifie qu'un indicateur de readiness est présent.
   - `chat-always-respond.spec.ts` : Vérifie que le chat répond toujours.

## Résultats des Tests

- Les résultats des tests sont affichés dans la console.
- En cas d'échec, des captures d'écran sont générées automatiquement dans le dossier `./e2e/screenshots/`.

---

## Checklist de Validation

1. **Installer les dépendances** :
   ```bash
   pnpm install
   ./scripts/install-tauri-driver.sh
   ```

2. **Vérifier l'installation de `tauri-driver`** :
   ```bash
   tauri-driver --help
   ```

3. **Lancer les tests E2E** :
   ```bash
   pnpm run test:e2e
   ```
4. **Résultats attendus** :
   - Tous les tests passent avec un message `✔️`.
   - En cas d'échec, des logs et captures d'écran sont disponibles.
