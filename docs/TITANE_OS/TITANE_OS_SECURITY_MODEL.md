# TITANE_OS_SECURITY_MODEL.md

## Security Model — Defense-in-Depth Architecture v20.1

**Date:** 2025-12-07
**Version:** TITANE∞ v20.1
**Classification:** Official Documentation

---

## 1. Overview

TITANE∞ implements a **defense-in-depth security architecture** with multiple layers of protection. The security model covers input validation, encryption, sandboxing, rate limiting, audit logging, and secure vault storage.

### 1.1 Security Principles

| Principle             | Implementation                         |
| --------------------- | -------------------------------------- |
| **Defense in Depth**  | Multiple security layers               |
| **Least Privilege**   | Minimal permissions per domain         |
| **Secure by Default** | Sandbox enabled, strict mode available |
| **Audit Everything**  | Structured security logging            |
| **Zero Trust**        | Validate all inputs, even internal     |

### 1.2 Module Organization

```
src-tauri/src/security/
├── mod.rs              # Module exports, SecurityManager
├── validation.rs       # Input validation (InputValidator)
├── encryption.rs       # AES-256-GCM encryption (CryptoEngine)
├── vault_engine.rs     # Secure vault storage
├── sandbox.rs          # Filesystem sandboxing
├── shell_guard.rs      # Command execution guard
├── storage_guard.rs    # Storage access control
├── permission_guard.rs # Permission system
├── permissions.rs      # Permission definitions
├── rate_limit.rs       # Rate limiting (v19.3)
├── audit.rs            # Audit logging (v19.3)
├── csp.rs              # Content Security Policy
├── hardening.rs        # Global hardening self-test
├── pre_boot_validation.rs # Pre-boot security checks
├── secrets_engine.rs   # Secrets management
└── commands.rs         # Tauri security commands
```

---

## 2. Security Domains

```rust
pub enum SecurityDomain {
    /// Internal cores (Helios/Nexus/Harmonia/Sentinel/Memory)
    CoreInternal,
    /// Auto-evolution/repair engine
    EngineSubsystem,
    /// IO services (storage, network)
    IoServices,
    /// External execution (shell, process)
    ExternalExecution,
    /// Tauri API (frontend → backend)
    TauriApi,
    /// User files (memory, snapshots, logs)
    UserData,
}
```

### 2.1 Trust Levels

```rust
pub enum TrustLevel {
    Trusted = 3,    // Internal safe operation
    Validated = 2,  // Validated operation
    Untrusted = 1,  // User/external input
    Forbidden = 0,  // Blocked by default
}
```

### 2.2 Operation Classes

```rust
pub enum OperationClass {
    FileRead,       // File reading
    FileWrite,      // File writing
    ShellExecute,   // Command execution
    NetworkOut,     // Outbound network
    SystemMutation, // System state changes
}
```

---

## 3. Security Manager

**Location:** `src/security/mod.rs`

The unified security manager orchestrates all security subsystems:

```rust
pub struct SecurityManager {
    validator: InputValidator,
    rate_limiter: RateLimiter,
    audit_logger: AuditLogger,
    encryptor: Option<Encryptor>,
}

impl SecurityManager {
    pub fn new(audit_log_path: PathBuf) -> Self {
        Self {
            validator: InputValidator::default(),
            rate_limiter: RateLimiter::new(100, 60), // 100 req/60s
            audit_logger: AuditLogger::new(audit_log_path),
            encryptor: None,
        }
    }

    pub async fn validate_and_rate_limit(
        &self,
        user_id: &str,
        message: &str
    ) -> TitaneResult<()> {
        // Check rate limits first
        self.rate_limiter.check(user_id).await?;

        // Validate input
        self.validator.validate_message(message)?;

        Ok(())
    }
}
```

---

## 4. Input Validation

**Location:** `src/security/validation.rs`

### 4.1 InputValidator

