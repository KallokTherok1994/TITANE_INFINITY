# 01_BOOTSTRAP — VÉRITÉ REPO

**git branch:** MAIN  
**git status:** modified files (see patches)  
**git log HEAD:** 5869384d5 (voir 02_REPO_TRUTH.md)

## ETAT_REEL au bootstrap
- Route chat primaire: `conversation_generate` → `ConversationEngineState` — PROVEN
- Persistence UI: `localStorage` via `chatMemoryCompactor.ts` — PROVEN  
- Persistence backend: SQLite `conversation_os_v1.db` — PARTIAL (pas de reload UI)
- memory_core_state.json::chat_history: BROKEN (toujours vide)
- send_message main.rs: BROKEN (stub silencieux Ok)
- 14 ghost commands: ABSENT du generate_handler!
- LTM: ABSENT (désactivé par env var défaut=false)

## RISQUE_PRINCIPAL
Perte totale historique chat si localStorage effacé.
SQLite contient les données mais aucune commande IPC ne les recharge en UI.

## SURFACES_CRITIQUES
1. conversation_generate (R2) — PROVEN
2. chatMemoryCompactor localStorage (R1) — PROVEN mais volatile
3. send_message stub (R2) — FIXED
4. memory_core_state::chat_history (R3) — BLOCKED_STRUCTURAL
5. ConversationEngine SQLite no-UI-reload (R3) — BLOCKED_STRUCTURAL
6. Ghost commands x14 (R2) — FIXED (active:false)
7. LTM memory (R3) — ABSENT par défaut
