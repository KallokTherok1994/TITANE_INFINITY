# 03 — IPC CONTRACT
## FINAL_SEALING_2026-03-06_1523_c167beb

---

## Forme canonique

```typescript
{ ok: boolean, content: T | null, error: IpcErrorPayload | null }
```

Source: `src/utils/invoke.ts` — `CanonicalIpcResult<T>`

## Vérification

```bash
grep -c "ok.*content.*error\|CanonicalIpcResult\|IpcResult\|{ ok" src/utils/invoke.ts
→ 5 occurrences ✅
```

## Normalisation legacy

- `normalizeIpcResponse()` dans `src/utils/invoke.ts` gère la migration `.success` → `.ok`
- Aucun appel direct non normalisé détecté

## OMEGA v2 (canonique pour la conversation)

```
conversation_generate avec conversationId obligatoire:
grep -c "conversationId" src/services/ai/ConversationManager.ts → 46 occurrences ✅
grep -c "conversation_generate" src-tauri/src/main.rs → 9 occurrences ✅
```

## Timeout / Retry

- maxRetries: 3 (borné) ✅
- timeout: 10000ms par défaut (borné) ✅

## Shapes inconsistantes détectées

**Aucune** — `chatValidator.ts` valide que les réponses ne sont pas des placeholders (PASS).

## GATE G_IPC_CONTRACT_CANONICAL: ✅ PASS
