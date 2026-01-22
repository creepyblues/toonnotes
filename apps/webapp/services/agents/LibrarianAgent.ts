/**
 * Librarian Agent - MODE Framework v2.0 (Web)
 *
 * The Librarian helps users organize and find information.
 * Core question: "Where should this live?"
 *
 * Skills:
 * - Daily sweep: Reminds about unprocessed inbox items
 * - Auto-categorize: Suggests tags and organization
 * - Enrich: Adds metadata to references
 * - Archive: Suggests archiving unused content
 * - Review: Prompts spaced repetition for LEARN items
 */

import { Agent, SkillContext } from './Agent';

export class LibrarianAgent extends Agent {
  constructor() {
    super('librarian');
  }

  protected generateGreeting(): string {
    return "Let's keep your knowledge organized and easy to find.";
  }

  protected generateHelpText(context?: SkillContext): string {
    if (context?.note) {
      return `Should we file "${context.note.title}" or add some tags to make it easier to find later?`;
    }
    return 'I can help you organize references, suggest tags, and keep your knowledge accessible.';
  }

  initializeSkills(): void {
    // Skills will be registered by the skills system
  }
}

// Export singleton instance
export const librarianAgent = new LibrarianAgent();
