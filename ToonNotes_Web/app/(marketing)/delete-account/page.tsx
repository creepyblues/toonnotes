'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { submitDeletionRequest } from './actions';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const response = await submitDeletionRequest(email, reason);
    setResult(response);
    setIsSubmitting(false);

    if (response.success) {
      setEmail('');
      setReason('');
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="mx-auto max-w-2xl px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-warm-900 mb-4">
            Delete Your Account
          </h1>
          <p className="text-warm-600">
            Request permanent deletion of your ToonNotes account and all associated data.
          </p>
        </div>

        {/* Warning Box */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <h2 className="text-red-800 font-semibold text-lg mb-3">
            Before you proceed
          </h2>
          <p className="text-red-700 mb-4">
            Account deletion is <strong>permanent and cannot be undone</strong>.
            The following data will be permanently deleted:
          </p>
          <ul className="text-red-700 space-y-1 ml-4 list-disc">
            <li>Your account profile</li>
            <li>All notes and content</li>
            <li>All custom designs</li>
            <li>All labels and boards</li>
            <li>Purchase history</li>
            <li>Coin balance (non-refundable)</li>
          </ul>
        </div>

        {/* Success State */}
        {result?.success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-green-800 font-semibold text-xl mb-3">
              Request Submitted
            </h2>
            <p className="text-green-700 mb-6">
              {result.message}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-warm-900 text-white rounded-lg hover:bg-warm-800 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-warm-200 p-8">
            <div className="mb-6">
              <label htmlFor="email" className="block text-warm-800 font-medium mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the email associated with your account"
                required
                className="w-full px-4 py-3 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500 focus:border-transparent"
              />
              <p className="text-warm-500 text-sm mt-2">
                Enter the email you used to sign up (Google or Apple Sign-In)
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="reason" className="block text-warm-800 font-medium mb-2">
                Reason for leaving (optional)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Help us improve by sharing why you're leaving..."
                rows={4}
                className="w-full px-4 py-3 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Error Message */}
            {result && !result.success && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{result.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-warm-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Request Account Deletion'}
            </button>

            <p className="text-warm-500 text-sm text-center mt-4">
              We will process your request within 30 days and send a confirmation email.
            </p>
          </form>
        )}

        {/* Additional Info */}
        <div className="mt-10 text-center text-warm-600">
          <p className="mb-2">
            Have questions? Contact us at{' '}
            <a href="mailto:support@toonnotes.com" className="text-warm-900 underline">
              support@toonnotes.com
            </a>
          </p>
          <p>
            <Link href="/privacy" className="text-warm-900 underline">
              View Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
