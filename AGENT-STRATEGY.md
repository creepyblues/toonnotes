# ToonNotes Agent Strategy: "The Agent's Notebook"

> Notes with cognitive context. Not just *what* the user wrote, but *why* and *how* they think.

## Market Context

The AI agent ecosystem is converging on MCP (Model Context Protocol) as the standard for tool interoperability. Note-taking apps are becoming the "memory layer" for AI agents - OpenClaw (68k GitHub stars) already integrates with Obsidian, Notion, and Apple Notes. NIST launched the AI Agent Standards Initiative in Feb 2026. Google launched A2A protocol. The market is forming *right now*.

**ToonNotes today**: Plain text notes in Supabase PostgreSQL. Checklists use `- [x]` markdown. No export API, no MCP server, no public notes API. 13 Vercel edge functions handle AI features.

**ToonNotes' moat**: The MODE framework (manage/develop/organize/experience) + behavior tracking gives notes *cognitive context* that no other note app provides. An AI agent doesn't just get text - it understands the user's intent, workflow patterns, and cognitive mode.

---

## Strategic Position

| Feature | Obsidian | Notion | ToonNotes (proposed) |
|---------|----------|--------|---------------------|
| Format | Local `.md` | Proprietary blocks | Cloud markdown + API |
| Agent Access | Local MCP only | API + MCP | API + MCP + OpenClaw |
| Cognitive Context | None | None | **MODE framework** |
| Behavior Tracking | None | None | **Engagement, patterns, nudges** |
| Mobile-First | No (desktop) | Yes | Yes (Expo) |
| Cloud API | No | Yes | Yes (Supabase) |

---

## Implementation Order & Dependencies

```
Phase 1: Markdown Layer (no dependencies)
    |
Phase 1.5: Editor Core (depends on Phase 1 for consistent serialization)
    |
Phase 2: Public API (depends on Phase 1.5 for canonical content format)
    |
Phase 3: MCP Server (depends on Phase 2 for API client)
    |
Phase 4: OpenClaw Skill (depends on Phase 3 or Phase 2)
    |
Phase 5: Agent-Native Features (independent enhancements)
```

---

## Phase 1: Markdown Serialization Layer

**Goal**: Every note can be represented as a markdown file with YAML frontmatter.

### Output Format

```markdown
---
id: "abc-123"
title: "Trip Planning"
mode: "organize"
labels: ["travel", "summer-2026"]
editor_mode: "checklist"
color: "#D1FAE5"
pinned: true
archived: false
created_at: "2026-02-20T10:00:00Z"
updated_at: "2026-02-20T14:30:00Z"
---

# Trip Planning

- [x] Book flights to Tokyo
- [ ] Research hotels in Shinjuku
- [ ] Create day-by-day itinerary
```

### Files to Create

**`packages/markdown/package.json`**
- Deps: `gray-matter`, `@toonnotes/types`
- Zero runtime deps beyond gray-matter

**`packages/markdown/src/types.ts`**

```typescript
export interface SerializeOptions {
  includeMode?: boolean;      // Include MODE framework mode
  includeBehavior?: boolean;  // Include behavior metadata
  includeDesign?: boolean;    // Include design reference
}

export interface ParsedNote {
  frontmatter: Record<string, unknown>;
  content: string;
  rawMarkdown: string;
}
```

**`packages/markdown/src/index.ts`** - New shared package `@toonnotes/markdown`

- `noteToMarkdown(note: Note, options?: SerializeOptions): string`
  - Generates YAML frontmatter from all Note fields
  - Preserves content as-is (already uses markdown checklists)
  - Adds `mode` from behavior data if available
  - Includes `labels`, `color`, `editor_mode`, timestamps
- `markdownToNote(md: string): ParsedNote`
  - Parses YAML frontmatter via `gray-matter`
  - Extracts metadata back to Note-compatible fields
  - Returns `{ frontmatter, content, rawMarkdown }`
- `notesToMarkdownArchive(notes: Note[]): { filename: string, content: string }[]`
  - Batch conversion for export

### Files to Modify

- `packages/types/src/index.ts` - Add `Mode` to Note-adjacent types if not already exported

### Verification

- Unit test: `noteToMarkdown` -> `markdownToNote` round-trip preserves all fields
- Unit test: Checklist content `- [x]` preserved correctly
- Unit test: Frontmatter includes all metadata fields

