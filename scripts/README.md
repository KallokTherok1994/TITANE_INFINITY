# 🎯 TITANE∞ Scripts Architecture v1.0

## Vue d'ensemble

TITANE∞ dispose désormais d'une **architecture d'automatisation intelligente** avec un orchestrateur DAG, système de cache multi-niveau, télémétrie intégrée, et interface unifiée.

## 🏗️ Architecture

```
scripts/
├── titane.sh                 # 🏠 Interface unifiée (point d'entrée)
├── install-all.sh            # 🚀 Installation complète orchestrée
├── core/                     # 🧠 Noyau intelligent
│   ├── lib/
│   │   ├── cache.sh         # 💾 Cache multi-niveau avec TTL
│   │   └── telemetry.sh     # 📊 Monitoring et métriques
│   ├── orchestrator.sh      # 🔄 Orchestrateur DAG
│   ├── script-analyzer.sh   # 🔍 Analyseur IA (avancé)
│   ├── simple-analyzer.sh   # 📋 Analyseur simple
│   └── modules/             # 🧩 Modules spécialisés
│       ├── system-check.sh       # 🔍 Vérifications système
│       └── dependency-manager.sh # 📦 Gestion dépendances
├── _archive/                # 📦 Scripts archivés
└── [scripts existants...]   # 🔧 Scripts spécialisés
```

## 🎯 Points d'entrée

### Interface Unifiée (`./titane.sh`)
Commande principale pour toutes les opérations :

```bash
# Installation complète
./titane.sh install

# Mode développement avec Ollama
./titane.sh dev

# Construction
./titane.sh build --clean

# Déploiement
./titane.sh deploy --local

# Diagnostics
./titane.sh health --full

# Analyse des scripts
./titane.sh analyze

# Gestion cache
./titane.sh cache --stats
```

### Installation Complète (`./scripts/install-all.sh`)
Script orchestré pour installation complète :

```bash
# Installation complète
./scripts/install-all.sh

# Mode simulation
./scripts/install-all.sh --dry-run

# Installation propre
./scripts/install-all.sh --clean --verbose
```

## 🧠 Noyau Intelligent (Core)

### Cache Multi-Niveau (`core/lib/cache.sh`)
- **Système** : Infos système (OS, CPU, mémoire)
- **Projet** : État du projet et dépendances
- **Session** : Données temporaires de session
- **Runtime** : Cache d'exécution

```bash
# Statistiques cache
./titane.sh cache --stats

# Nettoyer cache expiré
./titane.sh cache --cleanup

# Vider complètement
./titane.sh cache --clear
```

### Télémétrie (`core/lib/telemetry.sh`)
Monitoring automatique des performances :

```bash
# Statistiques des 24h
telemetry_get_stats "1d"

# Métriques de performance
telemetry_start_timer "operation_name"
# ... opération ...
telemetry_stop_timer "operation_name"
```

### Orchestrateur DAG (`core/orchestrator.sh`)
Gestion intelligente des dépendances :

```bash
# Enregistrer une tâche avec dépendances
orchestrator_register_task "build" "make all" "deps,setup" "true"

# Exécuter workflow
orchestrator_execute_workflow "build_pipeline"
```

## 🧩 Modules Spécialisés

### System Check (`core/modules/system-check.sh`)
Vérifications complètes du système :

```bash
# Vérification complète
./core/modules/system-check.sh

# Vérification développement uniquement
./core/modules/system-check.sh --dev
```

### Dependency Manager (`core/modules/dependency-manager.sh`)
Gestion intelligente des dépendances :

```bash
# Installation complète
./core/modules/dependency-manager.sh all

# Node.js uniquement
./core/modules/dependency-manager.sh node

# Rust uniquement
./core/modules/dependency-manager.sh rust
```

## 🔍 Analyseurs de Scripts

### Analyseur IA (`core/script-analyzer.sh`)
Analyse complète avec métriques :

```bash
./core/script-analyzer.sh
# Génère rapport JSON + humain
# Archive automatiquement les scripts obsolètes
```

### Analyseur Simple (`core/simple-analyzer.sh`)
Analyse rapide pour maintenance :

```bash
./core/simple-analyzer.sh
# Rapport texte simple
# Métriques de base (lignes, âge, exécutabilité)
```

## 📊 Métriques et Monitoring

### Cache Performance
- **Hit Rate** : Taux de succès du cache
- **Compression** : Efficacité de compression
- **TTL Management** : Gestion des expirations

### Télémétrie
- **Commandes exécutées** : Suivi des opérations
- **Temps d'exécution** : Performance des tâches
- **Taux d'erreur** : Fiabilité du système

### Recommandations Automatiques
- **Scripts obsolètes** : Détection et archivage
- **Optimisations** : Suggestions d'amélioration
- **Maintenance** : Alertes proactives

## 🚀 Workflows Préconfigurés

### Installation Complète
```bash
System Check → Dependencies → Build Frontend → Build Backend → Tests → Deploy → Shortcuts
```

### Développement
```bash
System Check → Start Ollama → Dev Servers
```

### Maintenance
```bash
Analyze Scripts → Archive Obsolete → Clean Cache → Health Check
```

## ⚙️ Configuration

### Variables d'environnement
```bash
# Cache
TITANE_CACHE_DIR="$HOME/.cache/titane-infinity"

# Télémétrie
TITANE_TELEMETRY_ENABLED=true

# Mode debug
TITANE_VERBOSE=true
ORCHESTRATOR_DRY_RUN=false

# Auto-fix
TITANE_AUTO_FIX=true
```

### Fichiers de configuration
- `scripts/core/config/` : Configuration modules
- `scripts/_archive/` : Scripts archivés avec métadonnées

## 🔧 Maintenance

### Nettoyage Automatique
```bash
# Cache expiré
./titane.sh cache --cleanup

# Scripts obsolètes
./titane.sh analyze  # Archive automatiquement

# Artefacts de build
./titane.sh clean
```

### Diagnostics
```bash
# État complet
./titane.sh health --full

# Cache uniquement
./titane.sh health --cache

# Métriques de performance
telemetry_get_stats "1w"
```

## 📈 Optimisations Implémentées

### Performance
- **Cache intelligent** : Évite les re-calculs
- **Parallélisation** : Exécution parallèle quand possible
- **Compression** : Réduction espace disque

### Fiabilité
- **Rollback automatique** : Points de sauvegarde
- **Validation temps réel** : Détection précoce des erreurs
- **Recovery automatique** : Auto-guérison

### Observabilité
- **Télémétrie complète** : Métriques détaillées
- **Logs structurés** : Traçabilité complète
- **Rapports automatiques** : Analyse des tendances

## 🎯 Migration depuis l'ancien système

### Scripts archivés automatiquement
- Détection IA des scripts obsolètes
- Archivage avec métadonnées complètes
- Migration guidée des fonctionnalités

### Compatibilité
- Anciens scripts toujours disponibles
- Interface unifiée vers nouvelles fonctionnalités
- Migration progressive

## 🚀 Démarrage Rapide

```bash
# 1. Cloner le repository
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY

# 2. Installation complète
./scripts/install-all.sh

# 3. Ou utiliser l'interface unifiée
./titane.sh install

# 4. Premier lancement
./titane.sh dev
```

## 📚 Documentation Avancée

- **Architecture détaillée** : `docs/architecture.md`
- **API modules** : `docs/modules-api.md`
- **Optimisations** : `docs/performance.md`
- **Dépannage** : `docs/troubleshooting.md`

---

**🎉 Architecture TITANE∞ v1.0 : Automatisation intelligente, performance optimale, observabilité complète.**
