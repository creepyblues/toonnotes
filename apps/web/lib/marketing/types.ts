export interface Campaign {
  slug: string;
  name: string;
  type: string;
  status: string;
  dates: {
    created: string;
    launch_date: string | null;
    end_date: string | null;
  };
  feature?: {
    name: string;
    description: string;
    key_benefits: string[];
  };
  messaging?: {
    tagline: string;
    hero_message: string;
    key_messages: Array<{ value?: string; emotion?: string; action?: string }>;
  };
  pricing?: {
    monthly: string;
    yearly: string;
  };
}

export interface MarketingFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;
}

export interface FileContent {
  name: string;
  path: string;
  content: string;
  type: 'markdown' | 'yaml';
  frontmatter?: Record<string, unknown>;
}

export interface CopyDirectory {
  name: string;
  path: string;
  files: MarketingFile[];
}

// Documentation types
export type DocCategory = 'legal' | 'product' | 'technical' | 'analytics' | 'quality';

export interface DocWithMetadata extends MarketingFile {
  title: string;
  description: string;
  category: DocCategory;
  readingTime: number; // in minutes
  lastModified?: Date;
}

export interface CategoryInfo {
  id: DocCategory;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  colorClass: string; // Tailwind color classes
}
