/**
 * TITANE INFINITY - Search & Tools Engine Store
 * Copyright (c) 2024 MUSIC music music company music music music music music music
 * MIT License
 *
 * Super Prompt #6 - Store Layer (D)
 * Zustand store for unified search and tools management
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  SearchQuery,
  SearchResult,
  SearchScope,
  SearchType,
  Tool,
  ToolId,
  ToolExecution,
} from '@/types/searchTools';

// =============================================================================
// STATE INTERFACE
// =============================================================================

interface SearchToolsState {
  // Initialization
  isInitialized: boolean;
  isSearching: boolean;

  // Search State
  currentQuery: SearchQuery | null;
  searchHistory: SearchQuery[];
  results: SearchResult[];

  // Tools State
  tools: Tool[];
  activeExecutions: ToolExecution[];
  executionHistory: ToolExecution[];

  // Settings
  defaultScope: SearchScope[];
  defaultType: SearchType;
  maxResults: number;

  // UI State
  ui: {
    showAdvancedFilters: boolean;
    selectedResultId: string | null;
    selectedToolId: ToolId | null;
    view: 'search' | 'tools' | 'history';
    sidebarOpen: boolean;
  };

  // Loading States
  loading: {
    search: boolean;
    tools: boolean;
    execution: boolean;
  };

  // Error State
  error: Error | null;
}

// =============================================================================
// ACTIONS INTERFACE
// =============================================================================

interface SearchToolsActions {
  // Initialization
  initialize: () => Promise<void>;

  // Search Actions
  search: (text: string, options?: Partial<SearchQuery>) => Promise<SearchResult[]>;
  cancelSearch: () => void;
  clearResults: () => void;
  selectResult: (resultId: string | null) => void;
  addToHistory: (query: SearchQuery) => void;
  clearHistory: () => void;

  // Filter Actions
  setDefaultScope: (scopes: SearchScope[]) => void;
  setDefaultType: (type: SearchType) => void;
  setMaxResults: (max: number) => void;

  // Tool Actions
  loadTools: () => Promise<void>;
  executeTool: (toolId: ToolId, input: Record<string, unknown>) => Promise<ToolExecution>;
  cancelExecution: (executionId: string) => void;
  selectTool: (toolId: ToolId | null) => void;

  // UI Actions
  setView: (view: SearchToolsState['ui']['view']) => void;
  toggleSidebar: () => void;
  toggleAdvancedFilters: () => void;

  // Error Actions
  setError: (error: Error | null) => void;
  clearError: () => void;

  // Utility Actions
  reset: () => void;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: SearchToolsState = {
  isInitialized: false,
  isSearching: false,

  currentQuery: null,
  searchHistory: [],
  results: [],

  tools: [],
  activeExecutions: [],
  executionHistory: [],

  defaultScope: ['workspace', 'memory'],
  defaultType: 'semantic',
  maxResults: 50,

  ui: {
    showAdvancedFilters: false,
    selectedResultId: null,
    selectedToolId: null,
    view: 'search',
    sidebarOpen: true,
  },

  loading: {
    search: false,
    tools: false,
    execution: false,
  },

  error: null,
};

// =============================================================================
// STORE CREATION
// =============================================================================

export const useSearchToolsStore = create<SearchToolsState & SearchToolsActions>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          ...initialState,

          // ===========================================================
          // INITIALIZATION
          // ===========================================================

          initialize: async () => {
            if (get().isInitialized) return;

            try {
              await get().loadTools();

              set(state => {
                state.isInitialized = true;
              });
            } catch (error) {
              set(state => {
                state.error = error as Error;
              });
            }
          },

          // ===========================================================
          // SEARCH ACTIONS
          // ===========================================================

          search: async (text, options = {}) => {
            const query: SearchQuery = {
              id: `sq_${Date.now()}`,
              text,
              scope: options.scope || get().defaultScope,
              type: options.type || get().defaultType,
              filters: options.filters,
              limit: options.limit || get().maxResults,
              offset: options.offset || 0,
            };

            set(state => {
              state.currentQuery = query;
              state.isSearching = true;
              state.loading.search = true;
              state.error = null;
            });

            try {
              // Perform search via Tauri
              const results: SearchResult[] = [];

              set(state => {
                state.results = results;
                state.isSearching = false;
                state.loading.search = false;
              });

              get().addToHistory(query);

              return results;
            } catch (error) {
              set(state => {
                state.isSearching = false;
                state.loading.search = false;
                state.error = error as Error;
              });
              return [];
            }
          },

          cancelSearch: () => {
            set(state => {
              state.isSearching = false;
              state.loading.search = false;
              state.currentQuery = null;
            });
          },

          clearResults: () => {
            set(state => {
              state.results = [];
              state.ui.selectedResultId = null;
            });
          },

          selectResult: resultId => {
            set(state => {
              state.ui.selectedResultId = resultId;
            });
          },

          addToHistory: query => {
            set(state => {
              state.searchHistory.unshift(query);
              if (state.searchHistory.length > 100) {
                state.searchHistory = state.searchHistory.slice(0, 100);
              }
            });
          },

          clearHistory: () => {
            set(state => {
              state.searchHistory = [];
            });
          },

          // ===========================================================
          // FILTER ACTIONS
          // ===========================================================

          setDefaultScope: scopes => {
            set(state => {
              state.defaultScope = scopes;
            });
          },

          setDefaultType: type => {
            set(state => {
              state.defaultType = type;
            });
          },

          setMaxResults: max => {
            set(state => {
              state.maxResults = max;
            });
          },

          // ===========================================================
          // TOOL ACTIONS
          // ===========================================================

          loadTools: async () => {
            set(state => {
              state.loading.tools = true;
            });

            try {
              // Load tools from Tauri backend
              console.log('Loading tools...');

              set(state => {
                state.loading.tools = false;
              });
            } catch (error) {
              set(state => {
                state.loading.tools = false;
                state.error = error as Error;
              });
            }
          },

          executeTool: async (toolId, input) => {
            const execution: ToolExecution = {
              id: `te_${Date.now()}`,
              toolId,
              input,
              status: 'pending',
              startedAt: Date.now(),
            };

            set(state => {
              state.activeExecutions.push(execution);
              state.loading.execution = true;
              state.error = null;
            });

            try {
              // Execute tool via Tauri
              console.log('Executing tool:', toolId);

              const completedExecution: ToolExecution = {
                ...execution,
                status: 'success',
                completedAt: Date.now(),
                durationMs: Date.now() - execution.startedAt,
              };

              set(state => {
                state.activeExecutions = state.activeExecutions.filter(
                  e => e.id !== execution.id
                );
                state.executionHistory.unshift(completedExecution);
                state.loading.execution = false;
              });

              return completedExecution;
            } catch (error) {
              const failedExecution: ToolExecution = {
                ...execution,
                status: 'failed',
                error: (error as Error).message,
                completedAt: Date.now(),
                durationMs: Date.now() - execution.startedAt,
              };

              set(state => {
                state.activeExecutions = state.activeExecutions.filter(
                  e => e.id !== execution.id
                );
                state.executionHistory.unshift(failedExecution);
                state.loading.execution = false;
                state.error = error as Error;
              });

              return failedExecution;
            }
          },

          cancelExecution: executionId => {
            set(state => {
              const execution = state.activeExecutions.find(e => e.id === executionId);
              if (execution) {
                state.activeExecutions = state.activeExecutions.filter(
                  e => e.id !== executionId
                );
                state.executionHistory.unshift({
                  ...execution,
                  status: 'failed',
                  error: 'Cancelled',
                  completedAt: Date.now(),
                });
              }
            });
          },

          selectTool: toolId => {
            set(state => {
              state.ui.selectedToolId = toolId;
            });
          },

          // ===========================================================
          // UI ACTIONS
          // ===========================================================

          setView: view => {
            set(state => {
              state.ui.view = view;
            });
          },

          toggleSidebar: () => {
            set(state => {
              state.ui.sidebarOpen = !state.ui.sidebarOpen;
            });
          },

          toggleAdvancedFilters: () => {
            set(state => {
              state.ui.showAdvancedFilters = !state.ui.showAdvancedFilters;
            });
          },

          // ===========================================================
          // ERROR ACTIONS
          // ===========================================================

          setError: error => {
            set(state => {
              state.error = error;
            });
          },

          clearError: () => {
            set(state => {
              state.error = null;
            });
          },

          // ===========================================================
          // UTILITY ACTIONS
          // ===========================================================

          reset: () => {
            set(() => ({ ...initialState }));
          },
        })),
        {
          name: 'titane-search-tools-store',
          version: 1,
          partialize: state => ({
            searchHistory: state.searchHistory.slice(0, 50),
            defaultScope: state.defaultScope,
            defaultType: state.defaultType,
            maxResults: state.maxResults,
          }),
        }
      )
    ),
    { name: 'SearchToolsStore' }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const searchToolsSelectors = {
  isInitialized: (state: SearchToolsState) => state.isInitialized,
  isSearching: (state: SearchToolsState) => state.isSearching,
  currentQuery: (state: SearchToolsState) => state.currentQuery,
  results: (state: SearchToolsState) => state.results,
  tools: (state: SearchToolsState) => state.tools,
  activeExecutions: (state: SearchToolsState) => state.activeExecutions,
  executionHistory: (state: SearchToolsState) => state.executionHistory,
  error: (state: SearchToolsState) => state.error,
  currentView: (state: SearchToolsState) => state.ui.view,
  sidebarOpen: (state: SearchToolsState) => state.ui.sidebarOpen,
};

export default useSearchToolsStore;
