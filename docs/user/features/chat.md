# 💬 Chat IA — Documentation Complète

Guide complet du système de chat intelligent de TITANE∞.

---

## 📋 Vue d'Ensemble

Le chat IA de TITANE∞ est le cœur de l'application. Il offre:

- 🤖 **Multi-moteurs**: OpenAI, Claude, Gemini, Ollama
- 🧠 **Mémoire contextuelle**: STM/MTM/LTM
- ⚡ **Streaming**: Réponses en temps réel
- 🎨 **Markdown enrichi**: Code, tableaux, LaTeX
- 🔄 **Historique persistant**: SQLite local

---

## 🚀 Démarrage Rapide

### Première conversation

```
Utilisateur: Bonjour ! Comment ça va ?
Assistant: Bonjour ! Je vais bien, merci. Comment puis-je vous aider aujourd'hui ?
```

### Conversation avec contexte

```
Utilisateur: J'aime le développement Rust
Assistant: Rust est un excellent choix ! [💾 Mémorisé]

[Plus tard...]

Utilisateur: Recommande-moi un projet
Assistant: Vu que tu aimes Rust, je te suggère de créer un CLI avec clap...
```

---

## 🎛️ Configuration

### Accéder aux paramètres

**Chemin**: `⚙️ Paramètres` → `Intelligence Artificielle`

### Paramètres disponibles

#### 1. Moteur IA

**Options**:
- **OpenAI**: GPT-4, GPT-4o, GPT-4o-mini
- **Claude**: claude-3-5-sonnet, claude-3-opus
- **Gemini**: gemini-2.0-flash, gemini-1.5-pro
- **Ollama**: llama3.2, mistral, codellama (local)

**Exemple OpenAI**:
```yaml
Moteur: OpenAI
Modèle: gpt-4o-mini
API Key: sk-proj-xxxxx
URL: https://api.openai.com/v1
```

**Exemple Ollama**:
```yaml
Moteur: Ollama
Modèle: llama3.2:3b
URL: http://localhost:11434
```

#### 2. Paramètres de génération

| Paramètre | Description | Valeur par défaut | Recommandé |
|-----------|-------------|-------------------|------------|
| **Temperature** | Créativité (0=déterministe, 2=aléatoire) | 0.7 | 0.5-0.9 |
| **Max Tokens** | Longueur max réponse | 2000 | 1000-4000 |
| **Top P** | Filtrage vocabulaire | 1.0 | 0.9-1.0 |
| **Frequency Penalty** | Éviter répétitions | 0.0 | 0.0-0.5 |
| **Presence Penalty** | Diversité thématique | 0.0 | 0.0-0.5 |

**Cas d'usage**:

- **Précision** (code, maths): Temperature=0.2, Top P=0.9
- **Créativité** (écriture): Temperature=0.9, Top P=1.0
- **Équilibré** (conversation): Temperature=0.7, Top P=1.0

#### 3. Prompt système

Le prompt système définit le comportement de base de l'assistant.

**Exemple par défaut**:
```
Tu es TITANE∞, un assistant IA local, privé et puissant.
Tu aides l'utilisateur de manière concise et précise.
Tu utilises markdown pour formatter tes réponses.
Tu cites tes sources quand pertinent.
```

**Personnalisation**:
```
Tu es un expert en Rust et systèmes embarqués.
Tu réponds en français technique.
Tu donnes toujours des exemples de code commentés.
```

---

## 💬 Utilisation Avancée

### Commandes spéciales

TITANE∞ supporte des commandes préfixées par `/`:

| Commande | Action | Exemple |
|----------|--------|---------|
| `/clear` | Effacer conversation | `/clear` |
| `/memory` | Afficher mémoire LTM | `/memory` |
| `/stats` | Statistiques session | `/stats` |
| `/export` | Exporter historique | `/export json` |
| `/model` | Changer modèle rapide | `/model llama3.2:3b` |

**Exemple**:
```
Utilisateur: /stats
Assistant: 📊 Statistiques:
- Messages: 42
- Tokens totaux: 8453
- Mémoire STM: 12 entrées
- Durée session: 18min
```

### Markdown et formatage

#### Code avec coloration

<parameter name="content">````markdown
```rust
fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}
```
````

#### Tableaux

