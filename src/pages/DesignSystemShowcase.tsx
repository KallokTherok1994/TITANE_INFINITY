/**
 * TITANE∞ v26.2.0 — Design System Showcase
 * Interactive reference for Titanium Dark components
 * Demonstrates all component variants and states
 */

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

export default function DesignSystemShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-titanium-bg-base p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4 pb-8 border-b border-titanium-border-default">
          <h1 className="text-3xl font-bold text-titanium-text-primary">
            TITANE∞ Design System
          </h1>
          <p className="text-lg text-titanium-text-secondary">
            Titanium Dark — Monochrome Premium UI Components
          </p>
          <p className="text-base text-titanium-text-tertiary">
            WCAG 2.2 AA Compliant • 4px Spacing Rhythm • 16px Border Radius
          </p>
        </header>

        {/* Colors Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-titanium-text-primary">
            Color Palette
          </h2>
          
          {/* Backgrounds */}
          <Card>
            <CardHeader>
              <CardTitle>Backgrounds (Layered Depth)</CardTitle>
              <CardDescription>Off-black monochrome palette</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-24 rounded bg-titanium-bg-base border border-titanium-border-default" />
                  <p className="text-sm text-titanium-text-secondary">bg-base</p>
                  <code className="text-xs text-titanium-text-tertiary">#0f0f0f</code>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded bg-titanium-bg-elevated border border-titanium-border-default" />
                  <p className="text-sm text-titanium-text-secondary">bg-elevated</p>
                  <code className="text-xs text-titanium-text-tertiary">#1a1a1a</code>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded bg-titanium-bg-interactive border border-titanium-border-default" />
                  <p className="text-sm text-titanium-text-secondary">bg-interactive</p>
                  <code className="text-xs text-titanium-text-tertiary">#242424</code>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded bg-titanium-bg-overlay border border-titanium-border-default" />
                  <p className="text-sm text-titanium-text-secondary">bg-overlay</p>
                  <code className="text-xs text-titanium-text-tertiary">#2e2e2e</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Text Colors (High Contrast)</CardTitle>
              <CardDescription>WCAG AAA 7:1 to AA 4.5:1 contrast</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-titanium-text-primary text-lg">
                  Primary text — #f5f5f5 (7:1 AAA)
                </p>
                <p className="text-titanium-text-secondary text-base">
                  Secondary text — #b8b8b8 (4.8:1 AA+)
                </p>
                <p className="text-titanium-text-tertiary text-sm">
                  Tertiary text — #8a8a8a (3.2:1 UI minimum)
                </p>
                <p className="text-titanium-text-disabled text-xs">
                  Disabled text — #5a5a5a (non-interactive)
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Button Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-titanium-text-primary">
            Buttons
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>All button styles with Titanium Dark palette</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Default size */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-titanium-text-secondary">Default Size</p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary Action</Button>
                    <Button variant="default">Default</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>

                {/* States */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-titanium-text-secondary">States</p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" loading={loading}>
                      {loading ? 'Loading...' : 'Click to Load'}
                    </Button>
                    <Button variant="primary" disabled>Disabled</Button>
                    <Button 
                      variant="primary"
                      onClick={() => {
                        setLoading(true);
                        setTimeout(() => setLoading(false), 2000);
                      }}
                    >
                      Test Loading
                    </Button>
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-titanium-text-secondary">Sizes</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" size="sm">Small</Button>
                    <Button variant="primary" size="default">Default</Button>
                    <Button variant="primary" size="lg">Large</Button>
                    <Button variant="primary" size="icon" aria-label="Icon button">
                      ✨
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Card Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-titanium-text-primary">
            Cards
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>Base elevated surface</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-titanium-text-secondary">
                  Default card with subtle shadow and border.
                </p>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardHeader>
                <CardTitle>Hoverable Card</CardTitle>
                <CardDescription>Interactive with hover</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-titanium-text-secondary">
                  Hover me to see the transition effect.
                </p>
              </CardContent>
            </Card>

            <Card elevated>
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Stronger presence</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-titanium-text-secondary">
                  Higher elevation with shadow-md.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Input Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-titanium-text-primary">
            Inputs
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Input States</CardTitle>
              <CardDescription>Accessible form inputs with WCAG 2.2 compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-w-md">
                <Input
                  id="name"
                  label="Full Name"
                  placeholder="John Doe"
                  helper="Enter your full name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />

                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  helper="We'll never share your email"
                />

                <Input
                  id="error-example"
                  label="With Error"
                  error="This field is required"
                  placeholder="Enter something"
                />

                <Input
                  id="success-example"
                  label="With Success"
                  success
                  value="validated@email.com"
                  readOnly
                />

                <Input
                  id="disabled-example"
                  label="Disabled Input"
                  placeholder="Cannot type here"
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badge Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-titanium-text-primary">
            Badges
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>Status indicators and tags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-titanium-text-secondary">Default Size</p>
                  <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="error">Error</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="info">Info</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-titanium-text-secondary">Small Size</p>
                  <div className="flex flex-wrap gap-3">
                    <Badge size="sm">Tag</Badge>
                    <Badge size="sm" variant="success">Active</Badge>
                    <Badge size="sm" variant="error">Failed</Badge>
                    <Badge size="sm" variant="warning">Pending</Badge>
                    <Badge size="sm" variant="info">Beta</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-titanium-text-primary">
            Typography
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Type Scale</CardTitle>
              <CardDescription>1.250 ratio (Major Third)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-titanium-text-tertiary mb-1">text-3xl • 31px • Hero</p>
                  <p className="text-3xl font-bold text-titanium-text-primary">The quick brown fox</p>
                </div>
                <div>
                  <p className="text-xs text-titanium-text-tertiary mb-1">text-2xl • 25px • H1</p>
                  <h1 className="text-2xl font-bold text-titanium-text-primary">Page Title</h1>
                </div>
                <div>
                  <p className="text-xs text-titanium-text-tertiary mb-1">text-xl • 20px • H2</p>
                  <h2 className="text-xl font-semibold text-titanium-text-primary">Section Heading</h2>
                </div>
                <div>
                  <p className="text-xs text-titanium-text-tertiary mb-1">text-lg • 18px • Subheading</p>
                  <p className="text-lg text-titanium-text-primary">Large emphasis text</p>
                </div>
                <div>
                  <p className="text-xs text-titanium-text-tertiary mb-1">text-base • 16px • Body</p>
                  <p className="text-base text-titanium-text-secondary">This is standard body text with good readability.</p>
                </div>
                <div>
                  <p className="text-xs text-titanium-text-tertiary mb-1">text-sm • 14px • Small</p>
                  <p className="text-sm text-titanium-text-secondary">Secondary information and captions.</p>
                </div>
                <div>
                  <p className="text-xs text-titanium-text-tertiary mb-1">text-xs • 12px • Metadata</p>
                  <p className="text-xs text-titanium-text-tertiary">Labels and metadata only.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-titanium-border-default">
          <p className="text-sm text-titanium-text-tertiary">
            TITANE∞ v26.2.0 • Titanium Dark Design System
          </p>
          <p className="text-xs text-titanium-text-disabled mt-2">
            WCAG 2.2 AA Compliant • Monochrome Premium UI
          </p>
        </footer>
      </div>
    </div>
  );
}
