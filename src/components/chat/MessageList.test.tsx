/**
 * TITANE∞ v24.3.0 — MessageList regression tests
 * v24.3.0: Use waitFor for lazy-loaded markdown content
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test-utils';
import '@testing-library/jest-dom/vitest';
import { MessageList } from './MessageList';

const buildMessage = (content: string) => ({
  role: 'assistant' as const,
  content,
  timestamp: Date.now(),
  metadata: { uiId: `test-${content}` },
});

describe('MessageList', () => {
  it('re-renders when message content changes without length change', async () => {
    const initialMessages = [buildMessage('Initial content')];

    const { rerender } = render(
      <MessageList messages={initialMessages} isLoading={false} error={null} />
    );

    // Wait for lazy-loaded markdown to render
    await waitFor(() => {
      expect(screen.getByText('Initial content')).toBeInTheDocument();
    });

    const updatedMessages = [buildMessage('Updated content')];
    rerender(<MessageList messages={updatedMessages} isLoading={false} error={null} />);

    // Wait for updated content
    await waitFor(() => {
      expect(screen.getByText('Updated content')).toBeInTheDocument();
    });
    expect(screen.queryByText('Initial content')).not.toBeInTheDocument();
  });
});
