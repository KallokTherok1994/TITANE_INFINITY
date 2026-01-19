# 🔐 GUIDE DE CONFIGURATION DES APIs TITANE∞ v24.2.0

## ✅ ÉTAT ACTUEL

**Feature Flags:** ✅ **ACTIVÉS**

- `ENABLE_EXTERNAL_AI: true`
- `AI_PROVIDERS.gemini: true`
- `AI_PROVIDERS.openai: true`

**API Keys:** ❌ **NON CONFIGURÉES**

- GEMINI_API_KEY: Non définie
- OPENAI_API_KEY: Non définie
- ANTHROPIC_API_KEY: Non définie

---

## 📋 ÉTAPES DE CONFIGURATION

### 🌐 Étape 1: Obtenir les clés API

#### **Google Gemini**

1. Visiter: https://ai.google.dev
2. Cliquer sur "Get API Key" ou "Console"
3. Créer un nouveau projet (si nécessaire)
4. Générer une nouvelle clé API
5. Copier la clé (format: `AIza...`)

#### **OpenAI**

1. Visiter: https://platform.openai.com
2. Se connecter ou créer un compte
3. Aller dans "API Keys" (menu gauche)
4. Cliquer sur "Create new secret key"
5. Copier la clé (format: `sk-...`)

#### **Anthropic Claude**

1. Visiter: https://console.anthropic.com
2. Se connecter ou créer un compte
3. Aller dans "API Keys"
4. Cliquer sur "Create Key"
5. Copier la clé (format: `sk-ant-...`)

---

### 🔐 Étape 2: Configurer les clés (3 méthodes)

#### **MÉTHODE 1: Interface TITANE∞ (Recommandée)**

1. Lancer TITANE∞:

   ```bash
   pnpm run dev:tauri
   ```

2. Ouvrir l'application (http://localhost:5173/)

3. Aller dans **Control Panel** → **Section IA & APIs**

4. Remplir les clés dans les champs sécurisés

5. Cliquer sur **Sauvegarder**

**Avantages:**

- ✅ Chiffrement AES-256-GCM automatique
- ✅ Interface utilisateur intuitive
- ✅ Validation des clés
- ✅ Purge automatique du .env

---

#### **MÉTHODE 2: Console navigateur (Développement)**

1. Ouvrir http://localhost:5173/

2. Ouvrir la console (F12)

3. Exécuter les commandes:

```javascript
// Gemini
await window.__TAURI_INTERNALS__.invoke('chat_set_gemini_key', {
  apiKey: 'AIza...', // Votre clé Gemini
});

// OpenAI
await window.__TAURI_INTERNALS__.invoke('chat_set_openai_key', {
  apiKey: 'sk-...', // Votre clé OpenAI
});

// Anthropic
await window.__TAURI_INTERNALS__.invoke('chat_set_anthropic_key', {
  apiKey: 'sk-ant-...', // Votre clé Anthropic
});
```

4. Vérifier le statut:

```javascript
// Vérifier Gemini
const geminiStatus = await window.__TAURI_INTERNALS__.invoke('get_gemini_key_status');
console.log(geminiStatus);

// Vérifier OpenAI
const openaiStatus = await window.__TAURI_INTERNALS__.invoke('get_openai_key_status');
console.log(openaiStatus);

// Vérifier Anthropic
const anthropicStatus = await window.__TAURI_INTERNALS__.invoke(
  'get_anthropic_key_status'
);
console.log(anthropicStatus);
```

**Résultat attendu:**

```json
{
  "ok": true,
  "data": {
    "configured": true,
    "provider_enabled": true,
    "masked_key": "•••••••••••Abc1",
    "env_present": false,
    "env_purged": true,
    "was_updated": true
  },
  "error": null
}
```

---

#### **MÉTHODE 3: Fichier .env (Temporaire)**

**⚠️ ATTENTION:** Cette méthode stocke les clés **en clair**. À utiliser uniquement pour tests rapides.

1. Copier le template:

   ```bash
   cp .env.example .env
   ```

