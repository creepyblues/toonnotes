// ============================================
// ToonNotes Type Definitions
// Based on PRD.md specifications
// ============================================

// ============================================
// MODE Framework Types (v2.0)
// ============================================

/**
 * The four cognitive modes that define note/board intent
 * Each mode has a dedicated AI Agent with specialized skills
 */
export type Mode = 'manage' | 'develop' | 'organize' | 'experience';

/**
 * Sub-stages for ORGANIZE mode
 * INBOX → STORE → LEARN
 */
export type OrganizeStage = 'inbox' | 'store' | 'learn';

/**
 * Agent identifiers corresponding to each mode
 */
export type AgentId = 'manager' | 'muse' | 'librarian' | 'biographer';

/**
 * AI Agent personality configuration
 */
export interface AgentPersonality {
  tone: string;           // e.g., "direct and action-oriented"
  approach: string;       // e.g., "breaks down complexity"
  values: string[];       // e.g., ["efficiency", "completion", "clarity"]
  avoids: string[];       // e.g., ["overwhelm", "guilt", "pressure"]
}

/**
 * Skill trigger types
 */
export type SkillTriggerType = 'time' | 'event' | 'pattern' | 'manual';

/**
 * Skill trigger condition
 */
export interface SkillTriggerCondition {
  type: SkillTriggerType;
  event?: string;         // For event triggers: 'note_created', 'note_updated', etc.
  pattern?: string;       // For pattern triggers: 'no_deadline', 'untouched_7_days', etc.
  schedule?: string;      // For time triggers: cron-like expression
  threshold?: number;     // Threshold value for pattern triggers
}

/**
 * Skill trigger
 */
export interface SkillTrigger {
  type: SkillTriggerType;
  condition: SkillTriggerCondition;
  cooldown?: number;      // Prevent spam (milliseconds)
}

/**
 * Skill result action types
 */
export type SkillResultAction = 'nudge' | 'prompt' | 'auto_action' | 'none';

/**
 * Nudge action types
 */
export type NudgeActionType =
  | 'navigate'
  | 'update_note'
  | 'move_note'
  | 'dismiss'
  | 'snooze'
  | 'custom'
  | 'complete_step';

/**
 * Nudge action
 */
export type NudgeAction =
  | { type: 'navigate'; target: string }
  | { type: 'update_note'; noteId: string; changes: Partial<Note> }
  | { type: 'move_note'; noteId: string; targetBoard: string }
  | { type: 'dismiss' }
  | { type: 'snooze'; duration: number }
  | { type: 'custom'; handler: string; data?: Record<string, unknown> }
  | { type: 'complete_step'; noteId: string; goalId: string; stepId: string };

/**
 * Nudge option for user interaction
 */
export interface NudgeOption {
  id: string;
  label: string;
  icon?: string;
  action: NudgeAction;
  isPrimary?: boolean;
}

/**
 * Nudge priority levels
 */
export type NudgePriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Nudge delivery channels
 */
export type NudgeDeliveryChannel = 'toast' | 'sheet' | 'notification' | 'inline';

/**
 * Nudge outcome tracking
 */
export type NudgeOutcome = 'accepted' | 'dismissed' | 'snoozed' | 'ignored' | 'expired';

/**
 * Nudge entity
 */
export interface Nudge {
  id: string;
  skillId: string;
  agentId: AgentId;

  // Content
  title: string;
  body: string;
  options: NudgeOption[];

  // Context
  noteId?: string;
  boardId?: string;

  // Delivery
  priority: NudgePriority;
  deliveryChannel: NudgeDeliveryChannel;

  // Timing
  createdAt: number;
  showAt?: number;        // Scheduled delivery
  expiresAt?: number;

  // Tracking
  shownAt?: number;
  interactedAt?: number;
  outcome?: NudgeOutcome;
}

// ============================================
// Note Behavior Tracking (MODE Framework)
// ============================================

/**
 * MANAGE mode usefulness levels
 */
export type ManageUsefulnessLevel = 'captured' | 'scheduled' | 'ready' | 'complete';

/**
 * DEVELOP mode maturity levels
 */
