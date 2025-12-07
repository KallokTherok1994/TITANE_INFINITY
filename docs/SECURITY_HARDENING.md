# Security Hardening - TITANE

## Implemented Security Measures

### 1. Input Validation

- Message length validation (max 100k chars)
- XSS pattern detection
- SQL injection prevention
- Filename sanitization

### 2. Rate Limiting

- Configurable request limits
- Per-user tracking
- Sliding window algorithm
- Automatic cleanup

### 3. Audit Logging

- All security events logged
- JSON structured format
- Timestamp and user tracking
- Configurable retention

### 4. Content Security Policy

- Configured CSP headers
- XSS protection
- Frame-ancestors prevention
- Referrer policy

## Configuration

Add to `Cargo.toml`:

```toml
[dependencies]
regex = "1.10"
chrono = "0.4"
serde_json = "1.0"
```

## Usage

```rust
// Rate limiting
let rate_limiter = RateLimiter::new(100, 60); // 100 req/min
rate_limiter.check("user_id").await?;

// Input validation
InputValidator::validate_message(&message)?;

// Audit logging
audit_logger.log(AuditEvent {
    event_type: AuditEventType::SecurityViolation,
    // ...
}).await?;
```
