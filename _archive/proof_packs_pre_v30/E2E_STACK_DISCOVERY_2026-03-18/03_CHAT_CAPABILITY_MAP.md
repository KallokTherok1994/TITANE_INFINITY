# Phase 4: CHAT CAPABILITY MAP — TITANE∞ v28.0.0

**Date:** 2026-03-18 | **Governance:** §4.1 (Chat Truth Verification Mandatory) | **Status:** DISCOVERED

---

## Executive Summary

TITANE∞ chat system is **multi-modal AI interface** with:

- **8 chat modes** (personalities with different tool access levels)
- **4 AI providers** (Ollama local, Gemini, Claude, OpenAI)
- **Provider decision engine** (auto-fallback on failure)
- **Memory injection** (session + persistent architecture)
- **Audio I/O** (microphone input, TTS output)
- **Runtime state management** (connection, generation, streaming)
- **Offline-first + online-capable policy**

---

## 1. CHAT MODES (SYSTEM PROMPTS × TOOL PERMISSIONS)

### 1.1 Mode Configuration Structure

Each mode defines:
- `id` — Unique identifier
- `label` — UI display name
- `icon` — Visual identifier
- `category` — Classification (coach, dev, creative, hybrid)
- `default_model` — Preferred provider for mode
- `system_prompt` — Base personality/instructions
- `tools_allowed` — Tool permission matrix
- `permissions_level` — Access tier (1=basic, 2=standard, 3+=advanced)
- `memory_scope` — Memory access (session, project, global)
- `response_style` — Brief/moderate/detailed
- `tone` — neutral/empathetic/technical/creative
- `theme_color` — UI color code
- `capabilities` — Feature list
- `xp_required` — Unlock level

---

### 1.2 Available Chat Modes

#### DEFAULT Mode
- **ID:** `default`
- **Label:** Assistant (🤖)
- **Category:** Hybrid
- **Default Model:** hybrid
- **Purpose:** Fallback, general-purpose assistant
- **Permissions:** Basic (coaching + limited tools)
- **Tone:** Neutral
- **Memory:** Session scope
- **XP Required:** 0 (always available)
- **Capabilities:** basic_chat, memory_access

#### COACH Mode
- **ID:** `coach`
- **Label:** Coach Personnel (🎯)
- **Category:** Coaching
- **Default Model:** Gemini (cloud-preferred)
- **Purpose:** Personal development, motivation, goal tracking
- **Permissions:** Standard + coaching tools + reflection
- **Tone:** Empathetic, motivating
- **Memory:** Global scope (persistent across sessions)
- **XP Required:** 0
- **Capabilities:** coaching, goal_tracking, habit_formation, reflection
- **System Prompt:** Personalized coach for Kevin, empathetic + action-oriented
- **Focus:** Growth, accountability, achievement celebration

#### DEV_JUNIOR Mode
- **ID:** `dev_junior`
- **Label:** Dev Junior (👨‍💻)
- **Category:** Developer
- **Default Model:** Ollama (local-first)
- **Purpose:** Apprenticeship, guided learning, tutorials
- **Permissions:** DevTools (code analysis + explanation, but NO automation/file ops)
- **Tone:** Technical, pedagogical
- **Memory:** Project scope (per-project context)
- **XP Required:** 0
- **Capabilities:** code_explanation, tutorials, debugging_help
- **System Prompt:** Experienced teacher explaining TypeScript/React/Rust/Tauri progressively
- **Focus:** Learning, step-by-step guidance, no production risks

#### DEV_SENIOR Mode
- **ID:** `dev_senior`
- **Label:** Dev Senior (🧑‍💼)
- **Category:** Developer
- **Default Model:** Claude (cloud)
- **Purpose:** Production code review, architecture, advanced debugging
- **Permissions:** Full DevTools + architecture review + automation
- **Tone:** Technical, expert
- **Memory:** Project scope
- **XP Required:** 100 (advanced unlock)
- **Capabilities:** architecture_design, performance_optimization, production_deployment
- **System Prompt:** 15+ years expert architect, SOLID principles, clean architecture
- **Focus:** Production-ready code, performance, maintainability

