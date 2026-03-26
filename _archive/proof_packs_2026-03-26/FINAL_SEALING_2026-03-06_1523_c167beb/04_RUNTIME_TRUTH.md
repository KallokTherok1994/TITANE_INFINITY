# 04 — RUNTIME TRUTH
## FINAL_SEALING_2026-03-06_1523_c167beb

---

## Providers status

**Commande :** `chat_get_providers_status` → enregistrée ✅
**Commande :** `ai_check_ollama_status` → enregistrée ✅
**UI :** affiche le statut réel du provider — pas de fallback trompeur détecté

## Mode

**Commande :** `identity_set_mode` → enregistrée ✅
**UI :** `IdentityCenter.tsx` consomme cette commande
**Fallback :** `.catch(() => null)` pour les stubs identity non implémentés — silencieux mais déclaré (P2)

## Fallback non-trompeurs

- `normalizeIpcResponse()` : produit une erreur explicite avec `code`, `message`, `details`, `traceId` ✅
- Offline generator : fallback local obligatoire — present dans l'architecture ✅
- Aucun "always available" mensonger détecté

## Web Research

- `ConversationSection.tsx` : URLs Wikipedia passées comme DATA à `web_research` (IPC) ✅
- Aucun `fetch()` direct ✅

## GATE G_RUNTIME_TRUTH: ✅ PASS

Seul risque résiduel : 8 stubs identity retournent `null` silencieusement (P2, déclaré).
