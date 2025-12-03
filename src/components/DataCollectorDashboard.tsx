/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ DATA COLLECTOR DASHBOARD v∞
 *   Interface visuelle pour le Data Collector Engine
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Composant React pour visualiser, contrôler et exporter le dataset d'entraînement.
 *
 * Features:
 * - Statistiques temps réel
 * - Visualisation par catégorie
 * - Contrôles de collecte/export
 * - Prévisualisation dataset
 * - Export JSONL + Training Pack
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dataCollector } from '@/modules/dataCollector/DataCollectorEngine';
import type { DatasetStats, DataCategory, DatasetEntry } from '@/modules/dataCollector/DataCollectorEngine';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function DataCollectorDashboard() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DataCategory | 'all'>('all');
  const [previewEntries, setPreviewEntries] = useState<DatasetEntry[]>([]);
  const [lastCollection, setLastCollection] = useState<number>(0);

  // Charger les stats au montage
  useEffect(() => {
    loadStats();
    setLastCollection(dataCollector.getLastCollectionTime());

    // Refresh toutes les 5 secondes
    const interval = setInterval(() => {
      if (!dataCollector.isCollectingNow()) {
        loadStats();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    const currentStats = dataCollector.getStats();
    setStats(currentStats);

    // Charger preview (10 premières entrées)
    const dataset = selectedCategory === 'all'
      ? dataCollector.getDataset().slice(0, 10)
      : dataCollector.getDatasetByCategory(selectedCategory).slice(0, 10);
    setPreviewEntries(dataset);
  };

  const handleCollect = async () => {
    setIsCollecting(true);
    try {
      const report = await dataCollector.runCollectionPipeline();
      if (report.success) {
        alert(`✅ Collecte réussie!\n${report.entriesCollected} nouvelles entrées.`);
        loadStats();
        setLastCollection(Date.now());
      } else {
        alert(`❌ Erreur de collecte:\n${report.errors.join('\n')}`);
      }
    } catch (error) {
      alert(`❌ Erreur: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCollecting(false);
    }
  };

  const handleExportJSONL = () => {
    const jsonl = dataCollector.exportToJSONL();
    const blob = new Blob([jsonl], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'titane-dataset.jsonl';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTrainingPack = () => {
    const pack = dataCollector.exportTrainingPack();

    // Export dataset.jsonl
    const datasetBlob = new Blob([pack.dataset], { type: 'application/jsonl' });
    const datasetUrl = URL.createObjectURL(datasetBlob);
    const datasetLink = document.createElement('a');
    datasetLink.href = datasetUrl;
    datasetLink.download = 'dataset.jsonl';
    datasetLink.click();
    URL.revokeObjectURL(datasetUrl);

    // Export Modelfile
    const modelfileBlob = new Blob([pack.modelfile], { type: 'text/plain' });
    const modelfileUrl = URL.createObjectURL(modelfileBlob);
    const modelfileLink = document.createElement('a');
    modelfileLink.href = modelfileUrl;
    modelfileLink.download = 'Modelfile';
    modelfileLink.click();
    URL.revokeObjectURL(modelfileUrl);

    // Export script
    const scriptBlob = new Blob([pack.script], { type: 'text/plain' });
    const scriptUrl = URL.createObjectURL(scriptBlob);
    const scriptLink = document.createElement('a');
    scriptLink.href = scriptUrl;
    scriptLink.download = 'train_titane_local.sh';
    scriptLink.click();
    URL.revokeObjectURL(scriptUrl);

    alert('✅ Training Pack exporté!\n3 fichiers téléchargés:\n- dataset.jsonl\n- Modelfile\n- train_titane_local.sh');
  };

  const handleClean = () => {
    if (confirm('Nettoyer le dataset (supprimer doublons et données de mauvaise qualité) ?')) {
      dataCollector.cleanDataset();
      loadStats();
      alert('✅ Dataset nettoyé!');
    }
  };

  const handleClear = () => {
    if (confirm('⚠️ ATTENTION: Effacer tout le dataset ?\nCette action est irréversible.')) {
      dataCollector.clearDataset();
      loadStats();
      alert('✅ Dataset effacé.');
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0e1a] text-[#C4C4C4]">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <div>Chargement Data Collector...</div>
        </div>
      </div>
    );
  }

  const categoryColors: Record<DataCategory, string> = {
    'super-prompt': '#6366f1',
    'interaction': '#8b5cf6',
    'auto-heal': '#ec4899',
    'introspection': '#f59e0b',
    'patch': '#10b981',
    'style': '#06b6d4',
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#C4C4C4] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#727B81] to-[#C4C4C4] bg-clip-text text-transparent">
          TITANE∞ DATA COLLECTOR v∞
        </h1>
        <p className="text-[#727B81]">
          Auto-collecte des données → Dataset d'entraînement TITANE-LOCAL
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Entrées"
          value={stats.totalEntries.toLocaleString()}
          icon="📊"
        />
        <StatCard
          label="Tokens Estimés"
          value={stats.totalTokens.toLocaleString()}
          icon="🔤"
        />
        <StatCard
          label="Taille Dataset"
          value={`${stats.sizeInMB.toFixed(2)} MB`}
          icon="💾"
        />
        <StatCard
          label="Qualité Moyenne"
          value={`${(stats.avgQuality * 100).toFixed(0)}%`}
          icon="⭐"
        />
      </div>

      {/* Categories Breakdown */}
      <div className="bg-[#1a1f2e] rounded-lg p-6 mb-8 border border-[#727B81]/30">
        <h2 className="text-xl font-semibold mb-4">Répartition par Catégorie</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <CategoryCard
              key={category}
              category={category as DataCategory}
              count={count}
              color={categoryColors[category as DataCategory]}
              onClick={() => setSelectedCategory(category as DataCategory)}
              isSelected={selectedCategory === category}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-[#1a1f2e] rounded-lg p-6 mb-8 border border-[#727B81]/30">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton
            label="Collecter Données"
            icon="🔄"
            onClick={handleCollect}
            disabled={isCollecting}
            variant="primary"
          />
          <ActionButton
            label="Export JSONL"
            icon="📤"
            onClick={handleExportJSONL}
            disabled={stats.totalEntries === 0}
          />
          <ActionButton
            label="Training Pack"
            icon="📦"
            onClick={handleExportTrainingPack}
            disabled={stats.totalEntries === 0}
          />
          <ActionButton
            label="Nettoyer"
            icon="🧹"
            onClick={handleClean}
            disabled={stats.totalEntries === 0}
          />
        </div>
        <div className="mt-4">
          <ActionButton
            label="Effacer Dataset"
            icon="🗑️"
            onClick={handleClear}
            disabled={stats.totalEntries === 0}
            variant="danger"
            fullWidth
          />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-[#1a1f2e] rounded-lg p-6 border border-[#727B81]/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Prévisualisation {selectedCategory !== 'all' && `(${selectedCategory})`}
          </h2>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-sm text-[#727B81] hover:text-[#C4C4C4] transition-colors"
            >
              Voir tout
            </button>
          )}
        </div>

        {previewEntries.length === 0 ? (
          <div className="text-center py-12 text-[#727B81]">
            <div className="text-4xl mb-4">📭</div>
            <div>Aucune entrée dans le dataset.</div>
            <button
              onClick={handleCollect}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-[#727B81] to-[#C4C4C4] text-[#0a0e1a] rounded-lg hover:opacity-90 transition-opacity"
            >
              Lancer Collecte
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {previewEntries.map((entry, index) => (
              <EntryPreview key={index} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-[#727B81]">
        <div>
          Dernière collecte: {lastCollection > 0
            ? new Date(lastCollection).toLocaleString('fr-FR')
            : 'Jamais'
          }
        </div>
        <div className="mt-2">
          {isCollecting && (
            <span className="animate-pulse">🔄 Collecte en cours...</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1f2e] rounded-lg p-4 border border-[#727B81]/30"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <div className="text-2xl font-bold text-[#C4C4C4]">{value}</div>
          <div className="text-sm text-[#727B81]">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

interface CategoryCardProps {
  category: DataCategory;
  count: number;
  color: string;
  onClick: () => void;
  isSelected: boolean;
}

function CategoryCard({ category, count, color, onClick, isSelected }: CategoryCardProps) {
  const categoryLabels: Record<DataCategory, string> = {
    'super-prompt': 'Super Prompts',
    'interaction': 'Interactions IA',
    'auto-heal': 'Auto-Heal',
    'introspection': 'Introspections',
    'patch': 'Patches Dev',
    'style': 'Style TITANE∞',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 rounded-lg border transition-all ${
        isSelected
          ? 'border-[#C4C4C4] bg-[#727B81]/20'
          : 'border-[#727B81]/30 bg-[#0a0e1a]/50 hover:border-[#727B81]'
      }`}
    >
      <div
        className="w-full h-2 rounded-full mb-3"
        style={{ backgroundColor: color }}
      />
      <div className="text-lg font-semibold text-[#C4C4C4]">{count}</div>
      <div className="text-sm text-[#727B81]">{categoryLabels[category]}</div>
    </motion.button>
  );
}

interface ActionButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled = false,
  variant = 'secondary',
  fullWidth = false,
}: ActionButtonProps) {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#727B81] to-[#C4C4C4] text-[#0a0e1a]',
    secondary: 'bg-[#0a0e1a] border border-[#727B81]/30 text-[#C4C4C4] hover:border-[#727B81]',
    danger: 'bg-red-500/20 border border-red-500/30 text-red-400 hover:border-red-500',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${fullWidth ? 'w-full' : ''}
        px-4 py-3 rounded-lg font-medium transition-all
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </motion.button>
  );
}

interface EntryPreviewProps {
  entry: DatasetEntry;
}

function EntryPreview({ entry }: EntryPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#0a0e1a] rounded-lg p-4 border border-[#727B81]/30"
    >
      {/* Metadata */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        {entry.category && (
          <span className="px-2 py-1 rounded bg-[#727B81]/20 text-[#C4C4C4]">
            {entry.category}
          </span>
        )}
        {entry.metadata && (
          <>
            <span className="text-[#727B81]">
              Qualité: {(entry.metadata.quality * 100).toFixed(0)}%
            </span>
            <span className="text-[#727B81]">•</span>
            <span className="text-[#727B81]">
              Importance: {(entry.metadata.importance * 100).toFixed(0)}%
            </span>
          </>
        )}
      </div>

      {/* Prompt */}
      <div className="mb-3">
        <div className="text-xs text-[#727B81] mb-1">PROMPT:</div>
        <div className="text-sm text-[#C4C4C4]">
          {expanded ? entry.prompt : truncate(entry.prompt, 150)}
        </div>
      </div>

      {/* Response */}
      <div>
        <div className="text-xs text-[#727B81] mb-1">RESPONSE:</div>
        <div className="text-sm text-[#C4C4C4]">
          {expanded ? entry.response : truncate(entry.response, 200)}
        </div>
      </div>

      {/* Expand toggle */}
      {(entry.prompt.length > 150 || entry.response.length > 200) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-[#727B81] hover:text-[#C4C4C4] transition-colors"
        >
          {expanded ? '▲ Réduire' : '▼ Voir plus'}
        </button>
      )}
    </motion.div>
  );
}

export default DataCollectorDashboard;
