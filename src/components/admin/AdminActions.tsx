/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ ADMIN ENGINE — Admin Actions Component
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        AdminActions.tsx
 * @version     vΩ∞Ω+
 *
 * Panneau des actions admin avec boutons whitelistes
 * Confirmation, exécution et résultats
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Database,
  FileX,
  RefreshCw,
  Bot,
  Settings,
  Eye,
  Wrench,
  GitBranch,
  Search,
  Activity,
  ActivitySquare,
  Trash,
  Shield,
  ShieldOff,
  RefreshCcw,
  Gauge,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import type {
  AdminRole,
  AdminActionDefinition,
  AdminActionResult,
  ActionCategory,
} from '../../services/adminEngine';
import {
  getAdminEngine,
  ADMIN_ACTIONS_CATALOG,
  hasPermission,
} from '../../services/adminEngine';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface AdminActionsProps {
  className?: string;
  userRole: AdminRole;
  onActionExecuted?: (actionId: string, result: AdminActionResult) => void;
}

interface ActionState {
  isExecuting: boolean;
  showConfirm: boolean;
  result: AdminActionResult | null;
}

// ════════════════════════════════════════════════════════════════════════════════
// ICON MAPPING
// ════════════════════════════════════════════════════════════════════════════════

const ICON_MAP: Record<string, React.ReactNode> = {
  Trash2: <Trash2 size={18} />,
  Database: <Database size={18} />,
  FileX: <FileX size={18} />,
  RefreshCw: <RefreshCw size={18} />,
  Bot: <Bot size={18} />,
  Settings: <Settings size={18} />,
  Eye: <Eye size={18} />,
  Wrench: <Wrench size={18} />,
  GitBranch: <GitBranch size={18} />,
  Search: <Search size={18} />,
  Activity: <Activity size={18} />,
  ActivitySquare: <ActivitySquare size={18} />,
  Trash: <Trash size={18} />,
  Shield: <Shield size={18} />,
  ShieldOff: <ShieldOff size={18} />,
  RefreshCcw: <RefreshCcw size={18} />,
  Gauge: <Gauge size={18} />,
};

const CATEGORY_COLORS: Record<ActionCategory, string> = {
  CACHE: '#f59e0b',
  RESET: '#8b5cf6',
  CONFIG: '#3b82f6',
  HEALING: '#ef4444',
  PERFORMANCE: '#22c55e',
  LOGS: '#6b7280',
  SYSTEM: '#dc2626',
};

// ════════════════════════════════════════════════════════════════════════════════
// COMPOSANTS INTERNES
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Carte d'action individuelle
 */
