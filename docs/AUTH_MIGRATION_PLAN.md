# 🔐 TITANE∞ AUTH & DEV TOKEN OS — PLAN DE MIGRATION

**Date**: 10 Décembre 2025  
**Version**: AuthOS v1.0  
**Objectif**: Centraliser toute la gestion des tokens, API keys, et authentification

---

## 📋 RÉSUMÉ EXÉCUTIF

### Vision
Remplacer le système actuel dispersé (API keys ici, dev token là, config ailleurs) par **un seul système centralisé et gouverné : AuthOS**.

### Problématiques Actuelles
- ❌ **Dispersion**: Clés API dans `secure_commands.rs`, dev token dans `developer_mode.rs`, config dans gouvernance
- ❌ **Duplication**: Logique similaire répétée (validation, chiffrement, stockage)
- ❌ **Pas de rôles unifiés**: Aucun système de permissions centralisé
- ❌ **Dev Token incomplet**: Génération OK, mais pas de validation/persistance robuste
- ❌ **Hard-coded secrets**: Risque de commit accidentel

### Solution AuthOS
- ✅ **Module Rust unique**: `src-tauri/src/auth/` (Keystore, DevToken, ApiKeys, Roles)
- ✅ **Frontend unifié**: `src/core/auth/` (authClient, authStore, useAuth hook)
- ✅ **Sécurité**: AES-256-GCM encryption, Argon2id key derivation
- ✅ **Gouvernance**: Permission matrix, audit logs, role-based access
- ✅ **Migration propre**: Plan détaillé, tests, validation

---

## 🔍 PHASE 0 — CARTOGRAPHIE COMPLÈTE

### Analyse du Repo TITANE_INFINITY

#### A. Occurrences "Dev Token / Developer Mode"

| Fichier | Ligne(s) | Contexte | Problème Actuel |
|---------|----------|----------|-----------------|
| **Backend Rust** |
| `src-tauri/src/engines/developer_mode.rs` | 122-135 | `DeveloperModeState` struct | État dev mode local, pas de token validation |
| `src-tauri/src/engines/developer_mode.rs` | 172-191 | `dev_mode_get_state()` | Hard-coded user "Kevin Thibault", pas de token |
| `src-tauri/src/engines/developer_mode.rs` | 200-218 | `dev_mode_toggle()` | Vérifie nom utilisateur, mais pas de token auth |
| `src-tauri/src/commands/engines_commands.rs` | 146-163 | Commands export | Expose `engines_devmode_enable(auth_token)` mais non implémenté |
| **Frontend TypeScript** |
| `src/features/developer-mode/DeveloperModePage.tsx` | 50-52 | `authToken` state | Input password pour token, mais jamais validé côté backend |
| `src/features/developer-mode/DeveloperModePage.tsx` | 109-125 | Token activation UI | Appelle `enable(authToken)` mais backend ignore le token |
| `src/features/developer-mode/useDeveloperMode.ts` | 25-48 | `useDeveloperMode()` hook | Appelle `engines_devmode_enable` avec token, mais backend ne vérifie rien |
| `src/features/developer-mode/types.ts` | 68-85 | `DeveloperModeState` type | Type TS mirror du Rust, cohérent |
| `src/lib/security.ts` | 609-622 | Secure commands list | Liste commands devmode, mais pas de token commands |
| **Documentation** |
| `QUICK_START_v∞.3.md` | 233+ | Mode Dev activation | Mention config mais pas de token workflow |
| `docs/DUAL_RUNTIME_WORKFLOW.md` | 347+ | Dev vs Stable runtime | Config runtime, mais pas de token auth |
| `docs/architecture/DEVTOOLS_BACKEND_API_DESIGN.md` | 765+ | DevTools security | TODO: JWT/session auth mentionné mais non implémenté |

**Total**: 15+ fichiers mentionnent dev token/mode  
**Problème**: Aucun système de génération/validation/stockage token unifié

#### B. Occurrences "API Keys" (Gemini, OpenAI, Anthropic)

