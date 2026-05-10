import { describe, expect, it } from 'vitest';

import { routeChatToolInvocation } from '../chatToolRouter';

describe('chatToolRouter', () => {
  it('route un outil connu vers template avec raison template_only', () => {
    const decision = routeChatToolInvocation('deep_reflection');

    expect(decision.toolId).toBe('deep_reflection');
    expect(decision.invocationType).toBe('template');
    expect(decision.shouldSendAsTemplate).toBe(true);
    expect(decision.reasonCode).toBe('template_only');
    expect(decision.canDegradeToTemplate).toBe(true);
  });

  it('garde un fallback honnête pour un outil inconnu', () => {
    const decision = routeChatToolInvocation('tool_not_registered');

    expect(decision.toolId).toBe('tool_not_registered');
    expect(decision.invocationType).toBe('template');
    expect(decision.reasonCode).toBe('unknown_tool');
    expect(decision.capability.proof.failureReasonCode).toBe('unknown_tool');
    expect(decision.userVisibleMessage).toContain('Outil inconnu');
  });
});
