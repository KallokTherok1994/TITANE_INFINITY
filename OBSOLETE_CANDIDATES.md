# OBSOLETE CANDIDATES - TITANE∞ v26.3.0

**Analyse des fichiers suspects d'obsolescence**

## 🚨 CANDIDATS CRITIQUES

### Logs et Rapports Temporaires
- `runtime/stable/logs/final-audit-20260115-120003.md` - Log d'audit daté
- `reports/bootfix/2026-01-17_0014/` - Dossier de fix temporaire
- `dev_tauri_log.txt`, `dev_tauri_clean_log.txt`, etc. - Logs de développement

### Fichiers de Test Temporaires
- `tmp_import_useChat.mjs` - Fichier temporaire
- `test_chat_backend.py`, `test_vision.py`, etc. - Scripts de test Python (non intégrés)

### Configurations Alternatives
- `tauri.base.json` - Config alternative (remplacé par tauri.conf.json)
- `runtime/dev/tauri.dev.conf.json` - Config dev (intégrée dans tauri.conf.json)

### Archives et Sauvegardes
- `_archive/` - Contenu archivé (mais pas encore nettoyé)
- `_backup_20251218_152527/` - Backup daté

## ⚠️ CANDIDATS MODÉRÉS

### Scripts de Développement
- `build-fast.sh` - Script build alternatif
- `transformation-start.sh` - Script de transformation
- `activate-node24.sh` - Activation Node spécifique

### Fichiers de Configuration Temporaires
- `SECURITY_RESTRICTIONS_DISABLED.md` - Restrictions désactivées
- `SINGULARITYBRIDGE_DISABLED.txt` - Fonctionnalité désactivée

### Documentation Obsolète
- Fichiers avec dates < 2026-01-01
- `MISSION_COMPLETE_FINAL_v26.3.0.md` - Mission terminée
- `TECHNOLOGICAL_SINGULARITY_ACHIEVED_v26.3.0.md` - Achèvement signalé

## ✅ CANDIDATS À CONSERVER

### Archives Gouvernées
- `_archive/` doit être conservé mais nettoyé
- Index d'archive à maintenir

### Logs d'Audit
- `AUDIT_REPORT.md` - Rapport d'audit principal
- `docs/_evidence/` - Évidences de certification

### Scripts Utiles
- Scripts de déploiement et CI/CD
- Scripts de sécurité et vérification

## 📊 STATISTIQUES

- **Total fichiers analysés :** ~800
- **Candidats critiques :** ~50
- **Candidats modérés :** ~30
- **À conserver :** ~720

## 🎯 RECOMMANDATIONS

1. **Archivage immédiat :** Logs temporaires, backups datés
2. **Archivage conditionnel :** Scripts non utilisés depuis 30 jours
3. **Conservation :** Archives gouvernées avec index

**Action :** Déplacer vers `_archive/2026-01-17/` avec justification
