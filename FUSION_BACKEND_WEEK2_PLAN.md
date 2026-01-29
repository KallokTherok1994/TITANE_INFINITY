# Track 2 - Week 2 Implementation Plan
## TITANE∞ Fusion Backend - Commands 3-4 (Feb 5-11, 2026)

---

## Overview

**Week 2 Goals**: Implement 2 additional Fusion commands
- **Command 3**: `fusion_generate_ia_response` - IA response generation
- **Command 4**: `fusion_prepare_tts` - TTS audio buffer preparation

**Progress**: 2/8 commands ✅ → 4/8 commands (50% complete)

**Architecture**: Extend Week 1 patterns for streaming and audio operations

---

## Command 3: fusion_generate_ia_response

### Purpose
Generate IA responses from prompts with:
- Multi-model support (local/remote)
- Response streaming preparation
- Cache integration
- Token tracking

### Specification

```rust
pub struct IAGenerationRequest {
    pub prompt: String,               // User input
    pub model: Option<String>,        // Model override (default: "claude-haiku")
    pub temperature: Option<f32>,     // Temperature (0.0-2.0)
    pub max_tokens: Option<u32>,      // Max response length
    pub system_prompt: Option<String>, // System instruction override
    pub enable_cache: Option<bool>,    // Use cache system
    pub cache_key: Option<String>,     // Cache identifier
}

pub struct IAGenerationResponse {
    pub success: bool,
    pub message: String,
    pub response: String,             // Full response text
    pub tokens_used: u32,
    pub cached: bool,                 // Was response cached?
    pub generation_time_ms: u32,
    pub model: String,
    pub timestamp: i64,
}
```

### Implementation Strategy

**Phase 1: Basic Generation**
1. Input validation (prompt length, temperature bounds)
2. Model selection (local LLM integration)
3. Prompt formatting with system instructions
4. Response generation (sync for now)
5. Token counting

**Phase 2: Cache Integration**
1. Cache key generation from prompt + model
2. Cache hit detection
3. Cache storage for responses
4. Cache invalidation rules

**Phase 3: Streaming Preparation**
1. Prepare chunked response format
2. Stream token iterator
3. Partial response aggregation

### Code Structure

```rust
// fusion_commands_week2.rs - Part A: IA Commands
pub struct IACache {
    responses: Arc<Mutex<HashMap<String, CachedResponse>>>,
}

impl IACache {
    fn get(&self, key: &str) -> Option<String> { }
    fn set(&self, key: String, response: String) { }
    fn clear_expired(&self) { }
}

#[tauri::command]
pub fn fusion_generate_ia_response(
    request: IAGenerationRequest,
    state: tauri::State<'_, FusionWeek2State>,
) -> Result<IAGenerationResponse, String> {
    // Implementation
}

// Internal function for testing
fn fusion_generate_ia_response_internal(
    request: IAGenerationRequest,
    state: &FusionWeek2State,
) -> Result<IAGenerationResponse, String> {
    // Full implementation
}
```

### Validation Rules

| Field | Validation |
|-------|-----------|
| `prompt` | 1-10000 chars |
| `temperature` | 0.0-2.0 |
| `max_tokens` | 1-4096 |
| `model` | Known model name |
| `system_prompt` | 0-5000 chars |

### Error Cases

- Empty prompt
- Invalid temperature
- Model not found
- Cache system unavailable
- Timeout (30s default)

---

## Command 4: fusion_prepare_tts

### Purpose
Prepare TTS (Text-to-Speech) audio buffers with:
- Voice selection
- Pitch/speed control
- Audio format selection
- Buffer preparation for streaming

### Specification

```rust
pub struct TTSPrepareRequest {
    pub text: String,                 // Text to synthesize
    pub voice: Option<String>,        // Voice ID (default: "nova")
    pub speed: Option<f32>,           // Speed (0.5-2.0)
    pub pitch: Option<f32>,           // Pitch (0.5-2.0)
    pub format: Option<String>,       // Format (mp3, wav, aac)
    pub language: Option<String>,     // Language code (en, fr, es)
    pub enable_streaming: Option<bool>, // Prepare for streaming
}

pub struct TTSPrepareResponse {
    pub success: bool,
    pub message: String,
    pub buffer_size: usize,           // Size in bytes
    pub duration_ms: u32,             // Estimated duration
    pub format: String,
    pub voice: String,
    pub sample_rate: u32,
    pub channels: u8,
    pub chunks_prepared: u32,         // For streaming
    pub timestamp: i64,
}
```