2. Éditer `.env`:

   ```bash
   GEMINI_API_KEY=AIza...votre_clé_ici
   GEMINI_MODEL=gemini-pro

   OPENAI_API_KEY=sk-...votre_clé_ici

   ANTHROPIC_API_KEY=sk-ant-...votre_clé_ici
   ```

3. Redémarrer Vite:

   ```bash
   pnpm run dev:tauri
   ```

4. **Migration recommandée** vers SecureSecretsEngine:
   - Les commandes `chat_set_*_key()` purgeront automatiquement les clés du `.env`
   - Utiliser la Méthode 1 ou 2 pour migrer

---

## 🧪 Étape 3: Tester la configuration

### Test via Console Navigateur

```javascript
// Test Gemini
const geminiTest = await window.__TAURI_INTERNALS__.invoke('chat_send_message', {
  message: 'Bonjour, tu es quel modèle?',
  provider: 'gemini',
});
console.log(geminiTest);

// Test OpenAI
const openaiTest = await window.__TAURI_INTERNALS__.invoke('chat_send_message', {
  message: 'Hello, what model are you?',
  provider: 'openai',
});
console.log(openaiTest);

// Test Anthropic
const anthropicTest = await window.__TAURI_INTERNALS__.invoke('chat_send_message', {
  message: 'Hi Claude, how are you?',
  provider: 'anthropic',
});
console.log(anthropicTest);
```

### Test via Interface Chat

1. Ouvrir le Chat (bubble en bas à droite)

2. Cliquer sur le sélecteur de modèle

3. Choisir Gemini / OpenAI / Anthropic

4. Envoyer un message de test

5. Vérifier la réponse

---

## 🔍 Vérification de la configuration

### Script de vérification rapide

```bash
node check_api_status.js
```

### Commandes Tauri disponibles

```javascript
// Status des secrets
await window.__TAURI_INTERNALS__.invoke('get_secrets_status');

// Vérifier si une clé existe
await window.__TAURI_INTERNALS__.invoke('has_secret', { key: 'gemini_api_key' });
await window.__TAURI_INTERNALS__.invoke('has_secret', { key: 'openai_api_key' });
await window.__TAURI_INTERNALS__.invoke('has_secret', { key: 'anthropic_api_key' });
```

---

## 📝 ARCHITECTURE DE SÉCURITÉ

### SecureSecretsEngine (Rust)

**Fichier:** `src-tauri/src/security/secrets_engine.rs`

**Caractéristiques:**

- Chiffrement: **AES-256-GCM**
- Dérivation de clé: **Argon2id**
- Zeroization: Clés effacées en mémoire après usage
- Stockage: Fichier chiffré (`~/.titane/secrets.enc`)

**Constantes:**

```rust
pub const KEY_GEMINI: &str = "gemini_api_key";
pub const KEY_OPENAI: &str = "openai_api_key";
pub const KEY_CLAUDE: &str = "anthropic_api_key";
```

### Commandes Tauri (Rust)

**Fichier:** `src-tauri/src/secure_commands.rs`

**Fonctions principales:**

- `chat_set_gemini_key(api_key)` → Enregistre et chiffre
- `get_gemini_key_status()` → Retourne statut masqué
- `chat_set_openai_key(api_key)` → Enregistre et chiffre
- `get_openai_key_status()` → Retourne statut masqué
- `chat_set_anthropic_key(api_key)` → Enregistre et chiffre
- `get_anthropic_key_status()` → Retourne statut masqué
- `secure_store_secret(key, value)` → Stockage générique

**Permissions requises:**

- `secret_write`: Role::Root (écriture)
- `secret_status`: Role::System (lecture statut)

### Service Frontend

**Fichier:** `src/features/governance-center/services/governanceService.ts`

**Méthodes TypeScript:**

```typescript
await getGeminiStatus();
await setGeminiKey(apiKey: string);
await getOpenAIStatus();
await setOpenAIKey(apiKey: string);
await getAnthropicStatus();
await setAnthropicKey(apiKey: string);
await storeSecret(key, value, purgeEnv, envVariable);
await getSecretsStatus();
```

---

## 🎯 CONFIGURATIONS RECOMMANDÉES

### Gemini (Google)

