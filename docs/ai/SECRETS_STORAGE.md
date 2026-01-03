# SECRETS STORAGE — Gestion Sécurisée des Clés API

**Date:** 2025-01-03  
**Version:** v26.3.0  
**Objectif:** Documentation complète du système de stockage sécurisé des clés API

---

## 1. Vision & Exigences

### 1.1 Contraintes Non Négociables

✅ **Local-First:**
- Aucune clé en clair dans le repository
- Aucun secret commité dans Git
- Aucune transmission de clés vers des services tiers (sauf API ciblée)

✅ **Sécurité:**
- Chiffrement fort: AES-256-GCM
- Dérivation de clé sécurisée: Argon2id
- Salt unique par installation
- Nonce unique par opération de chiffrement
- Permissions strictes sur fichiers secrets

✅ **Privacy-First:**
- Stockage local uniquement
- Pas de keychain cloud (iCloud, Google)
- Pas de sync automatique
- Utilisateur contrôle ses secrets

✅ **UX:**
- Une seule interface: Governance Center
- Test de connexion avant utilisation
- Messages d'erreur user-friendly
- Pas de stack traces exposés

---

## 2. Architecture du Système

### 2.1 Stack Technique

**Chiffrement:**
- Algorithm: AES-256-GCM (Authenticated Encryption)
- Mode: Galois/Counter Mode (integrity + confidentiality)
- Key size: 256 bits
- Nonce size: 96 bits (12 bytes)

**Dérivation de Clé:**
- Algorithm: Argon2id (hybrid Argon2d + Argon2i)
- Memory cost: 65536 KB (64 MB)
- Time cost: 3 iterations
- Parallelism: 4 threads
- Salt size: 128 bits (16 bytes)

**Stockage:**
- Format: JSON chiffré
- Localisation: `~/.config/titane-infinity/secrets.enc`
- Permissions: `600` (user read/write only)

### 2.2 Diagramme Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/TypeScript)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Governance Center UI                                          │
│    ├─ APIProviderCard (per provider)                          │
│    │   ├─ Input field (type="password")                       │
│    │   ├─ Save button                                         │
│    │   ├─ Delete button                                       │
│    │   └─ Test button                                         │
│    │                                                           │
│    └─ Actions (via governanceService)                         │
│        ├─ setOpenAIKey(key: string)                           │
│        ├─ setAnthropicKey(key: string)                        │
│        ├─ setGeminiKey(key: string)                           │
│        └─ setCopilotKey(key: string)                          │
│                                                                 │
│  ⚠️ IMPORTANT:                                                 │
│  • Les clés ne sont JAMAIS stockées dans React state          │
│  • Les clés ne passent qu'une fois par le frontend (set)      │
│  • Les clés sont vidées immédiatement après envoi             │
│  • Aucune clé n'est retournée au frontend (get)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Tauri IPC (encrypted channel)
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Rust/Tauri)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tauri Commands (/src-tauri/src/commands/security.rs)         │
│    ├─ set_openai_key(key: String)                             │
│    ├─ set_anthropic_key(key: String)                          │
│    ├─ set_gemini_key(key: String)                             │
│    ├─ set_copilot_key(key: String)                            │
│    │                                                           │
│    ├─ get_openai_status() → { configured: bool }              │
│    ├─ get_anthropic_status() → { configured: bool }           │
│    ├─ get_gemini_status() → { configured: bool }              │
│    └─ get_copilot_status() → { configured: bool }             │
│                                                                 │
│  ⚠️ Security Rules:                                            │
│  • Permission check (PERMISSION_GUARD)                         │
│  • Input validation (min length, format)                       │
│  • Pas de log des clés                                        │
│  • Status retourne JAMAIS la clé (bool only)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          SECRETS ENGINE (Encrypted Storage Layer)               │
│  /src-tauri/src/security/secrets_engine.rs                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SecureSecretsEngine {                                         │
│    mode: SecretsMode,                                          │
│    secrets: RwLock<HashMap<String, String>>                    │
│  }                                                             │
│                                                                 │
│  Public API:                                                   │
│    ├─ new(passphrase: Option<String>) → Result<Self>          │
│    ├─ set_secret(key: &str, value: &str) → Result<()>         │
│    ├─ get_secret(key: &str) → Result<Option<String>>          │
│    ├─ has_secret(key: &str) → Result<bool>                    │
│    ├─ delete_secret(key: &str) → Result<()>                   │
│    └─ list_keys() → Result<Vec<String>>                       │
│                                                                 │
│  Constants (Provider Keys):                                    │
│    ├─ KEY_OPENAI = "openai_api_key"                           │
│    ├─ KEY_CLAUDE = "claude_api_key"                           │
│    ├─ KEY_GEMINI = "gemini_api_key"                           │
│    └─ KEY_COPILOT = "copilot_api_key"                         │
│                                                                 │
│  Internal Operations:                                          │
│    ├─ derive_key(passphrase, salt) → [u8; 32]                 │
│    ├─ encrypt(plaintext, key) → Vec<u8>                       │
│    ├─ decrypt(ciphertext, key) → Result<String>               │
│    ├─ persist() → Result<()>                                   │
│    └─ load_from_disk() → Result<HashMap<String, String>>      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FILESYSTEM (Encrypted File)                  │
│  Path: ~/.config/titane-infinity/secrets.enc                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  File Structure (Binary):                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Version (u8): 0x01                                       │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Salt (16 bytes): [random]                                │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Nonce (12 bytes): [random per encryption]               │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Ciphertext (variable length):                            │ │
│  │   - Encrypted JSON: { "openai_api_key": "...", ... }    │ │
│  │   - AES-256-GCM authenticated                            │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Auth Tag (16 bytes): [GCM authentication tag]            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Permissions: 600 (rw------- user only)                        │
│  Ownership: Current user                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Flux de Données

