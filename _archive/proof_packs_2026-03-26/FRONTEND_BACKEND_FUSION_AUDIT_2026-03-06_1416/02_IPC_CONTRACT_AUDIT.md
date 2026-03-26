# AUDIT CONTRAT IPC — VÉRITÉ DES SHAPES DE RÉPONSE
## Surface B : Cohérence des structures de données IPC

---

## Contrat canonique IPC (frontend)

Fichier : `src/utils/invoke.ts`

```typescript
export interface CanonicalIpcResult<T> {
  ok: boolean;
  content: T | null;
  error: IpcErrorPayload | null;
}
```

Le wrapper `normalizeIpcResponse()` gère deux cas :
1. **Réponse canonique** : contient `ok`, `content`, `error` → utilisée directement
2. **Réponse legacy** : contient `success` ou `fallback` → normalisée vers le format canonique

---

## Vérification du contrat — Points clés

### 1. Canonicité de `normalizeIpcResponse()`

```typescript
// Cas 1 : Réponse canonique {ok, content, error}
if ('ok' in candidate && 'content' in candidate && 'error' in candidate) {
  return { ok: candidate.ok === true, content: ..., error: ... };
}

// Cas 2 : Réponse legacy {success}
if ('success' in candidate || 'fallback' in candidate) {
  const success = candidate.success === true;
  return { ok: success, content: success ? response as T : null,
    error: success ? null : { code: 'IPC_LEGACY_RESPONSE', ... } };
}

// Cas 3 : null/undefined → erreur explicite
// Cas 4 : valeur primitive → wrappée comme { ok: true, content: value }
```

**Verdict : PASS** — La normalisation est exhaustive et ne produit pas de silence.

### 2. Validation `conversation_generate` (OMEGA v2)

Fichier : `src/lib/ipcContract.ts`

```typescript
const ConversationGenerateArgsSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().min(1),   // camelCase enforced
  mode: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
  systemPrompt: z.string().nullable().optional(),
  requestId: z.string().nullable().optional(),
});
```

Le test de contrat vérifie :
- Le rejet de `conversation_id` (snake_case) → erreur `/snake_case/i`
- L'obligation d'un wrapper `args`
- La performance de vérification < 1000ms

**Verdict : PASS**

### 3. Champ IPC — `ok` vs `success`

| Frontend attend | Backend renvoie | Normalisation |
|-----------------|-----------------|---------------|
| `ok: boolean` | `ok: bool` (Rust canonical) | Identique |
| `content: T` | `content: T` (Rust canonical) | Identique |
| `error: {...}` | `error: String` (legacy Rust) | Normalisé via `IPC_LEGACY_RESPONSE` |

**Constat** : Certaines commandes backend (commandes legacy en Rust) retournent `Result<T, String>` 
directement sans encapsuler dans `{ok, content, error}`. Le frontend normalise cela via `normalizeIpcResponse()` → 
**pas de mismatch critique**.

### 4. Shape des erreurs

Frontend attend : `{ code: string, message: string, details?: unknown }`

Cas vérifiés :
- `IPC_MALFORMED_RESPONSE` : réponse null/undefined
- `IPC_LEGACY_RESPONSE` : format Rust legacy `Result<T, String>`
- `IPC_ERROR` : erreur Tauri native
- `UNKNOWN_ERROR` : erreur non-classifiable

**Verdict : PASS** — Tous les cas d'erreur sont gérés sans silence.

---

## Contrat `conversation_generate` — Vérification backend

Fichier : `src-tauri/src/conversation_engine/commands.rs` (via `titane_infinity::conversation_engine`)

La commande est enregistrée dans `generate_handler!` de `main.rs` :
```rust
conversation_engine::commands::conversation_generate,
```

**Verdict : PASS** — OMEGA v2 est canoniquement enregistré et validé.

---

## Contrat `tts_speak`

Frontend schema (`ipcContract.ts`) :
```typescript
const TtsSpeakSchema = z.object({
  text: z.string().min(1),
  settings: TtsSettingsSchema,
});
```

Backend : `audio::commands::tts_speak` (enregistré dans `generate_handler!`)

**Verdict : PASS**

---

## Points d'attention (P2 — non bloquants)

### Retry non borné dans `safeInvokeWithRetry`

```typescript
export async function safeInvokeWithRetry<T = unknown>(
  cmd: string, payload, maxRetries = 3, retryDelay = 1000
)
```

Le nombre de retries est paramétré avec un défaut de 3, ce qui est borné.
**Verdict : PASS (conforme à la constitution : pas de retry illimité)**

### Timeout configurable

`safeInvokeCanonical` : timeout par défaut 10000ms — conforme à la constitution.

---

## Conclusion contrat IPC

| Critère | Statut |
|---------|--------|
| Shape canonique `{ok, content, error}` | ✅ PASS |
| Normalisation legacy `{success}` | ✅ PASS |
| Enforcement camelCase OMEGA v2 | ✅ PASS |
| Gestion des erreurs sans silence | ✅ PASS |
| Timeout borné | ✅ PASS |
| Retry borné | ✅ PASS |

**GATE G_IPC_CONTRACT_TRUTH : PASS**
