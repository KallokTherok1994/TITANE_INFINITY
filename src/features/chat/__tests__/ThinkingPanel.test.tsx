import { fireEvent, render, screen } from '@/test-utils';
import { describe, expect, it } from 'vitest';

import { ThinkingPanel } from '../ThinkingPanel';

describe('ThinkingPanel runtime truth', () => {
  it('renders captured runtime values instead of placeholder labels', () => {
    render(
      <ThinkingPanel
        isThinking={false}
        compact={false}
        state="done"
        provider="Ollama (OMEGA+Singularity)"
        modeLabel="LOCAL"
        elapsedTime={1.5}
        searchLabel="2 sources inline capturees"
        saveLabel="Sauvegarde persistante validee"
        qualityScore={0.78}
        xpTrace={{
          chatXP: 120,
          cognitiveXP: 25,
          totalXP: 145,
          level: 1,
          chatGainAmount: 8,
          cognitiveGainAmount: 5,
          totalGainAmount: 13,
          lastGainDomain: 'chat',
          lastGainAmount: 8,
          lastGainTimestamp: 1713431040000,
        }}
        memoryTrace={{
          injected: true,
          savedAfter: true,
          systemPromptSources: ['route:/titane?tab=conversation', 'memory:present'],
        }}
        reasoningSummary="Le contexte runtime a ete injecte puis la reponse a ete generee."
        modelUsed="gemma2:2b"
        modelRequested="gemma2:2b"
        steps={[
          {
            id: 'step-1',
            type: 'analysis',
            content: 'Analyse du contexte conversationnel',
            status: 'done',
            timestamp: 1713431040000,
          },
        ]}
      />
    );

    const progress = screen.getByTestId('reasoning-progress');
    expect(progress).toHaveAttribute('data-runtime-mode', 'LOCAL');
    expect(progress).toHaveAttribute('data-runtime-duration', '1.5s');
    expect(progress).toHaveAttribute('data-runtime-search', '2 sources inline capturees');
    expect(progress).toHaveAttribute(
      'data-runtime-save',
      'Sauvegarde persistante validee'
    );
    expect(progress).toHaveAttribute(
      'data-runtime-sources',
      '2 sources contexte injectees'
    );
    expect(progress).toHaveAttribute('data-runtime-quality', '78%');
    expect(progress).toHaveAttribute('data-runtime-xp-gain', '13');
    expect(progress).toHaveAttribute('data-model-used', 'gemma2:2b');
    expect(progress).toHaveAttribute('data-model-requested', 'gemma2:2b');

    fireEvent.click(screen.getByTestId('reasoning-progress'));
    fireEvent.click(screen.getByText('Détaillé'));

    expect(screen.getByText('LOCAL')).toBeInTheDocument();
    expect(screen.getByTestId('reasoning-runtime-mode')).toHaveTextContent('LOCAL');
    expect(screen.getByText('1.5s')).toBeInTheDocument();
    expect(screen.getByTestId('reasoning-runtime-duration')).toHaveTextContent('1.5s');
    expect(screen.getByTestId('reasoning-summary-model')).toHaveAttribute(
      'data-model-used',
      'gemma2:2b'
    );
    expect(screen.getByTestId('reasoning-runtime-model')).toHaveTextContent('gemma2:2b');
    expect(screen.getByTestId('reasoning-runtime-model')).toHaveAttribute(
      'data-model-requested',
      'gemma2:2b'
    );
    expect(screen.getByText(/Sauvegarde persistante validee/i)).toBeInTheDocument();
    expect(screen.getByTestId('reasoning-memory-save')).toHaveTextContent(
      /Sauvegarde persistante validee/i
    );
    expect(screen.getAllByText(/2 sources inline capturees/i)).toHaveLength(2);
    expect(screen.getByTestId('reasoning-memory-search')).toHaveTextContent(
      /2 sources inline capturees/i
    );
    expect(screen.getAllByText(/2 sources contexte injectees/i)).toHaveLength(2);
    expect(screen.getByTestId('reasoning-memory-sources')).toHaveTextContent(
      /2 sources contexte injectees/i
    );
    expect(screen.getByTestId('reasoning-summary-xp')).toHaveTextContent(/\+8 XP/i);
    expect(screen.getByTestId('reasoning-summary-xp')).toHaveTextContent(/\+5 XP/i);
    expect(screen.getByTestId('reasoning-runtime-xp')).toHaveTextContent(/\+8 XP/i);
    expect(screen.getByTestId('reasoning-runtime-xp')).toHaveTextContent(/\+5 XP/i);
    expect(screen.getByTestId('reasoning-runtime-xp-total')).toHaveTextContent(
      /\+13 XP/i
    );
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByTestId('reasoning-runtime-quality')).toHaveTextContent('78%');
    expect(
      screen.queryByText(/NON CAPTURE|NON DISPONIBLE|NON INSTRUMENTE|Inconnu/i)
    ).toBeNull();
  });
});
