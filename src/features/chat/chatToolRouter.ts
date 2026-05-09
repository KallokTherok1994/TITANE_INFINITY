import {
  getChatToolCapability,
  type ChatToolCapability,
  type ChatToolInvocationType,
} from './chatToolCapabilities';

export interface ChatToolRouteDecision {
  toolId: string;
  capability: ChatToolCapability;
  invocationType: ChatToolInvocationType;
  shouldSendAsTemplate: boolean;
  canDegradeToTemplate: boolean;
  userVisibleMessage: string;
  reasonCode: string;
}

export function routeChatToolInvocation(toolId: string): ChatToolRouteDecision {
  const capability = getChatToolCapability(toolId);

  if (!capability) {
    return {
      toolId,
      capability: {
        id: toolId,
        invocationType: 'template',
        requires: {
          tauri: false,
          web: false,
          memory: false,
          provider: false,
          skillId: null,
        },
        proof: {
          expectedTraceField: 'templateText',
          successReasonCode: 'template_only',
          failureReasonCode: 'unknown_tool',
        },
        fallback: {
          userVisibleMessage:
            'Outil inconnu: la voie sûre retombe sur un prompt template.',
          canDegradeToTemplate: true,
        },
      },
      invocationType: 'template',
      shouldSendAsTemplate: true,
      canDegradeToTemplate: true,
      userVisibleMessage: 'Outil inconnu: la voie sûre retombe sur un prompt template.',
      reasonCode: 'unknown_tool',
    };
  }

  return {
    toolId,
    capability,
    invocationType: capability.invocationType,
    shouldSendAsTemplate: capability.invocationType === 'template',
    canDegradeToTemplate: capability.fallback.canDegradeToTemplate,
    userVisibleMessage: capability.fallback.userVisibleMessage,
    reasonCode: capability.proof.successReasonCode,
  };
}
