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

export async function handleTalkOn(mode?: string): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTalkOff(): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleConversationSave(): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleConversationHeal(): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleConversationTimeline(): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleConversationExport(format: string): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineBuild(): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineShow(limit?: number): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineExport(format: string): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineSessions(): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineStats(): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleAutosaveFlush(): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleSelfhealScan(): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleSelfhealHeal(): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleSelfhealRebuild(filePath: string): Promise<any> {
  return DISABLED_MODULE_RESPONSE;
}
