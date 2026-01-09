/**
 * Quality Service
 *
 * Tracks AI image generation quality events to Supabase for analysis.
 * Enables monitoring of:
 * - Generation success/failure rates
 * - Quality score distributions
 * - User acceptance patterns
 * - Fallback trigger frequency
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { trackEvent } from './firebaseAnalytics';
import {
  QualityMetadata,
  QualityEventType,
  QualityGenerationType,
} from '@/types';

/**
 * Track a quality event to Supabase
 *
 * Called when:
 * - A generation completes (success or failure)
 * - User accepts a result
 * - User rejects a result
 * - User requests a retry
 */
export async function trackQualityEvent(params: {
  eventType: QualityEventType;
  generationType: QualityGenerationType;
  qualityMetadata?: QualityMetadata;
  fallbackUsed?: boolean;
}): Promise<void> {
  const { eventType, generationType, qualityMetadata, fallbackUsed } = params;

  // Track to Firebase Analytics (always, even if not authenticated)
  trackEvent(`quality_${eventType}`, {
    generation_type: generationType,
    quality_score: qualityMetadata?.qualitySignals.confidenceScore ?? 0,
    fallback_used: fallbackUsed ?? false,
    warnings_count: qualityMetadata?.warnings.length ?? 0,
  });

  // Track to Supabase (only for authenticated users)
  if (!isSupabaseConfigured()) {
    console.log('[QualityService] Supabase not configured, skipping database tracking');
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[QualityService] User not authenticated, skipping database tracking');
      return;
    }

    const { error } = await supabase.from('quality_events').insert({
      user_id: user.id,
      event_type: eventType,
      generation_type: generationType,
      quality_score: qualityMetadata?.qualitySignals.confidenceScore ?? null,
      quality_signals: qualityMetadata?.qualitySignals ?? null,
      fallback_used: fallbackUsed ?? false,
    });

    if (error) {
      console.error('[QualityService] Failed to track quality event:', error);
    }
  } catch (error) {
    // Don't block on analytics failures
    console.error('[QualityService] Error tracking quality event:', error);
  }
}

/**
 * Track when a quality preview is shown to the user
 */
export async function trackQualityPreviewShown(
  generationType: QualityGenerationType,
  qualityMetadata: QualityMetadata
): Promise<void> {
  await trackQualityEvent({
    eventType: 'generation',
    generationType,
    qualityMetadata,
    fallbackUsed: qualityMetadata.qualitySignals.processingMethod === 'fallback',
  });
}

/**
 * Track user's decision on a quality preview
 */
export async function trackQualityDecision(
  decision: 'accepted' | 'rejected' | 'retry',
  generationType: QualityGenerationType,
  qualityMetadata?: QualityMetadata
): Promise<void> {
  await trackQualityEvent({
    eventType: decision,
    generationType,
    qualityMetadata,
    fallbackUsed: qualityMetadata?.qualitySignals.processingMethod === 'fallback',
  });
}

/**
 * Get quality statistics for the current user
 * Useful for debugging and admin dashboards
 */
export async function getQualityStats(): Promise<{
  totalGenerations: number;
  acceptanceRate: number;
  retryRate: number;
  averageQualityScore: number;
} | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('quality_events')
      .select('event_type, quality_score')
      .eq('user_id', user.id);

    if (error || !data) return null;

    const totalGenerations = data.filter(e => e.event_type === 'generation').length;
    const accepted = data.filter(e => e.event_type === 'accepted').length;
    const retries = data.filter(e => e.event_type === 'retry').length;
    const qualityScores = data
      .filter(e => e.quality_score != null)
      .map(e => e.quality_score as number);

    return {
      totalGenerations,
      acceptanceRate: totalGenerations > 0 ? accepted / totalGenerations : 0,
      retryRate: totalGenerations > 0 ? retries / totalGenerations : 0,
      averageQualityScore:
        qualityScores.length > 0
          ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
          : 0,
    };
  } catch (error) {
    console.error('[QualityService] Error fetching quality stats:', error);
    return null;
  }
}