### 3.1 Sauvegarde d'une Clé API

```
[User enters API key in UI]
    │
    ├─ Input: "sk-openai-12345678..."
    └─ Click "Save"
    │
    ↓
[APIProviderCard Component]
    │
    └─ onSetKey(inputValue)
    │
    ↓
[governanceService.setOpenAIKey(key)]
    │
    ├─ Validation client: length >= 16
    └─ secureInvoke('set_openai_key', { key })
    │
    ↓ Tauri IPC
[set_openai_key Command (Rust)]
    │
    ├─ Permission check: PERMISSION_GUARD.require("secrets_write")
    ├─ Validation: key not empty, format check
    └─ secrets_engine.set_secret(KEY_OPENAI, key)
    │
    ↓
[SecureSecretsEngine.set_secret()]
    │
    ├─ Lock: secrets.write().await
    ├─ Insert: map.insert(KEY_OPENAI, key)
    ├─ Unlock
    └─ persist() → encrypt and save to disk
    │
    ↓
[encrypt()]
    │
    ├─ Load passphrase from env or config
    ├─ Generate new nonce (12 random bytes)
    ├─ Derive key: Argon2id(passphrase, salt)
    ├─ Serialize: JSON.stringify(secrets_map)
    ├─ Encrypt: AES-256-GCM(plaintext, derived_key, nonce)
    └─ Return: [salt || nonce || ciphertext || auth_tag]
    │
    ↓
[persist()]
    │
    ├─ Write to: ~/.config/titane-infinity/secrets.enc
    ├─ Set permissions: chmod 600
    └─ Return Ok(())
    │
    ↓
[Response to Frontend]
    │
    └─ { ok: true, data: { configured: true, masked_key: "sk-...78" } }
    │
    ↓
[UI Update]
    │
    ├─ Clear input field (security)
    ├─ Display success message: "✅ Clé sauvegardée"
    └─ Update status badge: "Actif"
```

### 3.2 Utilisation d'une Clé (Chat)

