import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChatProviderSelector } from '@/features/chat/ChatProviderSelector';

describe('ChatProviderSelector accessibility', () => {
  it('exposes an accessible name on the provider combobox', () => {
    const onChange = vi.fn();

    render(
      <ChatProviderSelector
        selectedProvider="auto"
        onChange={onChange}
        providers={[
          { id: 'ollama', name: 'Ollama', icon: '🦙', available: true },
          { id: 'openai', name: 'OpenAI', icon: '🤖', available: false },
        ]}
      />
    );

    const select = screen.getByRole('combobox', { name: 'Selection du provider IA' });

    expect(select).toBe(screen.getByTestId('select-chat-provider'));

    fireEvent.change(select, { target: { value: 'ollama' } });

    expect(onChange).toHaveBeenCalledWith('ollama');
  });
});