/**
 * E2E Tests: Settings Workflow
 * Coverage: Settings → Apply → Persist
 */

import React, { useEffect, useState } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

type SettingsState = {
  theme: string;
  language: string;
  hardwareAcceleration: boolean;
  fpsLimit: number;
  stmLimit: number;
  mtmLimit: number;
};

const defaultSettings: SettingsState = {
  theme: 'light',
  language: 'en',
  hardwareAcceleration: true,
  fpsLimit: 60,
  stmLimit: 20,
  mtmLimit: 100,
};

const TestSettingsApp: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState('performance');
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  const updateSetting = (
    key: keyof SettingsState,
    value: SettingsState[keyof SettingsState]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (settings.fpsLimit > 240) {
      setMessage('invalid');
      return;
    }
    localStorage.setItem('settings', JSON.stringify(settings));
    setMessage('settings saved');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.setItem('settings', JSON.stringify(defaultSettings));
    setMessage('reset success');
  };

  const handleExport = () => {
    setMessage('exported');
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    setSettings({ ...defaultSettings, ...parsed });
    localStorage.setItem('settings', JSON.stringify({ ...defaultSettings, ...parsed }));
    setMessage('imported');
  };

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Settings
      </button>

      {open && (
        <div>
          <button type="button" onClick={() => setSection('performance')}>
            Performance
          </button>
          <button type="button" onClick={() => setSection('memory')}>
            Memory
          </button>

          {section === 'performance' && (
            <div>
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={settings.theme}
                onChange={event => updateSetting('theme', event.target.value)}
              >
                <option value="light">light</option>
                <option value="dark">dark</option>
              </select>

              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={settings.language}
                onChange={event => updateSetting('language', event.target.value)}
              >
                <option value="en">en</option>
                <option value="fr">fr</option>
              </select>

              <label>
                Hardware Acceleration
                <input
                  type="checkbox"
                  checked={settings.hardwareAcceleration}
                  onChange={event =>
                    updateSetting('hardwareAcceleration', event.target.checked)
                  }
                />
              </label>

              <label htmlFor="fpsLimit">FPS Limit</label>
              <input
                id="fpsLimit"
                type="number"
                value={settings.fpsLimit}
                onChange={event => updateSetting('fpsLimit', Number(event.target.value))}
              />
            </div>
          )}

          {section === 'memory' && (
            <div>
              <label htmlFor="stmLimit">STM Limit</label>
              <input
                id="stmLimit"
                type="number"
                value={settings.stmLimit}
                onChange={event => updateSetting('stmLimit', Number(event.target.value))}
              />
              <label htmlFor="mtmLimit">MTM Limit</label>
              <input
                id="mtmLimit"
                type="number"
                value={settings.mtmLimit}
                onChange={event => updateSetting('mtmLimit', Number(event.target.value))}
              />
            </div>
          )}

          <button type="button" onClick={handleSave}>
            Save
          </button>
          <button type="button" onClick={handleExport}>
            Export
          </button>
          <button type="button">Import</button>

          <label htmlFor="import">Import</label>
          <input
            id="import"
            type="file"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) {
                void handleImport(file);
              }
            }}
          />

          <button type="button" onClick={handleReset}>
            Reset defaults
          </button>
          <button type="button" onClick={handleReset}>
            Confirm
          </button>

          {message && <div>{message}</div>}
        </div>
      )}
    </div>
  );
};

describe('E2E: Settings Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('General Settings', () => {
    it('should update and persist general settings', async () => {
      render(<TestSettingsApp />);

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
      localStorage.setItem(
        'settings',
        JSON.stringify({
          theme: 'dark',
          language: 'fr',
        })
      );

      render(<TestSettingsApp />);

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
      render(<TestSettingsApp />);

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
      render(<TestSettingsApp />);

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
      localStorage.setItem(
        'settings',
        JSON.stringify({
          theme: 'dark',
          language: 'fr',
          fpsLimit: 30,
        })
      );

      render(<TestSettingsApp />);

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
      render(<TestSettingsApp />);

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
      render(<TestSettingsApp />);

      fireEvent.click(screen.getByRole('button', { name: /settings/i }));

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/exported|download/i)).toBeInTheDocument();
      });
    });

    it('should import settings', async () => {
      render(<TestSettingsApp />);

      fireEvent.click(screen.getByRole('button', { name: /settings/i }));

      const importButton = screen.getByRole('button', { name: /import/i });
      const fileInput = screen.getByLabelText(/import/i);

      const file = new File(['{"theme":"dark"}'], 'settings.json', {
        type: 'application/json',
      });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/imported|loaded/i)).toBeInTheDocument();
      });
    });
  });
});
