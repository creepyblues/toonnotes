import fs from 'fs/promises';
import path from 'path';
import type { Campaign, MarketingFile, FileContent, CopyDirectory } from './types';

// Marketing content lives in the parent directory
const MARKETING_ROOT = path.join(process.cwd(), '..', 'marketing');

/**
 * List all campaigns in a given status directory
 */
export async function listCampaigns(
  status: 'active' | 'archive' = 'active'
): Promise<{ slug: string; name: string; type: string; status: string }[]> {
  const campaignsDir = path.join(MARKETING_ROOT, 'campaigns', status);

  try {
    const entries = await fs.readdir(campaignsDir, { withFileTypes: true });
    const campaigns = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const campaignPath = path.join(campaignsDir, entry.name, 'campaign.yaml');
        try {
          const content = await fs.readFile(campaignPath, 'utf-8');
          // Simple YAML parsing for key fields
          const name = content.match(/^name:\s*(.+)$/m)?.[1] || entry.name;
          const type = content.match(/^type:\s*(.+)$/m)?.[1] || 'unknown';
          const statusMatch = content.match(/^status:\s*(.+)$/m)?.[1] || status;

          campaigns.push({
            slug: entry.name,
            name,
            type,
            status: statusMatch,
          });
        } catch {
          // Skip if no campaign.yaml
        }
      }
    }

    return campaigns;
  } catch {
    return [];
  }
}

/**
 * Get full campaign data by slug
 */
export async function getCampaign(
  slug: string,
  status: 'active' | 'archive' = 'active'
): Promise<{ yaml: string; copy?: string } | null> {
  const campaignDir = path.join(MARKETING_ROOT, 'campaigns', status, slug);

  try {
    const yamlPath = path.join(campaignDir, 'campaign.yaml');
    const copyPath = path.join(campaignDir, 'copy.md');

    const yaml = await fs.readFile(yamlPath, 'utf-8');

    let copy: string | undefined;
    try {
      copy = await fs.readFile(copyPath, 'utf-8');
    } catch {
      // copy.md is optional
    }

    return { yaml, copy };
  } catch {
    return null;
  }
}

/**
 * Get the messaging.md file content
 */
