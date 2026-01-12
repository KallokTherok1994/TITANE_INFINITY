# 🎯 Exemples d'Utilisation - Cline CLI

Guide pratique avec exemples concrets pour TITANE∞.

## 🚀 Démarrage Rapide

### Mode Interactif

Le moyen le plus simple de commencer :

```bash
# Lancer Cline en mode interactif
cline

# Avec hooks activés par défaut
cline -s hooks_enabled=true
```

Tapez votre tâche, examinez le plan, et tapez `/act` quand vous êtes prêt.

### Exécution Directe (Recommandé)

Pour les tâches rapides sans interaction :

```bash
# Tâche simple
cline "Add unit tests to utils.js"

# Avec hooks de protection
cline "Add unit tests to utils.js" -s hooks_enabled=true
```

## 📝 Exemples Pratiques pour TITANE∞

### 1. Analyse de Code

```bash
# Analyser un composant
cline "Expliquer le composant MemoryCore" -f src/core/MemoryCore.tsx -s hooks_enabled=true -m plan

# Analyser l'architecture
cline "Analyser l'architecture du système de mémoire" -s hooks_enabled=true -m plan

# Review de code
cline "Review le code de src/utils pour trouver des bugs" -s hooks_enabled=true -m plan
```

### 2. Développement de Fonctionnalités

```bash
# Ajouter une nouvelle fonctionnalité (mode plan)
cline "Ajouter validation email au formulaire de login" -s hooks_enabled=true -m plan

# Mode act pour exécution directe
cline "Ajouter des commentaires JSDoc manquants" -s hooks_enabled=true -m act

# Créer un nouveau composant
cline "Créer composant Button avec variants primary/secondary" -s hooks_enabled=true
```

### 3. Tests

```bash
# Ajouter des tests unitaires
cline "Add unit tests to src/utils/formatDate.ts" -s hooks_enabled=true

# Corriger des tests qui échouent
cline "Fix failing tests in __tests__/MemoryCore.test.tsx" -s hooks_enabled=true -m act

# Générer tests de couverture
cline "Ajouter tests manquants pour atteindre 80% coverage" -s hooks_enabled=true
```

### 4. Refactoring

```bash
# Refactoring sécurisé (mode plan d'abord)
cline "Refactor MemoryCore pour utiliser hooks React" -s hooks_enabled=true -m plan

# Optimisation
cline "Optimiser les performances de renderTelemetry" -s hooks_enabled=true

# Nettoyage de code
cline "Supprimer code mort et imports inutilisés" -s hooks_enabled=true -m act
```

### 5. Debugging

```bash
# Diagnostiquer un problème
cline "Pourquoi le test webVitals échoue ?" -f tests/__tests__/webVitals.test.ts -s hooks_enabled=true

# Corriger une erreur TypeScript
cline "Corriger erreur TS2345 dans src/components/Dashboard.tsx" -s hooks_enabled=true -m act

# Analyser un crash
cline "Analyser pourquoi l'app crash au démarrage" -s hooks_enabled=true -m plan
```

### 6. Documentation

```bash
# Générer documentation
cline "Ajouter README.md au dossier src/core avec explication architecture" -s hooks_enabled=true

# Améliorer commentaires
cline "Améliorer documentation de toutes les fonctions publiques" -s hooks_enabled=true

# Créer guide d'utilisation
cline "Créer guide d'utilisation pour MemorySystem" -s hooks_enabled=true
```

## 🎨 Avec Fichiers Attachés

```bash
# Analyser un fichier spécifique
cline "Expliquer ce code" -f src/main.tsx -s hooks_enabled=true

# Comparer deux fichiers
cline "Comparer ces deux implémentations" -f src/old/Memory.ts -f src/new/MemoryCore.tsx -s hooks_enabled=true

# Avec image
cline "Analyser cette maquette et créer le composant" -i design/mockup.png -s hooks_enabled=true
```

## 🔧 Modes d'Exécution

### Mode Plan (Analyse d'abord)

Recommandé pour :

- Refactoring important
- Nouvelles fonctionnalités
- Modifications architecturales

```bash
cline "Refactorer système de mémoire" -s hooks_enabled=true -m plan
```

**Workflow :**

1. Cline analyse et propose un plan
2. Vous validez le plan
3. Tapez `/act` pour exécuter

### Mode Act (Exécution directe)

Recommandé pour :

- Corrections rapides
- Ajout de tests
- Formatage de code

```bash
cline "Fix linting errors" -s hooks_enabled=true -m act
```

**Workflow :**

1. Cline exécute immédiatement
2. Vous voyez les résultats en temps réel

