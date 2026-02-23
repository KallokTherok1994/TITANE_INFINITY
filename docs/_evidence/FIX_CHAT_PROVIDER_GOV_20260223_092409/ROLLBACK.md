# ROLLBACK — FIX CHAT PROVIDER GOV

**Date:** 2026-02-23  
**Status:** READY (patch appliqué, rollback testé)

---

## MÉTHODE 1: Restore direct (si non commité)

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

git restore src-tauri/src/conversation_engine/commands.rs
git restore src/services/conversationEngine.ts
git restore src/hooks/useConversationEngine.ts
```

**Temps:** <1s  
**Risque:** ❌ Aucun (restaure version HEAD)  
**Impact:** Annule les 3 patches

---

## MÉTHODE 2: Revert commit (si commité)

```bash
# Identifier le commit
git log --oneline | head -5

# Revert (créer commit inverse)
git revert <commit_hash>
```

**Temps:** <5s  
**Risque:** ❌ Aucun (safe revert)  
**Impact:** Annule les 3 patches + crée commit revert

---

## MÉTHODE 3: Rollback manuel (destructif, non recommandé)

```bash
# Reset hard au commit précédent
git reset --hard HEAD~1
```

**Temps:** <1s  
**Risque:** ⚠️ PERTE changements non commités  
**Impact:** Annule tout depuis dernier commit

⚠️ **NON RECOMMANDÉ** sauf urgence critique

---

## VÉRIFICATION POST-ROLLBACK

### 1. Git status

```bash
git status
# Attendu: clean ou "3 files changed" si restore
```

### 2. Compilation

#### Rust
```bash
cargo check --manifest-path src-tauri/Cargo.toml
# Attendu: OK (compilation sans erreur)
```

#### TypeScript
```bash
pnpm run check
# Attendu: Erreurs identiques au baseline (si existaient avant)
```

### 3. VSCode errors

```bash
code /home/titane-os/Documents/GitHub/TITANE_INFINITY
# Ouvrir fichiers modifiés, vérifier aucune erreur rouge
```

---

## FICHIERS IMPACTÉS PAR ROLLBACK

| Fichier | État avant patch | État après rollback |
|---------|------------------|---------------------|
| `src-tauri/src/conversation_engine/commands.rs` | v27.0.2 original | v27.0.2 original ✅ |
| `src/services/conversationEngine.ts` | v∞ original | v∞ original ✅ |
| `src/hooks/useConversationEngine.ts` | v∞ original | v∞ original ✅ |

**Fichiers NON touchés par rollback:**
- `docs/_evidence/FIX_CHAT_PROVIDER_GOV_20260223_092409/**` (preuve conservée)
- Tous les autres fichiers du repo

---

## SCÉNARIOS ROLLBACK

### Scénario A: Patch cassé (compilation fail)

**Action:**
```bash
git restore src-tauri/src/conversation_engine/commands.rs
cargo check --manifest-path src-tauri/Cargo.toml
```

**Temps:** <10s  
**Résultat:** Backend restauré, frontend peut rester patché si séparable

### Scénario B: Régression UX (offline affiché incorrectement)

**Action:**
```bash
git restore src/hooks/useConversationEngine.ts
```

**Temps:** <5s  
**Résultat:** UI restaurée, observabilité conservée (conversationEngine.ts + commands.rs)

### Scénario C: Logs trop verbeux (performance)

**Action:**
```bash
git restore src/services/conversationEngine.ts
```

**Temps:** <5s  
**Résultat:** Logs CONV_SEND/CONV_RECV supprimés, UI detection conservée

### Scénario D: Rollback total (urgence)

**Action:**
```bash
git restore src-tauri/src/conversation_engine/commands.rs \
            src/services/conversationEngine.ts \
            src/hooks/useConversationEngine.ts
```

**Temps:** <2s  
**Résultat:** Tout annulé, retour baseline

---

## VALIDATION ROLLBACK

### Checklist

- [ ] `git status` → clean ou changes explicites
- [ ] `cargo check` → OK
- [ ] VSCode errors → aucune nouvelle erreur
- [ ] `git diff` → fichiers restaurés identiques baseline
- [ ] Logs console → plus de [CONV_SEND]/[CONV_RECV]

### Test rapide (optionnel)

```bash
# Si app buildable
pnpm run dev:tauri
# Envoyer message, vérifier comportement baseline
```

---

## TEMPS DE ROLLBACK ESTIMÉ

| Méthode | Temps | Difficulté | Sécurité |
|---------|-------|------------|----------|
| Restore direct | <5s | ⭐ Facile | ✅ Safe |
| Revert commit | <10s | ⭐⭐ Moyen | ✅ Safe |
| Reset hard | <2s | ⭐⭐⭐ Expert | ⚠️ Risque |

**RECOMMANDATION:** Restore direct (méthode 1)

---

## SUPPORT

**Si rollback échoue:**

1. Vérifier git status: `git status --porcelain=v1`
2. Vérifier HEAD: `git log --oneline -1`
3. Forcer restore: `git checkout HEAD -- <file>`
4. Si conflit merge: `git merge --abort`

**Escalade:**
- Backup preuve: `cp -r docs/_evidence /tmp/`
- Reset repo: `git reset --hard origin/MAIN`
- Restore preuve: `cp -r /tmp/_evidence docs/`

---

**FIN ROLLBACK**
