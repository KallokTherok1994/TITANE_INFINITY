/**
 * TITANE∞ v19.4 — ARIA Utilities
 * 
 * Fonctions utilitaires pour améliorer l'accessibilité ARIA
 */

import React, { useEffect, useRef } from 'react'

/**
 * Génère un ID unique pour les attributs ARIA
 */
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Annonce un message aux lecteurs d'écran via un live region
 */
export function announceToScreenReader(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite',
  timeout: number = 5000
) {
  const liveRegion = document.getElementById('aria-live-region') || createLiveRegion()
  
  liveRegion.setAttribute('aria-live', politeness)
  liveRegion.textContent = message

  // Nettoyer après timeout
  setTimeout(() => {
    liveRegion.textContent = ''
  }, timeout)
}

/**
 * Crée un live region pour les annonces
 */
function createLiveRegion(): HTMLElement {
  const existing = document.getElementById('aria-live-region')
  if (existing) return existing

  const liveRegion = document.createElement('div')
  liveRegion.id = 'aria-live-region'
  liveRegion.setAttribute('role', 'status')
  liveRegion.setAttribute('aria-live', 'polite')
  liveRegion.setAttribute('aria-atomic', 'true')
  liveRegion.className = 'sr-only'
  document.body.appendChild(liveRegion)

  return liveRegion
}

/**
 * Gère le focus d'un élément avec retour
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null

  /**
   * Sauvegarde le focus actuel et déplace vers un nouvel élément
   */
  saveFocusAndMoveTo(element: HTMLElement | null) {
    this.previousFocus = document.activeElement as HTMLElement
    element?.focus()
  }

  /**
   * Restaure le focus précédent
   */
  restoreFocus() {
    this.previousFocus?.focus()
    this.previousFocus = null
  }
}

/**
 * Trouve tous les éléments focusables dans un conteneur
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')

  return Array.from(container.querySelectorAll(selector)) as HTMLElement[]
}

/**
 * Vérifie si un élément est visible (pour le focus)
 */
export function isElementVisible(element: HTMLElement): boolean {
  if (!element) return false
  
  const style = window.getComputedStyle(element)
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetParent !== null
  )
}

/**
 * Hook React pour gérer les annonces screen reader
 */
export function useScreenReaderAnnouncement(message: string | null, politeness: 'polite' | 'assertive' = 'polite') {
  const previousMessage = useRef<string | null>(null)

  useEffect(() => {
    if (message && message !== previousMessage.current) {
      announceToScreenReader(message, politeness)
      previousMessage.current = message
    }
  }, [message, politeness])
}

/**
 * Hook React pour focus trap (modals, dialogs)
 */
export function useFocusTrap(active: boolean = true) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!active || !ref.current) return

    const container = ref.current
    const focusableElements = getFocusableElements(container)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus le premier élément au montage
    firstElement?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return ref
}

/**
 * Hook React pour auto-focus
 */
export function useAutoFocus(shouldFocus: boolean = true) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus()
    }
  }, [shouldFocus])

  return ref
}

/**
 * Hook React pour focus management dans les listes
 */
export function useArrowNavigation(containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const items = getFocusableElements(container)

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = items.findIndex(item => item === document.activeElement)
      if (currentIndex === -1) return

      let nextIndex: number | null = null

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          nextIndex = (currentIndex + 1) % items.length
          break
        case 'ArrowUp':
          e.preventDefault()
          nextIndex = (currentIndex - 1 + items.length) % items.length
          break
        case 'Home':
          e.preventDefault()
          nextIndex = 0
          break
        case 'End':
          e.preventDefault()
          nextIndex = items.length - 1
          break
      }

      if (nextIndex !== null) {
        items[nextIndex]?.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [containerRef])
}

/**
 * Composant VisuallyHidden pour cacher visuellement mais garder accessible
 */
export function VisuallyHidden({ 
  children, 
  as: Component = 'span' 
}: { 
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements 
}) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  )
}

/**
 * Composant LiveRegion pour les annonces dynamiques
 */
interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all'
}

export function LiveRegion({ 
  message, 
  politeness = 'polite',
  atomic = true,
  relevant = 'additions'
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
    >
      {message}
    </div>
  )
}

/**
 * HOC pour ajouter le support ARIA à un composant
 */
export function withAriaSupport<P extends object>(
  Component: React.ComponentType<P>,
  ariaProps: Partial<React.AriaAttributes> = {}
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const generatedId = generateAriaId('wrapped')
    const combinedProps = {
      ...props,
      ...ariaProps,
      ref,
      id: ariaProps['aria-labelledby'] ? undefined : generatedId
    } as P & React.RefAttributes<any>
    
    return React.createElement(Component, combinedProps)
  })
  
  WrappedComponent.displayName = `withAriaSupport(${Component.displayName || Component.name || 'Component'})`
  
  return WrappedComponent
}

/**
 * Utilitaires de validation ARIA
 */
export const ariaValidator = {
  /**
   * Vérifie si un rôle ARIA est valide
   */
  isValidRole(role: string): boolean {
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner',
      'button', 'cell', 'checkbox', 'columnheader', 'combobox',
      'complementary', 'contentinfo', 'definition', 'dialog', 'directory',
      'document', 'feed', 'figure', 'form', 'grid', 'gridcell',
      'group', 'heading', 'img', 'link', 'list', 'listbox',
      'listitem', 'log', 'main', 'marquee', 'math', 'menu',
      'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
      'navigation', 'none', 'note', 'option', 'presentation',
      'progressbar', 'radio', 'radiogroup', 'region', 'row',
      'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox',
      'separator', 'slider', 'spinbutton', 'status', 'switch',
      'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox',
      'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
    ]
    return validRoles.includes(role)
  },

  /**
   * Vérifie si un élément a un label accessible
   */
  hasAccessibleLabel(element: HTMLElement): boolean {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      (element as HTMLInputElement).labels?.length ||
      element.textContent?.trim()
    )
  },

  /**
   * Vérifie si un élément est correctement étiqueté
   */
  validateElement(element: HTMLElement): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Vérifier le rôle
    const role = element.getAttribute('role')
    if (role && !this.isValidRole(role)) {
      errors.push(`Invalid ARIA role: ${role}`)
    }

    // Vérifier les éléments interactifs
    if (['button', 'link', 'input'].includes(element.tagName.toLowerCase())) {
      if (!this.hasAccessibleLabel(element)) {
        errors.push('Interactive element missing accessible label')
      }
    }

    // Vérifier tabindex
    const tabindex = element.getAttribute('tabindex')
    if (tabindex && parseInt(tabindex) > 0) {
      errors.push('Avoid positive tabindex values')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

/**
 * Export default
 */
export default {
  generateAriaId,
  announceToScreenReader,
  FocusManager,
  getFocusableElements,
  isElementVisible,
  ariaValidator
}
