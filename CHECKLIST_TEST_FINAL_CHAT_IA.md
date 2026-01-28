# 🎯 CHECKLIST FINALE — TEST CHAT IA v26.4.1

**Date:** 2026-01-27  
**Phase:** Validation Manuelle Active

---

## ✅ PRÉ-REQUIS (Vérifiés)

- ✅ Ollama service actif (port 11434)
- ✅ Modèle llama3.1 installé (4.9 GB)
- ✅ TypeScript: 0 erreurs
- ✅ Rust: Compilation OK
- ✅ 5 commits pushés sur origin/MAIN
- ✅ Logs complets en place (7 points de trace)

---

## 🚀 PROCÉDURE DE TEST (2 Options)

### Option A: Test Standard (Recommandé)

#### Terminal 1: Lancer l'application
```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
pnpm run dev:tauri
```

**Attendre:** Compilation Rust terminée + fenêtre TITANE∞ ouverte (~30 sec)

#### Terminal 2 (Optionnel): Monitoring logs temps réel
```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
./scripts/monitor_chat_logs.sh
```

**Bénéfice:** Voir logs colorisés en temps réel (cyan/vert/rouge)

#### Dans l'application:
1. **F12** → Onglet **Console** (DevTools)
2. Cliquer sur **"CONVERSATION"** ou **"Chat IA"**
3. Envoyer message: **"Bonjour, test debug phase 2"**
4. **Observer logs** dans Console + Terminal

---

### Option B: Test avec Script Automatisé

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
./scripts/test_chat_ia.sh
```

**Note:** Script valide pré-requis puis lance app (nécessite interaction manuelle pour test UI)

---

## 🔍 LOGS ATTENDUS (Séquence Complète)

### Console DevTools (F12)

```javascript
// ✅ #1 — Envoi frontend
[conversationEngine] 📤 Sending to backend: {
  message_length: 27,
  mode: 'default'
}

// ✅ #5 — Réponse reçue
[conversationEngine] 📥 Backend response: {
  message_id: '...',
  assistant_message_length: 250,  // ← DOIT ÊTRE > 0
  provider: 'ollama'
}

// ✅ #6 — Message créé
[useConversationEngine] 📝 Assistant message créé: {
  id: '...',
  content_length: 250  // ← DOIT ÊTRE > 0
}

// ✅ #7 — State mis à jour
[useConversationEngine] 📊 Messages après ajout: {
  total: 2,  // ← DOIT PASSER DE 1 À 2
  last_role: 'assistant'
}
```

### Terminal Backend (Rust)

```
// ✅ #2 — Réception backend
[conversation_process_message] 📨 Request received | msg_len=27

// ✅ #3 — Routing
[AI Router v15] 🔍 Debug: ollama_available=true

// ✅ #4 — Succès génération
[conversation_process_message] ✅ Success | msg_id=... | tokens=150
```

---

## ✅ CRITÈRES DE SUCCÈS

### Test RÉUSSI si:

- [ ] **Tous les 7 logs** apparaissent dans l'ordre
- [ ] `assistant_message_length > 0` dans log #5
- [ ] `content_length > 0` dans log #6
- [ ] `total: 2` dans log #7
- [ ] **Réponse VISIBLE** dans interface UI ← **OBJECTIF FINAL**

**Action si succès:**
```bash
# Créer screenshot interface
# Copier tous les logs
# Confirmer: "✅ Chat IA fonctionne avec Ollama"
```

---

## ❌ DIAGNOSTIC SI ÉCHEC

### Cas 1: Aucun log backend (Rust)

**Symptôme:** Log #1 présent, mais aucun #2, #3, #4

**Vérification:**
```bash
# Terminal où tourne dev:tauri montre des erreurs Rust ?
# Si oui: recompiler
cargo build --manifest-path=src-tauri/Cargo.toml
```

---

### Cas 2: Backend erreur

**Symptôme:** Log `[conversation_process_message] ❌ Error`

**Vérification Ollama:**
```bash
# Service actif ?
curl http://127.0.0.1:11434/api/tags

# Si pas de réponse:
ollama serve

