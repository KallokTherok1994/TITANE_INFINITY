/**
 * TITANE∞ v30.0.0 — E2E UI Integration Tests
 * Tests for UI component integration and user interactions
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { BrowserRouter } from 'react-router-dom';
import { MessageList } from '../components/chat/MessageList';
import { TitanePage } from '../pages/TitanePage';
import Chat from '../ui/pages/Chat';
import { setupE2ETest, teardownE2ETest } from './e2e-setup';
import { createTestMessage } from './e2e-test-utils';

const renderCanonicalChat = () =>
  render(
    <BrowserRouter>
      <TitanePage />
    </BrowserRouter>
  );

describe('🟣 OMEGA Phase 7Ω - E2E: UI Integration Tests', () => {
  beforeEach(() => {
    setupE2ETest();
  });

  afterEach(() => {
    teardownE2ETest();
  });

  it('should render chat component without crashing', () => {
    const { container } = renderCanonicalChat();
    expect(container).toBeTruthy();
    expect(screen.getByTestId('page-conversation')).toBeTruthy();
  });

  it('should route the legacy Chat page export to the canonical conversation surface', () => {
    const { container } = render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    );

    expect(container).toBeTruthy();
    expect(screen.getByTestId('page-titane')).toHaveAttribute(
      'data-layout',
      'chat-fullscreen'
    );
    expect(screen.getByTestId('page-conversation')).toHaveAttribute(
      'data-layout',
      'fullscreen'
    );
  });

  it('should render message list with messages', () => {
    const messages = [
      createTestMessage('Hello', 'user'),
      createTestMessage('Hi there!', 'assistant'),
    ];

    const { container } = render(<MessageList messages={messages} />);
    expect(container).toBeTruthy();
    expect(screen.getByText('Hello')).toBeTruthy();
    expect(screen.getByText('Hi there!')).toBeTruthy();
  });

  it('should handle empty message list', () => {
    const { container } = render(<MessageList messages={[]} />);
    expect(container).toBeTruthy();
  });

  it('should handle user input in chat', async () => {
    const { container } = renderCanonicalChat();

    const input = screen.queryByTestId('chat-input');
    if (input) {
      fireEvent.change(input, { target: { value: 'Test message' } });
      expect((input as HTMLTextAreaElement).value).toBe('Test message');
    }
  });
});
