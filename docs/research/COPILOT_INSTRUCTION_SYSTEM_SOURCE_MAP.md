# COPILOT INSTRUCTION SYSTEM SOURCE MAP
# Lock A0 — Bounded Public Research Pass
# Generated: 2026-05-06
# Status: L7 Advisory — non-authoritative unless VERIFIED

This file tracks external sources relevant to TITANE_INFINITY's Copilot instruction system.
Sources are advisory only (L7). They become doctrine-candidates only when status=VERIFIED
and doctrine_impact is explicitly set to `adopted` by a governed Lock session.

---

## Source Entries

### S001 — GitHub Copilot Custom Instructions (Repository Level)

```yaml
source_title: "Customizing GitHub Copilot in VS Code — Custom Instructions"
url: "https://code.visualstudio.com/docs/copilot/copilot-customization"
source_type: official
date_accessed: 2026-05-06
claim_summary: >
  VS Code supports copilot-instructions.md at repo root or .github/ for
  repository-wide instructions. Supports .github/instructions/*.instructions.md
  for scoped instructions with applyTo glob patterns. Supports
  .github/prompts/*.prompt.md for reusable prompt files. Supports
  .github/agents/*.agent.md for custom agent modes (Copilot Edits / Agent mode).
relevance_to_TITANE: >
  Directly governs L1 (.github/copilot-instructions.md), L2 (.github/instructions/),
  L4 (.github/agents/), and L5 (.github/prompts/) in TITANE layer model.
status: VERIFIED
doctrine_impact: adopted
notes: >
  TITANE L1-L5 layer model is aligned with this official VS Code structure.
  Key: instructions.md can declare applyTo for path scoping.
  Agent files use YAML frontmatter with name, description, tools fields.
  Prompt files use YAML frontmatter with mode, description fields.
```

### S002 — GitHub Copilot Prompt Files Workflow

```yaml
source_title: "VS Code Copilot — Prompt Files (.prompt.md)"
url: "https://code.visualstudio.com/docs/copilot/copilot-customization#_reusable-prompt-files-experimental"
source_type: official
date_accessed: 2026-05-06
claim_summary: >
  Prompt files (.prompt.md) are stored in .github/prompts/ and can be invoked
  from Copilot chat. They can reference other files via #file links and declare
  frontmatter (mode, description). They support inline agent invocation.
relevance_to_TITANE: >
  Governs L5 prompt files. TITANE OWNERSHIP.md and session-router.prompt.md
  leverage this structure.
status: VERIFIED
doctrine_impact: adopted
notes: >
  TITANE prompt files use mode: and description: frontmatter as required.
  OWNERSHIP.md maps triggers, agents, and autopilot_allowed per prompt.
```

### S003 — GitHub Copilot Agent Mode (Custom Agents)

```yaml
source_title: "VS Code Copilot — Custom Chat Agents (.agent.md)"
url: "https://code.visualstudio.com/docs/copilot/chat/chat-agents"
source_type: official
date_accessed: 2026-05-06
claim_summary: >
  Custom agents are defined in .github/agents/*.agent.md with YAML frontmatter
  (name, description, tools). Agents can be invoked in Copilot chat via @agentName
  or by prompts that reference them. Each agent has a bounded scope.
relevance_to_TITANE: >
  Governs L4 custom agents. TITANE maintains 27 registered agents in
  verify_agents_index.sh.
status: VERIFIED
doctrine_impact: adopted
notes: >
  TITANE verify_agents_index.sh validates all L4 agents are registered.
  Agent files must include mission, triggers, allowed/forbidden scope, and
  validator references per TITANE doctrine.
```

### S004 — AI Coding Agent Instruction Best Practices

```yaml
source_title: "GitHub Copilot Coding Agent — Best Practices for Instructions"
url: "https://docs.github.com/en/copilot/using-github-copilot/coding-agent/best-practices-for-using-copilot-to-work-on-tasks"
source_type: official
date_accessed: 2026-05-06
claim_summary: >
  For coding agents / Autopilot: keep instructions concise and focused.
  Avoid conflicting rules. Use explicit allowlists for file mutations.
  Define clear stoplines and proof requirements. Bounded scope prevents drift.
  Prefer mechanical validators over prose claims.
relevance_to_TITANE: >
  Validates TITANE Lock A0 design: mutation allowlist, stoplines, validator-backed
  compliance, single-lock execution boundary.
status: TO_VERIFY
doctrine_impact: candidate
notes: >
  URL may resolve to a different page depending on doc version. Claims are
  consistent with TITANE doctrine but must be verified against current docs.
  Do not adopt as authoritative until URL is confirmed live.
```

### S005 — Prompt Governance + Evaluation Best Practices

```yaml
source_title: "LLM Prompt Engineering — Governance and Traceability"
url: "https://www.promptingguide.ai/techniques/prompt-chaining"
source_type: article
date_accessed: 2026-05-06
claim_summary: >
  Prompt chaining and governance: each prompt in a chain should have a single
  responsibility, explicit inputs/outputs, and verifiable outcomes. Traceability
  requires source/date/relevance on external claims. Proof-before-verdict prevents
  false positives.
relevance_to_TITANE: >
  Validates TITANE's proof-first discipline (Rule 2) and single-responsibility
  prompt design in L5.
status: TO_VERIFY
doctrine_impact: candidate
notes: >
  Non-official source. Pattern is consistent with TITANE doctrine.
  Not adopted until VERIFIED. Mark as reference for future B5 Prompt Governance lock.
```

### S006 — Instruction Overload Prevention

```yaml
source_title: "VS Code Copilot — Avoid Conflicting Instructions"
url: "https://code.visualstudio.com/docs/copilot/copilot-customization#_best-practices"
source_type: official
date_accessed: 2026-05-06
claim_summary: >
  Best practices: avoid duplicating instructions across files. Use applyTo to scope
  instructions to relevant paths. Keep the main instructions file concise. Move
  heavy runbooks to prompt files or scoped instructions. Avoid always-on heavy
  instructions that activate for every file edit.
relevance_to_TITANE: >
  Directly validates TITANE kernel compression strategy: L1 slim, L2 scoped,
  L5 heavy runbooks. verify_kernel_budget.sh enforces kernel line limit (220L).
status: TO_VERIFY
doctrine_impact: candidate
notes: >
  Official URL — claims align with current TITANE practice. Verify URL is live.
  If confirmed, elevate to VERIFIED and mark doctrine_impact: adopted.
```

---

## Source Families (Not Yet Retrieved)

These source families should be verified in future research passes:

| Family | URL Pattern | Priority | Status |
|--------|-------------|----------|--------|
| OpenAI System Prompt Best Practices | platform.openai.com/docs | MEDIUM | TO_VERIFY |
| Anthropic Claude Prompt Engineering | docs.anthropic.com | MEDIUM | TO_VERIFY |
| Eval/LLMOps frameworks (Promptfoo, Braintrust) | various | LOW | TO_VERIFY |
| ISO/NIST AI governance standards | iso.org / nist.gov | LOW | TO_VERIFY |

---

## Adoption Rules

- No source promotes into TITANE doctrine unless `status: VERIFIED` AND `doctrine_impact: adopted`.
- TITANE doctrine takes precedence over any external source.
- Conflicts between verified external sources and TITANE doctrine → record here, do NOT overwrite TITANE.
- TO_VERIFY sources are tracked but treated as advisory only.

---

## Validator

```bash
bash scripts/verify/verify_copilot_instruction_source_map.sh
```

Expected: PASS — each entry has status field; VERIFIED entries have url + date_accessed.
