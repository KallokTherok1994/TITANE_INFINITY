import type { Meta, StoryObj } from '@storybook/react';
import { LogLine } from '@/components/devtools/LogLine';

const meta = {
  title: 'DevTools/LogLine',
  component: LogLine,
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
} satisfies Meta<typeof LogLine>;

export default meta;
type Story = StoryObj<typeof meta>;

const base = { id: '1', timestamp: Date.now(), category: 'system' };

export const Info: Story = {
  args: { log: { ...base, level: 'info', message: 'Service démarré avec succès' } },
};

export const Warning: Story = {
  args: { log: { ...base, level: 'warn', message: 'Timeout IPC détecté (>500ms)' } },
};

export const Error: Story = {
  args: { log: { ...base, level: 'error', message: 'Connexion Ollama échouée', details: { code: 'ECONNREFUSED', port: 11434 } } },
};

export const Debug: Story = {
  args: { log: { ...base, level: 'debug', message: 'invoke: cognitive_get_state', category: 'ipc' } },
};

export const Highlighted: Story = {
  args: {
    log: { ...base, level: 'info', message: 'Résultat sélectionné par le filtre' },
    highlight: true,
  },
};
