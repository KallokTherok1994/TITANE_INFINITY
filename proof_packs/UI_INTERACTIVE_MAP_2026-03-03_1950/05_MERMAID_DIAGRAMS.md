# Diagrammes UI Interactive Map
**Version:** 27.2.0 | **Date:** 2026-03-03T19:50:39Z

---

## 1. Navigation Graph

```mermaid
graph TD
    TOPNAV[TopNav — Navigation principale] --> TITANE["/titane ⭐ TitanePage"]
    TOPNAV --> TIME["/time — TimePage"]
    TOPNAV --> STATS["/stats — Stats"]
    TOPNAV --> ADMIN["/admin — AdminPage"]
    TOPNAV --> DEV["/dev — DevPage"]
    TOPNAV --> PLUS["Plus Menu ▼"]
    PLUS --> FUSION["/fusion — PerfectFusionDashboard"]
    PLUS --> OPTIMIZE["/optimization — UltimateOptimizationDashboard"]

    ROOT["/"] -->|redirect| TITANE
    CHAT["/chat"] -->|redirect| TITANE
    CAMERA["/camera"] -->|redirect| TITANE
    EVO["/evo"] -->|redirect| TITANE
    COGNITIVE["/cognitive"] -->|redirect| STATS
    SETTINGS_R["/settings"] -->|redirect| ADMIN
    TEMPORAL["/temporal-center, /agenda, /time-navigator"] -->|redirect| TIME
    DEVMODES["/developer-mode, /qa-monitoring, /ia-dev, etc."] -->|redirect| DEV

    TITANE --> T_CHAT["Tab 💬 Chat → ConversationSection"]
    TITANE --> T_VUE["Tab 📊 Vue → OverviewSection"]
    TITANE --> T_VISION["Tab 📷 Vision → VisionSection"]
    TITANE --> T_ID["Tab 🧬 Identité → IdentitySection"]
    TITANE --> T_MEM["Tab 💾 Mémoire → MemorySection"]
    TITANE --> T_EVO["Tab 🔄 Évolution → MemoryEvolutionSection"]
    TITANE --> T_XP["Tab ⚡ XP → ProgressionSection"]
    TITANE --> T_TRANS["Tab 🌱 Transform → TransformationSection"]

    HIDDEN["Routes moteurs\n(URL directe uniquement)"]
    HIDDEN --> OI["/orchestration-intelligence"]
    HIDDEN --> RC["/reality-center"]
    HIDDEN --> QC["/quantum-center"]
    HIDDEN --> IC["/identity-center"]
    HIDDEN --> ME["/memory-evolution"]
    HIDDEN --> CL["/cloud"]
    HIDDEN --> SN["/singularity"]
    HIDDEN --> WD["/watchdog"]

    style TITANE fill:#1e40af,color:#fff
    style TOPNAV fill:#0f172a,color:#00d4ff
    style HIDDEN fill:#4b5563,color:#d1d5db
```

---

## 2. Flux d'Action — Envoi Message Chat

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant CI as ChatInput (Textarea)
    participant CS as ConversationSection
    participant CE as useConversationEngine
    participant SI as secureInvoke
    participant WL as ALLOWED_COMMANDS whitelist
    participant T as Tauri IPC Bridge
    participant RS as Rust: ConversationEngineState
    participant AR as AIRouter (Ollama/Gemini/OpenAI/Claude/Copilot)

    U->>CI: tape message
    CI->>CS: onChange → setInputValue
    U->>CS: click "Envoyer"
    CS->>CE: sendMessage(inputValue, {mode, provider})
    CE->>SI: secureInvoke('conversation_generate', {userMessage, conversationId, mode})
    SI->>WL: check ALLOWED_COMMANDS.has('conversation_generate')
    WL-->>SI: ✅ whitelisted
    SI->>T: invoke('conversation_generate', payload)
    T->>RS: conversation_engine::commands::conversation_generate()
    RS->>AR: process_message(request) → AIRouter.route()
    AR-->>RS: AIResponse {assistant_message, provider_used, latency_ms}
    RS-->>T: Ok(ConversationResponse)
    T-->>SI: {ok, content, metadata}
    SI-->>CE: response
    CE->>CE: appendMessage(assistant) + hybridTTS.speak() (si audioEnabled)
    CE-->>CS: messages state updated
    CS->>CI: clear inputValue
    CS->>CS: scrollToBottom()
```

---

## 3. Architecture 4-Ring (Sécurité IPC)

```mermaid
graph LR
    subgraph "Ring 4 — OS/UI (React)"
        BTN["Buttons / Inputs / Tabs\n(TitanePage, AdminPage, DevPage, etc.)"]
    end
    subgraph "Ring 3 — Services (Hooks)"
        HOOKS["useConversationEngine\nuseVoiceEngine\nuseChat\nuseMemory\nuseWindowControls\nuseZoomControl"]
    end
    subgraph "Ring 2 — IPC Layer"
        SEC["secureInvoke()\nALLOWED_COMMANDS whitelist\nVOID_COMMANDS\nNULLABLE_COMMANDS\n[src/lib/security.ts]"]
    end
    subgraph "Ring 1 — Backend (Rust/Tauri)"
        TAURI["#[tauri::command]\nConversationEngine\nVoiceEngine\nMemoryOS\nSecureSecrets\nWindowControls\nQAMonitoring"]
    end

    BTN -->|handler calls| HOOKS
    HOOKS -->|secureInvoke / ipcCall| SEC
    SEC -->|whitelisted only| TAURI

    style SEC fill:#dc2626,color:#fff
    style TAURI fill:#16a34a,color:#fff
    style BTN fill:#2563eb,color:#fff
    style HOOKS fill:#7c3aed,color:#fff
```

---

## 4. Onboarding Boot Flow

```mermaid
flowchart TD
    START([App.tsx render]) --> ENV{Tauri runtime?}
    ENV -->|Browser/Dev| SKIP["setOnboardingComplete=true\nbypasse is_onboarding_complete"]
    ENV -->|Tauri prod| IPC["secureInvoke\n'is_onboarding_complete'"]
    IPC -->|true| MAIN[Affiche AppRouter]
    IPC -->|false| OB[OnboardingFlow carousel]
    IPC -->|timeout 5s| MAIN
    SKIP --> MAIN
    OB -->|complete_onboarding IPC| MAIN
    MAIN --> TOPNAV_RENDER["Render TopNav + Routes\n(5 nav items + Plus menu)"]
    TOPNAV_RENDER --> REDIRECT["/ → /titane"]
    REDIRECT --> TITANE_PAGE["TitanePage load\ntimeout: 20s\nfallback: PageLoadingFallback"]
    TITANE_PAGE --> TABS["8 tabs: Chat/Vue/Vision/Identité\nMémoire/Évolution/XP/Transform"]
    TABS --> CONV["Tab Chat actif par défaut\nConversationSection mount"]
    CONV --> INIT["useConversationEngine init\ncreateNewConversation IPC\nproviders check polling start"]
```
