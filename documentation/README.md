# TITANE∞ — Docusaurus Documentation Site

This directory (`documentation/`) contains the **Docusaurus-based documentation website** for TITANE∞.

## Relationship to `docs/`

| Directory        | Purpose                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `../docs/`       | **Source material** — canonical Markdown documentation (architecture, governance, cartography, audits, etc.) |
| `documentation/` | **Docusaurus site** — rendered web documentation built on top of the source material                         |

The `docs/` directory is the single source of truth for written documentation. The Docusaurus site consumes that content.

## Getting Started

```bash
# Install dependencies
cd documentation
npm install

# Start local dev server
npm start

# Build static site
npm run build
```

## Configuration

- `docusaurus.config.ts` — Main Docusaurus configuration
- `sidebars.ts` — Sidebar navigation structure

## See Also

- [Source documentation (docs/)](../docs/README.md)
- [Architecture overview](../docs/01_architecture/)
- [Governance](../docs/governance/)
