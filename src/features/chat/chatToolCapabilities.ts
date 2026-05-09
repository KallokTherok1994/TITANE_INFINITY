import { CHAT_TOOLS } from './chatToolsRegistry';

export type ChatToolInvocationType =
  | 'template'
  | 'local_action'
  | 'ipc_action'
  | 'web_action'
  | 'memory_action'
  | 'skill_route'
  | 'reflection_route'
  | 'diagnostic';

export interface ChatToolCapabilityRequires {
  tauri: boolean;
  web: boolean;
  memory: boolean;
  provider: boolean;
  skillId: string | null;
}

export interface ChatToolCapabilityProof {
  expectedTraceField?: string;
  successReasonCode: string;
  failureReasonCode: string;
}

export interface ChatToolCapabilityFallback {
  userVisibleMessage: string;
  canDegradeToTemplate: boolean;
}

export interface ChatToolCapability {
  id: string;
  invocationType: ChatToolInvocationType;
  requires: ChatToolCapabilityRequires;
  proof: ChatToolCapabilityProof;
  fallback: ChatToolCapabilityFallback;
}

function buildTemplateCapability(toolLabel: string): ChatToolCapability {
  return {
    id: toolLabel,
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
      failureReasonCode: 'runtime_action_unavailable',
    },
    fallback: {
      userVisibleMessage:
        'Cette surface ne déclenche pas d action runtime réelle; elle insère seulement un prompt gouverné.',
      canDegradeToTemplate: true,
    },
  };
}

export const CHAT_TOOL_CAPABILITIES = Object.fromEntries(
  CHAT_TOOLS.map(tool => [tool.id, buildTemplateCapability(tool.id)])
) as Record<(typeof CHAT_TOOLS)[number]['id'], ChatToolCapability>;

export function getChatToolCapability(toolId: string): ChatToolCapability | null {
  return CHAT_TOOL_CAPABILITIES[toolId as keyof typeof CHAT_TOOL_CAPABILITIES] ?? null;
}

export function listChatToolCapabilities(): ChatToolCapability[] {
  return CHAT_TOOLS.map(
    tool => CHAT_TOOL_CAPABILITIES[tool.id as keyof typeof CHAT_TOOL_CAPABILITIES]
  ).filter((capability): capability is ChatToolCapability => Boolean(capability));
}

export function isTemplateOnlyChatTool(toolId: string): boolean {
  return getChatToolCapability(toolId)?.invocationType === 'template';
}
