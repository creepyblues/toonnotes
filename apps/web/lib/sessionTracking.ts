/**
 * Anonymous session tracking for promo page analytics.
 * Uses sessionStorage to persist ID within a browser session.
 */

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: generate a new ID (will be replaced on client)
    return crypto.randomUUID();
  }

  let sessionId = sessionStorage.getItem('promo_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('promo_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Track a promo page interaction event.
 * Sends data to Supabase for analytics.
 */
export async function trackInteraction(
  eventType: string,
  eventData: Record<string, unknown> = {}
): Promise<void> {
  const sessionId = getOrCreateSessionId();

  try {
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData,
      }),
    });

    if (!response.ok) {
      console.error('Failed to track interaction:', response.statusText);
    }
  } catch (error) {
    // Silently fail - analytics shouldn't break user experience
    console.error('Track interaction error:', error);
  }
}
