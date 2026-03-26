# 06 — TWINS / TIME INTEGRATION

## TWINS_TIME_CONNECTION_MATRIX

| Surface | Relation attendue avec chat | Relation réelle | Preuve runtime | Statut |
|---------|----------------------------|-----------------|----------------|--------|
| TWINS (route /twins) | Symbiose Kevin↔TITANE, contexte chat | UI uniquement — TwinEvolutionPanel (composant lazy), backend commands twin_get_state etc. enregistrés | Aucun appel à chatService, useChat, conversation_generate depuis TwinsPage.tsx ou TwinEvolutionPanel.tsx | PARTIAL (UI+Backend séparés, AUCUNE connexion chat) |
| Twin IPC commands (twin_get_state, twin_submit_observation...) | Informer le pipeline chat | Enregistrés dans main.rs (lignes 878, 1972), exposés dans lib/security.ts whitelist | Aucune injection dans context_envelope ou conversation_generate | BLOCKED (commandes exposées, non consommées par chat) |
| TIME (route /time) | Contexte temporel injecté dans chat (agenda, snapshot, flow) | TimePage stocke état cognitif dans localStorage (ligne 1023) — NON injecté dans context_envelope | Clé localStorage isolée, non lue par chatMemorySingleDoor | PARTIAL (stockage présent, injection manquante) |
| Agenda (route /agenda → alias /time) | Planning → contexte chat | Alias résolu vers TimePage | Idem TIME | PARTIAL |
| Snapshots TIME | Voyage temporel → enrichissement contexte AI | Fonctionnalité UI de TimePage, aucun lien avec conversation_generate | — | DOC_ONLY |

## Analyse TWINS

- Backend : commandes `twin_*` enregistrées (main.rs lignes 878-1972)
- Frontend : TwinsPage → TwinEvolutionPanel (lazy, code présent)
- **Déconnexion** : Aucune interface entre twin state et chat payload
- **Verdict** : UI PARTIAL + backend PARTIAL, chat = **DISCONNECTED**

## Analyse TIME

- Frontend : TimePage.tsx (1276 lignes), 5 onglets (now, agenda, timeline, snapshots, cognitive)
- Onglet cognitive : persistance état cognitif dans localStorage
- **Déconnexion** : État cognitif non lu par moduleRouteContext ni context_envelope
- **Verdict** : UI fonctionnelle isolée, chat = **DISCONNECTED**

## Risque

- Les labels "TWINS" et "TIME" dans l'UI impliquent une intégration chat — elle n'est pas prouvée à runtime.
- Aucun auto-heal ni fallback détecté pour cette déconnexion.
- Classification honnête requise : ni PASS ni FAIL → **BLOCKED** (commandes présentes, connexion absente)