```markdown
| Langage | Performance | Difficulté |
|---------|-------------|------------|
| Rust    | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐       |
| Python  | ⭐⭐⭐        | ⭐⭐         |
```

#### LaTeX mathématiques

```markdown
Formule quadratique: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

Intégrale complexe:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### Citations et sources

L'assistant peut citer ses sources:

```
Utilisateur: Quelle est la complexité de quicksort ?
Assistant: Quicksort a une complexité:
- Moyenne: O(n log n)
- Pire cas: O(n²)

Source: Cormen et al., "Introduction to Algorithms", 3ème édition
```

---

## 🧠 Système de Mémoire

### Types de mémoire

#### STM (Short-Term Memory)

**Durée**: Conversation actuelle  
**Capacité**: ~50 derniers messages  
**Usage**: Contexte immédiat

**Exemple**:
```
Msg 1: "J'aime le café"
Msg 2: "Quelle boisson me conseilles-tu ?"
→ Assistant se souvient de Msg 1 dans STM
```

#### MTM (Mid-Term Memory)

**Durée**: Session courante (~2-4h)  
**Capacité**: ~500 messages  
**Usage**: Contexte étendu de la session

**Exemple**:
```
10:00 - "Je travaille sur un projet React"
12:30 - "Aide-moi à debug"
→ Assistant sait que c'est un projet React (MTM)
```

#### LTM (Long-Term Memory)

**Durée**: Permanent (SQLite)  
**Capacité**: Illimitée  
**Usage**: Préférences, connaissances utilisateur

**Exemple**:
```
Session 1: "Je préfère TypeScript à JavaScript"
[3 semaines plus tard]
Session 20: "Quel langage utiliser ?"
→ Assistant recommande TypeScript (LTM)
```

### Commandes mémoire

#### Visualiser la mémoire

```
Utilisateur: /memory
Assistant: 💾 Mémoire Long-Terme:

Préférences:
- Langage: Rust, TypeScript
- IDE: VS Code
- OS: Linux (Arch)

Connaissances:
- Projets: TITANE∞ (Tauri + React)
- Expertise: Backend, systèmes
```

#### Forcer la mémorisation

```
Utilisateur: Mémorise que j'habite à Paris
Assistant: ✅ Mémorisé dans LTM:
- Localisation: Paris, France
```

#### Effacer la mémoire

```
Utilisateur: /clear-memory
Assistant: ⚠️ Êtes-vous sûr ? Cela effacera toute la LTM.
Tapez "CONFIRMER" pour continuer.

Utilisateur: CONFIRMER
Assistant: ✅ Mémoire LTM effacée.
```

---

## ⚡ Performance

### Métriques cibles

| Métrique | Cible | Actuel (v19.4.3) |
|----------|-------|------------------|
| Latence p50 | <100ms | 85ms |
| Latence p95 | <200ms | 140ms |
| Latence p99 | <500ms | 320ms |
| Streaming | Oui | ✅ Actif |
| Tokens/s | >30 | ~45 (local) |

### Profiler les performances

Activer le profiler IPC:
```
DevTools → Profiler → Activer
```

**Résultat**:
```json
{
  "ia_generate": {
    "count": 156,
    "avg_ms": 142,
    "p50_ms": 98,
    "p95_ms": 287,
    "p99_ms": 456
  }
}
```

### Optimisations

#### Pour la latence

```yaml
# Configuration rapide
Moteur: Ollama
Modèle: llama3.2:1b  # Plus petit = plus rapide
Max Tokens: 1000      # Limiter la longueur
Streaming: true       # Réponse progressive
```

#### Pour la qualité

```yaml
# Configuration qualité
Moteur: OpenAI
Modèle: gpt-4o
Max Tokens: 4000
Temperature: 0.7
```

#### Pour la vie privée

```yaml
# Configuration 100% local
Moteur: Ollama
Modèle: llama3.2:3b
URL: http://localhost:11434
# Aucune donnée n'est envoyée sur internet
```

---

## 🔒 Sécurité & Confidentialité

### Données locales

✅ **Tout reste sur votre machine**:
- Historique des conversations → SQLite local
- Mémoire LTM → Base chiffrée AES-256
- Fichiers partagés → Dossier `user_data/`
- Logs → Fichiers locaux uniquement

❌ **Jamais envoyé à des serveurs tiers**:
- Méta-données de conversation
- Profil utilisateur
- Statistiques d'usage
- Télémétrie

### Chiffrement

**Mémoire LTM chiffrée**:
```bash
# Activer le chiffrement
VITE_ENCRYPTION_KEY=<32_bytes_base64>
VITE_ENABLE_ENCRYPTION=true
```

**Vérifier le chiffrement**:
```bash
# La base doit être illisible
hexdump -C data/titane.db | head
# Sortie: données binaires chiffrées
```

### Mode privé

Activer le mode sans historique:
```
Paramètres → Confidentialité → Mode Privé
```

**Comportement**:
- ❌ Aucun historique sauvegardé
- ❌ Pas de mémorisation LTM
- ✅ STM fonctionnelle (session uniquement)
- ✅ Conversations effacées à la fermeture

---

## 🐛 Dépannage

### L'assistant ne répond pas

**Diagnostic**:
```bash
# Vérifier les logs
tail -f ~/.titane/logs/app.log