### Mode Yolo (Autonome complet)

⚠️ **Attention :** Aucune confirmation demandée !

```bash
cline "Format all TypeScript files" -s hooks_enabled=true --yolo
```

**Utilisez pour :**

- Tâches répétitives sûres
- Scripts d'automatisation
- CI/CD

## 📊 Avec Paramètres Avancés

```bash
# Sortie JSON (pour scripts)
cline "List all TODO comments" -s hooks_enabled=true -F json

# Sortie plain text (pour logs)
cline "Check code quality" -s hooks_enabled=true -F plain

# Mode verbeux (pour debug)
cline "Analyze performance" -s hooks_enabled=true -v

# Multiple paramètres
cline "Create component" -s hooks_enabled=true -s auto_approve=true -m act
```

## 🔗 Avec Git

```bash
# Review d'un PR
cline "Review changes in current branch" -s hooks_enabled=true -m plan

# Générer commit message
cline "Generate commit message for staged changes" -s hooks_enabled=true

# Analyser diff
git diff | cline "Explain these changes" -s hooks_enabled=true
```

## 🛠️ Cas d'Usage Spéciaux TITANE∞

### Développement Mémoire Système

```bash
# Analyser état mémoire
cline "Analyser memory_core_state.json et proposer optimisations" -f runtime/memory/memory_core_state.json -s hooks_enabled=true

# Debug télémétrie
cline "Debug pourquoi la télémétrie ne s'enregistre pas" -s hooks_enabled=true -m plan
```

### Développement Tauri

```bash
# Analyser commandes Tauri
cline "Lister toutes les commandes Tauri et leur usage" -s hooks_enabled=true

# Debugging IPC
cline "Debug communication IPC entre React et Rust" -s hooks_enabled=true -m plan
```

### Compliance et Sécurité

```bash
# Audit sécurité
cline "Audit security issues in API calls" -s hooks_enabled=true -m plan

# Vérifier compliance
cline "Vérifier que tout respecte .github/copilot-instructions.md" -s hooks_enabled=true
```

## 💡 Astuces Pro

### 1. Aliases Bash

Ajoutez à `~/.bashrc` :

```bash
# Base avec hooks
alias ch='cline -s hooks_enabled=true'

# Plan mode
alias chp='cline -s hooks_enabled=true -m plan'

# Act mode
alias cha='cline -s hooks_enabled=true -m act'

# Yolo mode
alias chy='cline -s hooks_enabled=true --yolo'

# Avec fichier
chf() { cline "$1" -f "$2" -s hooks_enabled=true; }
```

Usage :

```bash
ch "Votre question"
chp "Analyser architecture"
cha "Fix tests"
chf "Expliquer ce fichier" src/main.tsx
```

### 2. Scripts NPM Personnalisés

Ajoutez à `package.json` :

```json
{
  "scripts": {
    "cline:test": "cline 'Run all tests and fix failures' -s hooks_enabled=true -m act",
    "cline:lint": "cline 'Fix all linting errors' -s hooks_enabled=true -m act",
    "cline:review": "cline 'Review current changes' -s hooks_enabled=true -m plan"
  }
}
```

### 3. Commandes Composées

```bash
# Analyser puis corriger
cline "Analyze test failures" -s hooks_enabled=true -m plan && \
cline "Fix identified issues" -s hooks_enabled=true -m act

# Avec condition
npm test || cline "Fix test failures" -s hooks_enabled=true -m act
```

## 📚 Ressources

- **Documentation Locale :** [CLINE_QUICKSTART.md](CLINE_QUICKSTART.md)
- **Installation :** [CLINE_CLI_INSTALLATION.md](CLINE_CLI_INSTALLATION.md)
- **Docs Officielles :** https://docs.cline.bot/cline-cli/three-core-flows

## 🎯 Résumé des Commandes Essentielles

```bash
# Démarrage rapide
cline                                                    # Mode interactif
cline "Votre tâche"                                      # Exécution directe
cline "Votre tâche" -s hooks_enabled=true                # Avec protection

# Modes
-m plan                                                  # Analyser d'abord
-m act                                                   # Exécuter directement
--yolo                                                   # Autonome complet

# Fichiers
-f fichier.ts                                            # Attacher fichier
-i image.png                                             # Attacher image

# Sortie
-F json                                                  # Format JSON
-F plain                                                 # Format texte
-v                                                       # Mode verbeux

# Protection TITANE∞
-s hooks_enabled=true                                    # Activer hooks (recommandé!)
```

---

**Dernière MAJ :** 2 janvier 2026  
**Projet :** TITANE∞ v26.2.0+  
**Auteur :** Documentation TITANE∞
