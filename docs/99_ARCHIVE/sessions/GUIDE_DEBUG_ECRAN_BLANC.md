/**
 * TITANE_INFINITY v17.3 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * 📝 GUIDE DE DEBUG - ÉCRAN BLANC TAURI
 * ═══════════════════════════════════════════════════════════════
 *
 * Si l'application Tauri affiche un écran blanc, vérifier dans l'ordre :
 *
 * 1️⃣ **Vérifier le HTML de base** (`index.html`)
 *    ✅ Doit contenir : `<div id="root"></div>`
 *    ✅ Doit contenir : `<script type="module" src="/src/main.tsx"></script>`
 *
 * 2️⃣ **Vérifier le point d'entrée React** (`src/main.tsx`)
 *    ✅ Doit contenir : `ReactDOM.createRoot(document.getElementById('root'))`
 *    ✅ Doit retourner : `<App />` dans le render
 *    ✅ Console : Vérifier les logs "[TITANE∞] Boot React main.tsx"
 *
 * 3️⃣ **Vérifier la configuration Tauri** (`src-tauri/tauri.conf.json`)
 *    ✅ `build.devUrl` : Doit pointer vers le dev server Vite (http://localhost:1420)
 *    ✅ `build.beforeDevCommand` : Doit lancer `pnpm vite dev` (pas `pnpm run build`)
 *    ✅ `build.frontendDist` : Doit pointer vers `../dist`
 *
 * 4️⃣ **Vérifier App.tsx et le Router**
 *    ✅ App doit retourner du JSX visible (pas de `return null`)
 *    ✅ Router doit avoir au moins une route par défaut (`/`)
 *
 * 5️⃣ **Vérifier le CSS**
 *    ❌ Pas de `display: none` global sur body ou #root
 *    ❌ Pas de `opacity: 0` global
 *    ❌ Pas de `height: 0` ou `width: 0`
 *
 * 6️⃣ **Ouvrir la console DevTools**
 *    🔧 Appuyer sur F12 ou Ctrl+Shift+I
 *    🔍 Chercher les erreurs JavaScript / React
 *    🔍 Vérifier la timeline des logs de boot
 *
 * 7️⃣ **Test manuel rapide**
 *    Ajouter temporairement dans App.tsx :
 *    ```tsx
 *    export function App() {
 *      return (
 *        <div style={{ background: '#000', color: '#0f0', height: '100vh' }}>
 *          ✅ TITANE∞ React OK
 *        </div>
 *      );
 *    }
 *    ```
 *
 * ═══════════════════════════════════════════════════════════════
 * STRUCTURE DE BOOT CORRECTE
 * ═══════════════════════════════════════════════════════════════
 *
 * index.html
 *   ↓ charge
 * src/main.tsx
 *   ↓ initialise engines
 *   ↓ monte React
 * App.tsx
 *   ↓ wraps ThemeProvider + BrowserRouter + ErrorBoundary
 * AppRouter
 *   ↓ affiche AppShell + Routes
 * DashboardPage (route `/`)
 *   ↓ affiche le contenu
 *
 * ═══════════════════════════════════════════════════════════════
 */

export {};