---

## Phase 1.5: Editor Core — Shared Parsing & Serialization

**Goal**: Single source of truth for content parsing/serialization across Expo and Webapp, eliminating format drift before the Public API.

**Problem**: Web (TipTap) and mobile (custom TextInput) editors had duplicate parsing/serialization logic with no shared source of truth. Expo inferred `editorMode` from content on every load and never persisted it. This must be fixed before Phase 2 because the API needs a canonical content format.

### Package: `@toonnotes/editor-core`

| Module | Exports | Purpose |
|--------|---------|---------|
| `parser.ts` | `parseLineType()`, `parseContent()` | Canonical line type detection (checkbox, bullet, text) |
| `serializer.ts` | `checklistToContent()`, `bulletToContent()`, `parseChecklistFromContent()`, `parseBulletFromContent()`, `normalizeContent()`, strip functions | Content serialization/deserialization |
| `mode-detection.ts` | `detectEditorMode()` | Unified EditorMode detection from content |
| `html-bridge.ts` | `textToHtml()`, `htmlToPlainText()` | TipTap HTML ↔ plain text bridge (webapp) |
| `auto-continue.ts` | `getAutoContinuePrefix()`, `shouldRemoveEmptyLine()` | Enter-key list continuation logic |
| `types.ts` | `LineType`, `ParsedLine`, `ChecklistItem`, `BulletItem` | Shared type definitions |

### Adoption

| App/Package | Change |
|-------------|--------|
| `apps/expo` | `useEditorContent` hook, `ChecklistEditor`, `BulletEditor`, `note/[id].tsx` all import from editor-core. EditorMode persisted to store. |
| `apps/webapp` | `NoteEditor` imports `textToHtml`, `htmlToPlainText`, `detectEditorMode` from editor-core. Removed duplicates from `lib/utils.ts`. |
| `packages/markdown` | `noteToMarkdown()` calls `normalizeContent()` before serializing. |

### Verification

```bash
cd packages/editor-core && pnpm test    # 83 tests
cd apps/webapp && npm run build          # Webapp builds cleanly
cd packages/markdown && pnpm test        # Markdown round-trips
```

---

## Phase 2: Public Notes API (Supabase Edge Functions via Vercel)

**Goal**: REST API for agent access to notes, following existing Vercel edge function patterns.

### New Edge Functions

All in `apps/expo/api/` following existing patterns (import `applySecurity` from `_utils/security.ts`).

#### `api/notes-api.ts` - Main notes endpoint

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `?action=list` | GET | API Key | List notes with filters |
| `?action=get&id={id}` | GET | API Key | Get single note as markdown |
| `?action=search&q={query}` | GET | API Key | Search notes |
| `?action=create` | POST | API Key | Create note from markdown |
| `?action=update&id={id}` | PUT | API Key | Update note |
| `?action=delete&id={id}` | DELETE | API Key | Soft-delete note |

#### `api/labels-api.ts` - Labels endpoint

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `?action=list` | GET | API Key | List all labels with note counts |

#### `api/boards-api.ts` - Boards endpoint

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `?action=list` | GET | API Key | List boards with note counts |
| `?action=get&hashtag={tag}` | GET | API Key | Get board with its notes |

#### `api/mode-api.ts` - MODE context endpoint (differentiator)

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `?action=context&mode={mode}` | GET | API Key | Get notes + behaviors for a mode |
| `?action=summary` | GET | API Key | Get MODE distribution summary |

### Authentication: API Key System

**New migration**: `apps/expo/supabase/migrations/YYYYMMDD_create_api_keys.sql`