export type DevelopMaturityLevel = 'spark' | 'explored' | 'developed' | 'ready';

/**
 * ORGANIZE mode flow stages
 */
export type OrganizeFlowStage = 'filed' | 'accessed' | 'valuable' | 'essential';

/**
 * EXPERIENCE mode depth levels
 */
export type ExperienceDepthLevel = 'logged' | 'detailed' | 'connected' | 'memory';

/**
 * Content type detection for DEVELOP mode
 */
export type DevelopContentType = 'story' | 'business' | 'blog' | 'design' | 'general';

/**
 * Sentiment analysis for EXPERIENCE mode
 */
export type Sentiment = 'positive' | 'neutral' | 'negative';

/**
 * State transition record
 */
export interface StateTransition {
  from: string;
  to: string;
  timestamp: number;
  trigger?: string;       // What caused the transition
}

/**
 * MANAGE mode specific data
 */
export interface ManageData {
  hasDeadline: boolean;
  deadline?: number;      // Unix timestamp
  hasPriority: boolean;
  priority?: 'low' | 'medium' | 'high';
  hasSubtasks: boolean;
  subtaskCount?: number;
  completedSubtasks?: number;
  completedAt?: number;
  stateHistory: StateTransition[];
  usefulnessLevel: ManageUsefulnessLevel;
}

/**
 * DEVELOP mode specific data
 */
export interface DevelopData {
  maturityLevel: DevelopMaturityLevel;
  contentType?: DevelopContentType;
  expansionCount: number; // Number of times AI expanded the idea
  linkedIdeas: string[];  // Related note IDs
  lastExpandedAt?: number;
  readyForAction?: boolean; // Ready to bridge to MANAGE
}

/**
 * ORGANIZE mode specific data
 */
export interface OrganizeData {
  stage: OrganizeStage;
  processedAt?: number;   // When moved from INBOX
  usageCount: number;     // How many times accessed/used
  lastUsedAt?: number;
  tags: string[];
  autoTags?: string[];    // AI-suggested tags
  // LEARN specific
  masteryLevel?: number;  // 0-100
  nextReviewAt?: number;  // Spaced repetition
  reviewHistory?: Array<{
    timestamp: number;
    result: 'knew' | 'forgot' | 'skipped';
  }>;
  flowStage: OrganizeFlowStage;
}

/**
 * EXPERIENCE mode specific data
 */
export interface ExperienceData {
  entryDate: number;
  sentiment?: Sentiment;
  hasMedia: boolean;
  hasLocation: boolean;
  location?: {
    name?: string;
    coordinates?: { lat: number; lng: number };
  };
  peopleTagged: string[];
  streakDays: number;     // Consecutive journaling days
  lastEntryAt?: number;
  depthLevel: ExperienceDepthLevel;
}

/**
 * Union type for mode-specific data
 */
export type ModeData = ManageData | DevelopData | OrganizeData | ExperienceData;

/**
 * Note behavior tracking entity
 * Tracks engagement and lifecycle of notes within the MODE framework
 */
export interface NoteBehavior {
  noteId: string;
  mode: Mode;

  // Lifecycle
  usefulnessScore: number;  // 0-100
  usefulnessLevel: string;  // Mode-specific level name

  // Engagement
  lastAccessedAt: number;
  accessCount: number;
  editCount: number;
  createdAt: number;

  // Mode-specific data
  modeData: ModeData;

  // Learning
  lastNudgedAt?: number;
  nudgeCount: number;
  nudgeResponseRate?: number; // 0-1, how often user responds to nudges
}

// ============================================
// User Behavior Learning (MODE Framework)
// ============================================

/**
 * User patterns learned by the behavior system
 */
export interface UserPatterns {
  // Time patterns
  activeHours: number[];      // 0-23, hours when user is most active
  journalingTime?: number;    // Preferred journaling hour
  taskCompletionTime?: number; // Preferred task time

  // Engagement patterns
  nudgeResponseRate: number;   // Overall nudge response rate
  preferredNudgeChannel: NudgeDeliveryChannel;
  dismissedSkillIds: string[]; // Skills user consistently dismisses

