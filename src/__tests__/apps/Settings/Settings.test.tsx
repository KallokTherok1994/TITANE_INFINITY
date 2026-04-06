/**
 * Tests pour Settings Page
 * Coverage: Affichage, structure, i18n réelle
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { Settings } from '@/apps/Settings/Settings';
import { getI18n } from '@/i18n';

async function renderSettings(initialLanguage: 'fr' | 'en' = 'fr') {
  const i18n = await getI18n();
  await i18n.changeLanguage(initialLanguage);

  return {
    user: userEvent.setup(),
    i18n,
    ...render(
      <I18nextProvider i18n={i18n}>
        <Settings />
      </I18nextProvider>
    ),
  };
}

describe('Settings Page', () => {
  beforeEach(async () => {
    localStorage.clear();
    const i18n = await getI18n();
    await i18n.changeLanguage('fr');
  });

  describe('Rendering', () => {
    it('should render the settings page with translated French labels by default', async () => {
      await renderSettings();

      const title = screen.getByRole('heading', { name: 'Paramètres', level: 1 });
      expect(title).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Général', level: 2 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Apparence', level: 2 })
      ).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Langue' })).toHaveValue('fr');
    });

    it('should have correct ARIA structure', async () => {
      await renderSettings();
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-labelledby', 'settings-title');
    });

    it('should render the general settings section', async () => {
      await renderSettings();
      const section = screen.getByRole('heading', { name: 'Général', level: 2 });
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'general-settings');
    });

    it('should render the appearance settings section', async () => {
      await renderSettings();
      const section = screen.getByRole('heading', { name: 'Apparence', level: 2 });
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'appearance-settings');
    });
  });

  describe('Components Integration', () => {
    it('should render the real language switcher with a localized label', async () => {
      await renderSettings();
      const switcher = screen.getByRole('combobox', { name: 'Langue' });
      expect(switcher).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      await renderSettings();
      const h1 = screen.getAllByRole('heading', { level: 1 });
      const h2 = screen.getAllByRole('heading', { level: 2 });

      expect(h1).toHaveLength(1);
      expect(h2.length).toBeGreaterThanOrEqual(2);
    });

    it('should have semantic HTML structure', async () => {
      const { container } = await renderSettings();

      expect(container.querySelector('.settings')).toBeInTheDocument();
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelectorAll('section').length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Internationalization', () => {
    it('should switch the settings surface to English and persist the selected locale', async () => {
      const { user } = await renderSettings('fr');

      await user.selectOptions(screen.getByRole('combobox', { name: 'Langue' }), 'en');

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Settings', level: 1 })
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('heading', { name: 'General', level: 2 })
      ).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Language' })).toHaveValue('en');
      expect(localStorage.getItem('i18nextLng')).toBe('en');
    });

    it('should fall back to French translations when an unsupported locale is requested', async () => {
      const i18n = await getI18n();
      await i18n.changeLanguage('zz');

      expect(i18n.t('settings.title')).toBe('Paramètres');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', async () => {
      const { container } = await renderSettings();
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