```rust
pub struct InputValidator {
    pub max_message_length: usize,
    pub max_filename_length: usize,
    pub forbidden_patterns: Vec<Regex>,
    pub sanitization_rules: Vec<SanitizationRule>,
}

impl Default for InputValidator {
    fn default() -> Self {
        Self {
            max_message_length: 10_000,
            max_filename_length: 255,
            forbidden_patterns: vec![
                Regex::new(r"(?i)<script").unwrap(),
                Regex::new(r"(?i)javascript:").unwrap(),
                Regex::new(r"\x00").unwrap(), // Null bytes
            ],
            sanitization_rules: vec![
                SanitizationRule::TrimWhitespace,
                SanitizationRule::NormalizeUnicode,
                SanitizationRule::EscapeHtml,
            ],
        }
    }
}

impl InputValidator {
    /// Validate a user message
    pub fn validate_message(&self, message: &str) -> Result<(), ValidationError> {
        // Length check
        if message.len() > self.max_message_length {
            return Err(ValidationError::MessageTooLong(message.len()));
        }

        // Empty check
        if message.trim().is_empty() {
            return Err(ValidationError::EmptyMessage);
        }

        // Forbidden pattern check
        for pattern in &self.forbidden_patterns {
            if pattern.is_match(message) {
                return Err(ValidationError::ForbiddenPattern(pattern.to_string()));
            }
        }

        Ok(())
    }

    /// Sanitize a filename
    pub fn sanitize_filename(&self, filename: &str) -> String {
        let sanitized: String = filename
            .chars()
            .filter(|c| c.is_alphanumeric() || *c == '.' || *c == '-' || *c == '_')
            .collect();

        // Truncate to max length
        if sanitized.len() > self.max_filename_length {
            sanitized[..self.max_filename_length].to_string()
        } else {
            sanitized
        }
    }
}
```

### 4.2 Validation Errors

```rust
#[derive(Debug, thiserror::Error)]
pub enum ValidationError {
    #[error("Message too long: {0} chars (max: 10000)")]
    MessageTooLong(usize),

    #[error("Empty message not allowed")]
    EmptyMessage,

    #[error("Forbidden pattern detected: {0}")]
    ForbiddenPattern(String),

    #[error("Invalid characters in filename")]
    InvalidFilename,
}
```

---

## 5. Encryption

**Location:** `src/security/encryption.rs`

### 5.1 CryptoEngine

```rust
pub struct CryptoEngine {
    cipher: Aes256Gcm,
}

pub type MasterKey = [u8; 32];

impl CryptoEngine {
    pub fn new(key: &MasterKey) -> Self {
        let cipher = Aes256Gcm::new(GenericArray::from_slice(key));
        Self { cipher }
    }

    /// Encrypt data with AES-256-GCM
    pub fn encrypt(&self, plaintext: &[u8]) -> Result<EncryptedData, CryptoError> {
        // Generate random nonce (12 bytes)
        let mut nonce_bytes = [0u8; 12];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = GenericArray::from_slice(&nonce_bytes);

        // Encrypt
        let ciphertext = self.cipher
            .encrypt(nonce, plaintext)
            .map_err(|_| CryptoError::EncryptionFailed)?;

        Ok(EncryptedData {
            nonce: nonce_bytes.to_vec(),
            ciphertext,
        })
    }

    /// Decrypt data
    pub fn decrypt(&self, encrypted: &EncryptedData) -> Result<Vec<u8>, CryptoError> {
        let nonce = GenericArray::from_slice(&encrypted.nonce);

        self.cipher
            .decrypt(nonce, encrypted.ciphertext.as_ref())
            .map_err(|_| CryptoError::DecryptionFailed)
    }
}
```

### 5.2 MasterKey Generation

```rust
pub trait MasterKeyGenerator {
    fn generate() -> Self;
}

impl MasterKeyGenerator for MasterKey {
    fn generate() -> Self {
        use rand::RngCore;
        let mut key = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut key);
        key
    }
}
```

