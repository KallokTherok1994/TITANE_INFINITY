// TITANE∞ v17.1 - Design System Demo Page
import { useState } from 'react';
import { Panel } from '@/ui/components/Panel';
import { Button } from '@/ui/components/Button';
import { Switch } from '@/ui/components/Switch';
import { Checkbox } from '@/ui/components/Checkbox';
import { Radio, RadioGroup } from '@/ui/components/Radio';
import { Textarea } from '@/ui/components/Textarea';
import { Slider } from '@/ui/components/Slider';
import { Select } from '@/ui/components/Select';
import { Toggle } from '@/ui/components/Toggle';
import type { SelectOption, ToggleOption } from '@/ui/components';
import './DesignSystemPage.css';

export function DesignSystemPage() {
  // States for all components
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [terms, setTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [theme, setTheme] = useState('rubis');
  const [description, setDescription] = useState('');
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(50);
  const [country, setCountry] = useState('fr');
  const [view, setView] = useState('grid');

  const countryOptions: SelectOption[] = [
    { value: 'fr', label: '🇫🇷 France' },
    { value: 'us', label: '🇺🇸 États-Unis' },
    { value: 'uk', label: '🇬🇧 Royaume-Uni' },
    { value: 'de', label: '🇩🇪 Allemagne' },
    { value: 'es', label: '🇪🇸 Espagne' },
    { value: 'it', label: '🇮🇹 Italie' },
  ];

  const viewOptions: ToggleOption[] = [
    { value: 'grid', label: 'Grille' },
    { value: 'list', label: 'Liste' },
    { value: 'compact', label: 'Compact' },
  ];

  return (
    <div className="design-system-page">
      <div className="design-system-header">
        <h1 className="design-system-title">Design System v17.1</h1>
        <p className="design-system-subtitle">
          Primitives UI avec Design Tokens optimisés
        </p>
      </div>

      <div className="design-system-grid">
        {/* Button Variants */}
        <Panel title="Button Variants" className="demo-section">
          <div className="button-grid">
            <Button variant="primary" size="sm">Primary Small</Button>
            <Button variant="primary" size="md">Primary Medium</Button>
            <Button variant="primary" size="lg">Primary Large</Button>
            
            <Button variant="secondary" size="md">Secondary</Button>
            <Button variant="ghost" size="md">Ghost</Button>
            <Button variant="danger" size="md">Danger</Button>
            
            <Button variant="glass" size="md">Glass</Button>
            <Button variant="subtle" size="md">Subtle</Button>
            <Button variant="primary" size="md" disabled>Disabled</Button>
          </div>
        </Panel>

        {/* Switch */}
        <Panel title="Switch" className="demo-section">
          <div className="control-stack">
            <Switch
              checked={darkMode}
              onChange={setDarkMode}
              label="Mode sombre"
              size="md"
            />
            <Switch
              checked={notifications}
              onChange={setNotifications}
              label="Notifications"
              size="md"
            />
            <Switch
              checked={false}
              onChange={() => {}}
              label="Désactivé"
              size="md"
              disabled
            />
          </div>
        </Panel>

        {/* Checkbox */}
        <Panel title="Checkbox" className="demo-section">
          <div className="control-stack">
            <Checkbox
              checked={terms}
              onChange={setTerms}
              label="J'accepte les conditions d'utilisation"
              size="md"
            />
            <Checkbox
              checked={newsletter}
              onChange={setNewsletter}
              label="Recevoir la newsletter"
              size="md"
            />
            <Checkbox
              checked={terms && newsletter}
              indeterminate={terms !== newsletter}
              onChange={() => {}}
              label="Tout sélectionner"
              size="md"
            />
            <Checkbox
              checked={false}
              onChange={() => {}}
              label="Désactivé"
              size="md"
              disabled
            />
          </div>
        </Panel>

        {/* Radio */}
        <Panel title="Radio Group" className="demo-section">
          <RadioGroup
            value={theme}
            onChange={setTheme}
            name="theme"
            size="md"
          >
            <Radio value="rubis" label="🔴 Rubis" />
            <Radio value="saphir" label="🔵 Saphir" />
            <Radio value="emeraude" label="🟢 Émeraude" />
            <Radio value="diamant" label="🟣 Diamant" />
          </RadioGroup>
        </Panel>

        {/* Textarea */}
        <Panel title="Textarea" className="demo-section">
          <Textarea
            value={description}
            onChange={setDescription}
            label="Description"
            placeholder="Entrez votre description..."
            autoResize
            maxLength={200}
            showCount
            helperText="Maximum 200 caractères"
            size="md"
          />
        </Panel>

        {/* Slider */}
        <Panel title="Slider" className="demo-section">
          <div className="control-stack">
            <Slider
              value={volume}
              onChange={setVolume}
              min={0}
              max={100}
              step={1}
              label="Volume"
              showValue
              showMarks
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' },
              ]}
              size="md"
            />
            <Slider
              value={brightness}
              onChange={setBrightness}
              min={0}
              max={100}
              step={5}
              label="Luminosité"
              showValue
              size="md"
            />
          </div>
        </Panel>

        {/* Select */}
        <Panel title="Select" className="demo-section">
          <Select
            value={country}
            onChange={setCountry}
            options={countryOptions}
            label="Pays"
            searchable
            helperText="Recherchez ou sélectionnez un pays"
            size="md"
          />
        </Panel>

        {/* Toggle */}
        <Panel title="Toggle" className="demo-section">
          <div className="control-stack">
            <div>
              <label className="demo-label">Vue (default)</label>
              <Toggle
                value={view}
                onChange={setView}
                options={viewOptions}
                variant="default"
                size="md"
              />
            </div>
            <div>
              <label className="demo-label">Vue (pills)</label>
              <Toggle
                value={view}
                onChange={setView}
                options={viewOptions}
                variant="pills"
                size="md"
              />
            </div>
          </div>
        </Panel>

        {/* Sizes Demo */}
        <Panel title="Sizes Comparison" className="demo-section demo-section--wide">
          <div className="sizes-grid">
            <div>
              <label className="demo-label">Small</label>
              <Switch checked={true} onChange={() => {}} size="sm" label="Switch" />
              <Checkbox checked={true} onChange={() => {}} size="sm" label="Checkbox" />
              <Button variant="primary" size="sm">Button</Button>
            </div>
            <div>
              <label className="demo-label">Medium</label>
              <Switch checked={true} onChange={() => {}} size="md" label="Switch" />
              <Checkbox checked={true} onChange={() => {}} size="md" label="Checkbox" />
              <Button variant="primary" size="md">Button</Button>
            </div>
            <div>
              <label className="demo-label">Large</label>
              <Switch checked={true} onChange={() => {}} size="lg" label="Switch" />
              <Checkbox checked={true} onChange={() => {}} size="lg" label="Checkbox" />
              <Button variant="primary" size="lg">Button</Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