  // Content patterns
  averageNoteLength: number;
  commonTags: string[];
  modeDistribution: Record<Mode, number>; // % of notes in each mode

  // Updated timestamp
  lastUpdatedAt: number;
}

/**
 * User event for behavior tracking
 */
export interface UserBehaviorEvent {
  id: string;
  userId: string;
  eventType: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// Mode-Aware Board Extension
// ============================================

/**
 * Mode configuration for boards
 */
export interface BoardModeConfig {
  mode: Mode;
  organizeStage?: OrganizeStage;  // Only for ORGANIZE mode
  agentEnabled: boolean;          // Whether AI agent is active
  customSettings?: Record<string, unknown>;
}

export type StickerPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type StickerScale = 'small' | 'medium' | 'large';

export type TypographyStyle = 'serif' | 'sans-serif' | 'handwritten';
export type TypographyVibe = 'modern' | 'classic' | 'cute' | 'dramatic';

export type MoodTone = 'playful' | 'elegant' | 'dark' | 'warm' | 'cool' | 'energetic';

// Note background colors (refreshed to harmonize with purple theme)
export enum NoteColor {
  White = '#FFFFFF',
  Lavender = '#EDE9FE',
  Rose = '#FFE4E6',
  Peach = '#FED7AA',
  Mint = '#D1FAE5',
  Sky = '#E0F2FE',
  Violet = '#DDD6FE',
}

// Character sticker generated from AI
export interface CharacterSticker {
  id: string;
  imageUri: string;           // Local URI to sticker image
  description: string;        // What the sticker depicts
  suggestedPosition: StickerPosition;
  scale: StickerScale;
}

// Lucky design vibe types
export type DesignVibe = 'chaotic' | 'unhinged' | 'dramatic' | 'cursed' | 'blessed' | 'feral' | 'normal';

// Background style types
export type BackgroundStyle = 'solid' | 'gradient' | 'image' | 'pattern';

// AI-generated note design
export interface NoteDesign {
  id: string;
  name: string;
  sourceImageUri: string;     // Original uploaded image
  createdAt: number;          // Unix timestamp

  background: {
    primaryColor: string;     // Hex color
    secondaryColor?: string;  // For gradients
    style: BackgroundStyle;
    // Background image/pattern fields
    imageUri?: string;        // URI to background image (usually sourceImageUri)
    patternId?: string;       // ID from built-in pattern library
    opacity?: number;         // 0.1-0.3 for subtle overlay (default: 0.15)
  };

  colors: {
    titleText: string;
    bodyText: string;
    accent: string;
  };

  typography: {
    titleStyle: TypographyStyle;
    vibe: TypographyVibe;
  };

  sticker: CharacterSticker;

  designSummary: string;      // AI-generated description

  // "Feeling Lucky" fields
  vibe?: DesignVibe;          // Energy/mood of the design
  isLucky?: boolean;          // True if generated via "Feeling Lucky"

  // System preset fields
  isSystemDefault?: boolean;  // True for built-in theme presets
  themeId?: ThemeId;          // Reference to source theme (for system defaults)

  // Label preset fields
  labelPresetId?: string;     // Reference to LabelPresetId
  isLabelPreset?: boolean;    // True for auto-generated from label preset

