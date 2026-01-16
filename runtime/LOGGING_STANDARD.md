# TITANE∞ — Logging Standard (B1)

**Phase** : PHASE_5 — Runtime Governance & Operational Integrity  
**Version** : 1.0.0  
**Date** : 16 janvier 2026

---

## 🎯 Standard Minimal (Contraintes)

Ce document définit le **contrat obligatoire** pour tous les logs TITANE∞.

### Emplacement

```
runtime/<env>/logs/<component>-<timestamp>.log
```

**Règles** :

- `<env>` : `dev` ou `stable`
- `<component>` : nom descriptif (vite, tauri, stable-build, appimage-run, etc.)
- `<timestamp>` : `YYYYMMDD-HHMMSS` (UTC)
- Extension : `.log` (logs complets) ou `.txt` (rapports/summaries)

**Exemples valides** :

```
runtime/dev/logs/vite.log
runtime/dev/logs/tauri.log
runtime/stable/logs/stable-build-20260116-015716.log
runtime/stable/logs/appimage-run-20260116-020045.log
```

**Exemples interdits** :

```
❌ logs/build.log                     (hors runtime/)
❌ src-tauri/debug.log                 (dans code source)
❌ runtime/stable/build.log            (pas de timestamp)
❌ /tmp/titane-stable.log              (hors repo)
```

---

## 📝 Format de Ligne

### Structure Standard

```
[timestamp] [component] [level] message
```

**Champs** :

- `timestamp` : ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`)
- `component` : Nom du module/service (max 20 chars)
- `level` : `DEBUG` | `INFO` | `WARN` | `ERROR` | `FATAL`
- `message` : Texte libre (max 200 chars recommandé)

**Exemples** :

```
2026-01-16T01:57:16Z tauri.dev INFO Vite ready on :5173
2026-01-16T01:57:20Z memory.core ERROR Failed to load memory_core_state.json: file not found
2026-01-16T01:57:25Z build.stable INFO Build completed: Titan-Stable_26.3.0_amd64.AppImage (87MB)
```

### Format Alternatif (Shell Scripts)

Si l'implémentation complète est complexe, minimum acceptable :

```
[component] [timestamp] message
```

**Exemple** :

```
[build.stable] 2026-01-16T01:57:25Z Build completed: Titan-Stable_26.3.0_amd64.AppImage
```

---

## 🔐 Interdictions Absolues

### Secrets et Credentials

❌ **Jamais logger** :

- API keys : `GEMINI_API_KEY`, `OPENAI_API_KEY`, etc.
- Tokens : Bearer tokens, JWT, OAuth secrets
- Passwords : En clair, hashés, ou partiels
- Private keys : SSH, TLS, signing keys
- Database credentials : URLs avec user:pass

✅ **À la place** :

```
❌ DEBUG GEMINI_API_KEY=AIzaSyAbC123...
✅ INFO GEMINI_API_KEY configured (32 chars)

❌ ERROR Failed to connect: postgres://user:pass@localhost/db
✅ ERROR Failed to connect: postgres://user@localhost/db (auth failed)
```

### PII (Personally Identifiable Information)

❌ **Jamais logger complet** :

- Emails : `user@example.com`
- SSN / Tax IDs
- Phone numbers
- Full names
- Addresses

✅ **Redaction acceptable** :

```
❌ INFO User logged in: john.doe@example.com
✅ INFO User logged in: j***@e***.com (id: abc123)

❌ ERROR Invalid SSN: 123-45-6789
✅ ERROR Invalid SSN format (pattern: XXX-XX-XXXX)
```

### Paths et Code

❌ **Éviter** :

- Paths absolus système : `/home/user/.ssh/id_rsa`
- Code propriétaire dans stack traces
- Secrets dans variables d'environnement

✅ **Alternatives** :

```
❌ ERROR Failed to read /home/user/.config/titane/secrets.json
✅ ERROR Failed to read ~/.config/titane/secrets.json

❌ FATAL Panic at src/core/proprietary_algo.rs:42
✅ FATAL Panic in chat handler (see debug build for stack)
```

---

## 🔄 Rotation et Nettoyage

### Dev Environment

- **Rotation** : Manuel (via `runtime/dev/cleanup.sh`)
- **Rétention** : Illimitée (développeur responsable)

### Stable Environment

- **Rotation** : Automatique par timestamp (1 fichier = 1 build/run)
- **Rétention** :
  ```bash
  # Variables d'environnement
  STABLE_LOG_RETENTION=30      # Builds
  SMOKE_LOG_RETENTION=10       # Smoke tests
  ```
- **Cleanup** :
  ```bash
  # Garder derniers N logs
  cd runtime/stable/logs
  ls -t stable-build-*.log | tail -n +31 | xargs -r rm --
  ls -t appimage-run-*.log | tail -n +11 | xargs -r rm --
  ```

### Taille Max

- **Hard limit** : 10 MB par fichier
- **Action si dépassé** : Truncate ou split
  ```bash
  # Truncate à 10MB (keep end)
  tail -c 10M large.log > truncated.log
  ```

---

## 📊 Niveaux de Log (Levels)

| Level   | Stable | Dev | Usage                                      |
| ------- | ------ | --- | ------------------------------------------ |
| `DEBUG` | ❌     | ✅  | Détails internes (state, function calls)   |
| `INFO`  | ✅     | ✅  | Événements normaux (startup, requests)     |
| `WARN`  | ✅     | ✅  | Anomalies non-bloquantes (retry, fallback) |
| `ERROR` | ✅     | ✅  | Erreurs bloquantes (I/O fail, timeout)     |
| `FATAL` | ✅     | ✅  | Critiques système (OOM, corruption)        |

**Stable** : Production → `INFO` minimum  
**Dev** : Development → Tous niveaux autorisés

---

## ✅ Validation Compliance

### Checklist

- [ ] Logs dans `runtime/<env>/logs/` uniquement
- [ ] Format : `[timestamp] [component] [level] message`
- [ ] Timestamps UTC (ISO 8601)
- [ ] Aucun secret (API keys, tokens, passwords)
- [ ] Aucun PII complet (emails, SSN)
- [ ] Paths relatifs (pas `/home/user/...`)
- [ ] ANSI colors strippés (production)
- [ ] Taille < 10MB par fichier
- [ ] Rotation configurée (stable: 30+10)

### Test Automatique

```bash
# Chercher secrets potentiels
grep -rE '(api[_-]?key|token|password|secret).*[:=].*[A-Za-z0-9+/]{20,}' \
  runtime/stable/logs/ runtime/dev/logs/

# Chercher emails
grep -rE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' \
  runtime/stable/logs/

# Chercher paths absolus
grep -rE '/home/[a-z0-9_-]+/' runtime/stable/logs/

# Exit 1 si trouvé
```

---

## 🔗 Références

- **Documentation complète** : `docs/RUNTIME_OBSERVABILITY.md`
- **Health Check** : `scripts/health/health_check.sh`
- **Constitution Audit** : `scripts/audit/constitution-audit.sh`

---

**Status** : ✅ SEALED (PHASE_5 BLOC B)  
**Next Review** : PHASE_6 (si applicable)
