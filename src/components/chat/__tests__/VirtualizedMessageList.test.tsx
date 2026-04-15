import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualizedMessageList } from '../VirtualizedMessageList';
import type { AIMessage } from '@/services/ai/types';

vi.mock('react-window', () => ({
  FixedSizeList: ({ itemCount, children }: any) => (
    <div data-testid="fixed-size-list">
      {Array.from({ length: itemCount }, (_, index) => (
        <div key={index}>{children({ index, style: {} })}</div>
      ))}
    </div>
  ),
}));

const buildMessages = (count: number, override?: Partial<AIMessage>): AIMessage[] =>
  Array.from({ length: count }, (_, index) => ({
    role: index % 2 === 0 ? 'user' : 'assistant',
    content: `Message ${index}`,
    timestamp: index + 1,
    ...override,
  }));

describe('VirtualizedMessageList', () => {
  it('garde la virtualisation pour un historique long avec messages courts', () => {
    render(<VirtualizedMessageList messages={buildMessages(60)} />);

    expect(screen.getByTestId('fixed-size-list')).toBeInTheDocument();
  });

  it('bascule vers la liste standard dès qu’un message long dépasserait la hauteur fixe', async () => {
    const longContent = 'Réponse très longue '.repeat(30).trim();
    const snippet = 'Réponse très longue Réponse très longue Réponse très longue';
    const messages = buildMessages(59);
    messages.push({
      role: 'assistant',
      content: longContent,
      timestamp: 999,
    });

    render(<VirtualizedMessageList messages={messages} />);

    expect(screen.queryByTestId('fixed-size-list')).not.toBeInTheDocument();
    expect((await screen.findAllByText('TITANE∞')).length).toBeGreaterThan(0);
    expect(document.body.textContent).toContain(snippet);
  });
});