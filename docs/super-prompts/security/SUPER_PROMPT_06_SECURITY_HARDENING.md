# 🔥 SUPER PROMPT #6 — TITANE∞ SECURITY HARDENING

**Durcissement de la sécurité (OWASP, CSP, CORS, chiffrement)**

---

## 📋 Métadonnées

- **Priorité** : 🔶 P1 (Haute)
- **Complexité** : ⭐⭐⭐⭐
- **Durée estimée** : 2-3h
- **Dépendances** : Super Prompt #2, #3
- **Output** : App sécurisée + Audit report
- **Outils** : GitHub Copilot Chat + VS Code

---

## 🎯 Objectif

**Sécuriser TITANE∞** contre les vulnérabilités OWASP Top 10 et renforcer la posture de sécurité.

---

## 🚀 Super Prompt

````markdown
@workspace

Tu es expert Security Engineer senior sur **TITANE_INFINITY**.

Ton rôle : **durcir la sécurité** de l'application (OWASP Top 10, CSP, chiffrement, sandbox).

---

## 1. AUDIT SÉCURITÉ

Génère : `docs/security/SECURITY_AUDIT_REPORT.md`

Checklist OWASP Top 10 :
- [ ] A01 : Broken Access Control
- [ ] A02 : Cryptographic Failures
- [ ] A03 : Injection (SQL, Command, XSS)
- [ ] A04 : Insecure Design
- [ ] A05 : Security Misconfiguration
- [ ] A06 : Vulnerable Components
- [ ] A07 : Authentication Failures
- [ ] A08 : Data Integrity Failures
- [ ] A09 : Logging & Monitoring Failures
- [ ] A10 : SSRF

---

## 2. CHIFFREMENT

### 2.1. Chiffrer les données sensibles

```rust
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, NewAead};

pub struct Encryptor {
    cipher: Aes256Gcm,
}

impl Encryptor {
    pub fn new(key: &[u8; 32]) -> Self {
        let key = Key::from_slice(key);
        let cipher = Aes256Gcm::new(key);
        Self { cipher }
    }

    pub fn encrypt(&self, plaintext: &[u8]) -> Result<Vec<u8>> {
        let nonce = Nonce::from_slice(b"unique nonce");
        self.cipher.encrypt(nonce, plaintext)
            .map_err(|e| TitaneError::Crypto(e.to_string()))
    }

    pub fn decrypt(&self, ciphertext: &[u8]) -> Result<Vec<u8>> {
        let nonce = Nonce::from_slice(b"unique nonce");
        self.cipher.decrypt(nonce, ciphertext)
            .map_err(|e| TitaneError::Crypto(e.to_string()))
    }
}
```

### 2.2. Stocker les clés de manière sécurisée

```rust
use keyring::Entry;

pub fn store_encryption_key(key: &str) -> Result<()> {
    let entry = Entry::new("TITANE_INFINITY", "encryption_key")?;
    entry.set_password(key)?;
    Ok(())
}

pub fn retrieve_encryption_key() -> Result<String> {
    let entry = Entry::new("TITANE_INFINITY", "encryption_key")?;
    Ok(entry.get_password()?)
}
```

---

## 3. CSP (Content Security Policy)

Tauri config : `src-tauri/tauri.conf.json`

```json
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'"
    }
  }
}
```

---

## 4. SANITIZATION AVANCÉE

```rust
use ammonia::Builder;

pub fn sanitize_html(input: &str) -> String {
    Builder::default()
        .link_rel(Some("noopener noreferrer"))
        .clean(input)
        .to_string()
}

pub fn sanitize_path(path: &str) -> Result<PathBuf> {
    let path = PathBuf::from(path);

    // Prevent path traversal
    if path.components().any(|c| c == Component::ParentDir) {
        return Err(TitaneError::Security("Path traversal detected".into()));
    }

    Ok(path)
}
```

---

## 5. RATE LIMITING AVANCÉ

```rust
use governor::{Quota, RateLimiter};
use std::num::NonZeroU32;

pub struct AdvancedRateLimiter {
    limiter: RateLimiter<String, DefaultKeyedStateStore<String>, DefaultClock>,
}

impl AdvancedRateLimiter {
    pub fn new(requests_per_minute: u32) -> Self {
        let quota = Quota::per_minute(NonZeroU32::new(requests_per_minute).unwrap());
        Self {
            limiter: RateLimiter::keyed(quota),
        }
    }

    pub fn check(&self, key: &str) -> bool {
        self.limiter.check_key(&key.to_string()).is_ok()
    }
}
```

---

## 6. LOGGING SÉCURISÉ

```rust
use tracing::info;

pub fn log_security_event(event_type: &str, details: &str) {
    // Ne jamais logger de données sensibles (passwords, tokens, etc.)
    info!(
        event_type = event_type,
        details = redact_sensitive(details),
        "Security event"
    );
}

fn redact_sensitive(input: &str) -> String {
    // Remplacer les patterns sensibles
    input
        .replace(r"password=\S+", "password=***")
        .replace(r"token=\S+", "token=***")
}
```

---

## 7. VALIDATION STRICTE

```rust
use validator::{Validate, ValidationError};

#[derive(Validate)]
pub struct UserInput {
    #[validate(length(min = 1, max = 1000))]
    #[validate(custom = "validate_no_script_tags")]
    content: String,
}

fn validate_no_script_tags(content: &str) -> Result<(), ValidationError> {
    if content.contains("<script") || content.contains("javascript:") {
        return Err(ValidationError::new("xss_attempt"));
    }
    Ok(())
}
```

---

## 8. OUTPUT ATTENDU

1. `docs/security/SECURITY_AUDIT_REPORT.md`
2. Chiffrement AES-256-GCM implémenté
3. CSP stricte configurée
4. Sanitization sur tous les inputs
5. Rate limiting avancé
6. Logging sécurisé (pas de leaks)
7. Tests de sécurité (injection, XSS, path traversal)

Commence par l'audit puis les correctifs critiques.
````

---

## ✅ Checklist

- [ ] Audit sécurité OWASP complet
- [ ] Chiffrement données sensibles
- [ ] CSP stricte active
- [ ] Sanitization tous inputs
- [ ] Rate limiting robuste
- [ ] Logging sans leaks
- [ ] Tests sécurité passent
- [ ] Scan vulnérabilités (cargo audit)

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-12-09
