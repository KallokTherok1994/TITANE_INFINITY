# TIMEOUT_POLICY.md

If token not received within 48h:
- Auto-expire launch intent
- Move to HOLD state
- Append registry entry: P8_5_EXPIRED_NO_TOKEN

No escalation unless explicitly requested.
Single polite follow-up at +24h.
