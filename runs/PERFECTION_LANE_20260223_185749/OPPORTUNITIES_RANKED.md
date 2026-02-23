# Top 10 Opportunities Ranked by ROI (Impact / (Risk × Effort))

## Scorecard Legend
- **Impact**: SLO dimension (Perf=P, Stability=S, Reliability=R, UX=U)
- **Risk**: Governance (G1-G9), network, IPC, allowlist (L1-L5, higher=riskier)
- **Effort**: S=small, M=medium, L=large
- **Score** = Impact / (Risk × Effort) × 10

---

## Ranked Opportunities

### 1️⃣ **IPC Message Batching** (Current: single-call per request)
- **Evidence**: Phase 2-3 showed provider latency baseline 12ms → 11ms. IPC round-trip dominates.
- **Impact**: Performance (P) - target -2% provider latency (11ms → 10.8ms)
- **Risk**: L3 (IPC contract, allowlist stable)
- **Effort**: M (modify commands.rs + useConversationEngine.ts)
- **ROI Score**: 10 / (3 × 2) × 10 = 16.7 ✅ HIGH
- **Ring**: Engines (Ring 1) + Services (Ring 2)
- **Implementation**: Batch pending messages, flush on timeout
- **Rollback**: Git revert (straightforward IPC change)

### 2️⃣ **Provider Fallback Prewarming** (No current telemetry yet)
- **Evidence**: Phase 1-7 showed zero fallback events. Opportunity: warm cache before timeout.
- **Impact**: Reliability (R) - improve provider availability > 99.95%
- **Risk**: L2 (provider state, no new network)
- **Effort**: S (add prewarming logic in tauriChat.ts)
- **ROI Score**: 10 / (2 × 1) × 10 = 50 ✅ HIGHEST
- **Ring**: Services (Ring 2)
- **Implementation**: Periodically poll provider in background (within allowlist)
- **Rollback**: Disable flag in config

### 3️⃣ **TypeScript Strict Mode Expansion** (Current coverage unknown)
- **Evidence**: Post-campaign analysis often finds null pointer edge cases during strict mode.
- **Impact**: Stability (S) - catch early, prevent crashes
- **Risk**: L1 (compile-time only, zero runtime risk)
- **Effort**: M (add tsconfig strict flags, fix warnings)
- **ROI Score**: 10 / (1 × 2) × 10 = 50 ✅ HIGHEST
- **Ring**: Types (Ring 0) → all downstream
- **Implementation**: Enable {strict: true} in tsconfig, fix ~50-100 warnings
- **Rollback**: Revert tsconfig

### 4️⃣ **UI Render Path Optimization** (1198ms baseline)
- **Evidence**: Phase 3 UI load 1198ms can profile further. Target: 1174ms (-2%).
- **Impact**: Performance (P) - UX responsiveness
- **Risk**: L2 (UI only, no IPC contract change)
- **Effort**: M (profile with DevTools, optimize hot path)
- **ROI Score**: 10 / (2 × 2) × 10 = 25 ✅ HIGH
- **Ring**: Modules/UI (Ring 3)
- **Implementation**: Profile with React DevTools, memoize expensive renders, check useCallback coverage
- **Rollback**: Revert memoization commits

### 5️⃣ **Conversation Latency Variance Smoothing** (P95/P5 ratio unknown)
- **Evidence**: Phase 2-3 stabilized latency but variance pattern unknown. Opportunity: reduce spikes.
- **Impact**: UX (U) - consistent experience, lower perceived latency
- **Risk**: L2 (conversation engine logic, no external change)
- **Effort**: M (add request queuing, jitter smoothing)
- **ROI Score**: 8 / (2 × 2) × 10 = 20 ✅ MEDIUM-HIGH
- **Ring**: Engines (Ring 1)
- **Implementation**: Queue requests, spread reads over time windows
- **Rollback**: Disable queuing flag

