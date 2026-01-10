'use client';

import { useState, useEffect } from 'react';
import { trackInteraction } from '@/lib/sessionTracking';

const insightOptions = [
  { id: 'forget', label: 'I forget what I\'ve written' },
  { id: 'find', label: 'I can never find the right note' },
  { id: 'mess', label: 'My notes are a disorganized mess' },
  { id: 'time', label: 'I don\'t have time to organize' },
  { id: 'ugly', label: 'My notes look ugly/boring' },
  { id: 'apps', label: 'I\'ve tried too many apps' },
];

interface SignupFormProps {
  selectedPains: string[];
}

export function SignupForm({ selectedPains }: SignupFormProps) {
  const [step, setStep] = useState<'insight' | 'email' | 'success'>('insight');
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [customFrustration, setCustomFrustration] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackInteraction('section_viewed', { section: 'signup' });
  }, []);

  const handleInsightSelect = (insightId: string) => {
    setSelectedInsight(insightId);
    trackInteraction('insight_answered', {
      selection: insightId,
      is_custom: false,
    });
  };

  const handleContinue = () => {
    if (selectedInsight || customFrustration.trim()) {
      if (customFrustration.trim() && !selectedInsight) {
        trackInteraction('insight_answered', {
          selection: 'custom',
          is_custom: true,
        });
      }
      setStep('email');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pain_selections: selectedPains,
          insight_selection: selectedInsight,
          custom_frustration: customFrustration.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      trackInteraction('waitlist_signup', {
        pain_selections: selectedPains,
        insight: selectedInsight || 'custom',
      });

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="signup" className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-2xl px-6">
        {step === 'insight' && (
          <div className="text-center">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Help us build the notes app you actually want
            </h2>
            <p className="text-warm-500 text-base md:text-lg mb-10">
              What&apos;s your biggest frustration with how you take notes?
            </p>

            {/* Insight options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {insightOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleInsightSelect(option.id)}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${selectedInsight === option.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-warm-200 bg-warm-50 hover:border-warm-300'
                    }
                  `}
                >
                  <span className={`
                    text-sm font-medium
                    ${selectedInsight === option.id ? 'text-teal-900' : 'text-warm-700'}
                  `}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom text input */}
            <div className="mb-8">
              <label className="block text-warm-500 text-sm mb-2 text-left">
                Or type your own:
              </label>
              <textarea
                value={customFrustration}
                onChange={(e) => setCustomFrustration(e.target.value)}
                placeholder="What frustrates you most about your current note-taking?"
                className="w-full px-4 py-3 rounded-xl border-2 border-warm-200 focus:border-teal-500 focus:outline-none resize-none text-warm-800 placeholder-warm-400"
                rows={3}
              />
            </div>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              disabled={!selectedInsight && !customFrustration.trim()}
              className={`
                w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all
                ${selectedInsight || customFrustration.trim()
                  ? 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg'
                  : 'bg-warm-200 text-warm-400 cursor-not-allowed'
                }
              `}
            >
              Continue
            </button>
          </div>
        )}

        {step === 'email' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-warm-900 mb-2">
              Got it. We&apos;re building exactly for people like you.
            </h2>
            <p className="text-warm-500 mb-8">
              Get early access when we launch:
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-warm-200 focus:border-teal-500 focus:outline-none text-warm-800 placeholder-warm-400"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Joining...' : 'Get Early Access'}
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              {/* Benefits */}
              <div className="bg-warm-50 rounded-xl p-6 text-left">
                <p className="text-warm-600 text-sm font-medium mb-3">What you&apos;ll get:</p>
                <ul className="space-y-2">
                  {[
                    'First access before public launch',
                    '30 free AI designs ($10 value)',
                    'Lifetime 20% discount on Pro',
                    'Direct line to the founder for feedback',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-warm-700 text-sm">
                      <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-warm-400 text-xs mt-4">
                We&apos;ll only email about launch. No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-warm-900 mb-4">
              You&apos;re on the list!
            </h2>
            <p className="text-warm-500 text-lg mb-6">
              Check your email for a confirmation.
              <br />
              We&apos;ll reach out when it&apos;s your turn.
            </p>

            <div className="bg-teal-50 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-teal-700 text-sm">
                <span className="font-semibold">Have thoughts on what would make the perfect notes app?</span>
                <br />
                Just reply to our confirmation email. We read everything.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
