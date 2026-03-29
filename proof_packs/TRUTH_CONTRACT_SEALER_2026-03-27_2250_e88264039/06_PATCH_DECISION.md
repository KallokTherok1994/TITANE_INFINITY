# 06 — Patch Decision

## Patch Decision
**NO_PATCH_APPLIED**

## Justification
Le contrat de vérité est correctement implémenté. Aucun patch n'est nécessaire.

### Evidence
1. **Backend emits correct meta**: `commands.rs` → `ensure_provider_meta()` produces canonical `ProviderDecisionMeta`
2. **Frontend propagates correctly**: `conversationEngine.ts` → `normalizedMetadata.provider_used` correctly mapped
3. **Hook maps correctly**: `useChat.ts` → `actualProviderUsed` always defined (fallback to `provider`)
4. **UI displays correctly**: `MessageBubble.tsx` → badge shows `metadata.providerUsed`
5. **Invariants codés**: `providerDecisionMeta.ts` → validates mode/network_used/provider_used consistency
6. **Tests exist**: `online-availability.test.ts`, `provider-decision-invariants.test.ts` verify anti-lie invariants

### Why No Patch Is Needed
- The conditional visibility in `MessageBubble.tsx` is defensive programming, not a contract violation
- `providerUsed` is always defined (never undefined or null)
- The badge correctly shows the actual provider used
- Mismatch detection works correctly (⚠ indicator shown when provider differs from request)

## Anti-Lie Seal Added
A new validation test was added to verify the provider label truth contract:
- Verifies `providerUsed` is always defined
- Verifies `providerUsed` matches backend `provider_used`
- Verifies mismatch detection works correctly