# TITANE∞ — Runtime Observability Guide

**Phase** : PHASE_5 (Runtime Governance & Operational Integrity)  
**Version** : 1.0.0  
**Date** : 16 janvier 2026  

---

## 🎯 Objectif

Ce document définit comment **observer le comportement de TITANE∞** en production (Stable) et développement (Dev) sans improvisation, secrets exposés ou bruit inutile.

**Principe** : *Un système observable est un système gouvernable*.

---

## 📂 Structure des Logs

### Emplacement Standard

```
runtime/
├── dev/
│   └── logs/
│       ├── vite.log          # Frontend dev server
│       ├── vite.pid          # PID fichier pour cleanup
│       └── tauri.log         # Tauri dev runtime
│
└── stable/
    └── logs/
        ├── stable-build-YYYYMMDD-HHMMSS.log    # Builds production
        ├── appimage-run-YYYYMMDD-HHMMSS.log    # Smoke tests AppImage
        ├── installed-run-YYYYMMDD-HHMMSS.log   # Tests DEB installé
        └── stable-status-YYYYMMDD-HHMMSS.txt   # Snapshots état build
```

**Règles d'emplacement** :
- ✅ Logs **toujours** dans `runtime/<env>/logs/`
- ✅ Nom de fichier avec timestamp UTC : `YYYYMMDD-HHMMSS`
- ✅ Extension `.log` pour logs complets, `.txt` pour rapports
- ❌ **Jamais** de logs dans `src/`, `src-tauri/`, ou racine repo

---

## 📝 Format Standard

### Structure de ligne (recommandée)

```
[timestamp] [component] [level] message
```

**Exemples** :
```
2026-01-16T01:57:16Z tauri.dev INFO Vite ready on :5173
2026-01-16T01:57:20Z memory.core ERROR Failed to load memory_core_state.json: file not found
2026-01-16T01:57:25Z build.stable INFO Build completed: Titan-Stable_26.3.0_amd64.AppImage
```

### Niveaux (levels)

| Level | Usage | Exemples |
|-------|-------|----------|
| `DEBUG` | Détails internes (dev uniquement) | State transitions, function calls |
| `INFO` | Événements normaux | Startup, shutdown, request handling |
| `WARN` | Anomalies non-bloquantes | Missing optional config, retry attempts |
| `ERROR` | Erreurs bloquantes | Failed file I/O, network timeouts |
| `FATAL` | Erreurs système critiques | Out of memory, corruption detected |

**Stable** : `INFO`, `WARN`, `ERROR`, `FATAL` uniquement  
**Dev** : Tous niveaux autorisés

---

## 🔍 Signaux Normaux vs Anormaux

### Signaux NORMAUX (Stable)

✅ **Startup** :
```
INFO Main window shown successfully
INFO Memory core initialized
INFO SingularityBridge ready
```

✅ **Runtime** :
```
INFO Chat message generated (model: qwen2.5)
INFO Memory state saved: memory_core_state.json
INFO Telemetry snapshot: 245 events tracked
```

✅ **Shutdown** :
```
INFO Graceful shutdown initiated
INFO Memory state persisted
INFO Application exited (code: 0)
```

### Signaux ANORMAUX (Stable)

⚠️ **Warnings acceptables** :
```
WARN build-manifest.json not present (no recent build)
WARN Memory file empty, using defaults
```

❌ **Erreurs à investiguer** :
```
ERROR Unable to create memory directory: permission denied
ERROR Tauri command 'chat_generate' not found in allowlist
ERROR Panic in thread 'main': index out of bounds
ERROR Segmentation fault (core dumped)
```

🚨 **Fatals bloquants** :
```
FATAL Out of memory: cannot allocate 4GB
FATAL Allowlist validation failed: unauthorized command invoked
FATAL Database corruption detected: integrity check failed
```

---

## 🔐 Sécurité des Logs

### ❌ INTERDICTIONS ABSOLUES

