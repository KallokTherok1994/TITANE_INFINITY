/**
 * TITANE∞ v19.2Ω - Memory Components Tests
 * Tests pour MemoryViewer et MemoryDashboard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryViewer } from '../components/chat/MemoryViewer';
import type {
  SessionMemoryEntry,
  IntermediateMemoryEntry,
  LongTermMemoryEntry,
} from '../services/memory/persistentMemory.config';

// =============================================================================
// MOCKS
// =============================================================================

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
  readText: vi.fn().mockResolvedValue(''),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
  configurable: true,
});

// Mock URL API
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

// =============================================================================
// TEST DATA
// =============================================================================

const mockSessionEntry: SessionMemoryEntry = {
  id: 'session-001',
  level: 'session',
  contentType: 'message',
  content: 'Test session content with some meaningful text',
  topic: 'general',
  importance: 3,
  tags: ['test', 'session'],
  metadata: {
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
    lastAccessedAt: Date.now() - 600000,
    accessCount: 5,
    source: 'chat_user',
    modeId: 'default',
    schemaVersion: '1.0.0',
  },
  ttl: 86400000,
  promotable: true,
};

const mockIntermediateEntry: IntermediateMemoryEntry = {
  id: 'intermediate-001',
  level: 'intermediate',
  contentType: 'summary',
  title: 'Test Summary',
  content: 'This is a summary of multiple conversations about TypeScript development.',
  topic: 'coding',
  importance: 4,
  tags: ['typescript', 'development', 'summary'],
  status: 'active',
  metadata: {
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000,
    lastAccessedAt: Date.now() - 3600000,
    accessCount: 15,
    source: 'auto_summary',
    modeId: 'dev',
    schemaVersion: '1.0.0',
  },
  sourceEntryIds: ['session-001', 'session-002'],
  relevanceScore: 0.85,
  expiresAt: Date.now() + 86400000 * 23,
  promotable: true,
};

const mockLongTermEntry: LongTermMemoryEntry = {
  id: 'longterm-001',
  level: 'long_term',
  contentType: 'knowledge',
  title: 'TypeScript Best Practices',
  summary: 'Key TypeScript patterns and practices for TITANE∞ development.',
  content: 'Detailed content about TypeScript best practices.',
  topic: 'technical',
  importance: 5,
  tags: ['typescript', 'best-practices'],
  status: 'active',
  metadata: {
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 2,
    lastAccessedAt: Date.now() - 3600000,
    accessCount: 42,
    source: 'manual_save',
    modeId: 'admin',
    schemaVersion: '1.0.0',
  },
  sourceEntryIds: ['intermediate-001'],
  confidenceScore: 95,
  userVerified: true,
  editable: true,
  version: 1,
  versionHistory: [],
};

// =============================================================================
// MEMORY VIEWER TESTS
// =============================================================================

describe('TITANE∞ Memory Components', () => {
  const mockOnClose = vi.fn();
  const mockOnPromote = vi.fn().mockResolvedValue(undefined);
  const mockOnArchive = vi.fn().mockResolvedValue(undefined);
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);
  const mockOnUpdateImportance = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MemoryViewer - Empty State', () => {
    it('should render empty state when no entry provided', () => {
      render(<MemoryViewer entry={null} onClose={mockOnClose} />);
      expect(
        screen.getByText('Sélectionnez une entrée pour voir les détails')
      ).toBeInTheDocument();
    });

    it('should display empty icon', () => {
      render(<MemoryViewer entry={null} onClose={mockOnClose} />);
      expect(screen.getByText('📭')).toBeInTheDocument();
    });
  });

  describe('MemoryViewer - Session Entry', () => {
    it('should render session entry content', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} />);
      expect(
        screen.getByText('Test session content with some meaningful text')
      ).toBeInTheDocument();
    });

    it('should display session level badge', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} />);
      expect(screen.getByText('Session')).toBeInTheDocument();
    });

    it('should display tags', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} />);
      expect(screen.getByText('#test')).toBeInTheDocument();
      expect(screen.getByText('#session')).toBeInTheDocument();
    });

    it('should display importance stars', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} />);
      const stars = screen.getAllByRole('button', { name: /Importance/i });
      expect(stars).toHaveLength(5);
    });

    it('should display access count', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} />);
      expect(screen.getByText('5 fois')).toBeInTheDocument();
    });
  });

  describe('MemoryViewer - Intermediate Entry', () => {
    it('should render intermediate entry', () => {
      render(<MemoryViewer entry={mockIntermediateEntry} onClose={mockOnClose} />);
      expect(screen.getByText(/summary of multiple conversations/i)).toBeInTheDocument();
    });

    it('should display intermediate level badge', () => {
      render(<MemoryViewer entry={mockIntermediateEntry} onClose={mockOnClose} />);
      expect(screen.getByText('Intermédiaire')).toBeInTheDocument();
    });

    it('should display coding topic', () => {
      render(<MemoryViewer entry={mockIntermediateEntry} onClose={mockOnClose} />);
      expect(screen.getByText('Code')).toBeInTheDocument();
    });
  });

  describe('MemoryViewer - Long Term Entry', () => {
    it('should render long term entry', () => {
      render(<MemoryViewer entry={mockLongTermEntry} onClose={mockOnClose} />);
      expect(screen.getByText(/TypeScript best practices/i)).toBeInTheDocument();
    });

    it('should display long term level badge', () => {
      render(<MemoryViewer entry={mockLongTermEntry} onClose={mockOnClose} />);
      expect(screen.getByText('Long Terme')).toBeInTheDocument();
    });

    it('should display summary section', () => {
      render(<MemoryViewer entry={mockLongTermEntry} onClose={mockOnClose} />);
      expect(screen.getByText('📋 Résumé')).toBeInTheDocument();
      expect(screen.getByText(/Key TypeScript patterns/i)).toBeInTheDocument();
    });

    it('should not show promote button', () => {
      render(
        <MemoryViewer
          entry={mockLongTermEntry}
          onClose={mockOnClose}
          onPromote={mockOnPromote}
        />
      );
      expect(screen.queryByText('⬆️ Promouvoir')).not.toBeInTheDocument();
    });
  });

  describe('MemoryViewer - Actions', () => {
    it('should call onClose when close button clicked', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} />);
      fireEvent.click(screen.getByLabelText('Fermer'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onPromote when promote button clicked', async () => {
      render(
        <MemoryViewer
          entry={mockSessionEntry}
          onClose={mockOnClose}
          onPromote={mockOnPromote}
        />
      );
      fireEvent.click(screen.getByText('⬆️ Promouvoir'));
      await waitFor(() => {
        expect(mockOnPromote).toHaveBeenCalledWith(mockSessionEntry);
      });
    });

    it('should call onArchive when archive button clicked', async () => {
      render(
        <MemoryViewer
          entry={mockSessionEntry}
          onClose={mockOnClose}
          onArchive={mockOnArchive}
        />
      );
      fireEvent.click(screen.getByText('📦 Archiver'));
      await waitFor(() => {
        expect(mockOnArchive).toHaveBeenCalledWith(mockSessionEntry);
      });
    });

    it('should copy content to clipboard', async () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText('📋 Copier'));
      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(mockSessionEntry.content);
      });
    });

    it('should export entry as JSON', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText('📤 Exporter'));
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it('should show delete confirmation modal', () => {
      render(
        <MemoryViewer
          entry={mockSessionEntry}
          onClose={mockOnClose}
          onDelete={mockOnDelete}
        />
      );
      fireEvent.click(screen.getByText('🗑️ Supprimer'));
      expect(screen.getByText('⚠️ Confirmer la suppression')).toBeInTheDocument();
    });

    it('should call onDelete when confirmed', async () => {
      render(
        <MemoryViewer
          entry={mockSessionEntry}
          onClose={mockOnClose}
          onDelete={mockOnDelete}
        />
      );
      fireEvent.click(screen.getByText('🗑️ Supprimer'));
      fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith(mockSessionEntry);
      });
    });

    it('should close modal on cancel', () => {
      render(
        <MemoryViewer
          entry={mockSessionEntry}
          onClose={mockOnClose}
          onDelete={mockOnDelete}
        />
      );
      fireEvent.click(screen.getByText('🗑️ Supprimer'));
      fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
      expect(screen.queryByText('⚠️ Confirmer la suppression')).not.toBeInTheDocument();
    });
  });

  describe('MemoryViewer - Read Only Mode', () => {
    it('should hide action buttons in read only mode', () => {
      render(
        <MemoryViewer
          entry={mockSessionEntry}
          onClose={mockOnClose}
          onPromote={mockOnPromote}
          onDelete={mockOnDelete}
          readOnly={true}
        />
      );
      expect(screen.queryByText('⬆️ Promouvoir')).not.toBeInTheDocument();
      expect(screen.queryByText('🗑️ Supprimer')).not.toBeInTheDocument();
    });

    it('should disable importance stars in read only mode', () => {
      render(
        <MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} readOnly={true} />
      );
      const stars = screen.getAllByRole('button', { name: /Importance/i });
      stars.forEach(star => {
        expect(star).toBeDisabled();
      });
    });

    it('should still show copy and export buttons', () => {
      render(
        <MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} readOnly={true} />
      );
      expect(screen.getByText('📋 Copier')).toBeInTheDocument();
      expect(screen.getByText('📤 Exporter')).toBeInTheDocument();
    });
  });

  describe('MemoryViewer - Keyboard Navigation', () => {
    it('should close on Escape key', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} />);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal first on Escape', () => {
      render(
        <MemoryViewer
          entry={mockSessionEntry}
          onClose={mockOnClose}
          onDelete={mockOnDelete}
        />
      );
      fireEvent.click(screen.getByText('🗑️ Supprimer'));
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('⚠️ Confirmer la suppression')).not.toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('MemoryViewer - Content Expansion', () => {
    it('should expand long content', () => {
      const longContent = 'A'.repeat(600);
      const entryWithLongContent = { ...mockSessionEntry, content: longContent };
      render(<MemoryViewer entry={entryWithLongContent} onClose={mockOnClose} />);

      expect(screen.getByText('▼ Voir tout')).toBeInTheDocument();
      fireEvent.click(screen.getByText('▼ Voir tout'));
      expect(screen.getByText('▲ Réduire')).toBeInTheDocument();
    });
  });

  describe('MemoryViewer - Importance Updates', () => {
    it('should call onUpdateImportance', async () => {
      render(
        <MemoryViewer
          entry={mockSessionEntry}
          onClose={mockOnClose}
          onUpdateImportance={mockOnUpdateImportance}
        />
      );
      const stars = screen.getAllByRole('button', { name: /Importance/i });
      fireEvent.click(stars[4]);
      await waitFor(() => {
        expect(mockOnUpdateImportance).toHaveBeenCalledWith(mockSessionEntry, 5);
      });
    });
  });

  describe('MemoryViewer - Notifications', () => {
    it('should show notification after copying', async () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText('📋 Copier'));
      await waitFor(() => {
        expect(screen.getByText('✅ Contenu copié')).toBeInTheDocument();
      });
    });

    it('should show notification after export', async () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText('📤 Exporter'));
      await waitFor(() => {
        expect(screen.getByText('✅ Entrée exportée')).toBeInTheDocument();
      });
    });
  });

  describe('MemoryViewer - Structure', () => {
    it('should have header section', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={vi.fn()} />);
      expect(document.querySelector('.memory-viewer__header')).toBeInTheDocument();
    });

    it('should have body section', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={vi.fn()} />);
      expect(document.querySelector('.memory-viewer__body')).toBeInTheDocument();
    });

    it('should have actions section', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={vi.fn()} />);
      expect(document.querySelector('.memory-viewer__actions')).toBeInTheDocument();
    });

    it('should have metadata section', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={vi.fn()} />);
      expect(screen.getByText('📊 Métadonnées')).toBeInTheDocument();
    });

    it('should have content section', () => {
      render(<MemoryViewer entry={mockSessionEntry} onClose={vi.fn()} />);
      expect(screen.getByText('📝 Contenu')).toBeInTheDocument();
    });
  });

  describe('MemoryViewer - Edge Cases', () => {
    it('should handle entry with no tags', () => {
      const entryWithNoTags = { ...mockSessionEntry, tags: [] };
      render(<MemoryViewer entry={entryWithNoTags} onClose={vi.fn()} />);
      expect(screen.queryByText('Tags:')).not.toBeInTheDocument();
    });

    it('should handle entry with no lastAccessedAt', () => {
      const entryWithNoLastAccess = {
        ...mockSessionEntry,
        metadata: { ...mockSessionEntry.metadata, lastAccessedAt: undefined },
      };
      render(<MemoryViewer entry={entryWithNoLastAccess} onClose={vi.fn()} />);
      expect(screen.queryByText('Dernier accès:')).not.toBeInTheDocument();
    });

    it('should handle entry with no modeId', () => {
      const entryWithNoMode = {
        ...mockSessionEntry,
        metadata: { ...mockSessionEntry.metadata, modeId: undefined },
      };
      render(<MemoryViewer entry={entryWithNoMode} onClose={vi.fn()} />);
      expect(screen.queryByText('Mode:')).not.toBeInTheDocument();
    });

    it('should display expired status for old entries', () => {
      const expiredEntry = {
        ...mockSessionEntry,
        metadata: {
          ...mockSessionEntry.metadata,
          createdAt: Date.now() - 86400000 * 2,
        },
        ttl: 86400000,
      };
      render(<MemoryViewer entry={expiredEntry} onClose={vi.fn()} />);
      expect(screen.getByText('Expiré')).toBeInTheDocument();
    });
  });
});
