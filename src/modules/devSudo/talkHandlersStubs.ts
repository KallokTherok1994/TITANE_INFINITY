/**
 * STUBS FOR DISABLED TALK/CONVERSATION HANDLERS
 * Module talkToTitane temporarily disabled during Build System v25 migration
 */

const DISABLED_MODULE_RESPONSE = {
  handled: true,
  success: false,
  response: `⚠️ **MODULE TEMPORAIREMENT DÉSACTIVÉ**

Le module \`talkToTitane\` est désactivé pendant la migration Build System v25.

**REACTIVATION**: After Tauri v2.0 filesystem APIs migration complete
1. Update imports: Use @tauri-apps/plugin-fs instead of @tauri-apps/api/fs
2. Replace readTextFile/writeTextFile with new plugin methods
3. Test file operations: Verify permissions and path handling
4. Re-enable module: Remove stub and restore full functionality
5. Update tests: Ensure compatibility with new Tauri APIs`,
};

export async function handleTalkOn(any: any): Promise<unknown> {
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

export async function handleConversationExport(any: any): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineBuild(): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineShow(any: any): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}

export async function handleTimelineExport(any: any): Promise<unknown> {
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

export async function handleSelfhealRebuild(any: any): Promise<unknown> {
  return DISABLED_MODULE_RESPONSE;
}
