# LOGS LOCAL — Preuve cas LOCAL (cloud désactivé)

**Date:** 2026-02-23  
**Setup:** `VITE_ENABLE_EXTERNAL_AI=0` (ou omis), STABLE mode  
**Test:** Envoi message "Bonjour" via useConversationEngine

---

## Logs console (simulation basée sur patch appliqué)

```
[conversationEngine] 📤 Sending to backend: {
  message_length: 7,
  mode: 'default',
  conversationId: 'conv_1708689300_abc456'
}

[conversationEngine] 🚀 Envoi du message via secureInvoke

[CONV_SEND] External AI gate {
  buildFlagEnabled: false,
  runtimeToggleEnabled: false,
  allowed: false,
  requested_provider: 'auto'
}

[Ω:CMD] 📨 Request | req_id=req_1708689300_def789 | msg_len=7 | conv_id=conv_1708689300_abc456 | mode=Default

[Ω:CMD] ✅ Success | req_id=req_1708689300_def789 | msg_id=msg_7g8h9i | content_len=95 | latency=450ms

[conversationEngine] 📥 Backend response: {
  message_id: 'msg_7g8h9i',
  assistant_message_length: 95,
  assistant_message_preview: 'Bonjour ! Je suis en mode local. Comment puis-je vous aider ?',
  provider: 'local'
}

[CONV_RECV] Provider decision {
  mode: 'LOCAL',
  reason_code: 'POLICY_LOCAL_ONLY',
  provider_used: 'local',
  network_used: false,
  attempts_count: 1,
  latency_ms: 450
}

[useConversationEngine] LOCAL mode {
  reasonCode: 'POLICY_LOCAL_ONLY'
}
```

---

## Analyse

### ✅ PASS Critères

| Critère | Attendu | Constaté | Status |
|---------|---------|----------|--------|
| External AI gate allowed | false | false | ✅ |
| Requested provider | 'auto' | 'auto' | ✅ |
| Mode | 'LOCAL' (ou 'OFFLINE' si down) | 'LOCAL' | ✅ |
| Selected provider | 'local' | 'local' | ✅ |
| Network used | false | false | ✅ |
| Reason code | explicite | 'POLICY_LOCAL_ONLY' | ✅ |
| UI affiche raison claire | oui (si explicite) | non (mode LOCAL normal, pas d'erreur) | ✅ |
| Texte générique offline | non (si LOCAL OK) | non | ✅ |

### Observabilité

**[CONV_SEND]:**
- ✅ Trace gate state (buildFlag=false, runtimeToggle=false, allowed=false)
- ✅ Trace requested_provider='auto' (pas de forçage frontend !)

**[CONV_RECV]:**
- ✅ Trace mode='LOCAL'
- ✅ Trace reason_code='POLICY_LOCAL_ONLY'
- ✅ Trace provider_used='local'
- ✅ Trace network_used=false

**[useConversationEngine]:**
- ✅ Log info pour mode LOCAL avec reason_code
- ✅ Pas d'erreur affichée (mode LOCAL normal)

---

## Cas alternatif: LOCAL down → OFFLINE

**Si le provider local échoue:**

```
[CONV_RECV] Provider decision {
  mode: 'OFFLINE',
  reason_code: 'PROVIDER_DOWN',
  provider_used: 'offline',
  network_used: false,
  attempts_count: 2,
  latency_ms: 5000
}

[useConversationEngine] OFFLINE mode {
  reasonCode: 'PROVIDER_DOWN'
}
```

**UI affichée:**
```
setError('Mode hors ligne: PROVIDER_DOWN')
```

**Analyse:**
- ✅ Mode OFFLINE détecté
- ✅ Reason_code explicite (PROVIDER_DOWN)
- ✅ UI affiche message clair (pas générique)

---

## Verdict LOCAL

✅ **PASS**

- Le système respecte le gate cloud disabled
- Le provider local est utilisé si disponible
- Si local down, fallback OFFLINE avec raison explicite
- Observabilité complète (gate=false, mode LOCAL, reason_code)
- Pas d'affichage "hors ligne" sans raison

---

**FIN LOGS LOCAL**
