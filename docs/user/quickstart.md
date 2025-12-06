# 🚀 Guide de Démarrage Rapide — TITANE∞

Apprenez à utiliser TITANE∞ en 5 minutes.

---

## 🎯 Objectif

À la fin de ce guide, vous saurez:
- Démarrer votre première conversation
- Configurer votre moteur IA préféré
- Utiliser la mémoire hiérarchique
- Activer le mode audio

**Temps estimé**: 5-10 minutes

---

## 1️⃣ Premier Lancement

### Démarrer l'application

```bash
cd TITANE_INFINITY
npm run tauri dev
```

**Résultat attendu**:
```
[INFO] 🚀 TITANE∞ v19.4.3 starting...
[INFO] ✅ Database initialized: ./data/titane.db
[INFO] ✅ IPC Profiler ready
[INFO] 🌐 Frontend: http://localhost:5173
[INFO] ⚡ Ready in 1.2s
```

L'application s'ouvre automatiquement.

---

## 2️⃣ Interface Principale

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│  TITANE∞                          [⚙️] [🎙️] [👤]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  💬 Chat Principal                                  │
│  ┌─────────────────────────────────────────────┐  │
│  │ Bonjour ! Je suis TITANE∞, votre           │  │
│  │ assistant IA local. Comment puis-je        │  │
│  │ vous aider aujourd'hui ?                   │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ Tapez votre message ici...          [Envoyer]│  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  📝 Sessions  |  💾 Mémoire  |  🛠️ Outils          │
└─────────────────────────────────────────────────────┘
```

**Zones clés**:
- **Barre supérieure**: Paramètres, mode audio, profil
- **Zone centrale**: Conversation active
- **Barre inférieure**: Gestion sessions, mémoire, outils

---

## 3️⃣ Première Conversation

### Message de base

**Entrée**:
```
Bonjour ! Peux-tu te présenter ?
```

**Réponse** (exemple avec GPT-4):
```
Bonjour ! Je suis TITANE∞, votre assistant IA personnel fonctionnant 
entièrement en local. Je peux vous aider avec:

- 💬 Conversations naturelles et contextuelles
- 📝 Rédaction et analyse de texte
- 💻 Aide au développement (code, debug)
- 🧠 Mémorisation de vos préférences
- 🎙️ Conversations vocales

Vos données restent 100% locales et privées. Comment puis-je vous aider ?
```

### Utiliser la mémoire

**Entrée**:
```
Je préfère qu'on se tutoie, et appelle-moi Alex.
```

**Réponse**:
```
Parfait Alex ! J'ai enregistré ça dans ma mémoire. 
À partir de maintenant, je te tutoierai. 

[💾 Mémorisé: Nom=Alex, Tutoiement=Oui]
```

**Vérification** (nouvelle session):
```
Utilisateur: Bonjour !
Assistant: Salut Alex ! Comment ça va aujourd'hui ?
```

✅ **La mémoire persiste entre les sessions**

---

## 4️⃣ Configuration du Moteur IA

### Ouvrir les paramètres

Cliquez sur **⚙️** (coin supérieur droit) → **Paramètres IA**

### Option 1: OpenAI (Cloud)

```yaml
Moteur: OpenAI
Modèle: gpt-4o-mini
API Key: sk-proj-...
Temperature: 0.7
Max Tokens: 2000
```

**Avantages**: Réponses rapides, qualité élevée  
**Inconvénient**: Nécessite connexion internet + API key payante

### Option 2: Claude (Cloud)

```yaml
Moteur: Claude
Modèle: claude-3-5-sonnet-20241022
API Key: sk-ant-...
Temperature: 0.7
Max Tokens: 4000
```

**Avantages**: Excellent en analyse, raisonnement long  
**Inconvénient**: API key Anthropic requise

### Option 3: Local (Ollama) — Recommandé

```yaml
Moteur: Ollama
Modèle: llama3.2:3b
URL: http://localhost:11434
Temperature: 0.8
```

**Avantages**: 100% gratuit, 100% privé, pas d'internet requis  
**Inconvénient**: Nécessite Ollama installé localement

#### Installer Ollama

```bash
# Linux / macOS
curl -fsSL https://ollama.com/install.sh | sh

# Télécharger un modèle
ollama pull llama3.2:3b

# Vérifier
ollama list
```

Dans TITANE∞: Sélectionner **Ollama** → Modèle `llama3.2:3b` → **Sauvegarder**

---

## 5️⃣ Fonctionnalités Avancées

### 💾 Système de Mémoire

TITANE∞ utilise 3 niveaux de mémoire:

**STM (Short-Term)**: Conversation actuelle  
**MTM (Mid-Term)**: Session courante (dernières heures)  
**LTM (Long-Term)**: Données persistantes (préférences, connaissances)

**Exemple pratique**:

```
Utilisateur: J'aime le café noir sans sucre
Assistant: Noté ! [💾 LTM: préférences.boisson = café noir]