```sql
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  key_hash TEXT NOT NULL,           -- SHA-256 hash (never store plaintext)
  name TEXT DEFAULT 'Default',      -- User-friendly name
  permissions TEXT[] DEFAULT '{read}',  -- 'read', 'write', 'admin'
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,           -- NULL = never expires
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only manage their own keys
CREATE POLICY "Users can manage own API keys"
  ON public.api_keys FOR ALL
  USING (auth.uid() = user_id);

-- Function to generate and store API key
CREATE OR REPLACE FUNCTION generate_api_key(p_user_id UUID, p_name TEXT DEFAULT 'Default')
RETURNS TEXT AS $$
DECLARE
  v_key TEXT;
  v_hash TEXT;
BEGIN
  v_key := 'tn_' || encode(gen_random_bytes(32), 'hex');
  v_hash := encode(sha256(v_key::bytea), 'hex');
  INSERT INTO public.api_keys (user_id, key_hash, name)
  VALUES (p_user_id, v_hash, p_name);
  RETURN v_key;  -- Return plaintext only once
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate API key and return user_id
CREATE OR REPLACE FUNCTION validate_api_key(p_key TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM public.api_keys
  WHERE key_hash = encode(sha256(p_key::bytea), 'hex')
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW());

  IF v_user_id IS NOT NULL THEN
    UPDATE public.api_keys
    SET last_used_at = NOW()
    WHERE key_hash = encode(sha256(p_key::bytea), 'hex');
  END IF;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**New utility**: `apps/expo/api/_utils/apiKeyAuth.ts`

```typescript
// Validates X-API-Key header, returns user_id or sends 401
export async function authenticateApiKey(
  req: VercelRequest,
  res: VercelResponse
): Promise<string | null>  // returns user_id or null
```

### Response Format

All API responses return notes as markdown:

```json
{
  "notes": [
    {
      "id": "uuid",
      "markdown": "---\ntitle: Trip Planning\n...\n---\n\n# Trip Planning\n...",
      "title": "Trip Planning",
      "labels": ["travel"],
      "mode": "organize",
      "updatedAt": "2026-02-20T14:30:00Z"
    }
  ],
  "total": 42,
  "cursor": "base64cursor"
}
```

### Files to Modify

- `apps/expo/api/_utils/security.ts` - Add `X-API-Key` header to CORS allowlist
- `apps/expo/vercel.json` - Add new routes

### Verification

- cURL: `GET /api/notes-api?action=list` with API key returns markdown notes
- cURL: `POST /api/notes-api?action=create` with markdown body creates note
- Round-trip: Create via API -> Read via API -> Content matches
- 401 response without valid API key
- Rate limiting works (30 req/min)

---

## Phase 3: ToonNotes MCP Server

**Goal**: npm package that any MCP-compatible AI agent can install and use.

### New Package: `packages/mcp-server/`

```
packages/mcp-server/
  src/
    index.ts              # Entry point (stdio transport)
    server.ts             # McpServer setup + tool registration
    tools/
      notes.ts          # search, read, create, update, delete
      labels.ts         # list labels
      boards.ts         # list/get boards
      mode.ts           # MODE context tools (differentiator)
    resources/
      notes.ts          # toonnotes://notes, toonnotes://note/{id}
      labels.ts         # toonnotes://labels
      mode.ts           # toonnotes://mode/{mode}
    prompts/
      organize.ts       # Reusable prompts for note organization
    api-client.ts         # HTTP client for Phase 2 API
    auth.ts               # API key from env var
  package.json
  tsconfig.json
  README.md
```

### Tools (8 total)

```typescript
// Using @modelcontextprotocol/sdk v1.26+

// 1. search-notes - Full-text search
server.registerTool('search-notes', {
  title: 'Search Notes',
  description: 'Search notes by content, title, or labels',
  inputSchema: z.object({
    query: z.string().min(1),
    labels: z.array(z.string()).optional(),
    mode: z.enum(['manage', 'develop', 'organize', 'experience']).optional(),
    limit: z.number().default(10),
    cursor: z.string().optional()
  })
}, handler);

// 2. read-note - Get full note as markdown
server.registerTool('read-note', {
  title: 'Read Note',
  description: 'Get the full content of a note as markdown with frontmatter',
  inputSchema: z.object({ noteId: z.string() })
}, handler);

// 3. create-note - Create from markdown
server.registerTool('create-note', {
  title: 'Create Note',
  description: 'Create a new note. Accepts markdown with optional YAML frontmatter',
  inputSchema: z.object({
    markdown: z.string(),
    labels: z.array(z.string()).optional()
  })
}, handler);

// 4. update-note - Modify existing
server.registerTool('update-note', {
  title: 'Update Note',
  description: 'Update an existing note with new markdown content',
  inputSchema: z.object({
    noteId: z.string(),
    markdown: z.string().optional(),
    labels: z.array(z.string()).optional()
  })
}, handler);

// 5. delete-note - Soft delete
server.registerTool('delete-note', {
  title: 'Delete Note',
  description: 'Move a note to trash (soft delete, recoverable for 30 days)',
  inputSchema: z.object({ noteId: z.string() })
}, handler);

