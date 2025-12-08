# TITANE∞ v17.1 - Component Reference

## 🎯 Quick Component Lookup

### Import Patterns

```tsx
// UI Primitives
import { Button, Card, Input, Modal, Badge, Spinner } from '@ui';

// Layout Components
import { AppShell, Grid, Container, Stack, Sidebar, Header } from '@components/layout';

// Cognitive Features
import { 
  HeliosVisualization, 
  NexusGraph, 
  HarmoniaPatterns, 
  MemoryTimeline 
} from '@features/cognitive';

// Progression Features
import { XPProgressBar, TalentTree } from '@features/progression';

// Chat Features
import { ChatMessage, ChatInput, ChatContextPanel } from '@features/chat';

// Theme System
import { ThemeProvider, useTheme } from '@themes';
import { colors, spacing, fontSizes, radius, shadows } from '@themes/tokens';

// Tauri Services
import { tauri } from '@services/tauri';
```

---

## 📦 UI Primitives

### Button
```tsx
<Button 
  variant="primary"        // primary | secondary | ghost | danger
  size="md"                // sm | md | lg
  loading={false}
  disabled={false}
  leftIcon="🚀"
  rightIcon="→"
  onClick={handleClick}
  fullWidth={false}
>
  Click me
</Button>
```

### Card
```tsx
<Card
  variant="glass"          // solid | glass | translucent | bordered
  elevation="lg"           // none | sm | md | lg | xl
  hoverable={true}
  padding={4}              // 0-16 (spacing units)
>
  Content
</Card>
```

### Input
```tsx
<Input
  size="md"                // sm | md | lg
  state="default"          // default | error | success | warning
  label="Email"
  helperText="Enter your email"
  leftIcon="📧"
  rightIcon="✓"
  placeholder="email@example.com"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Modal
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"                // sm | md | lg | xl | full
  closeOnEscape={true}
  closeOnOverlayClick={true}
>
  Modal content
</Modal>
```

### Badge
```tsx
<Badge
  variant="primary"        // primary | success | warning | error | info | neutral
  size="md"                // sm | md | lg
  dot={false}
>
  New
</Badge>
```

### Spinner
```tsx
<Spinner
  size="md"                // sm | md | lg | xl
  variant="primary"        // primary | secondary | neutral
/>
```

---

## 📐 Layout Components

### AppShell
```tsx
<AppShell
  sidebar={<Sidebar items={items} />}
  header={<Header title="TITANE∞" />}
  footer={<Footer />}
  sidebarCollapsed={false}
>
  {children}
</AppShell>
```

### Grid
```tsx
<Grid 
  columns={3}              // 1 | 2 | 3 | 4 | 6 | 12
  gap={4}                  // spacing units
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

### Container
```tsx
<Container 
  size="xl"                // sm | md | lg | xl | full
  padding={6}
>
  Centered content
</Container>
```

### Stack
```tsx
<Stack
  direction="vertical"     // horizontal | vertical
  gap={4}
  align="center"           // flex-start | center | flex-end | stretch
  justify="space-between"  // flex-start | center | flex-end | space-between | space-around
  wrap={false}
>
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

### Sidebar
```tsx
<Sidebar
  items={[
    { 
      id: 'home', 
      label: 'Home', 
      icon: '🏠', 
      badge: '3',
      children: [...]       // optional sub-items
    }
  ]}
  activeItemId="home"
  onItemClick={(id) => navigate(id)}
  collapsed={false}
  onToggle={() => setCollapsed(!collapsed)}
/>
```

### Header
```tsx
<Header
  logo={<Logo />}
  title="TITANE∞"
  subtitle="v17.1.0"
  navigation={<Nav />}
  actions={<Actions />}
/>
```

---

## 🧠 Cognitive Visualizations

### HeliosVisualization
```tsx
<HeliosVisualization
  metrics={{
    stress_level: 0.2,      // 0-1
    clarity_level: 0.85,    // 0-1
    energy_level: 0.82,     // 0-1
    focus_level: 0.78,      // 0-1
    cognitive_load: 0.45,   // 0-1
    emotional_tone: 'Calm'
  }}
/>
```

### NexusGraph
```tsx
<NexusGraph
  nodes={[
    {
      id: 'n1',
      label: 'React',
      type: 'skill',        // concept | fact | skill | memory
      x: 150,
      y: 100,
      connections: 5,
      importance: 0.9       // 0-1
    }
  ]}
  edges={[
    {
      source: 'n1',
      target: 'n2',
      strength: 0.9         // 0-1
    }
  ]}
/>
```

### HarmoniaPatterns
```tsx
<HarmoniaPatterns
  patterns={[
    {
      id: 'p1',
      name: 'Deep Work',
      category: 'productivity', // productivity | learning | rest | creative
      frequency: 0.85,          // 0-1
      confidence: 0.92,         // 0-1
      hoursMean: 3.5,
      lastOccurrence: new Date()
    }
  ]}
/>
```

### MemoryTimeline
```tsx
<MemoryTimeline
  entries={[
    {
      id: 'mem1',
      type: 'conversation',    // conversation | fact | skill | experience
      content: 'Important discussion',
      timestamp: new Date(),
      importance: 0.9,         // 0-1
      tags: ['architecture', 'design'],
      similarity: 0.92         // 0-1
    }
  ]}
/>
```

---

## ⚡ Progression System

### XPProgressBar
```tsx
<XPProgressBar
  currentXP={2450}
  requiredXP={3000}
  level={12}
  showDetails={true}
/>
```

