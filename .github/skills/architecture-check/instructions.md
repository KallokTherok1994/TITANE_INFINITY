# Architecture Check Skill

**Purpose:** Validate code changes against the TITANE∞ 4-Ring Architecture Model.

## Architecture Rules

### 4-Ring Model (Strict Hierarchy)

**Ring 1: Core** (`src/types/`, `src/constants/`)
- Zero imports allowed (self-sufficient)
- Only types, interfaces, constants

**Ring 2: Engines** (`src/engines/*/`)
- Can import: Ring 1 only
- Pure logic, NO I/O
- Prohibited: Services, OS, localStorage, Tauri commands

**Ring 3: Services** (`src/services/*/`)
- Can import: Ring 1 + Ring 2
- Handles all I/O operations
- Wraps Tauri commands, API calls, localStorage

**Ring 4: OS/UI** (`src-tauri/`, React components)
- Can import: All rings
- UI components and system layer

## Validation Steps

When reviewing code changes:

1. **Identify the ring** of each modified file
2. **Check imports** - Ensure inner rings don't import outer rings
3. **Verify I/O separation** - Engines must not contain I/O operations
4. **Flag violations** - Report any architecture violations

## Examples

### ✅ Valid

```typescript
// src/engines/emotion/EmotionEngine.ts
import { EmotionalState } from '@/types/voice'; // Ring 1 import - OK
```

### ❌ Invalid

```typescript
// src/engines/emotion/EmotionEngine.ts
import { secureInvoke } from '@/lib/security'; // Ring 3 import - VIOLATION!
```

## References

- [TITANE Instructions](../../instructions/titane.instructions.md)
- [Architecture Documentation](../../../docs/ARCHITECTURE.md)
