# 03_INVARIANTS_SCAN.md — Preuves scan invariants

## Ring2 I/O (après correction)
```
rg "(safeInvoke|tauriClient|invoke\()" src/engines → 0 résultat pertinent
selfHealingEngine.ts : imports queryOllama/safeInvoke SUPPRIMÉS
cognitiveLayoutIntegrations.ts : SUPPRIMÉ de src/engines/cognitive/
```

## CSP img-src (après correction)
```
src-tauri/tauri.conf.json ligne 66:
  "img-src 'self' asset: data: blob:"  (https: RETIRÉ)
```

## IPC ok field (après correction)
```
conversation_generate retourne:
  - "ok": true  dans blocked_response (policy/resilience/backend_gate)
  - "ok": true  dans la réponse finale succès
```

## Mutex unwrap (après correction)
```
src-tauri/src/services/db_service.rs : 9 lock().expect("db_service: Mutex poisonné")
  toutes les occurrences lock().unwrap() remplacées
```

## textarea disabled (CHAT-01)
```
src/components/sections/ConversationSection.tsx ligne 1340:
  disabled={isLoading}   ← déjà présent avant ce fix
```
