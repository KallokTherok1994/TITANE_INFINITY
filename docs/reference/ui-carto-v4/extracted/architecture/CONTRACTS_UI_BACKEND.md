# Contrats UI ↔ Backend (IPC / API) — indispensables

Objectif : éviter les écrans “UNKNOWN/NaN”, erreurs JS, et silences.

## 1) Contrat de réponse standard (recommandé)
Tout appel (IPC Tauri / fetch local) retourne :

```ts
type Ok<T> = { ok: true; data: T; meta?: Meta }
type Err = { ok: false; error: { code: string; message: string; details?: any }; meta?: Meta }
type Result<T> = Ok<T> | Err

type Meta = {
  requestId: string
  ts: number
  source: "ipc" | "http" | "mock"
  durationMs?: number
  degraded?: boolean
}
```

Règles UI :
- Si `ok:false` → afficher **bannière** + bouton **Retry** + bouton **Open logs**.
- Interdire les `undefined` en UI : `null-safe` obligatoire.

## 2) Health endpoints / status contracts
Chaque “centre” visible (System/Governance/Design/Audio/Evolution/Orchestration) devrait exposer :
- `status: "ok" | "degraded" | "down"`
- `score: number (0-100)`
- `warnings: Warning[]`
- `lastUpdated: ISO`
- `actions: Action[]` (exécutable via IPC)

## 3) Tests & runners
Les boutons “Exécuter” doivent appeler un runner déterministe :
- `runTests({suite:"unit"|"integration"|"e2e"|"perf"})`
- Streaming d’événements (progress) recommandé :
  - `started`, `case_pass`, `case_fail`, `finished`

## 4) Chat (Always Respond)
Contrat minimal :
- `sendMessage({conversationId, provider, mode, text, attachments}) -> Result<{messageId, content, tokens?, latencyMs}>`
- Timeout + circuit breaker :
  - si provider down → fallback `MockLocal`
  - si erreur → message UI de type “error bubble” (pas un silence)

## 5) Orchestration / Optimization
Les dashboards d’optimisation affichent des métriques :
- `gpu_backend: "webgl"|"cpu"`
- `wasm_enabled: boolean`
- `service_worker_registered: boolean`
- `indexeddb_status: "ok"|"needs_compact"|"error"`

Chaque champ doit être **nullable** et présenté avec un état explicite (ex. “Non supporté”).

