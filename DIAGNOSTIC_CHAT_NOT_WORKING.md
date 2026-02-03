# 🔧 Diagnostic: Chat IA Ne Fonctionne Toujours Pas

**Date:** 2 février 2026  
**Statut Système:** ✅ TOUS LES COMPOSANTS ACTIFS

---

## ✅ Vérifications Système Effectuées

### Backend

- ✅ Vite actif sur port 5173
- ✅ Processus Tauri actif (PID: 1346911)
- ✅ Ollama actif (10 modèles disponibles)

### Configuration

- ✅ `.env.local` créé avec modèle llama3.1:latest
- ✅ Proxy Vite configuré
- ✅ Module ollama.rs présent
- ✅ Build Rust compilé

---

## 🎯 Diagnostic: Cause Probable

Si tout le système est actif MAIS le chat ne fonctionne pas, il y a **3 causes possibles**:

### 1. ❌ Vous Utilisez le Navigateur au Lieu de la Fenêtre Native

**Symptôme:**

- Vous voyez l'adresse `http://127.0.0.1:5173` dans la barre d'adresse
- Le titre dit juste "TITANE∞" sans "[DEV]"

**Solution:**

- Fermez l'onglet du navigateur
- Cherchez la fenêtre native "**Titan-Dev [DEV] — TITANE∞ Development**"
- Si elle n'existe pas, relancez: `pnpm run dev:tauri`

---

### 2. ⚠️ window.**TAURI** est Undefined

**Test:**

Dans la fenêtre TITANE∞, ouvrez la console (Clic droit → Inspect ou F12), puis tapez:

```javascript
window.__TAURI__;
```

#### Si ça retourne `undefined`:

C'est le problème! Tauri n'est pas détecté par le frontend.

**Solutions:**

#### A. Recharger la Fenêtre Native

```
Ctrl+R (ou Cmd+R sur Mac) dans la fenêtre native
```

#### B. Vérifier les Erreurs Console

Dans la console, cherchez des erreurs rouges liées à:

- `Cannot read properties of undefined (reading 'invoke')`
- `__TAURI__ is not defined`
- `Failed to execute 'invoke'`

#### C. Forcer Reconnexion

Dans la console:

```javascript
// Forcer reload
location.reload();
```

#### Si ça retourne un objet:

Tauri EST détecté! Le problème est ailleurs. Passez à l'étape 3.

---

### 3. 🔍 Erreur lors de l'Invocation de Commande

**Test dans la Console:**

```javascript
// Test 1: Vérifier que window.__TAURI__ existe
console.log('Tauri:', window.__TAURI__);

// Test 2: Tester conversation_generate
try {
  const result = await window.__TAURI__.core.invoke('conversation_generate', {
    message: 'Test',
    conversation_id: 'test-123',
    mode: 'default',
    provider: 'ollama',
  });
  console.log('✅ Success:', result);
} catch (error) {
  console.error('❌ Error:', error);
}
```

#### Erreurs Possibles:

**A. "command not found" ou "unknown variant"**

- La commande n'est pas enregistrée dans Tauri
- Vérifiez `src-tauri/src/main.rs` ligne 727

**B. "Ollama connection failed"**

- Test direct Ollama:

```bash
curl -X POST http://127.0.0.1:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3.1:latest", "prompt": "Test", "stream": false}'
```

**C. "Backend unavailable"**

- Le provider détecte que Tauri n'est pas disponible
- Rechargez la fenêtre (Ctrl+R)

---

## 📋 Checklist de Diagnostic Complète

### Étape 1: Vérifier le Type de Fenêtre

- [ ] Je vois "**Titan-Dev [DEV]**" dans le titre de la fenêtre
- [ ] Ce N'EST PAS un onglet de navigateur (pas de barre d'adresse)
- [ ] La fenêtre est une application native

### Étape 2: Tester window.**TAURI** dans la Console

Ouvrir Console (F12 ou Clic droit → Inspect):

- [ ] `window.__TAURI__` retourne un objet (pas `undefined`)
- [ ] `window.__TAURI__.core` existe
- [ ] `window.__TAURI__.core.invoke` est une fonction

### Étape 3: Tester une Commande Simple

Dans la console:

