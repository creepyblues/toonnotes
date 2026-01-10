# Development Diary

Automated development journal for ToonNotes. Captures work sessions from Claude Code history and git commits, generating blog-ready daily entries.

## Public URL

Published entries are available at: `toonnotes.com/development_diary`

## How It Works

```
Claude Code       Git Repository      /diary Skill
history.jsonl  +  commits/diffs   +   manual insights
      |               |                    |
      +---------------+--------------------+
                      |
                      v
            Processing Pipeline
            (categorize, summarize)
                      |
                      v
              drafts/YYYY-MM-DD.md
                      |
                      v
                 Review/Edit
                      |
                      v
          published/YYYY/MM/YYYY-MM-DD.md
```

## Directory Structure

```
development_diary/
├── drafts/                    # Auto-generated entries (not public)
│   └── 2026-01-09.md
├── published/                 # Approved entries (live on web)
│   └── 2026/
│       └── 01/
│           └── 2026-01-09.md
├── screenshots/               # Playwright-captured images
│   └── 2026-01-09/
│       └── feature-preview.png
├── templates/
│   └── daily-entry.md         # Entry template
├── _index.yaml                # Configuration
└── README.md                  # This file
```

## Using the /diary Skill

### Generate an Entry

```bash
# Generate today's entry
/diary generate

# Generate for a specific date
/diary generate --date=2026-01-08

# Include screenshot capture
/diary generate --screenshot
```

### Capture Insights During Sessions

```bash
# Add a decision or learning
/diary add "Decided to use retry logic on client side to reduce API costs"

# With category
/diary add --category=decision "Chose confidence threshold of 0.7"
/diary add --category=learning "Background removal fails on low-contrast images"
```

### Capture Screenshots

```bash
# Auto-named screenshot
/diary screenshot

# Custom name
/diary screenshot --name="quality-preview"
```

### Manage Entries

```bash
# List recent entries
/diary list

# Publish a draft
/diary publish 2026-01-09
```

## Entry Categories

Activities are automatically categorized:

| Category | What It Covers |
|----------|---------------|
| Research | Investigating, exploring, analyzing, comparing |
| Planning | Design decisions, architecture, specs |
| Implementation | Building features, adding functionality |
| Bug Fix | Fixing issues, debugging, error handling |
| Refactoring | Code cleanup, reorganization, optimization |
| Documentation | Updating docs, READMEs, comments |
| Testing | Writing tests, E2E, manual testing |

## Privacy Guidelines

Entries are designed for public sharing. The system automatically:

- Summarizes code changes (no actual snippets)
- Excludes API keys and secrets
- Focuses on high-level decisions and outcomes

## Web Dashboard

Admin access at `toonnotes.com/marketing/diary`:

- View all drafts and published entries
- Edit entries before publishing
- Trigger regeneration for specific dates
- Manage screenshots

## Related

- **Marketing Dashboard**: `/marketing` - Full marketing content management
- **Release Notes**: `/marketing/product/releases/` - Version-specific changelogs
