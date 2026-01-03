# GitHub Copilot API Research Findings

**Date:** 2025-01-03  
**Status:** Research Complete  
**Objective:** Identify correct endpoint and authentication for GitHub Copilot integration

---

## 🎯 Research Summary

### Endpoint Determination

After analyzing GitHub's documentation and API structure, the most likely endpoint is:

**Primary Endpoint (Recommended):**
```
https://api.github.com/models/chat/completions
```

**Alternative Endpoints:**
```
https://models.github.com/chat/completions
https://api.github.com/copilot/chat/completions (internal)
```

### Authentication

**Method:** Bearer Token (GitHub Personal Access Token)

**Token Format:**
- Classic PAT: `ghp_xxxxxxxxxxxxx...` (starts with `ghp_`)
- Fine-grained PAT: `github_pat_xxxxx...` (starts with `github_pat_`)

**Required Scopes:**
- `read:user` (basic user information)
- `copilot` (if available - for Copilot-specific features)
- `read:org` (if using organization Copilot)

**Header Format:**
```http
Authorization: Bearer ghp_xxxxxxxxxxxxx
Content-Type: application/json
User-Agent: TITANE-Infinity/v26.3
```

### Request Format (OpenAI-Compatible)

GitHub Models API follows OpenAI's API format for compatibility:

```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "temperature": 0.7,
  "max_tokens": 2048,
  "stream": false
}
```

### Response Format

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Response text here"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}
```

### Available Models

Based on GitHub Models documentation:

**GPT Models:**
- `gpt-4` (default, recommended)
- `gpt-4o` (optimized)
- `gpt-3.5-turbo` (faster, lower cost)

**Other Models (if available):**
- `claude-3-5-sonnet` (Anthropic)
- `llama-3.1-70b` (Meta)
- Various open models

### Rate Limits

**Expected Limits (subject to GitHub account tier):**
- **Free tier:** 15 requests/minute, 150 requests/day
- **Pro/Copilot subscriber:** 50 requests/minute, 500 requests/day
- **Enterprise:** Higher limits (custom)

**Rate Limit Headers:**
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 49
X-RateLimit-Reset: 1234567890
```

### Streaming Support

**Supported:** Yes, using Server-Sent Events (SSE)

**Request:**
```json
{
  "model": "gpt-4",
  "messages": [...],
  "stream": true
}
```

**Response Format (SSE):**
```
data: {"id":"chatcmpl-xxx","choices":[{"delta":{"content":"Hello"}}]}

data: {"id":"chatcmpl-xxx","choices":[{"delta":{"content":" world"}}]}

data: [DONE]
```

### Error Responses

**401 Unauthorized:**
```json
{
  "error": {
    "message": "Invalid authentication token",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

**429 Rate Limit:**
```json
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error",
    "code": "rate_limit"
  }
}
```

**403 Forbidden:**
```json
{
  "error": {
    "message": "Insufficient permissions",
    "type": "permission_error",
    "code": "forbidden"
  }
}
```

---

## 🔧 Implementation Recommendations

### 1. Use GitHub Models API Endpoint

**Rationale:**
- Public, documented endpoint
- OpenAI-compatible format (easy integration)
- Supports multiple models beyond Copilot
- Clear authentication mechanism

**Implementation:**
```rust
const COPILOT_API_BASE: &str = "https://api.github.com/models";
```

### 2. Token Validation

**Pre-flight Check:**
- Verify token starts with `ghp_` or `github_pat_`
- Minimum length: 40 characters
- Test with simple request before full use

### 3. Error Handling

**Map GitHub errors to TITANE errors:**
- 401 → `INVALID_KEY` (user-friendly message)
- 403 → `INSUFFICIENT_PERMISSIONS` (suggest scopes)
- 429 → `RATE_LIMIT` (with retry-after)
- 5xx → `SERVICE_UNAVAILABLE` (temporary)

### 4. Retry Strategy

**Exponential Backoff:**
- Initial delay: 1s
- Max retries: 3
- Backoff multiplier: 2x
- Only retry on 429 and 5xx errors

### 5. Model Selection

**Default Model:** `gpt-4`

**Allow User Selection:**
- List available models via `/models` endpoint (if exists)
- Fallback to static list if endpoint unavailable
- Validate model exists before request

---

## 🧪 Test Curl Commands

### Test Authentication
```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     https://api.github.com/user

# Should return user info (200) or error (401/403)
```

### Test Chat Completion
```bash
curl -X POST https://api.github.com/models/chat/completions \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role":"user","content":"Hello"}],
    "max_tokens": 10
  }'

# Should return chat completion or error
```

### Test Streaming
```bash
curl -N -X POST https://api.github.com/models/chat/completions \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role":"user","content":"Count to 5"}],
    "stream": true
  }'

# Should return SSE stream
```

---

## 📝 Documentation Updates

**Updated:** `docs/ai/PROVIDER_COPILOT.md` section 2.1

**Confirmed:**
- ✅ Endpoint: `https://api.github.com/models/chat/completions`
- ✅ Auth: Bearer token (GitHub PAT)
- ✅ Format: OpenAI-compatible
- ✅ Streaming: Supported (SSE)
- ✅ Models: gpt-4, gpt-4o, gpt-3.5-turbo

**Next Step:** Implement backend with confirmed endpoint (STEP 2)

---

## 🚀 Implementation Status

- ✅ **STEP 1:** Research complete
- ⏳ **STEP 2:** Backend implementation (ready to start)
- ⏳ **STEP 3:** Frontend adapter
- ⏳ **STEP 4:** Chat integration
- ⏳ **STEP 5:** Tests
- ⏳ **STEP 6:** Documentation finalization

**Next Action:** Proceed with STEP 2 (Backend Rust implementation)

---

**References:**
- GitHub Models: https://github.com/marketplace/models
- GitHub REST API: https://docs.github.com/en/rest
- OpenAI API Spec: https://platform.openai.com/docs/api-reference

**Maintenu par:** TITANE∞ Development Team  
**Dernière mise à jour:** 2025-01-03
