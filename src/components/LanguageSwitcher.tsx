import React from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={e => i18n.changeLanguage(e.target.value)}
      aria-label="Select language"
      className="language-switcher"
    >
      <option value="fr">🇫🇷 Français</option>
      <option value="en">🇬🇧 English</option>
    </select>
  );
}
