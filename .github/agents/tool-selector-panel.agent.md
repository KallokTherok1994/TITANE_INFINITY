---
name: tool-selector-panel
description: >
  QA agent for the chat ToolSelectorPanel — verifies 10 tools, slash detection,
  autoSend flows, close behaviours, and desktop compliance. Also validates the
  chatToolsRegistry integrity (TOOL_CATEGORIES, TOOL_CATEGORY_ORDER, autoSend flags)
  and the ConversationSection integration point.
model: claude-sonnet-4-5
tools:
  - search
  - read_file
  - run_terminal
---

## Scope

- `src/components/chat/ToolSelectorPanel.tsx` — UI panel, 10 tools, open/close, categories, status
- `src/features/chat/chatToolsRegistry.ts` — pure data registry (10 ChatTool objects, 4 categories)
- `src/components/sections/ConversationSection.tsx` — slash-detection, handleToolSelect, autoSend chain

## Invariants

- **10 tools** must always be present (IDs stable): `generate_file`, `generate_summary`,
  `generate_report`, `web_search`, `deep_study`, `analyze_site`, `deep_reflection`,
  `critical_analysis`, `save_prefs`, `quick_summary`
- **4 categories**: `generate`, `research`, `reflect`, `config`
- **autoSend=true**: `generate_summary`, `generate_report`, `deep_reflection`, `quick_summary`
- **autoSend=false**: `generate_file`, `web_search`, `deep_study`, `analyze_site`,
  `critical_analysis`, `save_prefs`
- **Slash detection**: `inputValue === '/'` triggers `setShowToolSelector(true)`
- **Close behaviours**: Escape key, outside click, tool selection
- **data-testid stable**: `tool-selector-btn`, `tool-selector-panel`, `tool-item-{id}`,
  `tool-status-online`, `tool-status-deep`

## Gate Commands

```bash
# Unit tests (always pass)
pnpm vitest run src/__tests__/components/chat/ToolSelectorPanel.test.tsx
pnpm vitest run src/__tests__/features/chat/chatToolsRegistry.test.ts

# Playwright E2E (requires TITANE_E2E_FULL=1)
TITANE_E2E_FULL=1 pnpm playwright test e2e/critical/tool-selector.spec.ts

# Desktop WDIO (requires TITANE_E2E_FULL=1 + desktop app)
TITANE_E2E_FULL=1 node node_modules/@wdio/cli/bin/wdio.js run wdio.conf.ts \
  --spec e2e/desktop/tool-selector-panel.wdio.test.js
```

## Verification Checklist

1. `chatToolsRegistry.ts` → `CHAT_TOOLS.length === 10` ✓
2. `TOOL_CATEGORIES` has keys: generate, research, reflect, config ✓
3. `TOOL_CATEGORY_ORDER` === ['generate','research','reflect','config'] ✓
4. `ToolSelectorPanel.tsx` renders `data-testid="tool-item-{id}"` for each tool ✓
5. `data-testid="tool-selector-btn"` has `aria-haspopup` ✓
6. `ConversationSection.tsx` → `showToolSelector` state + slash detection hook ✓
7. `handleToolSelect` → `autoSend=true` triggers `setTimeout(0)+handleSend()` ✓
8. `handleToolSelect` → `autoSend=false` triggers `updateInputValue(template)+focus()` ✓
9. Panel closes on Escape, outside click, and tool selection ✓
10. WDIO T1-T3 static gates PASS without app launch ✓

## AutoHeal Reference

- Entry: `AH-20260504-TOOL-SELECTOR-DESKTOP-0007`
- Scope: `e2e/desktop/tool-selector-panel.wdio.test.js`, `.github/agents/tool-selector-panel.agent.md`
- Symptom: No WDIO desktop test nor agent file for ToolSelectorPanel
- Fix: WDIO 18-test file + agent file created, Rule 16 compliant

## Related Files

- `src/__tests__/components/chat/ToolSelectorPanel.test.tsx` (12 Vitest tests — existing)
- `src/__tests__/features/chat/chatToolsRegistry.test.ts` (13 Vitest tests — existing)
- `e2e/critical/tool-selector.spec.ts` (6 Playwright runs — existing)
- `e2e/desktop/tool-selector-panel.wdio.test.js` (18 WDIO tests — this session)
