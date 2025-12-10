import React, { useState } from 'react';
import { InstructionMode, instructionModeManager } from './InstructionModeManager';
import './ModeEditor.css';

interface ModeEditorProps {
  onClose: () => void;
  onModeSelect: (mode: InstructionMode) => void;
  currentModeId?: string;
}

export const ModeEditor: React.FC<ModeEditorProps> = ({
  onClose,
  onModeSelect,
  currentModeId,
}) => {
  const [modes, setModes] = useState<InstructionMode[]>(
    instructionModeManager.getAllModes()
  );
  const [selectedMode, setSelectedMode] = useState<InstructionMode | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('🤖');
  const [formPrompt, setFormPrompt] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const refreshModes = () => {
    setModes(instructionModeManager.getAllModes());
  };

  const handleSelectMode = (mode: InstructionMode) => {
    setSelectedMode(mode);
    setFormName(mode.name);
    setFormIcon(mode.icon);
    setFormPrompt(mode.systemPrompt);
    setFormDescription(mode.description);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedMode(null);
    setFormName('');
    setFormIcon('🤖');
    setFormPrompt('');
    setFormDescription('');
  };

  const handleEdit = () => {
    if (!selectedMode) return;
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleDuplicate = () => {
    if (!selectedMode) return;
    const newMode = instructionModeManager.duplicateMode(selectedMode.id);
    if (newMode) {
      refreshModes();
      handleSelectMode(newMode);
    }
  };

  const handleDelete = () => {
    if (!selectedMode || !selectedMode.isCustom) return;
    if (confirm(`Supprimer le mode "${selectedMode.name}" ?`)) {
      instructionModeManager.deleteMode(selectedMode.id);
      setSelectedMode(null);
      refreshModes();
    }
  };

  const handleSave = () => {
    if (!formName.trim() || !formPrompt.trim()) {
      alert('Le nom et le prompt sont obligatoires');
      return;
    }

    if (isCreating) {
      // Créer nouveau mode
      const newMode = instructionModeManager.createMode(
        formName,
        formIcon,
        formPrompt,
        formDescription
      );
      refreshModes();
      handleSelectMode(newMode);
      setIsCreating(false);
    } else if (isEditing && selectedMode) {
      // Mettre à jour mode existant
      const success = instructionModeManager.updateMode(selectedMode.id, {
        name: formName,
        icon: formIcon,
        systemPrompt: formPrompt,
        description: formDescription,
      });
      if (success) {
        refreshModes();
        setIsEditing(false);
      } else {
        alert('Impossible de modifier ce mode (mode par défaut)');
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    if (selectedMode) {
      handleSelectMode(selectedMode);
    }
  };

  const handleUseMode = () => {
    if (selectedMode) {
      onModeSelect(selectedMode);
      onClose();
    }
  };

  const handleExport = () => {
    const json = instructionModeManager.exportModes();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'titane_instruction_modes.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = evt => {
          const content = evt.target?.result as string;
          const count = instructionModeManager.importModes(content);
          alert(`${count} mode(s) importé(s)`);
          refreshModes();
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="mode-editor-overlay">
      <div className="mode-editor-modal">
        <div className="mode-editor-header">
          <h2>🎭 Gestionnaire de Modes d'Instructions</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="mode-editor-content">
          {/* Liste des modes */}
          <div className="modes-list">
            <div className="modes-list-header">
              <h3>Modes disponibles</h3>
              <button className="btn-new" onClick={handleCreateNew}>
                ➕ Nouveau
              </button>
            </div>

            <div className="modes-list-items">
              {modes.map(mode => (
                <div
                  key={mode.id}
                  className={`mode-item ${
                    selectedMode?.id === mode.id ? 'selected' : ''
                  } ${currentModeId === mode.id ? 'active' : ''}`}
                  onClick={() => handleSelectMode(mode)}
                >
                  <div className="mode-item-icon">{mode.icon}</div>
                  <div className="mode-item-info">
                    <div className="mode-item-name">
                      {mode.name}
                      {!mode.isCustom && <span className="badge-default">Défaut</span>}
                      {currentModeId === mode.id && (
                        <span className="badge-active">Actif</span>
                      )}
                    </div>
                    <div className="mode-item-desc">{mode.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modes-list-actions">
              <button onClick={handleExport} title="Exporter modes personnalisés">
                📥 Exporter
              </button>
              <button onClick={handleImport} title="Importer modes">
                📤 Importer
              </button>
            </div>
          </div>

          {/* Panneau détails/édition */}
          <div className="mode-details">
            {!selectedMode && !isCreating && (
              <div className="mode-details-empty">
                <p>Sélectionnez un mode ou créez-en un nouveau</p>
              </div>
            )}

            {(selectedMode || isCreating) && (
              <>
                <div className="mode-details-header">
                  {!isCreating && !isEditing && (
                    <>
                      <h3>
                        {formIcon} {formName}
                      </h3>
                      <div className="mode-actions">
                        {selectedMode?.isCustom && (
                          <>
                            <button onClick={handleEdit} title="Modifier">
                              ✏️
                            </button>
                            <button onClick={handleDelete} title="Supprimer">
                              🗑️
                            </button>
                          </>
                        )}
                        {!selectedMode?.isCustom && (
                          <button onClick={handleDuplicate} title="Dupliquer">
                            📋
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  {(isCreating || isEditing) && (
                    <h3>{isCreating ? 'Nouveau mode' : 'Modification'}</h3>
                  )}
                </div>

                <div className="mode-form">
                  <div className="form-group">
                    <label>Nom du mode</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      disabled={!isCreating && !isEditing}
                      placeholder="Ex: Assistant Expert"
                    />
                  </div>

                  <div className="form-group">
                    <label>Icône</label>
                    <input
                      type="text"
                      value={formIcon}
                      onChange={e => setFormIcon(e.target.value)}
                      disabled={!isCreating && !isEditing}
                      placeholder="🤖"
                      maxLength={2}
                    />
                    <small>Emoji unique (1 caractère)</small>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      disabled={!isCreating && !isEditing}
                      placeholder="Description courte du mode"
                    />
                  </div>

                  <div className="form-group">
                    <label>System Prompt</label>
                    <textarea
                      value={formPrompt}
                      onChange={e => setFormPrompt(e.target.value)}
                      disabled={!isCreating && !isEditing}
                      placeholder="Instructions système pour l'IA..."
                      rows={12}
                    />
                    <small>
                      Instructions qui définissent le comportement de l'IA (français
                      recommandé)
                    </small>
                  </div>

                  {(isCreating || isEditing) && (
                    <div className="form-actions">
                      <button className="btn-save" onClick={handleSave}>
                        💾 Sauvegarder
                      </button>
                      <button className="btn-cancel" onClick={handleCancel}>
                        ✕ Annuler
                      </button>
                    </div>
                  )}

                  {!isCreating && !isEditing && selectedMode && (
                    <div className="form-actions">
                      <button className="btn-use" onClick={handleUseMode}>
                        ✓ Utiliser ce mode
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