# Modèle présent ?
ollama list  # doit montrer llama3.1
```

---

### Cas 3: Success mais content_length=0

**Symptôme:** Log #4 `✅ Success` MAIS log #5 `assistant_message_length: 0`

**Test Ollama direct:**
```bash
ollama run llama3.1 "Bonjour"
# Si réponse vide → problème modèle Ollama
# Si réponse OK → problème mapping Rust
```

---

### Cas 4: Logs complets MAIS réponse invisible

**Symptôme:** Tous logs OK, `content_length > 0`, MAIS case vide dans UI

**Diagnostic DOM (dans Console DevTools):**
```javascript
// Compter messages
document.querySelectorAll('.conversation-message').length
// Attendu: 2

// Inspecter assistant
const msg = document.querySelector('.conversation-message.assistant');
console.log({
  present: msg ? 'OUI' : 'NON',
  display: msg ? getComputedStyle(msg).display : 'N/A',
  opacity: msg ? getComputedStyle(msg).opacity : 'N/A',
  height: msg ? msg.offsetHeight + 'px' : 'N/A',
  text_length: msg ? msg.textContent.length : 0,
  text_preview: msg ? msg.textContent.substring(0, 50) : ''
});
```

**Si height=0 ou opacity=0:** Problème CSS/rendering

---

## 📊 FORMAT RAPPORT ATTENDU

### ✅ Si Test Réussi:

```markdown
✅ TEST CHAT IA RÉUSSI v26.4.1

**Date:** 2026-01-27
**Provider:** Ollama (llama3.1)
**Tokens générés:** ~150

**Réponse affichée:** "Bonjour ! Je suis TITANE∞..."

**Logs observés:** Tous les 7 logs présents dans l'ordre

**Screenshot:** [Joindre capture interface]
```

---

### ❌ Si Test Échoué:

```markdown
❌ TEST CHAT IA ÉCHOUÉ v26.4.1

**Date:** 2026-01-27
**Durée test:** X minutes

**Point de rupture identifié:**
- Dernier log réussi: #X - [description]
- Premier log manquant: #Y - [attendu]
- Catégorie: [Backend / Frontend / Rendering]

**LOGS CONSOLE (DevTools F12):**
```
[Copier TOUS les logs ici]
```

**LOGS TERMINAL (Backend Rust):**
```
[Copier logs du terminal où tourne dev:tauri]
```

**DIAGNOSTIC DOM:**
```javascript
[Résultat de la commande document.querySelectorAll ci-dessus]
```

**Actions tentées:**
- [ ] Redémarrage Ollama
- [ ] Recompilation Rust
- [ ] Test Ollama direct
- [ ] Autre: [préciser]
```

---

## 🛠️ COMMANDES RAPIDES

```bash
# Lancer test
pnpm run dev:tauri

# Monitoring logs
./scripts/monitor_chat_logs.sh

# Vérifier Ollama
curl http://127.0.0.1:11434/api/tags | jq

# Test Ollama direct
ollama run llama3.1 "Bonjour"

# Recompiler Rust
cargo build --manifest-path=src-tauri/Cargo.toml

# Vérifier compilation TypeScript
pnpm exec tsc --noEmit
```

---

## 🎯 OBJECTIF IMMÉDIAT

**Identifier PRÉCISÉMENT** où la chaîne se casse:

```
User Input
   ↓
#1 Frontend Send        ← Log Console
   ↓
#2 Backend Receive      ← Log Terminal Rust
   ↓
#3 AI Router           ← Log Terminal Rust
   ↓
#4 Ollama Generate     ← Log Terminal Rust
   ↓
#5 Frontend Receive    ← Log Console
   ↓
#6 Message Created     ← Log Console
   ↓
#7 State Updated       ← Log Console
   ↓
#8 UI Render          ← VISUEL dans interface
```

**Un des 8 points échoue → Les logs révèleront lequel !**

---

## ⏱️ TIMING

- **Lancement app:** 30 secondes (compilation Rust)
- **Test message:** 10 secondes (génération Ollama)
- **Analyse logs:** 2 minutes (identification point rupture)

**Total:** ~3 minutes pour diagnostic complet

---

## 📞 PROCHAINES ÉTAPES

### Après Test:

1. **Fournir rapport** (format ci-dessus)
2. **Si succès:** Retirer logs debug (optionnel)
3. **Si échec:** Phase 3 correctifs ciblés selon diagnostic

---

**🟢 Prêt pour test — En attente de lancement !**

**Commande principale:** `pnpm run dev:tauri`
