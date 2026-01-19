import fs from 'fs/promises';
import path from 'path';

// Diary content lives in the marketing directory at the monorepo root
// From apps/web, we need to go up two levels to reach the root
const DIARY_ROOT = path.join(process.cwd(), '..', '..', 'marketing', 'development_diary');

/**
 * Diary entry categories for classifying work
 */
export type DiaryCategory =
  | 'Research'
  | 'Planning'
  | 'Implementation'
  | 'Bug Fix'
  | 'Refactoring'
  | 'Documentation'
  | 'Testing';

/**
 * Entry status in the workflow
 */
export type DiaryStatus = 'draft' | 'review' | 'published';

/**
 * Frontmatter metadata for diary entries
 */
export interface DiaryFrontmatter {
  date: string; // YYYY-MM-DD
  status: DiaryStatus;
  author: string;
  session_count: number;
  commit_count: number;
  categories: DiaryCategory[];
  highlight: string;
  tags: string[];
}

/**
 * Full diary entry with content
 */
export interface DiaryEntry extends DiaryFrontmatter {
  content: string; // Full markdown content (including frontmatter)
  rawContent: string; // Content without frontmatter
}

/**
 * Summary for list views
 */
export interface DiaryEntrySummary {
  date: string;
  status: DiaryStatus;
  highlight: string;
  categories: DiaryCategory[];
  session_count: number;
  commit_count: number;
}

/**
 * Parse YAML frontmatter from markdown content
 */
function parseFrontmatter(content: string): {
  frontmatter: Partial<DiaryFrontmatter>;
  rawContent: string;
} {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    return { frontmatter: {}, rawContent: content };
  }

  const [, frontmatterStr, rawContent] = frontmatterMatch;
  const frontmatter: Partial<DiaryFrontmatter> = {};

  // Simple YAML parsing for known fields
  const lines = frontmatterStr.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      switch (key) {
        case 'date':
          frontmatter.date = value.trim();
          break;
        case 'status':
          frontmatter.status = value.trim() as DiaryStatus;
          break;
        case 'author':
          frontmatter.author = value.trim();
          break;
        case 'session_count':
          frontmatter.session_count = parseInt(value.trim(), 10);
          break;
        case 'commit_count':
          frontmatter.commit_count = parseInt(value.trim(), 10);
          break;
        case 'highlight':
          frontmatter.highlight = value.trim().replace(/^["']|["']$/g, '');
          break;
        case 'categories':
          // Handle YAML array format: [Item1, Item2]
          const catMatch = value.match(/\[(.*)\]/);
          if (catMatch) {
            frontmatter.categories = catMatch[1]
              .split(',')
              .map((c) => c.trim()) as DiaryCategory[];
          }
          break;
        case 'tags':
          const tagMatch = value.match(/\[(.*)\]/);
          if (tagMatch) {
            frontmatter.tags = tagMatch[1].split(',').map((t) => t.trim());
          }
          break;
      }
    }
  }

  return { frontmatter, rawContent };
}

/**
 * List all diary entries from a status directory
 */
export async function listDiaryEntries(
  status: 'draft' | 'published' = 'published',
  limit?: number
): Promise<DiaryEntrySummary[]> {
  const entries: DiaryEntrySummary[] = [];

  try {
    if (status === 'draft') {
      // Drafts are flat in drafts/ directory
      const draftsDir = path.join(DIARY_ROOT, 'drafts');
      const files = await fs.readdir(draftsDir);

      for (const file of files) {
        if (file.endsWith('.md') && !file.startsWith('.')) {
          const content = await fs.readFile(path.join(draftsDir, file), 'utf-8');
          const { frontmatter } = parseFrontmatter(content);

          entries.push({
            date: frontmatter.date || file.replace('.md', ''),
            status: 'draft',
            highlight: frontmatter.highlight || '',
            categories: frontmatter.categories || [],
            session_count: frontmatter.session_count || 0,
            commit_count: frontmatter.commit_count || 0,
          });
        }
      }
    } else {
      // Published entries are in published/YYYY/MM/ structure
      const publishedDir = path.join(DIARY_ROOT, 'published');
      const years = await fs.readdir(publishedDir).catch(() => []);

      for (const year of years) {
        const yearPath = path.join(publishedDir, year);
        const yearStat = await fs.stat(yearPath);
        if (!yearStat.isDirectory()) continue;

        const months = await fs.readdir(yearPath).catch(() => []);
        for (const month of months) {
          const monthPath = path.join(yearPath, month);
          const monthStat = await fs.stat(monthPath);
          if (!monthStat.isDirectory()) continue;

          const files = await fs.readdir(monthPath).catch(() => []);
          for (const file of files) {
            if (file.endsWith('.md')) {
              const content = await fs.readFile(path.join(monthPath, file), 'utf-8');
              const { frontmatter } = parseFrontmatter(content);

              entries.push({
                date: frontmatter.date || file.replace('.md', ''),
                status: 'published',
                highlight: frontmatter.highlight || '',
                categories: frontmatter.categories || [],
                session_count: frontmatter.session_count || 0,
                commit_count: frontmatter.commit_count || 0,
              });
            }
          }
        }
      }
    }

    // Sort by date descending (newest first)
    entries.sort((a, b) => b.date.localeCompare(a.date));

    // Apply limit if specified
    if (limit && limit > 0) {
      return entries.slice(0, limit);
    }

    return entries;
  } catch {
    return [];
  }
}

