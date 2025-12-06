/**
 * TITANE∞ v19.4 — Keyboard Shortcuts Manager
 * 
 * Gestion centralisée des raccourcis clavier pour l'accessibilité
 */

import { useEffect, useCallback, useState, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
  category?: string
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
  preventDefault?: boolean
}

/**
 * Hook pour gérer les raccourcis clavier
 */
export function useKeyboardShortcuts({ 
  shortcuts, 
  enabled = true,
  preventDefault = true 
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey
      const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey
      const altMatch = shortcut.altKey === undefined || event.altKey === shortcut.altKey
      const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        if (preventDefault) {
          event.preventDefault()
        }
        shortcut.action()
        break
      }
    }
  }, [shortcuts, enabled, preventDefault])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Raccourcis globaux TITANE∞
 */
export const GLOBAL_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'k',
    ctrlKey: true,
    description: 'Ouvrir la palette de commandes',
    action: () => console.log('Command palette'),
    category: 'Navigation'
  },
  {
    key: '/',
    ctrlKey: true,
    description: 'Afficher l\'aide des raccourcis',
    action: () => console.log('Show shortcuts help'),
    category: 'Aide'
  },
  {
    key: 'h',
    ctrlKey: true,
    description: 'Retour à l\'accueil',
    action: () => window.location.href = '/',
    category: 'Navigation'
  },
  {
    key: 'b',
    ctrlKey: true,
    description: 'Toggle sidebar',
    action: () => console.log('Toggle sidebar'),
    category: 'Interface'
  },
  {
    key: 'Escape',
    description: 'Fermer modal/dialogue',
    action: () => console.log('Close modal'),
    category: 'Navigation'
  },
  {
    key: 'F1',
    description: 'Aide contextuelle',
    action: () => console.log('Context help'),
    category: 'Aide'
  }
]

/**
 * Component pour afficher l'aide des raccourcis clavier
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Keyboard } from 'lucide-react'

interface ShortcutsHelpProps {
  shortcuts?: KeyboardShortcut[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ShortcutsHelp({ 
  shortcuts = GLOBAL_SHORTCUTS,
  open,
  onOpenChange 
}: ShortcutsHelpProps) {
  // Grouper par catégorie
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Autres'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys: string[] = []
    if (shortcut.ctrlKey) keys.push('Ctrl')
    if (shortcut.shiftKey) keys.push('Shift')
    if (shortcut.altKey) keys.push('Alt')
    if (shortcut.metaKey) keys.push('⌘')
    keys.push(shortcut.key.toUpperCase())
    return keys.join(' + ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Raccourcis Clavier
          </DialogTitle>
          <DialogDescription>
            Utilisez ces raccourcis pour naviguer plus rapidement dans TITANE∞
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-2">{category}</h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <Badge variant="outline" className="font-mono">
                        {formatShortcut(shortcut)}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mt-4">
          Astuce : Appuyez sur <kbd className="px-2 py-1 bg-muted rounded">Ctrl + /</kbd> pour afficher cette aide
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Provider pour les raccourcis globaux
 */
interface KeyboardShortcutsProviderProps {
  children: React.ReactNode
  shortcuts?: KeyboardShortcut[]
  showHelpButton?: boolean
}

export function KeyboardShortcutsProvider({ 
  children, 
  shortcuts = GLOBAL_SHORTCUTS,
  showHelpButton = true 
}: KeyboardShortcutsProviderProps) {
  const [helpOpen, setHelpOpen] = useState(false)

  // Ajouter le shortcut pour ouvrir l'aide
  const shortcutsWithHelp: KeyboardShortcut[] = [
    ...shortcuts,
    {
      key: '/',
      ctrlKey: true,
      description: 'Afficher l\'aide des raccourcis',
      action: () => setHelpOpen(true),
      category: 'Aide'
    }
  ]

  useKeyboardShortcuts({
    shortcuts: shortcutsWithHelp,
    enabled: true
  })

  return (
    <>
      {children}
      <ShortcutsHelp 
        shortcuts={shortcuts} 
        open={helpOpen} 
        onOpenChange={setHelpOpen} 
      />
      
      {showHelpButton && (
        <button
          onClick={() => setHelpOpen(true)}
          className="fixed bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform z-50"
          aria-label="Afficher les raccourcis clavier"
        >
          <Keyboard className="h-5 w-5" />
        </button>
      )}
    </>
  )
}

/**
 * Hook pour focus management (accessibilité)
 */
export function useFocusTrap(enabled: boolean = true) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const element = ref.current
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    element.addEventListener('keydown', handleTab as EventListener)
    firstElement?.focus()

    return () => {
      element.removeEventListener('keydown', handleTab as EventListener)
    }
  }, [enabled])

  return ref
}

/**
 * Hook pour skip navigation (accessibilité)
 */
export function useSkipNavigation() {
  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]')
    if (mainContent instanceof HTMLElement) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return { skipToContent }
}

/**
 * Component Skip Navigation Link
 */
export function SkipNavigation() {
  const { skipToContent } = useSkipNavigation()

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault()
        skipToContent()
      }}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
    >
      Aller au contenu principal
    </a>
  )
}
