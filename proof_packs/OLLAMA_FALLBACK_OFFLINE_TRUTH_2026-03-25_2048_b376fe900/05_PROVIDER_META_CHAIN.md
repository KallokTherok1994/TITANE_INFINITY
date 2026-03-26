# CHAÎNE META PROVIDER

## Meta retourné par tauriProtector (avant fix)
```json
{
  "provider_used": "fallback",
  "provider_class": "local",
  "mode": "ERROR",
  "reason_code": "FALLBACK_OFFLINE",
  "network_used": false,
  "policy": "tauri_protector_runtime_fallback"
}
```

## Meta corrigé (après fix, si orchestrator réussit)
```json
{
  "provider_used": "titane-local",
  "mode": "LOCAL",
  "reason_code": "OK",
  "network_used": false,
  "policy": "conversation_engine_orchestrator_fallback"
}
```