```
[User sends message in Chat]
    │
    ├─ Message: "Explain async/await"
    └─ Selected provider: "openai"
    │
    ↓
[useChat Hook]
    │
    └─ sendMessage() → openaiProvider.generate()
    │
    ↓
[openai.ts Provider Adapter]
    │
    └─ secureInvoke('chat_generate_openai', { message, history, config })
    │
    ↓ Tauri IPC
[chat_generate_openai Command (Rust)]
    │
    ├─ Permission check
    ├─ Check key exists: state.openai_api_key.read().await
    ├─ If None → load from secrets_engine
    └─ Call openai::send_chat(message, history, key)
    │
    ↓
[secrets_engine.get_secret(KEY_OPENAI)]
    │
    ├─ Lock: secrets.read().await
    ├─ Get: map.get(KEY_OPENAI)
    ├─ Unlock
    └─ Return Some(key) or None
    │
    ↓ (if key exists)
[openai::send_chat()]
    │
    ├─ Build HTTP request to api.openai.com
    ├─ Header: Authorization: Bearer <key>
    ├─ Send request
    └─ Return response
    │
    ↓
[Response flows back to UI]
    │
    └─ Display assistant message
    
⚠️ CRITICAL: La clé n'est JAMAIS retournée au frontend
               Elle reste dans le backend pour chaque requête
```

### 3.3 Test de Connexion

```
[User clicks "Test Connection" in Governance]
    │
    ↓
[APIProviderCard]
    │
    └─ onTestConnection()
    │
    ↓
[governanceService.testOpenAIConnection()]
    │
    └─ secureInvoke('test_openai_connection')
    │
    ↓ Tauri IPC
[test_openai_connection Command (Rust)]
    │
    ├─ Load key: secrets_engine.get_secret(KEY_OPENAI)
    ├─ If None → Return { success: false, message: "Clé non configurée" }
    └─ Call openai::test_connection(key)
    │
    ↓
[openai::test_connection()]
    │
    ├─ Simple API call (ex: list models or echo)
    ├─ Measure latency
    ├─ Check HTTP status
    └─ Return ProviderTestResult
    │
    ↓
[Response to Frontend]
    │
    └─ {
          success: true,
          message: "✅ Connexion réussie",
          latencyMs: 234,
          availableModels: ["gpt-4", "gpt-4o", "gpt-3.5-turbo"]
        }
    │
    ↓
[UI Update]
    │
    ├─ Display status: "✅ Actif (234ms)"
    └─ Update models dropdown
```

---

## 4. Menaces & Mitigations

### 4.1 Menaces Identifiées

| **Menace**                          | **Impact**          | **Probabilité** | **Mitigation**                               |
|-------------------------------------|---------------------|-----------------|----------------------------------------------|
| Clé en clair dans repository        | Critique            | Élevée          | ✅ .gitignore strict, secrets.enc exclu      |
| Clé exposée dans logs               | Critique            | Moyenne         | ✅ Pas de log des clés, sanitization        |
| Clé lisible par autre user (OS)     | Élevé               | Faible          | ✅ Permissions 600 sur secrets.enc           |
| Clé interceptée réseau frontend     | Critique            | Très faible     | ✅ Tauri IPC chiffré (pas HTTP)             |
| Passphrase faible                   | Moyen               | Moyenne         | ⚠️ Recommandation 16+ chars, à améliorer    |
| Attaque brute force offline         | Élevé               | Faible          | ✅ Argon2id (slow, memory-hard)             |
| Clé stockée en React state          | Critique            | Élevée          | ✅ Jamais stocké, vidé immédiatement         |
| Memory dump (RAM)                   | Élevé               | Très faible     | ⚠️ Clés en mémoire temporaire, à améliorer   |
| Backup non chiffré                  | Élevé               | Moyenne         | ✅ secrets.enc est chiffré                   |
| Keylogger                           | Critique            | Faible          | ❌ Hors périmètre (sécurité OS)             |
| Phishing (fake TITANE app)          | Critique            | Faible          | ⚠️ Code signing, à implémenter              |

### 4.2 Protections Actives

✅ **Chiffrement au repos:**
- AES-256-GCM (NIST approved)
- Authenticated encryption (integrity + confidentiality)
- Nonce unique par opération