### 5.3 Encrypted Data Structure

```rust
#[derive(Serialize, Deserialize)]
pub struct EncryptedData {
    pub nonce: Vec<u8>,     // 12 bytes
    pub ciphertext: Vec<u8>, // Variable length
}
```

---

## 6. Vault Engine

**Location:** `src/security/vault_engine.rs`

Secure storage for sensitive data:

```rust
pub struct VaultEngine {
    crypto: CryptoEngine,
    storage_path: PathBuf,
    entries: HashMap<String, VaultEntry>,
    locked: bool,
}

pub struct VaultEntry {
    pub id: String,
    pub encrypted_data: EncryptedData,
    pub created_at: u64,
    pub updated_at: u64,
    pub metadata: VaultMetadata,
}

impl VaultEngine {
    pub fn new(master_key: &MasterKey, storage_path: PathBuf) -> Self {
        Self {
            crypto: CryptoEngine::new(master_key),
            storage_path,
            entries: HashMap::new(),
            locked: true,
        }
    }

    /// Unlock the vault
    pub fn unlock(&mut self, key: &MasterKey) -> Result<(), VaultError> {
        // Verify key by attempting to decrypt test entry
        self.verify_key(key)?;
        self.locked = false;
        Ok(())
    }

    /// Store a secret
    pub fn store(&mut self, id: &str, data: &[u8]) -> Result<(), VaultError> {
        if self.locked {
            return Err(VaultError::VaultLocked);
        }

        let encrypted = self.crypto.encrypt(data)?;
        let now = timestamp_now();

        self.entries.insert(id.to_string(), VaultEntry {
            id: id.to_string(),
            encrypted_data: encrypted,
            created_at: now,
            updated_at: now,
            metadata: VaultMetadata::default(),
        });

        self.persist()?;
        Ok(())
    }

    /// Retrieve a secret
    pub fn retrieve(&self, id: &str) -> Result<Vec<u8>, VaultError> {
        if self.locked {
            return Err(VaultError::VaultLocked);
        }

        let entry = self.entries.get(id)
            .ok_or(VaultError::EntryNotFound)?;

        self.crypto.decrypt(&entry.encrypted_data)
            .map_err(|_| VaultError::DecryptionFailed)
    }
}
```

---

## 7. Sandbox & Guards

### 7.1 Filesystem Sandbox

**Location:** `src/security/sandbox.rs`

```rust
pub struct FsSandbox {
    allowed_root: PathBuf,
    read_only_paths: Vec<PathBuf>,
    blocked_extensions: Vec<String>,
}

impl FsSandbox {
    pub fn validate_path(&self, path: &Path) -> Result<(), SecurityViolation> {
        // Resolve to absolute path
        let canonical = path.canonicalize()
            .map_err(|_| SecurityViolation::InvalidPath)?;

        // Check for path traversal
        if canonical.to_string_lossy().contains("..") {
            return Err(SecurityViolation::PathTraversal);
        }

        // Check if within allowed root
        if !canonical.starts_with(&self.allowed_root) {
            return Err(SecurityViolation::OutsideSandbox);
        }

        // Check blocked extensions
        if let Some(ext) = path.extension() {
            if self.blocked_extensions.contains(&ext.to_string_lossy().to_string()) {
                return Err(SecurityViolation::Forbidden("Blocked extension".into()));
            }
        }

        Ok(())
    }
}
```

### 7.2 Shell Guard

**Location:** `src/security/shell_guard.rs`

```rust
pub struct ShellGuard {
    allowed_commands: HashSet<String>,
    blocked_args: Vec<Regex>,
}

impl ShellGuard {
    pub fn validate_command(&self, command: &str, args: &[&str]) -> Result<(), SecurityViolation> {
        // Check if command is in whitelist
        if !self.allowed_commands.contains(command) {
            return Err(SecurityViolation::UnauthorizedCommand(command.into()));
        }

        // Check for dangerous arguments
        for arg in args {
            for pattern in &self.blocked_args {
                if pattern.is_match(arg) {
                    return Err(SecurityViolation::DangerousArgument(arg.to_string()));
                }
            }
        }

        Ok(())
    }
}
```