// 6. list-labels
server.registerTool('list-labels', {
  title: 'List Labels',
  description: 'Get all labels with note counts',
  inputSchema: z.object({})
}, handler);

// 7. get-mode-context (DIFFERENTIATOR)
server.registerTool('get-mode-context', {
  title: 'Get MODE Context',
  description: "Get the user's cognitive mode context. Returns notes and behavior patterns for a specific mode (manage=task-focused, develop=creative, organize=structuring, experience=reflective). Use this to adapt your assistance style.",
  inputSchema: z.object({
    mode: z.enum(['manage', 'develop', 'organize', 'experience'])
  })
}, handler);

// 8. get-workspace-summary
server.registerTool('get-workspace-summary', {
  title: 'Get Workspace Summary',
  description: "Overview of the user's note workspace: total notes, labels, boards, MODE distribution, and recent activity",
  inputSchema: z.object({})
}, handler);
```

### Resources (5 total)

```
toonnotes://notes         - List of all notes (titles + metadata)
toonnotes://note/{id}     - Single note as markdown
toonnotes://labels        - All labels
toonnotes://boards        - All boards
toonnotes://mode/{mode}   - Notes for a cognitive mode
```

### Package Configuration

```json
{
  "name": "@toonnotes/mcp-server",
  "version": "1.0.0",
  "bin": { "toonnotes-mcp": "dist/index.js" },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.26.0",
    "zod": "^3.25.0"
  }
}
```

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "toonnotes": {
      "command": "npx",
      "args": ["@toonnotes/mcp-server"],
      "env": { "TOONNOTES_API_KEY": "tn_..." }
    }
  }
}
```

### Verification

- MCP Inspector: `mcp-inspector npx @toonnotes/mcp-server` connects and lists tools
- Claude Desktop: Can search/read/create notes via natural language
- Tool calls return valid markdown with frontmatter
- `get-mode-context` returns mode-specific data

---

## Phase 4: OpenClaw Skill

**Goal**: Publish a ToonNotes skill to OpenClaw's skill ecosystem.

### Skill Directory Structure

```
openclaw-toonnotes-skill/
  SKILL.md                  # Skill definition (OpenClaw format)
  TOOLS.md                  # Tool documentation
  package.json
  src/
    index.ts              # Skill implementation
```

### SKILL.md

```markdown
# ToonNotes

Manage your ToonNotes from any chat. Create, search, read, and organize
notes with cognitive mode awareness.

## When to use
- User asks to take a note, save something, or remember something
- User asks about their notes, tasks, or ideas
- User wants to organize or find notes

## Tools
- toonnotes.search: Search notes by content or labels
- toonnotes.create: Create a new note
- toonnotes.read: Read a specific note
- toonnotes.mode: Get notes by cognitive mode (manage/develop/organize/experience)
```

### Implementation

The skill wraps the MCP server or calls the REST API directly. OpenClaw skills are essentially natural language interfaces to tools.

### Verification

- Install skill in OpenClaw: `openclaw skill install toonnotes`
- Via WhatsApp/Telegram: "Take a note: remember to buy milk" -> Note created
- "What are my manage mode notes?" -> Returns task-oriented notes

---

## Phase 5: Agent-Native Features

**Goal**: Features that make ToonNotes uniquely valuable in an agent-powered workflow.

### 5a. Agent Activity Log

**New migration**: `YYYYMMDD_create_agent_activity.sql`

