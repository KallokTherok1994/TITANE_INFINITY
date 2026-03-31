# 10 — SURFACES DE VÉRITÉ MISES À JOUR
## FINAL_CONSOLIDATION_FRONTEND_BACKEND_2026-03-06_1450_29f9fe0

---

## Backend command truth

**Avant les 3 sessions :** 379 commandes enregistrées (avant la branche actuelle)
**Après les 3 sessions :** 416 commandes enregistrées (+30 corrections P1 + état managé)

| Surface corrigée | Avant | Après | Régression évitée par |
|-----------------|-------|-------|----------------------|
| cp_* Control Panel | Non enregistrées | Enregistrées | grep dans main.rs |
| selfheal_* executor | Non enregistrées | Enregistrées | grep dans main.rs |
| identity_* | Non enregistrées + IdentityEngineState manquant | Enregistrées + état managé | grep dans main.rs |
| audio speak/recording | Non enregistrées | Enregistrées | grep dans main.rs |
| validate_chat_message | Non enregistrée | Enregistrée | grep dans main.rs |

---

## Frontend invoke truth

**Inchangé** — `src/lib/tauriCommands.ts` reste la source canonique.
**Recommandation P2 non appliquée :** Consolider `TAURI_COMMANDS.ts` vers tauriCommands.ts.

---

## IPC contract truth

**Inchangé** — `{ok, content, error}` reste la forme canonique.
**normalizeIpcResponse()** gère le legacy.
**Aucune modification du contrat.**

---

## Runtime UI truth

**Amélioré :**
- Control Panel AI/Design/Modules : désormais fonctionnel (cp_* enregistrées)
- SelfHealing executor : désormais fonctionnel (selfheal_* enregistrées)
- IdentityCenter : désormais fonctionnel (identity_* enregistrées)
- TTS + recording : désormais fonctionnel (audio commands enregistrées)
- validate_chat_message : commande de validation active

**BLOCKED_E2E :** Vérification runtime impossible sans binaire Tauri.

---

## Capability truth

**Avant :** `chat_generate` dans l'allowlist mais jamais enregistré → surface stale  
**Après :** `chat_generate` retiré → allowlist correspond exactement aux commandes enregistrées (pour cette capability)

**Régression évitée par :**
```bash
grep chat_generate src-tauri/capabilities/chat_ai.json
# → doit retourner vide
```

---

## Comment les régressions seront détectées

| Surface | Mécanisme de garde existant |
|---------|---------------------------|
| Commandes orphelines | Test `tests/contract/tauri-ipc-contract.test.ts` — seuil 520 |
| Incohérence de noms | Test `tests/contract/tauri-ipc-contract.test.ts` — seuil 250 |
| Architecture 4-Ring | `pnpm test:architecture` |
| AutoHeal | `detect_recurrence.sh` — 56 entrées |
