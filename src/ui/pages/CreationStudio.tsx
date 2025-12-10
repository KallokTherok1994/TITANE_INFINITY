/**
 * TITANE∞ v∞ Phase 8 - Creation Studio
 * Super-Prompt S: AI-powered code generation
 */

import React, { useState } from 'react';
import { secureInvoke } from '@/lib/security';

interface GeneratedArtifact {
  id: string;
  name: string;
  target_type: string;
  code: string;
  dependencies: string[];
  tests: string | null;
  documentation: string;
}

const TARGET_TYPES = [
  { value: 'RustModule', label: '🦀 Rust Module', color: 'orange' },
  { value: 'TypeScriptComponent', label: '📘 TypeScript Component', color: 'blue' },
  { value: 'ReactPage', label: '⚛️ React Page', color: 'cyan' },
  { value: 'TauriCommand', label: '🔧 Tauri Command', color: 'purple' },
  { value: 'UIWidget', label: '🎨 UI Widget', color: 'pink' },
  { value: 'DataModel', label: '📊 Data Model', color: 'green' },
];

const CreationStudio: React.FC = () => {
  const [intent, setIntent] = useState('');
  const [targetType, setTargetType] = useState('RustModule');
  const [artifact, setArtifact] = useState<GeneratedArtifact | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!intent.trim()) {
      setError('Veuillez décrire ce que vous souhaitez créer');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await secureInvoke<GeneratedArtifact>('create_module', {
        intent: intent.trim(),
        targetType,
      });
      setArtifact(result);
    } catch (err) {
      setError(`Échec de la génération : ${err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Creation Studio
        </h1>
        <p className="text-gray-400 mt-2">Phase 8 : Génération de code par IA</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Configuration */}
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">
              Que souhaitez-vous créer ?
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Description de l'intention
                </label>
                <textarea
                  value={intent}
                  onChange={e => setIntent(e.target.value)}
                  placeholder="Décrivez ce que vous voulez créer... Exemple : 'Créer un module d'authentification utilisateur avec tokens JWT'"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white h-32 resize-none focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Type de cible</label>
                <div className="grid grid-cols-2 gap-2">
                  {TARGET_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setTargetType(type.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        targetType === type.value
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-white font-medium text-sm">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !intent.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {isGenerating ? '⏳ Génération...' : '✨ Générer le code'}
              </button>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Templates Info */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-white mb-3">Modèles disponibles</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div>
                • <span className="text-orange-400">Rust Modules</span> - Structs, traits,
                implementations
              </div>
              <div>
                • <span className="text-blue-400">TypeScript</span> - Classes, interfaces,
                functions
              </div>
              <div>
                • <span className="text-cyan-400">React Components</span> - Functional
                components with hooks
              </div>
              <div>
                • <span className="text-purple-400">Tauri Commands</span> - Backend API
                endpoints
              </div>
              <div>
                • <span className="text-pink-400">UI Widgets</span> - Reusable UI
                components
              </div>
              <div>
                • <span className="text-green-400">Data Models</span> - Serializable data
                structures
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Generated Output */}
        <div className="space-y-6">
          {artifact ? (
            <>
              {/* Code Preview */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    Généré : {artifact.name}
                  </h2>
                  <button
                    onClick={() => copyToClipboard(artifact.code)}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    📋 Copier
                  </button>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    {artifact.code}
                  </pre>
                </div>
              </div>

              {/* Dependencies */}
              {artifact.dependencies.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                  <h3 className="text-lg font-semibold text-white mb-3">Dépendances</h3>
                  <div className="space-y-2">
                    {artifact.dependencies.map((dep, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-700/30 rounded-lg p-3 font-mono text-sm text-green-400"
                      >
                        {dep}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tests */}
              {artifact.tests && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Tests auto-générés
                    </h3>
                    <button
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      onClick={() => copyToClipboard(artifact.tests!)} // Safe: checked by parent condition
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-1 rounded-lg text-sm transition-all"
                    >
                      📋 Copier
                    </button>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 max-h-48 overflow-auto">
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                      {artifact.tests}
                    </pre>
                  </div>
                </div>
              )}

              {/* Documentation */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <h3 className="text-lg font-semibold text-white mb-3">Documentation</h3>
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {artifact.documentation}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/30 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-2xl font-semibold text-white mb-2">Prêt à créer</h2>
              <p className="text-gray-400">
                Décrivez votre intention et sélectionnez un type de cible pour générer le
                code
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreationStudio;
