# ToonNotes Editor Architecture Analysis

## Context

This document analyzes how the ToonNotes editors work on web and mobile today, compares with Obsidian's cross-platform approach, and identifies gaps and opportunities.

---

## Current ToonNotes Editor Architecture

### Content Format (Shared via `@toonnotes/editor-core`)

Plain text with markdown-like markers. **Not true markdown** — a minimal subset:

```
- [ ] unchecked task          (checkbox)
- [x] checked task            (checkbox)
• bullet item                 (bullet, also accepts - and *)
plain text line               (paragraph)
```

Stored in `note.content` as a string. YAML frontmatter via `@toonnotes/markdown` package for export/archive.

### Web Editor (apps/webapp)

| Aspect | Detail |
|--------|--------|
| **Engine** | TipTap v3.15.3 (ProseMirror) |
| **Component** | `components/editor/NoteEditor.tsx` (~615 lines) |
| **Formatting** | Bold, Italic, Underline, Strikethrough |
| **Lists** | Bullets, Checklists (task items) |
| **Headings** | None (StarterKit includes heading support, but no toolbar button exposed) |
| **Links/Images** | None in editor (image/mention extensions installed but not loaded) |
| **Code blocks** | None |
| **Serialization** | `textToHtml()` on load, `htmlToPlainText()` on save |
| **Auto-save** | 500ms debounce |
| **State** | Zustand + Supabase real-time sync |

### Mobile Editor (apps/expo)

| Aspect | Detail |
|--------|--------|
| **Engine** | Custom React Native `TextInput` (no 3rd-party editor) |
| **Screen** | `app/note/[id].tsx` (~2,100 lines) |
| **Formatting** | None (no bold/italic/underline) |
| **Lists** | Checkboxes, Bullets (dedicated components: `ChecklistEditor`, `BulletEditor`) |
| **Headings** | None |
| **Links** | None |
| **Images** | Separate `note.images[]` URI array, not inline |
| **Auto-continue** | Enter key adds new list item, backspace on empty removes |
| **Hashtag labels** | Inline `#tag` detection with label picker panel |
| **State** | Zustand + AsyncStorage + optional Supabase sync |

### Shared Layer (`@toonnotes/editor-core`)

- `parseLineType()` — detect checkbox/bullet/text per line
- `parseContent()` — multi-line structured parse
- `textToHtml()` / `htmlToPlainText()` — web bridge
- `detectEditorMode()` — auto-detect plain/checklist/bullet
- `getAutoContinuePrefix()` / `shouldRemoveEmptyLine()` — list UX
- `normalizeContent()` — canonical formatting
- `checklistToContent()` / `parseChecklistFromContent()` — checklist serialization
- `bulletToContent()` / `parseBulletFromContent()` — bullet serialization
- `stripCheckboxPrefixes()` / `stripBulletPrefixes()` / `stripAllFormatting()` — format stripping
- Cross-platform parity test: `htmlToPlainText(textToHtml(x)) === normalizeContent(x)`

### Export Layer (`@toonnotes/markdown`)

- `noteToMarkdown()` — serialize Note to markdown string with YAML frontmatter
- `markdownToNote()` — parse markdown+frontmatter back to typed `ParsedNote`
- `notesToMarkdownArchive()` — batch export with sanitized filenames and deduplication

---

## Feature Parity Gap

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Bold/Italic/Underline | Yes | **No** | Mobile missing |
| Strikethrough | Yes | **No** | Mobile missing |
| Headings | No | No | Both missing |
| Links | No | No | Both missing |
| Inline images | No | No | Both missing (mobile has separate image array) |
| Code blocks | No | No | Both missing |
| Tables | No | No | Both missing |
| Checkboxes | Yes | Yes | Parity |
| Bullets | Yes | Yes | Parity |
| Auto-continue lists | Utility exists, not wired | Yes | Web missing |
| Hashtag labels | No | Yes | Web missing |

