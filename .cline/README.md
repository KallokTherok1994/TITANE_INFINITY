# TITANE∞ - Configuration Cline MCP

## 📋 Vue d'ensemble

Configuration optimisée de Cline MCP pour le projet TITANE∞, avec safeguards de sécurité et respect des règles critiques de déploiement.

## 🚨 RÈGLE CRITIQUE

**INTERDICTION ABSOLUE** de déployer sans autorisation explicite de Kevin Thibault.

### Commandes bloquées

- `pnpm run build` / `pnpm run build:production`
- `tauri build`
- `./runtime/stable/build.sh`
- `dpkg -i` / installations système
- Tout build AppImage/DEB

### Commandes autorisées

- `pnpm run dev` - Développement
- `pnpm test` - Tests
- `pnpm run lint` / `pnpm run format` - Quality checks
- `cargo test` - Tests Rust
- `./runtime/dev/run-dev.sh` - Runtime dev

## 📦 Installation

### 1. Appliquer la configuration optimisée

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
chmod +x .cline/config-optimized.sh
./.cline/config-optimized.sh
```

### 2. Vérifier la configuration

```bash
cline config list
```

### 3. Valider les safeguards

```bash
cat .cline/deployment-safeguards.json
```

## 🔧 Paramètres optimisés

### Sécurité

- ✅ Auto-approval: **DÉSACTIVÉ**
- ✅ Max requests: **5** (au lieu de 20)
- ✅ Notifications: **ACTIVÉES**
- ✅ Execute-all-commands: **DÉSACTIVÉ**
- ✅ Telemetry: **DISABLED**

### Performance

- ✅ Thinking budget: **2048 tokens** (↑ de 1024)
- ✅ Terminal output: **1000 lignes** (↑ de 500)
- ✅ Auto-condense: **ACTIVÉ** (threshold 0.65)
- ✅ Shell timeout: **6000ms** (↑ de 4000)

### Développement

- ✅ Mode: **plan** (réflexion avant action)
- ✅ Strict plan mode: **ACTIVÉ**
- ✅ Checkpoints: **ACTIVÉS**
- ✅ Focus chain: **ACTIVÉ** (interval 8)
- ✅ MCP marketplace: **ACTIVÉ**

### Localization

- ✅ Language: **French**
- ✅ Dictation: **fr**

### Reasoning

- ✅ Effort: **high** (↑ de medium)

## 🎯 Workflow recommandé

### Développement quotidien

```bash
# 1. Lancer l'environnement dev
pnpm run dev

# 2. Utiliser Cline en mode plan
cline "analyze and suggest improvements for X"

# 3. Tests avant commit
pnpm run copilot-xs:test

# 4. Validation finale
pnpm run verify
```

### Demande de modification

```bash
# Mode plan (analyse d'abord)
cline --mode plan "implement feature X"

# Revue et approbation manuelle requise
# Puis exécution si approuvée
```

### Tests et validation

```bash
# Tests complets
pnpm run test:all

# Validation COPILOT-XS
pnpm run copilot-xs:validate

# Audit sécurité
pnpm run audit:security
```

## ⚠️ Actions nécessitant approbation

Les actions suivantes requièrent une **validation humaine explicite** :

1. **Édition de fichiers externes**
   - Fichiers système
   - Configuration globale

2. **Exécution de commandes dangereuses**
   - Commandes sudo
   - Installations système
   - Modifications réseau

3. **Déploiement production**
   - Build stable
   - Package AppImage/DEB
   - Installation système

4. **Merge de branches**
   - Merge vers stable-runtime
   - Push vers MAIN

## 🔍 Monitoring

### Vérifier l'état actuel

```bash
# Configuration Cline
cline config list

# Logs récents
cline logs

# Instances actives
cline instance list
```

### Audit de sécurité

```bash
# Vérifier les commandes bloquées
grep -E "build|deploy|dpkg" .cline/deployment-safeguards.json

# Vérifier auto-approval status
cline config get auto-approval-settings.enabled
# Doit retourner: false
```

## 📚 Références

- [Cline CLI Documentation](https://docs.cline.ai)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [TITANE∞ Architecture](/ARCHITECTURE.md)
- [COPILOT-XS Rules](/.github/copilot-instructions.md)

## 🆘 Support

En cas de problème :

1. Vérifier la configuration : `cline config list`
2. Consulter les logs : `cline logs`
3. Réappliquer la config : `./.cline/config-optimized.sh`
4. Contacter Kevin Thibault si blocage

## 📝 Changelog

### v1.0.0 - 2026-01-03

- Configuration initiale optimisée
- Safeguards de déploiement
- Respect règle critique TITANE∞
- Documentation complète
