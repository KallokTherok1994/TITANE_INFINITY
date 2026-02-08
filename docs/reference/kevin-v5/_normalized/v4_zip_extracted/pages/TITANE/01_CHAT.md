# TITANE — Chat (Communication & Intelligence)

## 1) Intention
Interface conversationnelle multi-provider (Gemini / OpenAI / Claude / Ollama / fallback) avec mémoire, pièces jointes, vision et audio.

## 2) Structure UI (observée)

### 2.1 Bandeau supérieur de module
- Tabs/pills du système (Chat, VAD, Vision, Identité, Mémoire, Évolution, XP, Transform)

### 2.2 Gestion de conversations
Boutons :
- **Nouvelle conversation**
- **Conversations**
- **Archives**

Invariants :
- Une conversation possède : `id`, `title`, `createdAt`, `updatedAt`, `archivedAt?`, `messages[]`.

### 2.3 Barre de configuration du chat
- Sélecteur provider (ex. Gemini)
- Sélecteur mode (ex. Normal)
- Boutons icônes (actions rapides) : reset, settings, logs, warnings… (icônes visibles dans captures)

### 2.4 Zone de recherche
- Champ “Rechercher…” (filtre sur messages/conversations)

### 2.5 Zone centrale (empty state)
- Message : “TITANE∞ est prêt à converser”
- Meta : “Mode actuel: Normal” + “Provider: Gemini”
- Quick prompts : Brainstorm Ideas / Summarize / Analyze / Explain

### 2.6 Composer (bas)
- Barre “Fichiers / Vision / Audio / Conversation” (icônes)
- Champ texte (placeholder : “Tapez votre message… (Entrée pour envoyer, Shift+Entrée…)”)
- Bouton **Envoyer**

---

## 3) États & erreurs observés

### 3.1 Erreur provider (Ollama)
Bannière/ligne d’erreur : “Erreur lors du chargement d’Ollama …”
Attendu :
- bascule auto vers provider fallback
- UI conserve l’action (send) en mode dégradé.

### 3.2 Silences / bulles vides (risque historique)
Règle : **chaque envoi** doit produire :
- une bulle utilisateur
- puis **soit** bulle assistant **soit** bulle “erreur” explicite.

---

## 4) Recommandations UX
- Indiquer explicitement le statut provider (OK / DEGRADÉ / DOWN) près du sélecteur.
- Ajouter “latence” + “tokens” en mode dev.
- Ajout d’un bouton “Copier diagnostic” en cas d’erreur.

## 5) Checklists
- Nouvelle conversation crée un `conversationId` stable + persistance locale.
- Archivage/restauration : pas de perte de messages.
- Recherche : performant (index local).

