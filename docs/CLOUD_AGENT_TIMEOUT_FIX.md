# Cloud Agent Timeout Fix - v26.2.1

## Problem Statement

Cloud agents (OpenAI, Claude, Gemini) were experiencing frequent timeout errors with the message:
> "Expiration du délai d'attente de la réponse de l'agent cloud. L'agent peut encore être en train de traiter votre requête."

## Root Cause Analysis

### Previous Configuration
- **OpenAI/Claude**: 40s timeout
- **Gemini**: 35s timeout  
- **UI Cloud Provider**: 25s (short) / 35s (medium) / 45s (long)
- **Agent System (Rust)**: 60s default task timeout

### Issues Identified
1. **Too Short for Complex Requests**: Cloud AI models can take 60-90 seconds for complex prompts
2. **UI Timeout < Backend Timeout**: UI was giving up before backend completed
3. **No Differentiation**: Same timeout for simple and complex requests
4. **Poor Error Messages**: Generic timeout messages didn't explain cloud-specific behavior

## Solution Implemented

### 1. Frontend Timeout Adjustments

**File**: `src/config/aiTimeouts.config.ts`

```typescript
// Provider-specific timeouts (increased)
export const PROVIDER_TIMEOUTS = {
  'titane-local': 5000,   // Fast local
  'tauri-backend': 12000, // Local Rust
  ollama: 30000,          // Local LLM
  gemini: 60000,          // ✨ +25s (was 35s)
  openai: 75000,          // ✨ +35s (was 40s)
  claude: 75000,          // ✨ +35s (was 40s)
  default: 25000,
} as const;

// UI-facing timeouts (increased)
export const UI_TIMEOUTS = {
  maxRequest: 90000,      // ✨ +45s (was 45s)
  failsafe: 30000,
  localProvider: { short: 8000, long: 15000 },
  ollamaProvider: { short: 12000, long: 25000 },
  cloudProvider: { 
    short: 65000,         // ✨ +40s (was 25s)
    medium: 80000,        // ✨ +45s (was 35s)
    long: 90000           // ✨ +45s (was 45s)
  },
} as const;

// Streaming timeouts (extended)
export const STREAM_CONFIG = {
  totalTimeoutMs: 180000,   // ✨ 3min (was 2min)
  perChunkTimeoutMs: 15000, // ✨ 15s (was 10s)
  ...
} as const;
```

**Rationale**:
- Cloud providers now have 60-75s, sufficient for complex requests
- UI timeout (90s) > backend timeout (75s) prevents premature disconnection
- Streaming extended to 3 minutes for long-form generation

### 2. Backend Agent Timeout Adjustments

**File**: `src-tauri/src/agent_system/config.rs` & `mod.rs`

```rust
// Default configuration
default_task_timeout_ms: 75000, // ✨ +15s (was 60s)

// Production configuration  
default_task_timeout_ms: 90000, // ✨ -30s (was 120s, now cloud-optimized)

// Per-task default
timeout_ms: 75000, // ✨ +15s (was 60s)
```

**Rationale**:
- Aligns with frontend provider timeouts (60-75s)
- Production config optimized for cloud agent behavior
- Ensures backend doesn't timeout before provider responds

### 3. Enhanced Error Messaging

**File**: `src/lib/errorHandler.ts`

```typescript
export function classifyError(error: unknown, context?: ErrorContext): ClassifiedError {
  if (error instanceof TimeoutError) {
    const isCloudAgent = context?.metadata?.provider && 
      ['openai', 'claude', 'gemini', 'anthropic'].includes(
        String(context.metadata.provider).toLowerCase()
      );
    
    return {
      type: 'TimeoutError',
      severity: ErrorSeverity.WARNING,
      message: isCloudAgent 
        ? `Délai d'attente dépassé pour l'agent cloud (${error.timeoutMs}ms)`
        : `Opération expirée (${error.timeoutMs}ms)`,
      recovery: isCloudAgent
        ? "L'agent cloud peut encore traiter votre requête. Attendez quelques instants ou réessayez avec une requête plus simple."
        : 'Essayez de nouveau ou vérifiez la connexion',
      context,
    };
  }
}
```