export async function getMessaging(): Promise<string | null> {
  try {
    const messagingPath = path.join(MARKETING_ROOT, 'messaging.md');
    return await fs.readFile(messagingPath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * List files in the copy directory
 */
export async function listCopyFiles(
  subdir?: string
): Promise<MarketingFile[]> {
  const copyDir = subdir
    ? path.join(MARKETING_ROOT, 'copy', subdir)
    : path.join(MARKETING_ROOT, 'copy');

  try {
    const entries = await fs.readdir(copyDir, { withFileTypes: true });

    return entries.map((entry) => ({
      name: entry.name,
      path: subdir ? `${subdir}/${entry.name}` : entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
      extension: entry.isFile() ? path.extname(entry.name).slice(1) : undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Get a specific file from the copy directory
 */
export async function getCopyFile(filePath: string): Promise<FileContent | null> {
  const fullPath = path.join(MARKETING_ROOT, 'copy', filePath);

  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    const extension = path.extname(filePath).slice(1);

    return {
      name: path.basename(filePath),
      path: filePath,
      content,
      type: extension === 'yaml' || extension === 'yml' ? 'yaml' : 'markdown',
    };
  } catch {
    return null;
  }
}

/**
 * List all audience files
 */
export async function listAudiences(): Promise<MarketingFile[]> {
  const audiencesDir = path.join(MARKETING_ROOT, 'audiences');

  try {
    const entries = await fs.readdir(audiencesDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => ({
        name: entry.name.replace(/\.(yaml|yml)$/, '').replace(/-/g, ' '),
        path: entry.name,
        type: 'file' as const,
        extension: path.extname(entry.name).slice(1),
      }));
  } catch {
    return [];
  }
}

/**
 * Get audience file content
 */
export async function getAudience(filename: string): Promise<string | null> {
  try {
    const audiencePath = path.join(MARKETING_ROOT, 'audiences', filename);
    return await fs.readFile(audiencePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Get campaign templates
 */
export async function listTemplates(): Promise<MarketingFile[]> {
  const templatesDir = path.join(MARKETING_ROOT, 'campaigns', 'templates');

  try {
    const entries = await fs.readdir(templatesDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => ({
        name: entry.name.replace(/\.(yaml|yml)$/, '').replace(/-/g, ' '),
        path: entry.name,
        type: 'file' as const,
        extension: path.extname(entry.name).slice(1),
      }));
  } catch {
    return [];
  }
}

// ToonNotes_Expo root for docs access
const EXPO_ROOT = path.join(process.cwd(), '..', 'ToonNotes_Expo');

/**
 * Get a documentation file from ToonNotes_Expo
 * Supports paths like:
 *   - PRD.md (root level)
 *   - docs/MONETIZATION-STRATEGY.md (docs folder)
 */
export async function getDocFile(filePath: string): Promise<FileContent | null> {
  // Security: only allow .md files and prevent directory traversal
  if (!filePath.endsWith('.md') || filePath.includes('..')) {
    return null;
  }

  const fullPath = path.join(EXPO_ROOT, filePath);

  try {
    const content = await fs.readFile(fullPath, 'utf-8');

    return {
      name: path.basename(filePath),
      path: filePath,
      content,
      type: 'markdown',
    };
  } catch {
    return null;
  }
}

/**
 * List available doc files in ToonNotes_Expo
 */
export async function listDocFiles(): Promise<MarketingFile[]> {
  const docs: MarketingFile[] = [];

  // Check root level markdown files
  const rootFiles = ['PRD.md', 'CLAUDE.md'];
  for (const file of rootFiles) {
    try {
      await fs.access(path.join(EXPO_ROOT, file));
      docs.push({
        name: file,
        path: file,
        type: 'file',
        extension: 'md',
      });
    } catch {
      // File doesn't exist
    }
  }

  // Check docs folder
  try {
    const docsDir = path.join(EXPO_ROOT, 'docs');
    const entries = await fs.readdir(docsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        docs.push({
          name: entry.name,
          path: `docs/${entry.name}`,
          type: 'file',
          extension: 'md',
        });
      }
    }
  } catch {
    // docs folder doesn't exist
  }

  return docs;
}

// Product folder for version tracking
const PRODUCT_ROOT = path.join(MARKETING_ROOT, 'product');

/**
 * Get the product manifest
 */
export async function getProductManifest(): Promise<string | null> {
  try {
    const manifestPath = path.join(PRODUCT_ROOT, 'manifest.yaml');
    return await fs.readFile(manifestPath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Get a platform file (ios.yaml, android.yaml, web.yaml)
 */
export async function getPlatformFile(platform: string): Promise<string | null> {
  try {
    const platformPath = path.join(PRODUCT_ROOT, 'platforms', `${platform}.yaml`);
    return await fs.readFile(platformPath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * List all platform files
 */
export async function listPlatforms(): Promise<MarketingFile[]> {
  const platformsDir = path.join(PRODUCT_ROOT, 'platforms');

  try {
    const entries = await fs.readdir(platformsDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.yaml'))
      .map((entry) => ({
        name: entry.name.replace('.yaml', ''),
        path: entry.name,
        type: 'file' as const,
        extension: 'yaml',
      }));
  } catch {
    return [];
  }
}

/**
 * Get the feature index
 */
export async function getFeatureIndex(): Promise<string | null> {
  try {
    const indexPath = path.join(PRODUCT_ROOT, 'features', '_index.yaml');
    return await fs.readFile(indexPath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Get a specific feature file
 */
export async function getFeatureFile(slug: string): Promise<FileContent | null> {
  const featurePath = path.join(PRODUCT_ROOT, 'features', `${slug}.yaml`);

  try {
    const content = await fs.readFile(featurePath, 'utf-8');
    return {
      name: `${slug}.yaml`,
      path: `features/${slug}.yaml`,
      content,
      type: 'yaml',
    };
  } catch {
    return null;
  }
}

/**
 * List all feature files (excluding _index.yaml)
 */
export async function listFeatures(): Promise<MarketingFile[]> {
  const featuresDir = path.join(PRODUCT_ROOT, 'features');

  try {
    const entries = await fs.readdir(featuresDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.yaml') && entry.name !== '_index.yaml')
      .map((entry) => ({
        name: entry.name.replace('.yaml', ''),
        path: entry.name,
        type: 'file' as const,
        extension: 'yaml',
      }));
  } catch {
    return [];
  }
}

/**
 * List release notes directories
 */
export async function listReleases(): Promise<MarketingFile[]> {
  const releasesDir = path.join(PRODUCT_ROOT, 'releases');

  try {
    const entries = await fs.readdir(releasesDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: entry.name,
        path: entry.name,
        type: 'directory' as const,
      }))
      .sort((a, b) => b.name.localeCompare(a.name)); // Newest first
  } catch {
    return [];
  }
}

/**
 * Get release notes for a specific version
 */
export async function getReleaseNotes(version: string): Promise<FileContent | null> {
  const notesPath = path.join(PRODUCT_ROOT, 'releases', version, 'release-notes.md');

  try {
    const content = await fs.readFile(notesPath, 'utf-8');
    return {
      name: 'release-notes.md',
      path: `releases/${version}/release-notes.md`,
      content,
      type: 'markdown',
    };
  } catch {
    return null;
  }
}