### 7.3 Default Allowed Commands

```rust
impl Default for SecurityPolicy {
    fn default() -> Self {
        Self {
            allowed_shell_commands: vec![
                // TTS engines
                "espeak".into(),
                "espeak-ng".into(),
                "festival".into(),
                "piper".into(),
                "whisper".into(),
                // Audio players - Linux
                "pactl".into(),
                "aplay".into(),
                "ffplay".into(),
                // Audio players - macOS
                "afplay".into(),
                // Utilities
                "which".into(),
            ],
            // ...
        }
    }
}
```

---

## 8. Rate Limiting (v19.3)

**Location:** `src/security/rate_limit.rs`

```rust
pub struct RateLimiter {
    requests_per_window: u32,
    window_seconds: u64,
    buckets: DashMap<String, TokenBucket>,
}

struct TokenBucket {
    tokens: u32,
    last_refill: u64,
}

impl RateLimiter {
    pub fn new(requests_per_window: u32, window_seconds: u64) -> Self {
        Self {
            requests_per_window,
            window_seconds,
            buckets: DashMap::new(),
        }
    }

    pub async fn check(&self, user_id: &str) -> Result<(), RateLimitError> {
        let now = timestamp_now();

        let mut bucket = self.buckets
            .entry(user_id.to_string())
            .or_insert(TokenBucket {
                tokens: self.requests_per_window,
                last_refill: now,
            });

        // Refill tokens if window has passed
        let elapsed = now - bucket.last_refill;
        if elapsed >= self.window_seconds {
            bucket.tokens = self.requests_per_window;
            bucket.last_refill = now;
        }

        // Check and consume token
        if bucket.tokens > 0 {
            bucket.tokens -= 1;
            Ok(())
        } else {
            Err(RateLimitError::TooManyRequests {
                retry_after: self.window_seconds - elapsed,
            })
        }
    }
}

pub struct RateLimitStats {
    pub total_requests: u64,
    pub blocked_requests: u64,
    pub unique_users: usize,
}
```

---

## 9. Audit Logging (v19.3)

**Location:** `src/security/audit.rs`

```rust
pub struct AuditLogger {
    log_path: PathBuf,
    buffer: RwLock<Vec<AuditEvent>>,
    flush_threshold: usize,
}

pub struct AuditEvent {
    pub timestamp: u64,
    pub event_type: AuditEventType,
    pub severity: AuditSeverity,
    pub user_id: Option<String>,
    pub action: String,
    pub resource: String,
    pub outcome: AuditOutcome,
    pub details: HashMap<String, String>,
}

pub enum AuditEventType {
    Authentication,
    Authorization,
    DataAccess,
    DataModification,
    SystemChange,
    SecurityViolation,
}

pub enum AuditSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

pub enum AuditOutcome {
    Success,
    Failure,
    Blocked,
}

impl AuditLogger {
    pub fn log(&self, event: AuditEvent) {
        let mut buffer = self.buffer.write().unwrap();
        buffer.push(event);

        if buffer.len() >= self.flush_threshold {
            self.flush(&mut buffer);
        }
    }

    fn flush(&self, buffer: &mut Vec<AuditEvent>) {
        // Write to audit log file
        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_path)
            .expect("Failed to open audit log");

        let mut writer = BufWriter::new(file);
        for event in buffer.drain(..) {
            let json = serde_json::to_string(&event).unwrap();
            writeln!(writer, "{}", json).unwrap();
        }
    }
}
```

---

## 10. Security Events

