/**
 * TITANE∞ Skill OS — Skill Importer Component
 * Modal for importing skills from prompt, JSON manifest, or GPT metadata.
 */

import React, { useState } from 'react';

interface SkillImporterProps {
  onImport: (
    source: string,
    sourceType: 'prompt' | 'manifest' | 'gpt-import' | 'openapi',
    name?: string
  ) => void;
  onCancel: () => void;
}

const SkillImporter: React.FC<SkillImporterProps> = ({ onImport, onCancel }) => {
  const [sourceType, setSourceType] = useState<'prompt' | 'manifest' | 'gpt-import'>(
    'prompt'
  );
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const handleImport = () => {
    if (!content.trim()) return;
    onImport(content, sourceType, name || undefined);
  };

  const placeholders: Record<string, string> = {
    prompt: `# My Skill
You are an expert assistant that helps with...

Your behavior:
- Always respond in French
- Be concise and helpful`,
    manifest: `{
  "name": "My Skill",
  "description": "What this skill does",
  "instructions": "You are...",
  "conversation_starters": ["Hello", "Help me with..."],
  "tools": [
    { "name": "my_tool", "description": "Does something" }
  ]
}`,
    'gpt-import': `{
  "gpt": {
    "name": "Imported GPT",
    "description": "...",
    "instructions": "You are...",
    "conversation_starters": ["..."],
    "capabilities": []
  }
}`,
  };

  const typeLabels: Record<string, string> = {
    prompt: '📝 Prompt brut',
    manifest: '📋 Manifest JSON',
    'gpt-import': '🤖 Métadonnées GPT',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <h2 style={{ margin: '0 0 16px' }}>Importer une Skill</h2>

        {/* Source type selector */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Type de source
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Object.entries(typeLabels).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setSourceType(type as typeof sourceType)}
                style={{
                  padding: '8px 16px',
                  border: sourceType === type ? '2px solid #6366f1' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: sourceType === type ? '#eef2ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: sourceType === type ? 600 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Name field */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Nom (optionnel)
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Mon Skill Personnalisé"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Content field */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            {sourceType === 'prompt' ? 'Instructions / Prompt' : 'Contenu JSON'}
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={placeholders[sourceType]}
            rows={12}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: sourceType === 'prompt' ? 'inherit' : 'monospace',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            disabled={!content.trim()}
            style={{
              padding: '10px 20px',
              background: content.trim() ? '#6366f1' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: content.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Importer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillImporter;
