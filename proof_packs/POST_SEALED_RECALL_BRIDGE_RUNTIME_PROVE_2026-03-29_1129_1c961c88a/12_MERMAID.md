# P1.13c — MERMAID DIAGRAM

## Recall Bridge Data Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant conversation_generate
    participant UnifiedMemory
    participant entries.json

    User->>UI: "Memorise: code=ORION"
    UI->>conversation_generate: persist_explicit_memory_write_facts()
    conversation_generate->>entries.json: Write entry
    
    User->>UI: "Quel est mon code?"
    UI->>conversation_generate: conversation_generate()
    
    Note over conversation_generate: PERSISTENT_MEMORY_LOADED?
    
    alt First call
        conversation_generate->>entries.json: Read entries
        entries.json-->>conversation_generate: Vec<entry>
        conversation_generate->>UnifiedMemory: load_persistent_entries()
        UnifiedMemory->>UnifiedMemory: Convert to MemoryItem
        UnifiedMemory->>UnifiedMemory: Push to STM
    end
    
    conversation_generate->>UnifiedMemory: recall("code", 5)
    UnifiedMemory-->>conversation_generate: Vec<MemoryItem>
    
    Note over conversation_generate: Format MEMORY_CONTEXT block
    
    conversation_generate->>UI: Response with memoryRecallIds
    UI->>User: "Votre code est ORION"