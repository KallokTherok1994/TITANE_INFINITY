# GitHub Copilot Agent Skills

**IP / Attribution**

- Creator: Kevin Thibault (TITANE∞)
- Generated/maintained with GitHub Copilot
- Licensing: governed by repository LICENSE.md

This directory contains reusable Agent Skills for GitHub Copilot. Skills are portable across Copilot CLI, VS Code, and GitHub.com.

## Available Skills

### Architecture Validation

**Location:** `architecture-check/`  
**Purpose:** Validate code changes against the TITANE∞ 4-Ring architecture model.

**Usage:**

```bash
@copilot use skill architecture-check
```

## Creating New Skills

Each skill should be in its own directory with:

- `instructions.md` - Skill instructions
- `scripts/` - Optional automation scripts
- `examples/` - Usage examples

Refer to [GitHub Copilot Agent Skills documentation](https://code.visualstudio.com/docs/copilot/customization/agent-skills) for more details.

## Best Practices

1. **Keep skills focused** - Each skill should do one thing well
2. **Document thoroughly** - Include clear instructions and examples
3. **Test before committing** - Verify skills work as expected
4. **Version control** - Track changes to skills like regular code
5. **Respect project constraints** - All skills must follow `.copilot-rules-permanent.md`
