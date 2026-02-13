/**
 * Tauri IPC Mock for E2E Tests
 * 
 * Provides realistic mock responses for Tauri backend commands
 * when running E2E tests without a real Tauri dev server.
 * 
 * Coverage:
 * - Memory Tree Viewer: memory::get_tree_state, get_memory_node
 * - OMEGA Pipeline: orchestrator::send_message, chat interactions
 * - Audio Center: audio::set_volume, get_audio_config
 */

export interface TauriMockConfig {
  enableLogs?: boolean;
  mockLatency?: number; // Simulate network latency (ms)
}

const DEFAULT_CONFIG: TauriMockConfig = {
  enableLogs: false,
  mockLatency: 50,
};

/**
 * Install Tauri IPC mocks on window.__TAURI__
 */
export function installTauriMocks(config: TauriMockConfig = {}): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Mock Tauri core API
  (window as any).__TAURI__ = {
    core: {
      invoke: async (command: string, args?: any) => {
        if (cfg.enableLogs) {
          console.log('[TauriMock] invoke:', command, args);
        }

        // Simulate latency
        await new Promise((resolve) => setTimeout(resolve, cfg.mockLatency));

        // Route to appropriate handler
        return handleTauriCommand(command, args, cfg);
      },
    },
    // Mock event system (for streaming responses)
    event: {
      listen: async (event: string, handler: (e: any) => void) => {
        if (cfg.enableLogs) {
          console.log('[TauriMock] listen:', event);
        }
        // Return unlisten function
        return () => {
          if (cfg.enableLogs) {
            console.log('[TauriMock] unlisten:', event);
          }
        };
      },
      emit: async (event: string, payload?: any) => {
        if (cfg.enableLogs) {
          console.log('[TauriMock] emit:', event, payload);
        }
      },
    },
  };

  if (cfg.enableLogs) {
    console.log('[TauriMock] ✅ Tauri IPC mocks installed');
  }
}

/**
 * Route Tauri commands to mock handlers
 */
function handleTauriCommand(
  command: string,
  args: any,
  cfg: TauriMockConfig
): Promise<any> {
  // Memory Tree Viewer commands
  if (command === 'get_memory_state' || command === 'memory::get_tree_state') {
    return Promise.resolve(mockMemoryTreeState());
  }

  if (command === 'get_memory_node' || command === 'memory::get_memory_node') {
    return Promise.resolve(mockMemoryNode(args?.nodeId));
  }

  // OMEGA Pipeline / Chat commands
  if (command === 'send_message' || command === 'orchestrator::send_message') {
    return mockChatResponse(args?.message, cfg);
  }

  if (command === 'get_conversation_history') {
    return Promise.resolve(mockConversationHistory());
  }

  // Audio Center commands
  if (command === 'set_volume' || command === 'audio::set_volume') {
    return Promise.resolve({ success: true, volume: args?.volume || 0.5 });
  }

  if (command === 'get_audio_config' || command === 'audio::get_audio_config') {
    return Promise.resolve(mockAudioConfig());
  }

  // Governance commands
  if (command === 'get_ia_policies' || command === 'governance::get_ia_policies') {
    return Promise.resolve(mockIAPolicies());
  }

  if (command === 'get_permission_matrix') {
    return Promise.resolve(mockPermissionMatrix());
  }

  if (command === 'get_security_log') {
    return Promise.resolve(mockSecurityLog());
  }

  // System commands
  if (command === 'get_system_info') {
    return Promise.resolve(mockSystemInfo());
  }

  if (command === 'check_system_integrity') {
    return Promise.resolve({ status: 'ok', issues: [] });
  }

  // Default: return success
  console.warn('[TauriMock] Unhandled command:', command);
  return Promise.resolve({ success: true, mock: true, command });
}

// ============================================================================
// Mock Data Generators
// ============================================================================

/**
 * Mock memory tree state (D3 hierarchy format)
 */
