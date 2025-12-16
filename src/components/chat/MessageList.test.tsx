/**
 * TITANE∞ v19.2Ω — MessageList regression tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import '@testing-library/jest-dom/vitest';
import { MessageList } from './MessageList';

const buildMessage = (content: string) => ({
  role: 'assistant' as const,
  content,
  timestamp: Date.now(),
  metadata: { uiId: `test-${content}` },
});

describe('MessageList', () => {
  it('re-renders when message content changes without length change', () => {
    const initialMessages = [buildMessage('Initial content')];

    const { rerender } = render(
      <MessageList messages={initialMessages} isLoading={false} error={null} />
    );

    expect(screen.getByText('Initial content')).toBeInTheDocument();

    const updatedMessages = [buildMessage('Updated content')];
    rerender(<MessageList messages={updatedMessages} isLoading={false} error={null} />);

    expect(screen.getByText('Updated content')).toBeInTheDocument();
    expect(screen.queryByText('Initial content')).not.toBeInTheDocument();
  });
});
