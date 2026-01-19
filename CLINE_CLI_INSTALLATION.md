# Installation Cline CLI + Hooks Integration

## ✅ Installation Complète

Cline CLI est installé et configuré avec les hooks d'intégration pour TITANE∞.

### 📦 Version Installée

- **Cline CLI Version:** 1.0.8
- **Cline Core Version:** 3.39.2
- **OS/Arch:** linux/amd64
- **Node.js Version:** 20.19.6
- **Date d'installation:** 2 janvier 2026

### 🔑 Authentification

- **Provider:** OpenRouter
- **Mode Plan:** openrouter
- **Mode Act:** openrouter
- **Statut:** ✅ Authentifié et opérationnel

### 🎣 Hooks Actifs

Quatre hooks sont configurés dans `.clinerules/hooks/`:

1. ✅ **TaskStart** - Injecte les règles du projet au démarrage
2. ✅ **PreToolUse** - Bloque les déploiements non autorisés
3. ✅ **PostToolUse** - Surveille les performances
4. ✅ **UserPromptSubmit** - Injecte le contexte selon les mots-clés

### 🧪 Tests Réussis

```bash
# Test du hook TaskStart
✅ Détection correcte du projet TITANE∞
✅ Injection des règles critiques
✅ Chargement des standards de codage

# Test du hook PreToolUse
✅ Blocage confirmé pour "npm run build"
✅ Message d'erreur approprié affiché
✅ Protection contre les déploiements non autorisés
```

## 📝 Utilisation

### Avec Cline CLI

```bash
# Mode interactif avec hooks activés
cline "Votre question" -s hooks_enabled=true

# Mode autonome (yolo) avec hooks
cline "Implémenter une fonctionnalité" -s hooks_enabled=true --yolo

# Mode plan (par défaut)
cline "Analyser le code" -s hooks_enabled=true -m plan

# Mode act (exécution directe)
cline "Corriger les tests" -s hooks_enabled=true -m act
```

### Avec VS Code Extension

Les hooks fonctionnent automatiquement si activés dans les paramètres Cline de VS Code :

1. Ouvrir Cline dans VS Code
2. Aller dans l'onglet "Hooks"
3. Les hooks du projet apparaissent dans la section "Project-Specific Hooks"
4. Activer les hooks souhaités

## 🛡️ Protection Active

Les hooks appliquent automatiquement la **RÈGLE CRITIQUE DE DÉPLOIEMENT** :

### ❌ Bloqué Automatiquement

- `npm run build`
- `tauri build`
- `./runtime/stable/build.sh`
- Tâche VS Code "🔵 Build Titan-Stable"
- `sudo dpkg -i *.deb`
- Installations système non autorisées

### ✅ Autorisé

- `npm run dev`
- Tâche "🟢 Launch Titan-Dev"
- `npm test`
- Toutes les commandes de développement

## 📊 Monitoring

### Logs Automatiques

Les hooks génèrent des logs dans `.clinerules/logs/` :

```bash
# Voir les opérations récentes
tail -f .clinerules/logs/operations.log

# Analyser les performances
grep "PERFORMANCE" .clinerules/logs/operations.log

# Vérifier les opérations d'écriture
grep "write_to_file" .clinerules/logs/operations.log
```

## 🔧 Configuration Avancée

### Variables d'Environnement

```bash
# Désactiver temporairement les hooks (si besoin en urgence)
export CLINE_HOOKS_DISABLED=1

# Augmenter le niveau de log
export CLINE_HOOKS_VERBOSE=1
```

### Personnalisation des Hooks

Pour modifier un hook :

1. Éditer le fichier dans `.clinerules/hooks/`
2. Tester avec : `echo '{"test":"data"}' | .clinerules/hooks/HookName`
3. Vérifier que le JSON de sortie est valide

## 🚀 Exemples d'Utilisation

### Exemple 1: Analyse de Code avec Contexte

```bash
cline "Analyser les composants React" -s hooks_enabled=true
```

Le hook `UserPromptSubmit` détecte "React" et injecte automatiquement :

- Standards de composants fonctionnels
- Patterns TypeScript appropriés
- Références aux composants existants

### Exemple 2: Tentative de Déploiement (Bloquée)

```bash
cline "Build production pour déploiement" -s hooks_enabled=true
```

Le hook `PreToolUse` bloque immédiatement avec le message :

```
⚠️ VIOLATION CRITIQUE: Tentative de déploiement production non autorisée.
Le déploiement production nécessite:
1. Tests CLI: 100/100 passés
2. Approbation explicite écrite de Kevin Thibault
3. Confirmation 'GO FOR PRODUCTION DEPLOY'
```

### Exemple 3: Monitoring des Performances

```bash
cline "Exécuter tous les tests" -s hooks_enabled=true
```

Le hook `PostToolUse` surveille et log :

- Temps d'exécution des tests
- Échecs détectés
- Suggestions d'optimisation

## 🔗 Ressources

- **Documentation locale:** [.clinerules/hooks/README.md](.clinerules/hooks/README.md)
- **Hooks Cline:** https://docs.cline.bot/features/hooks/index
- **Cline CLI:** https://docs.cline.bot/cline-cli/overview
- **Hook Reference:** https://docs.cline.bot/features/hooks/hook-reference

## 📋 Checklist de Vérification

- [x] Cline CLI installé (v1.0.8)
- [x] 4 hooks créés et exécutables
- [x] Répertoire de logs créé
- [x] Tests de validation réussis
- [x] Documentation à jour
- [x] Protection déploiement active

## 🎯 Prochaines Étapes

1. **Utiliser Cline CLI** avec les hooks pour les tâches quotidiennes
2. **Monitorer les logs** pour vérifier l'efficacité des hooks
3. **Ajuster les règles** si nécessaire dans les fichiers de hooks
4. **Créer des hooks supplémentaires** selon les besoins (TaskComplete, TaskCancel, etc.)

---

**Installation complétée le:** 2 janvier 2026  
**Projet:** TITANE∞ v26.2.0+  
**Système:** Linux x86_64  
**Mainteneur:** Kevin Thibault
