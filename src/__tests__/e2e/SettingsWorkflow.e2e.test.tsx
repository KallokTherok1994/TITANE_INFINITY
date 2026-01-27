/**
 * E2E Tests: Settings Workflow
 * Coverage: Settings → Apply → Persist
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '@/App';

describe('E2E: Settings Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('General Settings', () => {
    it('should update and persist general settings', async () => {
      render(<App />);
      
      // Open settings
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      
      // Change theme
      const themeSelect = screen.getByLabelText(/theme/i);
      fireEvent.change(themeSelect, { target: { value: 'dark' } });
      
      // Change language
      const languageSelect = screen.getByLabelText(/language/i);
      fireEvent.change(languageSelect, { target: { value: 'fr' } });
      
      // Save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/settings.*saved/i)).toBeInTheDocument();
      });
      
      // Verify persistence
      expect(localStorage.getItem('settings')).toContain('dark');
      expect(localStorage.getItem('settings')).toContain('fr');
    });

    it('should restore settings after reload', async () => {
      // Set initial settings
      localStorage.setItem('settings', JSON.stringify({
        theme: 'dark',
        language: 'fr'
      }));
      
      render(<App />);
      
      // Open settings
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      
      // Verify restored
      const themeSelect = screen.getByLabelText(/theme/i) as HTMLSelectElement;
      expect(themeSelect.value).toBe('dark');
      
      const languageSelect = screen.getByLabelText(/language/i) as HTMLSelectElement;
      expect(languageSelect.value).toBe('fr');
    });
  });

  describe('Performance Settings', () => {
    it('should apply performance settings', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      fireEvent.click(screen.getByText(/performance/i));
      
      // Toggle hardware acceleration
      const hwAccel = screen.getByLabelText(/hardware.*acceleration/i);
      fireEvent.click(hwAccel);
      
      // Adjust FPS limit
      const fpsSlider = screen.getByLabelText(/fps.*limit/i);
      fireEvent.change(fpsSlider, { target: { value: '30' } });
      
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/applied|saved/i)).toBeInTheDocument();
      });
    });
  });

  describe('Memory Settings', () => {
    it('should configure memory limits', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      fireEvent.click(screen.getByText(/memory/i));
      
      // Set STM limit
      const stmLimit = screen.getByLabelText(/stm.*limit/i);
      fireEvent.change(stmLimit, { target: { value: '50' } });
      
      // Set MTM limit
      const mtmLimit = screen.getByLabelText(/mtm.*limit/i);
      fireEvent.change(mtmLimit, { target: { value: '200' } });
      
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
      });
      
      // Verify applied
      expect(localStorage.getItem('settings')).toContain('50');
      expect(localStorage.getItem('settings')).toContain('200');
    });
  });

  describe('Reset Settings', () => {
    it('should reset to defaults', async () => {
      // Set custom settings
      localStorage.setItem('settings', JSON.stringify({
        theme: 'dark',
        language: 'fr',
        fpsLimit: 30
      }));
      
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      
      // Reset button
      const resetButton = screen.getByRole('button', { name: /reset.*defaults?/i });
      fireEvent.click(resetButton);
      
      // Confirm
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/reset.*success/i)).toBeInTheDocument();
      });
      
      // Verify defaults restored
      const themeSelect = screen.getByLabelText(/theme/i) as HTMLSelectElement;
      expect(themeSelect.value).toBe('light'); // Default
    });
  });

  describe('Validation', () => {
    it('should validate settings input', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      fireEvent.click(screen.getByText(/performance/i));
      
      // Invalid FPS value
      const fpsSlider = screen.getByLabelText(/fps.*limit/i);
      fireEvent.change(fpsSlider, { target: { value: '999' } });
      
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/invalid|out of range/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export/Import', () => {
    it('should export settings', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(screen.getByText(/exported|download/i)).toBeInTheDocument();
      });
    });

    it('should import settings', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      
      const importButton = screen.getByRole('button', { name: /import/i });
      const fileInput = screen.getByLabelText(/import/i);
      
      const file = new File(['{"theme":"dark"}'], 'settings.json', { type: 'application/json' });
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText(/imported|loaded/i)).toBeInTheDocument();
      });
    });
  });
});
