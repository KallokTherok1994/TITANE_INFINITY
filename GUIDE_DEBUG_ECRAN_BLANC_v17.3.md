# 🩺 GUIDE DE DÉBOGAGE - ÉCRAN BLANC TITANE∞ v17.3

## 🎯 Objectif
Ce guide vous aide à diagnostiquer et corriger un écran blanc dans l'application Tauri.

---

## ✅ CHECKLIST DE VÉRIFICATION (7 étapes)

### 1️⃣ **Vérifier le HTML de base**

**Fichier**: `index.html` (racine du projet)

✅ **À vérifier**:
```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>TITANE∞ v17.3</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

❌ **Problèmes courants**:
- `<div id="root">` manquant
- Script `src` incorrect (doit pointer vers `main.tsx`)
- Balise `<body>` vide

---

### 2️⃣ **Vérifier le build Vite**

**Commande**:
```bash
pnpm run build
```

✅ **Résultat attendu**:
```
dist/
  ├── index.html (avec <div id="root"> + scripts injectés)
  └── assets/
      ├── main-XXXXX.js
      ├── vendor-XXXXX.js
      └── main-XXXXX.css
```

❌ **Problèmes courants**:
- `dist/` n'existe pas → build échoué
- `dist/index.html` sans scripts → plugin Vite cassé
- Assets manquants → erreur compilation

**Vérification manuelle**:
```bash
cat dist/index.html | grep -E "root|script"
```

---

### 3️⃣ **Vérifier la config Tauri**

**Fichier**: `src-tauri/tauri.conf.json`

✅ **Configuration correcte**:
```json
{
  "build": {
    "beforeDevCommand": "pnpm vite dev",
    "beforeBuildCommand": "pnpm run build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [{
      "url": "index.html"
    }]
  }
}
```

❌ **Problèmes courants**:
- `devUrl` incorrect (port doit correspondre à Vite)
- `frontendDist` incorrect (doit pointer vers `../dist`)
- `beforeDevCommand` qui fait `build` au lieu de `dev`

---

### 4️⃣ **Vérifier le port Vite**

**Fichier**: `vite.config.ts`

✅ **Configuration correcte**:
```ts
export default defineConfig({
  server: {
    port: 1420,
    strictPort: true,
    host: '127.0.0.1',
  }
});
```

**Test manuel**:
```bash
pnpm run dev
# Doit afficher: Local: http://localhost:1420/
```

❌ **Problèmes courants**:
- Port différent de celui dans `tauri.conf.json`
- Dev server ne démarre pas
- Erreur "Port already in use"

---

### 5️⃣ **Vérifier le point d'entrée React**

**Fichier**: `src/main.tsx`

✅ **Code attendu**:
```tsx
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[TITANE∞] #root element not found!');
  // Fallback visuel
  document.body.innerHTML = '<div style="...">Error: #root missing</div>';
} else {
  ReactDOM.createRoot(rootElement).render(<App />);
  console.log('✅ React root mounted');
}
```

❌ **Problèmes courants**:
- `getElementById('root')` retourne `null`
- Erreur silencieuse (pas de `console.error`)
- Exception non catchée dans `App`

---

### 6️⃣ **Vérifier les styles CSS**

**Fichier**: `src/design-system/titane-v12.css`

✅ **Styles critiques**:
```css
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background: #0a0a0a;
  color: #ffffff;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

❌ **Problèmes courants**:
- `display: none` quelque part
- `opacity: 0` sur `#root`
- `height: 0` ou `overflow: hidden`
- CSS non importé dans `main.tsx`

**Vérification DevTools**:
1. F12 → Elements
2. Inspecter `<div id="root">`
3. Vérifier les Computed styles (height, display, opacity)

---

### 7️⃣ **Vérifier la console DevTools**

**Ouvrir DevTools**: `F12` ou `Ctrl+Shift+I` dans l'app Tauri

✅ **Logs attendus**:
```
[TITANE∞] Boot React main.tsx
[1/5] Backend: 40+ Rust modules
[2/5] Frontend: 20 Unified Engines
[3/5] Tauri v2.0 100%
[4/5] Loading React 18...
[5/5] Mounting root component...
✅ Root element found
✅ TITANE∞ REACT ROOT MOUNTED SUCCESSFULLY
```

❌ **Erreurs courantes**:
```
❌ #root element not found
❌ Failed to fetch dynamically imported module
❌ Uncaught TypeError: Cannot read property 'render' of undefined
❌ Failed to resolve module specifier
```

