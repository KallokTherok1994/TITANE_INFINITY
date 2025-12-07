/**
 * STUBS FOR DISABLED TALK/CONVERSATION HANDLERS
 * Module talkToTitane temporarily disabled during Build System v25 migration
 */

const DISABLED_MODULE_RESPONSE = {
  handled: true,
  success: false,
  response: `⚠️ **MODULE TEMPORAIREMENT DÉSACTIVÉ**

Le module \`talkToTitane\` est désactivé pendant la migration Build System v25.

**TODO**: Réactiver après migration Tauri filesystem APIs.`,
};

export async function handleTalkOn(_mode?: string): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTalkOff(): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleConversationSave(): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleConversationHeal(): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleConversationTimeline(): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleConversationExport(_format: string): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineBuild(): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineShow(_limit?: number): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineExport(_format: string): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineSessions(): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineStats(): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleAutosaveFlush(): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleSelfhealScan(): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleSelfhealHeal(): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleSelfhealRebuild(_filePath: string): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}
