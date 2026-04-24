/**
 * TITANE∞ v31.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * SPRINT 4 - Context & Test Standardization Reference
 * 
 * Status: PLANNING & DOCUMENTATION
 * Target: Standardize React Context patterns and test coverage
 * 
 * Current State Analysis:
 * - LoggingContext.tsx (exists)
 * - AnimationContext.tsx (exists)
 * - LoggingContext.test.tsx (1 test)
 * - Inconsistent patterns across contexts
 * - Missing test coverage for most contexts
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * SPRINT 4 Objectives
 */
export const SPRINT_4_OBJECTIVES = {
  // Phase 1: Context Standardization
  context_standards: {
    pattern: 'React.Context + Custom Hook',
    requirements: [
      'TypeScript strict mode types',
      'Default value handling',
      'Consumer provider pattern',
      'useContext error boundaries',
      'Memoization for performance',
    ],
  },

  // Phase 2: Test Coverage
  test_coverage: {
    target: '70% lines, 60% branches',
    test_types: ['unit', 'integration', 'hooks'],
    required_test_files: [
      'LoggingContext.test.tsx',
      'AnimationContext.test.tsx',
      // Additional contexts as identified
    ],
  },

  // Phase 3: Documentation
  documentation: {
    guide: 'docs/CONTEXT_PATTERNS.md',
    examples: 'docs/examples/context-usage.tsx',
    migration: 'SPRINT_4_CONTEXT_MIGRATION.md',
  },
};

/**
 * Standard Context Template (v31.2.0)
 */
export const STANDARD_CONTEXT_TEMPLATE = `
import React, { createContext, useContext, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────

interface MyContextValue {
  // State
  state: string;
  
  // Actions
  setState: (value: string) => void;
}

// ─────────────────────────────────────────────────────────────────
// CONTEXT CREATION
// ─────────────────────────────────────────────────────────────────

const MyContext = createContext<MyContextValue | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────
// PROVIDER COMPONENT
// ─────────────────────────────────────────────────────────────────

export function MyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = React.useState('initial');

  const value: MyContextValue = {
    state,
    setState,
  };

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────
// CUSTOM HOOK
// ─────────────────────────────────────────────────────────────────

export function useMyContext(): MyContextValue {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}
`;

/**
 * Standard Test Template (Vitest)
 */
export const STANDARD_TEST_TEMPLATE = `
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MyProvider, useMyContext } from './MyContext';

describe('MyContext', () => {
  describe('useMyContext', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useMyContext());
      }).toThrow('useMyContext must be used within MyProvider');
    });

    it('should provide initial state', () => {
      const { result } = renderHook(() => useMyContext(), {
        wrapper: MyProvider,
      });

      expect(result.current.state).toBe('initial');
    });

    it('should update state', () => {
      const { result } = renderHook(() => useMyContext(), {
        wrapper: MyProvider,
      });

      act(() => {
        result.current.setState('updated');
      });

      expect(result.current.state).toBe('updated');
    });
  });
});
`;

/**
 * Checklist for Context Implementation
 */
export const CONTEXT_IMPLEMENTATION_CHECKLIST = [
  '[ ] Type definitions are exported',
  '[ ] Context has default undefined value',
  '[ ] Provider component validates children',
  '[ ] Custom hook has error boundary',
  '[ ] Value is memoized (React.useMemo)',
  '[ ] Provider is typed properly',
  '[ ] Tests cover happy path',
  '[ ] Tests cover error cases',
  '[ ] Tests cover state updates',
  '[ ] Documentation has usage example',
];

export const SPRINT_4_INFO = {
  sprint: 'SPRINT 4',
  objective: 'Context & Test Standardization',
  target_audit: 'LOW-02, LOW-03 (testing and patterns)',
  estimated_duration: '1.5 weeks',
  deliverables: [
    'Standardized LoggingContext',
    'Standardized AnimationContext',
    'Complete test coverage (70%+)',
    'CONTEXT_PATTERNS.md guide',
    'Migration checklist for other contexts',
  ],
  next_sprint: 'SPRINT 5 - Performance Optimization',
};
