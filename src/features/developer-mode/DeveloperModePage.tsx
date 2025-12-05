// ═══════════════════════════════════════════════════════════════════════════════
// TITANE∞ v∞ - DEVELOPER MODE PAGE
// OPUS #10 - IA Developer Mode v∞
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Shield,
  GitBranch,
  History,
  Play,
  RotateCcw,
  AlertTriangle,
  Check,
  X,
  FileCode,
  Package,
  Terminal,
  Save,
  Download,
  Eye,
  Loader2,
} from 'lucide-react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useIdentityMatrix } from '@/hooks/useIdentityMatrix';
import { useSingularityStateSafe } from '@/hooks/useSingularityStateSafe';
import {
  useDeveloperMode,
  usePatchOperations,
  usePatchHistory,
  useBackupOperations,
  useBuildPipeline,
  useChangelog,
} from './useDeveloperMode';
import type { PatchAction, PatchType, ChangeSeverity } from './types';
import './DeveloperModePage.css';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function DeveloperModePageContent(): JSX.Element {
  const { state, loading, error, enable, disable } = useDeveloperMode();
  const { matrix, isLoaded, loading: matrixLoading } = useIdentityMatrix();
  const singularityState = useSingularityStateSafe();
  const [authToken, setAuthToken] = useState('');

  // Loading state
  if (loading || matrixLoading) {
    return (
      <div className="developer-mode-page">
        <div className="devmode-loading">
          <Loader2 className="icon animate-spin" size={32} />
          <span className="text">Chargement du Developer Mode...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="developer-mode-page">
        <div className="devmode-error">
          <AlertTriangle className="icon" size={48} />
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Recharger</button>
        </div>
      </div>
    );
  }

  return (
    <div className="developer-mode-page">
      {/* Header */}
      <motion.div
        className="devmode-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="devmode-title">
          <Code2 className="icon" />
          <h1>Developer Mode</h1>
          <span className={`devmode-badge ${state?.enabled ? 'enabled' : 'disabled'}`}>
            {state?.enabled ? (
              <>
                <Check size={12} /> ACTIF
              </>
            ) : (
              <>
                <X size={12} /> INACTIF
              </>
            )}
          </span>
        </div>

        <div className="devmode-controls">
          {!state?.enabled ? (
            <>
              <input
                type="password"
                placeholder="Token d'autorisation..."
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="patch-input"
                style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
              />
              <button
                className="devmode-btn primary"
                onClick={() => enable(authToken)}
                disabled={!authToken}
              >
                <Shield size={16} />
                Activer
              </button>
            </>
          ) : (
            <button className="devmode-btn danger" onClick={disable}>
              <X size={16} />
              Désactiver
            </button>
          )}
        </div>
      </motion.div>

      {/* Security Warning */}
      <div className="security-warning">
        <AlertTriangle className="icon" />
        <div className="security-warning-text">
          <strong>⚠️ Mode Développeur</strong> - Accès réservé à Kevin Thibault uniquement.
          Toutes les modifications sont enregistrées et auditées.
          Les patches non autorisés seront automatiquement rejetés.
        </div>
      </div>

      {/* Main Grid */}
      <div className="devmode-grid">
        {/* Patch Editor */}
        <PatchEditorCard enabled={state?.enabled || false} />

        {/* Patch History */}
        <PatchHistoryCard />

        {/* Build Pipeline */}
        <BuildPipelineCard />

        {/* Backup & Restore */}
        <BackupCard enabled={state?.enabled || false} />

        {/* Changelog */}
        <ChangelogCard />

        {/* Stats */}
        <StatsCard state={state} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH EDITOR CARD
// ═══════════════════════════════════════════════════════════════════════════════

function PatchEditorCard({ enabled }: { enabled: boolean }): JSX.Element {
  const { loading, error, validatePatch, applyPatch, previewChanges } = usePatchOperations();
  const [patch, setPatch] = useState<Partial<PatchAction>>({
    patch_type: 'Replace',
    file_path: '',
    description: '',
    severity: 'Low',
    requires_review: true,
    changes: [],
  });
  const [preview, setPreview] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!patch.file_path || !patch.description) return;
    const result = await validatePatch(patch as PatchAction);
    if (result) {
      alert(result.validation_passed ? '✅ Patch validé' : '❌ Validation échouée');
    }
  };

  const handlePreview = async () => {
    if (!patch.file_path) return;
    const result = await previewChanges(patch as PatchAction);
    if (result) {
      setPreview(JSON.stringify(result, null, 2));
    }
  };

  const handleApply = async () => {
    if (!patch.file_path || !patch.description) return;
    const confirmed = window.confirm('Êtes-vous sûr de vouloir appliquer ce patch ?');
    if (!confirmed) return;

    const result = await applyPatch(patch as PatchAction);
    if (result?.success) {
      alert('✅ Patch appliqué avec succès');
      setPatch({
        patch_type: 'Replace',
        file_path: '',
        description: '',
        severity: 'Low',
        requires_review: true,
        changes: [],
      });
      setPreview(null);
    }
  };

  return (
    <motion.div
      className="devmode-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="devmode-card-header">
        <div className="devmode-card-title">
          <FileCode className="icon" />
          Éditeur de Patch
        </div>
      </div>

      <div className="patch-editor">
        <div className="patch-input">
          <label>Type de Patch</label>
          <select
            value={patch.patch_type}
            onChange={(e) => setPatch({ ...patch, patch_type: e.target.value as PatchType })}
            disabled={!enabled}
          >
            <option value="Replace">Replace</option>
            <option value="Insert">Insert</option>
            <option value="Delete">Delete</option>
            <option value="Create">Create</option>
            <option value="Refactor">Refactor</option>
            <option value="Optimize">Optimize</option>
          </select>
        </div>

        <div className="patch-input">
          <label>Fichier cible</label>
          <input
            type="text"
            placeholder="src/path/to/file.ts"
            value={patch.file_path}
            onChange={(e) => setPatch({ ...patch, file_path: e.target.value })}
            disabled={!enabled}
          />
        </div>

        <div className="patch-input">
          <label>Description</label>
          <textarea
            placeholder="Description des modifications..."
            value={patch.description}
            onChange={(e) => setPatch({ ...patch, description: e.target.value })}
            disabled={!enabled}
          />
        </div>

        <div className="patch-input">
          <label>Sévérité</label>
          <select
            value={patch.severity}
            onChange={(e) => setPatch({ ...patch, severity: e.target.value as ChangeSeverity })}
            disabled={!enabled}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {error && (
          <div className="devmode-error">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {preview && (
          <div className="diff-preview">
            <div className="diff-header">
              <span>Preview</span>
              <button onClick={() => setPreview(null)}>×</button>
            </div>
            <div className="diff-content">
              <pre>{preview}</pre>
            </div>
          </div>
        )}

        <div className="patch-actions">
          <button
            className="devmode-btn secondary"
            onClick={handlePreview}
            disabled={!enabled || loading || !patch.file_path}
          >
            <Eye size={16} />
            Aperçu
          </button>
          <button
            className="devmode-btn secondary"
            onClick={handleValidate}
            disabled={!enabled || loading || !patch.file_path}
          >
            <Check size={16} />
            Valider
          </button>
          <button
            className="devmode-btn primary"
            onClick={handleApply}
            disabled={!enabled || loading || !patch.file_path}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Appliquer
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH HISTORY CARD
// ═══════════════════════════════════════════════════════════════════════════════

function PatchHistoryCard(): JSX.Element {
  const { history, loading, fetchHistory } = usePatchHistory();
  const { rollback } = usePatchOperations();

  const handleRollback = async (patchId: string) => {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir rollback ce patch ?');
    if (!confirmed) return;

    const success = await rollback(patchId);
    if (success) {
      alert('✅ Rollback effectué');
      fetchHistory();
    }
  };

  return (
    <motion.div
      className="devmode-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="devmode-card-header">
        <div className="devmode-card-title">
          <History className="icon" />
          Historique des Patches
        </div>
        <button className="devmode-btn secondary" onClick={() => fetchHistory()}>
          <RotateCcw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="devmode-loading">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <div className="history-list">
          <AnimatePresence>
            {(history?.patches ?? []).map((item) => (
              <motion.div
                key={item.patch_id}
                className={`history-item ${item.status.toLowerCase().replace(' ', '-')}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="history-item-info">
                  <span className="history-item-id">{item.patch_id}</span>
                  <span className="history-item-desc">{item.description}</span>
                  <span className="history-item-meta">
                    {item.applied_at} • {item.author} • {item.affected_files.length} fichiers
                  </span>
                </div>
                <div className="history-item-actions">
                  {item.status === 'Applied' && (
                    <button
                      className="devmode-btn danger"
                      onClick={() => handleRollback(item.patch_id)}
                      title="Rollback"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(!history?.patches || history.patches.length === 0) && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              Aucun patch dans l'historique
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD PIPELINE CARD
// ═══════════════════════════════════════════════════════════════════════════════

function BuildPipelineCard(): JSX.Element {
  const { status, result, loading, startBuild, cancelBuild, cleanArtifacts } = useBuildPipeline();
  const [buildId, setBuildId] = useState<string | null>(null);

  const handleStartBuild = async () => {
    const id = await startBuild();
    if (id) {
      setBuildId(id);
    }
  };

  return (
    <motion.div
      className="devmode-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="devmode-card-header">
        <div className="devmode-card-title">
          <Package className="icon" />
          Golden Build Pipeline
        </div>
      </div>

      <div className="build-pipeline">
        {status && (
          <div className="build-progress">
            <div className="build-progress-bar">
              <div
                className="build-progress-fill"
                style={{ width: `${status.progress}%` }}
              />
            </div>
            <div className="build-progress-text">
              <span>{status.stage}</span>
              <span>{status.progress}%</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {status.message}
            </div>
          </div>
        )}

        {result && result.success && (
          <div className="build-artifacts">
            {result.artifacts.map((artifact, i) => (
              <div key={i} className="build-artifact">
                <Download size={14} />
                {artifact}
              </div>
            ))}
          </div>
        )}

        <div className="patch-actions">
          <button
            className="devmode-btn secondary"
            onClick={cleanArtifacts}
            disabled={loading}
          >
            <Terminal size={16} />
            Clean
          </button>
          {buildId && status?.status === 'running' ? (
            <button
              className="devmode-btn danger"
              onClick={() => cancelBuild(buildId)}
              disabled={loading}
            >
              <X size={16} />
              Annuler
            </button>
          ) : (
            <button
              className="devmode-btn primary"
              onClick={handleStartBuild}
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Build
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKUP CARD
// ═══════════════════════════════════════════════════════════════════════════════

function BackupCard({ enabled }: { enabled: boolean }): JSX.Element {
  const { loading, createBackup, restoreBackup: _restoreBackup } = useBackupOperations();
  const [backupName, setBackupName] = useState('');

  const handleCreate = async () => {
    if (!backupName) return;
    const id = await createBackup(backupName);
    if (id) {
      alert(`✅ Backup créé: ${id}`);
      setBackupName('');
    }
  };

  return (
    <motion.div
      className="devmode-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <div className="devmode-card-header">
        <div className="devmode-card-title">
          <Save className="icon" />
          Backup & Restore
        </div>
      </div>

      <div className="patch-editor">
        <div className="patch-input">
          <label>Nom du backup</label>
          <input
            type="text"
            placeholder="pre-refactor-v1"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            disabled={!enabled}
          />
        </div>

        <div className="patch-actions">
          <button
            className="devmode-btn primary"
            onClick={handleCreate}
            disabled={!enabled || loading || !backupName}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Créer Backup
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHANGELOG CARD
// ═══════════════════════════════════════════════════════════════════════════════

function ChangelogCard(): JSX.Element {
  const { changelog, loading, generateChangelog } = useChangelog();

  return (
    <motion.div
      className="devmode-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <div className="devmode-card-header">
        <div className="devmode-card-title">
          <GitBranch className="icon" />
          Changelog
        </div>
        <button
          className="devmode-btn secondary"
          onClick={() => generateChangelog()}
          disabled={loading}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
        </button>
      </div>

      <div className="diff-preview">
        <div className="diff-content">
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {changelog || 'Cliquez sur le bouton pour générer le changelog...'}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATS CARD
// ═══════════════════════════════════════════════════════════════════════════════

function StatsCard({ state }: { state: ReturnType<typeof useDeveloperMode>['state'] }): JSX.Element {
  return (
    <motion.div
      className="devmode-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      <div className="devmode-card-header">
        <div className="devmode-card-title">
          <Terminal className="icon" />
          Statistiques Session
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{state?.patches_this_session || 0}</span>
          <span className="stat-label">Patches</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{state?.pending_patches || 0}</span>
          <span className="stat-label">En Attente</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{state?.security_level || 'N/A'}</span>
          <span className="stat-label">Niveau</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{state?.features_enabled?.length || 0}</span>
          <span className="stat-label">Features</span>
        </div>
      </div>
    </motion.div>
  );
}

// Export with ErrorBoundary
export function DeveloperModePage(): JSX.Element {
  return (
    <ErrorBoundary context="DeveloperMode">
      <DeveloperModePageContent />
    </ErrorBoundary>
  );
}

export default DeveloperModePage;
