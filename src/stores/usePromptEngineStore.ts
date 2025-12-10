/**
 * TITANE∞ vΩ∞ — PROMPT ENGINE STORE
 * Super Prompt #7: Zustand Store pour le Prompt Engine
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Prompt,
  PromptCategory,
  PromptChainStep,
  PromptContext,
  CompiledPrompt,
} from '@/types/promptEngine';

// ============================================================================
// INTERNAL TYPES
// ============================================================================

interface InternalPromptChain {
  id: string;
  name: string;
  description?: string;
  steps: PromptChainStep[];
  stopOnError: boolean;
  maxIterations: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface PromptStats {
  totalPrompts: number;
  byCategory: Record<PromptCategory, number>;
  totalChains: number;
  compilationsCount: number;
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface PromptEngineState {
  // Core State
  prompts: Prompt[];
  chains: InternalPromptChain[];
  compiledPrompts: Map<string, CompiledPrompt>;

  // Active context
  activeContext: PromptContext | null;

  // Status
  isInitialized: boolean;
  isCompiling: boolean;
  isLoading: boolean;
  error: string | null;

  // Stats
  stats: PromptStats;
}

interface PromptEngineActions {
  // Initialization
  initialize: () => Promise<void>;
  reset: () => void;

  // Prompts CRUD
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => string;
  getPrompt: (id: string) => Prompt | undefined;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  getPromptsByCategory: (category: PromptCategory) => Prompt[];

  // Chains
  createChain: (name: string, steps: PromptChainStep[]) => string;
  getChain: (id: string) => InternalPromptChain | undefined;
  deleteChain: (id: string) => void;

  // Compilation
  compilePrompt: (
    promptId: string,
    context: PromptContext
  ) => Promise<CompiledPrompt | null>;
  clearCompiled: () => void;

  // Context
  setContext: (context: PromptContext) => void;
  clearContext: () => void;

  // Stats
  updateStats: () => void;

  // Error handling
  setError: (error: string | null) => void;
}

type PromptEngineStore = PromptEngineState & PromptEngineActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialStats: PromptStats = {
  totalPrompts: 0,
  byCategory: {
    system: 0,
    persona: 0,
    task: 0,
    context: 0,
    format: 0,
    safety: 0,
  },
  totalChains: 0,
  compilationsCount: 0,
};

const initialState: PromptEngineState = {
  prompts: [],
  chains: [],
  compiledPrompts: new Map(),
  activeContext: null,
  isInitialized: false,
  isCompiling: false,
  isLoading: false,
  error: null,
  stats: initialStats,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const usePromptEngineStore = create<PromptEngineStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        // ========== Initialization ==========
        initialize: async () => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            set(state => {
              state.isInitialized = true;
              state.isLoading = false;
            });
            get().updateStats();
          } catch (error) {
            set(state => {
              state.isLoading = false;
              state.error =
                error instanceof Error ? error.message : "Erreur d'initialisation";
            });
          }
        },

        reset: () => {
          set(initialState);
        },

        // ========== Prompts CRUD ==========
        addPrompt: promptData => {
          const id = `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
          const now = Date.now();

          const newPrompt: Prompt = {
            ...promptData,
            id,
            createdAt: now,
            updatedAt: now,
          };

          set(state => {
            state.prompts.push(newPrompt);
          });

          get().updateStats();
          return id;
        },

        getPrompt: id => {
          return get().prompts.find(p => p.id === id);
        },

        updatePrompt: (id, updates) => {
          set(state => {
            const index = state.prompts.findIndex(p => p.id === id);
            if (index !== -1) {
              state.prompts[index] = {
                ...state.prompts[index],
                ...updates,
                updatedAt: Date.now(),
              };
            }
          });
          get().updateStats();
        },

        deletePrompt: id => {
          set(state => {
            state.prompts = state.prompts.filter(p => p.id !== id);
          });
          get().updateStats();
        },

        getPromptsByCategory: category => {
          return get().prompts.filter(p => p.category === category);
        },

        // ========== Chains ==========
        createChain: (name, steps) => {
          const id = `chain_${Date.now()}`;
          const now = Date.now();

          const chain: InternalPromptChain = {
            id,
            name,
            steps,
            stopOnError: true,
            maxIterations: 10,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          };

          set(state => {
            state.chains.push(chain);
          });

          get().updateStats();
          return id;
        },

        getChain: id => {
          return get().chains.find(c => c.id === id);
        },

        deleteChain: id => {
          set(state => {
            state.chains = state.chains.filter(c => c.id !== id);
          });
          get().updateStats();
        },

        // ========== Compilation ==========
        compilePrompt: async (promptId, context) => {
          const prompt = get().getPrompt(promptId);
          if (!prompt) return null;

          set(state => {
            state.isCompiling = true;
          });

          try {
            let compiled = prompt.template;

            if (prompt.variables) {
              for (const variable of prompt.variables) {
                if (variable.defaultValue !== undefined) {
                  compiled = compiled.replace(
                    new RegExp(`{{${variable.name}}}`, 'g'),
                    String(variable.defaultValue)
                  );
                }
              }
            }

            const compiledPrompt: CompiledPrompt = {
              id: `compiled_${promptId}_${Date.now()}`,
              originalPromptId: promptId,
              content: compiled,
              context,
              compiledAt: Date.now(),
              tokenCount: Math.ceil(compiled.length / 4),
            };

            set(state => {
              state.compiledPrompts.set(promptId, compiledPrompt);
              state.isCompiling = false;
              state.stats.compilationsCount += 1;
            });

            return compiledPrompt;
          } catch (error) {
            set(state => {
              state.isCompiling = false;
              state.error =
                error instanceof Error ? error.message : 'Erreur de compilation';
            });
            return null;
          }
        },

        clearCompiled: () => {
          set(state => {
            state.compiledPrompts.clear();
          });
        },

        // ========== Context ==========
        setContext: context => {
          set(state => {
            state.activeContext = context;
          });
        },

        clearContext: () => {
          set(state => {
            state.activeContext = null;
          });
        },

        // ========== Stats ==========
        updateStats: () => {
          const { prompts, chains } = get();

          const byCategory: Record<PromptCategory, number> = {
            system: 0,
            persona: 0,
            task: 0,
            context: 0,
            format: 0,
            safety: 0,
          };

          prompts.forEach(p => {
            byCategory[p.category]++;
          });

          set(state => {
            state.stats = {
              ...state.stats,
              totalPrompts: prompts.length,
              byCategory,
              totalChains: chains.length,
            };
          });
        },

        // ========== Error Handling ==========
        setError: error => {
          set(state => {
            state.error = error;
          });
        },
      }))
    ),
    { name: 'prompt-engine-store' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectPrompts = (state: PromptEngineStore) => state.prompts;
export const selectChains = (state: PromptEngineStore) => state.chains;
export const selectActiveContext = (state: PromptEngineStore) => state.activeContext;
export const selectIsCompiling = (state: PromptEngineStore) => state.isCompiling;
export const selectStats = (state: PromptEngineStore) => state.stats;
export const selectError = (state: PromptEngineStore) => state.error;

export default usePromptEngineStore;
