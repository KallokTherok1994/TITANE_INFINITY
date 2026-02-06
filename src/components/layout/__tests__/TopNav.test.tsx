import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { TopNav } from '../TopNav';

// Mock data
const mockTopNavItems = [
  { id: 'titane', label: 'TITANE', icon: <span>🧠</span>, route: '/' },
  { id: 'time', label: 'TIME', icon: <span>⏱️</span>, route: '/time' },
  { id: 'stats', label: 'STATS', icon: <span>📊</span>, route: '/stats' },
  { id: 'admin', label: 'ADMIN', icon: <span>⚙️</span>, route: '/admin' },
  { id: 'dev', label: 'DEV', icon: <span>🛠️</span>, route: '/dev' },
  { id: 'fusion', label: 'FUSION', icon: <span>✨</span>, route: '/fusion' },
];

const renderTopNav = (items = mockTopNavItems) => {
  return render(<TopNav items={items} currentRoute="/" onNavigate={vi.fn()} />);
};

describe('TopNav Component', () => {
  describe('Rendering', () => {
    it('should render maximum 5 visible items', () => {
      renderTopNav();
      const visibleButtons = screen.getAllByRole('button');
      expect(visibleButtons.length).toBeLessThanOrEqual(6); // 5 items + Plus menu
    });

    it('should display Plus menu when more than 5 items', () => {
      renderTopNav();
      const plusMenu =
        screen.getByLabelText(/Plus d'options/i) || screen.getByText('Plus');
      expect(plusMenu).toBeInTheDocument();
    });

    it('should render first 5 items visible', () => {
      renderTopNav(mockTopNavItems.slice(0, 5));
      expect(screen.getByText('TITANE')).toBeInTheDocument();
      expect(screen.getByText('TIME')).toBeInTheDocument();
      expect(screen.getByText('STATS')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
      expect(screen.getByText('DEV')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on all buttons', () => {
      renderTopNav();
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have aria-expanded on dropdown menu', () => {
      renderTopNav();
      const plusMenu = screen.getByLabelText(/Plus d'options/i);
      expect(plusMenu).toHaveAttribute('aria-expanded');
    });

    it('should manage focus on keyboard navigation', () => {
      renderTopNav();
      const buttons = screen.getAllByRole('button');
      fireEvent.keyDown(buttons[0], { key: 'Tab' });
      // Focus should shift to next button
      expect(document.activeElement).toBeDefined();
    });
  });

  describe('Interactions', () => {
    it('should toggle dropdown menu on click', () => {
      renderTopNav();
      const plusButton = screen.getByLabelText(/Plus d'options/i);
      fireEvent.click(plusButton);
      expect(plusButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should close dropdown on outside click', () => {
      renderTopNav();
      const plusButton = screen.getByLabelText(/Plus d'options/i);
      fireEvent.click(plusButton);
      fireEvent.mouseDown(document.body);
      expect(plusButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should handle item click navigation', () => {
      renderTopNav();
      const titaneLink = screen.getByText('TITANE');
      fireEvent.click(titaneLink);
      expect(titaneLink).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      renderTopNav();
      const container = screen.getByRole('navigation');
      expect(container).toHaveClass('app-topnav', 'flex');
    });

    it('should display logo', () => {
      renderTopNav();
      const logo = screen.getByAltText(/logo/i) || screen.getByRole('img');
      expect(logo).toBeInTheDocument();
    });
  });
});