  // Quality assessment (for AI-generated stickers)
  stickerQualityMetadata?: QualityMetadata;  // Quality signals for sticker generation
}

// Background override for per-note customization
export interface BackgroundOverride {
  style: BackgroundStyle | 'none';  // 'none' removes background from design
  imageUri?: string;
  patternId?: string;
  opacity?: number;
}

// Core note entity
export interface Note {
  id: string;
  title: string;
  content: string;            // Rich text (format TBD)
  labels: string[];           // Array of label names
  color: NoteColor;           // Basic background color
  designId?: string;          // Reference to NoteDesign
  activeDesignLabelId?: string;  // When multiple labels have presets, which one's design to use
  backgroundOverride?: BackgroundOverride;  // Per-note background customization
  typographyPosterUri?: string;  // Typographic Poster generated text art image
  characterMascotUri?: string;   // Character Mascot generated character image
  images?: string[];             // Array of image URIs attached to note
  deadline?: string;             // ISO date string "2024-01-26" (MODE Framework)
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: number;         // For 30-day trash
  createdAt: number;
  updatedAt: number;
}

// Label for organizing notes
export interface Label {
  id: string;
  name: string;
  presetId?: string;  // Reference to LabelPresetId if this label has a design preset
  customDesignId?: string; // Reference to AI-generated design for custom labels
  isSystemLabel?: boolean; // True for system labels like 'uncategorized'
  createdAt: number;
  lastUsedAt?: number;  // Track when label was last added to a note (for sorting)
}

// ============================================
// Auto-Labeling System Types
// ============================================

// A label matched from existing labels during note analysis
export interface MatchedLabel {
  labelName: string;
  confidence: number;  // 0-1, how well this label matches the content
  reason: string;      // Why this label was suggested
}

// A suggestion for a new label that doesn't exist yet
export interface SuggestedNewLabel {
  name: string;
  category: string;    // productivity, planning, checklists, media, creative, personal
  reason: string;      // Why this label is being suggested
}

// Result from analyzing note content for labels
export interface LabelAnalysisResult {
  matchedLabels: MatchedLabel[];
  suggestedNewLabels: SuggestedNewLabel[];
  analysis: {
    topics: string[];
    mood: string;
    contentType: string;  // todo, journal, review, etc.
  };
}

// A pending label suggestion shown to the user
export interface LabelSuggestion {
  id: string;
  noteId: string;
  labelName: string;
  isNewLabel: boolean;  // True if this is a suggested new label
  confidence: number;
  reason: string;
  category?: string;    // For new labels, the suggested category
  status: 'pending' | 'accepted' | 'declined';
}

// Subscription state
export type SubscriptionPlan = 'monthly';

export interface Subscription {
  isPro: boolean;
  plan: SubscriptionPlan | null;
  expiresAt: number | null;           // Unix timestamp
  lastCoinGrantDate: number | null;   // When 100 coins were last granted
  willRenew: boolean;                 // Auto-renew status from RevenueCat
}

export const DEFAULT_SUBSCRIPTION: Subscription = {
  isPro: false,
  plan: null,
  expiresAt: null,
  lastCoinGrantDate: null,
  willRenew: false,
};

// User state and economy
export interface User {
  id: string;
  email?: string;
  freeDesignsUsed: number;  // Count of free designs used (0-3)
  coinBalance: number;
  createdAt: number;
  subscription: Subscription;  // Pro subscription state
}

// In-app purchase record
export interface Purchase {
  id: string;
  productId: string;
  coinsGranted: number;
  purchasedAt: number;
  transactionId: string;
  platform: 'ios' | 'android';
  priceString?: string;       // Localized price string (e.g., "$0.99")
  currencyCode?: string;      // ISO 4217 currency code (e.g., "USD")
}

// Coin package for display in shop
export interface CoinPackage {
  id: string;
  productId: string;
  name: string;
  coins: number;
  bonusCoins: number;
  totalCoins: number;
  priceString: string;
  isBestValue: boolean;
  isMostPopular: boolean;
}

// App settings
export interface AppSettings {
  darkMode: boolean;
  defaultNoteColor: NoteColor;
}

// View context for design adaptation
export type DesignViewContext = 'grid' | 'list' | 'detail' | 'share';

// ============================================
// Design Engine Types
// ============================================

// Composed style output from DesignEngine
// This is the view-ready style that adapts to each context
export interface ComposedStyle {
  // Colors
  backgroundColor: string;
  backgroundGradient?: {
    colors: string[];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  // Background image/pattern (only shown in detail/share contexts)
  backgroundImageUri?: string;
  backgroundPattern?: {
    patternId: string;
    assetName: string;
  };
  patternTintColor?: string;  // Color to tint the pattern (for universal diagonal stripes)
  backgroundOpacity: number;
  showBackground: boolean;    // False in grid/list for performance

  titleColor: string;
  bodyColor: string;
  accentColor: string;

  // Typography
  titleFontFamily?: string;  // Font family for title text
  bodyFontFamily?: string;   // Font family for body text
  fontStyle?: 'sans-serif' | 'serif' | 'display' | 'handwritten' | 'mono';

  // Label preset info (for showing icon/badge)
  labelIcon?: string;        // Emoji icon from preset (for boards)
  noteIcon?: string;         // Phosphor icon name for notes (small, crisp)

  // Border radius (for card corners)
  borderRadius: number;

  // Shadow
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number; // Android shadow

  // Sticker (only visible in detail/share)
  showSticker: boolean;
  stickerScale: number;
  stickerPosition: StickerPosition;
  stickerUri?: string;

  // Decorations (for special borders like shoujo, pop)
  decorations?: {
    type: 'shoujo' | 'pop' | 'vintage' | 'none';
    color?: string;
  };
}

// ============================================
// Board Types
// ============================================

// Custom styling for board (optional override)
export interface BoardStyle {
  coverColor?: string;       // Solid background color
  coverGradient?: string[];  // Gradient colors [start, end]
  icon?: string;             // Lucide icon name
}

// Board entity (persisted)
export interface Board {
  id: string;
  hashtag: string;           // Links to notes via labels
  customStyle?: BoardStyle;  // Optional custom styling override
  boardDesignId?: string;    // Reference to BoardDesign
  createdAt: number;
  updatedAt: number;

