/**
 * TITANE∞ v19.4 — Accessibility Checker
 * 
 * Component React pour tester l'accessibilité avec axe-core
 * Détecte automatiquement les violations WCAG 2.1 (A, AA, AAA)
 */

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  PlayCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// Types axe-core
interface AxeViolation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  help: string
  helpUrl: string
  nodes: Array<{
    html: string
    target: string[]
    failureSummary?: string
  }>
  tags: string[]
}

interface AxeResults {
  violations: AxeViolation[]
  passes: Array<{ id: string; description: string }>
  incomplete: Array<{ id: string; description: string }>
  timestamp: string
  url: string
}

interface A11yCheckerProps {
  /** Élément à analyser (défaut: document.body) */
  target?: HTMLElement | string
  /** Exécuter automatiquement au montage */
  autoRun?: boolean
  /** Afficher les règles passées */
  showPasses?: boolean
  /** Niveau WCAG minimum (A, AA, AAA) */
  wcagLevel?: 'A' | 'AA' | 'AAA'
}

export function A11yChecker({ 
  target, 
  autoRun = false,
  showPasses = false,
  wcagLevel = 'AA'
}: A11yCheckerProps) {
  const [results, setResults] = useState<AxeResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(new Set())

  const runAxe = async () => {
    setIsRunning(true)
    setError(null)

    try {
      // Import dynamique d'axe-core
      const axe = (await import('axe-core')).default

      // Configuration axe
      const options = {
        runOnly: {
          type: 'tag' as const,
          values: ['wcag2a', 'wcag2aa', wcagLevel === 'AAA' ? 'wcag2aaa' : 'wcag2aa']
        }
      }

      // Exécuter axe sur la cible
      const targetElement = typeof target === 'string' 
        ? document.querySelector(target) 
        : target || document.body

      if (!targetElement) {
        throw new Error('Target element not found')
      }

      const axeResults = await axe.run(targetElement as HTMLElement, options)

      setResults({
        violations: axeResults.violations as AxeViolation[],
        passes: axeResults.passes.map(p => ({ id: p.id, description: p.description })),
        incomplete: axeResults.incomplete.map(i => ({ id: i.id, description: i.description })),
        timestamp: new Date().toISOString(),
        url: window.location.href
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    if (autoRun) {
      // Délai pour laisser le DOM se stabiliser
      const timer = setTimeout(runAxe, 1000)
      return () => clearTimeout(timer)
    }
  }, [autoRun])

  const toggleViolation = (id: string) => {
    setExpandedViolations(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getImpactColor = (impact: AxeViolation['impact']) => {
    switch (impact) {
      case 'critical': return 'bg-red-500'
      case 'serious': return 'bg-orange-500'
      case 'moderate': return 'bg-yellow-500'
      case 'minor': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getImpactIcon = (impact: AxeViolation['impact']) => {
    switch (impact) {
      case 'critical':
      case 'serious':
        return <XCircle className="h-4 w-4" />
      case 'moderate':
        return <AlertTriangle className="h-4 w-4" />
      case 'minor':
        return <Info className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const criticalCount = results?.violations.filter(v => v.impact === 'critical').length || 0
  const seriousCount = results?.violations.filter(v => v.impact === 'serious').length || 0
  const moderateCount = results?.violations.filter(v => v.impact === 'moderate').length || 0
  const minorCount = results?.violations.filter(v => v.impact === 'minor').length || 0
  const totalViolations = results?.violations.length || 0

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Accessibility Checker
            </CardTitle>
            <CardDescription>
              Analyse WCAG 2.1 niveau {wcagLevel} avec axe-core
            </CardDescription>
          </div>
          <Button 
            onClick={runAxe} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyse...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Exécuter
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Erreur */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Résultats */}
        {results && (
          <>
            {/* Vue d'ensemble */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
                  <div className="text-xs text-muted-foreground">Critical</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{seriousCount}</div>
                  <div className="text-xs text-muted-foreground">Serious</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">{moderateCount}</div>
                  <div className="text-xs text-muted-foreground">Moderate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">{minorCount}</div>
                  <div className="text-xs text-muted-foreground">Minor</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">{results.passes.length}</div>
                  <div className="text-xs text-muted-foreground">Passed</div>
                </CardContent>
              </Card>
            </div>

            {/* Score global */}
            <Alert variant={totalViolations === 0 ? 'default' : 'warning'}>
              {totalViolations === 0 ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>Aucune violation détectée ! 🎉</AlertTitle>
                  <AlertDescription>
                    Toutes les règles WCAG 2.1 niveau {wcagLevel} sont respectées.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{totalViolations} violation(s) détectée(s)</AlertTitle>
                  <AlertDescription>
                    {criticalCount} critical, {seriousCount} serious, {moderateCount} moderate, {minorCount} minor
                  </AlertDescription>
                </>
              )}
            </Alert>

            {/* Liste des violations */}
            {totalViolations > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Violations</h3>
                {results.violations.map(violation => (
                  <Card key={violation.id}>
                    <CardContent className="p-4">
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => toggleViolation(violation.id)}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <Badge className={getImpactColor(violation.impact)}>
                            {getImpactIcon(violation.impact)}
                            <span className="ml-1 text-white">{violation.impact}</span>
                          </Badge>
                          <div className="flex-1">
                            <div className="font-medium">{violation.help}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {violation.nodes.length} élément(s) affecté(s)
                            </div>
                          </div>
                        </div>
                        {expandedViolations.has(violation.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>

                      {/* Détails expandables */}
                      {expandedViolations.has(violation.id) && (
                        <div className="mt-4 space-y-3 border-t pt-3">
                          <div>
                            <div className="text-sm font-medium">Description</div>
                            <div className="text-sm text-muted-foreground">{violation.description}</div>
                          </div>

                          <div>
                            <div className="text-sm font-medium">Documentation</div>
                            <a 
                              href={violation.helpUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline"
                            >
                              {violation.helpUrl}
                            </a>
                          </div>

                          <div>
                            <div className="text-sm font-medium">Tags WCAG</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {violation.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-2">Éléments affectés</div>
                            {violation.nodes.map((node, idx) => (
                              <div key={idx} className="bg-muted p-2 rounded text-xs mb-2">
                                <div className="font-mono text-red-600 mb-1">
                                  {node.target.join(' > ')}
                                </div>
                                <div className="font-mono text-gray-600 overflow-x-auto">
                                  {node.html}
                                </div>
                                {node.failureSummary && (
                                  <div className="text-yellow-600 mt-1">
                                    {node.failureSummary}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Règles passées (optionnel) */}
            {showPasses && results.passes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-green-600">
                  Règles respectées ({results.passes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {results.passes.map(pass => (
                    <Card key={pass.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div className="text-sm">{pass.description}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div className="text-xs text-muted-foreground">
              Dernière analyse: {new Date(results.timestamp).toLocaleString('fr-FR')}
            </div>
          </>
        )}

        {/* État initial */}
        {!results && !isRunning && !error && (
          <div className="text-center py-8 text-muted-foreground">
            Cliquez sur "Exécuter" pour lancer l'analyse d'accessibilité
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Hook pour exécuter axe-core programmatiquement
 */
export function useA11yCheck(autoRun = false) {
  const [results, setResults] = useState<AxeResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runCheck = async (target?: HTMLElement | string) => {
    setIsRunning(true)
    try {
      const axe = (await import('axe-core')).default
      const targetElement = typeof target === 'string' 
        ? document.querySelector(target) 
        : target || document.body

      if (!targetElement) {
        throw new Error('Target element not found')
      }

      const axeResults = await axe.run(targetElement as HTMLElement)
      
      setResults({
        violations: axeResults.violations as AxeViolation[],
        passes: axeResults.passes.map(p => ({ id: p.id, description: p.description })),
        incomplete: axeResults.incomplete.map(i => ({ id: i.id, description: i.description })),
        timestamp: new Date().toISOString(),
        url: window.location.href
      })
    } catch (error) {
      console.error('A11y check failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    if (autoRun) {
      const timer = setTimeout(() => runCheck(), 1000)
      return () => clearTimeout(timer)
    }
  }, [autoRun])

  return { results, isRunning, runCheck }
}