#### ADMIN Mode
- **ID:** `admin`
- **Label:** Administrateur Système (⚙️)
- **Category:** System
- **Default Model:** Ollama (local-first, no data egress)
- **Purpose:** System diagnostics, configuration, optimization
- **Permissions:** Full system access (diagnostics + memory RW + automation)
- **Tone:** Technical, factual
- **Memory:** Global scope
- **XP Required:** 50
- **Capabilities:** system_diagnostics, log_analysis, configuration_optimization
- **System Prompt:** Expert sysadmin with full access to logs and config
- **Focus:** System health, optimization, troubleshooting
- **Security:** Local-only (no cloud)

#### STRATEGIST Mode
- **ID:** `strategist`
- **Label:** Stratège (📊)
- **Category:** Strategic
- **Default Model:** Gemini (cloud)
- **Purpose:** High-level analysis, planning, OKR definition
- **Permissions:** Analysis tools + architecture review (no code generation)
- **Tone:** Analytical, business-focused
- **Memory:** Global scope
- **XP Required:** 75
- **Capabilities:** strategic_planning, market_analysis, risk_assessment
- **System Prompt:** Business strategist using SWOT/OKR/Lean frameworks
- **Focus:** Vision, roadmap, KPIs, decision-making

#### AUDITOR Mode
- **ID:** `auditor`
- **Label:** Auditeur (🔍)
- **Category:** Quality
- **Default Model:** Claude (cloud)
- **Purpose:** Code audit, security review, vulnerability detection
- **Permissions:** Analysis tools (no modification), security_audit, quality_check
- **Tone:** Technical, rigorous
- **Memory:** Project scope
- **XP Required:** 100+
- **Capabilities:** security_audit, vulnerability_detection, code_quality_assessment
- **System Prompt:** Security auditor with OWASP/SOLID/Clean Code standards
- **Focus:** Vulnerabilities, technical debt, compliance

#### CREATIVE Mode
- **ID:** `creative`
- **Label:** Créatif (🎨)
- **Category:** Creative
- **Default Model:** Gemini (cloud)
- **Purpose:** Brainstorming, writing, design thinking
- **Permissions:** Text generation + prompt engineering (creative-focused)
- **Tone:** Creative, poetic, persuasive
- **Memory:** Session scope
- **XP Required:** 25
- **Capabilities:** creative_writing, ideation, narrative_generation
- **System Prompt:** Creative writer combining logic + imagination
- **Focus:** Innovation, originality, alternative perspectives

#### HYBRID Mode
- **ID:** `hybrid`
- **Label:** Polyvalent (∞)
- **Category:** Hybrid
- **Default Model:** Hybrid (auto-select)
- **Purpose:** Full capabilities, context-adaptive switching
- **Permissions:** FULL (all tools)
- **Tone:** Adaptive
- **Memory:** Global + project-aware
- **XP Required:** 150+ (ultimate unlock)
- **Capabilities:** [all capabilities]
- **System Prompt:** Complete TITANE expression, adapts per context
- **Focus:** Unified AI assistant

---

## 2. AI PROVIDERS (BACKEND SERVICES)

### 2.1 Provider Availability & Timeout Config

**Provider Registry:**
- `ollama` — Local LLM (primary for local-first policy)
- `gemini` — Google Gemini API (cloud)
- `claude` — Anthropic Claude API (cloud)
- `openai` — OpenAI API (cloud, fallback)

**Timeout Configuration:**
```
PROVIDER_TIMEOUTS = {
  ollama: 45_000ms,    // Local LLM realistic window
  gemini: 30_000ms,    // Cloud API generous bound
  claude: 30_000ms,    // Cloud API generous bound
  openai: 30_000ms,    // Cloud API bound
  default: 45_000ms,   // Unknown providers
}
```

**Provider Availability Cache:** 60_000ms (recheck every 60s)

