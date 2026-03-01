# TITANE∞ Cline Hooks Configuration

Ce répertoire contient les hooks Cline pour le projet TITANE∞. Les hooks permettent d'injecter une logique personnalisée dans le workflow de Cline pour valider les opérations, surveiller l'utilisation des outils et façonner les décisions de l'IA.

## 🎯 Hooks Installés

### 1. TaskStart

**Déclenchement:** Au début de chaque nouvelle tâche

**Fonctionnalité:**

- Détecte automatiquement le type de projet (Tauri + React + TypeScript)
- Injecte les règles critiques du projet TITANE∞
- Rappelle l'interdiction de déploiement non autorisé
- Charge les standards de codage du workspace

### 2. PreToolUse

**Déclenchement:** Immédiatement avant chaque utilisation d'outil

**Fonctionnalité:**

- **🚫 BLOQUE** les tentatives de build production (`npm run build`, `tauri build`)
- **🚫 BLOQUE** les installations système non autorisées (`sudo dpkg`)
- **🚫 BLOQUE** la création de fichiers `.js` dans un projet TypeScript
- **⚠️ AVERTIT** si des secrets potentiels sont détectés dans les fichiers

### 3. PostToolUse

**Déclenchement:** Immédiatement après chaque utilisation d'outil

**Fonctionnalité:**

- Surveille les opérations lentes (> 5 secondes)
- Apprend des échecs de compilation TypeScript
- Détecte les échecs de tests
- Logs des opérations critiques dans `.clinerules/logs/operations.log`

### 4. UserPromptSubmit

**Déclenchement:** Quand l'utilisateur soumet un prompt

**Fonctionnalité:**

- Détecte les demandes de déploiement et injecte les avertissements
- Injecte les standards de codage pour React/composants
- Rappelle les patterns Tauri pour les commandes backend
- Ajoute le contexte de testing approprié
- Valide la gestion des dépendances

## 📊 Logs

Les hooks génèrent des logs dans `.clinerules/logs/`:

- `operations.log`: Historique des opérations write_to_file et execute_command

## 🔧 Utilisation avec Cline CLI

### Activer les hooks pour une tâche spécifique

```bash
cline "Votre question" -s hooks_enabled=true
```

### Configuration globale (si supporté dans votre version)

```bash
# Activer globalement
cline config set hooks-enabled=true

# Vérifier le statut
cline config get hooks-enabled
```

## 🛡️ Règles Critiques Appliquées

Les hooks appliquent automatiquement les règles du fichier `.github/copilot-instructions.md`:

### ⚠️ RÈGLE CRITIQUE — DÉPLOIEMENT

**INTERDICTION ABSOLUE:**

- ❌ NE JAMAIS déployer via AppImage ou DEB sans autorisation explicite
- ❌ NE JAMAIS lancer `npm run build` ou tâche "🔵 Build Titan-Stable"
- ✅ Mode développement OBLIGATOIRE jusqu'à validation 100% des tests

**Mode de travail autorisé:**

- ✅ Console / Scripts uniquement (Titan-Dev)
- ✅ Tâche "🟢 Launch Titan-Dev" pour développement
- ✅ Paramètres de restriction MINIMAUX pour faciliter le dev

**Déploiement production nécessite:**

1. Tests CLI: 100/100 passés
2. Approbation explicite écrite de Kevin Thibault
3. Confirmation "GO FOR PRODUCTION DEPLOY"

## 🔍 Test des Hooks

Pour tester un hook spécifique, déclenchez l'événement correspondant:

- **TaskStart**: Démarrez une nouvelle tâche dans Cline
- **PreToolUse**: Tentez d'exécuter une commande (ex: `npm run build`)
- **PostToolUse**: Exécutez n'importe quelle commande
- **UserPromptSubmit**: Soumettez un prompt avec des mots-clés (ex: "deploy", "component")

## 📚 Documentation Complète

- [Hooks Overview](https://docs.cline.bot/features/hooks/index)
- [Hook Reference](https://docs.cline.bot/features/hooks/hook-reference)
- [Cline CLI Overview](https://docs.cline.bot/cline-cli/overview)

## 🔐 Sécurité

**⚠️ IMPORTANT:** Les hooks s'exécutent avec les mêmes permissions que VS Code. Ils ont accès:

- À tout le système de fichiers
- Aux variables d'environnement
- Aux commandes système
- Aux ressources réseau

Toujours examiner le code des hooks avant de les activer.

## 🛠️ Maintenance

Pour modifier un hook:

1. Éditez le fichier correspondant dans `.clinerules/hooks/`
2. Assurez-vous qu'il reste exécutable: `chmod +x .clinerules/hooks/<HookName>`
3. Testez en déclenchant l'événement approprié
4. Vérifiez les logs dans `.clinerules/logs/`

## 🎨 Extension

Pour ajouter un nouveau hook, consultez la [Hook Reference](https://docs.cline.bot/features/hooks/hook-reference) pour les types disponibles:

- TaskResume
- TaskCancel
- TaskComplete
- Et autres...

---

**Créé le:** 2 janvier 2026  
**Projet:** TITANE∞ v26.2.0+  
**Mainteneur:** Kevin Thibault (TITANE∞)
