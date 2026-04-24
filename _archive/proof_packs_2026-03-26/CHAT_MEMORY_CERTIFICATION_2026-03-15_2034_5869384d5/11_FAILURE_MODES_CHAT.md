# 11_FAILURE_MODES_CHAT

## Mode 1: Clear localStorage → Perte totale historique UI

- Trigger: navigate privée, clear browser data, changement domaine
- Impact: Toutes conversations UI perdues
- Mitigation: Aucune côté UI
- Fix requis: load_conversation_history IPC (BLOCKED_STRUCTURAL)

## Mode 2: Crash app pendant écriture message

- Trigger: crash Tauri pendant flushPendingSaves()
- Impact: Dernier message peut être perdu
- Mitigation: flushPendingSaves() appelé à chaque save (v26.4.0)
- Status: PARTIAL

## Mode 3: Ghost command appelée → Command not found silencieux

- Trigger: UI appelle singularity*sync_state, helios*\*, etc.
- Impact: Call silencieux, UI ne voit pas l'erreur
- Mitigation: active:false → erreurs surfacées maintenant
- Status: FIXED

## Mode 4: send_message utilisé directement (pas conversation_generate)

- Trigger: Code appelant directement send_message
- Impact: Stub retourne Ok silencieux → message "traité" mais pas vraiment
- Mitigation: main.rs retourne maintenant Err explicit
- Status: FIXED