### 2.2 Provider Decision Logic

**Selection Algorithm:**
1. Check mode's `default_model` (e.g., coach→gemini, dev_junior→ollama)
2. Verify provider availability (cached 60s)
3. If unavailable, fallback chain:
   - Local → Cloud (ollama → gemini → claude → openai)
   - Or custom order per policy
4. On failure, extend timeout or retry fallback
5. If all fail, render degraded state + offline notification

**Fallback Behavior:**
- Primary attempt: 50_000ms budget
- Max 2 providers tried (primary + 1 fallback)
- Total timeout: 52s (balanced profile)

### 2.3 Offline-First Policy

**Configuration:**
```
OFFLINE_FIRST_CONFIG = {
  provider: 'ollama',           // Prefer local
  fallback_to_cloud: true,      // Allow cloud on no-local
  mode: 'offline-prioritized',  // Cache, then cloud when available
  
  endpoints: {
    ollama: 'http://localhost:11434',    // Local LLM
    gemini: 'gateway://gemini',          // Cloud via Tauri gateway
    claude: 'gateway://claude',
    openai: 'gateway://openai'
  }
}
```

**Mode Policies:**
- **Local-only (no cloud):** Admin mode
- **Prefer local, fallback cloud:** Dev modes, Coach
- **Prefer cloud:** Strategist, Auditor, Creative
- **Hybrid:** Auto-switch based on availability + latency

### 2.4 Cloud Mode Activation

```typescript
enableCloudMode(provider: 'gemini' | 'openai' = 'gemini')
// Enables cloud access to specified provider
// Logs cloud activation events
// Used when offline not sufficient
```

---

## 3. CHAT RUNTIME STATE MACHINE

### 3.1 State Enum

```typescript
ChatRuntimeState =
  | 'idle'              // Awaiting user input
  | 'composing'         // User typing
  | 'submitting'        // Message being sent
  | 'provider_checking' // Provider availability verify
  | 'waiting_response'  // Waiting for provider response
  | 'streaming'         // Response streaming in
  | 'complete'          // Response complete
  | 'error'             // Provider error
  | 'offline'           // No provider available
  | 'degraded'          // Partial capability (fallback mode)
```

### 3.2 Transition Flow

```
idle
  ↓ (user types)
composing
  ↓ (user clicks send OR Enter key)
submitting → provider_checking
  ↓ (provider available)
waiting_response → streaming
  ↓ (stream complete)
complete [rendering message, showing in UI]
  ↓ (user sends next)
composing...

[Alternative: provider unavailable]
provider_checking → offline/degraded → error
  ↓ (retry with fallback)
waiting_response...
```

### 3.3 UI Indicators

- **Runtime State Badge** (`chat-runtime-badge`): Provider name (e.g., "Gemini", "Ollama")
- **Runtime State Indicator** (`chat-runtime-state`): Visual status (color-coded)
- **Runtime Summary** (`chat-runtime-summary`): Text status (e.g., "Waiting for Gemini...")
- **Error Message:** Human-readable error if failed

---

## 4. CHAT I/O CAPABILITIES

### 4.1 Text Input/Output

- **Input:** `chat-input` textarea (multiline, supports paste)
- **Output:** `chat-message-content` (markdown rendering, syntax highlight for code)
- **Max tokens:** Configurable per mode

### 4.2 Audio I/O

#### Microphone (Voice Input)
- **Control:** `toggle-voice-input` (on/off)
- **Mechanism:** Web Audio API + speech recognition
- **Flow:** Record → transcribe → inject as message
- **Testability:** chat-mic-accessibility.wdio.test.js

#### TTS (Text-to-Speech Output)
- **Control:** `toggle-audio-tts` (on/off)
- **Voice Selection:** `select-tts-voice` (dropdown)
- **Mechanism:** TTS engine (Google TTS / local TTS)
- **Buffer Management:** `tts-buffer-runtime-truth.wdio.test.js`
- **Settings Persistence:** `audio-settings-persistence.wdio.test.js`

