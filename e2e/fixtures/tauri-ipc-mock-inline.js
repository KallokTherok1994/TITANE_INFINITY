/**
 * Tauri IPC Mock - Inline Version for Playwright addInitScript
 * 
 * This is a self-contained version that can be injected via page.addInitScript()
 * It provides mock responses for Tauri backend commands.
 */

(function () {
  const ENABLE_LOGS = false;
  const MOCK_LATENCY = 30;

  console.log('[TauriMock] 🔧 Installing Tauri IPC mocks...');

  // Mock data generators
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
            ],
          },
        ],
      },
      stats: {
        total_nodes: 6,
        total_size: 21504,
        max_depth: 3,
      },
    };
  }

  function mockMemoryNode(nodeId) {
    return {
      id: nodeId || 'mock-node',
      name: 'Memory Node ' + (nodeId || 'mock'),
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

  async function mockChatResponse(message) {
    const responseText =
      'Mock AI response to: "' +
      message +
      '". This is a simulated response for E2E testing. TITANE∞ Cognitive OS is operational.';

    return {
      success: true,
      message: {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
        model: 'gemma2:2b',
        tokens: responseText.split(' ').length,
      },
    };
  }

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

  // Command router
  async function handleTauriCommand(command, args) {
    if (ENABLE_LOGS) {
      console.log('[TauriMock] invoke:', command, args);
    }

    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));

    // Memory commands
    if (command === 'get_memory_state' || command === 'memory::get_tree_state') {
      return mockMemoryTreeState();
    }

    if (command === 'get_memory_node' || command === 'memory::get_memory_node') {
      return mockMemoryNode(args?.nodeId);
    }

    // Chat commands
    if (command === 'send_message' || command === 'orchestrator::send_message') {
      return mockChatResponse(args?.message || 'test');
    }

    if (command === 'get_conversation_history') {
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

    // Audio commands
    if (command === 'set_volume' || command === 'audio::set_volume') {
      return { success: true, volume: args?.volume || 0.5 };
    }

    if (command === 'get_audio_config' || command === 'audio::get_audio_config') {
      return mockAudioConfig();
    }

    // Governance commands
    if (command === 'get_ia_policies' || command === 'governance::get_ia_policies') {
      return {
        policies: [
          {
            id: 'policy-001',
            name: 'Data Privacy Policy',
            enabled: true,
            rules: ['No PII in logs'],
          },
        ],
        total: 1,
      };
    }

    if (command === 'get_permission_matrix') {
      return {
        roles: [
          { id: 'owner', name: 'Owner', permissions: ['*'] },
          { id: 'admin', name: 'Admin', permissions: ['read', 'write'] },
        ],
        total: 2,
      };
    }

    if (command === 'get_security_log') {
      return {
        entries: [
          {
            id: 'log-001',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            level: 'INFO',
            event: 'User login',
            user: 'Kevin Thibault',
          },
        ],
        total: 1,
      };
    }

    // System commands
    if (command === 'check_system_integrity') {
      return { status: 'ok', issues: [] };
    }

    // Default: return success
    if (ENABLE_LOGS) {
      console.warn('[TauriMock] Unhandled command:', command);
    }
    return { success: true, mock: true, command };
  }

  // Install mock on window.__TAURI__
  window.__TAURI__ = {
    core: {
      invoke: handleTauriCommand,
    },
    event: {
      listen: async function (event, handler) {
        if (ENABLE_LOGS) {
          console.log('[TauriMock] listen:', event);
        }
        // Return unlisten function
        return function () {
          if (ENABLE_LOGS) {
            console.log('[TauriMock] unlisten:', event);
          }
        };
      },
      emit: async function (event, payload) {
        if (ENABLE_LOGS) {
          console.log('[TauriMock] emit:', event, payload);
        }
      },
    },
  };

  console.log('[TauriMock] ✅ Tauri IPC mocks installed successfully');
})();