**Core issue**: The web editor supports inline formatting (bold/italic) that has no representation in the shared content format and cannot survive a round-trip to mobile.

---

## How Obsidian Solves Cross-Platform Consistency

### Architecture

| Layer | Obsidian | ToonNotes |
|-------|----------|-----------|
| **Desktop** | Electron + CodeMirror 6 | Next.js + TipTap |
| **Mobile** | Capacitor + WebView + **same CodeMirror 6** | React Native + custom TextInput |
| **Format** | Standard Markdown (CommonMark + GFM + extensions) | Custom subset (not true markdown) |
| **Sync** | File-based, 3-way merge (diff-match-patch) | Supabase real-time, last-write-wins |

### Key Obsidian Lessons

1. **Same editor engine everywhere**: Obsidian uses CodeMirror 6 on both desktop AND mobile (via WebView/Capacitor). This eliminates entire classes of parity bugs. ToonNotes uses TipTap on web and bare TextInput on mobile — fundamentally different rendering.

2. **True markdown as source of truth**: Obsidian stores CommonMark + GFM. Every feature (bold, italic, headings, links, code, tables, checkboxes) has a standard markdown representation that works identically on every platform. ToonNotes uses a custom subset that doesn't support standard markdown features.

3. **Three editing modes**: Live Preview (hybrid WYSIWYG), Source (raw markdown), Reading (rendered). Users can choose their preference. ToonNotes has no concept of showing/hiding markdown syntax.

4. **WebView for mobile**: Obsidian's mobile app runs the same web editor in a Capacitor WebView. This is the single biggest factor in their cross-platform consistency — same code, same rendering, same bugs.

5. **Plugin extensibility via editor extensions**: CodeMirror 6 extensions allow community to extend the editor without forking. TipTap also supports extensions, but ToonNotes' mobile TextInput has no extension model.

6. **Plain-text file format**: `.md` files with YAML frontmatter. No proprietary database. Portable, diffable, mergeable. ToonNotes already does this with `@toonnotes/markdown` — good alignment.

---

## Analysis: What This Means for ToonNotes

### The Fundamental Problem

ToonNotes has **two completely different editors** with different capabilities:
- Web: Rich text (TipTap/ProseMirror) with formatting -> serialized to plain text
- Mobile: Plain TextInput with no formatting -> direct plain text

The shared format (`editor-core`) is the **lowest common denominator** — it only supports what the mobile TextInput can handle (checkboxes, bullets, plain text). Web formatting (bold/italic) is silently lost on round-trip through mobile.

### Three Strategic Paths Forward

#### Path A: Obsidian-style — Single WebView Editor (Maximum Consistency)

Use TipTap (or CodeMirror 6) inside a React Native WebView on mobile.

- Same editor code, same extensions, same rendering on both platforms
- **Pros**: True feature parity, single codebase for editor logic
- **Cons**: WebView performance on mobile, keyboard handling complexity, less "native" feel

#### Path B: Upgrade Content Format to Real Markdown (Incremental)

Adopt CommonMark/GFM as the content format.

- Keep TipTap on web, but upgrade mobile to a markdown-aware editor (e.g., TenTap for React Native, which is TipTap-based)
- Update `editor-core` to parse/serialize full markdown
- **Pros**: Incremental migration, standard format, better interop
- **Cons**: Two editor codebases still, potential rendering differences

#### Path C: Stay Custom, Expand Minimally (Conservative)

Keep current architecture but add missing features to both sides.

- Add inline formatting markers to the custom format (e.g., `**bold**`, `*italic*`)
- Upgrade mobile TextInput to render styled text via custom parsing
- **Pros**: Least disruption, works with existing architecture
- **Cons**: Reinventing markdown poorly, growing maintenance burden

---

*This is a research/analysis document — no code changes proposed. The strategic direction depends on product priorities (feature richness vs. simplicity vs. development cost).*