✅ **Dérivation de clé sécurisée:**
- Argon2id (winner Password Hashing Competition 2015)
- Memory-hard (résiste GPU/ASIC)
- Time cost configurable

✅ **Permissions filesystem:**
- `chmod 600` automatique
- Uniquement user propriétaire

✅ **Validation input:**
- Longueur minimale (16 chars)
- Format check (regex selon provider)
- Sanitization

✅ **Pas de transmission externe:**
- Clés restent locales
- Pas de sync cloud
- Pas de telemetry

✅ **Separation of concerns:**
- Frontend: UI uniquement
- Backend: Logique + secrets
- Secrets Engine: Stockage isolé

### 4.3 Améliorations Futures (Roadmap)

**P1 (High Priority):**
- [ ] Hardware Security Module (HSM) support
- [ ] OS Keychain integration (Linux: libsecret, macOS: Keychain, Windows: Credential Manager)
- [ ] Passphrase strength meter UI
- [ ] Auto-lock après inactivité
- [ ] Wipe memory après usage (zeroize crate)

**P2 (Medium Priority):**
- [ ] Rotation automatique des clés
- [ ] Audit log des accès secrets
- [ ] Multi-factor authentication pour secrets critiques
- [ ] Encrypted backup system
- [ ] Emergency recovery mechanism

**P3 (Nice to have):**
- [ ] Secrets versioning (historique)
- [ ] Shared secrets (multi-user)
- [ ] External secrets management (HashiCorp Vault, AWS Secrets Manager)

---

## 5. Configuration & Setup

### 5.1 Passphrase Configuration

**Méthode 1: Environment Variable (Recommandé Dev)**

```bash
export TITANE_SECRETS_PASSPHRASE="my-secure-passphrase-min-16-chars"
npm run dev:tauri
```

**Méthode 2: Config File (Recommandé Production)**

```bash
# ~/.config/titane-infinity/secrets.conf
# ⚠️ Ce fichier doit être en chmod 600 également
PASSPHRASE_HASH=<argon2_hash_of_passphrase>
```

**Méthode 3: Prompt at Startup (Future)**

```
TITANE∞ — Enter secrets passphrase:
[________________________]
```

### 5.2 Migration Existante

Si vous avez déjà des clés en `.env` ou ailleurs:

```bash
# 1. Backup existant
cp .env .env.backup

# 2. Lancer TITANE en mode migration
export TITANE_MIGRATE_SECRETS=1
npm run dev:tauri

# 3. Les clés sont importées et chiffrées automatiquement

# 4. Purger ancien .env
rm .env .env.backup
```

### 5.3 Vérification Santé Secrets

```bash
# Via CLI (à implémenter)
./titane.sh secrets health

Output:
✅ Secrets engine initialized
✅ Passphrase configured
✅ secrets.enc exists (chmod 600)
✅ 4/5 providers configured:
   ✅ OpenAI
   ✅ Anthropic
   ✅ Gemini
   ❌ Copilot (not configured)
   ✅ Ollama (local, no key needed)
```

---

## 6. Guide Développeur

### 6.1 Ajouter un Nouveau Provider

**Step 1: Définir la constante clé (Rust)**

```rust
// /src-tauri/src/security/secrets_engine.rs
pub const KEY_NEW_PROVIDER: &str = "new_provider_api_key";
```

**Step 2: Créer command Tauri**

```rust
// /src-tauri/src/commands/security.rs
#[tauri::command]
pub async fn set_new_provider_key(
    key: String,
    state: State<'_, ChatOrchestratorState>,
) -> Result<SecureResponse<GeminiKeyStatus>, String> {
    PERMISSION_GUARD.require("secrets_write", Role::User, "set_new_provider_key")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;
    
    if key.trim().is_empty() || key.len() < 16 {
        return Ok(SecureResponse {
            ok: false,
            data: None,
            error: Some("Clé invalide (min 16 caractères)".to_string()),
        });
    }
    
    state.secrets_engine
        .set_secret(KEY_NEW_PROVIDER, &key)
        .map_err(|e| format!("Failed to set key: {}", e))?;
    
    // ... rest of implementation
}
```

