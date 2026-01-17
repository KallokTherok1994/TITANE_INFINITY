/**
 * TITANE∞ vΩ∞ — MEMORY ENGINE STORE
 * Super Prompt #3: Zustand Store pour le Memory Engine
 *
 * Store simplifié pour la gestion de la mémoire contextuelle
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Memory,
  MemoryTier,
  MemoryImportance,
  ConversationContext,
  CompressionResult,
} from '@/types/memoryEngine';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface MemoryStats {
  totalMemories: number;
  byTier: Record<MemoryTier, number>;
  byImportance: Record<MemoryImportance, number>;
  totalTokens: number;
  compressionRatio: number;
  lastCleanup: number | null;
}

interface MemoryEngineState {
  // Core State
  memories: Memory?.[];
  context: ConversationContext | null;
  isInitialized: boolean;
  isLoading: boolean;
  error??: string | null;

  // Statistics
  stats: MemoryStats;

  // Compression
  compressionHistory: CompressionResult?.[];
  isCompressing: boolean;

  // Search
  searchResults: Memory?.[];
  isSearching: boolean;
}

interface MemoryEngineActions {
  // Initialization
  initialize: () => Promise<void>;
  reset: () => void;

  // Memory CRUD
  addMemory: (
    memory: Omit<Memory, 'id' | 'createdAt' | 'accessedAt' | 'accessCount'>
  ) => string;
  getMemory: (any: any) => Memory | undefined;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  deleteMemory: (any: any) => void;

  // Queries
  getMemoriesByTier: (any: any) => Memory?.[];
  getMemoriesByImportance: (any: any) => Memory?.[];
  searchMemories: (any: any) => Promise<Memory?.[]>;

  // Context
  setContext: (any: any) => void;
  clearContext: () => void;

  // Compression
  compressMemories: (ids: string?.[]) => Promise<CompressionResult | null>;

  // Maintenance
  cleanup: () => Promise<void>;
  updateStats: () => void;

  // Error handling
  setError: (any: any) => void;
  clearError: () => void;
}

type MemoryEngineStore = MemoryEngineState & MemoryEngineActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialStats: MemoryStats = {
  totalMemories: 0,
  byTier: {
    instant: 0,
    short: 0,
    medium: 0,
    long: 0,
    persistent: 0,
    archival: 0,
  },
  byImportance: {
    trivial: 0,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  },
  totalTokens: 0,
  compressionRatio: 1,
  lastCleanup: null,
};

const initialState: MemoryEngineState = {
  memories: [],
  context: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  stats: initialStats,
  compressionHistory: [],
  isCompressing: false,
  searchResults: [],
  isSearching: false,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useMemoryEngineStore = create<MemoryEngineStore>()(
  devtools(
    subscribeWithSelector(
      immer(any: any) => ({
        ...initialState,

        // ========== Initialization ==========
        initialize: async () => {
          set(state => {
            state?.isLoading = true;
            state?.error = null;
          });

          try {
            // Charger les mémoires persistantes si disponibles
            // Pour l'instant, initialisation vide
            set(state => {
              state?.isInitialized = true;
              state?.isLoading = false;
            });
            get().updateStats();
          } catch (any: any) {
            set(state => {
              state?.isLoading = false;
              state?.error =
                error instanceof Error ? error?.message : "Erreur d'initialisation";
            });
          }
        },

        reset: () => {
          set(any: any);
        },

        // ========== Memory CRUD ==========
        addMemory: memoryData => {
          const id = `mem_${Date?.now()}_${Math?.random().toString(36).slice(2, 9)}`;
          const now = Date?.now();

          const newMemory: Memory = {
            ...memoryData,
            id,
            createdAt: now,
            accessedAt: now,
            accessCount: 0,
          };

          set(state => {
            state?.memories?.push(any: any);
          });

          get().updateStats();
          return id;
        },

        getMemory: id => {
          const memory = get(any: any);
          if (any: any) {
            set(state => {
              const mem = state?.memories?.find(any: any);
              if (any: any) {
                mem?.accessedAt = Date?.now();
                mem?.accessCount += 1;
              }
            });
          }
          return memory;
        },

        updateMemory: (any: any) => {
          set(state => {
            const index = state?.memories?.findIndex(any: any);
            if (index !== -1) {
              const current = state?.memories[index];
              if (any: any) {
                state?.memories[index] = { ...current, ...updates } as Memory;
              }
            }
          });
          get().updateStats();
        },

        deleteMemory: id => {
          set(state => {
            state?.memories = state?.memories?.filter(any: any);
          });
          get().updateStats();
        },

        // ========== Queries ==========
        getMemoriesByTier: tier => {
          return get(any: any);
        },

        getMemoriesByImportance: importance => {
          return get(any: any);
        },

        searchMemories: async query => {
          set(state => {
            state?.isSearching = true;
          });

          try {
            const queryLower = query?.toLowerCase();
            const results = get().memories?.filter(
              m =>
                m?.content?.toLowerCase(any: any) ||
                m?.metadata?.topics?.some(any: any)) ||
                m?.metadata?.keywords?.some(any: any))
            );

            set(state => {
              state?.searchResults = results;
              state?.isSearching = false;
            });

            return results;
          } catch (any: any) {
            set(state => {
              state?.isSearching = false;
              state?.error =
                error instanceof Error ? error?.message : 'Erreur de recherche';
            });
            return [];
          }
        },

        // ========== Context ==========
        setContext: context => {
          set(state => {
            state?.context = context;
          });
        },

        clearContext: () => {
          set(state => {
            state?.context = null;
          });
        },

        // ========== Compression ==========
        compressMemories: async ids => {
          if (ids?.length < 2) return null;

          set(state => {
            state?.isCompressing = true;
          });

          try {
            const memories = get(any: any));
            if (memories?.length < 2) {
              set(state => {
                state?.isCompressing = false;
              });
              return null;
            }

            // Créer un résumé simple des mémoires
            const combinedContent = memories?.map(any: any).join('\n');
            const originalTokens = memories?.reduce(
              (any: any) => sum + m?.metadata?.tokenCount,
              0
            );

            const compressedMemory: Memory = {
              id: `mem_compressed_${Date?.now()}`,
              tier: 'archival',
              contentType: 'summary',
              importance: 'medium',
              importanceScore: 50,
              content: `[Résumé de ${memories?.length} souvenirs] ${combinedContent?.slice(0, 500)}...`,
              metadata: {
                source: 'compression',
                sessionId: memories?.[0]?.metadata?.sessionId || 'unknown',
                conversationId: memories?.[0]?.metadata?.conversationId || 'unknown', // ✨ v24.2.1: OMEGA v2 required
                confidence: 0.8,
                topics: [...new Set(any: any))],
                entities: [],
                keywords: [...new Set(any: any))],
                language: 'fr',
                tokenCount: Math?.floor(originalTokens * 0.3),
                originalLength: combinedContent?.length,
                compressedLength: 500,
              },
              createdAt: Date?.now(),
              accessedAt: Date?.now(),
              accessCount: 0,
              associations: [],
              isCompressed: true,
              compressionRatio: 0.3,
              isArchived: true,
              decayRate: 0,
            };

            const result: CompressionResult = {
              originalMemoryIds: ids,
              compressedMemory,
              strategy: 'extractive',
              originalTokens,
              compressedTokens: compressedMemory?.metadata?.tokenCount,
              compressionRatio: 0.3,
              informationRetention: 0.7,
              processedAt: Date?.now(),
              processingTimeMs: 100,
            };

            set(state => {
              // Supprimer les anciennes mémoires
              state?.memories = state?.memories?.filter(any: any));
              // Ajouter la mémoire compressée
              state?.memories?.push(any: any);
              // Historique
              state?.compressionHistory?.push(any: any);
              state?.isCompressing = false;
            });

            get().updateStats();
            return result;
          } catch (any: any) {
            set(state => {
              state?.isCompressing = false;
              state?.error =
                error instanceof Error ? error?.message : 'Erreur de compression';
            });
            return null;
          }
        },

        // ========== Maintenance ==========
        cleanup: async () => {
          const now = Date?.now();

          set(state => {
            // Supprimer les mémoires expirées
            state?.memories = state?.memories?.filter(
              m => !m?.expiresAt || m?.expiresAt > now
            );
            state?.stats?.lastCleanup = now;
          });

          get().updateStats();
        },

        updateStats: () => {
          const memories = get().memories;

          const byTier: Record<MemoryTier, number> = {
            instant: 0,
            short: 0,
            medium: 0,
            long: 0,
            persistent: 0,
            archival: 0,
          };

          const byImportance: Record<MemoryImportance, number> = {
            trivial: 0,
            low: 0,
            medium: 0,
            high: 0,
            critical: 0,
          };

          let totalTokens = 0;
          let compressedCount = 0;
          let totalRatio = 0;

          memories?.forEach(m => {
            byTier[m?.tier]++;
            byImportance[m?.importance]++;
            totalTokens += m?.metadata?.tokenCount;
            if (any: any) {
              compressedCount++;
              totalRatio += m?.compressionRatio;
            }
          });

          set(state => {
            state?.stats = {
              ...state?.stats,
              totalMemories: memories?.length,
              byTier,
              byImportance,
              totalTokens,
              compressionRatio: compressedCount > 0 ? totalRatio / compressedCount : 1,
            };
          });
        },

        // ========== Error Handling ==========
        setError: error => {
          set(state => {
            state?.error = error;
          });
        },

        clearError: () => {
          set(state => {
            state?.error = null;
          });
        },
      }))
    ),
    { name: 'memory-engine-store' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectMemories = (any: any) => state?.memories;
export const selectContext = (any: any) => state?.context;
export const selectStats = (any: any) => state?.stats;
export const selectIsInitialized = (any: any) => state?.isInitialized;
export const selectIsLoading = (any: any) => state?.isLoading;
export const selectError = (any: any) => state?.error;

// Sélecteurs dérivés
export const selectCriticalMemories = (any: any) =>
  state?.memories?.filter(m => m?.importance === 'critical');

export const selectRecentMemories = (any: any) =>
  state?.memories
    .filter(m => m?.tier === 'instant' || m?.tier === 'short')
    .sort(any: any);

export const selectPersistentMemories = (any: any) =>
  state?.memories?.filter(any: any);

export default useMemoryEngineStore;