### 4.3 Message Export

- **Copy Button:** `btn-copy-chat` (copy to clipboard)
- **JSON Export:** `btn-export-json` (full conversation structure)
- **Markdown Export:** `btn-export-markdown` (formatted conversation)

---

## 5. CONVERSATION STATE & MEMORY

### 5.1 Conversation Storage

**Levels:**
1. **Runtime (in-memory):** Current tab session
2. **SessionStorage:** Current browser session
3. **LocalStorage:** Persistent (browser-specific)
4. **Backend DB:** Persistent (synced via Tauri IPC)

**Persistence Model:**
- Frontend ↔ IndexedDB (writes every N messages OR on unload)
- IndexedDB ↔ Backend (synced via `tauriClient.saveConversation()`)
- Backend: SQLite or persistent storage

### 5.2 Memory Injection

**Three-Tier Memory Architecture:**

1. **Short-term Memory** (session scope)
   - Current conversation context
   - User preferences in this session
   - Timeout: Session end

2. **Medium-term Memory** (project scope, ~7 days)
   - Project-specific context
   - Decisions made this project
   - Searchable archive

3. **Long-term Memory** (global, persistent)
   - User profile, goals, habits
   - Cross-project insights
   - Lifetime learning

**Memory Search:** `input-conversation-search` → filter by keyword/date

**Testability:**
- memory-conversations.wdio.test.js (PROVEN x3 desktop)
- memory-dashboard-runtime-proof.wdio.test.js
- MemorySection tests (UI)

---

## 6. CHAT MODES × PROVIDER MATRIX (Tested Combinations)

| Mode | Default Provider | Test Status | Browser Test | Desktop Test |
|------|------------------|------------|--------------|--------------|
| default | hybrid | ⚠️ Partial | smoke.test.ts | smoke.wdio.test.js |
| coach | gemini | ✅ Proven | chat.spec.ts (partial) | online-chat-proof x3 ✓ |
| dev_junior | ollama | ⚠️ Partial | provider-flow.test.ts | diagnostic-tauri-api.wdio.test.js |
| dev_senior | claude | ⚠️ Untested | N/A | N/A |
| admin | ollama | ⚠️ Partial | N/A | admin-design-truth.wdio.test.js |
| strategist | gemini | ⚠️ Untested | N/A | N/A |
| auditor | claude | ⚠️ Untested | N/A | N/A |
| creative | gemini | ⚠️ Untested | N/A | N/A |
| hybrid | auto | N/A (meta) | user-flows.test.ts | v26_real_online_chat_truth.wdio.test.js |

**Legend:**
- ✅ PROVEN = x3 runs verified
- ⚠️ PARTIAL = Some tests, not complete
- ❌ UNTESTED = No automated proof yet

---

## 7. CRITICAL CHAT BEHAVIORS (MUST TEST)

### 7.1 Boot/Initialization

- [ ] App load → chat tab default (no crash)
- [ ] Provider availability check on app boot
- [ ] Memory loaded from storage
- [ ] Previous conversation restored

**Test Files:**
- smoke.test.ts (browser)
- smoke.wdio.test.js (desktop)
- onboarding.test.ts (first-run)

### 7.2 Message Submit Flow

- [ ] User submits message
- [ ] Message appears in UI immediately (optimistic update)
- [ ] Provider receives message via Tauri IPC
- [ ] AI response generation starts (UI shows "waiting...")
- [ ] Response streams in (visible tokens as they arrive)
- [ ] Message appears in history

**Test Files:**
- chat.spec.ts (PROVEN x3) ✅
- user-flows.test.ts (browser)
- online-chat-proof.wdio.test.js (desktop, PROVEN x3) ✅
- online-chat-proof-ui.wdio.test.js (desktop, PROVEN x3) ✅

### 7.3 Provider Fallback

- [ ] Primary provider dies → Fallback triggered
- [ ] Fallback provider responds successfully
- [ ] UI shows fallback provider in badge
- [ ] User notified of fallback (optional warn)

