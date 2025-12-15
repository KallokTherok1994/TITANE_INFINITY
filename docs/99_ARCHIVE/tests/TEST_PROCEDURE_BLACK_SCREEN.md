# 🔬 PROCÉDURE DE TEST ÉCRAN NOIR

## ÉTAPE 1: Test React Minimal (RECOMMANDÉ)

### Action: Activer composant de test

Ouvrir `src/main.tsx` et modifier ligne ~321 :

**AVANT**:

```tsx
import App from './App';
```

**APRÈS**:

```tsx
// import App from './App'; // ← Commenter temporairement
import App from './AppMinimalTest'; // ← Test minimal
```

### Résultat attendu

Si vous voyez **"✅ TITANE∞ React OK"** en bleu sur fond noir :

- ✅ React fonctionne
- ✅ ReactDOM.createRoot() fonctionne
- ✅ CSS-in-JS fonctionne
- → **Problème = dans App.tsx ou ses providers**

Si écran noir persiste :

- ❌ Problème plus fondamental (Vite, Tauri, main.tsx)
- → Voir ÉTAPE 2

---

## ÉTAPE 2: Debug Console Navigateur

### Ouvrir DevTools

- **Chrome/Edge**: F12 ou Ctrl+Shift+I
- **Firefox**: F12 ou Ctrl+Shift+K
- **Safari**: Cmd+Option+I

### Commandes à exécuter dans console

```javascript
// Test 1: React est-il chargé ?
console.log('React version:', typeof React !== 'undefined' ? 'Loaded' : 'NOT LOADED');

// Test 2: Root element existe ?
const root = document.getElementById('root');
console.log('Root element:', root);
console.log('Root innerHTML length:', root?.innerHTML.length || 0);
console.log('Root children count:', root?.children.length || 0);

// Test 3: Erreurs React silencieuses ?
console.log('Window errors:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers);

// Test 4: Scripts chargés ?
console.log(
  'Scripts:',
  Array.from(document.scripts).map(s => s.src)
);
```

### Résultats normaux

```
✅ React version: "Loaded"
✅ Root element: <div id="root">...</div>
✅ Root innerHTML length: > 100
✅ Root children count: > 0
```

---

## ÉTAPE 3: Test Providers Progressif

Si Test 1 réussit mais App.tsx échoue, tester chaque provider :

### 3.1 Test sans providers

Modifier `src/App.tsx` ligne ~1108 :

```tsx
const App: React.FC = () => {
  return (
    <div
      style={{
        color: 'white',
        fontSize: '3rem',
        background: '#0a0a0a',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      🎯 App Component Renders
    </div>
  );
};
```

**Résultat attendu**: Texte blanc "🎯 App Component Renders"

### 3.2 Test avec ThemeProvider seul

```tsx
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div style={{ color: 'white', fontSize: '3rem' }}>🎨 ThemeProvider OK</div>
    </ThemeProvider>
  );
};
```

### 3.3 Test avec ThemeProvider + AnimationProvider

```tsx
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AnimationProvider fpsThreshold={40} cpuThreshold={80}>
        <div style={{ color: 'white', fontSize: '3rem' }}>⚡ AnimationProvider OK</div>
      </AnimationProvider>
    </ThemeProvider>
  );
};
```

### 3.4 Test avec tous providers

```tsx
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AnimationProvider fpsThreshold={40} cpuThreshold={80}>
        <TitanStateProvider>
          <div style={{ color: 'white', fontSize: '3rem' }}>🌟 All Providers OK</div>
        </TitanStateProvider>
      </AnimationProvider>
    </ThemeProvider>
  );
};
```

### 3.5 Test avec BrowserRouter

```tsx
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AnimationProvider fpsThreshold={40} cpuThreshold={80}>
        <TitanStateProvider>
          <BrowserRouter>
            <div style={{ color: 'white', fontSize: '3rem' }}>🧭 BrowserRouter OK</div>
          </BrowserRouter>
        </TitanStateProvider>
      </AnimationProvider>
    </ThemeProvider>
  );
};
```

**À chaque test**: Noter quel provider casse le rendu

---

## ÉTAPE 4: Vérifier ErrorBoundary

### Ajouter logs debug

Modifier `src/components/AutoHealErrorBoundary.tsx` ou `src/components/ErrorBoundary.tsx` :

```tsx
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  console.error('🚨 [ErrorBoundary] CAUGHT ERROR:', error);
  console.error('🚨 [ErrorBoundary] Component Stack:', errorInfo.componentStack);
  console.error('🚨 [ErrorBoundary] Error Message:', error.message);
  console.error('🚨 [ErrorBoundary] Error Stack:', error.stack);
  // ... reste du code
}
```

**Résultat**: Si erreur attrapée, elle apparaîtra dans console

---

## ÉTAPE 5: Vérifier Cycles Cognitifs

Les logs montrent:

```
[Error] ReferenceError: Can't find variable: purpose  ← CORRIGÉ ✅
```

### Test: Désactiver kernels temporairement

Modifier `src/main.tsx` ligne ~41 :

```tsx
// DÉSACTIVER TEMPORAIREMENT
// import { SingularityBridge } from './services/singularityBridge';
// import { SingularityConnections } from './services/singularityConnections';
```

**Résultat**: Si app se charge → Problème dans kernels

---

## ÉTAPE 6: Commandes de diagnostic

### Lancer en mode verbose

```bash
npm run dev -- --debug
```

### Voir logs Tauri

```bash
npm run tauri:dev 2>&1 | tee tauri.log
```

### Build test

```bash
npm run build 2>&1 | tee build.log
```

---

## 🎯 DIAGNOSTIC PAR SYMPTÔMES

### Symptôme: Écran noir total

**Tester**: ÉTAPE 1 (AppMinimalTest)
**Si réussi**: Problème dans App.tsx
**Si échoué**: Problème dans main.tsx ou Vite config

### Symptôme: Loading "⚡ Chargement..." reste figé

**Cause probable**: Hook `useEffect` dans AppRouter bloqué
**Tester**: Commenter `checkingOnboarding` state

### Symptôme: Console vide (pas de logs)

**Cause**: JavaScript crash avant même React
**Tester**: Ouvrir index.html directement

### Symptôme: Erreur "Cannot find module"

**Solution**:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ CHECKLIST DE VÉRIFICATION

Avant de rapporter un bug, vérifier:

- [ ] `npm run check` → Exit code 0
- [ ] DevTools console ouverte (F12)
- [ ] Network tab - scripts chargés ?
- [ ] Errors tab - erreurs JS ?
- [ ] AppMinimalTest testé
- [ ] Providers testés un par un
- [ ] ErrorBoundary logs ajoutés
- [ ] Logs kernel désactivés pour test

---

## 📞 RÉSULTATS À PARTAGER

Si problème persiste, copier:

1. **Console output complet** (dès "🔧 VALIDATING TAURI INVOKE FIXES...")
2. **Résultat AppMinimalTest** (écran noir ou texte bleu ?)
3. **Résultat tests providers** (lequel casse ?)
4. **Network tab** (scripts chargés ?)
5. **Version navigateur** (Chrome 120, Firefox 121, etc.)

---

**Prochaine action immédiate**: Activer AppMinimalTest (ÉTAPE 1) et reporter résultat.
