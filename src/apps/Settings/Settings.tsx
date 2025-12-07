import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Settings() {
  const { t } = useTranslation();

  return (
    <div className="settings" role="main" aria-labelledby="settings-title">
      <header>
        <h1 id="settings-title">{t('settings.title')}</h1>
      </header>

      <section aria-labelledby="general-settings">
        <h2 id="general-settings">{t('settings.general')}</h2>
        <LanguageSwitcher />
      </section>

      <section aria-labelledby="appearance-settings">
        <h2 id="appearance-settings">{t('settings.appearance')}</h2>
        {/* ...existing code... */}
      </section>
    </div>
  );
}
