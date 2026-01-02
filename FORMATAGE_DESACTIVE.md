# ⚠️ ATTENTION: FORMATAGE AUTOMATIQUE DÉSACTIVÉ

**Date:** 2 janvier 2026  
**Raison:** Protection contre suppressions automatiques de champs

## Problème Rencontré

Le formateur automatique (rust-analyzer/rustfmt) a supprimé les champs `default_task_timeout_ms` **8 FOIS** durant cette session, malgré:

1. ❌ Commentaires de protection
2. ❌ Commentaires renforcés avec "NE PAS SUPPRIMER"
3. ❌ Directive `#[rustfmt::skip]` sur `impl Default`
4. ❌ Directive `#[rustfmt::skip]` sur chaque fonction
5. ❌ Configuration `.rustfmt.toml`

## Solution Appliquée (NUCLÉAIRE)

### 1. Formatage Désactivé
`.vscode/settings.json`
```json
{
  "editor.formatOnSave": false  // DÉSACTIVÉ
}
```

### 2. Fichier Verrouillé (Lecture Seule)
```bash
chmod 444 src-tauri/src/agent_system/config.rs
ls -l src-tauri/src/agent_system/config.rs
# -r--r--r-- (lecture seule)
```

### Fichiers Protégés
- `src-tauri/src/agent_system/config.rs`
- **NE PAS** activer format-on-save pour ce fichier
- Utiliser `git checkout` si champs disparaissent

## Vérification Rapide

```bash
# Compter les occurrences (doit retourner 4)
grep -c "default_task_timeout_ms" src-tauri/src/agent_system/config.rs

# Restaurer si problème
git checkout src-tauri/src/agent_system/config.rs
```

## Instructions Développeurs

⚠️ **NE PAS:**
- Activer format-on-save global
- Formater manuellement config.rs
- Supprimer les directives `#[rustfmt::skip]`

✅ **FAIRE:**
- Laisser formatOnSave désactivé
- Vérifier compilation après modifications
- Restaurer depuis git si champs disparus

---

**Ce problème a coûté 8 restaurations durant une session.**  
**La solution est drastique mais nécessaire.**
