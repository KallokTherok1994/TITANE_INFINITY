/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.C - Memory Page
 * Interface de consultation de fichiers importés avec classification
 * ═══════════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useMemo } from 'react';
import { safeInvoke } from '../utils/invoke';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

interface StoredFile {
  path: string;
  category: string;
  content: string;
  timestamp: number;
  lines: number;
  words: number;
  size: number;
}

type CategoryFilter = 'all' | 'code-rust' | 'code-react' | 'code-typescript' | 'code-tauri' | 'code-system' | 'notes' | 'snippet' | 'documents';

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const MemoryVInfinity = (): JSX.Element => {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Charger les fichiers au montage
  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles(): Promise<void> {
    setLoading(true);
    const result = await safeInvoke<StoredFile[]>('get_all_files', {});
    if (result) {
      setFiles(result);
    }
    setLoading(false);
  }

  // Filtrer les fichiers
  const filteredFiles = useMemo(() => {
    let result = files;

    // Filtre catégorie
    if (filter !== 'all') {
      result = result.filter((f) => f.category === filter);
    }

    // Filtre recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.path.toLowerCase().includes(query) ||
          f.content.toLowerCase().includes(query)
      );
    }

    // Tri par date décroissante
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [files, filter, searchQuery]);

  // Statistiques
  const stats = useMemo(() => {
    const totalFiles = files.length;
    const totalLines = files.reduce((acc, f) => acc + f.lines, 0);
    const totalWords = files.reduce((acc, f) => acc + f.words, 0);
    const categories = [...new Set(files.map((f) => f.category))];

    return { totalFiles, totalLines, totalWords, categories };
  }, [files]);

  // Effacer la mémoire
  async function handleClearMemory(): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir effacer toute la mémoire ? Cette action est irréversible.')) {
      const result = await safeInvoke<boolean>('clear_memory', {});
      if (result) {
        setFiles([]);
      }
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.icon}>🧠</span>
          Memory v∞.C
        </h1>
        <p style={styles.subtitle}>
          {stats.totalFiles} fichiers importés • {stats.totalLines} lignes • {stats.totalWords} mots
        </p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalFiles}</div>
          <div style={styles.statLabel}>Fichiers</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.categories.length}</div>
          <div style={styles.statLabel}>Catégories</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalLines}</div>
          <div style={styles.statLabel}>Lignes</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalWords}</div>
          <div style={styles.statLabel}>Mots</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Catégorie:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as CategoryFilter)}
            style={styles.select}
          >
            <option value="all">Toutes</option>
            <option value="code-rust">🦀 Rust</option>
            <option value="code-react">⚛️ React</option>
            <option value="code-typescript">📘 TypeScript</option>
            <option value="code-tauri">🏷️ Tauri</option>
            <option value="code-system">⚙️ Système</option>
            <option value="notes">📝 Notes</option>
            <option value="snippet">✂️ Snippets</option>
            <option value="documents">📄 Documents</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Recherche:</label>
          <input
            type="text"
            placeholder="Rechercher un fichier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <button onClick={handleClearMemory} style={styles.clearButton}>
          🗑️ Effacer mémoire
        </button>
      </div>

      {/* Files List */}
      {loading ? (
        <div style={styles.loading}>Chargement...</div>
      ) : filteredFiles.length === 0 ? (
        <div style={styles.empty}>
          {searchQuery || filter !== 'all'
            ? 'Aucun fichier ne correspond à votre recherche.'
            : 'Aucun fichier importé. Utilisez le Chat pour importer des fichiers.'}
        </div>
      ) : (
        <div style={styles.filesList}>
          {filteredFiles.map((file) => (
            <div key={file.path} style={styles.fileCard}>
              <div style={styles.fileHeader}>
                <div style={styles.fileCategory}>{getCategoryIcon(file.category)} {file.category}</div>
                <div style={styles.fileDate}>{new Date(file.timestamp).toLocaleString('fr-FR')}</div>
              </div>
              <div style={styles.filePath}>{file.path}</div>
              <div style={styles.fileStats}>
                📊 {file.lines} lignes • {file.words} mots • {(file.size / 1024).toFixed(1)} KB
              </div>
              <div style={styles.filePreview}>
                {file.content.slice(0, 300)}
                {file.content.length > 300 && '...'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'code-rust': '🦀',
    'code-react': '⚛️',
    'code-typescript': '📘',
    'code-tauri': '🏷️',
    'code-system': '⚙️',
    notes: '📝',
    snippet: '✂️',
    documents: '📄',
  };
  return icons[category] || '📁';
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  icon: {
    fontSize: '2.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-dim)',
    marginTop: '0.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'var(--surface-glass)',
    border: '1px solid var(--border-glass)',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center' as const,
    backdropFilter: 'blur(12px)',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--primary)',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-dim)',
    textTransform: 'uppercase' as const,
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    flex: 1,
    minWidth: '200px',
  },
  filterLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-dim)',
    fontWeight: 600,
  },
  select: {
    padding: '0.75rem',
    background: 'var(--surface-glass)',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '1rem',
    cursor: 'pointer',
    backdropFilter: 'blur(12px)',
  },
  searchInput: {
    padding: '0.75rem',
    background: 'var(--surface-glass)',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '1rem',
    backdropFilter: 'blur(12px)',
  },
  clearButton: {
    padding: '0.75rem 1.5rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    fontSize: '1.25rem',
    color: 'var(--text-dim)',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '3rem',
    fontSize: '1.125rem',
    color: 'var(--text-dim)',
    background: 'var(--surface-glass)',
    border: '1px solid var(--border-glass)',
    borderRadius: '12px',
  },
  filesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  fileCard: {
    background: 'var(--surface-glass)',
    border: '1px solid var(--border-glass)',
    borderRadius: '12px',
    padding: '1.5rem',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.2s',
  },
  fileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  fileCategory: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--primary)',
    textTransform: 'uppercase' as const,
  },
  fileDate: {
    fontSize: '0.75rem',
    color: 'var(--text-dim)',
  },
  filePath: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: '0.5rem',
    wordBreak: 'break-all' as const,
  },
  fileStats: {
    fontSize: '0.875rem',
    color: 'var(--text-dim)',
    marginBottom: '1rem',
  },
  filePreview: {
    fontSize: '0.875rem',
    color: 'var(--text-dim)',
    lineHeight: 1.6,
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '1rem',
    borderRadius: '8px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
};
