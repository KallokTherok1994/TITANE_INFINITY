# TITANE∞ Dev:Tauri - Guide d'utilisation amélioré

## 🚀 Nouvelles fonctionnalités

### Commandes disponibles

```bash
# Démarrage normal
pnpm run dev:tauri

# Démarrage avec nettoyage automatique
pnpm run dev:tauri:clean

# Nettoyage seul
pnpm run dev:cleanup

# Mode test (smoke run)
pnpm run dev:tauri --smoke 10

# Sans Ollama
pnpm run dev:tauri --no-ollama

# Aide détaillée
pnpm run dev:tauri --help
```

### Améliorations apportées

#### ✅ **Monitoring amélioré**
- Affichage de l'usage mémoire
- Détection améliorée du boot (UI_BOOT_MARKER, ready in, local:)
- Aide intégrée (`--help`)
- Messages d'erreur plus clairs

#### ✅ **Gestion des processus**
- Script de nettoyage automatique (`cleanup-dev-env.sh`)
- Détection et arrêt propre des processus orphelins
- Nettoyage des ports dev (5173, 1420)
- Restauration des fichiers de mémoire modifiés

#### ✅ **Validation d'environnement**
- Vérification Node.js et pnpm
- Contrôle des conflits de processus
- Validation des ports libres
- Vérification de la configuration runtime

#### ✅ **Nouvelles commandes NPM**
- `dev:tauri:clean` : Nettoyage + démarrage
- `dev:cleanup` : Nettoyage seul

## 🔧 Résolution de problèmes

### Port 5173 occupé
```bash
pnpm run dev:cleanup
```

### Processus zombies
```bash
pnpm run dev:cleanup
```

### Erreurs de monitoring
```bash
rm -rf runtime/dev/logs/*
pnpm run dev:tauri
```

### Problèmes audio
```bash
./scripts/fix-audio.sh
```

### Limite inotify (Linux)
```bash
sudo sysctl fs.inotify.max_user_watches=524288
```

## 📂 Logs et monitoring

- **Monitor principal** : `runtime/dev/logs/tauri-dev-monitor.log`
- **Vite logs** : `runtime/dev/logs/vite.log`  
- **Status JSON** : `runtime/dev/logs/*status*.json`
- **Summary** : `runtime/dev/logs/*summary*.json`

## 🎯 Mode développement

Le système dev:tauri utilise maintenant :

1. **Validation pré-lancement** : Vérifie l'état de l'environnement
2. **Monitoring actif** : Surveille le processus avec métriques
3. **Nettoyage automatique** : Gestion propre des processus
4. **Logging complet** : Traces détaillées pour debug

## 📋 Architecture des scripts

```
scripts/
├── launch/
│   ├── dev_tauri_monitor.mjs    # Monitor principal (amélioré)
│   └── deploy_full_local_dev.sh # Script de lancement
├── dev/
│   ├── cleanup-dev-env.sh       # Nettoyage environnement (nouveau)
│   ├── dev-tauri-wrapper.sh     # Wrapper avancé (nouveau)
│   └── full_local_tauri_ollama.sh # Runtime backend
└── fix-audio.sh                 # Résolution problèmes audio
```

## 🔄 Workflow recommandé

1. **Premier lancement** : `pnpm run dev:tauri:clean`
2. **Développement normal** : `pnpm run dev:tauri`
3. **En cas de problème** : `pnpm run dev:cleanup` puis relancer
4. **Tests rapides** : `pnpm run dev:tauri --smoke 10`
