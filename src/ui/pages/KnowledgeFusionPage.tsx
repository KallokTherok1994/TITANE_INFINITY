/**
 * TITANE∞ v∞ Phase 6 - Knowledge Fusion
 * Super-Prompt Q: Universal document ingestion & classification
 */

import React, { useState, useCallback, memo } from 'react';
import { tauriClient } from '@/lib/tauriClient';

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  format: string;
  metadata: DocumentMetadata;
  categories: string[];
  confidence: number;
  timestamp: number;
}

interface DocumentMetadata {
  author: string | null;
  created: number | null;
  modified: number | null;
  size_bytes: number;
  language: string | null;
  keywords: string[];
}

const KnowledgeFusionPage = memo(function KnowledgeFusionPage() {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const [parsedDoc, setParsedDoc] = useState<KnowledgeDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vault, setVault] = useState<KnowledgeDocument[]>([]);

  const handleFileSelect = useCallback(async () => {
    try {
      // In real implementation, use Tauri file picker
      const filePath = prompt('Chemin du fichier :');
      if (!filePath) return;

      setSelectedFile(filePath);
      setError(null);

      // Detect format
      const format = (await tauriClient.detectFileFormat({
        file_path: filePath,
      })) as string;
      setDetectedFormat(format);
    } catch (err) {
      setError(`Détection du format échouée : ${err}`);
    }
  }, []);

  const handleParse = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const doc = (await tauriClient.parseDocument({
        file_path: selectedFile,
      })) as KnowledgeDocument;
      setParsedDoc(doc);

      // Add to vault
      setVault(prev => [doc, ...prev].slice(0, 10));
    } catch (err) {
      setError(`Analyse échouée : ${err}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile]);

  const getFormatColor = useCallback((format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return 'text-red-400';
      case 'docx':
        return 'text-blue-400';
      case 'markdown':
        return 'text-purple-400';
      case 'json':
        return 'text-green-400';
      case 'plaintext':
        return 'text-gray-400';
      default:
        return 'text-yellow-400';
    }
  }, []);

  const getCategoryColor = useCallback((category: string) => {
    switch (category) {
      case 'code':
        return 'bg-blue-500/20 text-blue-300';
      case 'config':
        return 'bg-purple-500/20 text-purple-300';
      case 'development':
        return 'bg-green-500/20 text-green-300';
      case 'documentation':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
          Fusion des Connaissances
        </h1>
        <p className="text-gray-400 mt-2">
          Phase 6 : Ingestion & Classification Universelle de Documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Ingestion */}
        <div className="space-y-6">
          {/* File Selection */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">
              Ingestion de Documents
            </h2>

            <div className="space-y-4">
              <button
                onClick={handleFileSelect}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                📁 Sélectionner un Document
              </button>

              {selectedFile && (
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                  <div className="text-gray-400 text-sm mb-1">Fichier sélectionné</div>
                  <div className="text-white font-mono text-sm break-all">
                    {selectedFile}
                  </div>
                </div>
              )}

              {detectedFormat && (
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                  <div className="text-gray-400 text-sm mb-2">Format détecté</div>
                  <div className={`text-lg font-bold ${getFormatColor(detectedFormat)}`}>
                    {detectedFormat.toUpperCase()}
                  </div>
                </div>
              )}

              <button
                onClick={handleParse}
                disabled={!selectedFile || isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {isProcessing ? '⏳ Traitement...' : '🚀 Analyser & Classifier'}
              </button>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Parsed Document Preview */}
          {parsedDoc && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">Document Analysé</h2>

              <div className="space-y-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Titre</div>
                  <div className="text-white font-semibold">{parsedDoc.title}</div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-2">Catégories</div>
                  <div className="flex flex-wrap gap-2">
                    {parsedDoc.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(cat)}`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-1">Confiance</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-2 transition-all"
                        style={{ width: `${parsedDoc.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium">
                      {(parsedDoc.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-2">Aperçu du contenu</div>
                  <div className="bg-gray-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <pre className="text-gray-300 text-xs whitespace-pre-wrap font-mono">
                      {parsedDoc.content.slice(0, 500)}
                      {parsedDoc.content.length > 500 && '...'}
                    </pre>
                  </div>
                </div>

                {parsedDoc.metadata.keywords.length > 0 && (
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Mots-clés</div>
                    <div className="flex flex-wrap gap-2">
                      {parsedDoc.metadata.keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Knowledge Vault */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30">
          <h2 className="text-xl font-semibold text-white mb-4">
            Coffre de Connaissances
          </h2>

          {vault.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📚</div>
              <div>Aucun document</div>
              <div className="text-sm mt-2">
                Importez des documents pour construire votre base de connaissances
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {vault.map(doc => (
                <div
                  key={doc.id}
                  className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50 hover:border-indigo-500/50 transition-all cursor-pointer"
                  onClick={() => setParsedDoc(doc)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-1">{doc.title}</div>
                      <div className={`text-sm ${getFormatColor(doc.format)}`}>
                        {doc.format.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(doc.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {doc.categories.slice(0, 3).map((cat, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 text-xs rounded ${getCategoryColor(cat)}`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Confidence: {(doc.confidence * 100).toFixed(0)}%</span>
                    <span>•</span>
                    <span>{(doc.metadata.size_bytes / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Supported Formats Info */}
      <div className="mt-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30">
        <h3 className="text-lg font-semibold text-white mb-3">Supported Formats</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            'PDF',
            'DOCX',
            'Markdown',
            'JSON',
            'TXT',
            'CSV',
            'XML',
            'Image',
            'Audio',
            'Video',
          ].map(format => (
            <div key={format} className="bg-gray-700/30 rounded-lg p-3 text-center">
              <div className={`font-semibold ${getFormatColor(format)}`}>{format}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default KnowledgeFusionPage;
