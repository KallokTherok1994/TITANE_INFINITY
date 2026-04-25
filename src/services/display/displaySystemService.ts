// src/services/display/displaySystemService.ts
// Service d’accès aux commandes display system (IPC Tauri)

// TODO: relier aux vraies commandes IPC dès qu’elles sont disponibles

export interface DisplayMonitor {
  id: string;
  name: string;
  modes: string[];
  current: string;
  brightness: number;
}

export interface DisplayEnvironment {
  session: string;
  permissions: string;
  tools: string[];
  blocked: boolean;
}

export const displaySystemService = {
  async getEnvironment(): Promise<DisplayEnvironment> {
    // Placeholder: à remplacer par IPC
    return {
      session: 'x11',
      permissions: 'ok',
      tools: ['xrandr', 'brightnessctl'],
      blocked: false,
    };
  },
  async listMonitors(): Promise<DisplayMonitor[]> {
    // Placeholder: à remplacer par IPC
    return [
      {
        id: 'HDMI-1',
        name: 'HDMI-1',
        modes: ['1920x1080@60', '1280x720@60'],
        current: '1920x1080@60',
        brightness: 0.8,
      },
      {
        id: 'eDP-1',
        name: 'eDP-1',
        modes: ['1920x1080@60'],
        current: '1920x1080@60',
        brightness: 0.6,
      },
    ];
  },
  async setMonitorMode(monitorId: string, mode: string): Promise<boolean> {
    // Placeholder: à remplacer par IPC
    return false;
  },
  async setMonitorBrightness(monitorId: string, brightness: number): Promise<boolean> {
    // Placeholder: à remplacer par IPC
    return false;
  },
};
