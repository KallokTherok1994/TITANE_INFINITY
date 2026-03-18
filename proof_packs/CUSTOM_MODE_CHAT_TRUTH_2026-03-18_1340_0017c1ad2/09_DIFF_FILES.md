# DIFF FILES

## src/config/chatModes.config.ts

Added BEFORE the existing `getSystemPrompt` function:

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM MODE RUNTIME REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

const _customModeRegistry: Record<string, string> = {};

export const registerCustomMode = (modeId: string, systemPrompt: string): void => {
  _customModeRegistry[modeId] = systemPrompt;
};
```

Updated `getSystemPrompt` to check registry first:

```typescript
export const getSystemPrompt = (modeId: string): string => {
  if (_customModeRegistry[modeId]) {
    return _customModeRegistry[modeId];
  }
  const mode = CHAT_MODES[modeId];
  return mode?.system_prompt ?? SYSTEM_PROMPTS.default;
};
```

## src/components/sections/ConversationSection.tsx

Added import line 33:
```typescript
import { registerCustomMode } from '@/config/chatModes.config';
```

localStorage load useEffect: added `modes.forEach(m => registerCustomMode(m.id, m.systemPrompt))`.

`handleSaveCustomMode`: added `registerCustomMode(mode.id, mode.systemPrompt)` call.
