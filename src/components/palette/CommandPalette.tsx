/**
 * TITANE_INFINITY v34.3.0 — Command Palette (⌘K / Ctrl+K).
 *
 * Global keyboard-first navigation surface built on `cmdk` via the shadcn
 * `Command` primitives (src/components/shadcn/command.tsx). Three groups:
 *   - Routes      → react-router navigate
 *   - Agents      → react-router navigate toward agent dashboards
 *   - Actions IPC → safe IPC commands via secureInvoke (allowlist-bound)
 *
 * Opens via the Tauri `global-shortcut` plugin (when capability is granted)
 * and falls back to a window `keydown` listener so the palette is available
 * even outside the Tauri runtime (browser smoke / E2E in Vite dev).
 *
 * `data-testid` map:
 *   - command-palette-root        : <CommandDialog> shell
 *   - command-palette-input       : <CommandInput>
 *   - command-group-routes        : routes <CommandGroup>
 *   - command-group-agents        : agents <CommandGroup>
 *   - command-group-actions       : actions <CommandGroup>
 *   - command-item-<id>           : every <CommandItem>
 */
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/shadcn/command';
import { useCommandPaletteStore } from '@/stores/useCommandPaletteStore';
import { secureInvoke } from '@/lib/security';
import { PALETTE_ROUTES } from './commands/routes';
import { PALETTE_AGENTS } from './commands/agents';
import { PALETTE_ACTIONS, type PaletteAction } from './commands/actions';

function useGlobalShortcut(open: boolean, setOpen: (v: boolean) => void) {
  // Tauri global-shortcut (best-effort, no crash if unavailable / capability missing).
  React.useEffect(() => {
    let unregistered = false;
    let cleanup: (() => void) | null = null;
    (async () => {
      try {
        const mod = await import('@tauri-apps/plugin-global-shortcut');
        await mod.register('CmdOrCtrl+K', () => {
          if (!unregistered) setOpen(true);
        });
        cleanup = () => {
          mod.unregister('CmdOrCtrl+K').catch(() => undefined);
        };
      } catch {
        // Plugin unavailable (browser / capability missing) → silent.
      }
    })();
    return () => {
      unregistered = true;
      if (cleanup) cleanup();
    };
  }, [setOpen]);

  // DOM fallback so ⌘K works in Vite dev / E2E without Tauri runtime,
  // and as a safety net if the global registration was denied.
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isPaletteKey = event.key === 'k' || event.key === 'K';
      if (!isPaletteKey) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.repeat) return;
      event.preventDefault();
      setOpen(!open);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, setOpen]);
}

async function runAction(action: PaletteAction): Promise<void> {
  if (action.command === '__reload_window__') {
    window.location.reload();
    return;
  }
  await secureInvoke(action.command, action.args ?? {});
}

export function CommandPalette(): React.ReactElement {
  const open = useCommandPaletteStore(s => s.open);
  const setOpen = useCommandPaletteStore(s => s.setOpen);
  const navigate = useNavigate();

  useGlobalShortcut(open, setOpen);

  const handleNavigate = React.useCallback(
    (to: string) => {
      setOpen(false);
      navigate(to);
    },
    [navigate, setOpen]
  );

  const handleAction = React.useCallback(
    async (action: PaletteAction) => {
      setOpen(false);
      try {
        await runAction(action);
        toast.success(action.successMessage);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'IPC action failed';
        toast.error(`Échec de l'action: ${message}`);
      }
    },
    [setOpen]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Tape une commande, agent ou route…"
        data-testid="command-palette-input"
      />
      <CommandList data-testid="command-palette-root">
        <CommandEmpty>Aucun résultat.</CommandEmpty>
        <CommandGroup heading="Routes" data-testid="command-group-routes">
          {PALETTE_ROUTES.map(route => {
            const Icon = route.icon;
            return (
              <CommandItem
                key={route.id}
                data-testid={`command-item-${route.id}`}
                value={`${route.label} ${route.keywords ?? ''}`}
                onSelect={() => handleNavigate(route.to)}
              >
                <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{route.label}</span>
                <span className="ml-auto text-xs opacity-60">{route.to}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Agents avancés" data-testid="command-group-agents">
          {PALETTE_AGENTS.map(agent => {
            const Icon = agent.icon;
            return (
              <CommandItem
                key={agent.id}
                data-testid={`command-item-${agent.id}`}
                value={`${agent.label} ${agent.keywords ?? ''}`}
                onSelect={() => handleNavigate(agent.to)}
              >
                <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{agent.label}</span>
                <span className="ml-auto text-xs opacity-60">{agent.to}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions IPC (safe)" data-testid="command-group-actions">
          {PALETTE_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={action.id}
                data-testid={`command-item-${action.id}`}
                value={`${action.label} ${action.keywords ?? ''}`}
                onSelect={() => {
                  void handleAction(action);
                }}
              >
                <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{action.label}</span>
                <span className="ml-auto text-xs opacity-60">{action.command}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export default CommandPalette;