function mockMemoryTreeState() {
  return {
    disk_mode: 'ReadWrite',
    synthetic: false,
    tree: {
      id: 'root',
      name: 'TITAN Root Memory',
      type: 'root',
      created_at: new Date().toISOString(),
      children: [
        {
          id: 'stm-001',
          name: 'Short-Term Memory',
          type: 'stm',
          size: 1024,
          children: [
            {
              id: 'stm-001-a',
              name: 'Recent Chat Context',
              type: 'context',
              size: 512,
              children: [],
            },
            {
              id: 'stm-001-b',
              name: 'Active Tasks',
              type: 'task',
              size: 256,
              children: [],
            },
          ],
        },
        {
          id: 'mtm-001',
          name: 'Medium-Term Memory',
          type: 'mtm',
          size: 4096,
          children: [
            {
              id: 'mtm-001-a',
              name: 'Session Knowledge',
              type: 'knowledge',
              size: 2048,
              children: [],
            },
          ],
        },
        {
          id: 'ltm-001',
          name: 'Long-Term Memory',
          type: 'ltm',
          size: 16384,
          children: [
            {
              id: 'ltm-001-a',
              name: 'User Preferences',
              type: 'preference',
              size: 1024,
              children: [],
            },
            {
              id: 'ltm-001-b',
              name: 'Historical Patterns',
              type: 'pattern',
              size: 8192,
              children: [],
            },
          ],
        },
      ],
    },
    stats: {
      total_nodes: 8,
      total_size: 21504,
      max_depth: 3,
    },
  };
}

/**
 * Mock memory node details
 */
function mockMemoryNode(nodeId?: string) {
  return {
    id: nodeId || 'mock-node',
    name: `Memory Node ${nodeId || 'mock'}`,
    type: 'context',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    size: 1024,
    content: 'Mock memory content for E2E testing',
    metadata: {
      source: 'e2e-test',
      confidence: 0.95,
      tags: ['test', 'mock'],
    },
  };
}

/**
 * Mock chat response with streaming (simulated)
 */
async function mockChatResponse(message: string, cfg: TauriMockConfig) {
  // Simulate streaming by emitting events
  const responseText = `Mock AI response to: "${message}". This is a simulated response for E2E testing. TITANE∞ Cognitive OS is operational.`;

  // Emit streaming tokens if event system available
  if ((window as any).__TAURI__?.event?.emit) {
    const words = responseText.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      (window as any).__TAURI__.event.emit('chat:token', {
        token: words[i] + ' ',
        done: i === words.length - 1,
      });
    }
  }

  return {
    success: true,
    message: {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
      model: 'gemma2:2b',
      tokens: responseText.split(' ').length,
    },
  };
}

/**
 * Mock conversation history
 */
function mockConversationHistory() {
  return {
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Hello TITANE',
        timestamp: new Date(Date.now() - 60000).toISOString(),
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'Hello! TITANE∞ Cognitive OS is ready.',
        timestamp: new Date(Date.now() - 55000).toISOString(),
        model: 'gemma2:2b',
      },
    ],
    total: 2,
  };
}

/**
 * Mock audio config
 */
function mockAudioConfig() {
  return {
    input_device: 'Default Microphone',
    output_device: 'Default Speaker',
    input_volume: 0.8,
    output_volume: 0.7,
    tts_enabled: true,
    tts_voice: 'en-US-Neural2-J',
    tts_speed: 1.0,
    stt_enabled: true,
    stt_language: 'en-US',
  };
}

/**
 * Mock IA policies
 */
function mockIAPolicies() {
  return {
    policies: [
      {
        id: 'policy-001',
        name: 'Data Privacy Policy',
        enabled: true,
        rules: ['No PII in logs', 'Encrypt all user data'],
      },
      {
        id: 'policy-002',
        name: 'AI Safety Policy',
        enabled: true,
        rules: ['No harmful content', 'Bias detection enabled'],
      },
    ],
    total: 2,
  };
}

/**
 * Mock permission matrix
 */
function mockPermissionMatrix() {
  return {
    roles: [
      { id: 'owner', name: 'Owner', permissions: ['*'] },
      { id: 'admin', name: 'Admin', permissions: ['read', 'write', 'execute'] },
      { id: 'user', name: 'User', permissions: ['read'] },
    ],
    total: 3,
  };
}

/**
 * Mock security log
 */
function mockSecurityLog() {
  return {
    entries: [
      {
        id: 'log-001',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        level: 'INFO',
        event: 'User login',
        user: 'Kevin Thibault',
      },
      {
        id: 'log-002',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        level: 'INFO',
        event: 'API key updated',
        user: 'Kevin Thibault',
      },
    ],
    total: 2,
  };
}

/**
 * Mock system info
 */
function mockSystemInfo() {
  return {
    os: 'Linux',
    arch: 'x86_64',
    version: '27.0.1',
    memory: {
      total: 16000000000,
      used: 8000000000,
      free: 8000000000,
    },
    cpu: {
      cores: 8,
      model: 'Mock CPU',
    },
  };
}
