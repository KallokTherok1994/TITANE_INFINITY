import React, { useState } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import { InstructionMode, instructionModeManager } from './InstructionModeManager';
import { useToastActions } from '../../../stores/uiStore.selectors';
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
  const { addToast } = useToastActions();
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

  // AI Assistance states
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiAssistRequest, setAIAssistRequest] = useState('');
  const [aiAssistLoading, setAIAssistLoading] = useState(false);
  const [aiAssistResponse, setAIAssistResponse] = useState('');

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
    // Note: Pour une vraie confirmation, utiliser ConfirmDialog component
    // Pour l&apos;instant, delete direct avec toast de confirmation
    const modeName = selectedMode.name;
    instructionModeManager.deleteMode(selectedMode.id);
    setSelectedMode(null);
    refreshModes();
    addToast({
      type: 'success',
      message: `Mode "${modeName}" supprimé`,
      duration: 3000,
    });
  };

  const handleSave = () => {
    if (!formName.trim() || !formPrompt.trim()) {
      addToast({
        type: 'warning',
        message: 'Le nom et le prompt sont obligatoires',
        duration: 4000,
      });
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
      addToast({
        type: 'success',
        message: `Mode "${formName}" créé avec succès`,
        duration: 3000,
      });
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
        addToast({
          type: 'success',
          message: `Mode "${formName}" mis à jour`,
          duration: 3000,
        });
      } else {
        addToast({
          type: 'error',
          message: 'Impossible de modifier ce mode (mode par défaut)',
          duration: 4000,
        });
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
          addToast({
            type: 'success',
            message: `${count} mode(s) importé(s) avec succès`,
            duration: 3000,
          });
          refreshModes();
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleAIAssist = async () => {
    if (!aiAssistRequest.trim()) {
      addToast({
        type: 'warning',
        message: 'Veuillez décrire ce que vous voulez pour les instructions',
        duration: 3000,
      });
      return;
    }

    setAIAssistLoading(true);
    setAIAssistResponse('');

    try {
      const systemPrompt = `Tu es un expert en conception d&apos;instructions system prompt pour assistants IA.
Ton rôle est d&apos;aider à créer des instructions claires, précises et efficaces en français.
Réponds UNIQUEMENT avec les instructions améliorées, sans explications supplémentaires.`;

      const userMessage = formPrompt.trim()
        ? `Instructions actuelles:
${formPrompt}

Demande d&apos;amélioration:
${aiAssistRequest}

Améliore ces instructions selon la demande.`
        : `Crée des instructions system prompt pour un mode d&apos;assistant IA avec cette description:
${aiAssistRequest}

Les instructions doivent être en français, claires et directes.`;

      const result = (await tauriClient.chatGenerateOpenai({
        message: userMessage,
        history: [
          {
            role: 'system',
            content: systemPrompt,
            timestamp: new Date().toISOString(),
          },
        ],
        config: {
          model: 'gpt-4o-mini',
          temperature: 0.7,
          maxTokens: 1024,
        },
      })) as {
        ok: boolean;
        data: { content: string } | null;
        error: string | null;
      };
      if (result.ok && result.data?.content) {
        setAIAssistResponse(result.data.content);
        addToast({
          type: 'success',
          message: '✨ Instructions générées avec succès !',
          duration: 3000,
        });
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('[ModeEditor] Erreur assistance IA:', error);
      addToast({
        type: 'error',
        message: `Erreur IA: ${error instanceof Error ? error.message : 'Erreur inconnue'}. Vérifiez votre clé API OpenAI dans Gouvernance.`,
        duration: 6000,
      });
    } finally {
      setAIAssistLoading(false);
    }
  };

  const handleApplyAIResponse = () => {
    if (aiAssistResponse.trim()) {
      setFormPrompt(aiAssistResponse);
      setShowAIAssist(false);
      setAIAssistRequest('');
      setAIAssistResponse('');
    }
  };

  return (
    <div className="mode-editor-overlay">
      <div className="mode-editor-modal">
        <div className="mode-editor-header">
          <h2>🎭 Gestionnaire de Modes d&apos;Instructions</h2>
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
                    <label>
                      System Prompt
                      {(isCreating || isEditing) && (
                        <button
                          type="button"
                          onClick={() => setShowAIAssist(true)}
                          style={{
                            marginLeft: '12px',
                            padding: '4px 10px',
                            background: 'rgba(99,102,241,0.2)',
                            border: '1px solid rgba(99,102,241,0.4)',
                            borderRadius: '6px',
                            color: '#a5b4fc',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                          title="Utiliser l'IA pour développer les instructions"
                        >
                          <span>🤖</span>
                          <span>Assistance IA</span>
                        </button>
                      )}
                    </label>
                    <textarea
                      value={formPrompt}
                      onChange={e => setFormPrompt(e.target.value)}
                      disabled={!isCreating && !isEditing}
                      placeholder="Instructions système pour l'IA..."
                      rows={12}
                    />
                    <small>
                      Instructions qui définissent le comportement de l&apos;IA (français
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

      {/* AI Assistance Modal */}
      {showAIAssist && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
          }}
        >
          <div
            style={{
              background: '#1e1e1e',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ margin: 0, color: '#e0e0e0' }}>
                🤖 Assistance IA pour Instructions
              </h3>
              <button
                onClick={() => {
                  setShowAIAssist(false);
                  setAIAssistRequest('');
                  setAIAssistResponse('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#999',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0' }}>
                Décrivez ce que vous voulez:
              </label>
              <textarea
                value={aiAssistRequest}
                onChange={e => setAIAssistRequest(e.target.value)}
                placeholder="Ex: Crée un mode pour un assistant technique expert en programmation Python, qui donne des réponses détaillées avec exemples de code..."
                rows={4}
                disabled={aiAssistLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: '#e0e0e0',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              onClick={handleAIAssist}
              disabled={aiAssistLoading || !aiAssistRequest.trim()}
              style={{
                padding: '10px 20px',
                background: aiAssistLoading ? '#555' : 'rgba(99,102,241,0.25)',
                border: '1px solid rgba(99,102,241,0.5)',
                borderRadius: '6px',
                color: aiAssistLoading ? '#999' : '#a5b4fc',
                cursor:
                  aiAssistLoading || !aiAssistRequest.trim() ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                marginBottom: '20px',
              }}
            >
              {aiAssistLoading ? '⏳ Génération en cours...' : '✨ Générer avec IA'}
            </button>

            {aiAssistResponse && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: '#2a2a2a',
                  borderRadius: '8px',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}
              >
                <h4 style={{ margin: '0 0 12px 0', color: '#22c55e' }}>
                  ✅ Instructions générées:
                </h4>
                <pre
                  style={{
                    background: '#1a1a1a',
                    padding: '12px',
                    borderRadius: '6px',
                    color: '#e0e0e0',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '300px',
                    overflow: 'auto',
                  }}
                >
                  {aiAssistResponse}
                </pre>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleApplyAIResponse}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(34,197,94,0.2)',
                      border: '1px solid rgba(34,197,94,0.4)',
                      borderRadius: '6px',
                      color: '#22c55e',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    ✓ Appliquer ces instructions
                  </button>
                  <button
                    onClick={() => {
                      setAIAssistResponse('');
                      setAIAssistRequest('');
                    }}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      border: '1px solid #666',
                      borderRadius: '6px',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    🔄 Réessayer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
