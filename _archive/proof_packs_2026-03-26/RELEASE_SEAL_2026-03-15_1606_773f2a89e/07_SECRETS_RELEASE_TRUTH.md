# 07_SECRETS_RELEASE_TRUTH

## Verdict: PROD_SECRET_HYGIENE_PARTIAL

### .env file
- EXISTS at repo root (local only)
- Gitignored: YES (.gitignore includes .env)
- TAURI_DEBUG=false ✓
- GEMINI_API_KEY= (empty) ✓
- OPENAI_API_KEY= (empty) ✓
- ANTHROPIC_API_KEY= (empty) ✓
- Ollama: hardcoded localhost:11434 — expected for local-first fallback ✓
- Risk: .env is local, not committed. No leak risk.

### SecureSecretsEngine (src-tauri/src/secure_engine.rs)
- Empty passphrase guard: returns Err(MissingPassphrase) — HARD BLOCK ✓
- Uses Argon2id key derivation ✓
- AES-256-GCM encryption ✓
- No hardcoded passphrase, no fallback to empty key ✓

### Tauri updater signing
- TAURI_SIGNING_PRIVATE_KEY: GitHub secret — not embedded in code ✓
- Local build: updater key NOT present → updater signature absent in local binary
- Production: only signed in CI (GitHub secrets required)
- Risk: local release binary is UNSIGNED for updater → P1 if distributed

### Provider API keys
- Stored via SecureSecretsEngine at runtime (user-provided, encrypted at rest)
- No hardcoded API keys found in src-tauri/src/main.rs
- OLLAMA_HOST env: localhost:11434 hardcoded in subprocess spawn — expected local-only ✓

### Production config risks
1. Updater active=true in tauri.conf.json but local build has no signing key
   → Any local binary distributed would have unsigned updater → P1
2. External AI providers (Gemini etc.) require user-supplied keys at runtime (not build-time)
   → No build-time secret leakage ✓
3. .env example files (.env.deploy.example, .env.gpg.example) exist — must verify no real keys

### Classification
| Item | Status |
|------|--------|
| Empty passphrase guard | PASS (hard Err) |
| .env gitignored | PASS |
| No hardcoded API keys | PASS |
| No dev fallback to weak key | PASS |
| Updater signing (CI only) | PARTIAL — local binary unsigned |
| .env example files | UNKNOWN (not verified for real secrets) |

## Final: PROD_SECRET_HYGIENE_PARTIAL
Blocker for SEALED: updater signing requires CI secrets (unavailable locally).
This is expected behavior, not a code defect. Local binary should NOT be distributed.