/**
 * Get a specific diary entry by date
 */
export async function getDiaryEntry(
  date: string,
  status?: DiaryStatus
): Promise<DiaryEntry | null> {
  // Try draft first if no status specified, then published
  const statusesToCheck: DiaryStatus[] = status ? [status] : ['draft', 'published'];

  for (const s of statusesToCheck) {
    try {
      let filePath: string;

      if (s === 'draft') {
        filePath = path.join(DIARY_ROOT, 'drafts', `${date}.md`);
      } else {
        // Parse date to get year/month
        const [year, month] = date.split('-');
        filePath = path.join(DIARY_ROOT, 'published', year, month, `${date}.md`);
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const { frontmatter, rawContent } = parseFrontmatter(content);

      return {
        date: frontmatter.date || date,
        status: s,
        author: frontmatter.author || 'Sung Ho Lee',
        session_count: frontmatter.session_count || 0,
        commit_count: frontmatter.commit_count || 0,
        categories: frontmatter.categories || [],
        highlight: frontmatter.highlight || '',
        tags: frontmatter.tags || [],
        content,
        rawContent,
      };
    } catch {
      // Try next status
    }
  }

  return null;
}

/**
 * Save a draft entry
 */
export async function saveDraft(date: string, content: string): Promise<void> {
  const draftsDir = path.join(DIARY_ROOT, 'drafts');

  // Ensure drafts directory exists
  await fs.mkdir(draftsDir, { recursive: true });

  const filePath = path.join(draftsDir, `${date}.md`);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Publish a draft entry (move from drafts to published)
 */
export async function publishDraft(date: string): Promise<boolean> {
  try {
    const draftPath = path.join(DIARY_ROOT, 'drafts', `${date}.md`);
    const content = await fs.readFile(draftPath, 'utf-8');

    // Update status in frontmatter
    const updatedContent = content.replace(/^status:\s*draft$/m, 'status: published');

    // Parse date to get year/month for directory structure
    const [year, month] = date.split('-');
    const publishedDir = path.join(DIARY_ROOT, 'published', year, month);

    // Ensure published directory exists
    await fs.mkdir(publishedDir, { recursive: true });

    const publishedPath = path.join(publishedDir, `${date}.md`);
    await fs.writeFile(publishedPath, updatedContent, 'utf-8');

    // Remove draft
    await fs.unlink(draftPath);

    return true;
  } catch {
    return false;
  }
}

/**
 * Unpublish an entry (move back to drafts)
 */
export async function unpublishEntry(date: string): Promise<boolean> {
  try {
    const [year, month] = date.split('-');
    const publishedPath = path.join(DIARY_ROOT, 'published', year, month, `${date}.md`);
    const content = await fs.readFile(publishedPath, 'utf-8');

    // Update status in frontmatter
    const updatedContent = content.replace(/^status:\s*published$/m, 'status: draft');

    const draftPath = path.join(DIARY_ROOT, 'drafts', `${date}.md`);
    await fs.writeFile(draftPath, updatedContent, 'utf-8');

    // Remove published file
    await fs.unlink(publishedPath);

    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a draft entry
 */
export async function deleteDraft(date: string): Promise<boolean> {
  try {
    const draftPath = path.join(DIARY_ROOT, 'drafts', `${date}.md`);
    await fs.unlink(draftPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * List screenshots for a specific date
 */
export async function listScreenshots(date: string): Promise<string[]> {
  try {
    const screenshotsDir = path.join(DIARY_ROOT, 'screenshots', date);
    const files = await fs.readdir(screenshotsDir);
    return files.filter((f) => f.endsWith('.png') || f.endsWith('.jpg'));
  } catch {
    return [];
  }
}

/**
 * Get the entry template
 */
export async function getEntryTemplate(): Promise<string | null> {
  try {
    const templatePath = path.join(DIARY_ROOT, 'templates', 'daily-entry.md');
    return await fs.readFile(templatePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Check if a draft exists for a date
 */
export async function draftExists(date: string): Promise<boolean> {
  try {
    const draftPath = path.join(DIARY_ROOT, 'drafts', `${date}.md`);
    await fs.access(draftPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a published entry exists for a date
 */
export async function publishedExists(date: string): Promise<boolean> {
  try {
    const [year, month] = date.split('-');
    const publishedPath = path.join(DIARY_ROOT, 'published', year, month, `${date}.md`);
    await fs.access(publishedPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get diary configuration from _index.yaml
 */
export async function getDiaryConfig(): Promise<Record<string, unknown> | null> {
  try {
    const configPath = path.join(DIARY_ROOT, '_index.yaml');
    const content = await fs.readFile(configPath, 'utf-8');

    // Simple YAML to object conversion for key fields
    const config: Record<string, unknown> = {};
    const lines = content.split('\n');
    let currentKey = '';

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) continue;

      const keyMatch = line.match(/^(\w+):\s*(.*)$/);
      if (keyMatch) {
        const [, key, value] = keyMatch;
        if (value) {
          config[key] = value.trim();
        }
        currentKey = key;
      }
    }

    return config;
  } catch {
    return null;
  }
}