| Fichier | Ligne(s) | Fonction | Problème Actuel |
|---------|----------|----------|-----------------|
| **Backend Rust** |
| `src-tauri/src/secure_commands.rs` | 1-668 | Gestion clés API complète | ✅ Bon chiffrement (SecureSecretsEngine), mais logique éparpillée |
| `src-tauri/src/secure_commands.rs` | 124-149 | `chat_set_gemini_key()` | ✅ Validation OK, chiffrement OK |
| `src-tauri/src/secure_commands.rs` | 188-204 | `get_gemini_key_status()` | ✅ Status OK avec masking |
| `src-tauri/src/secure_commands.rs` | 206-268 | `chat_set_openai_key()` | ✅ Similaire Gemini |
| `src-tauri/src/secure_commands.rs` | 308-370 | `chat_set_anthropic_key()` | ✅ Similaire Gemini |
| `src-tauri/src/main.rs` | 402-407 | Commands export | Expose 6 commands (set/get x 3 providers) |
| `src-tauri/src/api_hub/temporal_integration_tests.rs` | 107, 229 | Tests `max_tokens` | Tests API calls, pas de clés |
| **Frontend TypeScript** |
| `src/features/governance-center/services/governanceService.ts` | 1-354 | Bridge frontend→backend | ✅ Appels sécurisés via `safeInvoke()` |
| `src/features/governance-center/services/governanceService.ts` | 53-69 | `getGeminiStatus()`, `setGeminiKey()` | ✅ Normalization OK |
| `src/features/governance-center/services/governanceService.ts` | 71-103 | OpenAI + Anthropic similaire | ✅ Pattern cohérent |
| `src/features/governance-center/GovernanceCenter.tsx` | 29-70 | Handlers set keys | ✅ Appelle services correctement |
| `src/features/governance-center/GovernanceCenter.tsx` | 166-182 | UI provider cards | ✅ Affichage status OK |
| `src/features/governance-center/components/APIProviderCard.tsx` | 13-85 | Card composant | ✅ Type-safe avec guards |
| `src/features/governance-center/types.ts` | 306-342 | `GovernanceState` type | ✅ State bien typé |
| `src/ui/pages/ChatIA/ChatIA.tsx` | 103 | `get_gemini_key_status` appel | ✅ Check status avant chat |
| `src/pages/DevTools.tsx` | 210-243 | Input API key Gemini | ⚠️ DevTools UI séparée (doublon) |
| **Scripts** |
| `scripts/activate_chat_apis.sh` | 100-121 | Activation interactive | ⚠️ Stocke clés en JSON local (non chiffré) |
| `scripts/test-apis-openai-anthropic.sh` | 68-82 | Tests commands | ✅ Vérifie exports dans main.rs |
| `scripts/validate-apis-complete.sh` | 26-99 | Validation intégration | ✅ Checks commandes présentes |
| **Documentation** |
| `ACTIVATION_CHAT_IA_APIs_v19.3.0.md` | 91-185 | Guide activation clés | ✅ Instructions pour Gemini/OpenAI/Anthropic |
| `AUDIT_API_COMPLET_v19.3.0.md` | 109-513 | Audit complet API commands | ✅ Documentation exhaustive |
| `FIX_API_COMMANDS_DEVTOOLS_v19.3.txt` | 11-443 | Fixes commands DevTools | ✅ Historique corrections |
| `AI_PROVIDER_INTEGRATION_PHASE1_COMPLETE_v∞.md` | 72-462 | Intégration providers complète | ✅ Doc complète multi-provider |

**Total**: 25+ fichiers mentionnent API keys  
**Problème**: Logique OK mais éparpillée entre `secure_commands.rs`, `governance-center/`, et DevTools

#### C. Occurrences "Roles / Permissions"

| Fichier | Ligne(s) | Contexte | Problème Actuel |
|---------|----------|----------|-----------------|
| **Backend Rust** |
| `src-tauri/src/security/permissions.rs` | 21-120 | `Role` enum + `SecureAction` | ✅ Roles définis (Root, Dev, User) |
| `src-tauri/src/security/permissions.rs` | 35-95 | `SecureAction` enum | ✅ Actions granulaires (MemoryRead, IaGenerate, etc.) |
| `src-tauri/src/security/permission_guard.rs` | (non lu) | Permission checks | ✅ Guard implémenté (utilisé dans secure_commands) |
| `src-tauri/src/secure_commands.rs` | 130-135 | `PERMISSION_GUARD.require()` | ✅ Vérifie Role::Root pour set_gemini_key |
| `src-tauri/src/commands/chat_modes.rs` | 202-220 | `permission_level` dans modes | ⚠️ Levels 1-3 mais pas lié aux Roles |
| **Frontend TypeScript** |
| `src/features/governance-center/types.ts` | 306-342 | `PermissionMatrix`, `PermissionAudit` | ✅ Types TS pour permissions |
| `src/features/governance-center/types.ts` | 338-342 | `isSuperAdmin()` helper | ✅ Check userId === Kevin |
| `src/services/evolutionEngine/evolutionEngine.config.ts` | 787-800 | `requiredRole: 'DEV'/'ADMIN'` | ⚠️ Roles custom évolution (pas liés à auth) |
| `src/services/ai/chatModes.config.ts` | 192-218 | `TOOLS_MINIMAL`, `TOOLS_DEV`, `TOOLS_ADMIN` | ⚠️ Permissions outils mais pas liées à user roles |

