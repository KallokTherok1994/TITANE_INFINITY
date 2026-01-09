/**
 * TITANE∞ v∞ Phase 9 - Introspection Dashboard
 * Super-Prompt T: Codebase health scanning & auto-fix
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import { secureInvoke } from '@/lib/security';

interface CodeIssue {
  id: string;
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
  category: string;
  file_path: string;
  line: number;
  description: string;
  suggestion: string | null;
  auto_fixable: boolean;
}

interface ScanReport {
  timestamp: number;
  total_files_scanned: number;
  total_issues: number;
  issues_by_severity: Record<string, number>;
  issues: CodeIssue[];
  auto_fixes_applied: number;
}

const IntrospectionDashboard = memo(function IntrospectionDashboard() {
  const [report, setReport] = useState<ScanReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [projectPath, setProjectPath] = useState(
    '/home/titane/Documents/TITANE_INFINITY'
  );
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const result = await secureInvoke<ScanReport>('introspection_scan', {
        projectRoot: projectPath,
      });
      setReport(result);
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  }, [projectPath]);

  const handleAutoFix = useCallback(async () => {
    setIsFixing(true);
    try {
      const result = await secureInvoke<ScanReport>('introspection_auto_fix', {
        projectRoot: projectPath,
      });
      setReport(result);
    } catch (err) {
      console.error('Auto-fix failed:', err);
    } finally {
      setIsFixing(false);
    }
  }, [projectPath]);

  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'Error':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'Warning':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'Info':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  }, []);

  const getCategoryIcon = useCallback((category: string) => {
    switch (category) {
      case 'DeadCode':
        return '☠️';
      case 'BrokenImport':
        return '🔗';
      case 'TypeError':
        return '📝';
      case 'PerformanceIssue':
        return '⚡';
      case 'SecurityVulnerability':
        return '🔒';
      case 'CodeSmell':
        return '👃';
      case 'MemoryLeak':
        return '💧';
      default:
        return '❓';
    }
  }, []);

  const filteredIssues = useMemo(
    () =>
      report?.issues.filter(
        issue => selectedSeverity === 'all' || issue.severity === selectedSeverity
      ) || [],
    [report?.issues, selectedSeverity]
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-red-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-600">
          Introspection Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          Phase 9 : Analyse de santé du code & correction auto
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">Chemin du projet</label>
            <input
              type="text"
              value={projectPath}
              onChange={e => setProjectPath(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white font-mono text-sm"
              placeholder="/path/to/project"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="flex-1 bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-2 rounded-lg transition-all"
            >
              {isScanning ? '⏳ Analyse...' : '🔍 Analyser'}
            </button>

            <button
              onClick={handleAutoFix}
              disabled={!report || isFixing}
              className="flex-1 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-2 rounded-lg transition-all"
            >
              {isFixing ? '⏳ Correction...' : '🔧 Auto-corriger'}
            </button>
          </div>
        </div>
      </div>

      {report ? (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-linear-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
              <div className="text-gray-400 text-sm mb-2">Fichiers analysés</div>
              <div className="text-3xl font-bold text-white">
                {report.total_files_scanned}
              </div>
            </div>

            <div className="bg-linear-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30">
              <div className="text-gray-400 text-sm mb-2">Problèmes totaux</div>
              <div className="text-3xl font-bold text-white">{report.total_issues}</div>
            </div>

            <div className="bg-linear-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
              <div className="text-gray-400 text-sm mb-2">Auto-corrigés</div>
              <div className="text-3xl font-bold text-white">
                {report.auto_fixes_applied}
              </div>
            </div>

            <div className="bg-linear-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
              <div className="text-gray-400 text-sm mb-2">Score de santé</div>
              <div className="text-3xl font-bold text-white">
                {(
                  (1 - report.total_issues / (report.total_files_scanned * 10)) *
                  100
                ).toFixed(0)}
                %
              </div>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Problèmes par sévérité
            </h2>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedSeverity('all')}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  selectedSeverity === 'all'
                    ? 'border-white bg-white/10 text-white'
                    : 'border-gray-600 bg-gray-700/30 text-gray-400'
                }`}
              >
                Tout ({report.total_issues})
              </button>

              {Object.entries(report.issues_by_severity).map(([severity, count]) => (
                <button
                  key={severity}
                  onClick={() => setSelectedSeverity(severity)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedSeverity === severity
                      ? getSeverityColor(severity)
                      : 'border-gray-600 bg-gray-700/30 text-gray-400'
                  }`}
                >
                  {severity} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Issues List */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">
              Problèmes ({filteredIssues.length})
            </h2>

            <div className="space-y-3 max-h-150 overflow-y-auto">
              {filteredIssues.map(issue => (
                <div
                  key={issue.id}
                  className={`rounded-xl p-4 border ${getSeverityColor(issue.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                      <div>
                        <div className="text-white font-semibold">{issue.category}</div>
                        <div className="text-sm text-gray-400">{issue.severity}</div>
                      </div>
                    </div>

                    {issue.auto_fixable && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                        Auto-fixable
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="text-white font-mono text-sm mb-1">
                      {issue.file_path}:
                      <span className="text-yellow-400">{issue.line}</span>
                    </div>
                    <div className="text-gray-300 text-sm">{issue.description}</div>
                  </div>

                  {issue.suggestion && (
                    <div className="bg-gray-900/50 rounded-lg p-3 text-sm">
                      <div className="text-gray-400 mb-1">💡 Suggestion:</div>
                      <div className="text-green-300">{issue.suggestion}</div>
                    </div>
                  )}
                </div>
              ))}

              {filteredIssues.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">✅</div>
                  <div>Aucun problème trouvé dans cette catégorie</div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 border border-red-500/30 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Démarrer l&apos;introspection de code
          </h2>
          <p className="text-gray-400">
            Analysez votre base de code pour détecter les problèmes et améliorer la santé
            du code
          </p>
        </div>
      )}
    </div>
  );
});

export default IntrospectionDashboard;
