import type { Meta, StoryObj } from '@storybook/react';
import { EngineCard } from '@/components/devtools/EngineCard';
import { fn } from '@storybook/test';

const meta = {
  title: 'DevTools/EngineCard',
  component: EngineCard,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof EngineCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    engine: {
      id: 'ai-core',
      name: 'AI Core Engine',
      status: 'active',
      metrics: { requests: 1234, errors: 2, latency: 42 },
    },
  },
};

export const Error: Story = {
  args: {
    engine: {
      id: 'voice-engine',
      name: 'Voice Engine',
      status: 'error',
      metrics: { requests: 300, errors: 45, latency: 0 },
    },
  },
};

export const Idle: Story = {
  args: {
    engine: {
      id: 'perception',
      name: 'Perception Engine',
      status: 'idle',
    },
  },
};

export const NoMetrics: Story = {
  args: {
    engine: {
      id: 'analytics',
      name: 'Analytics Engine',
      status: 'active',
    },
  },
};
