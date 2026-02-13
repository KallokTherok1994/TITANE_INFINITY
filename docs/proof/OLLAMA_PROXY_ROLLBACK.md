# OLLAMA PROXY SEAL — Rollback Plan

**Date:** 2026-02-13  
**Version:** v27.2Ω → v27.1 (if needed)  
**Risk Level:** LOW (non-destructive changes)

---

## Quick Revert (Emergency)

### One-Line Command

```bash
git revert HEAD --no-commit && git commit -m "revert(ollama): rollback proxy seal to v27.1"
```

**Impact:** Restores old fetch() logic, transport layer removed.

---

## Step-by-Step Rollback

### 1. Identify Commit Hash

```bash
git log --oneline --grep="OLLAMA_PROXY_SEAL" -n 1
# Output: abc1234 feat(ollama): OLLAMA_PROXY_SEAL - unified transport
```

### 2. Revert Transport Migration

```bash
git revert abc1234 --no-commit
```

**Files affected:**
- `src/services/ai/transports/ollamaTransport.ts` (removed)
- `src/services/ai/providers/ollama.ts` (restored old fetch)
- `src/services/ai/types.ts` (AiResult types removed)

### 3. Verify Dev Mode Still Works

```bash
pnpm run dev
# Navigate to Chat UI
# Send message "Hello TITANE"
# Expected: Response from Ollama via Vite proxy
```

### 4. DO NOT Revert Guard

**Keep active:**
```bash
git reset HEAD scripts/guard/guard-ollama-proxy.sh
git checkout -- scripts/guard/guard-ollama-proxy.sh
```

**Rationale:** Guard prevents future regressions même si transport est revert.

### 5. Commit Rollback

```bash
git commit -m "revert(ollama): rollback proxy seal (production issue detected)"
git push origin MAIN
```

---

## Partial Rollback (Transport Only)

Si le transport fonctionne en dev mais échoue en prod:

### Keep Transport Layer, Disable IPC Mode

1. **Force HTTP mode** (fichier temporaire `ollamaTransport.ts`):

```typescript
function isTauriEnvironment(): boolean {
  // TEMPORARY: Force HTTP mode until IPC is fixed
  return false; // Was: typeof window !== 'undefined' && '__TAURI__' in window;
}
```

2. **Rebuild & test:**

```bash
pnpm run build
# Test AppImage
./deployment/latest/TITANE-Infinity_*.AppImage
```

3. **Monitor logs:**

```bash
tail -f ~/.titane/logs/app.log | grep -i ollama
```

---

## Rollback Verification Checklist

### After Revert

- [ ] Dev mode functional (`pnpm run dev` → Chat works)
- [ ] Build passes (`pnpm run build` → no errors)
- [ ] Guard still active (`./scripts/guard/guard-ollama-proxy.sh` → PASS)
- [ ] No TypeScript errors (`pnpm run typecheck`)
- [ ] Tests pass (if implemented)

### Confirm Old Behavior Restored

```bash
# Check old fetch() logic is back
rg -n "fetch.*getOllamaURL" src/services/ai/providers/ollama.ts
# Expected: Multiple matches (old code)

# Check transport removed
ls src/services/ai/transports/ollamaTransport.ts
# Expected: No such file or directory
```

---

## Production Fallback Strategy (No Rollback)

Si rollback impossible (deployed to users):

### Auto-Heal Provider Switch

Provider Ollama a déjà un fallback automatique:

```typescript
// In ollama.ts initializeOllama()
if (!healthy) {
  logger.warn('🔄 Falling back to titaneLocal provider');
  // Auto-heal engine switches provider
}
```

**User experience:**
- Chat UI shows: "Ollama indisponible, utilisation du provider de secours"
- Messages continuent de fonctionner (via titane-local)
- Pas de blocage total

### Manual Provider Override

User peut changer provider manuellement:

1. Open Settings → AI Provider
2. Select "TITANE Local" ou "Gemini"
3. Chat fonctionne avec nouveau provider

---

## Monitoring During Rollback

### Logs to Watch