  // MODE Framework (v2.0)
  mode?: Mode;               // Cognitive mode for this board
  organizeStage?: OrganizeStage;  // Only for ORGANIZE mode boards
  modeConfig?: BoardModeConfig;   // Full mode configuration
}

// Board accent decoration types
export type BoardAccentType = 'sparkles' | 'stars' | 'hearts' | 'flowers' | 'none';

// AI-generated board design
export interface BoardDesign {
  id: string;
  boardHashtag: string;      // Links to board
  name: string;              // AI-generated name, e.g., "Anime Watchlist Corkboard"
  createdAt: number;

  // Header styling
  header: {
    backgroundColor: string;
    textColor: string;
    badgeColor: string;
    badgeTextColor: string;
    accentColor: string;
  };

  // Corkboard area styling
  corkboard: {
    backgroundColor: string;
    textureId?: string;      // Optional texture from library
    textureOpacity: number;  // 0.1-1.0
    borderColor: string;
  };

  // Decorative elements
  decorations: {
    icon?: string;           // Lucide icon name
    iconColor?: string;
    accentType: BoardAccentType;
    accentColor?: string;
  };

  // AI metadata
  designSummary: string;
  sourceKeywords: string[];
  themeInspiration: string;
}

// Gemini API response for board design generation
export interface GeminiBoardDesignResponse {
  name: string;
  header: {
    background_color: string;
    text_color: string;
    badge_color: string;
    badge_text_color: string;
    accent_color: string;
  };
  corkboard: {
    background_color: string;
    texture_id: string | null;
    texture_opacity: number;
    border_color: string;
  };
  decorations: {
    icon: string | null;
    icon_color: string | null;
    accent_type: BoardAccentType;
    accent_color: string | null;
  };
  design_summary: string;
  source_keywords: string[];
  theme_inspiration: string;
}

// Board design generation request
export interface BoardDesignRequest {
  hashtag: string;
  noteContent: string[];     // Array of note titles/content snippets
  userHint?: string;         // Optional user text input
}

// Derived board data (for UI, computed from notes)
export interface BoardData {
  hashtag: string;
  noteCount: number;
  previewNotes: Note[];      // First 3 notes for collage preview
  mostRecentUpdate: number;  // Timestamp of most recently updated note
  derivedColors: string[];   // Colors derived from note backgrounds
}

// ============================================
// Design Theme System
// ============================================

export type ThemeId =
  | 'ghibli'
  | 'manga'
  | 'webtoon'
  | 'shoujo'
  | 'shonen'
  | 'kawaii'
  | 'vintage';

export type AccentType =
  | 'sparkles'
  | 'flowers'
  | 'speed_lines'
  | 'impact_stars'
  | 'hearts'
  | 'clouds'
  | 'bokeh'
  | 'retro_shapes'
  | 'none';

// Pre-defined design theme
export interface DesignTheme {
  id: ThemeId;
  name: string;
  emoji: string;
  description: string;