```typescript
Model: gemini-pro
Temperature: 0.7
Max Tokens: 2048
Base URL: https://generativelanguage.googleapis.com/v1
```

### OpenAI (GPT)

```typescript
Model: gpt-4-turbo-preview
Temperature: 0.7
Max Tokens: 4096
Base URL: https://api.openai.com/v1
```

### Anthropic (Claude)

```typescript
Model: claude-3-opus-20240229
Temperature: 0.7
Max Tokens: 4096
Base URL: https://api.anthropic.com/v1
```

---

## ⚠️ TROUBLESHOOTING

### Erreur: "Permission denied"

- **Cause:** Role utilisateur insuffisant
- **Solution:** Les commandes `chat_set_*_key()` nécessitent Role::Root

### Erreur: "API key too short"

- **Cause:** Clé invalide (< 16 caractères)
- **Solution:** Vérifier que la clé est complète

### Erreur: "Failed to store secret"

- **Cause:** Problème d'écriture fichier chiffré
- **Solution:** Vérifier les permissions `~/.titane/`

### Les clés ne fonctionnent pas dans le chat

1. Vérifier feature flags: `ENABLE_EXTERNAL_AI: true`
2. Vérifier provider activé: `AI_PROVIDERS.gemini: true`
3. Vérifier statut: `get_gemini_key_status()`
4. Redémarrer Vite: `pnpm run dev:tauri`

---

## 📊 CHECKLIST COMPLÈTE

### Configuration initiale

- [ ] Feature flags activés (`ENABLE_EXTERNAL_AI: true`)
- [ ] Providers activés (`gemini: true`, `openai: true`)
- [ ] Clés API obtenues (Gemini, OpenAI, Anthropic)

### Installation des clés

- [ ] Gemini configurée via `chat_set_gemini_key()`
- [ ] OpenAI configurée via `chat_set_openai_key()`
- [ ] Anthropic configurée via `chat_set_anthropic_key()`
- [ ] Clés .env purgées (automatique)

### Tests

- [ ] Statut vérifié via `get_*_key_status()`
- [ ] Message de test envoyé via chat
- [ ] Réponse reçue de chaque provider

### Sécurité

- [ ] Clés stockées dans SecureSecretsEngine (chiffré)
- [ ] Fichier .env purgé ou supprimé
- [ ] Aucune clé en clair dans les logs

---

## 📚 RÉFÉRENCES

**Documentation:**

- Gemini API: https://ai.google.dev/docs
- OpenAI API: https://platform.openai.com/docs
- Anthropic API: https://docs.anthropic.com

**Fichiers du projet:**

- Feature Flags: `src/config/featureFlags.ts`
- Secrets Engine: `src-tauri/src/security/secrets_engine.rs`
- Secure Commands: `src-tauri/src/secure_commands.rs`
- Governance Service: `src/features/governance-center/services/governanceService.ts`
- UI Section: `src/ui/pages/ControlPanel/sections/AISection.tsx`

**Commandes utiles:**

```bash
# Vérifier statut
node check_api_status.js

# Lancer dev
pnpm run dev:tauri

# Build production
pnpm run build
```

---

## 🎉 RÉSUMÉ

**Ce qui a été fait:**

1. ✅ Feature flags activés (`ENABLE_EXTERNAL_AI: true`)
2. ✅ Providers activés (`gemini: true`, `openai: true`)
3. ✅ Infrastructure sécurisée en place (SecureSecretsEngine)
4. ✅ Commandes Tauri disponibles
5. ✅ Interface UI prête dans Control Panel

**Ce qu'il reste à faire:**

1. ⏳ Obtenir les clés API (Gemini, OpenAI, Anthropic)
2. ⏳ Configurer les clés via l'une des 3 méthodes
3. ⏳ Tester le chat avec chaque provider

**Prochaine étape:**
Utiliser **Méthode 1** (Interface TITANE∞) ou **Méthode 2** (Console) pour configurer vos clés API.

---

**Date:** 2025-12-10  
**Version:** TITANE∞ v24.2.0  
**Status:** ✅ Configuration prête - En attente des clés API
