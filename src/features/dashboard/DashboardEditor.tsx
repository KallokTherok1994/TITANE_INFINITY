/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * DASHBOARD EDITOR — Éditeur de widgets du tableau de bord
 * Permet d'ajouter, supprimer, modifier et personnaliser les widgets
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  BarChart,
  Activity,
  Zap,
  Users,
  Clock,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface DashboardWidgetConfig {
  refreshInterval?: number;
  dataSource?: string;
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  colorScheme?: string;
  showLegend?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'activity' | 'status' | 'custom';
  title: string;
  description?: string;
  icon: string;
  color: string;
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config?: DashboardWidgetConfig;
}

interface DashboardEditorProps {
  widgets: DashboardWidget[];
  onSave: (widgets: DashboardWidget[]) => void;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════
// WIDGET TEMPLATES
// ═══════════════════════════════════════════════════════════════

const WIDGET_TEMPLATES: Omit<DashboardWidget, 'id' | 'position'>[] = [
  {
    type: 'metric',
    title: 'Métrique',
    description: 'Affiche une valeur numérique',
    icon: 'BarChart',
    color: '#3b82f6',
    visible: true,
    size: { width: 1, height: 1 },
  },
  {
    type: 'chart',
    title: 'Graphique',
    description: 'Graphique de données',
    icon: 'TrendingUp',
    color: '#10b981',
    visible: true,
    size: { width: 2, height: 1 },
  },
  {
    type: 'activity',
    title: 'Activité',
    description: "Flux d'activités récentes",
    icon: 'Activity',
    color: '#f59e0b',
    visible: true,
    size: { width: 1, height: 2 },
  },
  {
    type: 'status',
    title: 'Statut',
    description: "Indicateur d'état système",
    icon: 'Zap',
    color: '#ef4444',
    visible: true,
    size: { width: 1, height: 1 },
  },
];

const ICON_MAP: Record<string, LucideIcon> = {
  BarChart,
  Activity,
  Zap,
  Users,
  Clock,
  TrendingUp,
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const DashboardEditor: React.FC<DashboardEditorProps> = ({
  widgets: initialWidgets,
  onSave,
  onClose,
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleAddWidget = useCallback(
    (template: Omit<DashboardWidget, 'id' | 'position'>) => {
      const newWidget: DashboardWidget = {
        ...template,
        id: `widget-${Date.now()}`,
        position: { x: 0, y: widgets.length },
      };
      setWidgets(prev => [...prev, newWidget]);
      setShowTemplates(false);
    },
    [widgets.length]
  );

  const handleDeleteWidget = useCallback((id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce widget ?')) {
      setWidgets(prev => prev.filter(w => w.id !== id));
    }
  }, []);

  const handleToggleVisibility = useCallback((id: string) => {
    setWidgets(prev => prev.map(w => (w.id === id ? { ...w, visible: !w.visible } : w)));
  }, []);

  const handleStartEdit = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  const handleSaveEdit = useCallback((id: string, updates: Partial<DashboardWidget>) => {
    setWidgets(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)));
    setEditingId(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setWidgets(prev => {
      const newWidgets = [...prev];
      [newWidgets[index - 1], newWidgets[index]] = [
        newWidgets[index],
        newWidgets[index - 1],
      ];
      return newWidgets;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setWidgets(prev => {
      if (index === prev.length - 1) return prev;
      const newWidgets = [...prev];
      [newWidgets[index], newWidgets[index + 1]] = [
        newWidgets[index + 1],
        newWidgets[index],
      ];
      return newWidgets;
    });
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;

      setWidgets(prev => {
        const newWidgets = [...prev];
        const draggedWidget = newWidgets[draggedIndex];
        newWidgets.splice(draggedIndex, 1);
        newWidgets.splice(index, 0, draggedWidget);
        return newWidgets;
      });
      setDraggedIndex(index);
    },
    [draggedIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleSave = useCallback(() => {
    onSave(widgets.map((w, idx) => ({ ...w, position: { ...w.position, y: idx } })));
    onClose();
  }, [widgets, onSave, onClose]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '16px',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Settings className="h-6 w-6 text-blue-400" />
            <h2
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              Éditeur de Tableau de Bord
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
            }
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Toolbar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus className="h-4 w-4" />
            Ajouter un Widget
          </button>
        </div>

        {/* Templates Grid */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {WIDGET_TEMPLATES.map((template, idx) => {
                  const IconComponent = ICON_MAP[template.icon] || BarChart;
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddWidget(template)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `2px solid ${template.color}33`,
                        borderRadius: '8px',
                        padding: '1rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `${template.color}22`;
                        e.currentTarget.style.borderColor = `${template.color}66`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = `${template.color}33`;
                      }}
                    >
                      <IconComponent
                        style={{ color: template.color, marginBottom: '0.5rem' }}
                      />
                      <div
                        style={{
                          color: 'white',
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {template.title}
                      </div>
                      <div
                        style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.875rem',
                        }}
                      >
                        {template.description}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Widgets List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
          }}
        >
          <AnimatePresence>
            {widgets.map((widget, index) => {
              const IconComponent = ICON_MAP[widget.icon] || BarChart;
              const isEditing = editingId === widget.id;

              return (
                <motion.div
                  key={widget.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  draggable={!isEditing}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    background: widget.visible
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: `2px solid ${draggedIndex === index ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    opacity: widget.visible ? 1 : 0.6,
                    cursor: isEditing ? 'default' : 'grab',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {!isEditing && (
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                    )}

                    <IconComponent style={{ color: widget.color }} className="h-5 w-5" />

                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={widget.title}
                        onBlur={e => handleSaveEdit(widget.id, { title: e.target.value })}
                        autoFocus
                        style={{
                          flex: 1,
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '600',
                        }}
                      />
                    ) : (
                      <span style={{ flex: 1, color: 'white', fontWeight: '600' }}>
                        {widget.title}
                      </span>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: index === 0 ? 'rgba(255, 255, 255, 0.3)' : '#3b82f6',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          fontSize: '1.25rem',
                        }}
                        title="Monter"
                      >
                        ⬆️
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === widgets.length - 1}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color:
                            index === widgets.length - 1
                              ? 'rgba(255, 255, 255, 0.3)'
                              : '#3b82f6',
                          cursor:
                            index === widgets.length - 1 ? 'not-allowed' : 'pointer',
                          fontSize: '1.25rem',
                        }}
                        title="Descendre"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(widget.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                        }}
                        title={widget.visible ? 'Masquer' : 'Afficher'}
                      >
                        {widget.visible ? (
                          <Eye className="h-4 w-4 text-green-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(widget.id, {})}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                            }}
                            title="Enregistrer"
                          >
                            <Save className="h-4 w-4 text-green-400" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                            }}
                            title="Annuler"
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(widget.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                          }}
                          title="Éditer"
                        >
                          <Edit2 className="h-4 w-4 text-blue-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteWidget(widget.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                        }}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {widget.description && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        marginLeft: '2.25rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.875rem',
                      }}
                    >
                      {widget.description}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {widgets.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <Settings className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Aucun widget configuré</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Cliquez sur "Ajouter un Widget" pour commencer
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
            {widgets.length} widget(s) • {widgets.filter(w => w.visible).length}{' '}
            visible(s)
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
              }
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Save className="h-4 w-4" />
              Enregistrer le tableau de bord
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
