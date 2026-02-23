# VALIDATION MANUELLE POST-COMMIT — Instructions Utilisateur

**Context**: P2 validation réelle impossible en mode automatisé sans build complet (~10+ min)  
**Solution**: Validation manuelle rapide post-commit (~5 min)  
**Objectif**: Vérifier que les logs [CONV_SEND] et [CONV_RECV] apparaissent correctement et que l'UI ne montre pas "hors ligne" en mode REMOTE

---

## PRÉ-REQUIS

- ✅ Commit P1+P2 appliqué
- ✅ Ollama installé et running (ou provider cloud configuré)
- ✅ Console DevTools accessible

---

## PROCÉDURE (5 min)

### Étape 1: Lancer l'app en mode dev (30s)

```bash
cd /path/to/TITANE_INFINITY
pnpm run dev:tauri
```

**Attendu**: App se lance, pas de crash au démarrage

---

### Étape 2: Ouvrir DevTools Console (10s)

Selon la plateforme:
- **macOS**: `Cmd+Option+I`
- **Linux**: `Ctrl+Shift+I`
- **Windows**: `Ctrl+Shift+I`

OU: Clic droit sur l'app → "Inspect Element" → Tab "Console"

**Attendu**: Console logs visibles

---

### Étape 3: Naviguer vers Chat (10s)

- Cliquer sur le module "Chat" dans l'interface
- Attendre le chargement complet

**Attendu**: Interface chat affichée sans erreur

---

### Étape 4: Envoyer un message test (1 min)

**Message suggéré**: "Test validation P2 - quelle est la date aujourd'hui?"

1. Taper le message dans l'input
2. Cliquer "Envoyer" (ou Enter)
3. **Immédiatement** observer la console

**Attendu dans console**:

#### A) Log [CONV_SEND] (AVANT requête backend)
```javascript
[CONV_SEND] External AI gate {
  buildFlagEnabled: true,  // ou false selon config
  runtimeToggleEnabled: true,
  allowed: true,  // ou false
  requested_provider: 'auto'
}
```

**☑️ Check**: Log apparaît AVANT la réponse de l'assistant

---

#### B) Log [CONV_RECV] (APRÈS réponse backend)
```javascript
[CONV_RECV] Provider decision {
  mode: 'REMOTE',  // ou 'LOCAL' ou 'OFFLINE'
  reason_code: 'PROVIDER_OK',  // ou autre
  provider_used: 'ollama',  // ou 'gemini', 'local', etc.
  network_used: false,  // true si cloud
  attempts_count: 1,
  latency_ms: 234
}
```

**☑️ Check**: Log apparaît APRÈS réception réponse

---

### Étape 5: Vérifier l'UI (30s)

**Si mode = 'REMOTE' dans [CONV_RECV]**:
- ✅ **PASS**: UI ne montre PAS "Réponse en mode hors ligne..." ou "Mode hors ligne"
- ❌ **FAIL**: UI montre "hors ligne" → BUG NON RÉSOLU

**Si mode = 'LOCAL' dans [CONV_RECV]**:
- ✅ **PASS**: Pas de message "hors ligne" (LOCAL != OFFLINE)
- 🔍 Check: Vérifier `reason_code` dans console (doit être explicite)

**Si mode = 'OFFLINE' dans [CONV_RECV]**:
- ✅ **PASS**: UI montre "Mode hors ligne: [reason_code]"
- ❌ **FAIL**: Pas de reason_code → violation invariant P2

---

### Étape 6: Tests supplémentaires (2 min, optionnel)

#### Test A: Provider cloud (si clés configurées)
1. Activer ENABLE_EXTERNAL_AI (settings ou env var)
2. Envoyer message
3. Observer [CONV_RECV]:
   - `mode`: doit être 'REMOTE'
   - `network_used`: doit être `true`
   - `provider_used`: 'gemini' ou 'claude' ou autre cloud

#### Test B: Force local (si Ollama présent)
1. Désactiver ENABLE_EXTERNAL_AI
2. Envoyer message
3. Observer [CONV_RECV]:
   - `mode`: 'LOCAL'
   - `provider_used`: 'ollama' ou 'local'
   - `reason_code`: 'CLOUD_DISABLED' ou similaire

#### Test C: Tous providers down (simulation)
1. Arrêter Ollama (`systemctl stop ollama` ou pkill ollama)
2. Désactiver ENABLE_EXTERNAL_AI
3. Envoyer message
4. Observer [CONV_RECV]:
   - `mode`: 'OFFLINE'
   - `reason_code`: DOIT être présent et non-vide
   - UI: Doit afficher "Mode hors ligne: [reason_code]"

---

## VERDICT RAPIDE

### ✅ PASS si:
1. [CONV_SEND] apparaît avant requête backend
2. [CONV_RECV] apparaît avec tous les champs (`mode`, `reason_code`, `provider_used`, `network_used`)
3. mode='REMOTE' → UI ne montre PAS "hors ligne"
4. mode='OFFLINE' → `reason_code` présent ET UI montre le message avec reason

### ❌ FAIL si:
1. Logs absents ou incomplets
2. mode='REMOTE' mais UI montre "hors ligne"
3. mode='OFFLINE' sans `reason_code`
4. App crash ou erreur bloquante

### 🟡 PARTIAL si:
1. Logs présents mais format différent (vérifier structure)
2. Un seul cas de test échoue (documenter lequel)

---

## ROLLBACK SI FAIL

```bash
# Si validation échoue, rollback immédiat
git revert HEAD

# OU restore manuel
git restore src-tauri/src/conversation_engine/commands.rs \
            src/hooks/useConversationEngine.ts \
            src/services/conversationEngine.ts
```

---

## DOCUMENTATION RÉSULTATS

Créer un fichier: `docs/_evidence/FIX_CHAT_PROVIDER_GOV_P2_20260223_094235/VALIDATION_USER_RESULTS.md`

**Template**:
```markdown
# Résultats Validation Manuelle

**Date**: YYYY-MM-DD HH:MM
**Testeur**: [nom]

## Test 1: Message standard
- [CONV_SEND]: ✅ / ❌
- [CONV_RECV]: ✅ / ❌
- mode détecté: [REMOTE/LOCAL/OFFLINE]
- UI hors ligne affiché: OUI / NON
- **Verdict**: PASS / FAIL

## Test 2: Provider cloud (si applicable)
- [CONV_RECV] mode: [...]
- network_used: [true/false]
- **Verdict**: PASS / FAIL / SKIPPED

## Test 3: Force local
- [...]

## Verdict global: PASS / FAIL / PARTIAL
```

---

**Temps estimé**: 5-7 minutes avec tests optionnels  
**Prérequis**: App dev running, Ollama (ou cloud keys), DevTools access
