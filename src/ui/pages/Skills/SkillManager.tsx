/**
 * TITANE∞ Skill OS — Skill Manager Page
 * Import, view, activate, deactivate, and remove skills.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  getSkillRegistry,
  activateSkill,
  deactivateSkill,
  fullInstallPipeline,
  disableSkill,
  archiveSkill,
  fullUninstall,
  getActiveSkillId,
  type SkillRegistryEntry,
  type SkillLifecycleResult,
} from '@/services/skills';
import SkillImporter from './SkillImporter';
import SkillCard from './SkillCard';

const SkillManager: React.FC = () => {
  const [skills, setSkills] = useState<SkillRegistryEntry[]>([]);
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  const refreshSkills = useCallback(() => {
    setSkills(getSkillRegistry());
    setActiveSkillId(getActiveSkillId());
  }, []);

  useEffect(() => {
    refreshSkills();
  }, [refreshSkills]);

  const showStatus = (message: string, type: 'success' | 'error' | 'info') => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleActivate = (skillId: string) => {
    const success = activateSkill(skillId);
    if (success) {
      showStatus('Skill activée avec succès', 'success');
      refreshSkills();
    } else {
      showStatus("Échec de l'activation de la skill", 'error');
    }
  };

  const handleDeactivate = (skillId: string) => {
    deactivateSkill(skillId);
    showStatus('Skill désactivée', 'info');
    refreshSkills();
  };

  const handleDisable = (skillId: string) => {
    const result = disableSkill(skillId);
    if (result.success) {
      showStatus('Skill désactivée', 'info');
      refreshSkills();
    }
  };

  const handleArchive = (skillId: string) => {
    const result = archiveSkill(skillId);
    if (result.success) {
      showStatus('Skill archivée', 'info');
      refreshSkills();
    }
  };

  const handleUninstall = (skillId: string) => {
    const result = fullUninstall(skillId);
    if (result.success) {
      showStatus('Skill désinstallée', 'success');
      refreshSkills();
    }
  };

  const handleImport = (
    source: string,
    sourceType: 'prompt' | 'manifest' | 'gpt-import' | 'openapi',
    name?: string
  ) => {
    const result = fullInstallPipeline({ source, sourceType, name });
    if (result.success) {
      showStatus(result.message, 'success');
      refreshSkills();
    } else {
      showStatus(result.message, 'error');
    }
    setShowImporter(false);
  };

  return (
    <div
      data-testid="page-skills"
      style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>🧩 Skill OS</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>
            Importez, gérez et activez des skills TITANE∞
          </p>
        </div>
        <button
          onClick={() => setShowImporter(true)}
          style={{
            padding: '10px 20px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          + Importer une Skill
        </button>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            background:
              statusType === 'success'
                ? '#d1fae5'
                : statusType === 'error'
                  ? '#fee2e2'
                  : '#e0e7ff',
            color:
              statusType === 'success'
                ? '#065f46'
                : statusType === 'error'
                  ? '#991b1b'
                  : '#3730a3',
          }}
        >
          {statusMessage}
        </div>
      )}

      {skills.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '2px dashed #d1d5db',
          }}
        >
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🧩</p>
          <h2 style={{ margin: '0 0 8px', fontSize: '18px', color: '#374151' }}>
            Aucune skill installée
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Importez un prompt, un manifest JSON ou une métadonnée GPT pour commencer.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {skills.map(skill => (
            <SkillCard
              key={skill.id}
              skill={skill}
              isActive={skill.id === activeSkillId}
              onActivate={() => handleActivate(skill.id)}
              onDeactivate={() => handleDeactivate(skill.id)}
              onDisable={() => handleDisable(skill.id)}
              onArchive={() => handleArchive(skill.id)}
              onUninstall={() => handleUninstall(skill.id)}
            />
          ))}
        </div>
      )}

      {showImporter && (
        <SkillImporter onImport={handleImport} onCancel={() => setShowImporter(false)} />
      )}
    </div>
  );
};

export default SkillManager;
