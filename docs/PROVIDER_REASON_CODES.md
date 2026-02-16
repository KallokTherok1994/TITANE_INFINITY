# Provider Reason Codes (P3_META_V1)

**Scope:** Canonical reason codes for provider routing decisions.

## Enum (v1)

| Code | Definition | When Emitted |
|------|------------|--------------|
| OK | Successful provider completion | Provider returns a valid response |
| POLICY_LOCAL_ONLY | Policy forces local provider | `FORCE_LOCAL_PROVIDER=1` or equivalent |
| POLICY_REMOTE_ALLOWED | Remote usage permitted by policy | Remote path taken and allowed |
| ALLOWLIST_DENIED | Allowlist blocks route | Provider blocked by allowlist gate |
| PROVIDER_DOWN | Provider unreachable | Health check or connection fails |
| TIMEOUT | Timeout reached | Provider exceeded timeout_ms |
| RATE_LIMIT | Provider rate-limited | Provider returns rate-limit error |
| INVALID_CONFIG | Invalid configuration | Missing/invalid API key or config |
| NETWORK_ERROR | Network failure | DNS/TLS/connect failure to remote |
| FALLBACK_OFFLINE | Offline fallback triggered | `OFFLINE_SIM=1` or offline path forced |
| CACHE_HIT | Response served from cache | Local cache hit |
| CACHE_MISS | Cache miss then routed | Cache miss before routing |
| SERIALIZATION_DROPPED | Meta dropped in IPC serialization | Detected loss of meta in IPC |
| PROVIDER_UNAVAILABLE | Provider not available | Provider marked unavailable in registry |
| TOOL_REQUIRED | Tool required for completion | Model indicates tool use required |
| TOOL_DENIED | Tool denied by policy | Tool call blocked by policy |
| UNKNOWN | Unknown or unclassified | Fallback for uncategorized cases |

## Outcome Mapping

| Outcome | Expected reason_code |
|---------|----------------------|
| Success | OK |
| Policy local-only | POLICY_LOCAL_ONLY |
| Allowlist deny | ALLOWLIST_DENIED |
| Offline fallback | FALLBACK_OFFLINE |
| Cache hit | CACHE_HIT |
| Timeout | TIMEOUT |
| Provider down | PROVIDER_DOWN |
| Network failure | NETWORK_ERROR |
| Invalid config | INVALID_CONFIG |

## Minimal Meta Example

```json
{
  "meta": {
    "provider_used": "local",
    "provider_class": "local",
    "mode": "LOCAL",
    "reason_code": "OK",
    "latency_ms_total": 12,
    "timeout_ms": 30000,
    "retries": 0,
    "attempts": [
      {
        "provider_id": "local",
        "provider_class": "local",
        "start_ts": 1739712000000,
        "latency_ms": 12,
        "outcome": "success",
        "reason_code": "OK",
        "network_used_attempt": false
      }
    ],
    "network_used": false,
    "cache_hit": false,
    "policy": "DEFAULT"
  }
}
```
