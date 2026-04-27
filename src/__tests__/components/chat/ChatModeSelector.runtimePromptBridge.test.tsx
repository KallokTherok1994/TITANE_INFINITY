import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { ChatModeSelector } from '@/components/chat/ChatModeSelector';
import { getSystemPrompt } from '@/config/chatModes.config';
import { CHAT_MODES_CONFIG, type ChatModeId } from '@/services/ai/chatModes.config';

describe('ChatModeSelector -> runtime prompt bridge', () => {
  it('routes a modern UI mode selection to the unified runtime prompt resolver', () => {
    let selectedMode: ChatModeId | null = null;
    let resolvedPrompt = '';

    render(
      <ChatModeSelector
        currentMode="default"
        userPermissionLevel={3}
        onModeChange={mode => {
          selectedMode = mode;
          resolvedPrompt = getSystemPrompt(mode);
        }}
      />
    );

    fireEvent.click(screen.getByTestId('chat-mode-selector-trigger'));
    fireEvent.click(screen.getByTestId('chat-mode-option-quick'));

    expect(selectedMode).toBe('quick');
    expect(resolvedPrompt).toBe(CHAT_MODES_CONFIG.quick.systemPrompt);
  });

  it('exposes stable selector test ids for governed UI proofs', () => {
    const onModeChange = vi.fn();

    render(
      <ChatModeSelector
        currentMode="default"
        userPermissionLevel={3}
        onModeChange={onModeChange}
      />
    );

    expect(screen.getByTestId('chat-mode-selector')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('chat-mode-selector-trigger'));
    expect(screen.getByTestId('chat-mode-selector-menu')).toBeInTheDocument();
    expect(screen.getByTestId('chat-mode-option-quick')).toBeInTheDocument();
  });

  it('keeps the compact selector variant stable for the canonical conversation surface', () => {
    const onModeChange = vi.fn();

    render(
      <ChatModeSelector
        currentMode="default"
        userPermissionLevel={3}
        variant="compact"
        allowedModes={['default', 'planning', 'journal']}
        onModeChange={onModeChange}
      />
    );

    const select = screen.getByTestId('chat-mode-selector-select');
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'planning' } });

    expect(onModeChange).toHaveBeenCalledWith('planning');
  });
});
