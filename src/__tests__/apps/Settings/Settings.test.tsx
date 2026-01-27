/**
 * Tests pour Settings Page
 * Coverage: Affichage, Navigation, I18n
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Settings } from '@/apps/Settings/Settings';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'fr',
    },
  }),
}));

// Mock LanguageSwitcher
vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}));

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render settings page with title', () => {
      render(<Settings />);
      
      // Vérifier titre principal
      const title = screen.getByRole('heading', { name: 'settings.title', level: 1 });
      expect(title).toBeInTheDocument();
    });

    it('should have correct ARIA structure', () => {
      render(<Settings />);
      
      // Vérifier role main
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-labelledby', 'settings-title');
    });

    it('should render general settings section', () => {
      render(<Settings />);
      
      const section = screen.getByRole('heading', { name: 'settings.general', level: 2 });
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'general-settings');
    });

    it('should render appearance settings section', () => {
      render(<Settings />);
      
      const section = screen.getByRole('heading', { name: 'settings.appearance', level: 2 });
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'appearance-settings');
    });
  });

  describe('Components Integration', () => {
    it('should render LanguageSwitcher component', () => {
      render(<Settings />);
      
      const switcher = screen.getByTestId('language-switcher');
      expect(switcher).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Settings />);
      
      const h1 = screen.getAllByRole('heading', { level: 1 });
      const h2 = screen.getAllByRole('heading', { level: 2 });
      
      expect(h1).toHaveLength(1);
      expect(h2.length).toBeGreaterThanOrEqual(2);
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<Settings />);
      
      expect(container.querySelector('.settings')).toBeInTheDocument();
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelectorAll('section').length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Internationalization', () => {
    it('should use translation keys correctly', () => {
      render(<Settings />);
      
      // Vérifier que les clés i18n sont présentes
      expect(screen.getByText('settings.title')).toBeInTheDocument();
      expect(screen.getByText('settings.general')).toBeInTheDocument();
      expect(screen.getByText('settings.appearance')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Settings />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
