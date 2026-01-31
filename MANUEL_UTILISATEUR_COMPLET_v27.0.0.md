# 📚 TITANE∞ — MANUEL UTILISATEUR COMPLET v27.0.0
**Version:** 27.0.0 | **Langue:** Français | **Date:** 31 Janvier 2026

---

## 📖 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Installation & Démarrage](#installation--démarrage)
3. [Interface Principale](#interface-principale)
4. [Chat IA — Système Conversationnel](#chat-ia--système-conversationnel)
5. [Modes de Conversation](#modes-de-conversation)
6. [Système de Mémoire](#système-de-mémoire)
7. [Vision & Perception](#vision--perception)
8. [Modules Cognitifs](#modules-cognitifs)
9. [Progression & XP](#progression--xp)
10. [Paramètres & Configuration](#paramètres--configuration)
11. [Dépannage & Support](#dépannage--support)
12. [FAQ](#faq)
13. [Raccourcis Clavier](#raccourcis-clavier)
14. [API & Commandes Tauri](#api--commandes-tauri)
15. [Glossaire Technique](#glossaire-technique)
16. [Sécurité & Confidentialité](#sécurité--confidentialité)
17. [Performance & Optimisation](#performance--optimisation)

---

## 🎯 INTRODUCTION

### Qu'est-ce que TITANE∞ ?

TITANE∞ est un **Système d'Exploitation Cognitif (OS Cognitif)** - une application desktop intelligente et autonome qui fonctionne 100% localement. C'est bien plus qu'un chatbot : c'est un assistant personnel cognitif qui apprend, évolue et s'adapte à vos besoins.

**Capacités principales:**
- 🧠 **IA Conversationnelle** — Chat multimodal avec 4+ providers IA
- 💾 **Triple Système de Mémoire** — STM (court terme) + MTM (moyen terme) + LTM (long terme)
- 📈 **Progression & XP** — Gagnez de l'expérience dans 3 domaines
- 👁️ **Vision & Perception** — Analyse visuelle avec webcam
- 🎯 **13 Modules Cognitifs** — Chacun spécialisé dans une fonction
- 🔒 **100% Privé** — Tout fonctionne localement, aucun cloud requis
- ⚡ **Ultra-Rapide** — Démarrage < 1 seconde, réponses streaming

### Qui peut l'utiliser ?

TITANE∞ est conçu pour :
- **Développeurs** — Assist- ance technique, revue de code, architecture
- **Créatifs** — Brainstorming, génération d'idées, écriture
- **Gestionnaires** — Planification, organisation, prise de décision
- **Étudiants** — Apprentissage personnalisé, tutoring
- **Chercheurs** — Analyse de données, synthèse, exploration

---

## 🚀 INSTALLATION & DÉMARRAGE

### Prérequis

- **OS:** Linux (x86-64), macOS, Windows
- **RAM:** 4GB minimum (8GB recommandé)
- **Espace:** 500MB pour l'installation
- **Internet:** Optionnel (pour providers cloud)

### Installation

#### 1. Télécharger TITANE

```bash
# Linux (AppImage)
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.0/Titan-Stable_27.0.0_amd64.AppImage
chmod +x Titan-Stable_27.0.0_amd64.AppImage
./Titan-Stable_27.0.0_amd64.AppImage

# Ou via package manager (si disponible)
sudo apt install titane-infinity
```

#### 2. Configuration Initiale

Au premier lancement, TITANE vous guidera à travers :
- ✅ Acceptation des conditions d'utilisation
- ✅ Configuration du profil utilisateur
- ✅ Sélection du provider IA (Ollama / Gemini / Local)
- ✅ Initialisation de la mémoire

### Démarrage

**Lancement rapide:**
```bash
./Titan-Stable_27.0.0_amd64.AppImage
```

**Avec options:**
```bash
./Titan-Stable_27.0.0_amd64.AppImage --dev        # Mode développement
./Titan-Stable_27.0.0_amd64.AppImage --offline    # Mode hors ligne
./Titan-Stable_27.0.0_amd64.AppImage --memory     # Charger mémoire
```

**Temps de démarrage:** ~585ms (ultra-rapide)

---

## 🖥️ INTERFACE PRINCIPALE

### Layout Général

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 TITANE∞ — Chat IA Cognitif                    [_ □ ✕] │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   SIDEBAR    │          CHAT PRINCIPAL                     │
│              │                                              │
│ 📱 Pages     │  Messages conversationnels                  │
│ 💬 Chat      │  (streaming en temps réel)                 │
│ 🎨 Vision    │                                              │
│ 📊 EVO       │                                              │
│ ⚙️ Settings  │                                              │
│              │                                              │
├──────────────┴──────────────────────────────────────────────┤
│ Input: Écrivez votre message... | 🎤 🎨 📎 ▶️            │
└──────────────────────────────────────────────────────────────┘
```

### Sections Principales

#### 1. **Barre Latérale (Sidebar)**

**Pages:**
- 🏠 **Home** — Accueil avec suggestions rapides
- 💬 **Chat** — Interface de conversation (page principale)
- 🎨 **Vision** — Analyse visuelle (webcam)
- 📊 **EVO** — Dashboard + Identity + Memory + Progression
- ⚙️ **Settings** — Paramètres et configuration

**Navigation:**
- Cliquez sur une section pour accéder à la page
- Icônes pour accès rapide
- Badges de notification

#### 2. **Zone de Chat**

**Affichage des messages:**
- 🔵 **Vos messages** — Alignés à droite, couleur bleue
- 🟢 **Messages TITANE** — Alignés à gauche, couleur verte
- ⏳ **Indicateur de frappe** — Trois points animés pendant traitement
- 📎 **Attachements** — Fichiers jointes visibles

**Contrôles:**
- 🔄 **Rafraîchir** — Régénérer dernière réponse
- ✏️ **Modifier** — Éditer message
- 🗑️ **Supprimer** — Effacer message
- 📋 **Copier** — Copier texte
- ⬇️ **Télécharger** — Exporter conversation

#### 3. **Barre d'Entrée**

```
Input: [________________________________________] 🎤 🎨 📎 ▶️

🎤 — Dictée vocale (si TTS activé)
🎨 — Capture d'écran
📎 — Joindre fichier
▶️ — Envoyer message
```

---

## 💬 CHAT IA — SYSTÈME CONVERSATIONNEL

### Démarrer une Conversation

💡 **Nouveaux utilisateurs ?** Consultez le [Tutoriel #1 : Première Conversation](./TUTORIELS_PRACTIQUES_EXEMPLES_v27.0.0.md#tuto-1-première-conversation-3-min) pour un guide pas-à-pas.

#### Méthode 1 : Texte Simple

1. Cliquez dans la zone d'entrée
2. Tapez votre question/message
3. Appuyez sur `Enter` ou cliquez ▶️

**Exemple:**
```
Vous: "Explique-moi la différence entre async/await et les callbacks en JavaScript"

TITANE: "Excellente question. Voici les différences clés...
[Réponse détaillée avec code examples]"
```

#### Méthode 2 : Commandes Vocales

Si TTS (Text-to-Speech) est activé:
1. Cliquez le bouton 🎤
2. Parlez (le micro écoutera)
3. TITANE génère la réponse vocale

#### Méthode 3 : Fichiers

1. Cliquez 📎 (joindre)
2. Sélectionnez un fichier (code, document, PDF, image)
3. TITANE analyse le fichier dans sa réponse

**Formats supportés:**
- Code: `.js`, `.ts`, `.py`, `.rust`, `.cpp`, `.md`
- Documents: `.pdf`, `.txt`, `.docx`
- Images: `.png`, `.jpg`, `.gif`
- Données: `.json`, `.csv`, `.xml`

#### Méthode 4 : Capture d'Écran

1. Cliquez 🎨
2. Sélectionnez la zone à capturer
3. TITANE analyse l'image

### Moderation du Chat

#### Suggestions Rapides

La première ligne affiche des suggestions :
```
💬 Poser une question | 🧠 Demander une explication | 🎯 Explorer un sujet
```

Cliquez pour utiliser rapidement.

#### Historique

- Votre conversation est **persistante** (sauvegardée)
- Accessible via le bouton 📜 **History**
- Classé par date/semaine/mois

#### Recherche

- Cliquez 🔍 pour chercher dans l'historique
- Cherchez par sujet, date, keywords

### Commandes Spéciales

TITANE reconnait des commandes :

```
/reset        → Réinitialiser conversation
/mode [nom]   → Changer mode (chat, code, creative, etc.)
/memory       → Afficher mémoire active
/status       → État du système
/help         → Aide
```

---

## 🎭 MODES DE CONVERSATION

TITANE propose **12+ modes conversationnels** optimisés pour différents contextes.

### Vue d'Ensemble des Modes

| Mode | Icône | Description | Usage |
|------|-------|-------------|-------|
| **Chat** | 💬 | Conversation équilibrée | Discussion générale |
| **Code** | 💻 | Analyse & génération code | Dev, debugging |
| **Brainstorming** | 🧠 | Exploration créative | Idées, innovation |
| **Coach** | 🎯 | Accompagnement personnel | Développement perso |
| **Analyst** | 📊 | Analyse profonde | Synthèse, rapports |
| **Creator** | 🎨 | Contenu créatif | Écriture, storytelling |
| **Teacher** | 👨‍🏫 | Explication pédagogique | Apprentissage |
| **DevOps** | ⚙️ | Système & infrastructure | Ops, deploy |
| **Security** | 🔒 | Audit & sécurité | Pénétration test, audit |
| **Research** | 🔬 | Investigation scientifique | Recherche, analyse |

### Utiliser un Mode

#### Méthode 1 : Menu Dropdown

1. Regardez la barre supérieure du chat
2. Cliquez le dropdown **Mode de conversation**
3. Sélectionnez le mode désiré

#### Méthode 2 : Commande

```
/mode brainstorming
/mode code
/mode coach
```

#### Méthode 3 : Sélecteur Visual

Des boutons visuels affichent les modes rapides (icônes en haut du chat).

### Mode Chat (Par défaut)

**Caractéristiques:**
- Conversation naturelle et équilibrée
- Température: 0.7 (modérée)
- Contexte: Mémoire complète activée
- Suggère les prochaines actions

**Utilisation:**
```
Vous: "Quel est ton avis sur le Rust vs C++ ?"

TITANE: "Les deux ont des forces:
• Rust: Sécurité mémoire, concurrence sûre
• C++: Performance brute, écosystème mature
Selon tes besoins..."
```

### Mode Code

**Caractéristiques:**
- Optimisé pour programmation
- Coloration syntaxe automatique
- Suggestions de refactoring
- Explications techniques

**Utilisation:**
```
Vous: "Explique cette boucle récursive"

TITANE: [Affiche analyse avec coloration syntaxe]
// Code
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}

Complexité: O(2^n) ❌ À optimiser...
```

### Mode Brainstorming

**Caractéristiques:**
- Divergence créative (sans jugement)
- Génère variantes et perspectives
- Température élevée (0.9)
- Encourage l'exploration

**Utilisation:**
```
Vous: "Comment créer une app de productivité révolutionnaire ?"

TITANE: "Voici 20 angles d'attaque :
1. Gamification extrême
2. IA prédictive
3. Réalité augmentée
4. Voice-first interface
[Développe chaque angle...]"
```

### Mode Coach

**Caractéristiques:**
- Accompagnement personnel
- Questions puissantes (Socratique)
- Motivation et célébration
- Exercices pratiques

**Utilisation:**
```
Vous: "Je veux progresser en leadership"

TITANE: "Super ! Quelques questions puissantes:
1. Qu'est-ce qui t'inspire dans un leader?
2. Quel serait ton premier petit pas?
3. Qui peux-tu observer cette semaine?

Exercice: Fais une lise de 5 leaders..."
```

### Mode Analyst

**Caractéristiques:**
- Analyse profonde et synthèse
- Structures données complexes
- Rapports détaillés
- Insights actionnables

**Utilisation:**
```
Vous: "Analyse ces 3 stratégies de croissance"

TITANE: [Tableau comparatif]
Strategy | Revenue | Risk | Timeline
---------|---------|------|----------
Option A | 2x      | High | 6 months
Option B | 1.5x    | Low  | 12 months
Option C | 3x      | Very | 18 months
         |         | High |

Recommandation: Option B pour risque minimal...
```

---

## 🧠 SYSTÈME DE MÉMOIRE

TITANE possède une **mémoire triple** unique :

### 1. Mémoire Court Terme (STM)

**Caractéristiques:**
- Durée: Session actuelle (~24h)
- Contenance: ~20 messages récents
- Vitesse: Ultra-rapide
- Utilité: Contexte immédiat

**Affichage:**
- Visible dans le chat courant
- Aucune action nécessaire

**Exemple:**
```
Vous: "Je m'appelle Alice, je suis développeuse"
[La STM enregistre: "Alice, Dev"]

(Plus tard dans la session)
Vous: "Suggère des projets pour moi"

TITANE: "Pour Alice, développeuse voici 5 projets..."
[La STM est utilisée automatiquement]
```

### 2. Mémoire Moyen Terme (MTM)

**Caractéristiques:**
- Durée: ~1 mois
- Contenance: Patterns & thèmes
- Vitesse: Rapide
- Utilité: Apprentissage contextuel

**Affichage:**
- Section "MTM Active" dans EVO
- Montre les patterns détectés
- Affiche la cohérence (0-100%)

**Exemple:**
```
Pattern MTM détecté: "Alice intéressée par DevOps"
Basé sur: 15 conversations en 2 semaines

TITANE: "Comme tu explores DevOps, voici..."
```

### 3. Mémoire Long Terme (LTM)

**Caractéristiques:**
- Durée: Indéfinie (persistante)
- Contenance: Faits permanents, acquis
- Vitesse: Requête + recherche
- Utilité: Connaissance structurée

**Affichage:**
- Section "Knowledge Vault" dans EVO
- Recherche avec 🔍
- Éditable manuellement

**Exemple:**
```
LTM: "Alice — Développeuse front-end, 5 ans XP, aime React"

Cette info persiste et s'accumule.
```

### Gestion de la Mémoire

#### Consulter la Mémoire

1. Allez à **EVO** (📊)
2. Cliquez **Memory**
3. Voir les 3 niveaux

#### Éditer la Mémoire

**LTM (Éditable):**
1. **EVO** → **Memory** → **Long Term**
2. Cliquez une entrée
3. Modifiez/supprimez

**Exemple:**
```
Avant: "Alice — Dev front-end React"
Après: "Alice — Dev full-stack React + Node.js, intéressée par DevOps"
```

#### Exporter/Importer Mémoire

```bash
# Exporter
Clic droit → Export Memory → memory_alice_2025.json

# Importer (après réinstall)
Settings → Memory → Import File
```

#### Forcer Rafraîchissement

```
/memory reset
/memory analyze
```

### Cohérence Mémoire

TITANE vérifie que les 3 niveaux sont cohérents:

```
STM: "Alice aime React"
MTM: "Pattern: intérêt React détecté"
LTM: "Alice — React developer"

✅ COHÉRENT — Parfait!
```

Si incohérence: ⚠️ TITANE propose correction.

---

## 👁️ VISION & PERCEPTION

TITANE peut analyser visuellement le monde via votre webcam.

### Activation

1. Allez à **Vision** (🎨)
2. Cliquez **Activer Caméra**
3. Autorisez l'accès webcam

### Utilisation

#### Capture d'Écran

```
Vision Page → Cliquez "Capture"
→ Sélectionnez zone (par drag)
→ TITANE analyse et commente
```

**Exemple:**
```
[Capture d'un dashboard]

TITANE: "Je vois un dashboard de ventes.
Métriques: 3 chiffres principaux
• Ventes: 250K ↑ 12%
• Clients: 1500 ↑ 8%
• ROI: 3.2x stable

Analyse: Croissance saine, ROI excellente"
```

#### Streaming Vidéo

```
Vision Page → Cliquez "Stream"
→ Vidéo en direct affichée
→ TITANE commente en temps réel
```

**Exemple:**
```
[Webcam capture la salle]

TITANE: "Je vois:
• 1 personne assise
• Luminosité: bonne
• Ambiance: calme"
```

#### Analyse Affective

TITANE détecte votre **état émotionnel** (optionnel):

```
[Vidéo de votre visage]

TITANE: "État détecté:
• Concentration: 75%
• Énergie: 60%
• Stress: 20%

Suggestion: Pause de 5 min"
```

### Paramètres Vision

**Settings → Vision:**

```
✅ Activation: Activé
✅ Streaming: Oui
✅ Capture: Oui
✅ Analyse Affective: Oui
✅ Auto-Detect Stress: Oui
   Seuil alerte: 70%
✅ Enregistrement: Non (pour privacy)
```

---

## 🧮 MODULES COGNITIFS

TITANE contient **13 modules cognitifs** spécialisés.

### 1. HeliosCore — Centre Intellectuel

**Fonction:** Traitement de l'information

**Capacités:**
- Analyse logique
- Synthèse
- Critique
- Découpe problèmes complexes

**Affichage:**
- Visible quand TITANE "réfléchit"
- Indicateur: 🧠 + spinner

**Usage:**
```
Vous: "Quelle est la meilleure architecture pour un app de streaming ?"

TITANE: [HeliosCore active]
✅ Analyse les constraints
✅ Synthétise options
✅ Critique chaque approche
→ Recommande: Architecture scalable X..."
```

### 2. NexusCore — Intégration

**Fonction:** Connecter concepts

**Capacités:**
- Créer liens
- Pattern matching
- Cross-domaines insights

**Affichage:**
- Graph de connexions
- Accessible via **EVO** → **Nexus**

### 3. HarmoniaCore — Équilibre

**Fonction:** Résoudre tensions

**Capacités:**
- Equilibrer trade-offs
- Trouver middle ground
- Médiation

**Usage:**
```
Vous: "Comment équilibrer vitesse vs sécurité ?"

TITANE: [HarmoniaCore pèse les 2 côtés]
→ Propose layer-based approach..."
```

### 4. MemoryCore — Persistance

**Fonction:** Gérer les 3 mémoires

**Détails:** Voir section [Système de Mémoire](#système-de-mémoire)

### 5. EvolutionCore — Apprentissage

**Fonction:** S'améliorer continuellement

**Capacités:**
- Détecte patterns
- Apprend de l'interaction
- Améliore réponses futures

**Affichage:**
- **EVO** → **Evolution**
- Montre l'apprentissage

### 6. SentinelCore — Vigilance

**Fonction:** Sécurité & monitoring

**Capacités:**
- Détecte problèmes
- Prévient erreurs
- Auto-diagnostic

### 7-13. Autres Modules

- **AnalysisCore** — Breakdown profond
- **IntegrationCore** — Unification données
- **PreventionCore** — Prévention erreurs
- **IntentionCore** — Détecte intentions
- **EmotionCore** — Calibrage émotionnel
- **AdaptationCore** — S'adapte au contexte
- **CoherenceCore** — Cohérence globale

### Affichage des Modules

**EVO → Cores:**
```
┌─ COGNITIVE CORES ─────────────────┐
│                                    │
│ ✅ HeliosCore    [■■■■■ 95%]     │ Actif
│ ✅ NexusCore     [■■■■ 88%]      │ Actif
│ ⚠️ HarmoniaCore  [■■■ 65%]       │ À calibrer
│ ✅ MemoryCore    [■■■■■ 100%]    │ Optimal
│ ✅ EvolutionCore [■■■■ 80%]      │ Actif
│ ✅ SentinelCore  [■■■■■ 97%]     │ Vigilant
│                                    │
└────────────────────────────────────┘
```

### Calibrage Manuel

Si un core est dégradé (ex: HarmoniaCore à 65%):

```
EVO → Cores → HarmoniaCore → Cliquez "Calibrate"
→ Réalign automatique
→ Retour à l'optimal (80-100%)
```

---

## 📈 PROGRESSION & XP

TITANE tracks votre **progression** dans 3 domaines.

### Les 3 Domaines

#### 1. Cognitive XP 🧠
**Mesure:** Votre croissance intellectuelle
- Gagnée par: Conversations complexes, learning
- Bonus: Mode Analyst, mode Teacher
- Niveau max: 100 (puis reset avec bonus)

**Exemple:**
```
Vous: [Demandez une analyse technique profonde]
→ +50 Cognitive XP
→ Niveau 23/100 (45%)

Progression: [████░░░░░░░░░░░░]
```

#### 2. Social XP 👥
**Mesure:** Votre capacité collaborative
- Gagnée par: Brainstorming, discussions équilibrées
- Bonus: Mode Coach, partage mémoire
- Niveau max: 100

**Exemple:**
```
Vous: [Brainstormez idées ensemble]
→ +30 Social XP
```

#### 3. Tool Mastery XP 🛠️
**Mesure:** Maîtrise de TITANE
- Gagnée par: Utiliser features, modes, APIs
- Bonus: Code mode, file uploads
- Niveau max: 100

### Affichage Progression

**Page EVO:**
```
┌─ PROGRESSION ─────────────────────┐
│                                    │
│ COGNITIVE XP                       │
│ Niveau: 23 / 100                  │
│ [████░░░░░░░░░░░░] 45%            │
│ Points: 2,340 / 5,000             │
│                                    │
│ SOCIAL XP                          │
│ Niveau: 15 / 100                  │
│ [███░░░░░░░░░░░░░░] 30%           │
│ Points: 1,520 / 5,000             │
│                                    │
│ TOOL MASTERY XP                    │
│ Niveau: 31 / 100                  │
│ [██████░░░░░░░░░░] 62%            │
│ Points: 3,100 / 5,000             │
│                                    │
└────────────────────────────────────┘
```

### Débloquer Achievements

Chaque XP milestone débloque un badge/achievement:

```
🏆 "First Chat" — Débloquer: 1ère conversation
🏆 "Code Wizard" — Débloquer: 10 chats mode Code
🏆 "Brainstorm Master" — Débloquer: 100 idées générées
🏆 "Memory Keeper" — Débloquer: 1000 items en LTM
```

**Affichage:**
**EVO → Achievements → Voir tous les badges**

### Boosts XP

Certaines actions **doublent** l'XP reçu:

```
✨ Utilisez 3+ modes différents → 2x XP
✨ Conversation >10 messages → 1.5x XP
✨ Uploaddez fichier → 1.5x XP
✨ Utilisez commande vocale → 2x XP
✨ Référez un ami → 5x XP (bonus)
```

---

## ⚙️ PARAMÈTRES & CONFIGURATION

### Accéder aux Settings

**Menu:** Sidebar → ⚙️ **Settings**

Ou: `Ctrl+,` (raccourci clavier)

### Sections Principales

#### 1. Profil

**Affichage:**
```
┌─ PROFIL ──────────────────────┐
│                                │
│ Nom: Alice Dubois             │
│ Email: alice@example.com      │
│ Rôle: Développeuse            │
│ Langue: Français              │
│ Timezone: Europe/Paris        │
│                                │
│ [Éditer Profil] [Photo]       │
│                                │
└────────────────────────────────┘
```

**Modification:**
1. Cliquez [Éditer Profil]
2. Changez informations
3. Cliquez [Sauvegarder]

#### 2. Providers IA

💡 **Configuration initiale:** Consultez le [Guide : Setup Providers IA](./GUIDE_INSTALLATION_SETUP_v27.0.0.md#setup-providers-ia) pour configurer Ollama, Gemini ou d'autres providers.

**Configuration:**
```
┌─ PROVIDERS IA ───────────────────┐
│                                   │
│ Provider Défaut: Ollama           │
│                                   │
│ ✅ Ollama (local)                │
│    • URL: http://localhost:11434 │
│    • Modèle: llama2:latest      │
│    • Status: ✅ Connecté         │
│                                   │
│ ✅ Gemini API                    │
│    • API Key: ***[Masqué]***    │
│    • Status: ✅ Valide           │
│                                   │
│ ✅ Local Provider (Fallback)     │
│    • Always Available            │
│    • Status: ✅ Optimal          │
│                                   │
└───────────────────────────────────┘
```

**Ajouter un Provider:**
1. Settings → Providers
2. Cliquez [+ Ajouter]
3. Choisissez le type (Gemini, OpenAI, Ollama)
4. Entrez les credentials
5. Test connexion
6. [Sauvegarder]

**Exemple (Ollama):**
```
1. Installer Ollama (ollama.com)
2. Lancer: ollama serve
3. Settings → + Ajouter → Ollama
4. URL: http://localhost:11434
5. Modèle: llama2:latest
6. [Tester] ✅ Connecté
```

#### 3. Mémoire

**Configuration:**
```
┌─ MÉMOIRE ──────────────────────┐
│                                 │
│ STM (Court Terme)              │
│ • Taille: 20 messages          │
│ • Durée: 24 heures            │
│ • Status: ✅ Actif             │
│                                 │
│ MTM (Moyen Terme)              │
│ • Durée: 30 jours             │
│ • Pattern Detection: ✅        │
│ • Cohérence: 92%              │
│                                 │
│ LTM (Long Terme)               │
│ • Items: 1,234                 │
│ • Encryption: AES-256-GCM ✅  │
│ • Auto-Backup: ✅ Quotidien   │
│                                 │
│ [Export Mémoire] [Import]     │
│                                 │
└─────────────────────────────────┘
```

**Actions:**
- **Réinitialiser STM:** [Effacer] → Confirmer
- **Export LTM:** [Export] → Fichier `.json`
- **Import LTM:** [Import] → Sélectionner fichier

#### 4. Chat

**Configuration:**
```
┌─ CHAT ──────────────────────────┐
│                                  │
│ Température: 0.7                │
│ [_____●________] 0.1 ← 1.0     │
│ Description: Équilibrée         │
│                                  │
│ Max Tokens: 3000                │
│ [_________●____]100 ← 8000      │
│                                  │
│ Historique Visible: ✅          │
│ Auto-Save: ✅ Chaque message   │
│ Markdown: ✅                    │
│ Code Highlighting: ✅           │
│                                  │
│ [Paramètres Avancés]           │
│                                  │
└──────────────────────────────────┘
```

**Température expliquée:**
- **0.1** = Très déterministe, réponses strictes
- **0.7** = Équilibré (défaut) ← Recommandé
- **1.0** = Très créatif, réponses variées

#### 5. Vision

**Configuration:**
```
┌─ VISION ──────────────────────┐
│                                │
│ Caméra: ✅ Activée            │
│ Résolution: 1920x1080         │
│                                │
│ Analyse Affective: ✅         │
│ Stress Détection: ✅          │
│ Alert Threshold: 70%          │
│                                │
│ Enregistrement Vidéo: ❌      │
│ (Pour votre privacy)          │
│                                │
│ [Tester Caméra]               │
│                                │
└────────────────────────────────┘
```

#### 6. Sécurité

**Configuration:**
```
┌─ SÉCURITÉ ──────────────────┐
│                              │
│ Encryption: AES-256 ✅      │
│ Password: ••••••••          │
│ [Changer]                   │
│                              │
│ Two-Factor Auth: ❌         │
│ [Activer]                   │
│                              │
│ Whitelist IP: ❌            │
│ [Ajouter IPs]               │
│                              │
│ Session Timeout: 30 min     │
│ [_______●_____]             │
│                              │
│ [Paramètres Avancés]        │
│                              │
└──────────────────────────────┘
```

#### 7. Notifications

**Configuration:**
```
┌─ NOTIFICATIONS ──────────────┐
│                               │
│ ✅ Desktop Alerts            │
│ ✅ Sound: On                 │
│ ✅ Chat Messages            │
│ ✅ Achievements             │
│ ✅ Memory Updates           │
│ ❌ Email Notifications      │
│ ❌ Daily Summary            │
│                               │
│ [Par-défaut] [Silencieux]    │
│                               │
└────────────────────────────────┘
```

#### 8. Apparence

**Configuration:**
```
┌─ APPARENCE ───────────────────┐
│                                │
│ Thème: 🌙 Dark (défaut)       │
│ ☀️ Light | 🌙 Dark           │
│                                │
│ Font Size: 14px               │
│ [_____●_____] 12px ← 18px   │
│                                │
│ Accent Color: 🔵 Bleu        │
│ [Couleur Picker]              │
│                                │
│ Compact Mode: ❌              │
│ [Réduire spacing]             │
│                                │
└────────────────────────────────┘
```

#### 9. Raccourcis Clavier

**Configuration:**
```
┌─ RACCOURCIS ──────────────────┐
│                                │
│ Ctrl+Enter    Send Message     │
│ Ctrl+/        Commandes        │
│ Ctrl+,        Settings         │
│ Ctrl+K        Recherche        │
│ Cmd+Backspace Supprimer conv   │
│                                │
│ [Personnaliser]               │
│                                │
└────────────────────────────────┘
```

---

## 🐛 DÉPANNAGE & SUPPORT

💡 **Problèmes d'installation ?** Consultez la section [Troubleshooting Installation](./GUIDE_INSTALLATION_SETUP_v27.0.0.md#troubleshooting-installation) du guide d'installation.

### Problèmes Courants

#### "TITANE ne démarre pas"

**Solution 1 — Vérifier la RAM:**
```bash
free -h  # Linux/Mac
tasklist | find "memory"  # Windows
```

**Solution 2 — Logs:**
```bash
tail -f ~/.titane/logs/app.log
# Cherchez ERROR ou PANIC
```

**Solution 3 — Réinitialiser:**
```bash
rm -rf ~/.titane/cache
./Titan-Stable_27.0.0_amd64.AppImage --reset
```

#### "Chat très lent"

**Causes possibles:**
- Provider IA surchargé
- Connexion internet lente
- Model IA trop gros

**Solutions:**
1. Settings → Providers → Vérifier status
2. Réduire Token Max: 2000 au lieu de 3000
3. Changer provider (ex: Ollama au lieu de Gemini)

#### "Mémoire corrompue"

**Symptômes:**
- Messages dupliqués
- Oublie informations
- Incohérence détectée

**Solution:**
```
Settings → Memory → [Export Mémoire]
(sauvegarder backup)

Settings → Memory → STM [Effacer]
Settings → Memory → [Réanalyser]

# Redémarrer TITANE
```

#### "Caméra ne fonctionne pas"

**Vérifiez permissions:**
```bash
# Linux
sudo chmod 666 /dev/video0

# Mac
System Preferences → Security & Privacy → Camera
```

**Test:**
```
Settings → Vision → [Tester Caméra]
```

### Support & Aide

#### Commandes d'Aide

```
/help               → Afficher aide générale
/help [sujet]       → Aide sur sujet spécifique
/status             → État du système
/diagnostics        → Rapport diagnostic
```

**Exemple:**
```
Vous: /help memory
TITANE: "Commandes mémoire:
/memory → Afficher mémoire
/memory reset → Réinitialiser STM
..."
```

#### Contact Support

**Pour des problèmes:**
1. Collectez les logs:
   ```
   TITANE: /export logs
   ```

2. Décrivez le problème

3. Contactez: support@titane.dev

#### Rapporter des Bugs

```bash
# Générer rapport bug
/bug report

# Attaché automatiquement:
- Logs des 2 dernières heures
- Config système
- Trace stack complet
```

### Analyse Logs Avancée

Pour les utilisateurs avancés et développeurs, voici comment diagnostiquer les problèmes en profondeur.

#### Patterns d'Erreurs Communs

**1. Provider IA Inaccessible**
```bash
# Chercher erreurs provider dans les logs
grep -i "provider.*error\|connection.*refused" ~/.titane/logs/app.log | tail -20

# Patterns typiques:
# ERROR Provider 'ollama' connection refused at http://localhost:11434
# ERROR Gemini API key invalid or rate limit exceeded
```

**Solutions:**
- Ollama: Vérifier service `systemctl status ollama` ou `ollama serve`
- Gemini: Valider API key dans Settings → Providers
- Fallback: TITANE basculera automatiquement vers provider suivant

**2. Crash Mémoire (Out of Memory)**
```bash
# Chercher allocations mémoire excessives
grep -E "memory.*exceeded|allocation.*failed|OOM" ~/.titane/logs/app.log

# Patterns typiques:
# CRITICAL Memory allocation failed: requested 512MB, available 128MB
# ERROR LTM database size exceeded limit: 500MB/500MB
```

**Solutions:**
```bash
# Nettoyer cache
rm -rf ~/.titane/cache/*

# Vérifier taille mémoire
du -sh ~/.titane/memory/

# Exporter et purger LTM si trop volumineuse
TITANE: /memory export
TITANE: /memory clean --older-than 90d
```

**3. Corruption Base de Données**
```bash
# Détecter corruption SQLite
grep -i "database.*corrupt\|malformed\|integrity" ~/.titane/logs/app.log

# Vérifier intégrité manuellement
sqlite3 ~/.titane/memory/ltm.db "PRAGMA integrity_check;"
```

**Solutions:**
```bash
# Backup préventif
cp ~/.titane/memory/ltm.db ~/.titane/memory/ltm.db.backup

# Repair automatique (si supporté)
sqlite3 ~/.titane/memory/ltm.db "REINDEX;"
sqlite3 ~/.titane/memory/ltm.db "VACUUM;"

# Dernière option: Restaurer backup
cp ~/.titane/memory/backups/ltm_YYYYMMDD.db ~/.titane/memory/ltm.db
```

**4. GPU Non Utilisé (Ollama)**
```bash
# Vérifier utilisation GPU dans logs Ollama
journalctl -u ollama -n 100 | grep -i "gpu\|cuda\|rocm"

# Patterns typiques:
# INFO Using GPU: NVIDIA GeForce RTX 3080
# WARN No GPU detected, using CPU fallback
```

**Solutions:**
```bash
# NVIDIA: Vérifier drivers
nvidia-smi
# Doit montrer GPU + CUDA version

# AMD: Vérifier ROCm
rocm-smi

# Réinstaller Ollama si GPU non détecté
curl -fsSL https://ollama.com/install.sh | sh
```

**5. Fichiers de Configuration Invalides**
```bash
# Chercher erreurs parsing JSON/TOML
grep -i "parse.*error\|invalid.*config\|syntax.*error" ~/.titane/logs/app.log

# Patterns typiques:
# ERROR Failed to parse config: unexpected token at line 42
# ERROR Invalid JSON in providers.json: missing comma at line 18
```

**Solutions:**
```bash
# Valider JSON
cat ~/.titane/config/providers.json | jq .
# Si erreur, jq indiquera ligne exacte

# Restaurer config par défaut
rm ~/.titane/config/providers.json
# TITANE régénérera config au prochain lancement
```

#### Commandes Diagnostiques Utiles

**Extraire Logs Par Niveau**
```bash
# Seulement erreurs critiques
grep "CRITICAL\|FATAL" ~/.titane/logs/app.log | tail -50

# Warnings dernières 24h
find ~/.titane/logs -name "*.log" -mtime -1 -exec grep "WARN" {} \; | tail -100

# Tout depuis date spécifique
awk '/2026-01-31 14:00/,0' ~/.titane/logs/app.log
```

**Analyser Performance**
```bash
# Temps de réponse moyen des providers
grep "response_time" ~/.titane/logs/app.log | \
  awk '{sum+=$NF; count++} END {print "Average:", sum/count "ms"}'

# Identifier requêtes lentes (>5000ms)
grep "response_time" ~/.titane/logs/app.log | \
  awk '$NF > 5000 {print $0}'

# Top 10 commandes API les plus utilisées
grep "invoke(" ~/.titane/logs/app.log | \
  awk -F"'" '{print $2}' | \
  sort | uniq -c | sort -rn | head -10
```

**Workflow Diagnostic Complet**
```bash
#!/bin/bash
# Script: diagnose_titane.sh
# Usage: ./diagnose_titane.sh

echo "=== TITANE∞ Diagnostic Report ==="
echo "Generated: $(date)"
echo ""

echo "## 1. System Info"
echo "OS: $(uname -a)"
echo "RAM: $(free -h | grep Mem: | awk '{print $2}')"
echo "Disk: $(df -h ~/.titane | tail -1 | awk '{print $4 " free"}')"
echo ""

echo "## 2. Process Status"
ps aux | grep -i titane | grep -v grep
echo ""

echo "## 3. Recent Errors (Last 50)"
grep -E "ERROR|CRITICAL|FATAL" ~/.titane/logs/app.log | tail -50
echo ""

echo "## 4. Memory Usage"
du -sh ~/.titane/memory/*
echo ""

echo "## 5. Provider Status"
grep "provider.*connected\|provider.*failed" ~/.titane/logs/app.log | tail -10
echo ""

echo "=== End of Report ==="
```

#### Workflow: Symptôme → Root Cause → Solution

**Étape 1: Reproduire le problème**
- Notez étapes exactes menant au bug
- Timestamp approximatif de l'incident
- Comportement attendu vs observé

**Étape 2: Collecter contexte**
```bash
# Logs autour du timestamp
grep -C 20 "2026-01-31 14:35" ~/.titane/logs/app.log > debug.log

# État système au moment du bug
ps aux > system_state.txt
free -m >> system_state.txt
df -h >> system_state.txt
```

**Étape 3: Identifier Root Cause**
- Rechercher pattern d'erreur dans logs
- Comparer avec patterns communs ci-dessus
- Vérifier corrélations (ex: erreur après action spécifique)

**Étape 4: Appliquer solution**
- Tester solution sur environnement de test si possible
- Documenter changement effectué
- Valider résolution

**Étape 5: Prévention**
- Ajouter monitoring si problème récurrent
- Mettre à jour configuration pour éviter répétition
- Partager solution avec communauté

#### Ressources Supplémentaires

**Logs Disponibles:**
- `~/.titane/logs/app.log` - Logs application principale
- `~/.titane/logs/tauri.log` - Logs backend Rust/Tauri
- `~/.titane/logs/providers.log` - Logs providers IA
- `~/.titane/logs/memory.log` - Logs système mémoire

**Outils Recommandés:**
- `jq` - Parser/valider JSON
- `sqlite3` - Inspecter bases de données
- `htop` - Monitoring ressources temps réel
- `strace` - Tracer syscalls (debug profond)

---

## ❓ FAQ

### Questions Générales

**Q: TITANE fonctionne-t-il hors ligne?**
A: Oui! Mode offline disponible. Utilisez le provider Local (builtin). Certaines features (Gemini API) nécessitent internet.

**Q: Est-ce que mes données sont privées?**
A: 100% privé! Tout fonctionne localement. Aucune donnée n'est envoyée au cloud, même pas les conversations.

**Q: Puis-je utiliser TITANE sur plusieurs appareils?**
A: Actuellement: non. Chaque installation est indépendante. Vous pouvez exporter/importer la mémoire.

**Q: Quelle est la meilleure configuration?**
A: **Linux + 8GB RAM + Ollama local** pour performance optimale.

### Chat & Conversation

**Q: Comment changer le provider IA?**
A: Settings → Providers IA → Sélectionner défaut. Ou: `/mode [nom]`

**Q: Peut-on utiliser plusieurs modèles?**
A: Oui! TITANE bascule automatiquement si un provider échoue (fallback).

**Q: Comment optimiser les réponses?**
A: Utilisez un mode approprié (ex: Mode Code pour code), incluez contexte, joignez fichiers si pertinent.

### Mémoire

**Q: Combien de messages peut mémoriser TITANE?**
A: STM: 20 récents. MTM: patterns détectés (~30j). LTM: Illimité (tant qu'espace disque).

**Q: Comment purger la mémoire?**
A: Settings → Memory → Sélectionner niveau → [Effacer]

### Vision

**Q: TITANE enregistre-t-il la vidéo?**
A: Non, jamais. L'enregistrement est désactivé par défaut. Vous êtes 100% privé.

**Q: Comment analyser une image?**
A: Caméra en direct: Vision page → Stream. Capture: Vision page → Capture.

### Progression

**Q: Comment gagner plus d'XP?**
A: Utilisez des modes variés, conversations longues, fichiers joints, commandes vocales.

**Q: Les achievements sont-ils permanents?**
A: Oui! Une fois débloqués, ils sont mémorisés (même après reset).

---

## 🎓 TUTORIELS PRATIQUES

### Tutoriel 1: Votre Premier Chat

**Objectif:** Démarrer une conversation simple

```
1. Lancez TITANE
2. Allez à: Chat (💬)
3. Cliquez la zone d'entrée
4. Tapez: "Bonjour TITANE! Comment fonctionne ton chat?"
5. Appuyez Enter ⏎
6. Attendez la réponse ⏳
7. Continuez la conversation! 👋
```

**Durée:** 2 minutes

### Tutoriel 2: Mode Code pour Developer

**Objectif:** Utiliser TITANE pour développement

```
1. Chat → Dropdown mode → Sélectionner "Code"
2. Posez question technique:
   "Explique async/await en JavaScript"
3. TITANE répond avec code colorisé
4. Cliquez [Copier] pour code
5. Adaptez pour votre projet
```

**Durée:** 5 minutes

### Tutoriel 3: Export Mémoire

**Objectif:** Sauvegarder votre mémoire

```
1. Settings → Memory
2. Cliquez [Export Mémoire]
3. Choisissez fichier destination
4. Attendez export (quelques secondes)
5. Fichier .json sauvegardé!

Voilà! Vous avez backup de votre LTM.
```

**Durée:** 3 minutes

### Tutoriel 4: Brainstorming Session

**Objectif:** Générer idées créatives

```
1. Changez mode: /mode brainstorming
2. Posez problème créatif:
   "Idées pour révolutionner l'éducation?"
3. TITANE génère 20+ angles
4. Explorez chaque idée
5. Notez les meilleures (📝)
6. Développez ultérieurement
```

**Durée:** 15 minutes

---

## 📊 FICHE TECHNIQUE RAPIDE

### Spécifications Système

```
┌─ SPECS ──────────────────────┐
│                               │
│ Langage Frontend: React 18    │
│ Langage Backend: Rust         │
│ Framework: Tauri v2.0         │
│                               │
│ Mémoire Min: 512 MB          │
│ Mémoire Recommandée: 4 GB    │
│ Espace Disque: 500 MB        │
│                               │
│ Build Time: ~5 min           │
│ Startup Time: <1s            │
│ Chat Response: ~2-5s         │
│ (Dépend du modèle IA)        │
│                               │
│ Supported OS:                │
│ • Linux (x86-64)             │
│ • macOS (Intel + Silicon)     │
│ • Windows 10/11              │
│                               │
└───────────────────────────────┘
```

### Raccourcis Clavier (Par défaut)

| Raccourci | Action |
|-----------|--------|
| `Enter` | Envoyer message |
| `Ctrl+Enter` | Envoyer (alt) |
| `Ctrl+,` | Ouvrir Settings |
| `Ctrl+K` | Recherche |
| `Ctrl+/` | Commandes |
| `Ctrl+L` | Clearhistorique |
| `Escape` | Fermer dialog |
| `?` | Afficher aides |

### Commandes Système

| Commande | Effet |
|----------|-------|
| `/help` | Aide générale |
| `/status` | État système |
| `/memory` | Afficher mémoire |
| `/reset` | Réinitialiser chat |
| `/mode [nom]` | Changer mode |
| `/export [type]` | Exporter données |
| `/diagnostics` | Rapport diagnostic |
| `/exit` | Quitter TITANE |

---

## 🎯 CONSEILS AVANCÉS

### Optimiser les Réponses

**Meilleur Input:**
```
"Je développe en React. 
Quels patterns éviter pour optimiser performance?
[Fichier: mon-app.tsx joint]"
```

**Faible Input:**
```
"Optimise mon app"
```

**Différence:** Contexte + détails + fichier = réponse précise

### Chaîner Modes

Utilisez plusieurs modes dans même session:

```
1. Mode Brainstorming: "Génère 10 idées..."
2. Mode Analyst: "Analyse les 3 meilleures..."
3. Mode Code: "Codifie l'implémentation..."
4. Mode Coach: "Quel est le premier pas?"
```

### Utiliser la Mémoire Efficacement

**Bonne pratique:**
```
Session 1: Vous discutez de votre projet
→ LTM enregistre: "Utilisateur travaille sur app mobile"

Session 2 (2 semaines après):
Vous: "Comment continuer?"
TITANE: "Tu travaillais sur app mobile. Où en es-tu?"
→ Continuité magique!
```

### Multi-Provider Failover

TITANE bascule automatiquement:

```
1. Essaie: Ollama (local, rapide)
2. Si échoue: Gemini API (cloud)
3. Si échoue: Local Provider (builtin)
4. Jamais pas de réponse ✅
```

**Avantage:** Résilience garantie!

---

## 📞 SUPPORT & COMMUNAUTÉ

### Ressources

- 📖 **Documentation Complète:** `/docs`
- 🎥 **Vidéos Tutorial:** `youtube.com/@titane`
- 💬 **Discord Community:** `discord.gg/titane`
- 🐛 **Bug Tracker:** `github.com/.../issues`

### Contrib utors Bienvenus

TITANE est open-source!

```bash
# Fork + Clone
git clone https://github.com/[your-fork]/TITANE_INFINITY.git

# Features branch
git checkout -b feature/votre-feature

# Commit + Push + PR
git commit -am "Add: nouvelle feature"
git push origin feature/votre-feature

# Créez une Pull Request! 🎉
```

---

## ⌨️ RACCOURCIS CLAVIER

### Raccourcis Essentiels

| Raccourci | Action | Description |
|-----------|--------|-------------|
| `Ctrl + N` | Nouvelle session | Démarre une nouvelle conversation |
| `Ctrl + M` | Mode audio | Active/désactive le mode vocal |
| `Ctrl + K` | Effacer conversation | Nettoie la conversation courante |
| `Ctrl + ,` | Ouvrir paramètres | Accède aux paramètres |
| `Ctrl + /` | Aide rapide | Affiche l'aide contextuelle |
| `↑` / `↓` | Historique | Navigue dans l'historique des messages |
| `Ctrl + Enter` | Envoyer message | Envoie le message en cours |

### Navigation

| Raccourci | Action | Section |
|-----------|--------|---------|
| `Ctrl + 1` | TITANE (Cœur) | Accède à la page principale |
| `Ctrl + 2` | TIME (Temporel) | Accède à la timeline mémoire |
| `Ctrl + 3` | STATS | Accède aux statistiques |
| `Ctrl + 4` | ADMIN | Accède à l'administration |
| `Ctrl + 5` | DEV | Accède aux outils développeur |
| `Ctrl + B` | Toggle Sidebar | Affiche/cache la barre latérale |
| `Ctrl + Shift + P` | Command Palette | Ouvre la palette de commandes |

### Accessibilité

| Raccourci | Action | Description |
|-----------|--------|-------------|
| `Alt + S` | Skip to Content | Passe au contenu principal |
| `Alt + N` | Skip to Navigation | Passe à la navigation |
| `Ctrl + +` | Zoom In | Agrandit l'interface (+10%) |
| `Ctrl + -` | Zoom Out | Rétrécit l'interface (-10%) |
| `Ctrl + 0` | Reset Zoom | Réinitialise le zoom à 100% |
| `F11` | Plein écran | Active/désactive le mode plein écran |
| `Shift + ?` | Shortcuts Help | Affiche l'aide des raccourcis |

### Fichiers & Données

| Raccourci | Action | Description |
|-----------|--------|-------------|
| `Ctrl + O` | Open File | Ouvre un fichier |
| `Ctrl + S` | Save | Sauvegarde la conversation |
| `Ctrl + Shift + S` | Save As | Sauvegarde sous... |
| `Ctrl + E` | Export | Exporte la conversation |
| `Ctrl + I` | Import | Importe des données |

### Développement

| Raccourci | Action | Description |
|-----------|--------|-------------|
| `Ctrl + Shift + I` | DevTools | Ouvre les outils développeur |
| `Ctrl + Shift + C` | Console | Ouvre la console JavaScript |
| `F12` | Inspect Element | Inspecte un élément |
| `Ctrl + R` | Reload | Recharge l'application |
| `Ctrl + Shift + R` | Hard Reload | Recharge sans cache |

**💡 Astuce:** Appuyez sur `Shift + ?` pour afficher tous les raccourcis disponibles dans l'interface.

---

## 🔧 API & COMMANDES TAURI

### Vue d'Ensemble

💡 **Tutoriel pratique:** Apprenez à utiliser l'API avec le [Tutoriel #7 : API Tauri Commands](./TUTORIELS_PRACTIQUES_EXEMPLES_v27.0.0.md#tuto-7-api-tauri-commands-15-min).

TITANE expose **100+ commandes Tauri** pour l'interaction backend ↔ frontend. Ces commandes permettent le contrôle complet du système.

### Catégories de Commandes

#### 1. Memory API (Mémoire)

```typescript
// Sauvegarder une entrée mémoire
await invoke('memory_save_entry', {
  content: "Mon souvenir important",
  tags: ["personnel", "important"],
  encrypted: true
});

// Charger les entrées mémoire
const entries = await invoke('memory_load_entries', {
  filter: { tags: ["important"] }
});

// Effacer la mémoire (⚠️ DESTRUCTIF)
await invoke('memory_clear', {
  confirm: true
});
```

#### 2. Chat API (Conversation)

```typescript
// Générer avec Gemini
const response = await invoke('chat_generate_gemini', {
  prompt: "Explique-moi la physique quantique",
  temperature: 0.7,
  max_tokens: 2000
});

// Générer avec Ollama (local)
const response = await invoke('chat_generate_ollama', {
  model: "llama2",
  prompt: "Code Python pour un serveur web"
});

// Changer de provider
await invoke('set_active_provider', {
  provider: "gemini" // ou "ollama", "local", "tauri"
});
```

#### 3. System API (Système)

```typescript
// Status système
const status = await invoke('get_system_status');
console.log(status);
// → { cpu: 45, memory: 2048, uptime: 3600, health: "OK" }

// Diagnostics rapides
await invoke('sc_run_quick_diagnostics');

// Diagnostics complets (5 min)
await invoke('sc_run_full_diagnostics');

// Obtenir métriques système
const metrics = await invoke('get_system_metrics');
```

#### 4. Cognitive API (Cognitif)

```typescript
// État cognitif
const state = await invoke('get_cognitive_state');
console.log(state.mode); // → "focused", "creative", etc.

// Changer mode cognitif
await invoke('update_cognitive_mode', { mode: "creative" });

// Cohérence des 3 centres
const coherence = await invoke('get_three_centers_coherence');
console.log(coherence);
// → { mental: 0.85, heart: 0.92, body: 0.78 }

// Recommandations système
const recs = await invoke('get_system_recommendations');
```

#### 5. Auth & Security API (Sécurité)

```typescript
// Configurer clé API (chiffrée)
await invoke('chat_set_gemini_key', {
  key: "votre-cle-api-gemini"
});

// Vérifier status clé
const hasKey = await invoke('get_gemini_key_status');
console.log(hasKey); // → true/false

// Configurer OpenAI
await invoke('chat_set_openai_key', { key: "sk-..." });

// Configurer Anthropic (Claude)
await invoke('chat_set_anthropic_key', { key: "anthropic-..." });
```

#### 6. Voice API (Vocal)

```typescript
// Calibrer empreinte vocale TITANE
await invoke('voice_fingerprint_calibrate_titane', {
  samplesList: [sample1, sample2, sample3, ...]
});

// Vérifier si TITANE parle
const result = await invoke('voice_fingerprint_is_titane_speaking', {
  samples: audioSamples
});
console.log(result);
// → { is_titane: true, similarity: 0.94 }

// Info profil vocal
const profile = await invoke('voice_fingerprint_get_profile_info');
console.log(profile);
// → { sample_count: 8, threshold: 0.85 }
```

#### 7. Logging API (Logs)

```typescript
// Log info
await invoke('log_info', { message: "Opération réussie" });

// Log warning
await invoke('log_warning', { message: "Attention: ressources faibles" });

// Log error
await invoke('log_error', { 
  message: "Erreur critique",
  context: { code: 500, details: "..." }
});

// Obtenir logs récents
const logs = await invoke('get_recent_logs', { count: 50 });
```

### Exemple Complet

```typescript
import { invoke } from '@tauri-apps/api/tauri';

// Workflow complet: Chat avec mémoire
async function chatWithMemory(userMessage: string) {
  try {
    // 1. Sauvegarder le message utilisateur
    await invoke('memory_save_entry', {
      content: userMessage,
      tags: ["user", "chat"],
      encrypted: false
    });

    // 2. Générer réponse IA
    const response = await invoke('chat_generate_gemini', {
      prompt: userMessage,
      temperature: 0.7,
      max_tokens: 1000
    });

    // 3. Sauvegarder la réponse
    await invoke('memory_save_entry', {
      content: response.text,
      tags: ["ai", "chat", "response"],
      encrypted: false
    });

    // 4. Log succès
    await invoke('log_info', {
      message: `Chat completed: ${userMessage.slice(0, 50)}...`
    });

    return response.text;
  } catch (error) {
    // Log erreur
    await invoke('log_error', {
      message: `Chat failed: ${error.message}`
    });
    throw error;
  }
}
```

**📖 Documentation complète:** Consultez `/docs/06_api/TAURI_COMMANDS_REFERENCE.md` pour la liste exhaustive des 100+ commandes.

---

## 📖 GLOSSAIRE TECHNIQUE

### Termes Essentiels

**AI Provider**
> Service IA utilisé par TITANE pour générer les réponses (Gemini, Ollama, Local, TauriChat).

**AppImage**
> Format de distribution Linux portable. Fonctionne sur toutes les distributions sans installation.

**Chiffrement (Encryption)**
> Protection des données via algorithmes cryptographiques (AES-256 pour TITANE).

**Cognitive Mode**
> État mental du système (Focused, Creative, Analytical, Reflective).

**Context Window**
> Nombre maximum de tokens qu'un modèle IA peut traiter en une fois.

**DEB Package**
> Format de package Debian (.deb) pour Ubuntu, Debian, etc.

**Gemini**
> Modèle IA de Google (cloud). Rapide et performant, nécessite clé API.

**GPU Acceleration**
> Utilisation de la carte graphique pour accélérer l'IA (Ollama + CUDA/ROCm).

**LTM (Long-Term Memory)**
> Mémoire à long terme. Souvenirs persistants sur plusieurs mois/années.

**Modal**
> Fenêtre de dialogue qui apparaît au-dessus de l'interface principale.

**MTM (Mid-Term Memory)**
> Mémoire à moyen terme. Souvenirs sur ~30 jours, progressivement consolidés.

**Ollama**
> Plateforme open-source pour exécuter des modèles IA localement (Llama, Mistral, etc.).

**Provider**
> Service IA backend (Gemini, Ollama, Local, TauriChat).

**Streaming**
> Affichage progressif des réponses IA (mot par mot) au lieu d'attendre la réponse complète.

**STM (Short-Term Memory)**
> Mémoire à court terme. Souvenirs récents (< 24h), haute volatilité.

**Tauri**
> Framework Rust pour créer des applications desktop natives. Backend de TITANE.

**Temperature**
> Paramètre IA contrôlant la créativité (0.0 = déterministe, 1.0 = très créatif).

**Token**
> Unité de texte (~4 caractères). Les modèles IA ont des limites de tokens.

**Triple Memory System**
> Architecture STM + MTM + LTM de TITANE pour persistance intelligente.

**Vision Module**
> Système d'analyse visuelle (webcam, capture écran, reconnaissance affective).

**XP (Experience Points)**
> Points d'expérience gagnés dans 3 domaines (Mental, Cœur, Corps).

### Acronymes

- **AI** — Artificial Intelligence (Intelligence Artificielle)
- **API** — Application Programming Interface
- **CLI** — Command Line Interface
- **CPU** — Central Processing Unit
- **DEB** — Debian Package
- **GPU** — Graphics Processing Unit
- **GUI** — Graphical User Interface
- **JSON** — JavaScript Object Notation
- **LLM** — Large Language Model
- **RAM** — Random Access Memory
- **REST** — Representational State Transfer
- **SDK** — Software Development Kit
- **SSD** — Solid State Drive
- **UI** — User Interface
- **UX** — User Experience
- **YAML** — YAML Ain't Markup Language

---

## 🔒 SÉCURITÉ & CONFIDENTIALITÉ

### Architecture Zero-Trust

TITANE adopte une approche **Privacy-First**:

✅ **100% Local par Défaut**
- Tous les calculs se font localement
- Aucune donnée envoyée au cloud sans autorisation
- Provider "Local" fonctionne entièrement hors ligne

✅ **Chiffrement End-to-End**
- Mémoire chiffrée AES-256
- Clés API stockées chiffrées
- Communications sécurisées (TLS 1.3)

✅ **Contrôle Utilisateur Total**
- Vous choisissez quel provider utiliser
- Vous contrôlez quelles données sont envoyées
- Vous pouvez effacer toutes les données instantanément

### Protection des Données

#### 1. Clés API (Sécurisées)

```
Vos clés API sont:
✅ Chiffrées AES-256 au repos
✅ Jamais loggées
✅ Jamais transmises à des tiers
✅ Stockées dans keychain système (si disponible)
✅ Effaçables à tout moment
```

**Où sont stockées vos clés?**
- **Linux:** `~/.local/share/titane/secure/keys.enc`
- **macOS:** Keychain système
- **Windows:** Windows Credential Manager

#### 2. Mémoire (Triple Protection)

```
Votre mémoire est:
✅ Chiffrée par défaut (AES-256)
✅ Fragmentée (anti-dump)
✅ Purgeable à volonté
✅ Locale uniquement (sauf export explicite)
```

#### 3. Conversations

```
Vos conversations:
✅ Ne quittent jamais votre machine (mode Local)
✅ Transitent chiffrées (mode Cloud: TLS 1.3)
✅ Ne sont PAS utilisées pour entraîner des modèles
✅ Peuvent être exportées chiffrées
```

### Recommandations Sécurité

#### 🟢 Pour Utilisateurs Soucieux de la Vie Privée

1. **Utilisez le provider "Ollama" (100% local)**
   ```bash
   # Installer Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Télécharger un modèle
   ollama pull llama2
   
   # TITANE détectera automatiquement Ollama
   ```

2. **Désactivez la télémétrie** (si activée)
   ```
   Settings → Privacy → Telemetry → OFF
   ```

3. **Activez le chiffrement mémoire** (par défaut)
   ```
   Settings → Memory → Encryption → ON
   ```

4. **Utilisez le mode hors ligne**
   ```bash
   ./Titan-Stable_27.0.0_amd64.AppImage --offline
   ```

#### 🟡 Pour Utilisateurs Cloud (Gemini)

1. **Créez une clé API dédiée** (pas votre clé principale)
2. **Limitez les permissions** de la clé
3. **Surveillez l'usage** via Google Cloud Console
4. **Révoquez la clé** si compromis suspect

#### 🔴 Ce Que TITANE NE Fait JAMAIS

❌ Envoyer vos données à des tiers non autorisés  
❌ Vendre vos informations  
❌ Tracker votre usage sans consentement  
❌ Utiliser vos conversations pour entraîner des modèles  
❌ Partager vos clés API  
❌ Logger vos messages en clair  

### Audit de Sécurité

TITANE est **open-source**. Vous pouvez auditer le code:

```bash
# Cloner le repo
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git

# Inspecter le code de sécurité
cd TITANE_INFINITY
grep -r "encryption" src-tauri/src/
grep -r "api_key" src-tauri/src/

# Vérifier les dépendances
cargo tree
```

**🔍 Rapport d'audit:** Consultez `/docs/security/SECURITY_AUDIT.md`

---

## ⚡ PERFORMANCE & OPTIMISATION

### Benchmarks v27.0.0 — Vue d'Ensemble

| Métrique | Valeur | Notes |
|----------|--------|-------|
| **Démarrage** | 585ms | Temps de lancement |
| **Première réponse** | < 2s | Gemini streaming |
| **Mémoire RAM** | 150-300MB | Utilisation typique |
| **CPU idle** | < 1% | Au repos |
| **CPU charge** | 30-60% | Génération active |
| **Disk I/O** | < 5MB/s | Lecture/écriture |
| **Réseau** | 0 (local) | 10-50 KB/s (cloud) |

### Benchmarks Détaillés Par Provider

#### Ollama (Local) — GPU NVIDIA RTX 3080

| Modèle | Latence Première Token | Throughput | RAM GPU | Qualité |
|--------|------------------------|------------|---------|---------|
| llama2:7b | 320ms | 45 tok/s | 4.2 GB | ⭐⭐⭐ |
| llama2:13b | 580ms | 28 tok/s | 7.8 GB | ⭐⭐⭐⭐ |
| codellama:7b | 290ms | 52 tok/s | 4.1 GB | ⭐⭐⭐ (code) |
| mistral:7b | 280ms | 48 tok/s | 4.0 GB | ⭐⭐⭐⭐ |
| mixtral:8x7b | 950ms | 18 tok/s | 24 GB | ⭐⭐⭐⭐⭐ |

**Recommandation:** `mistral:7b` pour équilibre vitesse/qualité optimal

#### Ollama (Local) — CPU Only (AMD Ryzen 9 5900X)

| Modèle | Latence Première Token | Throughput | RAM | Qualité |
|--------|------------------------|------------|-----|---------|
| llama2:7b | 2.1s | 8 tok/s | 6 GB | ⭐⭐⭐ |
| mistral:7b | 1.9s | 9 tok/s | 6 GB | ⭐⭐⭐⭐ |
| phi2:2.7b | 950ms | 15 tok/s | 3 GB | ⭐⭐ (compact) |

**Recommandation:** `phi2:2.7b` si pas de GPU, ou upgrader vers GPU

#### Gemini Pro (Cloud)

| Endpoint | Latence Première Token | Throughput | Coût/1K tok | Qualité |
|----------|------------------------|------------|-------------|---------|
| gemini-pro | 1.2s | 60 tok/s | $0.001 | ⭐⭐⭐⭐⭐ |
| gemini-pro-vision | 1.5s | 55 tok/s | $0.002 | ⭐⭐⭐⭐⭐ |
| gemini-1.5-flash | 800ms | 80 tok/s | $0.0005 | ⭐⭐⭐⭐ |

**Recommandation:** `gemini-1.5-flash` pour vitesse, `gemini-pro` pour qualité

#### Anthropic Claude (Cloud)

| Modèle | Latence Première Token | Throughput | Coût/1K tok | Qualité |
|----------|------------------------|------------|-------------|---------|
| claude-3-opus | 1.8s | 45 tok/s | $0.015 | ⭐⭐⭐⭐⭐ |
| claude-3-sonnet | 1.2s | 55 tok/s | $0.003 | ⭐⭐⭐⭐ |
| claude-3-haiku | 750ms | 65 tok/s | $0.00025 | ⭐⭐⭐ |

**Recommandation:** `claude-3-haiku` pour vitesse/coût, `claude-3-opus` pour qualité maximale

#### Local Provider (Fallback Builtin)

| Métrique | Valeur | Notes |
|----------|--------|-------|
| Latence | 100ms | Réponses pré-générées |
| Throughput | N/A | Pas de génération |
| RAM | 50 MB | Ultra-léger |
| Qualité | ⭐ | Basique (règles fixes) |

**Usage:** Fallback uniquement, pas pour usage principal

### Comparaison Graphique

#### Latence vs Qualité (Lower is Better Latency)

```
Qualité ⭐⭐⭐⭐⭐
    │
    │  Opus (1.8s)
    │  ├─ Mixtral-8x7b (950ms)
    │  │   ├─ Gemini Pro (1.2s)
⭐⭐⭐⭐│  │   │
    │  │   └─ Sonnet (1.2s)
    │  │       ├─ llama2:13b (580ms)
⭐⭐⭐ │  │       │  ├─ Gemini Flash (800ms)
    │  │       │  │  ├─ mistral:7b (280ms)
    │  │       │  │  │  └─ Haiku (750ms)
⭐⭐  │  │       │  │  │      └─ phi2 (950ms)
    │  │       │  │  │
⭐   │  │       │  │  └─ Local Builtin (100ms)
    └──┴───────┴──┴─────────────────────────
       0.1s  0.5s  1.0s    1.5s    2.0s
                 Latence →
```

#### Coût vs Performance (Cloud Providers)

```
Coût/1K tokens
    │
$0.015│  ● Opus (qualité maximale)
      │
$0.003│      ● Sonnet (équilibré)
      │
$0.001│          ● Gemini Pro (bon rapport)
      │
$0.0005│             ● Flash (rapide)
       │
$0.00025│                ● Haiku (économique)
        └────────────────────────────────
          Latence →  Throughput →
```

### Utilisation RAM Détaillée

#### Profil RAM Par Scénario

**Idle (Application au repos):**
```
Total: 145 MB
├─ Application Core: 85 MB
├─ Memory STM: 15 MB
├─ Tauri Runtime: 30 MB
└─ OS Overhead: 15 MB
```

**Active Chat (1 conversation 20 messages):**
```
Total: 220 MB
├─ Application Core: 85 MB
├─ Memory STM: 45 MB (20 messages cached)
├─ Provider Buffer: 50 MB (streaming)
├─ Tauri Runtime: 30 MB
└─ OS Overhead: 10 MB
```

**Heavy Load (Vision + Chat + Multiple Providers):**
```
Total: 380 MB
├─ Application Core: 85 MB
├─ Memory STM/MTM: 95 MB
├─ Provider Buffers: 120 MB (3 providers actifs)
├─ Vision Processing: 50 MB
├─ Tauri Runtime: 30 MB
└─ OS Overhead: 10 MB
```

**Peak (Limite recommandée):**
```
Total: 500 MB (seuil critique)
├─ Application: 100 MB
├─ Memory Full: 200 MB
├─ Providers: 150 MB
├─ Vision + Voice: 50 MB
```

**🚨 Au-delà 500 MB:** Auto-cleanup déclenché, warnings utilisateur

### CPU Utilization Détaillée

| Opération | CPU Single-Core | CPU Multi-Core | Durée | Notes |
|-----------|-----------------|----------------|-------|-------|
| Startup | 45% | 15% | 0.5s | Chargement initial |
| Chat Idle | 0.5% | 0.2% | — | Monitoring seulement |
| Provider Call (Ollama GPU) | 8% | 3% | 2-5s | GPU fait le travail |
| Provider Call (Ollama CPU) | 95% | 60% | 10-30s | CPU intensif |
| Vision Processing | 40% | 20% | 1-2s | Analyse image |
| Memory Indexing | 25% | 12% | 0.5s | Recherche LTM |
| Database Backup | 30% | 15% | 2-5s | Compression + I/O |

### Optimisations Recommandées

#### 1. Provider IA

**Pour performances maximales:**

```
Provider: Ollama (local)
Modèle: llama2:7b ou mistral:7b
Hardware: GPU NVIDIA (CUDA) ou AMD (ROCm)

Résultat attendu:
  • Latence: < 500ms première token
  • Throughput: 30-50 tokens/sec
  • RAM GPU: 4-8 GB
```

**Pour qualité maximale:**

```
Provider: Gemini Pro
Température: 0.7
Max tokens: 2048

Résultat attendu:
  • Latence: 1-2s première réponse
  • Qualité: Excellente
  • Coût: $0.001/1K tokens (input)
```

#### 2. Paramètres IA

```yaml
# Settings → AI → Parameters

Temperature: 0.5-0.8
  • 0.3: Très déterministe (code, précision)
  • 0.7: Équilibré (défaut)
  • 1.0: Très créatif (brainstorming)

Max Tokens: 1000-2048
  • 1000: Conversations courtes
  • 2048: Réponses longues
  • 4096: Analyses complètes (coûteux)

Top P: 0.9
  • Contrôle diversité (laisser par défaut)

Stream: ON
  • Affichage progressif (recommandé)
```

#### 3. Mémoire

```yaml
# Settings → Memory

Cache Size: 100-500 MB
  • 100 MB: Minimum (limitè)
  • 250 MB: Recommandé
  • 500 MB: Maximum (performant)

Auto-cleanup: ON
  • Nettoie mémoire STM après 24h

Encryption: ON
  • Légère surcharge CPU (~5%)
  • Recommandé pour sécurité
```

#### 4. Système

```yaml
# Settings → System

GPU Acceleration: ON (si disponible)
  • Ollama détecte automatiquement
  • Améliore vitesse 5-10x

Hardware Threads: Auto
  • Laissez TITANE détecter

Log Level: WARN
  • INFO: Plus verbeux (debug)
  • WARN: Défaut (production)
  • ERROR: Minimal
```

### Résolution Problèmes Performance

#### 🐌 TITANE est Lent

**Symptômes:** Réponses lentes, UI freeze

**Solutions:**

1. **Vérifiez provider:**
   ```
   Settings → AI → Provider
   → Préférez Ollama (local) ou Gemini (cloud rapide)
   ```

2. **Réduisez max_tokens:**
   ```
   Settings → AI → Max Tokens → 1000-1500
   ```

3. **Désactivez features non utilisées:**
   ```
   Settings → Vision → OFF (si non utilisé)
   Settings → Voice → OFF (si non utilisé)
   ```

4. **Videz cache:**
   ```
   Settings → System → Clear Cache
   ```

#### 🔥 TITANE Consomme Trop de RAM

**Symptômes:** RAM > 500MB, swap actif

**Solutions:**

1. **Réduisez cache:**
   ```
   Settings → Memory → Cache Size → 100 MB
   ```

2. **Activez auto-cleanup:**
   ```
   Settings → Memory → Auto-cleanup → ON
   ```

3. **Redémarrez TITANE:**
   ```bash
   # Fermer + relancer
   # Libère mémoire fragmentée
   ```

#### ⚡ GPU Non Utilisé

**Symptômes:** Ollama lent malgré GPU

**Solutions:**

1. **Vérifiez drivers GPU:**
   ```bash
   # NVIDIA
   nvidia-smi
   
   # AMD
   rocm-smi
   ```

2. **Réinstallez Ollama:**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

3. **Testez GPU manuellement:**
   ```bash
   ollama run llama2 "Test GPU"
   # Devrait utiliser GPU
   ```

### Métriques en Temps Réel

Accédez aux métriques:

```
Menu → STATS → Performance
ou
Ctrl + 3 → Performance Tab
```

**Métriques disponibles:**

- **CPU Usage** (% par core)
- **RAM Usage** (MB)
- **GPU Usage** (%, si disponible)
- **Network** (KB/s)
- **Disk I/O** (MB/s)
- **Token Throughput** (tokens/sec)
- **Latency** (ms par requête)

---

## 📋 CHECKLIST PREMIÈRE UTILISATION

Pour démarrer au mieux:

- [ ] ✅ Installez TITANE
- [ ] ✅ Lancez première conversation
- [ ] ✅ Explorez les 3 modes (Chat, Code, Coach)
- [ ] ✅ Configurez un provider IA
- [ ] ✅ Testez upload fichier
- [ ] ✅ Consultez votre mémoire (Memory)
- [ ] ✅ Allez à Vision, activez caméra
- [ ] ✅ Vérifiez EVO (dashboard)
- [ ] ✅ Lisez la FAQ
- [ ] ✅ Apprenez 5 raccourcis clavier essentiels
- [ ] ✅ Consultez Glossaire pour termes inconnus
- [ ] ✅ Rejoignez la communauté Discord!

---

**TITANE∞ v27.0.0 — Manuel Utilisateur Complet**
*Créé: 31 Janvier 2026 | Validé par Kevin Thibault*
*Dernière mise à jour: 31 Janvier 2026 | Version: 27.0.0*
*Copyright © 2025 Humain Total / TITANE Team. Tous droits réservés.*
