# 🧪 GUIDE RAPIDE — TEST CHAT IA v26.4.1

## ⚡ LANCEMENT EXPRESS (3 minutes)

### Étape 1: Lancer l'application

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
pnpm run dev:tauri
```

**⏳ Attendre:** Compilation Rust terminée (~20-30 secondes)  
**✅ Signal prêt:** Fenêtre TITANE∞ s'ouvre

---

### Étape 2: Ouvrir DevTools Console

Dans la fenêtre TITANE∞:
- **Clic droit** n'importe où → "Inspecter l'élément"
- Ou appuyer sur **F12**
- Aller à l'onglet **Console**

---

### Étape 3: Naviguer vers Chat IA

- Cliquer sur l'onglet **"CONVERSATION"** ou **"Chat IA"**
- (Si pas visible: chercher icône de chat dans la barre latérale)

---

### Étape 4: Envoyer Message Test

**Dans le champ de saisie, taper:**
```
Bonjour, test debug phase 2
```

**Puis:** Appuyer sur **Entrée** ou clic sur bouton **Envoyer**

---

## 🔍 OBSERVER LES LOGS (CRITIQUE)

### Dans Console DevTools (F12)

**Chercher ces 7 logs dans l'ordre:**

```javascript
// ✅ LOG #1 - Envoi frontend
[conversationEngine] 📤 Sending to backend: {...}

// ✅ LOG #5 - Réponse reçue
[conversationEngine] 📥 Backend response: {
  assistant_message_length: XXX,  ← DOIT ÊTRE > 0
  provider: 'ollama'
}

// ✅ LOG #6 - Message créé
[useConversationEngine] 📝 Assistant message créé: {
  content_length: XXX  ← DOIT ÊTRE > 0
}

// ✅ LOG #7 - State mis à jour
[useConversationEngine] 📊 Messages après ajout: {
  total: 2  ← DOIT PASSER DE 1 À 2
}
```

### Dans Terminal (où tourne dev:tauri)

**Chercher ces logs Rust:**

```
// ✅ LOG #2 - Réception backend
[conversation_process_message] 📨 Request received | msg_len=27

// ✅ LOG #3 - Routing Ollama
[AI Router v15] 🔍 Debug: ollama_available=true

// ✅ LOG #4 - Succès génération
[conversation_process_message] ✅ Success | tokens=XXX  ← DOIT ÊTRE > 0
```

---

## ✅ TEST RÉUSSI SI:

1. **TOUS les 7 logs** apparaissent
2. `assistant_message_length > 0` dans log #5
3. `content_length > 0` dans log #6
4. `total: 2` dans log #7
5. **Réponse VISIBLE** dans l'interface UI ← **POINT CLEF**

**📸 Si succès:** Faire screenshot interface + copier les logs

---

## ❌ TEST ÉCHOUÉ SI:

### Cas A: Aucun log backend (Rust)

**Symptôme:** Logs #1 présent, mais aucun log #2, #3, #4

**Cause:** Tauri invoke échoue

**Action:**
```bash
# Recompiler Rust
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
cargo build --manifest-path=src-tauri/Cargo.toml
```

---

### Cas B: Backend erreur

**Symptôme:** Log `[conversation_process_message] ❌ Error`

**Action:**
```bash
# Vérifier Ollama actif
curl http://127.0.0.1:11434/api/tags

# Si pas de réponse:
ollama serve

# Vérifier modèle installé
ollama list
# Doit montrer: llama3.1
```

---

### Cas C: Success mais content_length=0

**Symptôme:** Log #4 `✅ Success` MAIS log #5 `assistant_message_length: 0`

**Action:**
```bash
# Test Ollama direct
ollama run llama3.1 "Bonjour"

# Si Ollama répond vide → problème modèle
# Si Ollama répond OK → problème mapping Rust
```

---

### Cas D: Logs complets MAIS réponse invisible

**Symptôme:** Tous les 7 logs OK, `content_length > 0`, MAIS case vide dans UI

**Action dans Console DevTools:**
```javascript
// Compter messages DOM
document.querySelectorAll('.conversation-message').length
// Attendu: 2 (user + assistant)

// Inspecter assistant
const msg = document.querySelector('.conversation-message.assistant');
console.log({
  visible: msg ? 'OUI' : 'NON',
  display: msg ? getComputedStyle(msg).display : 'N/A',
  opacity: msg ? getComputedStyle(msg).opacity : 'N/A',
  height: msg ? msg.offsetHeight : 0,
  texte: msg ? msg.textContent : ''
});
```

**→ Si message présent mais height=0 ou opacity=0:** Problème CSS

---

## 📋 RAPPORT À FOURNIR

### Si ✅ Test Réussi:

```
✅ CHAT IA FONCTIONNE !

Provider: Ollama
Tokens générés: ~150
Réponse affichée: "Bonjour ! Je suis..."

[Joindre screenshot interface]
```

---

### Si ❌ Test Échoué:

```
❌ PROBLÈME DÉTECTÉ

Dernier log réussi: #X - [description]
Premier log manquant: #Y - [description]

Point de rupture: [Backend / Frontend / Rendering]

LOGS CONSOLE (copier tout):
[Coller ici]

LOGS TERMINAL RUST (copier tout):
[Coller ici]

Commande diagnostic DOM:
[Résultat de la commande JavaScript ci-dessus]
```

---

## 🛠️ DÉPANNAGE RAPIDE

### Problème: App ne démarre pas

```bash
# Vérifier ports libres
lsof -i :5173 -i :11434

# Tuer processus si bloqués
pkill -9 -f "vite|tauri"

# Relancer proprement
pnpm run dev:tauri
```

---

### Problème: Compilation Rust bloquée

```bash
# Nettoyer cache (ATTENTION: long, 2-3 minutes)
cargo clean --manifest-path=src-tauri/Cargo.toml

# Recompiler
cargo build --manifest-path=src-tauri/Cargo.toml
```

---

### Problème: Ollama ne répond pas

```bash
# Vérifier service
systemctl status ollama
# ou
ps aux | grep ollama

# Redémarrer si nécessaire
ollama serve
```

---

## 🎯 OBJECTIF

**Identifier PRÉCISÉMENT** où le pipeline de messages se casse:

```
User Input
   ↓
#1 Frontend Send
   ↓
#2 Backend Receive
   ↓
#3 AI Router
   ↓
#4 Ollama Generate
   ↓
#5 Frontend Receive
   ↓
#6 Message Created
   ↓
#7 State Updated
   ↓
#8 UI Render ← POINT FINAL
```

**Un des 8 points échoue → On saura lequel grâce aux logs !**

---

## ⏱️ TEMPS ESTIMÉ

- Lancement app: 30 secondes
- Test message: 10 secondes
- Analyse logs: 2 minutes

**Total:** ~3 minutes pour diagnostic complet

---

**Prêt pour test ?** 🚀

Commande: `pnpm run dev:tauri`