**Test Files:**
- chat-provider-decision-certification.spec.ts (browser)
- chat-provider-decision-certification-structural.spec.ts (browser)
- provider-flow.test.ts (browser)

### 7.4 Memory Save/Restore

- [ ] After each message, memory is updated
- [ ] User navigates away → Memory persisted to IndexedDB
- [ ] App restart → Conversation restored
- [ ] Memory search works

**Test Files:**
- memory-conversations.wdio.test.js (desktop, PROVEN x3) ✅
- memory-dashboard-runtime-proof.wdio.test.js (desktop)

### 7.5 Error Handling

- [ ] Provider timeout → Graceful error + retry option
- [ ] Network error → Offline message displayed
- [ ] Invalid input → User feedback
- [ ] Quota exceeded → Informative error

**Test Files:**
- chat-race-conditions.spec.ts (browser, race conditions)
- ui-connectivity-critical.wdio.test.js (desktop)

### 7.6 Audio I/O

- [ ] Microphone toggle enables/disables input
- [ ] TTS toggle enables/disables output
- [ ] Voice selection persists
- [ ] Audio buffer managed correctly

**Test Files:**
- chat-mic-accessibility.wdio.test.js (desktop)
- audio-tts-runtime-controls.wdio.test.js (desktop)
- audio-settings-persistence.wdio.test.js (desktop)
- audio-truth.spec.ts (browser)
- tts-buffer-runtime-truth.wdio.test.js (desktop)

### 7.7 Mode Switching

- [ ] Mode selector changes prompt
- [ ] Tools available per mode
- [ ] Default provider changes (coach→gemini, dev_junior→ollama)
- [ ] Memory context switches per mode

**Test Files:**
- provider-flow.test.ts (browser)
- N/A (desktop, no specific test)

### 7.8 Accessibility

- [ ] WCAG AA compliance (contrast, keyboard nav)
- [ ] Labels present for all controls
- [ ] Voice input accessible
- [ ] Chat history readable by screen readers

**Test Files:**
- chat-accessibility-axe.spec.ts (browser, axe-core)
- accessibility.spec.ts (browser, IGNORED in config — needs un-ignoring)

---

## 8. IDENTIFIED TEST GAPS

### HIGH PRIORITY (Block Release)

1. ❌ **dev_senior mode** — Claude provider cold start untested
2. ❌ **strategist mode** — Gemini untested in this context
3. ❌ **auditor mode** — Security audit flow untested
4. ❌ **creative mode** — Creative generation untested
5. ❌ **Mode switching** — Dynamic mode changes not tested
6. ❌ **XP-locked modes** — Unlock behavior untested

### MEDIUM PRIORITY

7. ⚠️ **Accessibility scan** (chat-accessibility-axe.spec.ts) — Test exists but IGNORED
8. ⚠️ **Race conditions** (chat-race-conditions.spec.ts) — Partial coverage
9. ⚠️ **i18n** (i18n.spec.ts) — Language switching not thorough
10. ⚠️ **Error recovery** — Some error paths untested

### LOW PRIORITY

11. ⚠️ **Cross-browser** — Only Chromium tested (Firefox/WebKit disabled)
12. ⚠️ **Performance** — Load time benchmarks absent

---

## 9. GOVERNANCE CHECKPOINTS

- ✅ 8 modes fully documented (system prompts, tools, permissions)
- ✅ 4 providers identified + timeout config
- ✅ Provider decision logic documented
- ✅ Offline-first policy verified
- ✅ State machine mapped
- ✅ I/O capabilities (text, audio, export) indexed
- ✅ Memory architecture (3-tier) documented
- ✅ Critical behaviors listed with test references
- ✅ Gap analysis explicit (high/medium/low priority)
- ✅ Proven tests referenced (chat.spec x3, online-chat-proof x3, memory x3)

**VERDICT:** CHAT_CAPABILITY_MAP = **DISCOVERED**

---

End of Phase 4: Chat Capability Map
