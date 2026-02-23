# Feature Requests & Learnings from v27.0.5-prod

## High Priority (v27.1.0)

1. **Conversation Latency**: Phase 3 showed -3.4% improvement
   - Request: "Why is engine latency still 14ms when UI is 1200ms?"
   - Action: Profile UI rendering bottleneck in v27.1.0
   - Expected Gain: -5-8% UI latency

2. **Provider Isolation**: Phase 4 confirmed IPC working perfectly
   - Request: "Can we support multiple providers concurrently?"
   - Action: Design v27.1.0 provider abstraction layer
   - Expected Gain: User choice + better switching

3. **Governance Transparency**: Phase 6 audit showed system is autonomous
   - Request: "Show users which governance gates passed at deployment time"
   - Action: Add audit trail display to UI
   - Expected Gain: User confidence + authority transparency

## Medium Priority (v28.0.0)

1. **Canary Deployments**: Current: binary yes/no
   - Request: "Can releases be gradual (5% → 25% → 100%)?"
   - Action: Extend Phase 5 hotfix lane to canary capability
   - Expected Gain: Safer multi-wave rollout

2. **Rollback Self-Service**: Current: requires manual intervention
   - Request: "Let users themselves downgrade to v27.0.5"
   - Action: Build version history + downgrade mechanism
   - Expected Gain: User autonomy + reduced support load

3. **Custom Provider Support**: Current: only Tauri IPC
   - Request: "Support user-defined LLM endpoints"
   - Action: v28 provider ecosystem extension
   - Expected Gain: Enterprise flexibility

## Low Priority (Future)

1. Multi-language support (non-breaking)
2. Conversation history encryption (architectural)
3. Offline mode planning (Phase 1 rule already covers this)

---

**Input Source**: Implicit from successful phases 1-6
**Next Step**: Prioritize for v27.1.0 vs v28
