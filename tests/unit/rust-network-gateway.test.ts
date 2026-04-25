import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Anti-regression: One Door Network Gateway (Rule 5)
 *
 * Ensures that:
 *  1. The gateway module exists at src-tauri/src/gateway/network.rs
 *  2. The three Tauri command files that make HTTP calls use the gateway
 *     instead of constructing reqwest::Client::builder() directly.
 */

const rootDir = path.resolve(import.meta.dirname, '../..');

const gatewaySource = fs.readFileSync(
  path.join(rootDir, 'src-tauri/src/gateway/network.rs'),
  'utf8'
);
const httpCommands = fs.readFileSync(
  path.join(rootDir, 'src-tauri/src/commands/http_commands.rs'),
  'utf8'
);
const ragCommands = fs.readFileSync(
  path.join(rootDir, 'src-tauri/src/commands/rag_commands.rs'),
  'utf8'
);
const webSearchCommands = fs.readFileSync(
  path.join(rootDir, 'src-tauri/src/commands/web_search_commands.rs'),
  'utf8'
);
const libRs = fs.readFileSync(path.join(rootDir, 'src-tauri/src/lib.rs'), 'utf8');

describe('One Door Network Gateway — anti-regression (Rule 5)', () => {
  it('gateway module declares build_http_client()', () => {
    expect(gatewaySource).toContain('pub fn build_http_client(');
  });

  it('gateway module declares build_http_client_with_user_agent()', () => {
    expect(gatewaySource).toContain('pub fn build_http_client_with_user_agent(');
  });

  it('lib.rs declares the gateway module', () => {
    expect(libRs).toContain('pub mod gateway');
  });

  it('http_commands.rs uses gateway, not direct reqwest::Client::builder()', () => {
    expect(httpCommands).not.toContain('reqwest::Client::builder()');
    expect(httpCommands).not.toContain('Client::builder()');
    // The file uses `use titane_infinity::gateway::network;` then `network::build_http_client`.
    expect(httpCommands).toMatch(/gateway::network|network::build_http_client/);
  });

  it('rag_commands.rs uses gateway, not direct reqwest::Client::builder()', () => {
    expect(ragCommands).not.toContain('reqwest::Client::builder()');
    expect(ragCommands).not.toContain('Client::builder()');
    expect(ragCommands).toMatch(/gateway::network|network::build_http_client/);
  });

  it('web_search_commands.rs uses gateway, not direct reqwest::Client::builder()', () => {
    expect(webSearchCommands).not.toContain('reqwest::Client::builder()');
    expect(webSearchCommands).not.toContain('Client::builder()');
    expect(webSearchCommands).toMatch(/gateway::network|network::build_http_client/);
  });
});
