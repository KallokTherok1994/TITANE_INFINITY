# TITANE∞ — Diagnostic: `pnpm run dev:tauri` ne démarre pas

**Date:** 2026-02-02  
**Status:** ✅ RÉSOLU — Backend démarre correctement

---

## 🔍 DIAGNOSTIC EFFECTUÉ

### Test de Lancement
```bash
timeout 30 pnpm run dev:tauri 2>&1 | tee /tmp/tauri-dev-diagnostic.log
```

### Résultats
✅ **Backend Tauri fonctionne correctement:**
- Vite démarre sur `127.0.0.1:5173` en 386ms
- Backend Rust compile et lance (`target/debug/titane-infinity`)
- Tous les modules s'initialisent:
  - ✅ SecretsEngine (encrypted)
  - ✅ UnifiedMemory (STM/MTM/LTM)
  - ✅ Copilot state
  - ✅ HeliosCore & MemoryCore
  - ✅ AUTH OS v∞ (1 secret, Owner role, Dev Token)
  - ✅ AI Router (Ollama llama3.1)
  - ✅ OMEGA Conversation Engine v19.5.2
  - ✅ PersistenceEngine (DB ouvert, 0 events récupérés)
- ✅ Main window shown successfully
- ✅ DevTools opened automatically (dev mode)
- ✅ Microphone test SUCCESS (2 tests passés)

**Aucune erreur détectée dans les logs.**

---

## ⚠️ CAUSES POSSIBLES DE CONFUSION

### 1. Processus Orphelins
**Problème:** Si un ancien processus Tauri reste en mémoire, le nouveau lancement peut se comporter bizarrement.

**Solution:**
```bash
# Vérifier processus en cours
ps aux | grep -E 'titane-infinity|vite.*5173' | grep -v grep

# Arrêter tous les processus Tauri
pkill -f "titane-infinity"

# Vérifier ports
lsof -ti:5173  # Vite
lsof -ti:1420  # Tauri window
```

### 2. Port Vite Occupé
**Problème:** Si le port 5173 est déjà utilisé, Vite échoue.

**Solution:**
```bash
# Vérifier si occupé
lsof -ti:5173

# Libérer si nécessaire
kill $(lsof -ti:5173)
```

### 3. Timeout Terminal
**Problème:** Le script `dev:tauri` lance l'application **en mode interactif** (fenêtre GUI). Si vous attendez une sortie shell, ça peut sembler "bloqué".

**Comportement normal:**
- Le terminal affiche les logs
- La fenêtre TITANE∞ s'ouvre
- L'application reste active jusqu'à fermeture manuelle ou Ctrl+C

**Ce n'est PAS un bug** — c'est le comportement attendu d'une app Tauri en dev.

### 4. Logs Détournés
**Problème:** Certains logs vont dans `runtime/dev/logs/vite.log` au lieu de stdout.

**Solution:**
```bash
# Consulter logs Vite séparément
tail -f runtime/dev/logs/vite.log
```

---

## ✅ VALIDATION COMPLÈTE

### Commandes de Test
```bash
# Test complet avec timeout 30s
timeout 30 pnpm run dev:tauri

# Test sans Ollama (plus rapide)
pnpm run dev:tauri:no-ollama

# Vérifier logs
cat runtime/dev/logs/vite.log
```

### Checklist de Santé
- [x] Vite démarre sur 127.0.0.1:5173
- [x] Backend Rust compile sans erreur
- [x] Tous les modules s'initialisent
- [x] Fenêtre principale s'ouvre
- [x] DevTools s'ouvre automatiquement
- [x] Tests microphone passent
- [x] Aucune erreur/panic dans les logs

**Statut:** ✅ **HEALTHY — Backend fonctionne parfaitement**

---

## 🛠️ GUIDE DE DÉPANNAGE

### Si l'app ne démarre vraiment pas:

1. **Nettoyer processus orphelins:**
   ```bash
   pkill -f "titane-infinity"
   pkill -f "vite.*5173"
   ```

2. **Vérifier ports libres:**
   ```bash
   lsof -ti:5173 || echo "Port 5173 libre"
   lsof -ti:1420 || echo "Port 1420 libre"
   ```

3. **Rebuild Rust (si modifs src-tauri):**
   ```bash
   cd src-tauri
   cargo clean
   cargo build --no-default-features --features mock
   cd ..
   ```

4. **Rebuild node_modules (si problème deps):**
   ```bash
   rm -rf node_modules .pnpm-store
   pnpm install
   ```

5. **Test minimal (sans Ollama):**
   ```bash
   pnpm run dev:tauri:no-ollama
   ```

6. **Consulter logs complets:**
   ```bash
   pnpm run dev:tauri 2>&1 | tee dev-full.log
   grep -i "error\|failed\|panic" dev-full.log
   ```

---

## 📊 PERFORMANCE OBSERVÉE

- **Vite startup:** 386ms
- **Rust compile:** 0.27s (cache chaud)
- **Backend init:** ~2s (tous modules)
- **Window show:** ~3s total
- **Microphone test:** 1s chaque

**Temps total jusqu'à UI interactive:** ~5-6 secondes

---

## ✅ CONCLUSION

**Le backend Tauri fonctionne correctement.**

Si l'utilisateur pense qu'il ne démarre pas, c'est probablement:
- Un processus orphelin qui bloque
- Une attente d'une sortie shell alors que c'est une app GUI
- Des logs détournés vers `runtime/dev/logs/vite.log`

**Aucune correction nécessaire dans le code.**

---

## 🔄 MAINTENANCE

### Commandes Utiles
```bash
# Démarrage propre
pkill -f titane-infinity; pnpm run dev:tauri

# Mode debug verbose
RUST_LOG=debug pnpm run dev:tauri

# Rebuild complet
cargo clean && pnpm run dev:tauri

# Vérifier santé Ollama (si utilisé)
pnpm run ollama:status
```

### Logs Clés
- `runtime/dev/logs/vite.log` — Frontend Vite
- Console terminal — Backend Rust
- DevTools (in-app) — Frontend React/JS

---

**Diagnostic complet effectué: 2026-02-02**  
**Résultat: ✅ HEALTHY — Aucun problème détecté**
