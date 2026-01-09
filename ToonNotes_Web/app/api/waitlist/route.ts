import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Simple referral code generator
function generateReferralCode(email: string): string {
  const prefix = email.slice(0, 3).toLowerCase().replace(/[^a-z]/g, 'x');
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, pain_selections, insight_selection, custom_frustration } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Get UTM params from request headers (set by client from URL)
    const url = new URL(request.url);
    const utm_source = url.searchParams.get('utm_source');
    const utm_medium = url.searchParams.get('utm_medium');
    const utm_campaign = url.searchParams.get('utm_campaign');

    const supabase = await createClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist_signups')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      );
    }

    // Generate referral code
    const referral_code = generateReferralCode(email);

    // Insert new signup
    const { data, error } = await supabase
      .from('waitlist_signups')
      .insert({
        email: email.toLowerCase(),
        pain_selections: pain_selections || [],
        insight_selection,
        custom_frustration,
        referral_code,
        utm_source,
        utm_medium,
        utm_campaign,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to sign up. Please try again.' },
        { status: 500 }
      );
    }

    // Send confirmation email (if Resend is configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'ToonNotes <hello@toonnotes.com>',
          to: email,
          subject: "You're on the ToonNotes early access list",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 20px;">You're in!</h1>

              <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                We're building ToonNotes for people who take lots of notes but hate organizing them.
              </p>

              <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-top: 20px;">
                <strong>What you'll get as an early adopter:</strong>
              </p>

              <ul style="font-size: 16px; color: #4a4a4a; line-height: 1.8;">
                <li>First access before public launch</li>
                <li>30 free AI designs ($10 value)</li>
                <li>Lifetime 20% off Pro subscription</li>
                <li>Direct line to the founder</li>
              </ul>

              <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-top: 20px;">
                We'll email you when it's your turn.
              </p>

              <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin-top: 30px;">
                — Sungho, ToonNotes founder
              </p>

              <p style="font-size: 14px; color: #888; line-height: 1.6; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                P.S. Have thoughts about what would make the perfect notes app?<br/>
                Just reply to this email. We read everything.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        // Log but don't fail the signup if email fails
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      referral_code: data.referral_code,
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
