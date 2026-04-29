import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from '@/components/chat/CodeBlock';

const meta = {
  title: 'Chat/CodeBlock',
  component: CodeBlock,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScript: Story = {
  args: {
    language: 'typescript',
    code: `export async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json() as T;
}`,
  },
};

export const Rust: Story = {
  args: {
    language: 'rust',
    code: `#[tauri::command]
pub async fn cognitive_get_state() -> Result<CognitiveState, String> {
    let state = STATE.lock().await;
    Ok(state.clone())
}`,
  },
};

export const Python: Story = {
  args: {
    language: 'python',
    code: `def process_kb_entry(entry: dict) -> dict:
    """Process a knowledge base entry for indexing."""
    return {
        "id": entry["id"],
        "text": entry["content"],
        "embedding": embed(entry["content"]),
    }`,
  },
};

export const JSON: Story = {
  args: {
    language: 'json',
    code: JSON.stringify({ version: '31.2.37', engine: 'gemma2:2b', status: 'active' }, null, 2),
  },
};

export const Bash: Story = {
  args: {
    language: 'bash',
    code: `pnpm run tauri build 2>&1 | grep -E "Finished|error\\[" | tail -5`,
  },
};
