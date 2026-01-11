---
name: feature-launcher
description: Automates feature-to-marketing workflow by analyzing codebase changes, extracting marketable features, generating feature briefs, and triggering multi-channel marketing content. This skill should be used when launching new features, preparing release marketing, or generating changelogs from development work.
---

# Feature Launcher

Automates the complete feature-to-marketing workflow by analyzing codebase changes, generating feature briefs with Strategy v2 messaging hooks, and orchestrating multi-channel marketing content generation.

## When to Use This Skill

- Preparing marketing for a new feature launch
- Generating changelogs from git commits
- Creating feature briefs from codebase analysis
- Triggering multi-channel marketing campaign creation
- Extracting marketable features from development work

## Commands

### Analyze Codebase

Extract marketable features from git history.

```
/feature-launcher analyze --since=v1.1.0     # Analyze commits since tag
/feature-launcher analyze --since=main       # Analyze commits since branch
/feature-launcher analyze --days=7           # Analyze last N days
/feature-launcher analyze --days=30 --app=webapp  # Filter by app
```

### Generate Feature Brief

Create marketing-ready feature brief.

```
/feature-launcher brief --feature="Real-time Sync"    # From analysis
/feature-launcher brief --from-prd --section="5.4"    # From PRD section
/feature-launcher brief --commits=abc123,def456       # From specific commits
```

### Full Launch Pipeline

Run complete feature-to-marketing automation.

```
/feature-launcher launch --feature="Real-time Sync"   # Full pipeline
/feature-launcher launch --feature="Board Styling" --campaign-type=feature-launch
/feature-launcher launch --dry-run                     # Preview without saving
```

### Changelog

Generate user-facing changelog.

```
/feature-launcher changelog --version=1.2.0           # For specific version
/feature-launcher changelog --since=v1.1.0            # Since tag
/feature-launcher changelog --format=app-store        # App Store format
/feature-launcher changelog --format=github           # GitHub release format
```

## Workflow

### Analyze Phase

When `/feature-launcher analyze` is invoked:

1. **Run `scripts/extract_features.py`** to parse git commits:
   ```bash
   python3 .claude/skills/feature-launcher/scripts/extract_features.py --since=v1.1.0
   ```

2. **Parse conventional commits** (feat:, fix:, perf:, etc.)

3. **Group related commits** by scope and timeframe

4. **Categorize by marketing potential**:
   - **high**: User-facing features (feat commits in UI/API layers)
   - **medium**: Improvements (feat in internal layers)
   - **low**: Technical (refactor, chore, docs)

5. **Map to Strategy v2 pillars**:
   - `sync`, `organize`, `label`, `search`, `group`, `summary` → `ai-organization`
   - `design`, `style`, `visual`, `theme`, `board`, `layout` → `ai-design`

6. **Output JSON** to stdout or file

### Brief Generation Phase

When `/feature-launcher brief` is invoked:

1. **Load analysis output** (or run analyze if needed)

2. **Read Strategy v2 sources**:
   - `marketing/messaging.md` - Voice, tone, ICP pain points
   - `marketing/strategy.md` - Pillars, use cases
   - `references/pillar-mapping.md` - Keyword → pillar mapping

3. **Generate feature brief** using template:
   - Map technical changes to user benefits
   - Generate platform-specific hooks
   - Identify required assets
   - Create changelog entries

4. **Save brief** to `marketing/product/briefs/generated/YYYY-MM-DD-feature-name.md`

### Launch Phase

When `/feature-launcher launch` is invoked:

1. **Run analyze** (if not already done)

2. **Generate brief** (if not already done)

3. **Create campaign** via integration:
   ```
   /marketing-campaign create --from-brief="path/to/brief.md"
   ```

   This triggers the existing pipeline:
   - `/marketing-copy --from-brief=...` → Channel-specific copy
   - `/aso-optimizer whats-new --version=X.X` → App Store updates
   - `/social-scheduler --from-brief=...` → Content calendar
   - `/marketing-assets specs --campaign=...` → Asset requirements

4. **Output** campaign directory at `marketing/campaigns/active/{slug}/`

## Source References

| Document | Path | Use For |
|----------|------|---------|
| Strategy v2 | `marketing/strategy.md` | ICP, pillars, use cases |
| Messaging | `marketing/messaging.md` | Voice, tone, pain points |
| Feature Registry | `marketing/product/features/_index.yaml` | Existing features |
| PRD | `ToonNotes_Expo/PRD.md` | Feature descriptions |
| Pillar Mapping | `references/pillar-mapping.md` | Keyword → pillar |

## Output Locations

| Type | Output Path |
|------|-------------|
| Analysis JSON | `marketing/product/briefs/analysis-YYYY-MM-DD.json` |
| Feature Briefs | `marketing/product/briefs/generated/YYYY-MM-DD-{feature-slug}.md` |
| Changelogs | `marketing/product/releases/v{X.X.X}/release-notes.md` |
| Campaigns | `marketing/campaigns/active/{campaign-slug}/` |

## Feature Brief Template

See: `marketing/product/briefs/templates/feature-brief.md`

Brief includes:
- YAML frontmatter (id, name, status, pillar, version)
- Summary (2-3 sentences)
- User benefit (ICP-focused)
- Pain point addressed (from messaging.md)
- Key messages (3-5 bullets)
- Social hooks (per platform)
- Assets required (checklist)
- Technical details (commits, files, platforms)

## Changelog Formats

### App Store Format (500 chars max)

```markdown
What's New in v1.2.0

Real-time sync keeps your notes updated across all devices. Create beautiful boards with preset styling. Plus: improved performance and bug fixes.

Thanks for being part of ToonNotes!
```

### GitHub Release Format

```markdown
## What's New

### Features
- **Real-time Sync**: Notes sync bidirectionally with cloud
- **Board Styling**: Choose from preset board designs

### Improvements
- Faster note loading
- Reduced memory usage

### Bug Fixes
- Fixed label filtering edge case
```

## Integration with Existing Skills

| Skill | Integration |
|-------|-------------|
| `marketing-campaign` | Accepts `--from-brief` to pre-populate campaign.yaml |
| `marketing-copy` | Accepts `--from-brief` for channel copy generation |
| `social-scheduler` | Accepts `--from-brief` for social hooks |
| `marketing-assets` | Documents asset requirements from brief |

## Privacy Guidelines

**DO NOT include in briefs:**
- Actual code snippets
- API keys or credentials
- Internal implementation details
- User data or PII

**DO include:**
- Feature names and descriptions
- File counts and change statistics
- High-level architectural info
- Public-facing benefits

## Related Skills

- `/marketing-campaign` - Campaign orchestration
- `/marketing-copy` - Copy generation
- `/social-scheduler` - Content calendar
- `/aso-optimizer` - App Store optimization
- `/diary` - Development diary (similar analysis pattern)
