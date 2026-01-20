/**
 * Task Decomposition Skill - Manager Agent
 *
 * Detects large/complex tasks and offers to break them down.
 * Helps prevent overwhelm by making tasks more manageable.
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { ManageData } from '@/types';
import { MANAGER_SKILL_IDS } from '../../agents/ManagerAgent';

// ============================================
// Complexity Detection
// ============================================

interface ComplexitySignals {
  contentLength: boolean;
  multipleAnds: boolean;
  sequentialLanguage: boolean;
  complexVerbs: boolean;
  manyLines: boolean;
  noSubtasks: boolean;
}

function detectComplexity(content: string, hasSubtasks: boolean): ComplexitySignals {
  const lower = content.toLowerCase();

  return {
    contentLength: content.length > 300,
    multipleAnds: (lower.match(/\band\b/g) || []).length >= 2,
    sequentialLanguage: /(?:first|then|next|finally|after that|before|afterwards)/i.test(lower),
    complexVerbs: /(?:research|plan|prepare|organize|coordinate|implement|design|develop|create|build)/i.test(lower),
    manyLines: (content.match(/\n/g) || []).length > 4,
    noSubtasks: !hasSubtasks,
  };
}

function isComplex(signals: ComplexitySignals): boolean {
  const positiveSignals = Object.values(signals).filter(Boolean).length;
  return positiveSignals >= 3;
}

// ============================================
// Skill Definition
// ============================================

const decomposeSkill = new SkillBuilder({
  id: MANAGER_SKILL_IDS.DECOMPOSE,
  name: 'Task Decomposition',
  description: 'Offers to break down complex tasks into subtasks',
  agentId: 'manager',
  cooldownMs: 48 * 60 * 60 * 1000, // 48 hours per note
})
  // Trigger on note creation or update
  .onEvent('note_created')
  .onEvent('note_updated')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'manage') return false;

    const data = ctx.behavior.modeData as ManageData;

    // Skip if already has subtasks or is complete
    if (data.hasSubtasks || data.completedAt) return false;

    // Check complexity
    const signals = detectComplexity(ctx.note.content, data.hasSubtasks);
    return isComplex(signals);
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as ManageData;

    // Skip if already broken down
    if (data.hasSubtasks) return noAction();

    const signals = detectComplexity(ctx.note.content, data.hasSubtasks);

    // Not complex enough
    if (!isComplex(signals)) return noAction();

    const taskTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 40);

    // Generate suggested subtasks
    const suggestedSubtasks = extractPotentialSubtasks(ctx.note.content);

    const nudgeParams: NudgeParams = {
      title: 'This looks like a big task',
      body: `"${taskTitle}" might be easier to tackle if you break it down into smaller steps.`,
      priority: 'medium',
      deliveryChannel: 'sheet', // Use sheet for more complex interaction
      options: [
        {
          id: 'break-down',
          label: 'Break it down',
          isPrimary: true,
          action: {
            type: 'custom',
            handler: 'show_subtask_suggestions',
            data: {
              noteId: ctx.note.id,
              suggestions: suggestedSubtasks,
            },
          },
        },
        {
          id: 'convert-checklist',
          label: 'Convert to checklist',
          action: {
            type: 'navigate',
            target: `/note/${ctx.note.id}?mode=checklist`,
          },
        },
        {
          id: 'keep-simple',
          label: "It's fine as is",
          action: {
            type: 'dismiss',
          },
        },
        snoozeOption(24), // 24 hours
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Subtask Extraction
// ============================================

function extractPotentialSubtasks(content: string): string[] {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const subtasks: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip very short lines
    if (trimmed.length < 5) continue;

    // Skip what looks like a title
    if (trimmed.startsWith('#')) continue;

    // Look for bullet points
    if (/^[-•*]\s/.test(trimmed)) {
      subtasks.push(trimmed.replace(/^[-•*]\s*/, ''));
      continue;
    }

    // Look for numbered items
    if (/^\d+[.)]\s/.test(trimmed)) {
      subtasks.push(trimmed.replace(/^\d+[.)]\s*/, ''));
      continue;
    }

    // Look for action phrases
    if (/^(?:need to|should|must|have to|want to|will|going to)\s/i.test(trimmed)) {
      subtasks.push(trimmed);
      continue;
    }

    // Look for verb-starting sentences
    if (/^(?:create|write|send|call|email|review|check|update|fix|add|remove|build|design|plan|schedule|prepare|organize)/i.test(trimmed)) {
      subtasks.push(trimmed);
    }
  }

  // If no subtasks found, suggest generic steps
  if (subtasks.length === 0) {
    return [
      'Define what "done" looks like',
      'Identify the first small step',
      'Gather any needed resources',
      'Set aside focused time',
      'Review and adjust as needed',
    ];
  }

  // Limit to 5 subtasks
  return subtasks.slice(0, 5);
}

// ============================================
// Registration
// ============================================

skillRegistry.register(decomposeSkill, 'manager');

export { decomposeSkill, detectComplexity, isComplex };
export default decomposeSkill;
