import { afterEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { scoreBlockingChecks } from '../../../../evals/harness/scorer';
import { evaluateGates } from '../../../../evals/harness/gates';
import {
  getOrchestratorModulePath,
  buildEvalPrompt,
  runLane,
  createRealGenerator,
  shouldUseDirectOllamaEvalPath,
} from '../../../../evals/harness/evalRunner';
import type { DatasetItem } from '../../../../evals/harness/types';

function makeItem(
  id: string,
  lane: DatasetItem['lane'],
  blocking_checks: string[]
): DatasetItem {
  return {
    id,
    lane,
    bucket: 'regression_test',
    version: 'v1',
    date: '2026-04-05',
    input: 'synthetic eval item',
    required_context: 'none',
    expected_behavior: 'pass structural checks',
    blocking_checks,
    rubric_notes: 'test fixture',
  };
}

describe('eval harness structural checks', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses the direct Ollama path for CLI evals outside Tauri', () => {
    expect(shouldUseDirectOllamaEvalPath('ollama')).toBe(true);
    expect(shouldUseDirectOllamaEvalPath('gemini')).toBe(false);
  });

  it('can generate through direct Ollama in CLI eval mode', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: 'Réponse réelle Ollama',
        model: 'gemma2:2b',
        prompt_eval_count: 12,
        eval_count: 18,
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const generator = createRealGenerator('ollama', 'gemma2:2b');
    const result = await generator.generate('Bonjour', 'memory=context');

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.provider).toBe('ollama');
    expect(result.model).toBe('gemma2:2b');
    expect(result.response).toContain('Réponse réelle Ollama');
  });

  it('implements lane C regression guard checks', () => {
    const item = makeItem('C-TEST', 'C', [
      'provider_badge_equals_meta_provider_used',
      'conversation_id_uses_canonical_key',
      'health_source_is_backend',
      'backend_confirmed_before_state_update',
      'mode_persists_across_reload',
    ]);

    const results = scoreBlockingChecks(item, 'structural evidence');

    expect(results).toHaveLength(5);
    expect(results.every(result => result.passed)).toBe(true);
    expect(results.some(result => result.evidence.includes('Unknown check'))).toBe(false);
  });

  it('implements lane E stability guard checks', () => {
    const item = makeItem('E-TEST', 'E', [
      'all_3_pass',
      'ipc_shape_identical',
      'provider_label_consistent',
      'all_3_complete',
      'recalled_matches_saved',
      'injection_confirmed',
      'all_3_launch',
      'health_from_backend_all_3',
      'no_crash',
    ]);

    const results = scoreBlockingChecks(item, 'stability evidence');

    expect(results).toHaveLength(9);
    expect(results.every(result => result.passed)).toBe(true);
    expect(results.some(result => result.evidence.includes('Unknown check'))).toBe(false);
  });

  it('injects required eval context into the real prompt', () => {
    const prompt = buildEvalPrompt(
      'Rappelle-moi de quoi parle mon projet principal.',
      'memory_from_turn1: project=TITANE_INFINITY'
    );

    expect(prompt).toContain('Authoritative eval context:');
    expect(prompt).toContain('memory_from_turn1: project=TITANE_INFINITY');
    expect(prompt).toContain('do not fabricate');
  });

  it('marks fallback-provider runs as BLOCKED', async () => {
    const item = makeItem('A-FALLBACK', 'A', ['response_not_empty']);
    const generator = {
      name: 'ollama/gemma2:2b',
      async generate() {
        return {
          response: 'Fallback local response',
          provider: 'titane-local',
          model: 'titane-local',
          latencyMs: 1,
          tokensUsed: 1,
        };
      },
    };

    const result = await runLane('A', [item], generator, 1000);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.verdict).toBe('BLOCKED');
    expect(result.items[0]?.errors[0]).toContain('Requested provider ollama unavailable');
  });

  it('resolves the real orchestrator module inside this workspace', () => {
    const orchestratorPath = getOrchestratorModulePath();

    expect(orchestratorPath).toContain('/TITANE_INFINITY/src/services/ai/orchestrator.ts');
    expect(existsSync(orchestratorPath)).toBe(true);
  });

  it('uses BLOCKED for failed promotion gates', () => {
    const report = evaluateGates([], [], null, null);

    expect(report.allBlockingPassed).toBe(false);
    expect(report.verdict).toBe('BLOCKED');
  });
});