**Actions selon l'erreur**:
- `#root not found` → Vérifier HTML (étape 1)
- `Failed to fetch module` → Rebuild + clear cache
- `TypeError` → Vérifier imports dans `main.tsx`

---

## 🛠️ SOLUTIONS RAPIDES

### Solution A: Mode Test Minimal

**But**: Tester si React s'affiche, sans les engines complexes.

**Étapes**:
1. Ouvrir `src/main.tsx`
2. Remplacer:
   ```tsx
   import App from './App';
   ```
   Par:
   ```tsx
   import AppMinimal from './AppMinimal';
   const App = AppMinimal;
   ```
3. Rebuild: `pnpm run build && pnpm tauri dev`

**Résultat attendu**: Interface minimale avec counter et boutons

✅ **Si ça marche** → Le problème est dans `App.tsx` ou un composant enfant
❌ **Si écran blanc persiste** → Le problème est dans la chaîne HTML/React/Tauri

---

### Solution B: Nettoyer le cache

```bash
# Supprimer les builds
rm -rf dist/ src-tauri/target/

# Rebuild complet
pnpm run build
pnpm tauri dev
```

---

### Solution C: Vérifier les erreurs silencieuses

**Ajouter dans `src/main.tsx`** (avant `ReactDOM.createRoot`):
```tsx
window.addEventListener('error', (e) => {
  console.error('[GLOBAL ERROR]', e.error);
  document.body.innerHTML = `<div style="color:red; padding:20px;">
    Error: ${e.message}
  </div>`;
});
```

---

### Solution D: Forcer un fallback visuel

**Dans `src/main.tsx`**, après `document.getElementById('root')`:
```tsx
if (!rootElement) {
  document.body.innerHTML = `
    <div style="
      display: flex;
      height: 100vh;
      align-items: center;
      justify-content: center;
      background: #000;
      color: #f00;
      font-family: monospace;
      padding: 2rem;
    ">
      <div>
        <h1>⚠️ ERREUR CRITIQUE</h1>
        <p>Élément #root introuvable dans le DOM</p>
        <pre>${document.documentElement.outerHTML}</pre>
      </div>
    </div>
  `;
}
```

---

## 📋 SCRIPT DE TEST AUTOMATIQUE

Créer `test_affichage.sh`:
```bash
#!/bin/bash
echo "🧪 Test affichage TITANE∞..."

# 1. Build
pnpm run build || exit 1

# 2. Vérifier dist/
[ -f "dist/index.html" ] || { echo "❌ dist/index.html manquant!"; exit 1; }
grep -q '<div id="root">' dist/index.html || { echo "❌ #root manquant!"; exit 1; }

# 3. Lancer
echo "✅ Checks OK - Lancement Tauri..."
pnpm tauri dev
```

**Utilisation**:
```bash
chmod +x test_affichage.sh
./test_affichage.sh
```

---

## 🎯 DIAGNOSTIC VISUEL

### Écran complètement noir
→ Problème CSS (`background: #000` + texte noir)
→ **Solution**: Vérifier `color` dans les styles globaux

### Écran blanc pur
→ React ne s'est pas monté
→ **Solution**: Vérifier console + `#root` dans Elements

### Spinner de chargement infini
→ App bloquée dans un état de loading
→ **Solution**: Vérifier les `useEffect` et hooks asynchrones

### Flash puis blanc
→ React se monte puis crash
→ **Solution**: Ajouter ErrorBoundary + logs

---

## 📚 RESSOURCES

- **Logs Tauri**: Console DevTools (F12)
- **Logs Rust**: Terminal qui a lancé `tauri dev`
- **Structure DOM**: F12 → Elements
- **Network**: F12 → Network (vérifier que les .js se chargent)

---

## ✅ CHECKLIST FINALE

Avant de demander de l'aide, vérifier:

- [ ] `index.html` contient `<div id="root">`
- [ ] `dist/index.html` contient scripts + root
- [ ] `pnpm run build` réussit sans erreur
- [ ] `vite.config.ts` port = `tauri.conf.json` devUrl
- [ ] Console DevTools montre les logs de boot
- [ ] Aucune erreur rouge dans la console
- [ ] `#root` existe dans l'onglet Elements
- [ ] CSS n'a pas `display:none` ou `opacity:0`

---

**Version**: v17.3.0
**Dernière mise à jour**: 2025-11-24
