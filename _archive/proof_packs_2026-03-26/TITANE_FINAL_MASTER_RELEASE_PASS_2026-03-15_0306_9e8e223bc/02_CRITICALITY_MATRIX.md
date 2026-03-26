# 02 CRITICALITY MATRIX

| ID | SURFACE | ZONE | CRITICALITY | WHY | MUST_PASS? |
|----|---------|------|-------------|-----|-----------|
| C1 | Chat send path | CHAT | CRITICAL | Bloque usage core | OUI |
| C2 | Chat fallback/retry | CHAT | CRITICAL | Bloque usage core | OUI |
| C3 | IPC contract builders | CHAT/ADMIN | CRITICAL | Payload malformé = silence | OUI |
| C4 | Route /titane load | SHELL | CRITICAL | Page principale | OUI |
| C5 | Route /admin load + import | ADMIN | CRITICAL | Import dynamique fragile | OUI |
| C6 | usePersistentMemory loop guard | MEMORY | CRITICAL | Crash update loop | OUI |
| C7 | Memory chat injection | MEMORY | CRITICAL | Faux contexte IA | OUI |
| C8 | Admin IPC envelope unwrap | ADMIN | CRITICAL | Config incorrecte sans unwrap | OUI |
| C9 | OMEGA trace dimensions réelles | OMEGA | MAJOR | Vérité trace OMEGA | NON |
| C10 | Tab grammar unification | SHELL | MAJOR | Cohérence UI | NON |
| C11 | Memory counter vérité | MEMORY | MAJOR | Faux compteurs | NON |
| C12 | MemorySearch mock notice | MEMORY | MAJOR | Trompe l'utilisateur | NON |
| C13 | Projects mock notice | UI | MINOR | Données illustratives non signalées | NON |
| C14 | ChatWindow ambient glow | SHELL | MINOR | Distraction visuelle | NON |
| C15 | CognitiveLayout floating → ADMIN | ADMIN | CRITICAL (résolu) | Panneau flottant obstruant | OUI |
| C16 | VectorStoreClient mismatch IPC | MEMORY | MAJOR | ConversationManager hors runtime UI | NON |
