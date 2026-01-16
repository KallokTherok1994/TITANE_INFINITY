# Capability: Memory Core Encryption

## 1. Nom & But

**Nom**: memory-core-encryption  
**But**: Chiffrement AES-256-GCM du fichier `memory_core_state.json` au repos pour protéger les données sensibles de l'utilisateur.

Cette capability garantit que les données personnelles stockées dans le système de mémoire core sont chiffrées avec une clé dérivée du mot de passe utilisateur, empêchant la lecture des données en cas d'accès non autorisé au système de fichiers.

## 2. Statut

**Statut Actuel**: `EXPERIMENTAL`  
**Version**: `0.1.0`  
**Date Création**: 2026-01-13  
**Responsable Technique**: TITANE∞ Core Team  
**Prochaine Révision**: 2026-02-13  

**Historique des Statuts**:
- `0.1.0` (2026-01-13): EXPERIMENTAL - Implémentation initiale

## 3. Surface Exposée

### APIs Publiques
```rust
// src-tauri/src/memory/encryption.rs
pub struct MemoryEncryption {
    pub fn new() -> Self;
    pub fn encrypt_file(&self, plain_path: &str, key: &[u8]) -> Result<(), EncryptionError>;
    pub fn decrypt_file(&self, cipher_path: &str, key: &[u8]) -> Result<String, EncryptionError>;
}

// Tauri Commands
#[tauri::command]
pub async fn unlock_memory_vault(password: String) -> Result<bool, String>;

#[tauri::command] 
pub async fn lock_memory_vault() -> Result<bool, String>;
```

### Configuration
```json
{
  "memory_encryption": {
    "algorithm": "AES-256-GCM",
    "key_derivation": "PBKDF2-SHA256",
    "iterations": 100000,
    "salt_size": 32,
    "nonce_size": 12
  }
}
```

## 4. Inputs/Outputs

### Inputs
- **Password**: String utilisateur (UTF-8, 8-128 caractères)
- **Plain Data**: JSON structure de `memory_core_state.json`
- **Unlock Request**: Command Tauri avec password

### Outputs  
- **Encrypted File**: `memory_core_state.json.enc` (binaire chiffré)
- **Success/Error**: Boolean + message d'erreur détaillé
- **Memory State**: Objet JSON décrypté en mémoire

### Contrats
```typescript
interface UnlockRequest {
  password: string; // min 8, max 128 chars
}

interface UnlockResponse {
  success: boolean;
  error?: string;
  memory_unlocked?: boolean;
}
```

## 5. Risques

### Risques Techniques
1. **Performance**: Dérivation de clé PBKDF2 peut prendre 100-200ms
2. **Mémoire**: Clé et données décryptées en RAM temporaire
3. **Corruption**: Panne durant l'écriture peut corrompre le fichier

### Risques Sécurité
1. **Brute Force**: Mot de passe faible exposé aux attaques dictionnaire
2. **Side Channel**: Timing attacks possibles sur la dérivation
3. **Memory Dumps**: Clé récupérable via dump mémoire process

### Mitigations
- Validation robuste mot de passe (zxcvbn score ≥ 3)
- Zeroing explicite des buffers sensibles
- Backup atomique avant écriture chiffrée
- Rate limiting sur les tentatives de déchiffrement

## 6. Tests & Validation

### Tests Unitaires
```bash
# src-tauri/src/memory/encryption_test.rs
cargo test memory::encryption -- --nocapture
```

### Tests d'Intégration
```typescript
// src/utils/__tests__/memory-encryption.test.ts
describe('Memory Core Encryption', () => {
  test('encrypt/decrypt cycle preserves data integrity')
  test('wrong password fails gracefully')
  test('corrupted file detected and handled')
})
```

### Validation Sécurité
- [ ] Audit cryptographique des algorithmes
- [ ] Test fuzzing sur les inputs
- [ ] Vérification timing attacks résistance

## 7. Observabilité

### Métriques
```rust
// Labels: operation=[encrypt,decrypt,unlock], result=[success,error]
memory_encryption_operations_total: Counter
memory_encryption_duration_seconds: Histogram
memory_vault_locked_state: Gauge
```

### Logs
```rust
info!("Memory vault encryption initialized");
info!("Memory vault unlocked successfully"); 
error!("Failed to decrypt memory vault: {}", err);
warn!("Multiple failed unlock attempts from IP: {}", ip);
```

### Alertes
- 5+ échecs de déchiffrement consécutifs
- Tentative d'accès sans authentification
- Corruption détectée du fichier chiffré

## 8. Critères d'Acceptation

### Fonctionnels
- [x] Chiffrement AES-256-GCM fonctionnel
- [x] Déchiffrement avec mot de passe correct
- [x] Rejet mot de passe incorrect
- [x] Interface Tauri commands opérationnelle
- [ ] Validation force mot de passe (zxcvbn ≥ 3)
- [ ] Recovery mode si fichier corrompu

### Non-Fonctionnels  
- [ ] Performance: unlock < 500ms sur hardware moyen
- [ ] Sécurité: audit crypto externe validé
- [ ] Robustesse: 10k cycles encrypt/decrypt sans corruption
- [ ] UX: feedback utilisateur sur état verrou

## 9. Plan de Rollback

### Rollback Immédiat (< 5min)
1. Désactiver feature flag `MEMORY_ENCRYPTION_ENABLED`
2. Restaurer `memory_core_state.json` depuis backup plain
3. Redémarrer service memory core

### Rollback Complet (< 30min)
1. Revert commits capability encryption
2. Rebuild avec version précédente
3. Migration données chiffrées → plain text si nécessaire
4. Tests validation données intègres

### Procédure Recovery
```bash
# Si fichier corrompu détecté
cp ~/.local/share/titane-infinity/memory/backup/memory_core_state.json.backup \
   ~/.local/share/titane-infinity/memory/memory_core_state.json
```

## 10. Promotion Checklist

### EXPERIMENTAL → QUALIFIED
- [ ] justification technique et besoin métier documentés
- [ ] surface d'exposition minimale justifiée  
- [ ] validation inputs/outputs avec contrats
- [ ] tests automatisés 90%+ coverage
- [ ] gates CI configurés et PASS
- [ ] observabilité et logs configurés
- [ ] procédure rollback testée
- [ ] mode dégradé local-first opérationnel
- [ ] documentation utilisateur complète
- [ ] review technique approuvée
- [ ] validation sécurité et privacy impact

### QUALIFIED → STABLE
Checklist complémentaire sur retours utilisateurs, optimisations, audit externe.

## 11. Notes & Historique

### Décisions Techniques
- **2026-01-13**: Choix AES-256-GCM vs ChaCha20-Poly1305 (AES hardware acceleration)
- **2026-01-13**: PBKDF2 vs Argon2 (compatibilité cross-platform)

### TODOs
- [ ] Implémenter support HSM/hardware security keys
- [ ] Migration progressive encryption existing installations  
- [ ] Support multi-user avec clés séparées

### Références
- [NIST SP 800-38D](https://csrc.nist.gov/publications/detail/sp/800-38d/final): GCM Mode
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- Tauri Security Guide: [https://tauri.app/v1/guides/development/security](https://tauri.app/v1/guides/development/security)