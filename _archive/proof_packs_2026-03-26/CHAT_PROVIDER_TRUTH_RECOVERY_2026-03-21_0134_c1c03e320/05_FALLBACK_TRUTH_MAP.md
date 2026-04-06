# FALLBACK_TRUTH_MAP

## Ollama Fallback Chain (Rust)

| Property | Details | Status |
|----------|---------|--------|
| Trigger | is_provider_available() returns false (count >= 3 within cache window) | CORRECT |
| Decision point | chat_send_message() line 591 — `if !is_available { continue }` | CORRECT |
| Fallback meaning | Skip to next provider in priority list (gemini, openai, anthropic, local) | CORRECT |
| Fallback reason logged | `[CHAT] ⏭️ Provider {name} non disponible (skip)` | HONEST |
| Fallback cleared after recovery | YES — reset_provider_failures() clears on: (a) actual success, (b) probe success [NEW FIX] | ✅ FIXED |
| UI labels stale after recovery | DEPENDS on how quickly UI polls/re-checks. Router now re-enables provider after 30s probe. | REDUCED |

## Fallback Order (chat_send_message)
When requested_provider == "auto":
1. ollama (if enabled and ollama_auto_enabled)
2. gemini (if key present and count < 3)
3. openai (if key present and count < 3)
4. anthropic (if key present and count < 3)
5. local (always available)

When all fail: returns explicit `TAPIError::provider_unavailable` — no silent fallback.

## Anti-Stale Guarantee (post-fix)
After probe success (30s TTL expiry + Ollama responds to /api/tags):
- `reset_provider_failures("ollama", state).await` is now called
- count returns to 0
- Next cache window: is_provider_available returns true immediately
- No "stale disabled" state persists past one 30s cache window if Ollama is alive