### Implementation Strategy

**Phase 1: Voice Configuration**
1. Voice library (presets + custom)
2. Parameter validation
3. Audio format selection
4. Buffer allocation

**Phase 2: Buffer Preparation**
1. Calculate audio duration
2. Allocate memory buffers
3. Chunk preparation for streaming
4. Metadata generation

**Phase 3: Stream Support**
1. Chunk iterator for streaming
2. Progressive audio generation
3. Backpressure handling

### Code Structure

```rust
// fusion_commands_week2.rs - Part B: TTS Commands
pub struct VoiceLibrary {
    voices: HashMap<String, VoiceConfig>,
}

pub struct AudioBuffer {
    data: Vec<u8>,
    format: AudioFormat,
    sample_rate: u32,
}

#[tauri::command]
pub fn fusion_prepare_tts(
    request: TTSPrepareRequest,
    state: tauri::State<'_, FusionWeek2State>,
) -> Result<TTSPrepareResponse, String> {
    // Implementation
}

// Internal function for testing
fn fusion_prepare_tts_internal(
    request: TTSPrepareRequest,
    state: &FusionWeek2State,
) -> Result<TTSPrepareResponse, String> {
    // Full implementation
}
```

### Validation Rules

| Field | Validation |
|-------|-----------|
| `text` | 1-5000 chars |
| `speed` | 0.5-2.0 |
| `pitch` | 0.5-2.0 |
| `format` | mp3, wav, aac |
| `language` | Valid language code |

### Error Cases

- Empty text
- Invalid voice
- Invalid speed/pitch
- Format not supported
- Buffer allocation failure

---

## State Management

### FusionWeek2State (extends Week 1)

```rust
pub struct FusionWeek2State {
    // Week 1 state
    pub modules: Arc<Mutex<FusionModuleConfig>>,
    pub styles: Arc<Mutex<UIStyleConfig>>,
    
    // Week 2 additions
    pub ia_cache: Arc<IACache>,
    pub voice_library: Arc<VoiceLibrary>,
}

impl Default for FusionWeek2State {
    fn default() -> Self {
        Self {
            modules: Arc::new(Mutex::new(FusionModuleConfig::default())),
            styles: Arc::new(Mutex::new(UIStyleConfig::default())),
            ia_cache: Arc::new(IACache::new()),
            voice_library: Arc::new(VoiceLibrary::default()),
        }
    }
}
```

---

## Testing Strategy

### Unit Tests (Target: 8-10 tests)

**Command 3 Tests**:
1. `test_ia_response_basic` - Basic generation
2. `test_ia_response_with_system_prompt` - System prompt override
3. `test_ia_response_temperature_validation` - Temp bounds
4. `test_ia_response_cache_hit` - Cache functionality
5. `test_ia_response_empty_prompt` - Error case

**Command 4 Tests**:
1. `test_tts_prepare_basic` - Basic buffer prep
2. `test_tts_prepare_voice_selection` - Voice config
3. `test_tts_prepare_format_validation` - Format validation
4. `test_tts_prepare_duration_calculation` - Duration estimate
5. `test_tts_prepare_invalid_speed` - Error case

### Coverage Goals
- Line coverage: > 90%
- Branch coverage: > 85%
- Error path coverage: 100%

---

## Frontend Integration (TypeScript)

### Types (to add in Week 2)

```typescript
// src/lib/fusion/types-week2.ts

export interface IAGenerationRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  enable_cache?: boolean;
  cache_key?: string;
}

export interface IAGenerationResponse {
  success: boolean;
  message: string;
  response: string;
  tokens_used: number;
  cached: boolean;
  generation_time_ms: number;
  model: string;
  timestamp: number;
}

export interface TTSPrepareRequest {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
  format?: string;
  language?: string;
  enable_streaming?: boolean;
}

export interface TTSPrepareResponse {
  success: boolean;
  message: string;
  buffer_size: number;
  duration_ms: number;
  format: string;
  voice: string;
  sample_rate: number;
  channels: number;
  chunks_prepared: number;
  timestamp: number;
}
```

### Commands (to add in Week 2)

```typescript
// src/lib/fusion/commands-week2.ts

export async function generateIAResponse(
  request: IAGenerationRequest
): Promise<IAGenerationResponse> {
  // Tauri invoke
}

export async function prepareTTS(
  request: TTSPrepareRequest
): Promise<TTSPrepareResponse> {
  // Tauri invoke
}

// Convenience functions
export async function generateWithCache(
  prompt: string,
  cacheKey?: string
): Promise<IAGenerationResponse> {
  // Wrapper with cache logic
}

export async function prepareVoiceAudio(
  text: string,
  voice: string
): Promise<TTSPrepareResponse> {
  // Voice-specific wrapper
}
```