### TalentTree
```tsx
<TalentTree
  talents={[
    {
      id: 't1',
      name: 'Basic Chat',
      description: 'Unlock basic conversations',
      tier: 1,              // 1-4
      cost: 1,              // talent points required
      category: 'chat',     // chat | voice | code | projects | system
      unlocked: true,
      requirements: [],     // array of talent IDs
      x: 370,               // canvas position
      y: 450
    }
  ]}
  availablePoints={5}
  onUnlock={(talentId) => handleUnlock(talentId)}
/>
```

---

## 💬 Chat Interface

### ChatMessage
```tsx
<ChatMessage
  role="assistant"         // user | assistant | system
  content="Message content"
  timestamp={new Date()}
  streaming={false}
  metadata={{
    cognitiveState: {
      stress: 0.2,
      clarity: 0.85,
      focus: 0.78
    },
    memoryReferences: [
      { id: 'm1', type: 'fact', relevance: 0.92 }
    ],
    processingTime: 123.7
  }}
/>
```

### ChatInput
```tsx
<ChatInput
  value={inputValue}
  onChange={setInputValue}
  onSubmit={handleSend}
  placeholder="Type your message..."
  disabled={false}
  suggestions={[
    {
      id: 's1',
      text: 'Analyze cognitive state',
      category: 'action',   // action | question | command
      icon: '🧠'
    }
  ]}
  maxLength={2000}
/>
```

### ChatContextPanel
```tsx
<ChatContextPanel
  cognitiveState={{
    stress: 0.2,
    clarity: 0.85,
    focus: 0.78,
    energy: 0.82,
    emotionalTone: 'Calm'
  }}
  activeMemories={[
    {
      id: 'm1',
      type: 'conversation', // fact | conversation | skill | experience
      content: 'Previous discussion',
      relevance: 0.92,
      timestamp: new Date()
    }
  ]}
  suggestions={[
    'Review weekly goals',
    'Analyze productivity patterns'
  ]}
  isCollapsed={false}
  onToggle={() => setCollapsed(!collapsed)}
/>
```

---

## 🎨 Theme System

### useTheme Hook
```tsx
const MyComponent = () => {
  const { 
    theme,          // 'rubis' | 'saphir' | 'emeraude' | 'diamant'
    setTheme,       // (theme: ThemeName) => void
    colors,         // Current theme colors
    isTheme,        // (name: ThemeName) => boolean
    nextTheme       // Next theme in rotation
  } = useTheme();

  return (
    <button onClick={() => setTheme(nextTheme)}>
      Current: {theme}
    </button>
  );
};
```

### Design Tokens
```tsx
import { 
  colors,        // Color palettes
  spacing,       // Spacing scale
  fontSizes,     // Font sizes
  fontWeights,   // Font weights
  lineHeights,   // Line heights
  radius,        // Border radius
  shadows,       // Box shadows
  transitions    // Transition durations
} from '@themes/tokens';

// Usage
<div style={{
  color: colors.rubis.primary[500],
  padding: spacing[4],
  fontSize: fontSizes.lg,
  borderRadius: radius.md,
  boxShadow: shadows.lg,
  transition: `all ${transitions.base} ${transitions.ease}`
}}>
  Styled component
</div>
```

---

## 🔧 Tauri Services

### Commands
```tsx
import { tauri } from '@services/tauri';

// Meta-Mode
await tauri.metaMode.process({ input: 'analyze this' });
await tauri.metaMode.getState();

// EXP Engine
await tauri.exp.add({ amount: 100 });
await tauri.exp.getProfile();
await tauri.exp.unlockTalent({ talentId: 't1' });
await tauri.exp.listTalents();

// Memory Engine
await tauri.memory.addEntry({ 
  entryType: 'fact', 
  content: 'Important info',
  tags: ['tag1', 'tag2']
});
await tauri.memory.search({ query: 'search term' });
await tauri.memory.getAll();

// Voice Mode
await tauri.voice.startListening();
await tauri.voice.stopListening();
await tauri.voice.getStatus();

// System
await tauri.system.getStatus();
await tauri.system.shutdown();
```

---

## 🎯 Common Patterns

### Page Layout
```tsx
const MyPage = () => (
  <Container size="xl">
    <Stack direction="vertical" gap={6}>
      <h1>Page Title</h1>
      
      <Grid columns={3} gap={4}>
        <Card variant="glass">Content 1</Card>
        <Card variant="glass">Content 2</Card>
        <Card variant="glass">Content 3</Card>
      </Grid>
    </Stack>
  </Container>
);
```

### Modal Form
```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Form">
  <Stack direction="vertical" gap={4}>
    <Input label="Name" />
    <Input label="Email" type="email" />
    <Button variant="primary" onClick={handleSubmit}>
      Submit
    </Button>
  </Stack>
</Modal>
```

### Loading State
```tsx
{loading ? (
  <Stack align="center" justify="center">
    <Spinner size="lg" />
  </Stack>
) : (
  <Content />
)}
```

### Error State
```tsx
{error ? (
  <Card variant="bordered" elevation="none">
    <Stack direction="vertical" gap={2}>
      <Badge variant="error">Error</Badge>
      <p>{error.message}</p>
      <Button onClick={retry}>Retry</Button>
    </Stack>
  </Card>
) : (
  <Content />
)}
```

---

## 📱 Responsive Patterns

### Responsive Grid
```tsx
<Grid 
  columns={3}        // Desktop: 3 columns
  // Add CSS media queries for mobile
>
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</Grid>
```

### Conditional Rendering
```tsx
const isMobile = window.innerWidth < 768;

{isMobile ? (
  <Stack direction="vertical" gap={2}>
    <MobileNav />
  </Stack>
) : (
  <Grid columns={3} gap={4}>
    <DesktopNav />
  </Grid>
)}
```

---

**Quick Reference for TITANE∞ v17.1**  
**All components type-safe with TypeScript**  
**0 compilation errors guaranteed**