```sql
CREATE TABLE public.agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES public.api_keys(id),
  action TEXT NOT NULL,            -- 'read', 'create', 'update', 'search'
  note_id UUID,                    -- Which note was affected
  agent_name TEXT,                 -- e.g., 'claude-desktop', 'openclaw'
  metadata JSONB,                  -- Search query, changes made, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

This lets users see: "Claude read 3 of your notes today" / "OpenClaw created a grocery list for you"

### 5b. Wiki-Links (Cross-Note Linking)

Extend markdown content to support `[[Note Title]]` syntax:
- Parser recognizes `[[...]]` in note content
- Links resolved to note IDs at render time
- Agents can follow links to understand note relationships
- MCP tool: `resolve-links` to get linked note IDs

### 5c. Vector Search (Future)

Add pgvector extension to Supabase for semantic note search:
- Generate embeddings on note create/update (OpenAI text-embedding-3-small)
- MCP tool: `semantic-search` for natural language queries
- Complement existing label-based organization with AI-powered discovery

### 5d. API Key Management UI

**Expo app** (`apps/expo/app/settings/api-keys.tsx`):
- Generate new API key (shows once, then only hash stored)
- List active keys with last-used timestamps
- Revoke keys
- Permission management (read-only vs read-write)

**Webapp** (`apps/webapp/app/settings/api-keys/page.tsx`):
- Same functionality for web users

---

## Critical Files Summary

| Phase | New Files | Modified Files |
|-------|-----------|----------------|
| 1 | `packages/markdown/src/index.ts`, `types.ts`, `package.json` | `packages/types/src/index.ts` (minor) |
| 1.5 | `packages/editor-core/` (full package: parser, serializer, mode-detection, html-bridge, auto-continue, types, tests) | `apps/expo/hooks/editor/useEditorContent.ts`, `apps/expo/components/editor/ChecklistEditor.tsx`, `apps/expo/components/editor/BulletEditor.tsx`, `apps/expo/app/note/[id].tsx`, `apps/expo/types/index.ts`, `apps/webapp/lib/utils.ts`, `apps/webapp/components/editor/NoteEditor.tsx`, `packages/markdown/src/index.ts` |
| 2 | `api/notes-api.ts`, `api/labels-api.ts`, `api/boards-api.ts`, `api/mode-api.ts`, `api/_utils/apiKeyAuth.ts`, migration SQL | `api/_utils/security.ts`, `vercel.json` |
| 3 | `packages/mcp-server/` (full package) | None |
| 4 | `openclaw-toonnotes-skill/` (separate repo) | None |
| 5 | Migration SQL, `app/settings/api-keys.tsx` | Various UI files |

## Existing Code to Reuse

- **Security middleware**: `apps/expo/api/_utils/security.ts` (CORS, rate limiting, validation)
- **Supabase client**: `apps/expo/services/supabase.ts` (auth patterns)
- **Sync service**: `apps/expo/services/syncService.ts` (cloud note CRUD patterns, `mapCloudToLocal`/`mapLocalToCloud`)
- **Share system**: `apps/expo/supabase/migrations/20260103_create_shared_notes.sql` (token generation pattern)
- **Type definitions**: `packages/types/src/index.ts` (Note, Label, Board interfaces)
- **Editor core**: `packages/editor-core/` (canonical parsing, serialization, mode detection, HTML bridge)
- **Mode detection**: `packages/editor-core/src/mode-detection.ts` (`detectEditorMode`)
- **Checklist parsing**: `packages/editor-core/src/serializer.ts` (`parseChecklistFromContent`)

---

## End-to-End Verification Plan

### Phase 1 Test

```bash
cd packages/markdown && npm test
# Round-trip: Note -> Markdown -> Note preserves all fields
```

### Phase 2 Test

```bash
# Generate API key
curl -X POST 'https://toonnotes-api.vercel.app/api/notes-api?action=create' \
  -H 'X-API-Key: tn_...' \
  -H 'Content-Type: application/json' \
  -d '{"markdown": "---\ntitle: Test\nlabels: [test]\n---\n\nHello from API"}'

# Read it back
curl 'https://toonnotes-api.vercel.app/api/notes-api?action=list' \
  -H 'X-API-Key: tn_...'
```

### Phase 3 Test

```bash
# MCP Inspector
TOONNOTES_API_KEY=tn_... mcp-inspector node packages/mcp-server/dist/index.js

# Claude Desktop: add to config, then ask "What notes do I have?"
```

### Phase 4 Test

```
# Via OpenClaw WhatsApp
"Hey, take a note: remember to call dentist tomorrow"
"What are my manage mode notes?"
"Search my notes for travel plans"
```

---

## Documentation Updates Required

Per project rules (CLAUDE.md: "always update documentation when there's structural changes"):

1. **`packages/types/src/index.ts`** - Add any new types for API keys, agent activity
2. **`apps/expo/CLAUDE.md`** - Add API key system, new edge functions
3. **`CLAUDE.md` (root)** - Add `packages/markdown`, `packages/mcp-server` to project directory overview
4. **New**: `packages/mcp-server/README.md` - Setup and usage guide for MCP server
5. **New**: `docs/API.md` - Public API documentation with examples