---

## Documentation Requirements

1. **FUSION_BACKEND_WEEK2.md** (planned)
   - API specifications
   - Implementation details
   - Test coverage
   - Performance notes

2. **TypeScript Types Guide** (update)
   - New type definitions
   - Constants for voices/models
   - Usage examples

3. **Integration Examples** (update)
   - React hooks for IA responses
   - Audio playback patterns
   - Error handling

---

## Timeline & Milestones

### Feb 5 (Day 1)
- [ ] Implement `fusion_generate_ia_response` (Command 3)
- [ ] 5 unit tests for Command 3
- [ ] Basic documentation

### Feb 8-9 (Days 2-3)
- [ ] Implement `fusion_prepare_tts` (Command 4)
- [ ] 5 unit tests for Command 4
- [ ] Complete documentation

### Feb 10-11 (Days 4-5)
- [ ] Frontend integration (TypeScript)
- [ ] React component examples
- [ ] Full testing (cargo + TypeScript)
- [ ] Commit & documentation finalization

---

## Architecture Decisions

### Caching Strategy
- **In-Memory Cache**: HashMap with Arc<Mutex<T>>
- **TTL**: 24 hours for IA responses
- **Key Format**: `{model}:{prompt_hash}:{temp}`
- **Eviction**: LRU when > 1000 entries

### Error Handling
- All operations return `Result<T, String>`
- Validation errors are separate from runtime errors
- Graceful degradation (cache miss → regenerate)

### Performance Targets
- IA generation: < 5 seconds (local model)
- TTS preparation: < 500ms
- Cache hits: < 10ms
- Memory overhead: < 100MB for 1000 cached responses

---

## Integration Points

### With Week 1 Commands
- Share `FusionWeek2State`
- Consistent error handling
- Same validation patterns

### With Chat IA System
- Use existing prompt formatting
- Integrate with conversation history
- Respect rate limits

### With Voice Engine
- Compatible with existing voice system
- Audio format compatibility
- Stream with existing pipeline

---

## Success Criteria

✅ Completion Checklist:
- [ ] 2 commands implemented (590+ LOC)
- [ ] 10 unit tests passing (100%)
- [ ] 0 compilation errors
- [ ] 0 compiler warnings
- [ ] Full TypeScript types
- [ ] Complete documentation
- [ ] React integration examples
- [ ] Performance targets met

---

## Dependencies & Concerns

### Required Libraries
- `sha2` - For cache key hashing
- `num-format` - For token counting
- `rubato` - For audio resampling (TTS)

### Potential Challenges
1. **Integration with local LLM** - Ollama/LLaMA coordination
2. **Audio buffer management** - Memory efficiency
3. **Streaming chunking** - Proper backpressure handling
4. **Cache invalidation** - When to clear old responses

### Risk Mitigation
- Mock LLM for tests
- Buffer pooling for memory reuse
- Chunking protocol documentation
- Cache TTL configuration

---

## Next Phase (Week 3+)

After Week 2 completion:
- Week 3: Commands 5-6 (Lip-sync, Avatar animation)
- Week 4: Commands 7-8 (State sync, Auto-optimization)
- Week 5: Stabilization, performance tuning
- v26.5.0 Release with full Fusion backend (8/8 commands)

---

**Plan Created**: January 29, 2026  
**Target Start**: February 5, 2026  
**Target Completion**: February 11, 2026  
**Status**: Ready for implementation

---

## Quick Reference

| Command | Purpose | LOC Est | Tests |
|---------|---------|---------|-------|
| `fusion_generate_ia_response` | IA generation | 250 | 5 |
| `fusion_prepare_tts` | TTS audio prep | 200 | 5 |
| **Total Week 2** | **Commands 3-4** | **450** | **10** |

**Running Tally**:
- Week 1: 2 commands, 590 LOC, 4 tests ✅
- Week 2: 2 commands, 450 LOC (est), 10 tests 🔵
- Week 3: 2 commands, 450 LOC (est), 10 tests ⏳
- Week 4: 2 commands, 300 LOC (est), 8 tests ⏳
- **Total v26.5.0**: 8 commands, 1,790 LOC, 32 tests
