# 📦 LEGACY CODE — TITANE∞

Ce dossier contient le **code obsolète** identifié lors des audits de conformité et migrations architecturales.

## 🎯 Objectif

Centraliser tout code déprécié pour:

- ✅ Éviter la pollution du code principal
- ✅ Faciliter la suppression future
- ✅ Garder une trace historique
- ✅ Permettre des rollbacks si nécessaire

## 📂 Structure

```
legacy/
├── frontend/           # Code TypeScript/React obsolète
├── backend/            # Code Rust obsolète
├── scripts/            # Scripts shell dépréciés
└── docs/               # Documentation archivée
```

## 🚫 Règle d'Or

**AUCUN nouveau code ne doit être ajouté ici.**

Ce dossier est **READ-ONLY** sauf pour migration de code existant obsolète.

## 📋 Fichiers Migrés

### Phase 1 (15 décembre 2025)

**Frontend**:

- `src/hooks/archived/useChat_OMNIS_v1.ts` → `legacy/frontend/hooks/`
  - Raison: Utilise `any`, remplacé par OMEGA v2

**Backend**:

- `src-tauri/src/main_backup.rs` → `legacy/backend/`
  - Raison: Backup obsolète

**Scripts**:

- (À identifier lors de la consolidation scripts shell)

## ⏰ Politique de Suppression

Les fichiers dans `/legacy/` seront supprimés selon ce calendrier:

- **< 3 mois**: Conservation pour rollback rapide
- **3-6 mois**: Révision trimestrielle
- **> 6 mois**: Suppression définitive (sauf décision contraire)

## 🔍 Recherche dans Legacy

Pour chercher si un fichier a été migré:

```bash
# Rechercher un fichier
find legacy/ -name "useChat*.ts"

# Rechercher un pattern
grep -r "chat_send_message" legacy/
```

## 📝 Convention de Nommage

Lors de la migration:

```
{original_path}/{filename} → legacy/{category}/{original_path}/{filename}
```

Exemple:

```
src/hooks/archived/useChat_OMNIS_v1.ts
  → legacy/frontend/hooks/archived/useChat_OMNIS_v1.ts
```

## ⚠️ Important

**NE PAS importer de code depuis `/legacy/` dans le code actif.**

Si un besoin apparaît:

1. Extraire la fonction nécessaire
2. La refactorer selon les standards actuels
3. L'intégrer dans le code principal
4. NE PAS faire de lien direct vers `/legacy/`

---

**Date de création**: 15 décembre 2025  
**Dernière mise à jour**: 15 décembre 2025