Les logs ne doivent **JAMAIS** contenir :

1. **API Keys / Tokens** :
   ```
   ❌ DEBUG GEMINI_API_KEY=AIzaSy...
   ✅ INFO GEMINI_API_KEY configured (32 chars)
   ```

2. **Passwords / Secrets** :
   ```
   ❌ ERROR Auth failed for user:password@host
   ✅ ERROR Auth failed for user@host (invalid credentials)
   ```

3. **Données utilisateur sensibles** :
   ```
   ❌ INFO User SSN: 123-45-6789, Email: user@example.com
   ✅ INFO User profile loaded (id: abc123, email: u***@e***.com)
   ```

4. **Paths système complets** :
   ```
   ❌ ERROR Failed to read /home/user/.ssh/id_rsa
   ✅ ERROR Failed to read ~/.ssh/id_rsa
   ```

5. **Stack traces avec code propriétaire** :
   ```
   ❌ FATAL Panic at line 42: proprietary_algorithm_v3()
   ✅ FATAL Panic in chat_generate handler (see debug build for details)
   ```

### ✅ Bonnes pratiques

- **Redact secrets** : Remplacer clés par `***` ou `<redacted>`
- **Limit PII** : Logger IDs, pas noms/emails complets
- **Sanitize paths** : Utiliser chemins relatifs ou `~`
- **Truncate large data** : Max 200 chars par message
- **Strip ANSI colors** : Logs production en plain text

---

## 📊 Rotation et Rétention

### Dev Environment

- **Rotation** : Manuel (via `runtime/dev/cleanup.sh`)
- **Rétention** : Illimitée (logs locaux, développeur responsable)
- **Taille max** : Aucune limite (toléré)

### Stable Environment

- **Rotation** : Automatique par timestamp (1 fichier par build/run)
- **Rétention** : 
  - Builds : 30 derniers fichiers (env `STABLE_LOG_RETENTION=30`)
  - Smoke tests : 10 derniers (env `SMOKE_LOG_RETENTION=10`)
- **Taille max** : 10 MB par fichier (hard stop)

**Script de nettoyage** :
```bash
# Conserver derniers 30 logs stable-build
cd runtime/stable/logs
ls -t stable-build-*.log | tail -n +31 | xargs -r rm --
```

---

## 🔎 Comment Lire les Logs

### 1. Vérifier santé globale

```bash
# Health check rapide (< 2s)
bash scripts/health/health_check.sh --format text
cat docs/_evidence/health/latest.txt
```

### 2. Inspecter dernier build stable

```bash
# Trouver log le plus récent
LOG=$(ls -t runtime/stable/logs/stable-build-*.log | head -n 1)

# Chercher erreurs
grep -nE 'ERROR|FATAL|panic' "$LOG"

# Chercher warnings
grep -nE 'WARN' "$LOG"

# Vérifier artifacts générés
grep -nE 'AppImage|bundle/appimage|Finished release' "$LOG"
```

### 3. Diagnostiquer crash AppImage

```bash
# Dernier smoke test
LOG=$(ls -t runtime/stable/logs/appimage-run-*.log | head -n 1)

# Chercher patterns critiques
grep -nE '(Main window shown|ERROR|panic|segfault|Permission denied)' "$LOG"

# Vérifier exit code (dernière ligne)
tail -n 5 "$LOG"
```

### 4. Surveiller Dev runtime

```bash
# Tail Vite logs (frontend)
tail -f runtime/dev/logs/vite.log

# Tail Tauri logs (backend)
tail -f runtime/dev/logs/tauri.log

# Grep erreurs temps réel
tail -f runtime/dev/logs/tauri.log | grep --line-buffered ERROR
```

---

## 🛠️ Troubleshooting Common Issues

### Issue: "No logs produced"

**Symptômes** :
```bash
$ ls runtime/stable/logs/
ls: cannot access 'runtime/stable/logs/': No such file or directory
```

