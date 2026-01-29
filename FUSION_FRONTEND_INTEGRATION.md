# FUSION Backend Week 1 - Frontend Integration Guide

## Overview

Track 2, Week 1 Fusion Backend implementation adds 2 Tauri commands for:
1. **Module activation/deactivation** - Toggle 8 Fusion subsystems
2. **UI style management** - Configure 12 UI parameters

## Installation

```typescript
import {
  activateModules,
  adjustStyles,
  enableSubsystems,
  disableSubsystems,
  applyTheme,
  updateColor,
} from '@/lib/fusion';
```

## Command 1: Module Activation

### Basic Usage

Toggle individual subsystems:

```typescript
// Disable memory sync
await activateModules({
  memory_sync: false,
});

// Enable crash protection
await activateModules({
  crash_protection: true,
});

// Multiple changes at once
await activateModules({
  memory_sync: false,
  auto_healing: true,
  telemetry: false,
});
```

### Convenience Wrappers

```typescript
// Enable multiple subsystems
await enableSubsystems(['memory_sync', 'logs_sync', 'crash_protection']);

// Disable multiple subsystems
await disableSubsystems(['telemetry', 'performance_guards']);
```

### Response Structure

```typescript
{
  success: true,
  message: "Module configuration updated successfully",
  previous_state: {
    memory_sync: true,
    logs_sync: true,
    // ... 6 more subsystems
  },
  new_state: {
    memory_sync: false,  // Changed
    logs_sync: true,
    // ... 6 more subsystems
  },
  activated_modules: ['crash_protection'],
  deactivated_modules: ['memory_sync'],
  timestamp: 1706520000000,  // Unix milliseconds
}
```

### Available Subsystems

| Subsystem | Purpose | Default |
|-----------|---------|---------|
| `memory_sync` | Synchronize memory state | enabled |
| `logs_sync` | Synchronize log streams | enabled |
| `dataset_sync` | Synchronize datasets | enabled |
| `singularity_sync` | Synchronize singularity state | enabled |
| `performance_guards` | Monitor performance | enabled |
| `auto_healing` | Auto-recovery system | enabled |
| `crash_protection` | Crash prevention/recovery | enabled |
| `telemetry` | Telemetry collection | enabled |

## Command 2: Style Management

### Basic Usage

Adjust individual style parameters:

```typescript
// Change theme
await adjustStyles({
  theme: 'light',
});

// Update color
await adjustStyles({
  accent_color: '#06b6d4',
});

// Multiple changes
await adjustStyles({
  theme: 'dark',
  accent_color: '#ff0000',
  border_radius: 12,
  animation_duration: 200,
});
```

### Convenience Wrappers

```typescript
// Apply theme preset
await applyTheme('dark');

// Update single color
await updateColor('accent_color', '#06b6d4');
await updateColor('primary_color', '#0f172a');
```

### Response Structure

```typescript
{
  success: true,
  message: "Style configuration updated successfully",
  previous_style: {
    theme: 'dark',
    accent_color: '#06b6d4',
    // ... 10 more parameters
  },
  new_style: {
    theme: 'light',  // Changed
    accent_color: '#06b6d4',
    // ... 10 more parameters
  },
  applied_changes: ['theme'],
  requires_reload: true,  // Page reload needed for theme
  timestamp: 1706520000000,
}
```

### Available Style Parameters

| Parameter | Type | Range | Default |
|-----------|------|-------|---------|
| `theme` | string | "light" \| "dark" \| "auto" | "dark" |
| `accent_color` | hex | #RRGGBB | "#06b6d4" |
| `primary_color` | hex | #RRGGBB | "#0f172a" |
| `secondary_color` | hex | #RRGGBB | "#1e293b" |
| `border_radius` | number | 0-100 px | 8 |
| `animation_duration` | number | ms | 300 |
| `font_family` | string | CSS font | "Inter, system-ui" |
| `font_size` | number | pixels | 14 |
| `contrast_level` | string | "normal" \| "high" \| "max" | "normal" |
| `enable_animations` | boolean | true/false | true |
| `enable_transitions` | boolean | true/false | true |
| `custom_css` | string | CSS text | "" |

## Error Handling

```typescript
import { FusionCommandError } from '@/lib/fusion';

try {
  await activateModules({ memory_sync: false });
} catch (error) {
  if (error instanceof FusionCommandError) {
    console.error(`Command: ${error.command}`);
    console.error(`Details: ${error.details}`);
  }
}
```

## React Integration Example

```typescript
import React, { useState } from 'react';
import { 
  activateModules, 
  adjustStyles,
  type ModuleActivationResponse,
  type StyleAdjustmentResponse 
} from '@/lib/fusion';

export function FusionPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMemorySyncToggle = async (enabled: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await activateModules({
        memory_sync: enabled,
      });
      
      console.log('Memory sync updated:', response.new_state.memory_sync);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adjustStyles({ theme });
      
      if (response.requires_reload) {
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button 
        onClick={() => handleMemorySyncToggle(false)}
        disabled={isLoading}
      >
        Disable Memory Sync
      </button>
      <button 
        onClick={() => handleThemeChange('light')}
        disabled={isLoading}
      >
        Light Theme
      </button>
    </div>
  );
}
```

## Type Safety

All commands are fully type-checked:

```typescript
// ✅ Valid
await activateModules({ memory_sync: true });

// ❌ TypeScript error - unknown subsystem
await activateModules({ unknown_subsystem: true });

// ✅ Valid
await adjustStyles({ theme: 'dark' });

// ❌ TypeScript error - invalid theme
await adjustStyles({ theme: 'invalid' });
```

## Testing

```typescript
import { describe, it, expect } from 'vitest';
import { activateModules, adjustStyles } from '@/lib/fusion';

describe('Fusion Backend', () => {
  it('should toggle modules', async () => {
    const response = await activateModules({ memory_sync: false });
    expect(response.success).toBe(true);
    expect(response.new_state.memory_sync).toBe(false);
  });

  it('should adjust styles', async () => {
    const response = await adjustStyles({ theme: 'light' });
    expect(response.success).toBe(true);
    expect(response.new_style.theme).toBe('light');
  });
});
```

## Roadmap

### Week 2 (Feb 5-11)
- `fusion_generate_ia_response` - IA response generation
- `fusion_prepare_tts` - TTS audio buffer preparation

### Week 3 (Feb 12-18)
- `fusion_process_lipsync` - Lip-sync animation
- `fusion_animate_avatar` - Avatar animation control
- `fusion_update_state` - State synchronization

### Week 4 (Feb 19-25)
- `fusion_auto_optimize` - Auto-optimization engine
- Polish & optimization

## Performance Notes

- All commands return immediately (async/await)
- No blocking operations on main thread
- State is thread-safe via Arc<Mutex<T>>
- Module config persists across sessions
- Style changes apply immediately (some require reload)

## Security

- All inputs validated on Rust side
- No arbitrary code execution
- Color validation prevents CSS injection
- Style changes sanitized before application
- Subsystem toggles respect security policies

## Migration Notes

Frontend applications should:
1. Import from `@/lib/fusion` (new location)
2. Use type-safe interfaces
3. Handle `FusionCommandError` exceptions
4. Check `requires_reload` flag after style changes

## Support

See `FUSION_BACKEND_WEEK1.md` for detailed implementation notes.

---

**Created**: January 29, 2026  
**Status**: Week 1 Complete ✅  
**Next Phase**: Week 2 Implementation
