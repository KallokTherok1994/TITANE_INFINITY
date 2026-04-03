# 13 — UI_RUNTIME_TRUTH_GAPS — TITANE_INFINITY

> Generated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL

---

## Règle

**Backend truth > UI assumption**

L'UI ne peut pas revendiquer un état que le backend n'a pas confirmé.

---

## Gaps identifiés

| Gap | UI claim | Backend réalité | Confirmé ? | Sévérité |
|-----|----------|-----------------|------------|----------|
| Chat mock bypass | `[MOCK_OK]` en E2E | Flag `__TITANE_E2E_CHAT_MOCK__` contrôle path | OUI (intentionnel) | MEDIUM |
| Provider fallback | UI peut afficher "provider actif" | ConversationEngine vérifie provider chain | Partiel | MEDIUM |
| Memory state | UI peut afficher mémoire active | ChatMemory backend vérifie état | Partiel | LOW |
| Version display | UI potentiellement affiche version | package.json 29.0.0 | Non audité | LOW |

---

## IPC Contract vérification

Le contrat IPC canonical `{ ok, content, error }` est la source de vérité.

| Aspect | Statut | Preuve |
|--------|--------|--------|
| Contrat défini | ✅ | src-tauri/src/conversation_engine/commands.rs |
| Zero silent failure | ✅ | Gate G8 PASS |
| No lying fallback | ⚠️ PARTIAL | Mock path activé par flag E2E |

---

## Décision

- Mock paths E2E : `SAFE_BUT_RISKY` — flag explicite, pas de déviation silencieuse
- Provider fallback : `KEEP_MONITOR` — audité via G1/G2/G8
- Version UI : `UNKNOWN` — non audité dans cette session

---

## Action recommandée

Aucune action immédiate requise. Les gaps identifiés sont documentés et surveillés par gates existantes.
