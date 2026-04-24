# 20_BEFORE_AFTER

## BEFORE (état avant audit)

| Problème                                                | Impact                                |
| ------------------------------------------------------- | ------------------------------------- |
| send_message Ok("Message processed") silencieux         | P0: appels ignorés sans error visible |
| 14 ghost commands active:true                           | P1: IPC Command not found silencieux  |
| memory_get Ok(None) sans log                            | P1: clé manquante invisible dans logs |
| V5 validator false positive (context window trop petit) | P2: faux rapport                      |

## AFTER (état après patches)

| Fix                                | Preuve                                             |
| ---------------------------------- | -------------------------------------------------- |
| send_message → Err + log::warn!    | V3 PASS, git diff main.rs                          |
| 14 ghost cmds → active:false       | V1 PASS, git diff tauriCommands.ts                 |
| memory_get → log::warn! + Ok(None) | V4 PASS, git diff memory_commands.rs               |
| 5 validators créés et exécutés     | scripts/validators/\*.sh existent + run_all PASS=4 |

## DELTA RESTANT (BLOCKED_STRUCTURAL)

| Gap                                  | Priorité | Prochaine action                                      |
| ------------------------------------ | -------- | ----------------------------------------------------- |
| load_conversation_history manquant   | P0       | Implémenter dans conversation_engine::commands.rs     |
| memory_core_state::chat_history vide | P0       | Dépend load_conversation_history                      |
| LTM désactivé par défaut             | P1       | Activer CONVOS_MEMORY_LTM=true ou câbler correctement |
| PersistentMemory /tmp fallback       | P1       | Valider app_data_dir résolution + test                |
