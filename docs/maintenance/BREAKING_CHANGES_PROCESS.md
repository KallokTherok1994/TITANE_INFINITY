# ⚠️ TITANE∞ Breaking Changes Process v27.0.0

**Document Version**: 1.0.0  
**Last Updated**: 31 January 2026  
**Breaking Changes Owner**: Kevin Thibault + Product Team  
**Status**: ACTIVE ✅

---

## Table of Contents

1. [Overview](#overview)
2. [Types of Breaking Changes](#types-of-breaking-changes)
3. [Deprecation Timeline](#deprecation-timeline)
4. [Communication Strategy](#communication-strategy)
5. [Migration Guides](#migration-guides)
6. [Version Bumping](#version-bumping)
7. [Approval Process](#approval-process)
8. [Examples](#examples)

---

## Overview

### Purpose

Define how TITANE∞ manages API breaking changes, feature removals, and configuration updates while minimizing user disruption and maintaining transparency.

### Principles

1. **Respect User Investments**: Give users time to migrate (minimum 3 major versions)
2. **Communicate Early**: Announce deprecations immediately, not at removal
3. **Provide Paths**: Offer migration guides for every breaking change
4. **Document Everything**: Record all breaking changes in release notes
5. **Maintain Backwards Compatibility**: Support old APIs for 2+ versions after deprecation
6. **Test Thoroughly**: All breaking changes must pass full regression test suite

---

## Types of Breaking Changes

### Category 1: API Breaking Changes

**Impact**: 🔴 CRITICAL

Examples:
- Removing a Tauri command
- Changing command parameter names
- Changing response structure
- Changing error codes

**Timeline**: 3-major-version deprecation cycle

```
v27.0.0: Feature announced as "to be deprecated"
v28.0.0: Feature marked as DEPRECATED, warning on use
v29.0.0: Feature still works, warnings continue
v30.0.0: Feature REMOVED
```

### Category 2: Configuration Breaking Changes

**Impact**: 🟠 HIGH

Examples:
- JSON config structure changes
- New required environment variables
- Configuration file format changes (YAML → TOML)
- Changing default values

**Timeline**: 2-major-version cycle (or with migration script)

```
v27.0.0: New format introduced, old format supported
v28.0.0: Both formats supported, migration script provided
v29.0.0: New format required, auto-migration on startup
```

### Category 3: Dependency Breaking Changes

**Impact**: 🟡 MEDIUM

Examples:
- Minimum Node.js version bump
- Rust toolchain update
- Dropping support for old OS (e.g., Windows 7)

**Timeline**: 1-major-version notice

```
v27.0.0: Support ending announced
v28.0.0: Support dropped, error message shown
```

### Category 4: Behavior Breaking Changes

**Impact**: 🟡 MEDIUM

Examples:
- Changing algorithm or output format
- Performance characteristics change
- Memory usage changes significantly

**Timeline**: 2-major-version cycle

```
v27.0.0: New behavior announced as "experimental"
v28.0.0: New behavior becomes default, old behavior optional (flag)
v29.0.0: Old behavior removed
```

---

## Deprecation Timeline

### Standard Deprecation Cycle (3 Major Versions)

#### Phase 1: Announcement (Major Version N)

**When**: Feature planning begins  
**Who**: Product team

**Actions**:
- [x] Document deprecation decision (in GitHub issue)
- [x] Calculate removal date (N+3 at minimum)
- [x] Plan migration guide (draft)
- [x] Notify early adopters (1-on-1 if known)

**Communication**:
```markdown
## Deprecation Notice: [Feature Name]

**Status**: DEPRECATED (as of v27.0.0)  
**Removal Date**: v30.0.0 (estimated Q1 2027)  
**Migration Guide**: See [MIGRATION_GUIDE_URL]

This feature will be removed in 3 major versions.
See our migration guide for upgrade instructions.

**Questions?** Discuss in [GitHub Discussions URL]
```

#### Phase 2: Active Deprecation (Major Version N+1)

**When**: Next major release  
**Who**: Development team

**Actions**:
- [x] Add deprecation warning to feature
- [x] Update documentation (mark as "deprecated")
- [x] Publish migration guide
- [x] Update CHANGELOG with deprecation notice
- [x] Announce on GitHub Discussions

**Code Changes**:
```rust
// Example: Deprecated Tauri command
#[tauri::command]
pub async fn old_command(param: String) -> Result<String> {
    eprintln!("⚠️  WARNING: old_command is deprecated as of v27.1.0");
    eprintln!("    Will be removed in v30.0.0");
    eprintln!("    See: [migration guide URL]");
    
    // Still works, but with warning
    todo!()
}
```

**Documentation Update**:
```markdown
### ⚠️ DEPRECATED: Old Command

> **Deprecation Notice**: This command is deprecated as of v27.1.0 and will be 
> removed in v30.0.0. Please use [new_command](./new_command.md) instead.
>
> [Read the migration guide →](./MIGRATION_v27_v30.md)
```

#### Phase 3: Final Warning (Major Version N+2)

**When**: One release before removal  
**Who**: Development team

**Actions**:
- [x] Escalate deprecation warnings (error log instead of warning)
- [x] Final migration deadline reminder
- [x] Prepare removal for next version
- [x] Post final announcement

**Code Changes**:
```rust
// Final notice before removal
pub async fn old_command(param: String) -> Result<String> {
    eprintln!("🔴 ERROR: old_command is DEPRECATED and will be REMOVED in v30.0.0");
    eprintln!("           Upgrade immediately! [migration guide URL]");
    
    // Still works, but with strong warning
    todo!()
}
```

#### Phase 4: Removal (Major Version N+3)

**When**: Planned removal date  
**Who**: Development team

**Actions**:
- [x] Remove deprecated feature completely
- [x] Remove related documentation
- [x] Update changelog with removal notice
- [x] Announce removal

**Changelog Entry**:
```markdown
### BREAKING: Removed Features in v30.0.0

- **Removed**: `old_command` Tauri command (deprecated since v27.1.0)
  - Use `new_command` instead
  - See [Migration Guide v27-v30](./MIGRATION_v27_v30.md)

- **Removed**: `.titanerc` configuration format
  - Use `.titane.json` instead (introduced in v27.0.0)
  - Automatic migration available
```

---

## Communication Strategy

### Timeline & Channels

| Phase | Timing | Channel | Audience |
|-------|--------|---------|----------|
| Announcement | N release | GitHub Release Notes | All users |
| | + 1 week | GitHub Discussions | Engaged users |
| | + 2 weeks | Email newsletter | Subscribers |
| Deprecation | N+1 release | Changelog + Warning | Active users |
| | + 1 month | Blog post | Technical audience |
| Final Notice | N+2 release | Prominent warning | Using-deprecated users |
| | + 1 month | Final email | Late adopters |
| Removal | N+3 release | Release notes | All users |

### Communication Templates

#### Template 1: Deprecation Announcement

```markdown
## 📢 Deprecation Notice: Old Command

**Announced**: v27.0.0 (31 January 2026)  
**Deprecated as of**: v27.1.0 (30 April 2026)  
**Removal planned**: v30.0.0 (January 2027)  
**Time to migrate**: 9 months minimum

### What's Changing?

The `old_command` Tauri command will be removed. We're moving to a cleaner API.

### What Should I Do?

1. **Update your code** to use `new_command` instead
2. **See the migration guide**: [docs/migrations/MIGRATION_OLD_COMMAND.md]
3. **Test thoroughly** in your environment
4. **Upgrade TITANE∞** to v30.0.0+ by January 2027

### Migration Example

**Before (deprecated)**:
```typescript
const result = await tauri.invoke('old_command', { param: 'value' });
```

**After (recommended)**:
```typescript
const result = await tauri.invoke('new_command', { param: 'value' });
```

### Questions?

Ask in [GitHub Discussions](link) with the `deprecation` label.

### Timeline Summary

- ✅ Now (v27.0.0): Planning announced
- 📅 April 2026 (v27.1.0): Feature deprecated, warnings begin
- 📅 September 2026 (v29.0.0): Final deprecation notice
- 🛑 January 2027 (v30.0.0): Feature removed

We're giving you ~9 months. That should be plenty of time!
```

#### Template 2: Deprecation Warning (In Code)

```rust
#[tauri::command]
pub async fn deprecated_feature() -> Result<String> {
    // Log deprecation notice
    eprintln!("{}", 
        "\n⚠️  DEPRECATION WARNING\n\
        Tauri command 'deprecated_feature' is deprecated and will be removed in v30.0.0.\n\
        Removal timeline: v27.1.0 → v28.0.0 → v29.0.0 → v30.0.0 (removed)\n\
        \n\
        Please update your code:\n\
        • Old: await tauri.invoke('deprecated_feature')\n\
        • New: await tauri.invoke('new_feature')\n\
        \n\
        Read the migration guide: docs/migrations/MIGRATION_DEPRECATED_FEATURE.md\n\
        Discussion: https://github.com/TITANE/discussions/[number]\n");
    
    // Still execute (backwards compatible)
    todo!()
}
```

---

## Migration Guides

### Migration Guide Structure

**File**: `docs/migrations/MIGRATION_FEATURE_OLD_TO_NEW.md`

```markdown
# Migration Guide: Old Feature → New Feature

**For**: TITANE∞ v27.0.0 to v30.0.0 users  
**Updated**: 31 January 2026  
**Urgency**: ⚠️  MEDIUM (9 months to migrate)

## Timeline

| Version | Status | What Happens |
|---------|--------|--------------|
| v27.0.0 | Current | Plan announced |
| v27.1.0 | Q2 2026 | Deprecation warnings in code |
| v29.0.0 | Q4 2026 | Final warning, prepare for removal |
| v30.0.0 | Q1 2027 | Feature removed completely |

## What's Changing?

**Old way**:
```typescript
const result = await tauri.invoke('old_command', {
  userId: 123,
  action: 'fetch'
});
```

**New way**:
```typescript
const result = await tauri.invoke('new_command', {
  user_id: 123,
  action: 'fetch'
});
```

**Key differences**:
- Command name: `old_command` → `new_command`
- Parameter naming: `userId` → `user_id` (snake_case)
- Response format: Same, but with additional fields

## Step-by-Step Migration

### 1. Update Dependencies (if needed)

```bash
# Ensure you're on v27.0.0 or later
npm list titane-sdk

# Upgrade if needed
npm install titane-sdk@latest
```

### 2. Find All Uses of Old Command

```bash
# Search your codebase
grep -r "old_command" src/

# Should find: ❌ old_command
# Need to replace with: ✅ new_command
```

### 3. Update Each Call

**Example 1: Simple replacement**
```typescript
// Before
const data = await tauri.invoke('old_command', { id: 5 });

// After
const data = await tauri.invoke('new_command', { id: 5 });
```

**Example 2: Parameter name changes**
```typescript
// Before
await tauri.invoke('old_command', {
  userId: user.id,
  groupId: group.id
});

// After
await tauri.invoke('new_command', {
  user_id: user.id,
  group_id: group.id
});
```

### 4. Test Changes

```bash
# Run your test suite
npm run test

# Manual testing
npm run dev

# Check console for warnings
# (Should see no old_command calls)
```

### 5. Upgrade TITANE∞ (When Ready)

```bash
# When you've migrated all code
npm install titane@v30.0.0
```

## Complete Example

### Before (v27.0.0)

```typescript
// src/services/chat.ts
import { invoke } from '@tauri-apps/api/tauri';

export async function sendChatMessage(message: string) {
  const response = await tauri.invoke('old_command', {
    message: message,
    userId: currentUser.id
  });
  return response;
}
```

### After (v30.0.0 ready)

```typescript
// src/services/chat.ts
import { invoke } from '@tauri-apps/api/tauri';

export async function sendChatMessage(message: string) {
  const response = await tauri.invoke('new_command', {
    message: message,
    user_id: currentUser.id  // Parameter renamed
  });
  return response;
}
```

## FAQ

**Q: How much time do I have?**  
A: From now until v30.0.0 (January 2027), approximately 9 months.

**Q: Will old code stop working immediately?**  
A: No. The old command will work until v30.0.0, but you'll see warnings.

**Q: Can you keep old_command for longer?**  
A: Unlikely, but discuss in [GitHub Discussions](link). We prioritize API stability.

**Q: Will there be automatic migration tools?**  
A: Not for this change, but the migration is simple. See examples above.

## Need Help?

- 📖 [Full API Documentation](../api/OPENAPI_GUIDE_v27.0.0.md)
- 💬 [GitHub Discussions - Migrations](link)
- 🐛 [Report Issues](link)
- 📧 [Email Support](support@titane.ai)

---

**Status**: Ready for v27.1.0 release  
**Last Updated**: 31 January 2026
```

---

## Version Bumping

### Semantic Versioning Rules

TITANE∞ follows **Semantic Versioning** (MAJOR.MINOR.PATCH):

| Change Type | Version Bump | Example |
|-------------|---|---|
| Breaking API change | MAJOR | v27.0.0 → v28.0.0 |
| New feature (backwards compatible) | MINOR | v27.0.0 → v27.1.0 |
| Bug fix | PATCH | v27.0.0 → v27.0.1 |
| Security fix | PATCH (or MINOR) | v27.0.0 → v27.0.1 or v27.1.0 |

### Breaking Change Versioning

```
Initial (v27.0.0):
- Feature works normally
- No warnings
- Not documented as deprecated

After major bump (v28.0.0):
- Feature still works
- Warning in logs
- Documentation marked as "deprecated"
- Release notes explain deprecation

After major bump (v29.0.0):
- Feature still works
- Strong warning in logs
- Documentation emphasizes "will be removed"
- Last version before removal

Final (v30.0.0):
- Feature removed
- Using removed API causes error
- Error message points to migration guide
```

---

## Approval Process

### Breaking Change Approval Checklist

```markdown
## Breaking Change: [Feature Name]

### Initiation (Product Team)
- [ ] Decision documented in GitHub issue
- [ ] Impact assessed (# users affected)
- [ ] Removal date determined (3+ major versions out)
- [ ] Migration path identified
- [ ] Timeline approved by Kevin Thibault

### Planning (Product + Dev)
- [ ] Deprecation timeline agreed
- [ ] Migration guide drafted
- [ ] Communication plan created
- [ ] Code changes designed

### Implementation (Dev Team)
- [ ] Code review completed
- [ ] Tests added for deprecation behavior
- [ ] Documentation updated
- [ ] Changelog entry added
- [ ] Migration guide finalized

### Release (All)
- [ ] Release notes posted
- [ ] GitHub Discussions announcement
- [ ] Email notification sent
- [ ] Blog post published (if major)

### Ongoing (Dev + Support)
- [ ] Monitor for user migration progress
- [ ] Respond to migration questions
- [ ] Collect feedback on migration difficulty
- [ ] Adjust timeline if needed (rare)

### Sign-Off
- [x] Approved by: Kevin Thibault
- [x] Documented in: [GitHub issue #XXX]
- [x] Ready to: Announce in v[X.X.X]
```

---

## Examples

### Example 1: Removing Old Chat API

**Change**: Replace `send_message_old` with `send_message_v2`

**Timeline**:
```
v27.0.0 (Jan 2026): Announcement
v27.1.0 (Apr 2026): Warnings added
v28.0.0 (Jul 2026): Migration window
v29.0.0 (Oct 2026): Final warnings
v30.0.0 (Jan 2027): Removed
```

**Migration Effort**: Low (simple rename)

---

### Example 2: Configuration Format Change

**Change**: JSON config → YAML config

**Timeline**:
```
v27.0.0 (Jan): Announcement
v27.1.0 (Apr): Both formats supported
v28.0.0 (Jul): Auto-migration on startup
v29.0.0 (Oct): JSON removed, YAML required
```

**Migration Effort**: Medium (auto-migration helps)

---

## Quality Checklist

- [x] Deprecation phases clearly defined (4 phases)
- [x] Communication templates provided
- [x] Migration guide structure specified
- [x] Version bumping rules established
- [x] Approval process documented
- [x] Examples included for common scenarios
- [x] Minimum deprecation cycle defined (3 major versions)

**Status**: ✅ READY FOR IMPLEMENTATION

**Next Document**: `QUALITY_ASSURANCE_PROTOCOL.md`

---

**Document Created**: 31 January 2026  
**First Use**: v28.0.0 (when first breaking change planned)  
**Approval Status**: DRAFT (pending policy review)
