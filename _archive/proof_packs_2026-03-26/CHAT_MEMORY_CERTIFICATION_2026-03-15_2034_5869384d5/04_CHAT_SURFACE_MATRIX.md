# 04_CHAT_SURFACE_MATRIX

| Surface                            | EXEC_MODE | SCOPE_RING                                       | RISK | STATUT                       |
| ---------------------------------- | --------- | ------------------------------------------------ | ---- | ---------------------------- |
| ChatWindow/Input/Send              | LOCAL     | R1 src/components/chat/                          | P1   | PRESENT_AND_PROVEN           |
| useChat.ts                         | LOCAL     | R1 src/hooks/useChat.ts                          | P0   | PRESENT_AND_PROVEN           |
| ChatService IPC                    | LOCAL     | R2 src/services/api/chat.ts                      | P0   | PRESENT_AND_PROVEN           |
| conversation_generate              | LOCAL     | R2 src-tauri/src/conversation_engine/commands.rs | P0   | PRESENT_AND_PROVEN           |
| localStorage (chatMemoryCompactor) | LOCAL     | R1 src/services/chatMemoryCompactor.ts           | P0   | PRESENT_AND_PROVEN           |
| SQLite conversation_os_v1.db       | LOCAL     | R3 ~/.local/share/TITANE_INFINITY/               | P0   | PRESENT_BUT_UNPROVEN         |
| send_message (main.rs)             | LOCAL     | R2 src-tauri/src/main.rs:673                     | P0   | FIXED (Err explicit)         |
| send_message (chat.rs)             | LOCAL     | R2 src-tauri/src/commands/chat.rs                | P1   | LEGACY_ONLY (not registered) |
| load_conversation_history          | LOCAL     | R2-R3 ABSENT                                     | P0   | ABSENT                       |
| Ghost cmds x14                     | LOCAL     | R2 tauriCommands.ts                              | P1   | FIXED (active:false)         |
| LTM memory                         | LOCAL     | R3 CONVOS_MEMORY_LTM=false                       | P1   | ABSENT (by design)           |
| chat_stream_message                | LOCAL     | R3 removed v27.0.5                               | P1   | ABSENT                       |
| E2E mock mode                      | LOCAL     | R1 localStorage flag                             | P2   | PRESENT_AND_PROVEN           |