```bash
# Frontend errors
tail -f ~/.titane/logs/app.log | grep -E "ollama|transport|fetch"

# Backend Tauri
journalctl -u titane-stable.service -f | grep ollama
```

### Expected Log Patterns

**Normal (old code):**
```
[Ollama] ✅ Health check passed - Ready at /api/ollama
[Ollama] 📦 Model: gemma2:2b
[ollamaProvider] ✅ Réponse Ollama générée avec succès
```

**Rollback successful:**
```
[Ollama] Using legacy fetch() transport
[Vite] Proxying: POST /api/ollama/generate → http://127.0.0.1:11434/api/generate
```

---

## Communication Plan (If Rollback Needed)

### Internal (Dev Team)

**Slack/Discord:**
```
⚠️ ROLLBACK INITIATED: OLLAMA_PROXY_SEAL v27.2Ω → v27.1
Reason: [brief issue description]
Impact: Dev OK, Prod broken
Timeline: Revert completed in [X minutes]
Next steps: Root cause analysis, re-implement with additional tests
```

### External (Users)

**GitHub Release Notes Update:**
```markdown
## v27.2.1 (Hotfix)

### Reverted
- Ollama transport layer (temporary rollback due to IPC issue in production)

### Why
- v27.2.0 introduced a new transport abstraction that works in dev but fails in some production environments
- We're rolling back while we investigate and add comprehensive E2E tests

### Impact
- Chat functionality restored (uses legacy fetch path)
- Dev mode unaffected
- New features in v27.2.0 (not related to Ollama) remain active

### Timeline
- Fix expected in v27.2.2 (week of Feb 20)
```

---

## Root Cause Analysis (Post-Rollback)

### Questions to Answer

1. **Where did IPC fail?**
   - Tauri invoke() error?
   - Backend command crash?
   - Timeout too short?

2. **Why didn't E2E catch it?**
   - E2E desktop not run?
   - Mocks hid the issue?
   - AppImage test incomplete?

3. **What logs exist?**
   - User bug reports?
   - Sentry/telemetry?
   - Manual testing notes?

### Action Items

- [ ] Add E2E Desktop mandatory gate (block merge if not passing)
- [ ] Implement telemetry in transport layer (track mode usage)
- [ ] Add integration test: dev → build → run AppImage → smoke test
- [ ] Document manual test protocol (before each release)

---

## Re-Implementation Checklist (After Rollback)

Avant de réintroduire transport layer:

- [ ] E2E Desktop OFF (Ollama stopped) → Error message shown
- [ ] E2E Desktop ON (Ollama running) → Response received
- [ ] Unit tests 100% coverage (ollamaTransport.test.ts)
- [ ] Contract tests (AiResult schema validation)
- [ ] Manual smoke test AppImage (3 conversations minimum)
- [ ] Staged rollout (1% users → 10% → 50% → 100%)
- [ ] Monitoring dashboard (transport mode, error rate, latency)

---

## Rollback Success Criteria

### Technical

- ✅ Build passes
- ✅ Dev mode works (Chat → Ollama)
- ✅ No TypeScript errors
- ✅ Guard still active (no regression risk)

### User Experience

- ✅ Chat functional (no errors)
- ✅ Response latency < 3s
- ✅ No silent failures
- ✅ Error messages actionable (if Ollama down)

### Operational

- ✅ Rollback completed in < 30 minutes
- ✅ Zero downtime (auto-heal covered gap)
- ✅ Users notified (release notes updated)
- ✅ Post-mortem scheduled

---

## Contacts

**Rollback Authority:**
- Kevin Thibault (Owner TITANE INFINITY)

**Technical Lead:**
- Copilot TITANE∞ (AI Architect)

**Escalation:**
- GitHub Issues: https://github.com/KallokTherok1994/TITANE_INFINITY/issues
- Email: [maintainer email if public]

---

**Rollback Plan Validated:** 2026-02-13T15:20:00Z  
**Last Updated:** 2026-02-13  
**Status:** READY (non-destructive rollback possible)