**Step 3: Frontend service**

```typescript
// /src/features/governance-center/services/governanceService.ts
export async function setNewProviderKey(apiKey: string): Promise<SecureResponse<GeminiKeyStatus>> {
  return await secureInvoke<SecureResponse<GeminiKeyStatus>>('set_new_provider_key', { key: apiKey });
}
```

**Step 4: UI dans Governance**

```tsx
// /src/features/governance-center/tabs/SecretsTab.tsx
<APIProviderCard
  provider="newprovider"
  status={newProviderStatus}
  onSetKey={setNewProviderKey}
  loading={saving}
/>
```

### 6.2 Tests

**Unit Test (Rust):**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_secrets_engine_encrypt_decrypt() {
        let passphrase = "test-passphrase-secure-16";
        let engine = SecureSecretsEngine::new(Some(passphrase.to_string())).unwrap();
        
        engine.set_secret("test_key", "test_value").unwrap();
        let retrieved = engine.get_secret("test_key").unwrap();
        
        assert_eq!(retrieved, Some("test_value".to_string()));
    }
    
    #[test]
    fn test_provider_key_isolation() {
        let engine = SecureSecretsEngine::new(Some("pass".to_string())).unwrap();
        
        engine.set_secret(KEY_OPENAI, "sk-openai-123").unwrap();
        engine.set_secret(KEY_GEMINI, "AIza-gemini-456").unwrap();
        
        assert_eq!(engine.get_secret(KEY_OPENAI).unwrap(), Some("sk-openai-123".to_string()));
        assert_eq!(engine.get_secret(KEY_GEMINI).unwrap(), Some("AIza-gemini-456".to_string()));
        assert_ne!(engine.get_secret(KEY_OPENAI).unwrap(), engine.get_secret(KEY_GEMINI).unwrap());
    }
}
```

---

## 7. FAQ

**Q: Que se passe-t-il si j'oublie mon passphrase?**
- R: Les secrets chiffrés sont irrécupérables. Vous devrez reconfigurer toutes les clés API. C'est un trade-off sécurité/UX.

**Q: Puis-je utiliser TITANE sans passphrase?**
- R: Oui, en mode éphémère (in-memory only). Les secrets ne persistent pas entre sessions.

**Q: Les secrets sont-ils synchronisés entre machines?**
- R: Non, par design. Chaque installation est indépendante (local-first).

**Q: Peut-on partager le secrets.enc avec un collègue?**
- R: Techniquement oui si vous partagez le passphrase, mais **non recommandé**. Chaque utilisateur devrait avoir ses propres clés API.

**Q: Les clés sont-elles accessibles depuis le Dev Tools?**
- R: Non, les clés restent côté backend (Rust). Le frontend n'a jamais accès aux clés en clair.

**Q: Comment migrer vers un nouveau passphrase?**
- R: Déchiffrer avec ancien passphrase, re-chiffrer avec nouveau. Feature à implémenter (P2 roadmap).

---

## 8. Références

**Standards & Best Practices:**
- NIST SP 800-38D: AES-GCM specification
- RFC 9106: Argon2 specification
- OWASP Secrets Management Cheat Sheet
- CWE-798: Use of Hard-coded Credentials (avoided)
- CWE-311: Missing Encryption of Sensitive Data (mitigated)

**Crates Rust utilisés:**
- `aes-gcm` v0.10: AES-256-GCM implementation
- `argon2` v0.5: Argon2id key derivation
- `base64` v0.21: Encoding/decoding
- `serde_json` v1.0: Serialization

**Tauri Security:**
- Tauri IPC is encrypted by design (Rust ↔ WebView)
- CSP (Content Security Policy) enforced
- No eval() in frontend

---

**Prochaine étape:** PHASE 3 — Backend Copilot Implementation

**Maintenu par:** TITANE∞ Security Team  
**Dernière mise à jour:** 2025-01-03
