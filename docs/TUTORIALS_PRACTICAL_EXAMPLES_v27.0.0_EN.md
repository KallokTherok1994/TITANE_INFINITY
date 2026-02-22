# 🎓 TITANE∞ — PRACTICAL TUTORIALS & EXAMPLES v27.0.5

**Version:** 27.0.5 | **Language:** English | **For:** All user levels

---

## 📚 TABLE OF CONTENTS

1. [Beginner Tutorials](#beginner-tutorials)
2. [Intermediate Tutorials](#intermediate-tutorials)
3. [Advanced Tutorials](#advanced-tutorials)
4. [Real-World Use Cases](#real-world-use-cases)
5. [Complete Workflows](#complete-workflows)
6. [Tips & Tricks](#tips--tricks)

---

## 🟢 BEGINNER TUTORIALS

💡 **Complete reference:** See the [Complete User Manual](./USER_MANUAL_COMPLETE_v27.0.0_EN.md) to understand all concepts.

💡 **Before starting:** If TITANE isn't installed yet, follow the [Installation Guide](./INSTALLATION_GUIDE_v27.0.0_EN.md).

### Tutorial 1: First Conversation (3 min)

**Objective:** Start & have a simple conversation

**Prerequisites:** TITANE installed

**Steps:**

```
1. Launch TITANE
   └ Wait for loading (< 2s)

2. Chat Page → Input area
   └ Click in [________]

3. Type a question
   └ "Hello! How does TITANE work?"
   └ Press Enter ⏎

4. Read the response
   └ TITANE responds with streaming
   └ Text appears in real-time

5. Continue the conversation!
   └ Ask a follow-up question
   └ "Can you explain your memory?"

6. Done! ✅
```

**Expected result:**
```
TITANE responds naturally, continues conversation

You: "Hello! How does TITANE work?"
TITANE: "Hello! I'm TITANE∞, a cognitive system
that runs 100% locally. I can:
• Converse naturally
• Remember your preferences
• Analyze files
• Help with various subjects
What would you like to know?"
```

**Common error:**
- ❌ "TITANE doesn't respond" → Check AI provider (Settings)

---

### Tutorial 2: Use Files (5 min)

**Objective:** Analyze a file (code, document, image)

**Steps:**

```
1. Open a file
   └ Take an existing file
   └ Example: my-script.py or document.pdf

2. Chat → Click [📎]
   └ "Attach" button at bottom of chat

3. Select your file
   └ Explorer opens automatically
   └ Choose: .py, .js, .pdf, .png, etc.

4. Write a question
   └ "Analyze this code for me"
   └ "Summarize this document"
   └ "What's in this image?"

5. Send & wait
   └ TITANE analyzes the file
   └ You receive detailed analysis
```

**Real example:**

```
Attached file: main.py (Python script)

You: "Are there bugs in this code?"

TITANE: "Yes, I found 2 issues:

1. Undefined variable (line 45)
   ```python
   result = calculation(x, y)
   print(undefined_var)  # ❌ Not defined
   ```
   
2. Infinite loop (line 12)
   ```python
   while True:  # ❌ Never exits
       process()
   ```

Recommendations:
• Define undefined_var before
• Add exit condition

Would you like me to propose a fixed version?"
```

**Supported formats:**
| Type | Formats |
|------|---------|
| Code | .py, .js, .ts, .rs, .cpp, .md |
| Docs | .pdf, .txt, .docx |
| Images | .png, .jpg, .gif |
| Data | .json, .csv, .xml |

---

### Tutorial 3: Change Mode (2 min)

**Objective:** Use a specialized mode (Code, Coach, etc.)

**Steps:**

```
1. Go to top of Chat bar
   └ See: "Mode: Chat" + dropdown

2. Click the dropdown
   └ Menu shows 12+ modes

3. Select a mode
   └ Example: "Code Mode"
   └ Page changes slightly

4. Ask a mode-specific question
   └ In Code mode: "Refactor this code"
   └ In Coach mode: "How to progress?"

5. Notice the difference!
   └ Responses tailored to mode
   └ TITANE changes "personality"
```

**Quick modes (Icons):**

```
💬 Chat      (default - general conversation)
💻 Code      (for development)
🧠 Brain     (creative brainstorming)
🎯 Coach     (personal accompaniment)
📊 Analyst   (analysis & synthesis)
```

**Example:**

```
SAME question in 2 modes:

Q: "How to get started?"

Chat Mode:
"To start TITANE, you launch the AppImage or DEB file.
The initial configuration guides you through 4 steps..."

Coach Mode:
"Great question! Before we start, let me ask:
1. What's your main goal with TITANE?
2. Are you comfortable with tech?
3. What's your role (dev, creative, manager)?

Answering these will help me guide you precisely!"
```

---

## 🟡 INTERMEDIATE TUTORIALS

### Tutorial 4: Master Memory (10 min)

**Objective:** Understand & use the 3 memory levels

**Steps:**

```
PART 1: Consult memory

1. Go to EVO (📊) in sidebar
2. Click "Memory"
3. See the 3 levels:
   • STM (Recent messages)
   • MTM (Detected patterns)
   • LTM (Knowledge base)

PART 2: Activate memory

4. In chat, talk about yourself
   "My name is Alice, I'm a React developer
    I love challenges"

5. TITANE records automatically
   (No action needed!)

PART 3: Verify memorization

6. Wait a few minutes
7. Change subject completely
   "Let's talk about hiking"

8. Later, ask:
   "Do you remember my name?"

9. TITANE responds:
   "Of course! You're Alice, React developer"
   → Memory magic! ✨
```

**Advanced example:**

```
Session 1 (Week 1):
"I'm working on a React-Native mobile app"

Session 2 (Week 2):
You: "How to continue my project?"

TITANE: "You were working on a React-Native mobile app.
Where are you now? What obstacle are you facing?"

→ Automatic continuity thanks to LTM!
```

**Memory management:**

```
To clean (keep private):
Settings → Memory → STM → [Clear]
(Deletes just short-term, not LTM)

To export backup:
Settings → Memory → [Export]
→ memory_alice_2025.json saved

To re-import after reinstall:
Settings → Memory → [Import]
→ All your LTM restored!
```

---

### Tutorial 5: Vision & Perception (8 min)

**Objective:** Use camera for visual analysis

**Steps:**

```
PART 1: Enable camera

1. Go to Vision (🎨) in sidebar
2. Click [Enable Camera]
3. Authorize webcam access
   └ Browser dialog appears
   └ Click "Allow"

PART 2: Screenshot

4. Click [Capture]
5. Select the area
   └ Drag-drop to choose region
6. Click [Analyze]
7. TITANE comments on the image!

PART 3: Video streaming

8. Click [Stream Video]
9. Live video displayed
10. TITANE comments in real-time
    "I see your desk, a coffee cup,
     active programming..."

PART 4: Affective Analysis (optional)

11. Face camera to webcam
12. TITANE detects your state:
    "You seem focused (75%)
     Energy: 60%
     Stress: 20%
     Suggestion: 5-minute break?"
```

**Use cases:**

```
✅ Analyze visual dashboard
   Capture → "Analyze this dashboard"
   → TITANE reads figures, insights

✅ Visual code review
   Capture screen → "Review this code"
   → Optimization suggestions

✅ Documentation
   Capture → "Summarize this diagram"
   → Structured explanation

✅ Well-being
   Stream video → Stress detection
   → Alerts + suggestions
```

**Privacy note:**
- ✅ No video recording
- ✅ Local analysis only
- ✅ Data never sent
- ✅ 100% private!

---

### Tutorial 6: Progression & XP (5 min)

**Objective:** Understand the progression system

**Steps:**

```
1. Go to EVO → [Progression]
2. See your XP in 3 domains:
   • 🧠 Cognitive: Intellectual growth
   • 👥 Social: Collaboration
   • 🛠️ Tool: TITANE mastery

3. Each action earns XP:
   ✅ Complex conversation: +50 XP
   ✅ Brainstorming: +30 XP
   ✅ Upload file: +25 XP
   ✅ Voice command: +20 XP

4. Reach milestones unlock badges:
   ✅ 1000 Cognitive XP: "Thinker" badge
   ✅ 100 Social XP: "Collaborator" badge
   ✅ 50 Tool XP: "Early Master" badge

5. Display achievements:
   Click EVO → [Achievements]
   → See all your badges
```

**Strategy for max XP:**

```
To progress fast:
1. Vary modes (5 modes = 2x XP)
2. Long conversations (>10 messages = 1.5x)
3. Attach files (1.5x XP)
4. Use voice commands (2x XP)

Result: 2 hours = 500+ XP
```

---

## 🔴 ADVANCED TUTORIALS

### Tutorial 7: Tauri API Commands (15 min)

💡 **Complete API reference:** See [API & Tauri Commands](./USER_MANUAL_COMPLETE_v27.0.0_EN.md#api--tauri-commands) in manual for exhaustive documentation.

**Objective:** Access TITANE data via code

**For Developers Only!**

**Steps:**

```
PART 1: Access cognitive state

// JavaScript in DevTools
const cogState = await invoke('get_cognitive_state');
console.log(cogState);
// Output:
// {
//   mode: "chat",
//   focus: 0.85,
//   energy: 0.72,
//   stress: 0.15
// }

PART 2: Update state

await invoke('update_cognitive_mode', {mode: 'focus'});
await invoke('update_mental_charge', {charge: 0.9});
// Affects TITANE behavior!

PART 3: Consult memory

const memory = await invoke('get_memory', {level: 'LTM'});
console.log(memory.items.length);
// Number of long-term memory items
```

**Available commands:**

```typescript
// Cognitive API
get_cognitive_state()           // TITANE mental state
update_cognitive_mode(mode)     // Change mode (focus, creative, etc.)
get_three_centers_coherence()   // Coherence (head, heart, body)
check_needs_intervention()      // Problem detected?

// Memory API
get_memory(level: 'STM'|'MTM'|'LTM')
search_memory(query: string)
add_memory(item: MemoryItem)
delete_memory(id: string)

// Chat API
send_message(msg: string, context?)
get_conversation_history()
export_conversation(format: 'pdf'|'md'|'json')

// System API
get_system_status()
get_logs(lines: number)
trigger_auto_heal()
restart_cores()
```

**Real example:**

```javascript
// Workflow: Boost motivation when stress > 50%

const state = await invoke('get_cognitive_state');

if (state.stress > 0.5) {
  // Automatically activate Coach mode
  await invoke('update_cognitive_mode', {mode: 'coach'});
  
  // Increase energy
  await invoke('update_body_energy', {energy: 0.8});
  
  // Chat suggestion
  await invoke('send_message', {
    msg: "Detected high stress! Want a coaching break?"
  });
  
  console.log("✅ Auto-intervention activated");
}
```

---

### Tutorial 8: Chain Modes (12 min)

**Objective:** Create multi-mode workflow for complex task

**Example:** Develop an API feature

**Steps:**

```
STEP 1: Brainstorming (Brainstorm Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/mode brainstorming

You: "What architectures for a scalable REST API?"

TITANE generates 15 angles:
1. Microservices
2. Modular monolith
3. Serverless Lambda
4. GraphQL
... etc

Note the top 3.


STEP 2: Analysis (Analyst Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/mode analyst

You: "Compare these 3 architectures for a startup"

TITANE:
┌─────────────────────────────────┐
│ Micro-  │ Monolith │ Serverless│
├─────────────────────────────────┤
│ Cost    │ $$       │ $        │ $$$
│ Speed   │ ⚡⚡⚡  │ ⚡⚡     │ ⚡⚡⚡⚡
│ Curve   │ Medium   │ Gentle   │ Steep
│ DevOps  │ Complex  │ Simple   │ Very simple
└─────────────────────────────────┘

Recommendation: Monolith for startup


STEP 3: Implementation (Code Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/mode code

You: "Code a simple Node.js + Express API"

TITANE returns complete code:
```javascript
const express = require('express');
const app = express();

app.get('/api/users', (req, res) => {
  res.json([{id: 1, name: 'Alice'}]);
});

app.listen(3000);
```

Click [Copy] → into your project!


STEP 4: Coaching (Coach Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/mode coach

You: "What's my first step to production?"

TITANE:
"Great question! Let's think together:

1. Do you have a server/hosting?
2. Have you considered security (CORS, rate-limiting)?
3. Start simple or complete?

My advice: Begin with 1 endpoint, deploy,
iterate. Ready?"
```

**Result:** Complex task completed in 20 min with quality! ✨

---

### Tutorial 9: Custom Modes & Workflows (20 min)

**Objective:** Create a personalized mode for your domain

**Steps:**

```
PART 1: Open Mode Builder

1. Chat → Dropdown Modes
2. See [+ Create Mode] button
3. Click it

PART 2: Configure Mode

[Mode Name Input]
Enter: "Startup Coach"

[Description]
"Specialized mode to advise entrepreneurs"

[System Prompt]
You're a senior startup coach. Your role:
• Challenge assumptions
• Help with Product-Market Fit
• Mention lean startup principles
• Ask investor-style questions

[Temperature]
Slider: 0.8 (quite creative)

[Max Tokens]
2500 (medium-long responses)

[Allowed Tools]
✅ Code generation
✅ Memory access
✅ File analysis
❌ Web search (not needed)

[Suggested Actions]
• "Validate my idea"
• "Iterate my product"
• "Pitch to investors"

[Save]
```

**Use the mode:**

```
/mode "Startup Coach"

You: "I have a mobile fitness app idea"

TITANE (in Startup Coach mode):
"Interesting! Some powerful questions:

1. What's the exact pain point?
2. Do 20 competitors already exist?
3. Who would pay (users or enterprises)?
4. Do you have PMF clarity: yes/no?

Before coding, let's validate the market!"
```

**Custom mode ideas:**

```
• "Scrum Master Coach" — Agile management help
• "Security Auditor" — Code security review
• "Research Assistant" — Academic research help
• "Content Creator" — Writing/storytelling help
• "DevOps Expert" — Infrastructure advice
• "Product Manager" — Feature planning
```

---

## 🎯 REAL-WORLD USE CASES

### Case 1: Debug Real Code

**Scenario:** Your React app crashes in production

```
You: [Attach component.tsx file]
"My component crashes on load. Help!"

/mode code

TITANE analyzes and finds:
❌ Line 45: setData() before useState
❌ Line 89: Undefined prop access
❌ Missing dependency array

Proposes fix + explains why

You click [Copy] fixed code
And integrate directly! ✅
```

**Result:** Bug fixed in 5 min instead of 30min! ⚡

---

### Case 2: Brainstorm Business Idea

**Scenario:** You're launching a startup

```
/mode brainstorming

You: "Ideas for a B2B SaaS app?"

TITANE:
🧠 Generates 20+ concepts
📊 Ranked by market potential
⚡ Creative variants
🎯 Niche opportunities

You: "Tell me more about #3"
TITANE: [Deepens concept]

You: "Which is most validatable?"
/mode analyst
TITANE: [Objective analysis]

→ In 30 min, clear + validated idea! ✨
```

---

### Case 3: Learn New Technology

**Scenario:** You want to learn Rust

```
/mode teacher

You: "Teach me Rust in 30 min"

TITANE structures 4 sections:
1️⃣ Key concepts
2️⃣ Essential syntax
3️⃣ Code examples
4️⃣ Practical exercises

You complete exercises
TITANE corrects + celebrates

→ Rust foundations acquired! 🎓
```

---

### Case 4: Write Article/Blog

**Scenario:** You're writing about "Modern DevOps"

```
/mode creator

You: "Help me structure an article on Modern DevOps"

TITANE:
📋 Detailed outline
✍️ Catchy intro
📝 5 structured sections
💡 Real examples
🎯 Call-to-action conclusion

You: "Write section 2"
TITANE: [Complete, well-written text]

You polish → Article ready in 1 hour! ✍️
```

---

## 🔄 COMPLETE WORKFLOWS

### Workflow 1: Idea to MVP Product

**Duration:** 2-3 hours

```
PHASE 1: BRAINSTORM (30 min)
────────────────────────────
Mode: Brainstorming
Q: "Ideas for solving problem X?"
↓ 20+ concepts generated
↓ Note top 3

PHASE 2: VALIDATION (45 min)
─────────────────────────────
Mode: Analyst
Q: "Analyze viability of top 3 ideas"
↓ Clear comparison
↓ Recommendation

PHASE 3: PLANNING (45 min)
────────────────────────────
Mode: Coach + Custom "Product Manager"
Q: "Detailed MVP plan?"
↓ Essential features
↓ 3-month roadmap
↓ Risks identified

PHASE 4: PROTOTYPE (1 hour)
────────────────────────────
Mode: Code
Q: "Code React boilerplate for my MVP"
↓ Complete code + explanations
↓ Copy-paste ready

RESULT: MVP planned + prototype in 2-3h! 🚀
```

---

### Workflow 2: Optimal Productivity

**Duration:** Daily

```
MORNING (9h00)
─────────────
1. Launch TITANE
2. Coach mode: "What's my priority #1?"
3. Mental charge: 0.9 (energetic)

WORK (10h-12h)
──────────────
4. Code mode: Coding challenges
5. Analyst mode: Code reviews
6. Vision: Camera → Stress < 50%

NOON (12h)
──────────
7. Break signaled
8. Energy reset

AFTERNOON (14h-17h)
─────────────────────
9. Creative mode: Feature brainstorming
10. Coach mode: Coaching session

EVENING (18h)
──────────────
11. Analyst mode: Day summary
12. Export conversation for records
13. Sleep mode: Energy reduced

RESULT: Optimized day + record! 📊
```

---

## 💡 TIPS & TRICKS

### Trick 1: Accelerate Responses

```
❌ Slow:
"Explain me async/await"
→ 30 seconds to generate...

✅ Fast:
"Define async/await in 2 sentences"
→ 5 seconds to generate!

TRICK: Limit max tokens + be precise
```

### Trick 2: Memory Boost

```
For TITANE to remember better:

1. Be explicit:
   "I'm Alice, React developer 5 years XP,
    love tests and clean code"
   
2. Repeat sometimes:
   "As I told you, I prefer X"
   
3. Export memory regularly:
   Settings → Memory → [Export]
   → Monthly backup

RESULT: Incredibly personal TITANE
after 1 month! 🎯
```

### Trick 3: Mode Stacking

```
Chain modes for power combos:

Brain + Code + Coach = Complete!

Brainstorming:  "Ideas for app X?"
       ↓
Analyst:        "Best approach?"
       ↓
Code:           "Code boilerplate?"
       ↓
Coach:          "Next step?"

→ Output: Plan + Code + Motivation ✨
```

### Trick 4: Batch Processing

```
Group similar tasks:

❌ Inefficient:
1. Chat → "Translate French→English"
2. Chat → "Translate French→German"
3. Chat → "Translate French→Spanish"

✅ Efficient:
1. One question:
   "Translate to 3 languages:
    - English
    - German
    - Spanish
   
   Text: '...'"

RESULT: 3x faster! ⚡
```

### Trick 5: Voting System

```
When TITANE proposes options:

Mode: Brainstorming
Q: "5 names for my startup?"

Response: [5 options]

You: "Vote! Rank by potential"

TITANE ranks its own suggestions! 🗳️

Useful for quick selection.
```

### Trick 6: Context Injection

```
Inject context for better responses:

❌ Vague:
"Propose architecture"

✅ Precise:
"I'm a 5-dev startup, limited budget,
need scalability. Existing stack: React, Node.js.
Propose architecture"

RESULT: 10x better tailored response! 🎯
```

---

## 🎓 5-WEEK LEARNING PATH

### Week 1: Foundations

- [ ] Day 1: Launch TITANE + basic chat
- [ ] Day 2: Explore 5 main modes
- [ ] Day 3: Use files (uploads)
- [ ] Day 4: Enable Vision
- [ ] Day 5: Understand Memory (STM/MTM/LTM)
- [ ] Day 6: Test 10 keyboard shortcuts
- [ ] Day 7: Free practice + review

**Time investment:** 7-10h  
**Result:** Autonomous for 80% of use cases

---

### Weeks 2-4: Intermediate Mastery

**Week 2: API & Automation**
- [ ] Days 8-9: Tauri basics
- [ ] Days 10-11: Automation scripts
- [ ] Days 12-13: Workflow integration
- [ ] Day 14: Personal mini-project

**Week 3: Advanced Modes**
- [ ] Days 15-16: Mode stacking
- [ ] Days 17-18: Custom modes
- [ ] Days 19-20: Chained workflows
- [ ] Day 21: Complex workflow project

**Week 4: Optimization**
- [ ] Days 22-23: Performance tuning
- [ ] Days 24-25: Memory management
- [ ] Days 26-27: Provider optimization
- [ ] Day 28: Personal audit

**Time investment:** 15-20h  
**Result:** Master 95% of features

---

### Weeks 5+: Expert Level

**Month 2: Expertise**
- [ ] Create custom modes (3-5)
- [ ] Integrate with your tools
- [ ] Document team workflows
- [ ] Train colleagues (if applicable)

**Month 3: Contribution**
- [ ] Share workflows with community
- [ ] Contribute documentation
- [ ] Propose improvements
- [ ] Create plugins/extensions

**Month 4+: Innovation**
- [ ] Innovative use cases
- [ ] Advanced research
- [ ] Business prototypes
- [ ] Community leadership

**Time investment:** 20-40h  
**Result:** Recognized expert, active contributor

---

## 📞 SUPPORT & RESOURCES

### Complementary Resources

- 📖 **Complete User Manual:** USER_MANUAL_COMPLETE_v27.0.0_EN.md
- 📦 **Installation Guide:** INSTALLATION_GUIDE_v27.0.0_EN.md
- 📚 **Documentation Index:** DOCUMENTATION_INDEX_v27.0.0_EN.md

### Community

- 💬 **Discord:** `discord.gg/titane`
- 🐛 **GitHub Issues:** Report bugs
- 💡 **GitHub Discussions:** Ask questions
- 📧 **Email:** support@titane.dev

### Video & Learning

- 📺 **YouTube:** Official channel tutorials
- 🎓 **Udemy/Coursera:** Complete courses
- 🎧 **Podcast:** "The TITANE Show" (weekly)

---

**TITANE∞ v27.0.5 — Practical Tutorials & Examples**
*Created: 31 January 2026 | Validated by Kevin Thibault*
*Last updated: 22 February 2026 | Version: 27.0.5*
*For all levels: Beginner → Expert*
*Copyright © 2025 Humain Total / TITANE Team. All rights reserved.*
