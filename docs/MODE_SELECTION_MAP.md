# MODE_SELECTION_MAP — TITANE∞
## Discovery Document: Current Conversation Mode Selection Reality
### Date: 2026-03-26 | Lock: #1 Boot Truth

---

## A) EXEC_MODE: CERTIFY (read-only discovery, no patches)
## B) STATUS: REAL_STATE — no hallucination

---

## 1. REAL MODE SYSTEMS IN CODEBASE

Three parallel mode systems exist. They are NOT fully connected.

### System A — ConversationMode (Rust backend, canonical)
**File**: `src-tauri/src/conversation_engine/types.rs:72-91`
```
Default | Brainstorming | Synthesis | Planning | Journal | DebugCognitive
```
- 6 variants
- Serialized over Tauri IPC
- Consumed in `pipeline.rs:build_prompt()` (lines 318-373)
- Each variant maps to a (system_identity, mode_instruction) pair
- This is the ONLY system that affects AI behavior (system prompt injection)

### System B — ResponseProfile (TypeScript, canonical)
**File**: `src/services/ai/responsePolicy.ts`
```
DIRECT | BALANCED | DEEP | ARCHITECT | OMEGA
```
- 5 profiles
- Contains: maxTokens, temperature, reasoningEffort, structureLevel, clarificationThreshold, memoryPolicy, streamPolicy, preferredProviders
- `reasoningEffort: 'low' | 'medium' | 'high'` already defined
- **DEFINED BUT NOT AUTO-SELECTED** — no code path selects a profile based on input
- Profiles exist as constants; nothing reads them for routing decisions

### System C — CHAT_MODES / operational modes (UI only)
**Files**:
- `src/config/chatModes.config.ts` — 8+ modes: default, coach, dev_junior, dev_senior, admin, strategist, auditor, creative
- `src/data/modes.json` — 5 operational modes: Normal, Focused, Creative, Relaxed, Emergency
- `src/services/ai/chatTypes.ts` — 15+ chat mode strings: brainstorming, synthesis, omega, debug_cognitive, etc.
- **UI-ONLY** — these modes are NOT wired to the conversation engine backend
- `chatModes.config.ts` system prompts are never sent to `ConversationRequest.custom_system_prompt` automatically

---

## 2. CURRENT MODE SELECTION FLOW

```
USER CLICKS MODE IN UI
        ↓
useConversationEngine.setMode(mode)   [src/hooks/useConversationEngine.ts:670]
        ↓
currentMode state update (useState)
        ↓
On next sendMessage():
  processMessage(content, { mode: currentMode })  [conversationEngine.ts]
        ↓
Tauri IPC: invoke('conversation_generate', { request: { mode: currentMode } })
        ↓
ConversationRequest.mode: ConversationMode
        ↓
pipeline.rs build_prompt() match request.mode { ... }  [lines 318-373]
        ↓
System prompt injected into AI call
```

**Authority**: User is the sole authority for mode selection.
**Fallback**: If mode field is missing, Rust default = `ConversationMode::Default`
**Auto-classification**: DOES NOT EXIST

---

## 3. MODE INJECTION DETAILS

**File**: `src-tauri/src/conversation_engine/pipeline.rs:318-395`

Mode injection priority:
1. `custom_system_prompt` from request → takes precedence over mode (lines 327-334)
2. `match request.mode { ... }` → mode-based identity + instruction (lines 337-373)

Mode-to-system-prompt mapping (currently active):
| ConversationMode | System Identity (truncated) | Mode Instruction |
|---|---|---|
| Default | "Tu es TITANE∞, assistant cognitif français..." | "Réponds de manière claire, concise et naturelle." |
| Brainstorming | "Tu es TITANE∞ en MODE DIVERGENCE CRÉATIVE..." | "Génère des idées audacieuses, connexions surprenantes..." |
| Synthesis | "Tu es TITANE∞ en MODE SYNTHÈSE & CONNEXION..." | "Connecte les concepts, trouve les patterns..." |
| Planning | "Tu es TITANE∞ en MODE STRATÉGIE & ACTION..." | "Décompose en étapes concrètes..." |
| Journal | "Tu es TITANE∞ en MODE RÉFLEXION PERSONNELLE..." | "Accompagne la réflexion avec empathie..." |
| DebugCognitive | "Tu es TITANE∞ en MODE DEBUG COGNITIF..." | "Analyse la charge cognitive..." |

---

## 4. WHAT IS NOT IN RESPONSE

`ConversationResponse` (types.rs:41-66) does NOT contain:
- `mode_used` field
- `profile_id` field
- `effort_level` field
- `reason_code` field
- `confidence` field

This means mode selection is **one-way** (frontend → backend) with **no echo back**.
The frontend has no confirmation of which mode actually ran.

---

## 5. CLASSIFICATION GAPS

| Gap | Impact |
|---|---|
| No input analysis for mode selection | Mode never adapts to task complexity |
| No confidence scoring | No way to know if mode is appropriate |
| No trace meta in response | Frontend can't verify what mode ran |
| ResponseProfile system unused in routing | effort/maxTokens/temperature not dynamically selected |
| CHAT_MODES disconnected from backend | Rich mode definitions wasted |
| No SHADOW_LEARNING mode path | No observation-only mode exists |
| No CERTIFY mode path | Certification queries treated as Default |
| No REPAIR mode path | Debug queries treated as DebugCognitive (close, but unclassified) |

---

## 6. CANONICAL MODE → EXISTING BACKEND MAPPING

Target for Lock #1 auto-classifier:
| Canonical | ConversationMode | ResponseProfile | Status |
|---|---|---|---|
| DIRECT | Default | DIRECT | MAP TARGET |
| CLARIFY_LIGHT | Default | DIRECT | MAP TARGET |
| DEEP_REASONING | Synthesis | DEEP | MAP TARGET |
| ARCHITECT | Planning | ARCHITECT | MAP TARGET |
| REPAIR | DebugCognitive | DEEP | MAP TARGET |
| CERTIFY | DebugCognitive | ARCHITECT | MAP TARGET |
| EXPLORATION | Brainstorming | BALANCED | MAP TARGET |
| SHADOW_LEARNING | Default | BALANCED | MAP TARGET |

---

## 7. STATUS VERDICT

| Surface | Status |
|---|---|
| Mode system exists | ✅ YES |
| Mode affects AI behavior | ✅ YES (system prompt injection) |
| Mode is auto-selected by input | ❌ NO |
| Mode is echoed in response | ❌ NO |
| ResponseProfile is auto-selected | ❌ NO |
| Effort level is auto-selected | ❌ NO |
| Multiple mode systems are unified | ❌ NO (3 parallel systems, not connected) |

**G_MODE_SELECTION_REAL**: FAIL (no auto-selection exists)
