/**
 * TITANE∞ — Tool Calling Service
 * Exécute des outils/fonctions appelées par le modèle AI
 *
 * v26.4.0 (Sprint 6)
 */

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ToolDefinition {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * ToolCall result with execution details
 * Note: parseToolCalls() returns { name, arguments } only
 * Full ToolCall created during executeToolCall()
 */
export interface ToolCall {
  id: string;
  name: string;  // ✅ Aligned with types/conversation.ts
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT TOOLS
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_TOOLS: Record<string, ToolDefinition> = {
  // Web Search Tool
  web_search: {
    name: 'web_search',
    description: 'Search the web for information',
    parameters: {
      query: { type: 'string', description: 'Search query' },
      maxResults: { type: 'number', description: 'Maximum results to return', default: 5 },
    },
    execute: async (args) => {
      const { query = '', maxResults = 5 } = args as { query: string; maxResults?: number };
      // Implémentation stub - en production, appeler une API réelle
      console.log('[ToolCaller] web_search:', { query, maxResults });
      return {
        results: [
          { title: `Result for "${query}"`, url: 'https://example.com', snippet: 'Placeholder result' },
        ],
      };
    },
  },

  // Calculator Tool
  calculate: {
    name: 'calculate',
    description: 'Perform mathematical calculations',
    parameters: {
      expression: { type: 'string', description: 'Mathematical expression (e.g., "2+2*3")' },
    },
    execute: async (args) => {
      const { expression = '' } = args as { expression: string };
      try {
        // Security: Only allow safe math operations
        // In production, use a proper expression parser
        const allowedPattern = /^[0-9+\-*/(). ]+$/;
        if (!allowedPattern.test(expression)) {
          throw new Error('Invalid expression: only numbers and basic operators allowed');
        }
        
        // ✅ #2: Add timeout protection (1s) to prevent infinite loops
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Expression evaluation timeout (1s)')), 1000)
        );
        
        const evalPromise = Promise.resolve(
          // eslint-disable-next-line no-eval
          Function(`"use strict"; return (${expression})`)()
        );
        
        const result = await Promise.race([evalPromise, timeoutPromise]);
        console.log('[ToolCaller] calculate:', { expression, result });
        return { result, expression };
      } catch (error) {
        console.error('[ToolCaller] calculate error:', error);
        throw error;
      }
    },
  },

  // Get Current Time
  get_time: {
    name: 'get_time',
    description: 'Get the current date and time',
    parameters: {},
    execute: async () => {
      const now = new Date();
      const result = {
        iso: now.toISOString(),
        locale: now.toLocaleString('fr-FR'),
        timestamp: now.getTime(),
      };
      console.log('[ToolCaller] get_time:', result);
      return result;
    },
  },

  // Get Weather (stub)
  get_weather: {
    name: 'get_weather',
    description: 'Get weather information for a location',
    parameters: {
      location: { type: 'string', description: 'City name or coordinates' },
      unit: { type: 'string', description: 'Temperature unit (C or F)', default: 'C' },
    },
    execute: async (args) => {
      const { location = '', unit = 'C' } = args as { location: string; unit?: string };
      // Implémentation stub - en production, appeler OpenWeather API ou similaire
      console.log('[ToolCaller] get_weather:', { location, unit });
      return {
        location,
        temperature: 20,
        unit,
        condition: 'Partly cloudy',
        humidity: 65,
        windSpeed: 10,
      };
    },
  },

  // Get Stock Info (stub)
  get_stock: {
    name: 'get_stock',
    description: 'Get stock price and information',
    parameters: {
      ticker: { type: 'string', description: 'Stock ticker symbol (e.g., AAPL)' },
    },
    execute: async (args) => {
      const { ticker = '' } = args as { ticker: string };
      // Implémentation stub - en production, appeler un service de données financières
      console.log('[ToolCaller] get_stock:', { ticker });
      return {
        ticker,
        price: 150.25,
        change: 2.5,
        changePercent: 1.7,
        high: 152.0,
        low: 149.5,
      };
    },
  },
};

// ═══════════════════════════════════════════════════════════════════
// TOOL CALLER SERVICE
// ═══════════════════════════════════════════════════════════════════

export class ToolCallerService {
  private tools: Map<string, ToolDefinition>;
  private callHistory: ToolCall[] = [];
  private readonly MAX_HISTORY = 1000; // ✅ #1: Prevent memory leak

  constructor(customTools: Record<string, ToolDefinition> = {}) {
    this.tools = new Map(Object.entries({ ...DEFAULT_TOOLS, ...customTools }));
  }

  /**
   * Ajoute un outil personnalisé
   * ✅ #3: Validate tool definition before registering
   */
  registerTool(tool: ToolDefinition): void {
    // Validation
    if (!tool.name) {
      throw new Error('Tool must have a name');
    }
    if (typeof tool.execute !== 'function') {
      throw new Error(`Tool ${tool.name} must have an execute function`);
    }
    if (this.tools.has(tool.name)) {
      console.warn(`[ToolCaller] Tool ${tool.name} already registered, overwriting`);
    }
    
    this.tools.set(tool.name, tool);
    console.log(`[ToolCaller] ✅ Tool registered: ${tool.name}`);
  }

  /**
   * Obtient la liste des outils disponibles (pour le système prompt)
   */
  getToolDescriptions(): string {
    const tools = Array.from(this.tools.values());
    return tools
      .map(
        (tool) => `
- **${tool.name}**: ${tool.description}
  Parameters: ${JSON.stringify(tool.parameters || {})}
`
      )
      .join('\n');
  }

  /**
   * Parse les appels d'outils depuis le texte du modèle
   * Format principal (recommandé): JSON objets
   * {"tool_name": "get_time"}
   * {"tool_name": "calculate", "expression": "123*456"}
   */
  parseToolCalls(text: string): Array<{ name: string; arguments: Record<string, unknown> }> {
    const calls: Array<{ name: string; arguments: Record<string, unknown> }> = [];
    console.log('[ToolCaller] 🔍 PARSING TEXT:', text.substring(0, 200)); // DEBUG: afficher début du texte

    // Format 1 (PRIMARY): JSON objects - {"tool_name": "...", "arg": "value"}
    const jsonObjRegex = /\{\s*"tool_name"\s*:\s*"([^"]+)"([^}]*)\}/g;
    let match: RegExpExecArray | null;
    let jsonFound = 0;
    
    while ((match = jsonObjRegex.exec(text)) !== null) {
      jsonFound++;
      const toolName = match[1] ?? '';
      const argsStr = match[2] ?? '';
      const args: Record<string, unknown> = {};
      
      console.log(`[ToolCaller] ✅ JSON MATCH #${jsonFound}: tool_name=${toolName}, argsStr=${argsStr}`); // DEBUG
      
      // Parse JSON properties: "key": "value"
      if (argsStr) {
        const propRegex = /"([^"]+)"\s*:\s*(?:"([^"]*)"|([^,}]+))/g;
        let propMatch: RegExpExecArray | null;
        while ((propMatch = propRegex.exec(argsStr)) !== null) {
          const key = propMatch[1] ?? '';
          const strValue = propMatch[2] ?? '';
          const numValue = propMatch[3] ?? '';
          if (key && key !== 'tool_name') {
            const value = numValue && !isNaN(Number(numValue)) ? Number(numValue) : strValue;
            args[key] = value;
            console.log(`[ToolCaller]   → arg: ${key}=${value}`); // DEBUG: afficher chaque arg
          }
        }
      }
      
      if (toolName) {
        calls.push({ name: toolName, arguments: args });
        console.log('[ToolCaller] ✨ TOOL CALL PARSED:', { toolName, arguments: args });
      }
    }

    if (jsonFound === 0) {
      console.log('[ToolCaller] ⚠️  NO JSON MATCHES FOUND'); // DEBUG: aucun JSON trouvé
    }

    // Format 2 (LEGACY XML): <tool name="..." args /> - backward compatibility
    const xmlRegex = /<tool\s+name="([^"]+)"([^>]*)\/>/g;
    let xmlFound = 0;
    while ((match = xmlRegex.exec(text)) !== null) {
      xmlFound++;
      const name = match[1] ?? '';
      const argsStr = match[2] ?? '';
      const args: Record<string, unknown> = {};

      console.log(`[ToolCaller] 📦 XML LEGACY MATCH #${xmlFound}: name=${name}`); // DEBUG

      // Parse attributes: key="value" key2="value2"
      if (argsStr) {
        const attrRegex = /(\w+)="([^"]*)"/g;
        let attrMatch: RegExpExecArray | null;
        while ((attrMatch = attrRegex.exec(argsStr)) !== null) {
          const key = attrMatch[1] ?? '';
          const value = attrMatch[2] ?? '';
          if (key) args[key] = value;
        }
      }

      if (name) {
        calls.push({ name, arguments: args });
        console.log('[ToolCaller] 📦 LEGACY XML TOOL PARSED:', { name, arguments: args });
      }
    }

    if (xmlFound === 0 && jsonFound === 0) {
      console.log('[ToolCaller] 🚨 ZERO TOOLS PARSED - model did not generate tool calls'); // DEBUG
    }

    console.log(`[ToolCaller] 📋 FINAL RESULT: ${calls.length} tools parsed (${jsonFound} JSON + ${xmlFound} XML)`);
    return calls;
  }

  /**
   * Exécute un appel d'outil
   */
  async executeToolCall(
    toolName: string,
    arguments_: Record<string, unknown>
  ): Promise<{ result: unknown; error?: string }> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      const error = `Tool "${toolName}" not found. Available tools: ${Array.from(this.tools.keys()).join(', ')}`;
      console.error('[ToolCaller]', error);
      return { result: null, error };
    }

    try {
      console.log(`[ToolCaller] Executing ${toolName}:`, arguments_);
      const result = await tool.execute(arguments_);

      // Store in history with memory limit
      this.callHistory.push({
        id: `tool_${Date.now()}_${Math.random()}`,
        name: toolName,
        arguments: arguments_,
        result,
        timestamp: Date.now(),
      });
      
      // ✅ #1: Enforce MAX_HISTORY limit - remove oldest if needed
      if (this.callHistory.length > this.MAX_HISTORY) {
        this.callHistory.shift();
        console.log(`[ToolCaller] ⚠️ History limit reached (${this.MAX_HISTORY}), removed oldest entry`);
      }

      return { result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ToolCaller] Error executing ${toolName}:`, errorMessage);

      // Store error in history
      this.callHistory.push({
        id: `tool_${Date.now()}_${Math.random()}`,
        name: toolName,
        arguments: arguments_,
        error: errorMessage,
        timestamp: Date.now(),
      });

      return { result: null, error: errorMessage };
    }
  }

  /**
   * Exécute plusieurs appels d'outils en parallèle
   */
  async executeToolCalls(
    calls: Array<{ name: string; arguments: Record<string, unknown> }>
  ): Promise<Array<{ toolName: string; result: unknown; error?: string }>> {
    const results = await Promise.all(
      calls.map((call) => this.executeToolCall(call.name, call.arguments))
    );
    return results.map((result, idx) => {
      const call = calls[idx];
      if (!call) return { toolName: 'unknown', result: null };
      return {
        toolName: call.name,
        ...result,
      };
    });
  }

  /**
   * Obtient l'historique des appels d'outils
   */
  getCallHistory(): ToolCall[] {
    return this.callHistory;
  }

  /**
   * Formate un appel d'outil pour inclusion dans la réponse
   */
  formatToolResult(toolName: string, result: unknown, error?: string): string {
    if (error) {
      return `\n\n**Tool Error (${toolName}):** ${error}`;
    }

    return `\n\n**Tool Result (${toolName}):**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════

let toolCallerInstance: ToolCallerService | null = null;

export function getToolCaller(customTools?: Record<string, ToolDefinition>): ToolCallerService {
  if (!toolCallerInstance) {
    toolCallerInstance = new ToolCallerService(customTools);
  }
  return toolCallerInstance;
}

export default ToolCallerService;
