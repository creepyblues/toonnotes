# Strategy v2 Pillar Mapping Reference

Quick reference for mapping features to ToonNotes Strategy v2 pillars.

## The Two Pillars

### Pillar 1: AI Organization
*"Structure without effort"*

AI reads, categorizes, and connects notes automatically. No manual tagging, no folder decisions, no maintenance.

### Pillar 2: AI Design
*"Visualization as organization"*

How notes look IS how they're organized. AI creates visual layouts that make sense of your thoughts.

---

## Keyword → Pillar Mapping

### AI Organization Keywords

| Keyword | Confidence | Example Commit |
|---------|------------|----------------|
| sync | High | "feat: Add real-time sync" |
| organize | High | "feat: Auto-organize notes" |
| label | High | "feat: AI auto-labeling" |
| search | High | "feat: Smart search" |
| group | High | "feat: Smart grouping" |
| summary | High | "feat: AI summaries" |
| categorize | High | "feat: Auto-categorization" |
| tag | Medium | "feat: Auto-tagging" |
| find | Medium | "feat: Quick find" |
| retrieve | Medium | "feat: Better retrieval" |
| index | Medium | "feat: Search indexing" |
| sort | Medium | "feat: Smart sorting" |
| filter | Medium | "feat: Advanced filters" |
| suggest | Medium | "feat: AI suggestions" |
| recommend | Medium | "feat: Recommendations" |
| auto | Low | "feat: Auto-save" |
| smart | Low | "feat: Smart features" |

### AI Design Keywords

| Keyword | Confidence | Example Commit |
|---------|------------|----------------|
| design | High | "feat: AI design generation" |
| style | High | "feat: Note styling" |
| visual | High | "feat: Visual layouts" |
| theme | High | "feat: Custom themes" |
| board | High | "feat: Board layouts" |
| layout | High | "feat: New layouts" |
| aesthetic | High | "feat: Aesthetic presets" |
| color | Medium | "feat: Color picker" |
| border | Medium | "feat: Custom borders" |
| texture | Medium | "feat: Paper textures" |
| template | Medium | "feat: Design templates" |
| beautiful | Medium | "feat: Beautiful exports" |
| export | Medium | "feat: Image export" |
| share | Medium | "feat: Social sharing" |
| image | Low | "feat: Image support" |
| photo | Low | "feat: Photo import" |

---

## Pain Point → Pillar Mapping

| Pain Point | Quote | Pillar |
|------------|-------|--------|
| Retrieval Failure | "I know I saved it but can't find it" | AI Organization |
| Organization Guilt | "I should organize but never do" | AI Organization |
| Visual Overwhelm | "My notes are an ugly mess" | AI Design |
| Tool Fatigue | "I've tried everything, nothing sticks" | AI Organization |
| Sharing Shame | "My notes are too messy to share" | AI Design |
| Identity Gap | "I want my notes to feel like mine" | AI Design |

---

## Feature Category → Pillar Mapping

| Category | Primary Pillar | Secondary Pillar |
|----------|----------------|------------------|
| Sync & Cloud | AI Organization | - |
| Search & Find | AI Organization | - |
| Auto-labeling | AI Organization | - |
| Smart Grouping | AI Organization | AI Design |
| Summaries | AI Organization | - |
| Boards & Layouts | AI Design | AI Organization |
| Themes & Styling | AI Design | - |
| Sharing & Export | AI Design | - |
| Borders & Textures | AI Design | - |
| Templates | AI Design | AI Organization |

---

## Use Case → Pillar Mapping

| Use Case | Board Type | Primary Pillar |
|----------|------------|----------------|
| Studying | Knowledge Map | AI Organization |
| Collecting Ideas | Idea Constellation | AI Organization |
| Drafting Writing | Writing Workspace | Both |
| Trip Planning | Trip Planner | Both |

---

## Marketing Angle by Pillar

### AI Organization Angles

- "Never say 'I know I wrote this somewhere' again"
- "AI organizes so you never have to"
- "Zero setup. Zero maintenance. Zero guilt."
- "From chaos to categorized—automatically"

### AI Design Angles

- "Notes you're finally proud to share"
- "Beautiful without the work"
- "Design IS organization"
- "See your thoughts organized visually"

### Both Pillars Angles

- "Capture everything. Organize nothing. See it beautifully."
- "AI handles structure AND style"
- "The organized, beautiful note life—without the work"

---

## Scoring Rules

When a feature has keywords from both pillars:

1. Count keywords from each pillar
2. If one has 2+ more matches → that pillar
3. If roughly equal → "both"
4. If no matches → "general"

### Example

```
Commit: "feat(board): Add board styling with preset picker"

AI Organization keywords: 0
AI Design keywords: board (1), styling (1), preset (1) = 3

Result: ai-design
```

---

## Integration Notes

- `extract_features.py` uses these mappings to suggest pillars
- `generate_brief.py` uses pillar to select appropriate pain points
- Marketing skills should reference pillar when generating copy