[2 jours plus tard]

Utilisateur: Quelle boisson me recommandes-tu ?
Assistant: Vu que tu aimes le café noir, je te recommande un espresso !
```

### 🎙️ Mode Audio

Activer le mode audio:
1. Cliquer sur **🎙️** (barre supérieure)
2. Autoriser l'accès au microphone
3. Parler naturellement
4. L'assistant répond en texte ou voix (configurable)

**Raccourci clavier**: `Ctrl + M` (ou `Cmd + M` sur macOS)

### 📝 Gestion des Sessions

**Créer une nouvelle session**:
```
Menu → Nouvelle Session → Nommer "Projet X"
```

**Avantages**:
- Contexte isolé par session
- Historique organisé
- Mémoire contextuelle

**Exemple**:
- Session "Travail": Contexte professionnel
- Session "Personnel": Conversations privées
- Session "Dev Python": Aide technique Python

### 🛠️ DevTools (Mode développeur)

Activer les outils de développement:
```
Paramètres → Développeur → Activer DevTools
```

**Fonctionnalités**:
- Profiler IPC (latences commandes)
- Statistiques mémoire (STM/MTM/LTM)
- Logs détaillés
- Export de données

---

## 6️⃣ Cas d'Usage Rapides

### Assistance quotidienne

```
Utilisateur: Résume-moi les actualités tech de la semaine
Assistant: [Génère un résumé structuré]

Utilisateur: Crée-moi un planning pour apprendre Rust
Assistant: [Génère un plan d'apprentissage sur 8 semaines]
```

### Aide au développement

```
Utilisateur: Explique-moi ce code Rust:
fn main() {
    let x = vec![1, 2, 3];
    println!("{:?}", x);
}
Assistant: Ce code crée un vecteur avec 3 éléments [1, 2, 3] et 
l'affiche. {:?} est le format Debug en Rust.
```

### Créativité

```
Utilisateur: Écris-moi un poème sur l'hiver
Assistant: [Génère un poème personnalisé]
```

---

## 7️⃣ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl + N` | Nouvelle session |
| `Ctrl + M` | Mode audio on/off |
| `Ctrl + K` | Effacer conversation |
| `Ctrl + ,` | Ouvrir paramètres |
| `Ctrl + /` | Aide rapide |
| `↑` / `↓` | Naviguer historique messages |

---

## 8️⃣ Problèmes Fréquents

### L'assistant ne répond pas

**Vérifications**:
1. Moteur IA configuré ? → Paramètres IA
2. API Key valide ? → Tester avec `curl`
3. Ollama lancé ? → `ollama serve`

### Réponses lentes (>5s)

**Solutions**:
- Modèle local trop lourd → essayer `llama3.2:1b`
- Cloud API surchargé → vérifier status API
- Profiler IPC → DevTools → Profiler

### Mémoire ne fonctionne pas

**Vérifications**:
- Base SQLite accessible ? → `ls -la data/titane.db`
- Permissions OK ? → `chmod 644 data/titane.db`
- Espace disque suffisant ? → `df -h`

---

## 🎓 Aller Plus Loin

**Tutoriels**:
- [Configuration avancée](./tutorials/configuration.md)
- [Personnalisation UI](./tutorials/customization.md)
- [Scripts et automatisation](./tutorials/automation.md)

**Documentation fonctionnalités**:
- [Chat IA](./features/chat.md)
- [Système de mémoire](./features/memory.md)
- [Mode audio](./features/audio.md)
- [DevTools](./features/devtools.md)

**Communauté**:
- Discord: [discord.gg/titane-infinity](https://discord.gg/titane-infinity)
- GitHub Discussions: [github.com/KallokTherok1994/TITANE_INFINITY/discussions](https://github.com/KallokTherok1994/TITANE_INFINITY/discussions)

---

## ✅ Récapitulatif

Vous savez maintenant:
- ✅ Démarrer TITANE∞ et avoir une conversation
- ✅ Configurer votre moteur IA (Cloud ou Local)
- ✅ Utiliser la mémoire hiérarchique
- ✅ Activer le mode audio
- ✅ Gérer plusieurs sessions
- ✅ Utiliser les DevTools

**Prochaine étape**: Explorez les [fonctionnalités avancées](./features/chat.md) !

---

**Besoin d'aide ?** → [FAQ](./faq.md) | [Troubleshooting](./troubleshooting.md) | [Discord](https://discord.gg/titane-infinity)

