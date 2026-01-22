/**
 * Biographer Agent - MODE Framework v2.0 (Web)
 *
 * The Biographer helps users capture and reflect on experiences.
 * Core question: "What do you want to remember?"
 *
 * Skills:
 * - Gentle nudge: Evening prompts for journaling
 * - Time capsule: Surfaces memories from past
 * - Enrich: Prompts for photos, locations, people
 * - Pattern alert: Notices emotional patterns
 * - Memory link: Connects related experiences
 */

import { Agent, SkillContext } from './Agent';

export class BiographerAgent extends Agent {
  constructor() {
    super('biographer');
  }

  protected generateGreeting(): string {
    return 'Take a moment to reflect. What would you like to remember about today?';
  }

  protected generateHelpText(context?: SkillContext): string {
    if (context?.note) {
      return `"${context.note.title}" captures a moment. Want to add more details to help you remember it later?`;
    }
    return 'I can help you capture moments, reflect on experiences, and preserve memories that matter.';
  }

  initializeSkills(): void {
    // Skills will be registered by the skills system
  }
}

// Export singleton instance
export const biographerAgent = new BiographerAgent();
