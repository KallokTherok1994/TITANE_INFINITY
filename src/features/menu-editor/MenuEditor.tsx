/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   MENU EDITOR — Éditeur de menu avec drag & drop
 *   Réorganisation, ajout, suppression des sections
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { GripVertical, Plus, Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';

export interface MenuSection {
  id: string;
  icon: string;
  label: string;
  description: string;
  route: string;
  visible?: boolean;
  order?: number;
}

interface MenuEditorProps {
  sections: MenuSection[];
  onSave: (sections: MenuSection[]) => void;
  onClose: () => void;
}

export const MenuEditor: React.FC<MenuEditorProps> = ({ sections, onSave, onClose }) => {
  const [editableSections, setEditableSections] = useState<MenuSection[]>(
    sections.map((s, idx) => ({ ...s, order: idx, visible: s.visible ?? true }))
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MenuSection>>({});

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...editableSections];
    const draggedItem = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedItem);

    setEditableSections(newSections);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...editableSections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];
    setEditableSections(newSections);
  };

  const moveDown = (index: number) => {
    if (index === editableSections.length - 1) return;
    const newSections = [...editableSections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];
    setEditableSections(newSections);
  };

  const toggleVisibility = (id: string) => {
    setEditableSections(prev =>
      prev.map(s => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const startEdit = (section: MenuSection) => {
    setEditingId(section.id);
    setEditForm(section);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setEditableSections(prev =>
      prev.map(s => (s.id === editingId ? { ...s, ...editForm } : s))
    );
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const deleteSection = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
      setEditableSections(prev => prev.filter(s => s.id !== id));
    }
  };

  const addNewSection = () => {
    const newSection: MenuSection = {
      id: `section-${Date.now()}`,
      icon: '🆕',
      label: 'Nouvelle Section',
      description: 'Description de la section',
      route: '/new-section',
      visible: true,
      order: editableSections.length,
    };
    setEditableSections(prev => [...prev, newSection]);
    startEdit(newSection);
  };

  const handleSave = () => {
    onSave(editableSections.map((s, idx) => ({ ...s, order: idx })));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800/50 p-6">
          <div className="flex items-center gap-3">
            <Edit2 className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Éditeur de Menu</h2>
              <p className="text-sm text-gray-400">
                Glissez-déposez pour réorganiser, cliquez pour modifier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-140px)] flex-col gap-3 overflow-y-auto p-6">
          {editableSections.map((section, index) => (
            <div
              key={section.id}
              draggable={editingId !== section.id}
              onDragStart={() => handleDragStart(index)}
              onDragOver={e => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative rounded-xl border transition-all ${
                draggedIndex === index
                  ? 'scale-105 border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : section.visible
                    ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    : 'border-gray-800 bg-gray-900/30 opacity-60'
              }`}
            >
              {editingId === section.id ? (
                /* Edit Mode */
                <div className="space-y-3 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editForm.icon || ''}
                      onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
                      placeholder="Icône (emoji)"
                      className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-center text-2xl text-white outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={editForm.label || ''}
                      onChange={e => setEditForm({ ...editForm, label: e.target.value })}
                      placeholder="Titre"
                      className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={editForm.description || ''}
                    onChange={e =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    placeholder="Description"
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={editForm.route || ''}
                    onChange={e => setEditForm({ ...editForm, route: e.target.value })}
                    placeholder="Route (ex: /ma-page)"
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2 font-bold text-white transition-colors hover:bg-green-700"
                    >
                      <Save className="h-4 w-4" />
                      Enregistrer
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-700 py-2 font-bold text-white transition-colors hover:bg-gray-600"
                    >
                      <X className="h-4 w-4" />
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div className="flex items-center gap-4 p-4">
                  {/* Drag Handle */}
                  <button className="cursor-grab text-gray-500 transition-colors active:cursor-grabbing group-hover:text-gray-300">
                    <GripVertical className="h-5 w-5" />
                  </button>

                  {/* Icon */}
                  <span className="text-3xl">{section.icon}</span>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="font-bold text-white">{section.label}</div>
                    <div className="text-sm text-gray-400">{section.description}</div>
                    <code className="mt-1 text-xs text-gray-500">{section.route}</code>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-30"
                      title="Monter"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === editableSections.length - 1}
                      className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-30"
                      title="Descendre"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => toggleVisibility(section.id)}
                      className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                      title={section.visible ? 'Masquer' : 'Afficher'}
                    >
                      {section.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(section)}
                      className="rounded p-1.5 text-blue-400 transition-colors hover:bg-blue-500/20"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="rounded p-1.5 text-red-400 transition-colors hover:bg-red-500/20"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Button */}
          <button
            onClick={addNewSection}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/30 py-8 text-gray-400 transition-all hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
          >
            <Plus className="h-6 w-6" />
            <span className="font-bold">Ajouter une section</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-700 bg-gray-800/50 p-6">
          <div className="text-sm text-gray-400">
            {editableSections.length} section(s) •{' '}
            {editableSections.filter(s => s.visible).length} visible(s)
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-700 px-6 py-2 font-bold text-white transition-colors hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Enregistrer le menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