```rust
pub struct SecurityEvent {
    pub timestamp: u64,
    pub domain: SecurityDomain,
    pub severity: Severity,
    pub operation: OperationClass,
    pub target: String,
    pub message: String,
    pub details: Option<String>,
    pub blocked: bool,
}

pub enum Severity {
    Info,
    Warning,
    Error,
    Critical,
}
```

---

## 11. Security Violations

```rust
#[derive(Debug, thiserror::Error)]
pub enum SecurityViolation {
    #[error("Unauthorized command: {0}")]
    UnauthorizedCommand(String),

    #[error("Path traversal attempt detected")]
    PathTraversal,

    #[error("Path outside sandbox")]
    OutsideSandbox,

    #[error("Invalid path")]
    InvalidPath,

    #[error("Operation forbidden: {0}")]
    Forbidden(String),

    #[error("Invalid command: {0}")]
    InvalidCommand(String),

    #[error("Dangerous argument: {0}")]
    DangerousArgument(String),
}
```

---

## 12. Content Security Policy

**Location:** `src/security/csp.rs`

```rust
pub struct ContentSecurityPolicy {
    pub default_src: Vec<String>,
    pub script_src: Vec<String>,
    pub style_src: Vec<String>,
    pub img_src: Vec<String>,
    pub connect_src: Vec<String>,
    pub frame_ancestors: Vec<String>,
}

impl Default for ContentSecurityPolicy {
    fn default() -> Self {
        Self {
            default_src: vec!["'self'".into()],
            script_src: vec!["'self'".into()],
            style_src: vec!["'self'".into(), "'unsafe-inline'".into()],
            img_src: vec!["'self'".into(), "data:".into(), "blob:".into()],
            connect_src: vec![
                "'self'".into(),
                "https://api.openai.com".into(),
                "https://api.anthropic.com".into(),
                "https://generativelanguage.googleapis.com".into(),
            ],
            frame_ancestors: vec!["'none'".into()],
        }
    }
}

impl ContentSecurityPolicy {
    pub fn to_header(&self) -> String {
        format!(
            "default-src {}; script-src {}; style-src {}; img-src {}; connect-src {}; frame-ancestors {}",
            self.default_src.join(" "),
            self.script_src.join(" "),
            self.style_src.join(" "),
            self.img_src.join(" "),
            self.connect_src.join(" "),
            self.frame_ancestors.join(" ")
        )
    }
}
```

---

## 13. Security Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: INPUT VALIDATION                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  InputValidator                                         │   │
│  │  - Length limits (10,000 chars)                         │   │
│  │  - Forbidden patterns (XSS, injection)                  │   │
│  │  - Filename sanitization                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  Layer 2: RATE LIMITING                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  RateLimiter                                            │   │
│  │  - Token bucket algorithm                               │   │
│  │  - Per-user quotas (100 req/60s)                        │   │
│  │  - DashMap for concurrent access                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  Layer 3: SANDBOXING                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  FsSandbox + ShellGuard                                 │   │
│  │  - Path validation (no traversal)                       │   │
│  │  - Command whitelist (TTS, audio only)                  │   │
│  │  - Argument filtering                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  Layer 4: ENCRYPTION                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CryptoEngine + VaultEngine                             │   │
│  │  - AES-256-GCM encryption                               │   │
│  │  - Random nonce generation                              │   │
│  │  - Secure key storage                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  Layer 5: AUDIT LOGGING                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  AuditLogger                                            │   │
│  │  - Structured JSON logs                                 │   │
│  │  - Severity levels                                      │   │
│  │  - Buffered writes                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 14. Related Documentation

| Document                                                     | Description         |
| ------------------------------------------------------------ | ------------------- |
| [TITANE_OS_OVERVIEW.md](TITANE_OS_OVERVIEW.md)               | System architecture |
| [TITANE_DEVOPS_AND_TESTING.md](TITANE_DEVOPS_AND_TESTING.md) | Security testing    |

---

_Documentation officielle TITANE∞ Security Model v20.1 — Super Prompt #5_
