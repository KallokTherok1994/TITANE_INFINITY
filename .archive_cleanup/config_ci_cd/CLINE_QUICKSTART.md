# 🚀 Guide de Démarrage Rapide - Cline CLI + Hooks

## Installation Instantanée

```bash
# Vérifier l'installation
npm run cline:verify

# Réinstaller si nécessaire
npm run cline:install
```

## Utilisation Quotidienne

### 1. Mode Interactif Simple

```bash
# Question simple
cline "Comment fonctionne le système de mémoire ?" -s hooks_enabled=true

# Analyse de code
cline "Analyser les composants dans src/components" -s hooks_enabled=true

# Debug
cline "Pourquoi ce test échoue ?" -s hooks_enabled=true
```

### 2. Mode Développement (Recommandé)

```bash
# Mode plan (analyse avant action)
cline "Ajouter validation au formulaire" -s hooks_enabled=true -m plan

# Mode act (exécution directe)
cline "Corriger les imports manquants" -s hooks_enabled=true -m act
```

### 3. Mode Autonome (Yolo)

```bash
# Pour les tâches répétitives
cline "Formater tous les fichiers TypeScript" -s hooks_enabled=true --yolo

# Pour les corrections automatiques
cline "Corriger tous les tests unitaires" -s hooks_enabled=true --yolo
```

## Protection Active

### ✅ Ce Que Vous Pouvez Faire

```bash
✅ npm run dev
✅ npm test
✅ npm run lint:fix
✅ Tâche "🟢 Launch Titan-Dev"
✅ Toute commande de développement
```

### ❌ Ce Qui Est Bloqué Automatiquement

```bash
❌ npm run build
❌ tauri build
❌ ./runtime/stable/build.sh
❌ sudo dpkg -i *.deb
❌ Tâche "🔵 Build Titan-Stable"
```

## Exemples Pratiques

### Exemple 1: Créer un Nouveau Composant

```bash
cline "Créer un composant Button avec TypeScript et tests" -s hooks_enabled=true
```

**Ce qui se passe:**

1. Hook `TaskStart` injecte les règles du projet
2. Hook `UserPromptSubmit` détecte "composant" et ajoute les standards React
3. Hook `PreToolUse` valide chaque fichier créé
4. Hook `PostToolUse` log les opérations

### Exemple 2: Refactoring Sécurisé

```bash
cline "Refactorer MemoryCore pour améliorer les performances" -s hooks_enabled=true -m plan
```

**Ce qui se passe:**

1. Mode `plan` analyse d'abord sans modifier
2. Hooks valident chaque modification proposée
3. Vous approuvez avant l'exécution
4. Logs détaillés dans `.clinerules/logs/`

### Exemple 3: Correction de Bugs

```bash
cline "Corriger les erreurs TypeScript dans src/utils" -s hooks_enabled=true -m act
```

**Ce qui se passe:**

1. Mode `act` exécute directement
2. Hook `PostToolUse` détecte les opérations lentes
3. Suggestions d'optimisation automatiques
4. Validation finale des types

## Monitoring

### Voir les Logs en Temps Réel

```bash
# Suivre les opérations
npm run cline:logs

# Analyser les performances
grep "PERFORMANCE" .clinerules/logs/operations.log

# Chercher les erreurs
grep "ERROR\|FAIL" .clinerules/logs/operations.log
```

### Vérifier l'État des Hooks

```bash
# Statut rapide
npm run cline:verify

# Test complet
npm run cline:test-hooks
```

## Dépannage

### Hook Non Déclenché ?

```bash
# Vérifier que les hooks sont exécutables
ls -la .clinerules/hooks/

# Rendre exécutables si nécessaire
chmod +x .clinerules/hooks/*
```

### Erreur de Parsing JSON ?

```bash
# Tester un hook manuellement
echo '{"test":"data"}' | .clinerules/hooks/TaskStart | jq .

# Si jq n'est pas installé
sudo apt install jq  # Ubuntu/Debian
brew install jq      # macOS
```

### Hook Trop Restrictif ?

```bash
# Modifier temporairement un hook
nano .clinerules/hooks/PreToolUse

# Toujours tester après modification
npm run cline:test-hooks
```

## Astuces Pro

### 1. Aliases Bash Utiles

Ajoutez à votre `~/.bashrc` ou `~/.zshrc`:

```bash
# Alias Cline avec hooks par défaut
alias ch='cline -s hooks_enabled=true'

# Mode plan rapide
alias chp='cline -s hooks_enabled=true -m plan'

# Mode act rapide
alias cha='cline -s hooks_enabled=true -m act'

# Yolo mode avec hooks
alias chy='cline -s hooks_enabled=true --yolo'
```

Puis sourcez: `source ~/.bashrc`

Utilisation:

```bash
ch "Votre question"
chp "Planifier une feature"
cha "Corriger rapidement"
```

### 2. Variables d'Environnement

```bash
# Dans votre .bashrc/.zshrc
export CLINE_DEFAULT_HOOKS=true
export CLINE_LOG_LEVEL=info
```

### 3. Fichiers de Configuration

Créez `~/.cline/config.yaml`:

```yaml
hooks:
  enabled: true
  timeout: 30
mode: plan
output: rich
```

## Scripts NPM Disponibles

```bash
npm run cline:install        # Installer/réinstaller les hooks
npm run cline:verify         # Vérifier l'état des hooks
npm run cline:test-hooks     # Tester les hooks
npm run cline:logs           # Voir les logs en temps réel
```

## Ressources

- **Docs Complètes:** [CLINE_CLI_INSTALLATION.md](CLINE_CLI_INSTALLATION.md)
- **Détails Hooks:** [.clinerules/hooks/README.md](.clinerules/hooks/README.md)
- **Docs Officielles:** https://docs.cline.bot/cline-cli/overview

## Support

En cas de problème:

1. Vérifier les logs: `.clinerules/logs/operations.log`
2. Tester les hooks: `npm run cline:test-hooks`
3. Consulter la documentation: [CLINE_CLI_INSTALLATION.md](CLINE_CLI_INSTALLATION.md)

---

**Version:** 1.0.0  
**Dernière MAJ:** 2 janvier 2026  
**Projet:** TITANE∞ v26.2.0+