### 6️⃣ **Test Coverage Audit (UI Critical Paths)** (Coverage % unknown)
- **Evidence**: Phase 9 showed monitoring ready. Need verification of test coverage on critical UI paths.
- **Impact**: Stability (S) - catch regressions earlier
- **Risk**: L1 (test-only, zero runtime)
- **Effort**: M (audit, add ~10-20 tests)
- **ROI Score**: 8 / (1 × 2) × 10 = 40 ✅ HIGHEST in Stability
- **Ring**: Types (Ring 0, tests only)
- **Implementation**: Run coverage tool, identify gaps, add critical path tests
- **Rollback**: Revert test commits

### 7️⃣ **Memory Allocator Efficiency** (248MB baseline + 1.2% observed)
- **Evidence**: Phase 3 showed memory +1.2% (within budget). Opportunity: reduce peak.
- **Impact**: Performance (P) - extend session duration on constrained devices
- **Risk**: L2 (memory management, no contract change)
- **Effort**: M (profile heap, identify leaks, add gc hints)
- **ROI Score**: 6 / (2 × 2) × 10 = 15 ✅ MEDIUM
- **Ring**: All (memory-wide)
- **Implementation**: Node heap profiling, identify growth patterns, add explicit GC markers
- **Rollback**: Remove GC markers

### 8️⃣ **API Documentation Sync** (Docs ↔ Runtime)
- **Evidence**: Post-prod survey often reveals API docs ≠ runtime. Low effort, high value for users.
- **Impact**: Reliability (R) - user confidence
- **Risk**: L1 (docs only, zero runtime)
- **Effort**: S (audit, update doc comments, rg check)
- **ROI Score**: 6 / (1 × 1) × 10 = 60 ✅ VERY HIGH
- **Ring**: Documentation only
- **Implementation**: Grep for latest API shapes, sync JSDoc comments, run doc validation
- **Rollback**: Git revert doc commits

### 9️⃣ **Telemetry Overhead Quantification** (Overhead % unknown)
- **Evidence**: Phase 9 monitoring active. Opportunity: measure telemetry CPU cost, optimize.
- **Impact**: Performance (P) - save CPU for user code
- **Risk**: L2 (telemetry logic, no external change)
- **Effort**: M (profile telemetry sampling, add metrics)
- **ROI Score**: 6 / (2 × 2) × 10 = 15 ✅ MEDIUM
- **Ring**: Services (Ring 2)
- **Implementation**: Add telemetry timing metrics, detect overhead, adjust sampling
- **Rollback**: Disable telemetry if needed

### 🔟 **Provider Error Message Clarity** (Edge case UX)
- **Evidence**: Phase 1-9 showed 0 errors logged, but provider errors might be vague to users.
- **Impact**: UX (U) - user debugging ease
- **Risk**: L1 (message formatting only)
- **Effort**: S (update error templates, add context fields)
- **ROI Score**: 6 / (1 × 1) × 10 = 60 ✅ VERY HIGH
- **Ring**: Services (Ring 2)
- **Implementation**: Enhance error messages with retry count, provider name, timestamp
- **Rollback**: Revert message templates

---

## Top 3 by Score
1. **Provider Fallback Prewarming** (50) - Reliability lever
2. **TypeScript Strict Mode** (50) - Stability lever
3. **API Documentation Sync** (60) - Reliability + UX lever ⭐ WINNER
4. **Test Coverage Audit** (40) - Stability lever
5. **IPC Message Batching** (16.7) - Performance lever (smallest impact but feasible)

## Recommendation for Phase 4
**Selected**: #2 TypeScript Strict Mode Expansion
- **Why**: Highest impact on future safety, zero runtime risk, medium effort
- **Secondary**: #8 API Documentation Sync (very high score, pair with TS strict for adjacent value)
- **Validation**: TS strict can be enable incrementally, doc sync is parallel work
- **Proof**: Before/after: warning count (TS) + doc validation (docs)

