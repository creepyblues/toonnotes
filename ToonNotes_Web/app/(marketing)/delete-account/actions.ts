'use server';

import { createClient } from '@/lib/supabase/server';

export interface DeletionRequestResult {
  success: boolean;
  message: string;
}

export async function submitDeletionRequest(
  email: string,
  reason?: string
): Promise<DeletionRequestResult> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
    };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('account_deletion_requests')
      .insert({
        email: email.toLowerCase().trim(),
        reason: reason?.trim() || null,
      });

    if (error) {
      console.error('Error submitting deletion request:', error);
      return {
        success: false,
        message: 'Failed to submit request. Please try again or email support@toonnotes.com.',
      };
    }

    return {
      success: true,
      message: 'Your deletion request has been submitted. We will process it within 30 days and send a confirmation to your email.',
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please email support@toonnotes.com directly.',
    };
  }
}
