/**
 * Muse Agent - MODE Framework v2.0 (Web)
 *
 * The Muse helps users develop and expand ideas.
 * Core question: "What could this become?"
 *
 * Skills:
 * - Expand: Offers creative angles to develop ideas
 * - Resurface: Brings back forgotten ideas
 * - Connect: Links related ideas together
 * - Bridge: Helps transition developed ideas to tasks
 * - Unblock: Provides prompts when stuck
 */

import { Agent, SkillContext } from './Agent';

export class MuseAgent extends Agent {
  constructor() {
    super('muse');
  }

  protected generateGreeting(): string {
    return "What's sparking your curiosity today? Let's explore your ideas together.";
  }

  protected generateHelpText(context?: SkillContext): string {
    if (context?.note) {
      const titleSnippet = context.note.title.substring(0, 30);
      return `"${titleSnippet}" has potential! Want to explore where it could go?`;
    }
    return 'I can help you expand ideas, find connections, and develop sparks into something bigger.';
  }

  initializeSkills(): void {
    // Skills will be registered by the skills system
  }
}

// Export singleton instance
export const museAgent = new MuseAgent();
