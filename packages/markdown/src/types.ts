import type { Mode } from '@toonnotes/types';

/**
 * Options for serializing a Note to markdown.
 */
export interface SerializeOptions {
  /** Include MODE framework mode in frontmatter */
  mode?: Mode;
  /** Include behavior metadata (engagement, usefulness) in frontmatter */
  behavior?: {
    usefulnessScore?: number;
    usefulnessLevel?: string;
    accessCount?: number;
    editCount?: number;
  };
  /** Include design reference ID in frontmatter */
  includeDesign?: boolean;
}

/**
 * Result of parsing a markdown string with YAML frontmatter.
 */
export interface ParsedNote {
  frontmatter: NoteFrontmatter;
  content: string;
  rawMarkdown: string;
}

/**
 * Structured frontmatter fields extracted from YAML.
 * All fields are optional since external markdown may not include them.
 */
export interface NoteFrontmatter {
  id?: string;
  title?: string;
  mode?: Mode;
  labels?: string[];
  editor_mode?: string;
  color?: string;
  design_id?: string;
  pinned?: boolean;
  archived?: boolean;
  deleted?: boolean;
  deleted_at?: string;
  images?: string[];
  created_at?: string;
  updated_at?: string;
  // Behavior metadata (optional)
  behavior?: {
    usefulness_score?: number;
    usefulness_level?: string;
    access_count?: number;
    edit_count?: number;
  };
  // Allow additional fields from external sources
  [key: string]: unknown;
}
