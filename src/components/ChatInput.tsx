import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LiveRegion } from '@/a11y/ScreenReader';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!message.trim() || isLoading) return;

    setAnnouncement(t('common.loading'));
    setIsLoading(true);

    try {
      await onSend(message);
      setMessage('');
      setAnnouncement(t('chat.message_sent'));
    } catch (error) {
      setAnnouncement(t('errors.unknown_error'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      className="chat-input"
      onSubmit={handleSubmit}
      role="search"
      aria-label={t('chat.input_label')}
    >
      <label htmlFor="message-input" className="sr-only">
        {t('chat.input_placeholder')}
      </label>

      <textarea
        id="message-input"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={t('chat.input_placeholder')}
        disabled={disabled || isLoading}
        aria-required="true"
        aria-describedby="input-hint"
        rows={3}
      />

      <span id="input-hint" className="sr-only">
        {t('chat.input_hint')}
      </span>

      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        aria-label={t('chat.send_button')}
      >
        {isLoading ? t('common.loading') : t('chat.send_button')}
      </button>

      <LiveRegion message={announcement} priority="polite" />
    </form>
  );
}
