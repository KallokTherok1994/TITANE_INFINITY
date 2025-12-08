/**
 * Tests du SecurityPanel
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SecurityPanel from '../SecurityPanel';
import { IAService } from '@/services/ia';

// Mock IAService
vi.mock('@/services/ia', () => ({
  IAService: {
    getProvidersStatus: vi.fn(),
    setAPIKey: vi.fn(),
    testAPIKey: vi.fn(),
    deleteAPIKey: vi.fn(),
    validateKeyFormat: vi.fn(),
  },
  ProviderNames: {
    gemini: 'Google Gemini',
    openai: 'OpenAI GPT',
    claude: 'Anthropic Claude',
    ollama: 'Ollama',
  },
  ProviderIcons: {
    gemini: '🌐',
    openai: '🤖',
    claude: '🧠',
    ollama: '🦙',
  },
}));

describe('SecurityPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm globally
    global.confirm = vi.fn();
  });

  describe('Chargement initial', () => {
    it('devrait afficher un loader au chargement', () => {
      vi.mocked(IAService.getProvidersStatus).mockReturnValue(
        new Promise(() => {}) // Never resolves (simule un long chargement)
      );

      render(<SecurityPanel />);

      expect(screen.getByText('Chargement des providers...')).toBeInTheDocument();
    });

    it('devrait appeler getProvidersStatus au montage', async () => {
      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'gemini',
          name: 'Google Gemini',
          icon: '🌐',
          active: false,
        },
      ]);

      render(<SecurityPanel />);

      await waitFor(() => {
        expect(IAService.getProvidersStatus).toHaveBeenCalledTimes(1);
      });
    });

    it('devrait afficher tous les providers', async () => {
      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'gemini',
          name: 'Google Gemini',
          icon: '🌐',
          active: false,
        },
        {
          service: 'openai',
          name: 'OpenAI GPT',
          icon: '🤖',
          active: true,
          valid: true,
        },
        {
          service: 'claude',
          name: 'Anthropic Claude',
          icon: '🧠',
          active: true,
          valid: false,
        },
      ]);

      render(<SecurityPanel />);

      await waitFor(() => {
        expect(screen.getByText('Google Gemini')).toBeInTheDocument();
        expect(screen.getByText('OpenAI GPT')).toBeInTheDocument();
        expect(screen.getByText('Anthropic Claude')).toBeInTheDocument();
      });
    });
  });

  describe('Affichage des statuts', () => {
    it('devrait afficher "Non configuré" pour un provider inactif', async () => {
      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'gemini',
          name: 'Google Gemini',
          icon: '🌐',
          active: false,
        },
      ]);

      render(<SecurityPanel />);

      await waitFor(() => {
        expect(screen.getByText(/Non configuré/i)).toBeInTheDocument();
      });
    });

    it('devrait afficher "Configuré et valide" pour un provider actif et valide', async () => {
      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'openai',
          name: 'OpenAI GPT',
          icon: '🤖',
          active: true,
          valid: true,
        },
      ]);

      render(<SecurityPanel />);

      await waitFor(() => {
        expect(screen.getByText(/Configuré et valide/i)).toBeInTheDocument();
      });
    });

    it('devrait afficher "Configuré mais invalide" pour un provider actif mais invalide', async () => {
      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'claude',
          name: 'Anthropic Claude',
          icon: '🧠',
          active: true,
          valid: false,
        },
      ]);

      render(<SecurityPanel />);

      await waitFor(() => {
        expect(screen.getByText(/Configuré mais invalide/i)).toBeInTheDocument();
      });
    });
  });

  describe('Actions sur les providers', () => {
    it('devrait afficher le bouton "Ajouter clé" pour un provider inactif', async () => {
      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'gemini',
          name: 'Google Gemini',
          icon: '🌐',
          active: false,
        },
      ]);

      render(<SecurityPanel />);

      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Ajouter clé/i });
        expect(addButton).toBeInTheDocument();
      });
    });

    it('devrait afficher les boutons Tester/Modifier/Supprimer pour un provider actif', async () => {
      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'openai',
          name: 'OpenAI GPT',
          icon: '🤖',
          active: true,
          valid: true,
        },
      ]);

      render(<SecurityPanel />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Tester/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Modifier/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Supprimer/i })).toBeInTheDocument();
      });
    });

    it('devrait tester une clé API avec succès', async () => {
      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'openai',
          name: 'OpenAI GPT',
          icon: '🤖',
          active: true,
        },
      ]);

      vi.mocked(IAService.testAPIKey).mockResolvedValue({
        success: true,
        data: true,
      });

      render(<SecurityPanel />);

      await waitFor(() => {
        const testButton = screen.getByRole('button', { name: /Tester/i });
        fireEvent.click(testButton);
      });

      await waitFor(() => {
        expect(IAService.testAPIKey).toHaveBeenCalledWith('openai');
        expect(screen.getByText(/Clé openai valide/i)).toBeInTheDocument();
      });
    });

    it('devrait gérer un échec de test de clé', async () => {
      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'claude',
          name: 'Anthropic Claude',
          icon: '🧠',
          active: true,
        },
      ]);

      vi.mocked(IAService.testAPIKey).mockResolvedValue({
        success: false,
        error: 'Clé invalide',
      });

      render(<SecurityPanel />);

      await waitFor(() => {
        const testButton = screen.getByRole('button', { name: /Tester/i });
        fireEvent.click(testButton);
      });

      // Vérifier que testAPIKey a été appelé
      await waitFor(() => {
        expect(IAService.testAPIKey).toHaveBeenCalledWith('claude');
      });
    });

    it('devrait supprimer une clé après confirmation', async () => {
      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      vi.mocked(IAService.getProvidersStatus)
        .mockResolvedValueOnce([
          {
            service: 'gemini',
            name: 'Google Gemini',
            icon: '🌐',
            active: true,
          },
        ])
        .mockResolvedValueOnce([
          {
            service: 'gemini',
            name: 'Google Gemini',
            icon: '🌐',
            active: false, // Devient inactif après suppression
          },
        ]);

      vi.mocked(IAService.deleteAPIKey).mockResolvedValue({
        success: true,
      });

      render(<SecurityPanel />);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /Supprimer/i });
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith('Supprimer la clé API gemini ?');
        expect(IAService.deleteAPIKey).toHaveBeenCalledWith('gemini');
        expect(screen.getByText(/Clé gemini supprimée/i)).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });

    it('ne devrait PAS supprimer si l\'utilisateur annule', async () => {
      vi.mocked(global.confirm).mockReturnValue(false);

      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'openai',
          name: 'OpenAI GPT',
          icon: '🤖',
          active: true,
        },
      ]);

      render(<SecurityPanel />);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /Supprimer/i });
        fireEvent.click(deleteButton);
      });

      // Vérifier que deleteAPIKey n'est PAS appelé
      expect(IAService.deleteAPIKey).not.toHaveBeenCalled();
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait afficher une erreur si getProvidersStatus échoue', async () => {
      vi.mocked(IAService.getProvidersStatus).mockRejectedValue(
        new Error('Backend indisponible')
      );

      render(<SecurityPanel />);

      await waitFor(() => {
        expect(
          screen.getByText(/Échec de chargement des providers/i)
        ).toBeInTheDocument();
      });
    });

    it('devrait afficher une erreur si la suppression échoue', async () => {
      vi.mocked(global.confirm).mockReturnValue(true);

      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'gemini',
          name: 'Google Gemini',
          icon: '🌐',
          active: true,
        },
      ]);

      vi.mocked(IAService.deleteAPIKey).mockResolvedValue({
        success: false,
        error: 'Impossible de supprimer',
      });

      render(<SecurityPanel />);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /Supprimer/i });
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Échec suppression/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sécurité', () => {
    it('ne devrait PAS afficher de clés API en clair', async () => {
      vi.mocked(IAService.getProvidersStatus).mockResolvedValue([
        {
          service: 'openai',
          name: 'OpenAI GPT',
          icon: '🤖',
          active: true,
          valid: true,
        },
      ]);

      const { container } = render(<SecurityPanel />);

      await waitFor(() => {
        expect(screen.getByText('OpenAI GPT')).toBeInTheDocument();
      });

      // Vérifier qu'aucune clé API n'est visible dans le DOM
      const content = container.textContent || '';
      expect(content).not.toMatch(/sk-proj-/);
      expect(content).not.toMatch(/sk-ant-/);
      expect(content).not.toMatch(/AIza/);
    });
  });
});
