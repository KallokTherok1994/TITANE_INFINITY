# 🔧 TROUBLESHOOTING — TITANE∞ v27.0.0

**Guide complet de dépannage pour TITANE∞. Pour chaque problème rencontré, suivez le processus diagnostique.**

---

## 📋 Table des Matières

1. [Problèmes de Démarrage](#démarrage)
2. [Erreurs Réseau & Ollama](#réseau)
3. [Problèmes de Performance](#performance)
4. [Bugs d'Interface](#interface)
5. [Erreurs de Base de Données](#database)
6. [Support & Escalade](#support)

---

## 🚀 Démarrage

### ❌ L'application ne démarre pas

**Symptôme**: Écran noir ou "Application quit unexpectedly"

**Étapes de diagnostic**:

1. **Vérifier les logs**:

   ```bash
   # Linux/macOS
   cat ~/.titane/logs/app.log

   # Windows
   %APPDATA%\TITANE\logs\app.log
   ```

2. **Vérifier l'espace disque**:

   ```bash
   df -h /home  # Linux
   du -sh ~/.titane  # Size of TITANE directory
   ```

3. **Vérifier la configuration runtime**:
   - Fichier: `~/.titane/config/runtime.json`
   - Contenu doit être valide JSON

4. **Reset complet**:
   ```bash
   # ⚠️ Sauvegardez les données avant!
   rm -rf ~/.titane/memory
   rm ~/.titane/config/runtime.json
   ```

**Solutions**:

- Réinstaller l'application
- Vérifier la permission d'accès `/home`
- Contacter support avec logs (voir [Support](#support))

---

### 🔄 L'application crashe au démarrage

**Symptôme**: Démarre puis ferme immédiatement (< 5s)

**Étapes de diagnostic**:

1. **Activer debug mode**:

   ```bash
   TITANE_DEBUG=1 ./Titan-Stable
   ```

2. **Vérifier les plugins Tauri**:

   ```bash
   # Logs Tauri détaillés
   RUST_LOG=debug TITANE_DEBUG=1 ./Titan-Stable 2>&1 | head -50
   ```

3. **Vérifier les dépendances système**:
   ```bash
   # Linux
   ldd ./Titan-Stable  # Check shared library dependencies
   ```

**Solutions**:

- Mettre à jour les dépendances système (glib-2.0, libssl)
- Vérifier la version du système (Ubuntu 20.04+, Fedora 35+)
- Désactiver les extensions si présentes

---

## 🌐 Réseau & Ollama

### ❌ Impossible de se connecter à Ollama

**Symptôme**: "Ollama endpoint not available" ou "Connection timeout"

**Étapes de diagnostic**:

1. **Vérifier qu'Ollama tourne**:

   ```bash
   curl http://127.0.0.1:11434/api/tags
   # Doit retourner: {"models": [...]}
   ```

2. **Vérifier le port**:

   ```bash
   netstat -tulpn | grep 11434  # Linux
   lsof -i :11434  # macOS
   ```

3. **Vérifier la config TITANE**:
   - Settings → AI Providers → Ollama URL
   - Doit être: `http://127.0.0.1:11434`
   - Ou personnalisée si Ollama sur machine distante

4. **Vérifier les modèles disponibles**:
   ```bash
   curl http://127.0.0.1:11434/api/tags | jq .models
   ```

**Solutions**:

- Redémarrer Ollama: `killall ollama && ollama serve`
- Vérifier la connexion: `ping 127.0.0.1` (ou l'IP du serveur)
- Réinstaller Ollama depuis https://ollama.ai
- Ajouter un firewall rule si nécessaire

---

### 🔌 Lenteur de réponse Ollama

**Symptôme**: Réponses qui prennent > 30 secondes

**Étapes de diagnostic**:

1. **Tester la latence directe**:

   ```bash
   time curl -X POST http://127.0.0.1:11434/api/generate \
     -H "Content-Type: application/json" \
     -d '{"model":"mistral","prompt":"Hi","stream":false}'
   ```

2. **Vérifier l'utilisation système**:

   ```bash
   top -b -n 1 | grep ollama  # CPU/Memory usage
   free -h  # RAM disponible
   ```

3. **Vérifier la taille du modèle**:

   ```bash
   du -sh ~/.ollama/models/blobs/*
   ```

4. **Vérifier la connection réseau** (si distante):
   ```bash
   ping <OLLAMA_IP> && iperf3 -c <OLLAMA_IP>
   ```

**Solutions**:

- Réduire la taille du modèle (e.g., `mistral:7b` au lieu de `mistral:70b`)
- Ajouter de la RAM au serveur Ollama
- Réduire les paramètres: `temperature`, `top_p` dans Settings
- Utiliser un modèle quantifié (GGUF, Q4_K_M)

---

### 🚫 Erreur "Rate limit exceeded"

**Symptôme**: "Too many requests" après plusieurs appels rapides

**Étapes de diagnostic**:

1. **Vérifier les logs**:

   ```bash
   grep "Rate limit" ~/.titane/logs/app.log
   ```

2. **Identifier le pattern**:
   - Nombre de requêtes par minute?
   - Quelle API (Ollama, OpenAI, etc.)?

**Solutions**:

- Attendre 5-10 minutes avant de continuer
- Réduire la fréquence des appels
- Augmenter les délais d'attente (Settings → Advanced)
- Si Ollama local: augmenter `num_ctx` ou réduire `temperature`

---

## ⚡ Performance

### 🐢 L'interface est lente / laggy

**Symptôme**: Interface qui gèle ou respond lentement

**Étapes de diagnostic**:

1. **Ouvrir DevTools** (Ctrl+Shift+I ou Cmd+Shift+I):
   - Console → Chercher erreurs JavaScript
   - Performance → Enregistrer et analyser

2. **Vérifier l'utilisation RAM**:

   ```bash
   ps aux | grep Titan
   # Chercher > 1GB RAM usage
   ```

3. **Vérifier le cache**:

   ```bash
   du -sh ~/.titane/cache
   # Si > 500MB, doit être nettoyé
   ```

4. **Désactiver les extensions** (si pertinent)

**Solutions**:

- Fermer les onglets inutilisés
- Nettoyer le cache: Settings → Storage → Clear Cache
- Redémarrer l'application
- Vérifier la limite système: `ulimit -n` (> 4096 recommandé)

---

### 💾 Erreur "Out of Memory"

**Symptôme**: "Not enough memory" ou application quit soudainement

**Étapes de diagnostic**:

1. **Vérifier la RAM système**:

   ```bash
   free -h
   # Doit avoir > 2GB libre pour TITANE
   ```

2. **Vérifier la taille des fichiers**:

   ```bash
   du -sh ~/.titane/*
   ```

3. **Vérifier la limite de processus**:
   ```bash
   ps aux | wc -l
   ```

**Solutions**:

- Fermer d'autres applications
- Augmenter la swap: `fallocate -l 4G /swapfile && mkswap /swapfile`
- Nettoyer le cache: `rm -rf ~/.titane/cache/*`
- Réduire le `num_ctx` d'Ollama

---

## 🎨 Interface

### 🔲 Texte qui ne s'affiche pas correctement

**Symptôme**: Caractères manquants, encoding broken, ou texte pas visible

**Étapes de diagnostic**:

1. **Vérifier les polices**:
   - Settings → Appearance → Font
   - Essayer "System Default"

2. **Vérifier l'encoding**:

   ```bash
   locale
   # Doit montrer UTF-8
   ```

3. **Vérifier le zoom**:
   - Ctrl/Cmd + Mouse wheel pour ajuster

4. **Vérifier les logs**:
   ```bash
   grep -i "font\|encoding\|unicode" ~/.titane/logs/app.log
   ```

**Solutions**:

- Réinstaller les polices: `sudo apt install fonts-liberation fonts-noto` (Linux)
- Changer le locale: `export LANG=en_US.UTF-8`
- Redémarrer l'app

---

### 🎯 Boutons qui ne répondent pas

**Symptôme**: Clic sur bouton n'a aucun effet

**Étapes de diagnostic**:

1. **Ouvrir DevTools**:
   - Console → Chercher `Uncaught Error`
   - Network → Vérifier les requêtes

2. **Tester un redémarrage**:
   - Fermer complètement l'app (Ctrl+Q)
   - Réouvrir

3. **Vérifier les permissions**:
   - L'app a-t-elle permission d'accéder aux ressources?

**Solutions**:

- Cliquer à nouveau (peut être delayed)
- Vérifier la connexion réseau
- Redémarrer l'app
- Contacter support avec screenshot

---

## 💾 Base de Données

### ❌ Erreur "Database locked"

**Symptôme**: "Error: Database is locked" lors de certaines opérations

**Étapes de diagnostic**:

1. **Vérifier les processus** qui accèdent à la DB:

   ```bash
   lsof ~/.titane/data/main.db
   ```

2. **Vérifier les fichiers temp**:
   ```bash
   ls -la ~/.titane/data/
   # Chercher *.lock ou *.tmp
   ```

**Solutions**:

- Attendre quelques secondes et réessayer
- Tuer les processus bloquants: `pkill -f Titan`
- Nettoyer les fichiers lock: `rm ~/.titane/data/*.lock`
- Redémarrer l'app

---

### 📉 Performance DB lente

**Symptôme**: Requêtes qui prennent longtemps à répondre

**Étapes de diagnostic**:

1. **Analyser la taille DB**:

   ```bash
   sqlite3 ~/.titane/data/main.db ".tables"
   sqlite3 ~/.titane/data/main.db ".schema messages" | wc -l
   ```

2. **Vérifier les indices**:
   ```bash
   sqlite3 ~/.titane/data/main.db ".indices"
   ```

**Solutions**:

- Optimiser la DB: `sqlite3 ~/.titane/data/main.db "VACUUM;"`
- Archiver les anciennes données
- Augmenter la limite de WAL
- Contacter support

---

## 📞 Support & Escalade

### 🆘 Obtenir de l'aide

**Avant de contacter support**, veuillez préparer:

1. **Informations système**:

   ```bash
   uname -a
   cat /etc/os-release | grep -E "^NAME|^VERSION"
   free -h | head -2
   ```

2. **Logs TITANE** (derniers 100 lignes):

   ```bash
   tail -100 ~/.titane/logs/app.log > titane_logs.txt
   ```

3. **Version TITANE**:

   ```bash
   ./Titan-Stable --version  # ou voir Settings → About
   ```

4. **Reproduction steps**:
   - Préciser exactement comment reproduire le bug

### 📬 Contacter le Support

- **GitHub Issues**: https://github.com/KallokTherok1994/TITANE_INFINITY/issues
- **Email**: support@titane-infinity.dev (si disponible)
- **Documentation**: Voir README.md et docs/ pour plus

### 📊 Créer un Bug Report

Merci de fournir:

```markdown
## Bug Report

**Version**: TITANE v27.0.0
**OS**: [Linux/macOS/Windows] + version
**Reproduction Steps**:

1. ...
2. ...
3. ...

**Expected Behavior**:
[Ce qui devrait se passer]

**Actual Behavior**:
[Ce qui se passe réellement]

**Logs**:
[Voir section Logs ci-dessus]
```

---

## 🎓 FAQ Rapide

**Q: Comment réinitialiser TITANE complètement?**
A: `rm -rf ~/.titane` (⚠️ Supprime toutes les données)

**Q: Comment augmenter le level de log?**
A: `RUST_LOG=debug TITANE_DEBUG=1 ./Titan-Stable`

**Q: Où sont les données stockées?**
A: `~/.titane/` (Linux/macOS) ou `%APPDATA%\TITANE\` (Windows)

**Q: Comment utiliser un modèle Ollama personnalisé?**
A: Settings → AI Providers → Ollama Model, entrer le nom (e.g., `neural-chat:7b`)

**Q: Puis-je exporter mes données?**
A: Oui, Settings → Export Data (format JSON)

---

**Dernière mise à jour**: 2026-01-30  
**Status**: ✅ Production Ready (v27.0.0)
