import { useTranslation } from 'react-i18next';
import { LiveRegion, ScreenReaderOnly } from '@/a11y';
import { useState } from 'react';

export function ChatWindow() {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAnnouncement(t('chat.sending'));

    try {
      // ...existing code...
      setAnnouncement(t('chat.sent_success'));
    } catch (error) {
      setAnnouncement(t('errors.network_error'));
    }
  }

  return (
    <div className="chat-window">
      <header role="banner">
        <h1 id="chat-title">{t('app.name')}</h1>
        <ScreenReaderOnly>{t('app.tagline')}</ScreenReaderOnly>
      </header>

      <main role="main" aria-labelledby="chat-title">
        <div role="log" aria-label={t('chat.messages_label')} aria-live="polite">
          {/* ...existing code... */}
        </div>
      </main>

      <footer role="contentinfo">
        <form role="search" aria-label={t('chat.send_message')} onSubmit={handleSubmit}>
          <label htmlFor="message-input" className="sr-only">
            {t('chat.input_placeholder')}
          </label>
          <input
            id="message-input"
            type="text"
            placeholder={t('chat.input_placeholder')}
            aria-required="true"
            aria-describedby="input-hint"
          />
          <span id="input-hint" className="sr-only">
            {t('chat.input_hint')}
          </span>
          <button type="submit" aria-label={t('chat.send_button')}>
            {t('chat.send_button')}
          </button>
        </form>
      </footer>

      <LiveRegion message={announcement} />
    </div>
  );
}
