import type { Meta, StoryObj } from '@storybook/react';
import { TrendGraph } from '@/components/devtools/TrendGraph';

const meta = {
  title: 'DevTools/TrendGraph',
  component: TrendGraph,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
} satisfies Meta<typeof TrendGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Date.now();
const makeData = (values: number[]) =>
  values.map((value, i) => ({ timestamp: now + i * 1000, value }));

export const UpTrend: Story = {
  args: {
    data: makeData([10, 15, 12, 20, 18, 25, 30, 28, 35]),
    color: '#34d399',
  },
};

export const DownTrend: Story = {
  args: {
    data: makeData([40, 35, 38, 30, 25, 22, 18, 15, 10]),
    color: '#f87171',
  },
};

export const Volatile: Story = {
  args: {
    data: makeData([20, 45, 10, 60, 5, 50, 25, 70, 15, 55]),
    color: '#facc15',
    width: 300,
    height: 80,
  },
};

export const Empty: Story = {
  args: { data: [] },
};