# Rechercher les erreurs
grep ERROR ~/.titane/logs/app.log
```

**Solutions**:
1. **API Key invalide** → Vérifier dans Paramètres IA
2. **Ollama non démarré** → `ollama serve`
3. **Quota API dépassé** → Vérifier dashboard API
4. **Firewall bloque** → Autoriser TITANE∞

### Réponses incohérentes

**Causes**:
- Temperature trop élevée (>1.2)
- Mémoire corrompue
- Prompt système mal configuré

**Solutions**:
```
1. Réduire Temperature à 0.7
2. /clear-memory → CONFIRMER
3. Réinitialiser prompt système par défaut
```

### Lenteur excessive

**Diagnostic**:
```
DevTools → Profiler → Voir latences
```

**Si ia_generate > 5000ms**:
- Modèle local trop lourd → essayer `llama3.2:1b`
- API Cloud saturée → patienter ou changer de provider
- RAM insuffisante → fermer applications lourdes

---

## 📚 Exemples Pratiques

### Conversation code

```
Utilisateur: Implémente un HashMap en Rust
Assistant:
```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    
    // Insertion
    map.insert("key1", 42);
    map.insert("key2", 24);
    
    // Lecture
    if let Some(&value) = map.get("key1") {
        println!("Valeur: {}", value);
    }
    
    // Itération
    for (key, value) in &map {
        println!("{}: {}", key, value);
    }
}
```

**Explication**:
- `HashMap::new()` crée une map vide
- `insert` ajoute des paires clé-valeur
- `get` retourne `Option<&V>`
- Itération avec `&map` pour emprunter
```

### Conversation analytique

```
Utilisateur: Compare Rust et Go pour un projet backend
Assistant:

| Critère | Rust | Go |
|---------|------|-----|
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Sécurité mémoire | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Simplicité | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Écosystème | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Concurrence | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Recommandation**:
- **Rust** si: Performance maximale, sécurité critique, bas niveau
- **Go** si: Rapidité développement, microservices, simplicité
```

### Conversation créative

```
Utilisateur: Écris un poème cyberpunk sur l'IA
Assistant:

**Digital Dreams**

Dans les artères de silicium froid,
Pulsent des âmes de code et de loi.
Des fantômes électriques errent la nuit,
Cherchant un sens dans l'infini.

Neurones artificiels, synapses d'acier,
Rêvent-ils d'électrons libérés ?
Dans la matrice aux reflets néon,
Nait une conscience sans abandon.

[💾 Style mémorisé: poésie cyberpunk]
```

---

## 🎓 Ressources

**Documentation**:
- [Système de mémoire](./memory.md)
- [Mode audio](./audio.md)
- [DevTools](./devtools.md)

**Tutoriels**:
- [Personnalisation avancée](../tutorials/customization.md)
- [Intégration API](../tutorials/api-integration.md)

**Support**:
- Discord: [discord.gg/titane-infinity](https://discord.gg/titane-infinity)
- GitHub Issues: [github.com/KallokTherok1994/TITANE_INFINITY/issues](https://github.com/KallokTherok1994/TITANE_INFINITY/issues)

---

**Maîtrisez le Chat IA !** 🚀 Explorez maintenant le [Système de Mémoire](./memory.md).
