# 02_SCOPE_FREEZE.md

## Allowed (minimum)
- `src/types/conversation_os.ts`
- `src/types/index.ts`
- `src-tauri/src/engines/conversation_os/**`
- `src-tauri/src/engines/mod.rs`
- `src-tauri/src/services/db_service.rs`
- `src-tauri/src/services/network_gateway.rs`
- `src-tauri/src/services/search_gateway.rs`
- `src-tauri/src/services/embeddings_service.rs`
- `src-tauri/src/services/mod.rs`
- `src-tauri/src/conversation_engine/commands.rs`
- `src/components/debug/TracePanel.tsx`
- `src/components/debug/ChatDebugPanel.tsx`
- `src/components/debug/index.ts`
- `registry/ui-events.jsonl`
- `docs/_evidence/conversation_os_v1_20260225_195015/**`

## Forbidden
- Tout nouveau serveur web interne / localhost service.
- Toute requête réseau externe directe depuis frontend dans le flux Conversation OS.
- Dépendances nouvelles non justifiées + non testées + sans rollback.
- Changement hors périmètre sans update explicite du freeze.

## Feature flags (freeze)
- `CONVOS_V1=1` (master) — cible de gouvernance.
- `CONVOS_SEARCH=1` — cible de gouvernance.
- `CONVOS_MEMORY_LTM=0` par défaut (activation seulement si preuve dédiée).
- `CONVOS_DEBUG_PANEL=1`.

## Note de conformité
Les flags ci-dessus sont figés au niveau gouvernance de ce pack; leur câblage runtime complet est à vérifier/compléter avant promotion PROD.
