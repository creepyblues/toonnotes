/**
 * Manager Agent - MODE Framework v2.0 (Web)
 *
 * The Manager helps users stay on top of tasks and deadlines.
 * Core question: "What needs to happen?"
 *
 * Skills:
 * - Deadline nudge: Prompts users to add deadlines to tasks
 * - Priority sort: Suggests prioritization of tasks
 * - Decompose: Breaks down complex tasks into subtasks
 * - Celebrate: Acknowledges completed tasks
 * - Relevance check: Identifies stale tasks
 */

import { Agent, SkillContext } from './Agent';

export class ManagerAgent extends Agent {
  constructor() {
    super('manager');
  }

  protected generateGreeting(): string {
    return "Ready to get things done? Let's make progress on your tasks.";
  }

  protected generateHelpText(context?: SkillContext): string {
    if (context?.note) {
      return `Let's focus on making "${context.note.title}" actionable.`;
    }
    return 'I can help you organize tasks, set deadlines, and break down complex work into manageable steps.';
  }

  initializeSkills(): void {
    // Skills will be registered by the skills system
    // This is called after the agent is created to allow
    // for dependency injection of skills
  }
}

// Export singleton instance
export const managerAgent = new ManagerAgent();