const ActionCard: React.FC<{
  action: AdminActionDefinition;
  userRole: AdminRole;
  state: ActionState;
  onExecute: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ action, userRole, state, onExecute, onCancel, onConfirm }) => {
  const isAllowed = hasPermission(userRole, action);
  const icon = ICON_MAP[action.icon] || <Settings size={18} />;
  const categoryColor = CATEGORY_COLORS[action.category];

  const colorClass =
    action.color === 'danger'
      ? 'border-red-500/50 hover:border-red-500'
      : action.color === 'warning'
      ? 'border-amber-500/50 hover:border-amber-500'
      : action.color === 'success'
      ? 'border-green-500/50 hover:border-green-500'
      : 'border-[#333] hover:border-[#555]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 bg-[#1a1a1a] rounded-lg border ${colorClass} ${
        !isAllowed ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
          >
            {icon}
          </div>
          <div>
            <h4 className="text-[#C4C4C4] font-medium">{action.displayName}</h4>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
            >
              {action.category}
            </span>
          </div>
        </div>

        {action.reversible && (
          <span className="text-xs text-[#22c55e] bg-[#22c55e20] px-2 py-1 rounded">
            Réversible
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[#727B81] mb-4">{action.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {action.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-xs text-[#727B81] bg-[#333] px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>

      {/* Permissions */}
      <div className="text-xs text-[#727B81] mb-4">
        Permission: <span className="text-[#C4C4C4]">{action.permissionLevel}</span>
        {action.requiresConfirmation && (
          <span className="ml-2 text-[#f59e0b]">• Confirmation requise</span>
        )}
      </div>

      {/* Actions / State */}
      <AnimatePresence mode="wait">
        {state.showConfirm ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-[#333] text-[#C4C4C4] rounded-lg hover:bg-[#444] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              Confirmer
            </button>
          </motion.div>
        ) : state.isExecuting ? (
          <motion.div
            key="executing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-2 text-[#727B81]"
          >
            <Loader2 size={18} className="animate-spin" />
            <span>Exécution en cours...</span>
          </motion.div>
        ) : state.result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`p-3 rounded-lg ${
              state.result.result === 'SUCCESS'
                ? 'bg-[#22c55e20] text-[#22c55e]'
                : 'bg-[#ef444420] text-[#ef4444]'
            }`}
          >
            <div className="flex items-center gap-2">
              {state.result.result === 'SUCCESS' ? (
                <CheckCircle size={16} />
              ) : (
                <XCircle size={16} />
              )}
              <span className="text-sm">{state.result.message}</span>
            </div>
            {state.result.details && (
              <p className="text-xs mt-1 opacity-80">{state.result.details}</p>
            )}
            <p className="text-xs mt-2 opacity-60">
              Durée: {state.result.duration}ms
            </p>
          </motion.div>
        ) : (
          <motion.button
            key="execute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onExecute}
            disabled={!isAllowed}
            className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isAllowed
                ? 'bg-[#333] text-[#C4C4C4] hover:bg-[#444]'
                : 'bg-[#222] text-[#555] cursor-not-allowed'
            }`}
          >
            <ChevronRight size={16} />
            Exécuter
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════════

export const AdminActions: React.FC<AdminActionsProps> = ({
  className = '',
  userRole,
  onActionExecuted,
}) => {
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>({});
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const adminEngine = useMemo(() => getAdminEngine(), []);

  // Filtrer les actions
  const filteredActions = useMemo(() => {
    let actions = ADMIN_ACTIONS_CATALOG;

    // Filtrer par catégorie
    if (selectedCategory !== 'ALL') {
      actions = actions.filter((a) => a.category === selectedCategory);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      actions = actions.filter(
        (a) =>
          a.displayName.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Trier: actions permises en premier
    return actions.sort((a, b) => {
      const aAllowed = hasPermission(userRole, a);
      const bAllowed = hasPermission(userRole, b);
      if (aAllowed && !bAllowed) return -1;
      if (!aAllowed && bAllowed) return 1;
      return 0;
    });
  }, [selectedCategory, searchQuery, userRole]);

  // Récupérer l'état d'une action
  const getActionState = useCallback((actionId: string): ActionState => {
    return actionStates[actionId] || { isExecuting: false, showConfirm: false, result: null };
  }, [actionStates]);

  // Mettre à jour l'état d'une action
  const updateActionState = useCallback((actionId: string, update: Partial<ActionState>) => {
    setActionStates((prev) => {
      const current = prev[actionId] || { isExecuting: false, showConfirm: false, result: null };
      return {
        ...prev,
        [actionId]: { ...current, ...update },
      };
    });
  }, []);

  // Exécuter une action
  const executeAction = useCallback(async (action: AdminActionDefinition) => {
    updateActionState(action.id, { isExecuting: true, result: null });

    try {
      const result = await adminEngine.executeAction(action.id, userRole);
      updateActionState(action.id, { isExecuting: false, result });
      onActionExecuted?.(action.id, result);

      // Effacer le résultat après 5 secondes
      setTimeout(() => {
        updateActionState(action.id, { result: null });
      }, 5000);
    } catch (error) {
      const errorResult: AdminActionResult = {
        requestId: '',
        actionId: action.id,
        result: 'FAILED',
        message: 'Erreur inattendue',
        error: error instanceof Error ? error.message : String(error),
        startedAt: Date.now(),
        completedAt: Date.now(),
        duration: 0,
        rollbackAvailable: false,
      };
      updateActionState(action.id, { isExecuting: false, result: errorResult });
    }
  }, [adminEngine, userRole, updateActionState, onActionExecuted]);

  // Handlers
  const handleExecute = useCallback((action: AdminActionDefinition) => {
    if (action.requiresConfirmation) {
      updateActionState(action.id, { showConfirm: true, result: null });
    } else {
      executeAction(action);
    }
  }, [executeAction, updateActionState]);

  const handleCancel = useCallback((actionId: string) => {
    updateActionState(actionId, { showConfirm: false });
  }, [updateActionState]);

  const handleConfirm = useCallback((action: AdminActionDefinition) => {
    updateActionState(action.id, { showConfirm: false });
    executeAction(action);
  }, [executeAction, updateActionState]);

  // Catégories disponibles
  const categories: (ActionCategory | 'ALL')[] = [
    'ALL',
    'CACHE',
    'RESET',
    'CONFIG',
    'HEALING',
    'PERFORMANCE',
    'LOGS',
    'SYSTEM',
  ];

  return (
    <div className={`p-6 bg-[#0a0a0a] rounded-xl border border-[#333] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#C4C4C4]">Actions Admin</h2>
        <span className="text-sm text-[#727B81]">
          Rôle: <span className="text-[#C4C4C4] font-medium">{userRole}</span>
        </span>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727B81]" />
          <input
            type="text"
            placeholder="Rechercher une action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-[#C4C4C4] placeholder-[#727B81] focus:outline-none focus:border-[#555]"
          />
        </div>

        {/* Catégories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#333] text-[#C4C4C4]'
                  : 'bg-[#1a1a1a] text-[#727B81] hover:text-[#C4C4C4]'
              }`}
              style={
                cat !== 'ALL' && selectedCategory === cat
                  ? { borderColor: CATEGORY_COLORS[cat], borderWidth: 1 }
                  : {}
              }
            >
              {cat === 'ALL' ? 'Toutes' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Avertissement */}
      {userRole === 'DEV' && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-[#f59e0b20] border border-[#f59e0b] rounded-lg text-[#f59e0b]">
          <AlertTriangle size={18} />
          <span className="text-sm">
            Certaines actions sont réservées aux administrateurs.
          </span>
        </div>
      )}

      {/* Grille d'actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            userRole={userRole}
            state={getActionState(action.id)}
            onExecute={() => handleExecute(action)}
            onCancel={() => handleCancel(action.id)}
            onConfirm={() => handleConfirm(action)}
          />
        ))}
      </div>

      {/* Message si aucune action */}
      {filteredActions.length === 0 && (
        <div className="text-center py-12 text-[#727B81]">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucune action trouvée</p>
        </div>
      )}
    </div>
  );
};

export default AdminActions;
