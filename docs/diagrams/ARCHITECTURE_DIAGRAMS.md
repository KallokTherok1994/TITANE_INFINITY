# TITANE∞ — Architecture Diagrams

Diagrammes Mermaid de l'architecture TITANE∞ v31.2.

---

## 1. Architecture 4-Ring

```mermaid
graph TD
    subgraph Ring4["Ring 4 — UI (React)"]
        UI_COMP[Components / Pages]
        UI_HOOKS[Hooks]
        UI_STORES[Zustand Stores]
    end

    subgraph Ring3["Ring 3 — Services Frontend"]
        SERVICES[Services métier]
        ENGINES[Engines frontend]
        CONTEXTS[Contexts React]
        INVOKE["@/utils/invoke<br/>(ONE DOOR)"]
    end

    subgraph Ring2["Ring 2 — IPC Layer"]
        TAURI_CMD[Tauri Commands<br/>#[tauri::command]]
        IPC_CONTRACT["{ok, content, error}"]
    end

    subgraph Ring1["Ring 1 — Backend Rust"]
        RUST_SERVICES[Services Rust]
        KB[Knowledge Base<br/>211+ domaines]
        OPERATORS[Operators<br/>browser/desktop/IDE]
        NETWORK[Network Gateway]
    end

    UI_COMP --> UI_HOOKS
    UI_HOOKS --> SERVICES
    UI_HOOKS --> ENGINES
    UI_COMP --> CONTEXTS
    SERVICES --> INVOKE
    ENGINES --> INVOKE
    INVOKE -->|IPC| TAURI_CMD
    TAURI_CMD --> IPC_CONTRACT
    IPC_CONTRACT --> RUST_SERVICES
    RUST_SERVICES --> KB
    RUST_SERVICES --> OPERATORS
    RUST_SERVICES --> NETWORK
```

---

## 2. One Door — Flux réseau

```mermaid
flowchart LR
    UI["UI Component"]
    INVOKE["safeInvokeCanonical<br/>@/utils/invoke"]
    IPC["Tauri IPC"]
    GW["Network Gateway<br/>(Rust)"]
    EXT["Services Externes<br/>(Ollama, API...)"]

    UI -->|appel service| INVOKE
    INVOKE -->|invoke| IPC
    IPC -->|command handler| GW
    GW -->|HTTP controllé| EXT

    style INVOKE fill:#1e3a5f,color:#93c5fd
    style GW fill:#1a3a2a,color:#86efac
```

> Rule 5 — Aucun accès réseau direct depuis le frontend.

---

## 3. Online-first avec fallback local (Rule 7)

```mermaid
stateDiagram-v2
    [*] --> CheckOnline
    CheckOnline --> OnlineMode : Disponible
    CheckOnline --> LocalFallback : Indisponible

    OnlineMode --> ServicesActifs : Ollama + IPC OK
    OnlineMode --> LocalFallback : Timeout / Erreur

    LocalFallback --> ServicesLocaux : KB embarquée + Stubs
    ServicesLocaux --> OnlineMode : Reconnexion détectée

    ServicesActifs --> [*]
    ServicesLocaux --> [*]
```

---

## 4. Flux de conversation IA

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant Chat as ChatInput
    participant AIC as aiChatClient
    participant Bridge as tauriBridge
    participant Rust as cognitive_engine (Rust)
    participant Ollama as Ollama :11434

    U->>Chat: Saisit message
    Chat->>AIC: sendMessage(text)
    AIC->>Bridge: safeInvokeCanonical('cognitive_process')
    Bridge->>Rust: IPC { ok, content }
    Rust->>Ollama: POST /api/chat (gemma2:2b)
    Ollama-->>Rust: stream tokens
    Rust-->>Bridge: { ok: true, content: response }
    Bridge-->>AIC: resolved
    AIC-->>Chat: update state
    Chat-->>U: Affiche réponse
```

---

## 5. Knowledge Base — Pipeline d'enrichissement

```mermaid
flowchart TD
    INPUT["Nouveau domaine KB<br/>(JSON + triggers)"]
    RUST_KB["knowledge_base_default.rs<br/>(const DOMAIN_NAME)"]
    SOURCES["SOURCES array<br/>(211+ entrées)"]
    BASELINE["baseline >= N tests"]
    VITEST["Tests Vitest<br/>(kb.*.test.ts)"]
    RUST_TEST["Tests Rust<br/>(knowledge_base_default::tests)"]
    AUTOHEAL["AutoHeal JSONL<br/>(full schema)"]
    COMMIT["git commit MAIN"]

    INPUT --> RUST_KB
    RUST_KB --> SOURCES
    SOURCES --> BASELINE
    BASELINE --> VITEST
    BASELINE --> RUST_TEST
    VITEST -->|PASS| AUTOHEAL
    RUST_TEST -->|PASS| AUTOHEAL
    AUTOHEAL -->|detect_recurrence PASS| COMMIT
```

---

## 6. Build & Release Pipeline

```mermaid
flowchart LR
    subgraph Prébuild
        BUMP["bump version<br/>(package.json)"]
        SYNC["sync versions<br/>(tauri.conf.json)"]
        GATES["Gates: vitest + cargo check<br/>detect_recurrence + verify_instructions"]
    end

    subgraph Build
        VITE["pnpm run build<br/>(dist/)"]
        TAURI["pnpm run tauri build<br/>(Rust compile)"]
        BUNDLE["Bundle: AppImage + DEB + RPM"]
    end

    subgraph Post
        HASH["sha256 checksums"]
        DEPLOY["deployment/latest/"]
        ICONS["update-desktop-icons.sh"]
    end

    BUMP --> SYNC --> GATES --> VITE --> TAURI --> BUNDLE --> HASH --> DEPLOY --> ICONS
```

---

## 7. Gouvernance AutoHeal

```mermaid
flowchart TD
    MODIFY["Modification src/ ou src-tauri/"]
    TEST["Tests (Vitest + Rust)"]
    AH_ENTRY["Entrée AutoHeal JSONL<br/>(full schema: 10 champs)"]
    DETECT["detect_recurrence.sh"]
    VERIFY["verify_instructions.sh"]

    TEST -->|PASS| AH_ENTRY
    MODIFY --> TEST
    AH_ENTRY --> DETECT
    AH_ENTRY --> VERIFY
    DETECT -->|PASS entries=N| COMMIT["git commit MAIN"]
    VERIFY -->|PASS=33 FAIL=0| COMMIT
    TEST -->|FAIL| BLOCKED["BLOCKED — fix requis"]
    DETECT -->|FAIL| BLOCKED
    VERIFY -->|FAIL| BLOCKED
```
