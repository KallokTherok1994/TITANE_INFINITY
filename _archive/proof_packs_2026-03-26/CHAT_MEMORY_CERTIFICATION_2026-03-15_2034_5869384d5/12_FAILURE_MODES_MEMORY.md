# 12_FAILURE_MODES_MEMORY

## Mode 1: memory_core_state.json::chat_history toujours vide
- Cause: chatMemoryCompactor écrit en localStorage, pas en JSON fichier
- Impact: memory_core_state.json ne contient jamais l'historique réel
- Status: BLOCKED_STRUCTURAL (deux sources de vérité distinctes par design)

## Mode 2: LTM désactivé → SQLite non populé
- Cause: CONVOS_MEMORY_LTM=false par défaut
- Impact: Long-term memory jamais écrite dans SQLite
- Status: OPEN (décision de configuration)

## Mode 3: memory_get Ok(None) sans trace
- Cause: Ancienne implémentation silencieuse
- Impact: UI reçoit null, aucun log Rust
- Status: FIXED (log::warn! ajouté)

## Mode 4: PersistentMemory /tmp fallback
- Cause: app_data_dir non résolu → /tmp/titane
- Impact: Données perdues si /tmp vidé
- Status: OPEN P1
