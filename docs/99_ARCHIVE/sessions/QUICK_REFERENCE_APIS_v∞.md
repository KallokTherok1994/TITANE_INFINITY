# 🎯 QUICK REFERENCE — APIs OpenAI & Anthropic

## ✅ CORRECTION APPLIQUÉE

**Fichier**: `src/lib/security.ts`
**Action**: Ajout 11 commandes manquantes dans `ALLOWED_COMMANDS`

```typescript
'get_openai_key_status',
'get_anthropic_key_status',
'chat_set_openai_key',
'chat_set_anthropic_key',
'get_ia_policies',
'get_permission_matrix',
'get_security_log',
'secure_store_secret',
'get_secrets_status',
'has_secret',
'delete_secret',
```

## 🧪 VALIDATION

```bash
./scripts/validate-apis-complete.sh
```

**Résultat**: ✅ 8/8 tests passés

## 🚀 UTILISATION

### 1. Démarrer
```bash
pnpm run tauri:dev
```

### 2. Configurer
**Centre Gouvernance → Secrets**
- OpenAI: `sk-proj-...`
- Anthropic: `sk-ant-api03-...`

### 3. Tester
**Chat OMEGA**
- Provider: `openai` ou `anthropic`
- Envoyer message
- ✅ Réponse reçue

## 📊 STATUT

| Composant | Statut |
|-----------|--------|
| Backend | ✅ |
| Frontend | ✅ |
| Sécurité | ✅ |
| Tests | ✅ 8/8 |
| **GLOBAL** | ✅ **100%** |

---

**Version**: TITANE∞ v19.3
**Date**: 2025-12-05
**Statut**: ✅ OPÉRATIONNEL