**Total**: 10+ fichiers mentionnent roles/permissions  
**Problème**: Système de permissions existe (Rust) mais pas lié à l'authentification user (pas de user DB, pas de session)

#### D. Occurrences "Keystore / Secrets Storage"

| Fichier | Ligne(s) | Contexte | Problème Actuel |
|---------|----------|----------|-----------------|
| **Backend Rust** |
| `src-tauri/src/secure_engine.rs` | (non lu, inféré) | `SecureSecretsEngine` | ✅ Chiffrement AES-256-GCM implémenté |
| `src-tauri/src/secure_commands.rs` | 9-20 | Imports `SecureSecretsEngine` | ✅ Utilisé pour API keys |
| `src-tauri/src/secure_commands.rs` | 54-98 | `mask_secret_for_display()` | ✅ Masking secrets pour affichage |
| `src-tauri/src/secure_commands.rs` | 100-124 | `build_gemini_status_sync()` | ✅ Lecture keystore + masking |
| `src-tauri/src/secure_commands.rs` | 149-184 | Save secret + purge env | ✅ Stocke clé + supprime env var |
| **Frontend TypeScript** |
| (Aucun fichier frontend n'accède directement au keystore) | - | Tout passe par Tauri commands | ✅ Bon pattern |

**Total**: 6 fichiers utilisent keystore  
**Problème**: Keystore fonctionne mais **pas de structure unifiée** (un seul fichier `keystore.json` avec toutes les clés ?)

#### E. Hard-coded Secrets / Risques

| Fichier | Ligne(s) | Type Secret | Risque | Action |
|---------|----------|-------------|--------|--------|
| `src-tauri/src/engines/developer_mode.rs` | 204 | User name "Kevin Thibault" | ⚠️ Hard-coded | Déplacer vers AuthOS (owner config) |
| `scripts/activate_chat_apis.sh` | 119-121 | API keys en JSON clair | ❌ CRITIQUE | Supprimer script ou chiffrer output |
| `.env` (root) | (si existe) | API keys en clair | ❌ CRITIQUE | Migrer vers keystore AuthOS |
| (Aucun autre) | - | - | ✅ Bon | Pas de secrets en dur dans code |

**Total**: 3 risques identifiés  
**Action**: Migrer vers AuthOS keystore + supprimer scripts non sécurisés

---

## 📊 TABLEAU RÉCAPITULATIF: ANCIEN SYSTÈME → NOUVEAU SYSTÈME

| Composant | Ancien Système | Nouveau Système (AuthOS) | Migration |
|-----------|----------------|--------------------------|-----------|
| **Dev Token** |
| Génération | ❌ Non implémenté | ✅ `auth::dev_token::generate_dev_token()` | **Créer nouveau** |
| Validation | ❌ Backend ignore token | ✅ `auth::dev_token::validate_dev_token()` | **Créer nouveau** |
| Stockage | ❌ Aucun (state volatil) | ✅ Keystore `dev_token` key | **Créer nouveau** |
| Format | ❌ Indéfini | ✅ `TITANE-DEV-KEY-<hex64>` | **Créer nouveau** |
| Owner | ✅ Hard-coded "Kevin Thibault" | ✅ `roles::ensure_owner_role()` | **Migrer** |
| **API Keys** |
| Gemini | ✅ `chat_set_gemini_key()` OK | ✅ `auth::api_keys::save_api_keys()` | **Wrapper existant** |
| OpenAI | ✅ `chat_set_openai_key()` OK | ✅ `auth::api_keys::save_api_keys()` | **Wrapper existant** |
| Anthropic | ✅ `chat_set_anthropic_key()` OK | ✅ `auth::api_keys::save_api_keys()` | **Wrapper existant** |
| Validation | ✅ `PayloadValidator::validate_string()` | ✅ Garder + ajouter regex formats | **Améliorer** |
| Chiffrement | ✅ `SecureSecretsEngine` (AES-256-GCM) | ✅ `auth::keystore` (même algo) | **Wrapper existant** |
| Masking | ✅ `mask_secret_for_display()` | ✅ `auth::keystore::mask_secret()` | **Déplacer fonction** |
| **Roles & Permissions** |
| Roles | ✅ `Role` enum (Root, Dev, User) | ✅ `auth::roles::Role` (même enum) | **Déplacer** |
| Permissions | ✅ `SecureAction` enum | ✅ `auth::roles::SecureAction` (même enum) | **Déplacer** |
| Permission Guard | ✅ `PERMISSION_GUARD` global | ✅ Garder, utiliser AuthOS roles | **Intégrer** |
| User→Role Binding | ❌ Aucun (Kevin hard-coded) | ✅ `keystore.roles[]` avec owner | **Créer** |
| **Keystore** |
| Fichier | ✅ `SecureSecretsEngine` (location?) | ✅ `~/.local/share/titane/keystore.json` | **Clarifier path** |
| Structure | ⚠️ Non définie (kvstore?) | ✅ `{ dev_token, api_keys, roles, last_update }` | **Créer struct** |
| Chiffrement | ✅ AES-256-GCM (key?) | ✅ AES-256-GCM + Argon2id (password→key) | **Améliorer** |
| Backup | ❌ Aucun | ✅ `auth::keystore::backup()` | **Créer** |
| **Frontend** |
| Gov Center | ✅ `governanceService.ts` OK | ✅ Utiliser `authClient.ts` wrapper | **Wrapper** |
| Dev Mode | ⚠️ Token UI incomplet | ✅ `useAuth()` hook + token workflow | **Remplacer** |
| Status Global | ❌ Aucun (queries séparées) | ✅ `auth_get_status()` unified | **Créer** |
| Store | ❌ State local (useState) | ✅ `authStore` (Zustand) centralisé | **Créer** |
| **Commands Tauri** |
| Dev Token | ⚠️ `engines_devmode_enable` incomplet | ✅ `auth_generate_dev_token`, `auth_validate_dev_token` | **Créer** |
| API Keys | ✅ 6 commands (set/get x3) OK | ✅ `auth_save_api_keys`, `auth_get_api_keys` unified | **Wrapper** |
| Auth Status | ❌ Aucun | ✅ `auth_get_status()` global | **Créer** |

**Résultat**: ~40% du code existe déjà (API keys, chiffrement), 60% à créer (dev token, roles binding, auth status)

---

## 🚨 RISQUES DE MIGRATION

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **Perte de données clés API** | 🔴 CRITIQUE | 1. Backup keystore avant migration <br> 2. Garder anciens commands en fallback temporaire <br> 3. Tests avec clés de dev |
| **Breaking changes frontend** | 🟠 MOYEN | 1. Créer wrapper authClient qui appelle anciens commands si AuthOS échoue <br> 2. Migration progressive (Gov Center d'abord, Dev Mode après) |
| **Incompatibilité keystore format** | 🟠 MOYEN | 1. Script migration `migrate_keystore.rs` pour convertir ancien → nouveau <br> 2. Garder rétro-compatibilité lecture ancien format |
| **Authentification cassée** | 🔴 CRITIQUE | 1. Dev Token optionnel au début (si absent, mode dev désactivé mais app fonctionne) <br> 2. Validation progressive (warn d'abord, error après) |
| **Permissions trop strictes** | 🟡 FAIBLE | 1. Commencer avec Role::User par défaut <br> 2. Escalade vers Dev/Root si token valide |
| **Performance dégradée** | 🟢 MINIMAL | 1. Keystore en mémoire (lazy load) <br> 2. Cache status auth (refresh si >5min) |

---

## ✅ CHECKLIST FINALE DE MIGRATION

### Phase 1: Backend AuthOS (Rust)
- [ ] **Module auth/mod.rs**
  - [ ] Exports publics (DevTokenManager, ApiKeyManager, Keystore, etc.)
  - [ ] `init_auth()` appelé depuis main.rs
- [ ] **Module auth/keystore.rs**
  - [ ] Struct `Keystore` (dev_token, api_keys, roles, last_update)
  - [ ] `load_keystore()` avec fallback création
  - [ ] `save_keystore()` avec validation + chiffrement
  - [ ] Path: `~/.local/share/titane/keystore.json`
- [ ] **Module auth/dev_token.rs**
  - [ ] `generate_dev_token()` → `TITANE-DEV-KEY-<hex64>`
  - [ ] `validate_dev_token(input)` → bool
  - [ ] `get_or_create_dev_token()` → String
- [ ] **Module auth/api_keys.rs**
  - [ ] `save_api_keys(ApiKeys)` → wrapper `secure_commands`
  - [ ] `get_api_keys()` → wrapper `secure_commands`
  - [ ] Validation formats (OpenAI: `sk-*`, Anthropic: `sk-ant-*`, Gemini: alphanum)
- [ ] **Module auth/roles.rs**
  - [ ] `ensure_owner_role("Kevin Thibault")`
  - [ ] `has_dev_access(user)` → bool
  - [ ] `RoleBinding` struct (owner, role, granted_at)
- [ ] **Module auth/error.rs**
  - [ ] `AuthError` enum (KeystoreNotFound, InvalidToken, PermissionDenied, etc.)
  - [ ] `AuthResult<T>` type alias
- [ ] **Module auth/dto.rs**
  - [ ] `AuthStatusDto` (dev_mode_active, dev_token_present, has_owner_role, api_keys_configured, etc.)

### Phase 2: Commands Tauri
- [ ] **Nouvelles commands (main.rs)**
  - [ ] `auth_generate_dev_token()` → Result<String>
  - [ ] `auth_validate_dev_token(token: String)` → Result<bool>
  - [ ] `auth_get_status()` → Result<AuthStatusDto>
  - [ ] `auth_save_api_keys(keys: ApiKeysDto)` → Result<()>
  - [ ] `auth_get_api_keys()` → Result<ApiKeysDto>
- [ ] **Modifier commands existantes (si besoin)**
  - [ ] `chat_set_gemini_key` → appeler `auth::api_keys::save_api_keys` en interne
  - [ ] `engines_devmode_enable` → valider token via `auth::dev_token::validate`
- [ ] **Tests backend**
  - [ ] Test génération token (format OK, unique)
  - [ ] Test validation token (valide vs invalide)
  - [ ] Test keystore (save/load/backup)
  - [ ] Test API keys (save/get/mask)

### Phase 3: Frontend AuthOS
- [ ] **Module core/auth/authClient.ts**
  - [ ] `getAuthStatus()` → AuthStatusDto
  - [ ] `generateDevToken()` → string
  - [ ] `validateDevToken(token)` → bool
  - [ ] `getApiKeys()` → ApiKeysInput
  - [ ] `saveApiKeys(keys)` → void
  - [ ] Wrapper `safeInvoke()` avec error handling
- [ ] **Module core/auth/authStore.ts (Zustand)**
  - [ ] State: `{ status, loading, error, devToken, refresh(), generateDevToken(), validateDevToken(), saveApiKeys() }`
  - [ ] `useAuth()` hook export
  - [ ] Auto-refresh status (si >5min)
- [ ] **Tests frontend (optionnel)**
  - [ ] Test authClient mocks
  - [ ] Test authStore state mutations

### Phase 4: Intégration UI
- [ ] **Page Mode Développeur**
  - [ ] Remplacer `useDeveloperMode()` par `useAuth()`
  - [ ] Bouton "Générer Token" → `generateDevToken()`
  - [ ] Input + validation token → `validateDevToken()`
  - [ ] Affichage status (token présent, dev mode actif)
- [ ] **Page Gouvernance**
  - [ ] Garder UI actuelle
  - [ ] Remplacer `governanceService` par `authClient` (wrapper transparent)
  - [ ] Afficher `authStatus.api_keys_configured` global
- [ ] **Header/Navigation (optionnel)**
  - [ ] Indicateur dev mode ON/OFF
  - [ ] Indicateur sécurité (API keys configurées)

### Phase 5: Migration & Nettoyage
- [ ] **Script migration keystore (si nécessaire)**
  - [ ] `scripts/migrate_keystore_to_authOS.sh`
  - [ ] Backup ancien keystore
  - [ ] Convertir format (si different)
- [ ] **Supprimer ancien code**
  - [ ] ❌ `scripts/activate_chat_apis.sh` (stockage non chiffré)
  - [ ] ⚠️ Garder `secure_commands.rs` (used internally by AuthOS)
  - [ ] ⚠️ Garder `engines/developer_mode.rs` (encore utilisé si pas AuthOS)
- [ ] **Fichier migration status**
  - [ ] `docs/AUTH_MIGRATION_STATUS.md` (fichiers migrés, reste à faire)

### Phase 6: Tests & Validation
- [ ] **Tests unitaires backend**
  - [ ] Cargo test `auth::dev_token` (all pass)
  - [ ] Cargo test `auth::keystore` (all pass)
  - [ ] Cargo test `auth::api_keys` (all pass)
- [ ] **Tests manuels frontend**
  - [ ] Premier lancement: keystore créé automatiquement
  - [ ] Activer Mode Dev: token généré + affiché
  - [ ] Reload app: Mode Dev reste actif
  - [ ] Ajouter API keys: stockées + chiffrées
  - [ ] Vérifier ~/.local/share/titane/keystore.json (chiffré, pas lisible)
- [ ] **Validation sécurité**
  - [ ] Aucun secret en clair dans Git
  - [ ] Keystore chiffré (test déchiffrement avec mauvais password)
  - [ ] Logs ne contiennent pas de secrets

---

## 📚 RÉFÉRENCES

### Fichiers Clés à Modifier
**Backend**:
- `src-tauri/src/main.rs` (ajouter commands AuthOS)
- `src-tauri/src/engines/developer_mode.rs` (intégrer AuthOS)
- `src-tauri/src/secure_commands.rs` (wrapper AuthOS)

**Frontend**:
- `src/features/developer-mode/DeveloperModePage.tsx` (UI token)
- `src/features/developer-mode/useDeveloperMode.ts` (hook AuthOS)
- `src/features/governance-center/services/governanceService.ts` (wrapper AuthOS)

### Fichiers à Créer
**Backend**:
- `src-tauri/src/auth/mod.rs`
- `src-tauri/src/auth/keystore.rs`
- `src-tauri/src/auth/dev_token.rs`
- `src-tauri/src/auth/api_keys.rs`
- `src-tauri/src/auth/roles.rs`
- `src-tauri/src/auth/error.rs`
- `src-tauri/src/auth/dto.rs`

**Frontend**:
- `src/core/auth/authClient.ts`
- `src/core/auth/authStore.ts`
- `src/core/auth/types.ts` (TS mirrors DTO Rust)

### Fichiers à Supprimer (Après Migration)
- `scripts/activate_chat_apis.sh` (risque sécurité)
- (Éventuellement) anciens dev token files si existent

---

## 🎯 COMPORTEMENT FINAL ATTENDU

### Après Migration Complète

**Utilisateur Kevin (Owner)**:
1. **Premier lancement** TITANE∞:
   - Keystore créé automatiquement: `~/.local/share/titane/keystore.json`
   - Dev Token généré: `TITANE-DEV-KEY-a1b2c3...`
   - Role "owner" attribué à "Kevin Thibault"
   - API keys vides (non configurées)

2. **Activer Mode Développeur**:
   - UI: Clic "Activer Mode Dev"
   - Backend: `auth_generate_dev_token()` → retourne token
   - UI: Affiche token (copiable)
   - Backend: Sauvegarde dans keystore
   - Statut: `dev_mode_active: true`

3. **Redémarrer TITANE∞**:
   - Keystore chargé automatiquement
   - Dev Token présent → Mode Dev activé automatiquement
   - Statut cohérent (pas de re-génération token)

4. **Configurer API Keys**:
   - UI Gouvernance: Formulaire Gemini/OpenAI/Anthropic
   - Backend: `auth_save_api_keys()` → chiffre + sauvegarde keystore
   - UI: Indicateurs verts (clés configurées)
   - Statut: `api_keys_configured: true`

5. **Utiliser Chat IA**:
   - Auto-select provider si clé configurée
   - Cascade fallback: Auto → Gemini → Ollama → Local
   - Latency tracking affiché

**Sécurité**:
- ✅ Keystore chiffré (AES-256-GCM)
- ✅ Secrets jamais en Git
- ✅ Masking dans UI (••••a1b2)
- ✅ Audit logs (qui/quoi/quand)
- ✅ Permissions (Role::Root pour secrets)

**UI Unifiée**:
- ✅ Un seul `auth_get_status()` pour tout l'état auth
- ✅ Hook `useAuth()` dans tous les composants
- ✅ Indicateurs header (dev mode, API keys)
- ✅ Messages clairs (erreurs, succès)

---

**Status Migration**: 🟡 **EN ATTENTE — PLAN COMPLET READY**

**Prochaine Étape**: Phase 1 Backend (créer modules Rust AuthOS)

