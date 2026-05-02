import type { Meta, StoryObj } from '@storybook/react';
import { MetricCard } from '@/components/devtools/MetricCard';

const meta = {
  title: 'DevTools/MetricCard',
  component: MetricCard,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Good: Story = {
  args: { title: 'Latence P95', value: 42, unit: 'ms', trend: 'down', status: 'good' },
};

export const Warning: Story = {
  args: { title: 'Mémoire heap', value: 340, unit: 'MB', trend: 'up', status: 'warning' },
};

export const Critical: Story = {
  args: {
    title: 'Erreurs/min',
    value: 23,
    unit: 'err/min',
    trend: 'up',
    status: 'critical',
  },
};

export const Stable: Story = {
  args: { title: 'Requêtes totales', value: '12 847', trend: 'stable', status: 'good' },
};

export const NoTrend: Story = {
  args: { title: 'Version runtime', value: '31.2.37', status: 'good' },
};
