import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div className="p-4 text-white">Contenu de la carte par défaut</div>,
  },
};

export const Hoverable: Story = {
  args: {
    hoverable: true,
    children: <div className="p-4 text-white">Carte interactive (hover me)</div>,
  },
};

export const Elevated: Story = {
  args: {
    elevated: true,
    children: <div className="p-4 text-white">Carte élevée avec ombre forte</div>,
  },
};

export const WithHeaderAndContent: Story = {
  render: () => (
    <Card style={{ width: 300 }}>
      <CardHeader>
        <h2 style={{ color: 'white', margin: 0 }}>Titre de la carte</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Sous-titre</p>
      </CardHeader>
      <CardContent>
        <p style={{ color: '#d1d5db' }}>Corps de la carte avec contenu.</p>
      </CardContent>
      <CardFooter>
        <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Pied de carte</span>
      </CardFooter>
    </Card>
  ),
};
