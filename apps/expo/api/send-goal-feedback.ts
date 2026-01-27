/**
 * Send Goal Feedback API
 *
 * POST /api/send-goal-feedback
 *
 * Receives beta user feedback about AI-generated goals and:
 * 1. Posts formatted message to Slack webhook
 * 2. Sends email notification to admin via Resend
 * 3. Returns success status
 *
 * Input: GoalFeedback payload
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurity } from './_utils/security';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'creepyblues@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const securityResult = applySecurity(req, res);
  if (securityResult) return securityResult;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    noteId,
    goalId,
    goalStatement,
    engagement,
    feedbackText,
    timestamp,
    userId,
    appVersion,
  } = req.body;

  if (!feedbackText || !goalId) {
    return res.status(400).json({ error: 'feedbackText and goalId required' });
  }

  if (feedbackText.length > 2000) {
    return res.status(400).json({ error: 'Feedback too long' });
  }

  const results: { slack: boolean; email: boolean } = { slack: false, email: false };

  // 1. Send to Slack
  if (SLACK_WEBHOOK_URL) {
    try {
      const slackPayload = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🎯 Goal Feedback',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Goal:*\n${goalStatement || 'N/A'}` },
              { type: 'mrkdwn', text: `*Engagement:*\n${engagement || 'N/A'}` },
              { type: 'mrkdwn', text: `*App Version:*\n${appVersion || 'N/A'}` },
              { type: 'mrkdwn', text: `*User:*\n${userId || 'Anonymous'}` },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Feedback:*\n> ${feedbackText}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Note: ${noteId} | Goal: ${goalId} | ${new Date(timestamp).toISOString()}`,
              },
            ],
          },
        ],
      };

      const slackRes = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
      });

      results.slack = slackRes.ok;
    } catch (error) {
      console.error('[send-goal-feedback] Slack error:', error);
    }
  }

  // 2. Send email via Resend
  if (RESEND_API_KEY) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'ToonNotes <feedback@toonnotes.com>',
          to: [ADMIN_EMAIL],
          subject: `[Goal Feedback] ${goalStatement || 'No goal'}`,
          html: `
            <h2>Goal Feedback</h2>
            <p><strong>Goal:</strong> ${goalStatement || 'N/A'}</p>
            <p><strong>Engagement:</strong> ${engagement || 'N/A'}</p>
            <p><strong>Feedback:</strong></p>
            <blockquote>${feedbackText}</blockquote>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Note: ${noteId} | Goal: ${goalId} | User: ${userId || 'Anonymous'} | v${appVersion || '?'}
            </p>
          `,
        }),
      });

      results.email = emailRes.ok;
    } catch (error) {
      console.error('[send-goal-feedback] Email error:', error);
    }
  }

  return res.status(200).json({
    success: true,
    delivered: results,
  });
}