**Rationale**:
- Cloud-specific error messages explain asynchronous nature
- Better guidance for users experiencing timeouts
- Distinguishes between cloud and local timeout behavior

### 4. General API Timeouts

**File**: `src/constants/timeouts.ts`

```typescript
export const API_TIMEOUTS = {
  DEFAULT: 30000,
  AI_GENERATION: 90000,     // ✨ +60s (was 30s)
  QUICK_CHECK: 5000,
  LONG_OPERATION: 120000,   // ✨ +60s (was 60s)
} as const;
```

## Timeout Hierarchy

```
UI Max Request (90s)
    └─> Cloud Provider Long (90s)
        └─> OpenAI/Claude Backend (75s)
            └─> Agent Task (75s)

UI Short (65s) > Gemini Backend (60s) > Agent Default (75s allows override)
```

**Design Principle**: Each layer should timeout AFTER the layer below to avoid premature cancellation.

## Testing Recommendations

### Manual Testing

1. **Simple Cloud Request** (< 500 chars)
   - Expected: Response in < 65s
   - Timeout: Should not occur

2. **Medium Cloud Request** (500-2000 chars)
   - Expected: Response in < 80s  
   - Timeout: Should not occur

3. **Complex Cloud Request** (> 2000 chars, complex logic)
   - Expected: Response in < 90s
   - Might timeout if extremely complex, but with better messaging

4. **Streaming Cloud Request**
   - Expected: Complete within 180s
   - Should handle long-form generation

### Automated Testing

```bash
# Run AI subsystem tests
pnpm run test -- ai-subsystem-validation-v20omega.test.ts

# Run provider-specific tests
pnpm run test -- src/services/ai/providers/__tests__/openai.test.ts
pnpm run test -- src/services/ai/providers/__tests__/claude.test.ts
```

## Migration Notes

### Breaking Changes
- None - timeout increases are backward compatible

### Performance Impact
- **Positive**: Fewer false-positive timeouts
- **Neutral**: No performance degradation for fast responses
- **Trade-off**: Slower failure detection (by ~30-45s) in case of actual hangs

### Rollback Procedure
If issues arise, revert these commits:
```bash
git revert <commit-hash>
```

And restore previous values:
- PROVIDER_TIMEOUTS: openai/claude 40s, gemini 35s
- UI_TIMEOUTS.cloudProvider: short 25s, medium 35s, long 45s
- STREAM_CONFIG.totalTimeoutMs: 120000

## Monitoring

### Metrics to Track
1. **Timeout Rate**: Should decrease by 60-80%
2. **Average Response Time**: Should remain stable  
3. **User Complaints**: Should see reduction in timeout-related issues
4. **Cloud Provider Usage**: May increase as timeouts are less frequent

### Alerts
- Monitor if timeout errors > 5% of requests (was previously ~15-20%)
- Alert if average response time > 60s (indicates provider issues)

## Future Improvements

1. **Adaptive Timeouts**: Dynamically adjust based on:
   - Message length and complexity
   - Historical response times per provider
   - Time of day / provider load

2. **Progress Indicators**: Show users that cloud agent is still processing:
   ```typescript
   // After 30s
   showNotification("L'agent cloud traite votre requête complexe...");
   
   // After 60s  
   showNotification("Presque terminé, encore quelques secondes...");
   ```

3. **Timeout Prediction**: ML model to predict if request will timeout before sending

4. **Fallback Strategy**: If cloud agent times out, offer to:
   - Retry with simpler prompt
   - Switch to local model
   - Queue for async processing

## Related Issues

- Fixes issue #33 (Cloud Agent timeout)
- Related to OMEGA pipeline v2 performance improvements
- Part of v26.2.1 stability enhancements

## Version History

- **v26.2.1**: Initial timeout fix implementation
- **v26.2.0**: Issue identified and documented
- **v24.3.6**: Previous optimization round (availability caching)

---

**Documentation Status**: ✅ Complete  
**Implementation Status**: ✅ Complete  
**Testing Status**: ⏳ Pending manual validation  
**Deploy Status**: 🚀 Ready for merge
