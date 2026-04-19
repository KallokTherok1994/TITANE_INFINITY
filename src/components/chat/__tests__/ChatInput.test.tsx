import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../../services/ai/system', () => ({
  autoHealEngine: {
    heal: vi.fn(),
  },
}));

vi.mock('../FileUploadButton', () => ({
  FileUploadButton: () => null,
}));

vi.mock('../DictationButton', () => ({
  DictationButton: () => null,
}));

import { ChatInput } from '../ChatInput';

describe('ChatInput ultra-long prompt integrity', () => {
  it('accepts and sends a prompt longer than the former 10000-char hard limit', async () => {
    const onSend = vi.fn(async () => undefined);
    const ultraLongPrompt = `ULTRA-START ${'segment ultra long '.repeat(900)}ULTRA-MIDDLE ${'bloc final '.repeat(900)}ULTRA-END`;

    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    fireEvent.change(textarea, { target: { value: ultraLongPrompt } });

    expect(textarea).toHaveValue(ultraLongPrompt);
    expect(screen.queryByText(/limite de 10000 caractères atteinte/i)).not.toBeInTheDocument();

    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(onSend).toHaveBeenCalledWith(ultraLongPrompt);
    });

    expect(screen.getByText(/illimité/i)).toBeInTheDocument();
  });
});