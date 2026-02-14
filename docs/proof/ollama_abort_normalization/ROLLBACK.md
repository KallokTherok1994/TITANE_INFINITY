# Ollama AbortError Normalization — ROLLBACK

**Ring**: 3 (Services)  
**Scope**: Procedure to revert all normalization changes

---

## 🔙 Rollback Procedure

If normalization causes issues in production, follow these steps to revert all changes:

### Option A: Git Revert (Clean, Recommended)

```bash
# Revert the normalization commit (once merged)
git revert <commit_hash_of_normalization>

# Push revert
git push origin main
```

### Option B: Manual File Revert (If commit not yet merged)

```bash
# From workspace root
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Restore original files
git checkout HEAD~1 -- src/lib/security.ts
git checkout HEAD~1 -- src/utils/tauriProtector.ts
git checkout HEAD~1 -- src/services/ai/transports/ollamaTransport.ts
git checkout HEAD~1 -- src/services/ai/retryStrategy.ts
git checkout HEAD~1 -- src/utils/ollamaFallback.ts
git checkout HEAD~1 -- src/services/ai/types.ts
git checkout HEAD~1 -- playwright.config.ts

# Remove new test files (if present)
rm -f src/__tests__/lib/security/secureInvokeAbort.test.ts
rm -f src/__tests__/services/ai/ollamaTransportAbort.test.ts
rm -f src/services/ai/__tests__/ollamaAbortFallback.test.ts

# Remove guards
rm -f scripts/verify/guard-no-frontend-ollama-direct.sh
rm -f scripts/verify/guard-dist-no-ollama-11434.sh

# Rebuild
pnpm run build

# Verify rollback
bash scripts/verify/guard-no-frontend-ollama-direct.sh || echo "Guard removed (expected)"
```

---

## 📋 Files to Revert

### Core Changes
- `src/lib/security.ts` — Remove `normalizeInvokeError()` function
- `src/utils/tauriProtector.ts` — Restore direct Ollama HTTP fallback, remove normalization
- `src/services/ai/transports/ollamaTransport.ts` — Remove abort detection and OLLAMA_ABORTED mapping
- `src/services/ai/retryStrategy.ts` — Remove abort patterns from NON_RETRIABLE_ERROR_PATTERNS
- `src/utils/ollamaFallback.ts` — Restore old user message ("Vérifie qu'Ollama tourne...")
- `src/services/ai/types.ts` — Restore old example comment

### Config/Test Files
- `playwright.config.ts` — Revert baseURL to `localhost:5173` (or keep 127.0.0.1 if dev server prefers it)
- `scripts/verify/guard-no-frontend-ollama-direct.sh` — Delete
- `scripts/verify/guard-dist-no-ollama-11434.sh` — Delete
- `src/__tests__/lib/security/secureInvokeAbort.test.ts` — Delete
- `src/__tests__/services/ai/ollamaTransportAbort.test.ts` — Delete
- `src/services/ai/__tests__/ollamaAbortFallback.test.ts` — Delete

---

## 🚨 Rollback Validation

After rollback, verify:

1. **Build passes**
   ```bash
   pnpm run build
   # Should complete without errors
   ```

2. **E2E critical tests still pass**
   ```bash
   pnpm exec playwright test --project=chromium e2e/critical/app-launch.spec.ts
   # Should pass
   ```

3. **Ollama fallback behavior restored**
   - Trigger an Ollama abort (stop Ollama, send message, cancel)
   - User should see old message: "Vérifie qu'Ollama tourne sur le port 11434"
   - Direct HTTP fallback should trigger (check network tab)

---

## 📊 Rollback Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Build breaks | LOW | Revert is git-based, atomic |
| UI breaks | LOW | No UI components changed, only error handling |
| Data loss | NONE | No schema/storage changes |
| User impact | LOW | Users see old error messages again |

---

## 🔄 Rollback Timeline

- **Detection**: User reports or monitoring alerts
- **Decision**: PO approves rollback (< 5 min)
- **Execution**: Git revert + push (< 2 min)
- **Build**: CI/CD auto-builds (< 5 min)
- **Deploy**: Auto-deploy to prod (< 3 min)
- **Validation**: Smoke test critical paths (< 5 min)

**Total**: < 20 minutes end-to-end

---

## 📝 Post-Rollback Actions

1. **Create incident report** (reports/incidents/ollama_abort_rollback_YYYYMMDD.md)
2. **Investigate root cause** (why did normalization fail?)
3. **Fix issue in dev branch**
4. **Re-test with full suite**
5. **Re-deploy with fix**

---

**Created**: 2025-02-04  
**Ring**: 3 (Services)  
**Max Rollback Time**: < 20 minutes
