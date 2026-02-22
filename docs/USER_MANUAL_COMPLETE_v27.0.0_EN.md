# 📚 TITANE∞ — COMPLETE USER MANUAL v27.0.5
**Version:** 27.0.5 | **Language:** English | **Date:** 22 February 2026

---

## 📖 TABLE OF CONTENTS

1. [Introduction](#introduction)
2. [Installation & Startup](#installation--startup)
3. [Main Interface](#main-interface)
4. [AI Chat — Conversational System](#ai-chat--conversational-system)
5. [Conversation Modes](#conversation-modes)
6. [Memory System](#memory-system)
7. [Vision & Perception](#vision--perception)
8. [Cognitive Modules](#cognitive-modules)
9. [Progression & XP](#progression--xp)
10. [Settings & Configuration](#settings--configuration)
11. [Troubleshooting & Support](#troubleshooting--support)
12. [FAQ](#faq)
13. [Keyboard Shortcuts](#keyboard-shortcuts)
14. [API & Tauri Commands](#api--tauri-commands)
15. [Technical Glossary](#technical-glossary)
16. [Security & Privacy](#security--privacy)
17. [Performance & Optimization](#performance--optimization)

---

## 🎯 INTRODUCTION

### What is TITANE∞?

TITANE∞ is a **Cognitive Operating System (Cognitive OS)** - an intelligent and autonomous desktop application that runs 100% locally. It's much more than a chatbot: it's a personal cognitive assistant that learns, evolves, and adapts to your needs.

**Main Capabilities:**
- 🧠 **Conversational AI** — Multimodal chat with 4+ AI providers
- 💾 **Triple Memory System** — STM (short-term) + MTM (mid-term) + LTM (long-term)
- 📈 **Progression & XP** — Gain experience in 3 domains
- 👁️ **Vision & Perception** — Visual analysis with webcam
- 🎯 **13 Cognitive Modules** — Each specialized in a function
- 🔒 **100% Private** — Everything runs locally, no cloud required
- ⚡ **Ultra-Fast** — Startup <1 second, streaming responses

### Who Can Use It?

TITANE∞ is designed for:
- **Developers** — Technical assistance, code review, architecture
- **Creatives** — Brainstorming, idea generation, writing
- **Managers** — Planning, organization, decision-making
- **Students** — Personalized learning, tutoring
- **Researchers** — Data analysis, synthesis, exploration

---

## 🚀 INSTALLATION & STARTUP

### Prerequisites

- **OS:** Linux (x86-64), macOS, Windows
- **RAM:** 4GB minimum (8GB recommended)
- **Space:** 500MB for installation
- **Internet:** Optional (for cloud providers)

### Installation

#### 1. Download TITANE

```bash
# Linux (AppImage)
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/TITANE-Infinity_27.0.5_amd64.AppImage
chmod +x TITANE-Infinity_27.0.5_amd64.AppImage
./TITANE-Infinity_27.0.5_amd64.AppImage

# Or via package manager (if available)
sudo apt install titane-infinity
```

#### 2. Initial Configuration

On first launch, TITANE will guide you through:
- ✅ Terms of use acceptance
- ✅ User profile configuration
- ✅ AI provider selection (Ollama / Gemini / Local)
- ✅ Memory initialization

### Startup

**Quick launch:**
```bash
./TITANE-Infinity_27.0.5_amd64.AppImage
```

**With options:**
```bash
./TITANE-Infinity_27.0.5_amd64.AppImage --dev        # Development mode
./TITANE-Infinity_27.0.5_amd64.AppImage --offline    # Offline mode
./TITANE-Infinity_27.0.5_amd64.AppImage --memory     # Load memory
```

**Startup time:** ~585ms (ultra-fast)

---

## 🖥️ MAIN INTERFACE

### General Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 TITANE∞ — Cognitive AI Chat                [_ □ ✕] │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   SIDEBAR    │          MAIN CHAT                          │
│              │                                              │
│ 📱 Pages     │  Conversational messages                    │
│ 💬 Chat      │  (streaming in real-time)                   │
│ 🎨 Vision    │                                              │
│ 📊 EVO       │                                              │
│ ⚙️ Settings  │                                              │
│              │                                              │
├──────────────┴──────────────────────────────────────────────┤
│ Input: Type your message... | 🎤 🎨 📎 ▶️                 │
└──────────────────────────────────────────────────────────────┘
```

### Main Sections

#### 1. **Sidebar (Navigation)**

**Pages:**
- 🏠 **Home** — Home with quick suggestions
- 💬 **Chat** — Conversation interface (main page)
- 🎨 **Vision** — Visual analysis (webcam)
- 📊 **EVO** — Dashboard + Identity + Memory + Progression
- ⚙️ **Settings** — Settings and configuration

**Navigation:**
- Click a section to access the page
- Icons for quick access
- Notification badges

#### 2. **Chat Zone**

**Message display:**
- 🔵 **Your messages** — Aligned right, blue color
- 🟢 **TITANE messages** — Aligned left, green color
- ⏳ **Typing indicator** — Three animated dots during processing
- 📎 **Attachments** — Attached files visible

**Controls:**
- 🔄 **Refresh** — Regenerate last response
- ✏️ **Edit** — Edit message
- 🗑️ **Delete** — Delete message
- 📋 **Copy** — Copy text
- ⬇️ **Download** — Export conversation

#### 3. **Input Bar**

```
Input: [________________________________________] 🎤 🎨 📎 ▶️

🎤 — Voice dictation (if TTS enabled)
🎨 — Screenshot capture
📎 — Attach file
▶️ — Send message
```

---

## 💬 AI CHAT — CONVERSATIONAL SYSTEM

### Start a Conversation

💡 **New users?** Check [Tutorial #1: First Conversation](./TUTORIALS_PRACTICAL_EXAMPLES_v27.0.0_EN.md#tutorial-1-first-conversation-3-min) for step-by-step guide.

#### Method 1: Simple Text

1. Click in the input area
2. Type your question/message
3. Press `Enter` or click ▶️

**Example:**
```
You: "Explain the difference between async/await and callbacks in JavaScript"

TITANE: "Great question. Here are the key differences...
[Detailed response with code examples]"
```

#### Method 2: Voice Commands

If TTS (Text-to-Speech) is enabled:
1. Click the 🎤 button
2. Speak (the microphone will listen)
3. TITANE generates the voice response

#### Method 3: Files

1. Click 📎 (attach)
2. Select a file (code, document, PDF, image)
3. TITANE analyzes the file in its response

**Supported formats:**
- Code: `.js`, `.ts`, `.py`, `.rust`, `.cpp`, `.md`
- Documents: `.pdf`, `.txt`, `.docx`
- Images: `.png`, `.jpg`, `.gif`
- Data: `.json`, `.csv`, `.xml`

#### Method 4: Screenshot

1. Click 🎨
2. Select the area to capture
3. TITANE analyzes the image

### Chat Moderation

#### Quick Suggestions

The first line displays suggestions:
```
💬 Ask a question | 🧠 Ask for explanation | 🎯 Explore a topic
```

Click to use quickly.

#### History

- Your conversation is **persistent** (saved)
- Accessible via the 📜 **History** button
- Sorted by date/week/month

#### Search

- Click 🔍 to search in history
- Search by subject, date, keywords

### Special Commands

TITANE recognizes commands:

```
/reset        → Reset conversation
/mode [name]  → Change mode (chat, code, creative, etc.)
/memory       → Display active memory
/status       → System status
/help         → Help
```

---

## 🎭 CONVERSATION MODES

TITANE offers **12+ conversation modes** optimized for different contexts.

### Overview of Modes

| Mode | Icon | Description | Usage |
|------|------|-------------|-------|
| **Chat** | 💬 | Balanced conversation | General discussion |
| **Code** | 💻 | Code analysis & generation | Dev, debugging |
| **Brainstorming** | 🧠 | Creative exploration | Ideas, innovation |
| **Coach** | 🎯 | Personal accompaniment | Personal development |
| **Analyst** | 📊 | Deep analysis | Synthesis, reports |
| **Creator** | 🎨 | Creative content | Writing, storytelling |
| **Teacher** | 👨‍🏫 | Educational explanation | Learning |
| **DevOps** | ⚙️ | System & infrastructure | Ops, deploy |
| **Security** | 🔒 | Audit & security | Penetration testing, audit |
| **Research** | 🔬 | Scientific investigation | Research, analysis |

### Use a Mode

#### Method 1: Dropdown Menu

1. Look at the top bar of the chat
2. Click the **Conversation Mode** dropdown
3. Select the desired mode

#### Method 2: Command

```
/mode brainstorming
/mode code
/mode coach
```

#### Method 3: Visual Selector

Visual buttons display quick modes (icons at top of chat).

### Chat Mode (Default)

**Characteristics:**
- Natural and balanced conversation
- Temperature: 0.7 (moderate)
- Context: Full memory enabled
- Suggests next actions

**Usage:**
```
You: "What's your opinion on Rust vs C++?"

TITANE: "Both have strengths:
• Rust: Memory safety, safe concurrency
• C++: Raw performance, mature ecosystem
Depending on your needs..."
```

### Code Mode

**Characteristics:**
- Optimized for programming
- Automatic syntax coloring
- Refactoring suggestions
- Technical explanations

**Usage:**
```
You: "Explain this recursive loop"

TITANE: [Displays analysis with syntax coloring]
// Code
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}

Complexity: O(2^n) ❌ Should optimize...
```

### Brainstorming Mode

**Characteristics:**
- Creative divergence (without judgment)
- Generates variants and perspectives
- High temperature (0.9)
- Encourages exploration

**Usage:**
```
You: "How to create a revolutionary productivity app?"

TITANE: "Here are 20 angles of attack:
1. Extreme gamification
2. Predictive AI
3. Augmented reality
4. Voice-first interface
[Develops each angle...]"
```

### Coach Mode

**Characteristics:**
- Personal accompaniment
- Powerful questions (Socratic)
- Motivation and celebration
- Practical exercises

**Usage:**
```
You: "I want to progress in leadership"

TITANE: "Awesome! Some powerful questions:
1. What inspires you about a leader?
2. What would be your first small step?
3. Who can you observe this week?

Exercise: Make a list of 5 leaders..."
```

### Analyst Mode

**Characteristics:**
- Deep analysis and synthesis
- Complex data structures
- Detailed reports
- Actionable insights

**Usage:**
```
You: "Analyze these 3 growth strategies"

TITANE: [Comparative table]
Strategy | Revenue | Risk | Timeline
---------|---------|------|----------
Option A | 2x      | High | 6 months
Option B | 1.5x    | Low  | 12 months
Option C | 3x      | Very | 18 months
         |         | High |

Recommendation: Option B for minimal risk...
```

---

## 🧠 MEMORY SYSTEM

TITANE has a unique **triple memory**:

### 1. Short-Term Memory (STM)

**Characteristics:**
- Duration: Current session (~24h)
- Capacity: ~20 recent messages
- Speed: Ultra-fast
- Utility: Immediate context

**Display:**
- Visible in current chat
- No action necessary

**Example:**
```
You: "My name is Alice, I'm a developer"
[STM records: "Alice, Dev"]

(Later in session)
You: "Suggest projects for me"

TITANE: "For Alice, developer here are 5 projects..."
[STM is used automatically]
```

### 2. Mid-Term Memory (MTM)

**Characteristics:**
- Duration: ~1 month
- Capacity: Patterns & themes
- Speed: Fast
- Utility: Contextual learning

**Display:**
- "MTM Active" section in EVO
- Shows detected patterns
- Displays coherence (0-100%)

**Example:**
```
MTM pattern detected: "Alice interested in DevOps"
Based on: 15 conversations in 2 weeks

TITANE: "As you explore DevOps, here..."
```

### 3. Long-Term Memory (LTM)

**Characteristics:**
- Duration: Indefinite (persistent)
- Capacity: Permanent facts, acquired knowledge
- Speed: Query + search
- Utility: Structured knowledge

**Display:**
- "Knowledge Vault" section in EVO
- Search with 🔍
- Manually editable

**Example:**
```
LTM: "Alice — Front-end developer, 5 years XP, loves React"

This info persists and accumulates.
```

### Memory Management

#### Consult Memory

1. Go to **EVO** (📊)
2. Click **Memory**
3. See the 3 levels

#### Edit Memory

**LTM (Editable):**
1. **EVO** → **Memory** → **Long Term**
2. Click an entry
3. Modify/delete

**Example:**
```
Before: "Alice — Front-end dev React"
After: "Alice — Full-stack dev React + Node.js, interested in DevOps"
```

#### Export/Import Memory

```bash
# Export
Right-click → Export Memory → memory_alice_2025.json

# Import (after reinstall)
Settings → Memory → Import File
```

#### Force Refresh

```
/memory reset
/memory analyze
```

### Memory Coherence

TITANE checks that all 3 levels are coherent:

```
STM: "Alice loves React"
MTM: "Pattern: React interest detected"
LTM: "Alice — React developer"

✅ COHERENT — Perfect!
```

If incoherence: ⚠️ TITANE proposes correction.

---

## 👁️ VISION & PERCEPTION

TITANE can visually analyze the world via your webcam.

### Activation

1. Go to **Vision** (🎨)
2. Click **Enable Camera**
3. Authorize webcam access

### Usage

#### Screenshot

```
Vision Page → Click "Capture"
→ Select area (by drag)
→ TITANE analyzes and comments
```

**Example:**
```
[Capture of a dashboard]

TITANE: "I see a sales dashboard.
Metrics: 3 main figures
• Sales: 250K ↑ 12%
• Customers: 1500 ↑ 8%
• ROI: 3.2x stable

Analysis: Healthy growth, excellent ROI"
```

#### Video Streaming

```
Vision Page → Click "Stream"
→ Live video displayed
→ TITANE comments in real-time
```

**Example:**
```
[Webcam captures room]

TITANE: "I see:
• 1 person seated
• Lighting: good
• Ambiance: calm"
```

#### Affective Analysis

TITANE detects your **emotional state** (optional):

```
[Video of your face]

TITANE: "Detected state:
• Focus: 75%
• Energy: 60%
• Stress: 20%

Suggestion: 5-minute break"
```

### Vision Settings

**Settings → Vision:**

```
✅ Activation: Enabled
✅ Streaming: Yes
✅ Capture: Yes
✅ Affective Analysis: Yes
✅ Auto-Detect Stress: Yes
   Alert threshold: 70%
✅ Recording: No (for privacy)
```

---

## 🧮 COGNITIVE MODULES

TITANE contains **13 specialized cognitive modules**.

### 1. HeliosCore — Intellectual Center

**Function:** Information processing

**Capabilities:**
- Logical analysis
- Synthesis
- Criticism
- Breaking down complex problems

**Display:**
- Visible when TITANE "thinks"
- Indicator: 🧠 + spinner

**Usage:**
```
You: "What's the best architecture for a streaming app?"

TITANE: [HeliosCore active]
✅ Analyzes constraints
✅ Synthesizes options
✅ Critiques each approach
→ Recommends: Scalable Architecture X..."
```

### 2. NexusCore — Integration

**Function:** Connect concepts

**Capabilities:**
- Create links
- Pattern matching
- Cross-domain insights

**Display:**
- Connection graph
- Accessible via **EVO** → **Nexus**

### 3. HarmoniaCore — Balance

**Function:** Resolve tensions

**Capabilities:**
- Balance trade-offs
- Find middle ground
- Mediation

**Usage:**
```
You: "How to balance speed vs security?"

TITANE: [HarmoniaCore weighs both sides]
→ Proposes layer-based approach..."
```

### 4. MemoryCore — Persistence

**Function:** Manage the 3 memories

**Details:** See [Memory System](#memory-system) section

### 5. EvolutionCore — Learning

**Function:** Continuously improve

**Capabilities:**
- Detects patterns
- Learns from interaction
- Improves future responses

**Display:**
- **EVO** → **Evolution**
- Shows learning

### 6. SentinelCore — Vigilance

**Function:** Security & monitoring

**Capabilities:**
- Detects problems
- Prevents errors
- Auto-diagnosis

### 7-13. Other Modules

- **AnalysisCore** — Deep breakdown
- **IntegrationCore** — Data unification
- **PreventionCore** — Error prevention
- **IntentionCore** — Detects intentions
- **EmotionCore** — Emotional calibration
- **AdaptationCore** — Adapts to context
- **CoherenceCore** — Global coherence

### Module Display

**EVO → Cores:**
```
┌─ COGNITIVE CORES ─────────────────┐
│                                    │
│ ✅ HeliosCore    [■■■■■ 95%]     │ Active
│ ✅ NexusCore     [■■■■ 88%]      │ Active
│ ⚠️ HarmoniaCore  [■■■ 65%]       │ Needs tuning
│ ✅ MemoryCore    [■■■■■ 100%]    │ Optimal
│ ✅ EvolutionCore [■■■■ 80%]      │ Active
│ ✅ SentinelCore  [■■■■■ 97%]     │ Vigilant
│                                    │
└────────────────────────────────────┘
```

### Manual Calibration

If a core is degraded (ex: HarmoniaCore at 65%):

```
EVO → Cores → HarmoniaCore → Click "Calibrate"
→ Auto realign
→ Return to optimal (80-100%)
```

---

## 📈 PROGRESSION & XP

TITANE tracks your **progression** in 3 domains.

### The 3 Domains

#### 1. Cognitive XP 🧠
**Measures:** Your intellectual growth
- Gained by: Complex conversations, learning
- Bonus: Analyst mode, Teacher mode
- Max level: 100 (then reset with bonus)

**Example:**
```
You: [Ask for deep technical analysis]
→ +50 Cognitive XP
→ Level 23/100 (45%)

Progression: [████░░░░░░░░░░░░]
```

#### 2. Social XP 👥
**Measures:** Your collaborative capacity
- Gained by: Brainstorming, balanced discussions
- Bonus: Coach mode, memory sharing
- Max level: 100

**Example:**
```
You: [Brainstorm ideas together]
→ +30 Social XP
```

#### 3. Tool Mastery XP 🛠️
**Measures:** Mastery of TITANE
- Gained by: Using features, modes, APIs
- Bonus: Code mode, file uploads
- Max level: 100

### Display Progression

**EVO Page:**
```
┌─ PROGRESSION ─────────────────────┐
│                                    │
│ COGNITIVE XP                       │
│ Level: 23 / 100                   │
│ [████░░░░░░░░░░░░] 45%            │
│ Points: 2,340 / 5,000             │
│                                    │
│ SOCIAL XP                          │
│ Level: 15 / 100                   │
│ [███░░░░░░░░░░░░░░] 30%           │
│ Points: 1,520 / 5,000             │
│                                    │
│ TOOL MASTERY XP                    │
│ Level: 31 / 100                   │
│ [██████░░░░░░░░░░] 62%            │
│ Points: 3,100 / 5,000             │
│                                    │
└────────────────────────────────────┘
```

### Unlock Achievements

Each XP milestone unlocks a badge/achievement:

```
🏆 "First Chat" — Unlock: 1st conversation
🏆 "Code Wizard" — Unlock: 10 Code mode chats
🏆 "Brainstorm Master" — Unlock: 100 ideas generated
🏆 "Memory Keeper" — Unlock: 1000 LTM items
```

**Display:**
**EVO → Achievements → See all badges**

### XP Boosts

Certain actions **double** the XP received:

```
✨ Use 3+ different modes → 2x XP
✨ Conversation >10 messages → 1.5x XP
✨ Upload file → 1.5x XP
✨ Use voice command → 2x XP
✨ Refer a friend → 5x XP (bonus)
```

---

## ⚙️ SETTINGS & CONFIGURATION

### Access Settings

**Menu:** Sidebar → ⚙️ **Settings**

Or: `Ctrl+,` (keyboard shortcut)

### Main Sections

#### 1. Profile

**Display:**
```
┌─ PROFILE ──────────────────────┐
│                                │
│ Name: Alice Dubois             │
│ Email: alice@example.com       │
│ Role: Developer                │
│ Language: English              │
│ Timezone: Europe/Paris         │
│                                │
│ [Edit Profile] [Photo]         │
│                                │
└────────────────────────────────┘
```

**Modification:**
1. Click [Edit Profile]
2. Change information
3. Click [Save]

#### 2. AI Providers

💡 **Configuration guide:** See [Installation Guide: Setup AI Providers](./INSTALLATION_GUIDE_v27.0.0_EN.md#setup-ai-providers) for setting up Ollama, Gemini, or other providers.

**Configuration:**
```
┌─ PROVIDERS IA ───────────────────┐
│                                   │
│ Default Provider: Ollama          │
│                                   │
│ ✅ Ollama (local)                │
│    • URL: http://localhost:11434 │
│    • Model: llama2:latest        │
│    • Status: ✅ Connected        │
│                                   │
│ ✅ Gemini API                    │
│    • API Key: ***[Hidden]***    │
│    • Status: ✅ Valid            │
│                                   │
│ ✅ Local Provider (Fallback)     │
│    • Always Available            │
│    • Status: ✅ Optimal          │
│                                   │
└───────────────────────────────────┘
```

**Add a Provider:**
1. Settings → Providers
2. Click [+ Add]
3. Choose type (Gemini, OpenAI, Ollama)
4. Enter credentials
5. Test connection
6. [Save]

**Example (Ollama):**
```
1. Install Ollama (ollama.com)
2. Launch: ollama serve
3. Settings → + Add → Ollama
4. URL: http://localhost:11434
5. Model: llama2:latest
6. [Test] ✅ Connected
```

#### 3. Memory

**Configuration:**
```
┌─ MEMORY ──────────────────────┐
│                                 │
│ STM (Short Term)               │
│ • Size: 20 messages            │
│ • Duration: 24 hours          │
│ • Status: ✅ Active            │
│                                 │
│ MTM (Mid Term)                 │
│ • Duration: 30 days           │
│ • Pattern Detection: ✅        │
│ • Coherence: 92%              │
│                                 │
│ LTM (Long Term)                │
│ • Items: 1,234                 │
│ • Encryption: AES-256-GCM ✅  │
│ • Auto-Backup: ✅ Daily       │
│                                 │
│ [Export Memory] [Import]      │
│                                 │
└─────────────────────────────────┘
```

**Actions:**
- **Reset STM:** [Clear] → Confirm
- **Export LTM:** [Export] → `.json` file
- **Import LTM:** [Import] → Select file

#### 4. Chat

**Configuration:**
```
┌─ CHAT ──────────────────────────┐
│                                  │
│ Temperature: 0.7                │
│ [_____●________] 0.1 ← 1.0     │
│ Description: Balanced           │
│                                  │
│ Max Tokens: 3000                │
│ [_________●____]100 ← 8000      │
│                                  │
│ History Visible: ✅             │
│ Auto-Save: ✅ Each message     │
│ Markdown: ✅                    │
│ Code Highlighting: ✅           │
│                                  │
│ [Advanced Settings]            │
│                                  │
└──────────────────────────────────┘
```

**Temperature explained:**
- **0.1** = Very deterministic, strict responses
- **0.7** = Balanced (default) ← Recommended
- **1.0** = Very creative, varied responses

#### 5. Vision

**Configuration:**
```
┌─ VISION ──────────────────────┐
│                                │
│ Camera: ✅ Enabled            │
│ Resolution: 1920x1080         │
│                                │
│ Affective Analysis: ✅        │
│ Stress Detection: ✅          │
│ Alert Threshold: 70%          │
│                                │
│ Video Recording: ❌           │
│ (For your privacy)            │
│                                │
│ [Test Camera]                 │
│                                │
└────────────────────────────────┘
```

#### 6. Security

**Configuration:**
```
┌─ SECURITY ──────────────────┐
│                              │
│ Encryption: AES-256 ✅      │
│ Password: ••••••••          │
│ [Change]                    │
│                              │
│ Two-Factor Auth: ❌         │
│ [Enable]                    │
│                              │
│ Whitelist IP: ❌            │
│ [Add IPs]                   │
│                              │
│ Session Timeout: 30 min     │
│ [_______●_____]             │
│                              │
│ [Advanced Settings]         │
│                              │
└──────────────────────────────┘
```

#### 7. Notifications

**Configuration:**
```
┌─ NOTIFICATIONS ──────────────┐
│                               │
│ ✅ Desktop Alerts            │
│ ✅ Sound: On                 │
│ ✅ Chat Messages            │
│ ✅ Achievements             │
│ ✅ Memory Updates           │
│ ❌ Email Notifications      │
│ ❌ Daily Summary            │
│                               │
│ [Default] [Silent]           │
│                               │
└────────────────────────────────┘
```

#### 8. Appearance

**Configuration:**
```
┌─ APPEARANCE ───────────────────┐
│                                │
│ Theme: 🌙 Dark (default)       │
│ ☀️ Light | 🌙 Dark            │
│                                │
│ Font Size: 14px               │
│ [_____●_____] 12px ← 18px   │
│                                │
│ Accent Color: 🔵 Blue        │
│ [Color Picker]                │
│                                │
│ Compact Mode: ❌              │
│ [Reduce spacing]              │
│                                │
└────────────────────────────────┘
```

#### 9. Keyboard Shortcuts

**Configuration:**
```
┌─ SHORTCUTS ──────────────────┐
│                                │
│ Ctrl+Enter    Send Message     │
│ Ctrl+/        Commands         │
│ Ctrl+,        Settings         │
│ Ctrl+K        Search           │
│ Cmd+Backspace Delete conv      │
│                                │
│ [Customize]                    │
│                                │
└────────────────────────────────┘
```

---

## 🐛 TROUBLESHOOTING & SUPPORT

💡 **Installation problems?** Check the [Installation Guide: Troubleshooting Installation](./INSTALLATION_GUIDE_v27.0.0_EN.md#troubleshooting-installation) section.

### Common Issues

#### "TITANE doesn't start"

**Solution 1 — Check RAM:**
```bash
free -h  # Linux/Mac
tasklist | find "memory"  # Windows
```

**Solution 2 — Logs:**
```bash
tail -f ~/.titane/logs/app.log
# Look for ERROR or PANIC
```

**Solution 3 — Reset:**
```bash
rm -rf ~/.titane/cache
./TITANE-Infinity_27.0.5_amd64.AppImage --reset
```

#### "Chat is very slow"

**Possible causes:**
- AI provider overloaded
- Slow internet connection
- AI model too large

**Solutions:**
1. Settings → Providers → Check status
2. Reduce Max Token: 2000 instead of 3000
3. Switch provider (ex: Ollama instead of Gemini)

#### "Memory corrupted"

**Symptoms:**
- Duplicate messages
- Forgets information
- Detects incoherence

**Solution:**
```
Settings → Memory → [Export Memory]
(save backup)

Settings → Memory → STM [Clear]
Settings → Memory → [Re-analyze]

# Restart TITANE
```

#### "Camera doesn't work"

**Check permissions:**
```bash
# Linux
sudo chmod 666 /dev/video0

# Mac
System Preferences → Security & Privacy → Camera
```

**Test:**
```
Settings → Vision → [Test Camera]
```

### Support & Help

#### Help Commands

```
/help               → Display general help
/help [subject]     → Help on specific subject
/status             → System status
/diagnostics        → Diagnostic report
```

**Example:**
```
You: /help memory
TITANE: "Memory commands:
/memory → Display memory
/memory reset → Reset STM
..."
```

#### Contact Support

**For problems:**
1. Collect logs:
   ```
   TITANE: /export logs
   ```

2. Describe the problem

3. Contact: support@titane.dev

#### Report Bugs

```bash
# Generate bug report
/bug report

# Automatically attached:
- Logs from last 2 hours
- System config
- Full stack trace
```

---

## ❓ FAQ

### General Questions

**Q: Does TITANE work offline?**
A: Yes! Offline mode available. Use the Local provider (builtin). Some features (Gemini API) require internet.

**Q: Is my data private?**
A: 100% private! Everything runs locally. No data is sent to the cloud, not even conversations.

**Q: Can I use TITANE on multiple devices?**
A: Currently: no. Each installation is independent. You can export/import memory.

**Q: What's the best configuration?**
A: **Linux + 8GB RAM + Local Ollama** for optimal performance.

### Chat & Conversation

**Q: How do I change the AI provider?**
A: Settings → AI Providers → Select default. Or: `/mode [name]`

**Q: Can I use multiple models?**
A: Yes! TITANE auto-switches if a provider fails (fallback).

**Q: How to optimize responses?**
A: Use an appropriate mode (ex: Code mode for code), include context, attach files if relevant.

### Memory

**Q: How many messages can TITANE remember?**
A: STM: 20 recent. MTM: detected patterns (~30d). LTM: Unlimited (disk space available).

**Q: How do I purge memory?**
A: Settings → Memory → Select level → [Clear]

### Vision

**Q: Does TITANE record video?**
A: No, never. Recording is disabled by default. You're 100% private.

**Q: How do I analyze an image?**
A: Live camera: Vision page → Stream. Screenshot: Vision page → Capture.

### Progression

**Q: How do I earn more XP?**
A: Use varied modes, long conversations, file attachments, voice commands.

**Q: Are achievements permanent?**
A: Yes! Once unlocked, they're remembered (even after reset).

---

## ⌨️ KEYBOARD SHORTCUTS

### Essential Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl + N` | New session | Start new conversation |
| `Ctrl + M` | Audio mode | Enable/disable voice mode |
| `Ctrl + K` | Clear chat | Clear current conversation |
| `Ctrl + ,` | Open settings | Access settings |
| `Ctrl + /` | Quick help | Display contextual help |
| `↑` / `↓` | History | Navigate message history |
| `Ctrl + Enter` | Send | Send current message |

### Navigation

| Shortcut | Action | Section |
|----------|--------|---------|
| `Ctrl + 1` | TITANE (Core) | Main page |
| `Ctrl + 2` | TIME (Temporal) | Memory timeline |
| `Ctrl + 3` | STATS | Statistics |
| `Ctrl + 4` | ADMIN | Administration |
| `Ctrl + 5` | DEV | Developer tools |
| `Ctrl + B` | Toggle Sidebar | Show/hide sidebar |
| `Ctrl + Shift + P` | Command Palette | Open command palette |

### Accessibility

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Alt + S` | Skip to Content | Go to main content |
| `Alt + N` | Skip to Navigation | Go to navigation |
| `Ctrl + +` | Zoom In | Enlarge interface (+10%) |
| `Ctrl + -` | Zoom Out | Shrink interface (-10%) |
| `Ctrl + 0` | Reset Zoom | Reset zoom to 100% |
| `F11` | Fullscreen | Enable/disable fullscreen |
| `Shift + ?` | Shortcuts Help | Display shortcuts help |

### Files & Data

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl + O` | Open File | Open a file |
| `Ctrl + S` | Save | Save conversation |
| `Ctrl + Shift + S` | Save As | Save as... |
| `Ctrl + E` | Export | Export conversation |
| `Ctrl + I` | Import | Import data |

### Development

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl + Shift + I` | DevTools | Open developer tools |
| `Ctrl + Shift + C` | Console | Open JavaScript console |
| `F12` | Inspect Element | Inspect element |
| `Ctrl + R` | Reload | Reload application |
| `Ctrl + Shift + R` | Hard Reload | Reload without cache |

**💡 Tip:** Press `Shift + ?` to display all available shortcuts in the interface.

---

## 🔧 API & TAURI COMMANDS

### Overview

💡 **Practical tutorial:** Learn to use the API with [Tutorial #7: Tauri Commands](./TUTORIALS_PRACTICAL_EXAMPLES_v27.0.0_EN.md#tutorial-7-tauri-api-commands-15-min).

TITANE exposes **100+ Tauri commands** for backend ↔ frontend interaction. These commands enable complete system control.

### Command Categories

#### 1. Memory API

```typescript
// Save a memory entry
await invoke('memory_save_entry', {
  content: "My important memory",
  tags: ["personal", "important"],
  encrypted: true
});

// Load memory entries
const entries = await invoke('memory_load_entries', {
  filter: { tags: ["important"] }
});

// Clear memory (⚠️ DESTRUCTIVE)
await invoke('memory_clear', {
  confirm: true
});
```

#### 2. Chat API

```typescript
// Generate with Gemini
const response = await invoke('chat_generate_gemini', {
  prompt: "Explain quantum physics to me",
  temperature: 0.7,
  max_tokens: 2000
});

// Generate with Ollama (local)
const response = await invoke('chat_generate_ollama', {
  model: "llama2",
  prompt: "Python code for a web server"
});

// Change provider
await invoke('set_active_provider', {
  provider: "gemini" // or "ollama", "local", "tauri"
});
```

#### 3. System API

```typescript
// System status
const status = await invoke('get_system_status');
console.log(status);
// → { cpu: 45, memory: 2048, uptime: 3600, health: "OK" }

// Quick diagnostics
await invoke('sc_run_quick_diagnostics');

// Full diagnostics (5 min)
await invoke('sc_run_full_diagnostics');

// Get system metrics
const metrics = await invoke('get_system_metrics');
```

#### 4. Cognitive API

```typescript
// Cognitive state
const state = await invoke('get_cognitive_state');
console.log(state.mode); // → "focused", "creative", etc.

// Change cognitive mode
await invoke('update_cognitive_mode', { mode: "creative" });

// Three centers coherence
const coherence = await invoke('get_three_centers_coherence');
console.log(coherence);
// → { mental: 0.85, heart: 0.92, body: 0.78 }

// System recommendations
const recs = await invoke('get_system_recommendations');
```

#### 5. Auth & Security API

```typescript
// Set Gemini API Key (encrypted)
await invoke('chat_set_gemini_key', {
  key: "your-gemini-api-key"
});

// Check key status
const hasKey = await invoke('get_gemini_key_status');
console.log(hasKey); // → true/false

// Set OpenAI
await invoke('chat_set_openai_key', { key: "sk-..." });

// Set Anthropic (Claude)
await invoke('chat_set_anthropic_key', { key: "anthropic-..." });
```

#### 6. Voice API

```typescript
// Calibrate TITANE voice fingerprint
await invoke('voice_fingerprint_calibrate_titane', {
  samplesList: [sample1, sample2, sample3, ...]
});

// Check if TITANE is speaking
const result = await invoke('voice_fingerprint_is_titane_speaking', {
  samples: audioSamples
});
console.log(result);
// → { is_titane: true, similarity: 0.94 }

// Get voice profile info
const profile = await invoke('voice_fingerprint_get_profile_info');
console.log(profile);
// → { sample_count: 8, threshold: 0.85 }
```

#### 7. Logging API

```typescript
// Log info
await invoke('log_info', { message: "Operation successful" });

// Log warning
await invoke('log_warning', { message: "Warning: low resources" });

// Log error
await invoke('log_error', { 
  message: "Critical error",
  context: { code: 500, details: "..." }
});

// Get recent logs
const logs = await invoke('get_recent_logs', { count: 50 });
```

### Complete Example

```typescript
import { invoke } from '@tauri-apps/api/tauri';

// Complete workflow: Chat with memory
async function chatWithMemory(userMessage: string) {
  try {
    // 1. Save user message
    await invoke('memory_save_entry', {
      content: userMessage,
      tags: ["user", "chat"],
      encrypted: false
    });

    // 2. Generate AI response
    const response = await invoke('chat_generate_gemini', {
      prompt: userMessage,
      temperature: 0.7,
      max_tokens: 1000
    });

    // 3. Save AI response
    await invoke('memory_save_entry', {
      content: response.text,
      tags: ["ai", "chat", "response"],
      encrypted: false
    });

    // 4. Log success
    await invoke('log_info', {
      message: `Chat completed: ${userMessage.slice(0, 50)}...`
    });

    return response.text;
  } catch (error) {
    // Log error
    await invoke('log_error', {
      message: `Chat failed: ${error.message}`
    });
    throw error;
  }
}
```

**📖 Complete documentation:** See `/docs/06_api/TAURI_COMMANDS_REFERENCE.md` for the exhaustive list of 100+ commands.

---

## 📖 TECHNICAL GLOSSARY

### Essential Terms

**AI Provider**
> AI service used by TITANE to generate responses (Gemini, Ollama, Local, TauriChat).

**AppImage**
> Linux portable distribution format. Works on all distributions without installation.

**Encryption**
> Data protection via cryptographic algorithms (AES-256 for TITANE).

**Cognitive Mode**
> Mental state of the system (Focused, Creative, Analytical, Reflective).

**Context Window**
> Maximum number of tokens an AI model can process at once.

**DEB Package**
> Debian package format (.deb) for Ubuntu, Debian, etc.

**Gemini**
> Google's AI model (cloud). Fast and performant, requires API key.

**GPU Acceleration**
> Using graphics card to accelerate AI (Ollama + CUDA/ROCm).

**LTM (Long-Term Memory)**
> Long-term memory. Persistent memories over months/years.

**Modal**
> Dialog window that appears above the main interface.

**MTM (Mid-Term Memory)**
> Mid-term memory. Memories over ~30 days, gradually consolidated.

**Ollama**
> Open-source platform for running AI models locally (Llama, Mistral, etc.).

**Provider**
> AI backend service (Gemini, Ollama, Local, TauriChat).

**Streaming**
> Progressive display of AI responses (word by word) instead of waiting for complete response.

**STM (Short-Term Memory)**
> Short-term memory. Recent memories (<24h), high volatility.

**Tauri**
> Rust framework for creating native desktop applications. TITANE's backend.

**Temperature**
> AI parameter controlling creativity (0.0 = deterministic, 1.0 = very creative).

**Token**
> Unit of text (~4 characters). AI models have token limits.

**Triple Memory System**
> TITANE's STM + MTM + LTM architecture for intelligent persistence.

**Vision Module**
> Visual analysis system (webcam, screenshot, affective recognition).

**XP (Experience Points)**
> Experience points earned in 3 domains (Mental, Heart, Body).

### Acronyms

- **AI** — Artificial Intelligence
- **API** — Application Programming Interface
- **CLI** — Command Line Interface
- **CPU** — Central Processing Unit
- **DEB** — Debian Package
- **GPU** — Graphics Processing Unit
- **GUI** — Graphical User Interface
- **JSON** — JavaScript Object Notation
- **LLM** — Large Language Model
- **RAM** — Random Access Memory
- **REST** — Representational State Transfer
- **SDK** — Software Development Kit
- **SSD** — Solid State Drive
- **UI** — User Interface
- **UX** — User Experience
- **YAML** — YAML Ain't Markup Language

---

## 🔒 SECURITY & PRIVACY

### Zero-Trust Architecture

TITANE adopts a **Privacy-First** approach:

✅ **100% Local by Default**
- All computations happen locally
- No data sent to cloud without authorization
- "Local" provider works entirely offline

✅ **End-to-End Encryption**
- Memory encrypted AES-256
- API keys stored encrypted
- Secure communications (TLS 1.3)

✅ **Complete User Control**
- You choose which provider to use
- You control which data is sent
- You can delete all data instantly

### Data Protection

#### 1. API Keys (Secured)

```
Your API keys are:
✅ Encrypted AES-256 at rest
✅ Never logged
✅ Never transmitted to third parties
✅ Stored in system keychain (if available)
✅ Deletable anytime
```

**Where are your keys stored?**
- **Linux:** `~/.local/share/titane/secure/keys.enc`
- **macOS:** System Keychain
- **Windows:** Windows Credential Manager

#### 2. Memory (Triple Protection)

```
Your memory is:
✅ Encrypted by default (AES-256)
✅ Fragmented (anti-dump)
✅ Purgeable on demand
✅ Local only (except explicit export)
```

#### 3. Conversations

```
Your conversations:
✅ Never leave your machine (Local mode)
✅ Transit encrypted (Cloud mode: TLS 1.3)
✅ NOT used to train models
✅ Can be exported encrypted
```

### Security Recommendations

#### 🟢 For Privacy-Conscious Users

1. **Use Ollama provider (100% local)**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Download a model
   ollama pull llama2
   
   # TITANE will auto-detect Ollama
   ```

2. **Disable telemetry** (if enabled)
   ```
   Settings → Privacy → Telemetry → OFF
   ```

3. **Enable memory encryption** (by default)
   ```
   Settings → Memory → Encryption → ON
   ```

4. **Use offline mode**
   ```bash
  ./TITANE-Infinity_27.0.5_amd64.AppImage --offline
   ```

#### 🟡 For Cloud Users (Gemini)

1. **Create dedicated API key** (not your main key)
2. **Limit key permissions**
3. **Monitor usage** via Google Cloud Console
4. **Revoke key** if suspicious activity

#### 🔴 What TITANE NEVER Does

❌ Send your data to unauthorized third parties  
❌ Sell your information  
❌ Track usage without consent  
❌ Use your conversations to train models  
❌ Share your API keys  
❌ Log messages in plain text  

### Security Audit

TITANE is **open-source**. You can audit the code:

```bash
# Clone repo
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git

# Inspect security code
cd TITANE_INFINITY
grep -r "encryption" src-tauri/src/
grep -r "api_key" src-tauri/src/

# Check dependencies
cargo tree
```

**🔍 Audit report:** See `/docs/security/SECURITY_AUDIT.md`

---

## ⚡ PERFORMANCE & OPTIMIZATION

### v27.0.5 Benchmarks — Overview

| Metric | Value | Notes |
|--------|-------|-------|
| **Startup** | 585ms | Launch time |
| **First response** | < 2s | Gemini streaming |
| **RAM** | 150-300MB | Typical usage |
| **CPU idle** | < 1% | At rest |
| **CPU load** | 30-60% | Active generation |
| **Disk I/O** | < 5MB/s | Read/write |
| **Network** | 0 (local) | 10-50 KB/s (cloud) |

### Detailed Benchmarks by Provider

#### Ollama (Local) — NVIDIA GPU RTX 3080

| Model | First Token Latency | Throughput | GPU RAM | Quality |
|--------|----------------------|------------|---------|---------|
| llama2:7b | 320ms | 45 tok/s | 4.2 GB | ⭐⭐⭐ |
| llama2:13b | 580ms | 28 tok/s | 7.8 GB | ⭐⭐⭐⭐ |
| codellama:7b | 290ms | 52 tok/s | 4.1 GB | ⭐⭐⭐ (code) |
| mistral:7b | 280ms | 48 tok/s | 4.0 GB | ⭐⭐⭐⭐ |
| mixtral:8x7b | 950ms | 18 tok/s | 24 GB | ⭐⭐⭐⭐⭐ |

**Recommendation:** `mistral:7b` for optimal speed/quality balance

#### Ollama (Local) — CPU Only (AMD Ryzen 9 5900X)

| Model | First Token Latency | Throughput | RAM | Quality |
|--------|----------------------|------------|-----|---------|
| llama2:7b | 2.1s | 8 tok/s | 6 GB | ⭐⭐⭐ |
| mistral:7b | 1.9s | 9 tok/s | 6 GB | ⭐⭐⭐⭐ |
| phi2:2.7b | 950ms | 15 tok/s | 3 GB | ⭐⭐ (compact) |

**Recommendation:** `phi2:2.7b` if no GPU, or upgrade to GPU

#### Gemini Pro (Cloud)

| Endpoint | First Token Latency | Throughput | Cost/1K tok | Quality |
|----------|----------------------|------------|-------------|---------|
| gemini-pro | 1.2s | 60 tok/s | $0.001 | ⭐⭐⭐⭐⭐ |
| gemini-pro-vision | 1.5s | 55 tok/s | $0.002 | ⭐⭐⭐⭐⭐ |
| gemini-1.5-flash | 800ms | 80 tok/s | $0.0005 | ⭐⭐⭐⭐ |

**Recommendation:** `gemini-1.5-flash` for speed, `gemini-pro` for quality

#### Anthropic Claude (Cloud)

| Model | First Token Latency | Throughput | Cost/1K tok | Quality |
|--------|----------------------|------------|-------------|---------|
| claude-3-opus | 1.8s | 45 tok/s | $0.015 | ⭐⭐⭐⭐⭐ |
| claude-3-sonnet | 1.2s | 55 tok/s | $0.003 | ⭐⭐⭐⭐ |
| claude-3-haiku | 750ms | 65 tok/s | $0.00025 | ⭐⭐⭐ |

**Recommendation:** `claude-3-haiku` for speed/cost, `claude-3-opus` for max quality

#### Local Provider (Builtin Fallback)

| Metric | Value | Notes |
|--------|-------|-------|
| Latency | 100ms | Pre-generated responses |
| Throughput | N/A | No generation |
| RAM | 50 MB | Ultra-light |
| Quality | ⭐ | Basic (fixed rules) |

**Usage:** Fallback only, not for primary use

---

## ✅ FIRST-TIME USE CHECKLIST

To get started best:

- [ ] ✅ Install TITANE
- [ ] ✅ Launch first conversation
- [ ] ✅ Explore 3 modes (Chat, Code, Coach)
- [ ] ✅ Configure an AI provider
- [ ] ✅ Test file upload
- [ ] ✅ Check your memory (Memory)
- [ ] ✅ Go to Vision, enable camera
- [ ] ✅ Check EVO (dashboard)
- [ ] ✅ Read the FAQ
- [ ] ✅ Learn 5 essential keyboard shortcuts
- [ ] ✅ Check Glossary for unknown terms
- [ ] ✅ Join Discord community!

---

**TITANE∞ v27.0.5 — Complete User Manual**
*Created: 31 January 2026 | Validated by Kevin Thibault*
*Last updated: 22 February 2026 | Version: 27.0.5*
*Copyright © 2025 Humain Total / TITANE Team. All rights reserved.*