```javascript
window.__TAURI__.core.invoke('ping').then(console.log).catch(console.error);
```

- [ ] Retourne sans erreur

### Étape 4: Tester Ollama Directement

Terminal:

```bash
curl -X POST http://127.0.0.1:11434/api/generate \
  -d '{"model":"llama3.1:latest","prompt":"Test","stream":false}' \
  -H "Content-Type: application/json"
```

- [ ] Retourne une réponse JSON avec "response"

### Étape 5: Tester conversation_generate

Dans la console TITANE∞:

```javascript
window.__TAURI__.core
  .invoke('conversation_generate', {
    message: 'Bonjour',
    conversation_id: 'test-' + Date.now(),
    mode: 'default',
    provider: 'ollama',
  })
  .then(r => console.log('✅ Réussi:', r))
  .catch(e => console.error('❌ Erreur:', e));
```

- [ ] Retourne un objet avec `content`
- [ ] Le `content` n'est pas "Mode navigateur: backend Tauri indisponible"

---

## 🔧 Solutions Selon le Résultat

### Si window.**TAURI** est undefined:

1. **Fermez TOUT** (navigateur + fenêtre native)
2. **Tuez les processus:**
   ```bash
   pkill -9 -f "titane-infinity"
   pkill -9 -f "vite"
   ```
3. **Relancez proprement:**
   ```bash
   pnpm run dev:tauri
   ```
4. **Attendez** que la fenêtre native s'ouvre
5. **NE PAS** ouvrir http://127.0.0.1:5173 dans un navigateur

### Si window.**TAURI** existe mais conversation_generate échoue:

1. **Vérifier Ollama:**

   ```bash
   bash test-ollama-connection.sh
   ```

2. **Vérifier les logs Tauri** dans le terminal où vous avez lancé `pnpm run dev:tauri`
   - Cherchez des erreurs `[ERROR]`
   - Cherchez `conversation_generate` dans les logs

3. **Tester un autre provider** (temporaire):
   - Dans l'interface, sélectionnez "TitaneLocal" au lieu d'"Ollama"
   - Si ça marche, le problème est spécifique à Ollama

### Si conversation_generate retourne "backend indisponible":

C'est le fallback du `tauriProtector.ts`. Signifie que:

- La commande a été appelée
- MAIS elle a échoué/timeout
- Le système a retourné un message d'erreur générique

**Solution:**

1. Vérifier les logs du terminal
2. Augmenter le timeout (temporaire):
   - Ouvrir `src/lib/security.ts`
   - Chercher `timeout`
   - Augmenter à 120000 (2 minutes)

---

## 🎯 Test Complet Automatisé

Lancez ce script pour un diagnostic complet:

```bash
bash test-tauri-detection.sh
```

Puis dans la console TITANE∞:

```javascript
// Test complet
(async () => {
  console.log('1. Tauri:', typeof window.__TAURI__);
  console.log('2. Core:', typeof window.__TAURI__?.core);
  console.log('3. Invoke:', typeof window.__TAURI__?.core?.invoke);

  try {
    const result = await window.__TAURI__.core.invoke('conversation_generate', {
      message: 'Test connexion',
      conversation_id: 'diag-' + Date.now(),
      mode: 'default',
      provider: 'ollama',
    });
    console.log('✅ SUCCÈS! Contenu:', result.content.substring(0, 100));
  } catch (e) {
    console.error('❌ ÉCHEC:', e.message);
  }
})();
```

---

## 📞 Support

Si après TOUTES ces étapes le problème persiste:

1. **Capturez les informations:**
   - Screenshot de la fenêtre (avec titre visible)
   - Copie de `window.__TAURI__` depuis la console
   - Erreurs dans la console (s'il y en a)
   - Sortie du terminal `pnpm run dev:tauri`

2. **Logs à fournir:**

   ```bash
   # État système
   bash check-tauri-backend.sh > diagnostic.txt

   # Test Ollama
   bash test-ollama-connection.sh >> diagnostic.txt

   # Test détection
   bash test-tauri-detection.sh >> diagnostic.txt
   ```

---

**Système vérifié et opérationnel - Si le chat ne fonctionne pas, c'est un problème de détection frontend, pas de configuration backend!**