**Causes** :
1. Build script n'a pas créé le répertoire
2. Permissions filesystem

**Solution** :
```bash
mkdir -p runtime/stable/logs
chmod 755 runtime/stable/logs
```

---

### Issue: "Logs contain ANSI escape codes"

**Symptômes** :
```
^[[0;31mERROR^[[0m Failed to start
```

**Cause** : Couleurs terminaux non strippées

**Solution** :
```bash
# Strip ANSI lors de l'écriture
your_command 2>&1 | sed 's/\x1b\[[0-9;]*m//g' > log.txt

# Ou lire avec cat
cat log.txt | sed 's/\x1b\[[0-9;]*m//g'
```

---

### Issue: "Log file too large (>10MB)"

**Symptômes** :
```bash
$ du -h runtime/stable/logs/stable-build-20260116.log
87M     runtime/stable/logs/stable-build-20260116.log
```

**Causes** :
1. Build verbose avec warnings excessifs
2. Tests unitaires Rust avec `--nocapture`
3. Boucle infinie logging

**Solution** :
```bash
# Truncate à 10MB (keep end)
tail -c 10M runtime/stable/logs/stable-build-20260116.log > /tmp/truncated.log
mv /tmp/truncated.log runtime/stable/logs/stable-build-20260116.log

# Ou extraire markers importants
grep -E 'ERROR|WARN|Finished|AppImage' runtime/stable/logs/stable-build-20260116.log > summary.txt
```

---

### Issue: "Secrets exposed in logs"

**Symptômes** :
```
ERROR Failed to auth: Bearer sk-proj-abc123xyz...
```

**Impact** : 🚨 **CRITIQUE** — Sécurité compromise

**Action immédiate** :
1. **Rotate secrets** : Révoquer clé exposée, générer nouvelle
2. **Purge logs** : Supprimer fichier compromis
3. **Fix code** : Ajouter redaction avant logging
4. **Audit** : Chercher autres logs compromis

```bash
# Chercher API keys potentielles (patterns courants)
grep -rE '(api[_-]?key|token|password|secret).*[:=].*[A-Za-z0-9+/]{20,}' runtime/*/logs/

# Purger si trouvé
rm -f runtime/stable/logs/compromised-*.log
```

---

## 📋 Checklist Observabilité

Avant de considérer le système "observable" :

- [ ] Logs dans `runtime/<env>/logs/` uniquement
- [ ] Format timestamp | component | level | message
- [ ] Aucun secret (API keys, tokens, passwords)
- [ ] Aucun PII complet (emails, SSN, addresses)
- [ ] Rotation configurée (stable : 30 builds, 10 smoke)
- [ ] Health check < 2s disponible
- [ ] Documentation à jour (ce fichier)
- [ ] Équipe formée sur lecture logs

---

## 🔗 Références

- **Health Check** : `scripts/health/health_check.sh`
- **Reports** : `docs/_evidence/health/`
- **Build Logs** : `runtime/stable/logs/stable-build-*.log`
- **Dev Logs** : `runtime/dev/logs/{vite,tauri}.log`
- **Constitution Audit** : `scripts/audit/constitution-audit.sh`

---

## 📞 Support

**En cas de doute** :

1. **Health check** : `bash scripts/health/health_check.sh`
2. **Dernier build** : `cat runtime/stable/logs/stable-build-*.log | tail -n 100`
3. **Dernier smoke test** : `cat runtime/stable/logs/appimage-run-*.log | tail -n 50`
4. **Grep erreurs** : `grep -rn ERROR runtime/stable/logs/ | tail -n 20`

**Si secrets exposés** : Voir section "Issue: Secrets exposed in logs" ci-dessus.

---

**Version** : 1.0.0  
**Last Updated** : 16 janvier 2026  
**Maintainer** : TITANE∞ Core Team  
**Status** : ✅ SEALED (PHASE_5 BLOC B)