  // Default color palette (can be customized by AI based on image)
  colors: {
    background: string;
    backgroundSecondary?: string; // For gradients
    title: string;
    body: string;
    accent: string;
  };

  // Background style
  background: {
    style: BackgroundStyle;
    patternId?: string;      // From pattern library
    defaultOpacity: number;
    gradient?: {
      direction: 'vertical' | 'horizontal' | 'diagonal';
      colors: string[];
    };
  };

  // Typography hints (used by AI for sticker style)
  typography: {
    titleStyle: TypographyStyle;
    vibe: TypographyVibe;
  };

  // Decorative accents
  accents: {
    type: AccentType;
    positions: ('corners' | 'edges' | 'scattered' | 'around_sticker')[];
    color?: string;         // Uses accent color if not specified
    animated?: boolean;
  };

  // Sticker generation hints
  stickerHint: {
    artStyle: string;       // e.g., "watercolor soft shading", "bold manga lines"
    mood: MoodTone;
    defaultPosition: StickerPosition;
    defaultScale: StickerScale;
  };

  // AI prompt modifiers
  aiPromptHints: string[];
}

// Theme selection for design creation
export interface ThemeSelection {
  themeId: ThemeId;
  customizations?: {
    primaryColor?: string;
    accentColor?: string;
    patternId?: string;
  };
}

// Gemini API response for design generation
export interface GeminiDesignResponse {
  background: {
    primary_color: string;
    secondary_color?: string;
    style: 'solid' | 'gradient';
  };
  colors: {
    title_text: string;
    body_text: string;
    accent: string;
  };
  typography: {
    title_style: TypographyStyle;
    vibe: TypographyVibe;
  };
  mood: {
    tone: MoodTone;
    theme: string;
  };
  character: {
    description: string;
    suggested_position: StickerPosition;
    scale: StickerScale;
  };
  design_summary: string;
}

// ============================================
// Typographic Poster - Text Art Generation
// ============================================

// Text analysis result from AI content analysis
export interface TextAnalysis {
  mood: {
    primary: string;      // e.g., "happy", "sad", "excited"
    energy: 'low' | 'medium' | 'high';
    tone: string;         // e.g., "casual", "formal", "playful"
  };
  keywords: {
    topics: string[];     // Main topics identified
    themes: string[];     // Underlying themes
  };
  context: {
    purpose: string;      // e.g., "reminder", "story", "todo"
    audience: string;     // e.g., "personal", "professional"
  };
  suggestedStyle: {
    aesthetic: string;    // e.g., "modern", "vintage", "cute"
    colorMood: string;    // e.g., "warm", "cool", "vibrant"
  };
}

// Typography poster style presets
export type TypographyPosterStyle = 'hand-lettered' | 'brush-marker' | 'designer' | 'bold-modern';

// Character mascot type presets
export type CharacterMascotType = 'chibi-anime' | 'realistic-anime' | 'mascot-cute';

// Typography style configuration
export interface TypographyStyleConfig {
  id: TypographyPosterStyle;
  name: string;
  emoji: string;
  description: string;
  artDirection: string;      // Prompt guidance for AI
  fontVibe: string;          // e.g., "flowing script", "bold sans-serif"
  mood: string;
}

// Character mascot configuration
export interface CharacterMascotConfig {
  id: CharacterMascotType;
  name: string;
  emoji: string;
  description: string;
  artDirection: string;
  proportions: string;       // e.g., "chibi 2:1 head ratio", "realistic"
  expressionStyle: string;
}

// Typography poster generation request
export interface TypographicPosterRequest {
  analysis: TextAnalysis;
  noteTitle: string;
  noteContent: string;
  typographyStyle?: TypographyPosterStyle;
  characterType?: CharacterMascotType;
}

// Typography image response
export interface TypographyImageResponse {
  imageBase64: string;
  mimeType: string;
  style: TypographyPosterStyle;
  renderedText: string;      // The text that was rendered
  artistNotes: string;       // AI explanation of design choices
}

// Character mascot response
export interface CharacterMascotResponse {
  imageBase64: string;
  mimeType: string;
  characterType: CharacterMascotType;
  characterDescription: string;  // What the AI drew
  poseDescription: string;       // How character relates to text
  artistNotes: string;
}

// ============================================
// AI Image Quality Assessment Types
// ============================================

// Edge sharpness detection result
export type EdgeSharpness = 'clean' | 'rough' | 'unknown';

// Processing method used for image
export type ProcessingMethod = 'ai' | 'threshold' | 'fallback';

// Quality signals from image analysis
export interface QualitySignals {
  hasTransparency: boolean;       // Did we detect any transparent pixels?
  transparencyRatio: number;      // % of image that is transparent (0-1)
  edgeSharpness: EdgeSharpness;   // Quality of subject edges
  processingMethod: ProcessingMethod;  // How the image was processed
  confidenceScore: number;        // Overall quality confidence (0-1)
}

// Quality metadata returned from AI generation endpoints
export interface QualityMetadata {
  qualitySignals: QualitySignals;
  warnings: string[];             // Human-readable quality issues
}

// Quality event types for tracking
export type QualityEventType = 'generation' | 'accepted' | 'rejected' | 'retry';
export type QualityGenerationType = 'sticker' | 'character' | 'background_removal';

// Quality event for database tracking
export interface QualityEvent {
  id: string;
  userId: string;
  eventType: QualityEventType;
  generationType: QualityGenerationType;
  qualityScore: number;
  qualitySignals: QualitySignals;
  fallbackUsed: boolean;
  createdAt: number;
}

// ============================================
// AI Goal-Agent System Types
// ============================================

/**
 * Nudge engagement level determines how aggressively
 * the goal system interacts with the user for a given note.
 *
 * - active: Proactive scheduled nudges (deadlines, action items)
 * - passive: Nudge only on note open/update events (creative, exploratory)
 * - none: No goal generated (bookmarks, reference, archives)
 */
export type NudgeEngagement = 'active' | 'passive' | 'none';

/**
 * Goal lifecycle status
 */
export type GoalStatus = 'analyzing' | 'active' | 'paused' | 'achieved' | 'abandoned';

/**
 * Individual step status within a goal
 */
export type ActionStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

/**
 * A single action step within a goal's plan
 */
export interface ActionStep {
  id: string;
  order: number;
  title: string;                // "Book flights"
  description: string;          // Agent-voice: "Have you looked at flight options?"
  status: ActionStepStatus;
  completedAt?: number;
  nudgeCount: number;
  lastNudgedAt?: number;
  /** How this step is verified */
  actionType: 'prompt_user' | 'auto_detect' | 'manual_check';
  /** For auto_detect: which note field to check */
  autoDetectField?: string;
  autoDetectCondition?: 'exists' | 'gt' | 'contains';
  autoDetectValue?: string | number;
}

/**
 * AI-inferred goal for a note with action plan
 */
export interface NoteGoal {
  id: string;
  noteId: string;
  mode: Mode;
  agentId: AgentId;
  /** AI-determined nudge engagement level */
  nudgeEngagement: NudgeEngagement;
  goalStatement: string;         // "Plan your Japan trip"
  reasoning: string;             // Why AI inferred this goal
  engagementReasoning: string;   // Why this engagement level
  steps: ActionStep[];
  status: GoalStatus;
  createdAt: number;
  updatedAt: number;
  achievedAt?: number;
  revision: number;
  lastAnalyzedContentHash: string;
  // Active-only scheduling fields
  nextNudgeAt?: number;
  nudgeCadenceMs: number;        // Starts 4h, adapts
  totalNudgesSent: number;
  consecutiveDismissals: number;
}

/**
 * Feedback from beta users about goal quality
 */
export interface GoalFeedback {
  noteId: string;
  goalId: string;
  goalStatement: string;
  engagement: NudgeEngagement;
  feedbackText: string;
  timestamp: number;
  userId?: string;
  appVersion: string;
}
