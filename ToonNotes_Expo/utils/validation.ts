/**
 * Input Validation Utilities
 *
 * Provides validation and sanitization functions to prevent
 * XSS, injection attacks, and ensure data integrity.
 */

// Maximum lengths to prevent DoS attacks
export const MAX_LENGTHS = {
  noteTitle: 500,
  noteContent: 50000,
  labelName: 100,
  designName: 200,
  designSummary: 1000,
} as const;

/**
 * Sanitize text input by removing potentially dangerous characters
 * while preserving readability
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize unicode
    .normalize('NFC')
    // Trim whitespace
    .trim();
}

/**
 * Validate and sanitize note title
 */
export function validateNoteTitle(title: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeText(title);

  if (sanitized.length > MAX_LENGTHS.noteTitle) {
    return {
      isValid: false,
      sanitized: sanitized.slice(0, MAX_LENGTHS.noteTitle),
      error: `Title exceeds maximum length of ${MAX_LENGTHS.noteTitle} characters`,
    };
  }

  return { isValid: true, sanitized };
}

/**
 * Validate and sanitize note content
 */
export function validateNoteContent(content: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeText(content);

  if (sanitized.length > MAX_LENGTHS.noteContent) {
    return {
      isValid: false,
      sanitized: sanitized.slice(0, MAX_LENGTHS.noteContent),
      error: `Content exceeds maximum length of ${MAX_LENGTHS.noteContent} characters`,
    };
  }

  return { isValid: true, sanitized };
}

/**
 * Validate and sanitize label name
 */
export function validateLabelName(name: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeText(name);

  if (!sanitized) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Label name cannot be empty',
    };
  }

  if (sanitized.length > MAX_LENGTHS.labelName) {
    return {
      isValid: false,
      sanitized: sanitized.slice(0, MAX_LENGTHS.labelName),
      error: `Label name exceeds maximum length of ${MAX_LENGTHS.labelName} characters`,
    };
  }

  // Only allow alphanumeric, spaces, hyphens, and underscores
  const validPattern = /^[\w\s\-]+$/u;
  if (!validPattern.test(sanitized)) {
    return {
      isValid: false,
      sanitized: sanitized.replace(/[^\w\s\-]/gu, ''),
      error: 'Label name contains invalid characters',
    };
  }

  return { isValid: true, sanitized };
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') {
    return false;
  }

  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexPattern.test(color);
}

/**
 * Validate and sanitize hex color
 */
export function validateHexColor(
  color: string,
  defaultColor: string = '#FFFFFF'
): string {
  if (isValidHexColor(color)) {
    return color.toUpperCase();
  }
  return defaultColor;
}

/**
 * Validate file URI (for images)
 */
export function isValidFileUri(uri: string): boolean {
  if (!uri || typeof uri !== 'string') {
    return false;
  }

  // Allow file://, content://, and asset:// URIs
  const validPrefixes = ['file://', 'content://', 'asset://'];
  return validPrefixes.some((prefix) => uri.startsWith(prefix));
}

/**
 * Validate HTTP/HTTPS URL
 */
export function isValidHttpUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate design name
 */
export function validateDesignName(name: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeText(name);

  if (!sanitized) {
    return {
      isValid: false,
      sanitized: 'Untitled Design',
      error: 'Design name cannot be empty',
    };
  }

  if (sanitized.length > MAX_LENGTHS.designName) {
    return {
      isValid: false,
      sanitized: sanitized.slice(0, MAX_LENGTHS.designName),
      error: `Design name exceeds maximum length of ${MAX_LENGTHS.designName} characters`,
    };
  }

  return { isValid: true, sanitized };
}

/**
 * Rate limiter for AI calls
 */
class RateLimiter {
  private calls: number[] = [];
  private maxCalls: number;
  private windowMs: number;

  constructor(maxCalls: number = 10, windowMs: number = 60000) {
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
  }

  canMakeCall(): boolean {
    const now = Date.now();
    // Remove old calls outside the window
    this.calls = this.calls.filter((time) => now - time < this.windowMs);
    return this.calls.length < this.maxCalls;
  }

  recordCall(): void {
    this.calls.push(Date.now());
  }

  getRemainingCalls(): number {
    const now = Date.now();
    this.calls = this.calls.filter((time) => now - time < this.windowMs);
    return Math.max(0, this.maxCalls - this.calls.length);
  }

  getTimeUntilNextCall(): number {
    if (this.canMakeCall()) {
      return 0;
    }

    const now = Date.now();
    const oldestCall = Math.min(...this.calls);
    return Math.max(0, this.windowMs - (now - oldestCall));
  }
}

// Singleton rate limiter for AI calls (10 calls per minute)
export const aiRateLimiter = new RateLimiter(10, 60000);

/**
 * Validate AI prompt to prevent prompt injection
 */
export function validateAiPrompt(prompt: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeText(prompt);

  if (!sanitized) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Prompt cannot be empty',
    };
  }

  // Check for potential prompt injection patterns
  const suspiciousPatterns = [
    /ignore (all )?previous instructions/i,
    /disregard (all )?prior instructions/i,
    /forget (all )?your instructions/i,
    /you are now/i,
    /new persona/i,
    /system:/i,
    /assistant:/i,
    /user:/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      return {
        isValid: false,
        sanitized: sanitized.replace(pattern, ''),
        error: 'Prompt contains potentially malicious content',
      };
    }
  }

  // Limit prompt length
  const maxPromptLength = 2000;
  if (sanitized.length > maxPromptLength) {
    return {
      isValid: false,
      sanitized: sanitized.slice(0, maxPromptLength),
      error: `Prompt exceeds maximum length of ${maxPromptLength} characters`,
    };
  }

  return { isValid: true, sanitized };
}
