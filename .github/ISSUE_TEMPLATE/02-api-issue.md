---
name: 🔧 API Issue
about: Report API endpoint error, incorrect spec, or integration problem
title: "[API] "
labels: ["api", "documentation", "triage"]
assignees: []

---

## 🔌 API Issue

### Affected endpoint
_e.g., `chat_send_message`, `voice_start_listening`, `memory_get_stats`_

### What's the problem?
- [ ] Endpoint not documented
- [ ] Documentation incorrect
- [ ] API spec mismatch (behavior differs from spec)
- [ ] Missing parameters
- [ ] Error codes not documented
- [ ] Code example doesn't work
- [ ] Other: ________________

### Details

**Endpoint**: `_________`  
**Provider** (if applicable): [Ollama/Gemini/Claude/OpenAI/Other]  

**Expected behavior**:
_What should happen according to docs?_

**Actual behavior**:
_What actually happens?_

**Error message** (if any):
```
[paste error here]
```

### Reproduction
```typescript
// Code that demonstrates the issue
const result = await tauri.invoke('endpoint_name', {
  param1: 'value'
});
```

### Impact
- [ ] Blocks development
- [ ] Incorrect results
- [ ] Confusing behavior
- [ ] Documentation unclear

### Environment
- TITANE Version: v27.0.0
- Tauri Version: ________
- Node/Runtime: ________

### Suggested fix
_Propose documentation update or API specification correction._

---

**Related**: [Link to OpenAPI spec](../docs/api/openapi.v27.0.0.yaml)
