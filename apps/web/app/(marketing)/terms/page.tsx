import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'ToonNotes Terms of Service - Read our terms and conditions for using the app.',
};

export const dynamic = 'force-static';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <article className="prose prose-warm max-w-none">
          <h1 className="font-display text-4xl font-bold text-warm-900 mb-2">
            Terms of Service
          </h1>
          <p className="text-warm-500 text-sm mb-10">Last Updated: January 4, 2025</p>

          <section className="mb-10">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using ToonNotes (&quot;the App&quot;), you agree to be bound
              by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not
              use the App.
            </p>
          </section>

          <section className="mb-10">
            <h2>2. Description of Service</h2>
            <p>
              ToonNotes is a note-taking application that allows users to create, organize, and
              personalize notes with AI-powered design features. The App includes:
            </p>
            <ul>
              <li>Note creation and organization with labels and boards</li>
              <li>AI-generated custom note designs from uploaded images</li>
              <li>In-app purchases for virtual currency (&quot;Coins&quot;)</li>
              <li>Optional cloud sync and sharing features</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>3. Account Registration</h2>
            <h3>3.1 Account Creation</h3>
            <p>
              You may create an account using Google Sign-In or Apple Sign-In. You are responsible
              for maintaining the confidentiality of your account credentials.
            </p>
            <h3>3.2 Account Responsibilities</h3>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate information during registration</li>
              <li>Keep your account credentials secure</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <h3>3.3 Age Requirements</h3>
            <p>
              You must be at least 13 years old to use ToonNotes. If you are under 18, you must
              have parental consent.
            </p>
          </section>

          <section className="mb-10">
            <h2>4. In-App Purchases and Virtual Currency</h2>
            <h3>4.1 Coins</h3>
            <p>
              ToonNotes uses a virtual currency called &quot;Coins&quot; that can be purchased through the
              App Store. Coins are used to generate AI-powered custom note designs.
            </p>
            <h3>4.2 Free Designs</h3>
            <p>
              New users receive 3 free design generations. After using free designs, Coins are
              required for additional generations.
            </p>
            <h3>4.3 Purchase Terms</h3>
            <ul>
              <li>All purchases are processed through Apple App Store or Google Play Store</li>
              <li>Purchases are non-refundable except as required by applicable law</li>
              <li>Coins have no monetary value and cannot be exchanged for cash</li>
              <li>Coins are non-transferable between accounts</li>
            </ul>
            <h3>4.4 Refunds</h3>
            <p>
              Refund requests must be directed to Apple or Google according to their respective
              policies.
            </p>
          </section>

          <section className="mb-10">
            <h2>5. AI-Generated Content</h2>
            <h3>5.1 Nature of AI Content</h3>
            <p>
              The App uses artificial intelligence (Google Gemini) to generate note designs and
              stickers based on images you provide.
            </p>
            <h3>5.2 No Guarantees</h3>
            <p>We do not guarantee that AI-generated content will:</p>
            <ul>
              <li>Meet your specific expectations</li>
              <li>Be error-free or accurate</li>
              <li>Be suitable for any particular purpose</li>
            </ul>
            <h3>5.3 Content Ownership</h3>
            <ul>
              <li>You retain ownership of images you upload</li>
              <li>AI-generated designs are provided for personal use within the App</li>
              <li>We do not claim ownership of your notes or uploaded content</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>6. User Content</h2>
            <h3>6.1 Your Content</h3>
            <p>
              You retain all rights to notes, text, and images you create or upload to ToonNotes.
            </p>
            <h3>6.2 License Grant</h3>
            <p>
              By using the App, you grant us a limited license to process your content solely for
              the purpose of providing the App&apos;s features (e.g., generating designs, syncing data).
            </p>
            <h3>6.3 Content Restrictions</h3>
            <p>You agree not to upload or create content that:</p>
            <ul>
              <li>Violates any laws or regulations</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains malware or harmful code</li>
              <li>Is obscene, defamatory, or harassing</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>7. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Reverse engineer, decompile, or disassemble the App</li>
              <li>Use the App for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the App&apos;s functionality</li>
              <li>Use automated systems to access the App</li>
              <li>Resell or redistribute the App or its features</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>8. Data and Privacy</h2>
            <p>
              Your use of ToonNotes is also governed by our{' '}
              <a href="/privacy">Privacy Policy</a>. By using the App, you consent to:
            </p>
            <ul>
              <li>Local storage of notes on your device</li>
              <li>Optional cloud sync via Supabase (if enabled)</li>
              <li>Processing of images through AI services for design generation</li>
              <li>Analytics collection through Firebase (can be disabled in settings)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>9. Third-Party Services</h2>
            <p>ToonNotes integrates with third-party services including:</p>
            <ul>
              <li><strong>Google Gemini:</strong> For AI-powered design generation</li>
              <li><strong>Supabase:</strong> For optional cloud sync and sharing</li>
              <li><strong>Firebase:</strong> For analytics and crash reporting</li>
              <li><strong>RevenueCat:</strong> For in-app purchase processing</li>
            </ul>
            <p>
              Your use of these services is subject to their respective terms and privacy policies.
            </p>
          </section>

          <section className="mb-10">
            <h2>10. Intellectual Property</h2>
            <h3>10.1 App Ownership</h3>
            <p>
              ToonNotes, including its design, features, and code, is owned by us and protected
              by intellectual property laws.
            </p>
            <h3>10.2 Trademarks</h3>
            <p>ToonNotes and related logos are trademarks. You may not use them without permission.</p>
          </section>

          <section className="mb-10">
            <h2>11. Disclaimers</h2>
            <h3>11.1 &quot;As Is&quot; Basis</h3>
            <p className="uppercase font-medium">
              THE APP IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>
            <h3>11.2 No Warranty</h3>
            <p>We do not warrant that:</p>
            <ul>
              <li>The App will be uninterrupted or error-free</li>
              <li>Defects will be corrected</li>
              <li>The App is free of viruses or harmful components</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>12. Limitation of Liability</h2>
            <p className="uppercase font-medium">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            <ul>
              <li>We are not liable for any indirect, incidental, special, or consequential damages</li>
              <li>Our total liability is limited to the amount you paid for the App in the past 12 months</li>
              <li>We are not responsible for data loss or corruption</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>13. Indemnification</h2>
            <p>
              You agree to indemnify and hold us harmless from any claims, damages, or expenses
              arising from:
            </p>
            <ul>
              <li>Your use of the App</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>14. Termination</h2>
            <h3>14.1 By You</h3>
            <p>You may stop using the App at any time by deleting it from your device.</p>
            <h3>14.2 By Us</h3>
            <p>We may terminate or suspend your access if you:</p>
            <ul>
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or abusive behavior</li>
              <li>Fail to pay for in-app purchases</li>
            </ul>
            <h3>14.3 Effect of Termination</h3>
            <p>Upon termination:</p>
            <ul>
              <li>Your right to use the App ends immediately</li>
              <li>Unused Coins are forfeited</li>
              <li>We may delete your data after a reasonable period</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>15. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. We will notify you of material changes through:
            </p>
            <ul>
              <li>In-app notifications</li>
              <li>Email (if you&apos;ve provided one)</li>
              <li>Updating the &quot;Last Updated&quot; date</li>
            </ul>
            <p>Continued use after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section className="mb-10">
            <h2>16. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of California, United States,
              without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-10">
            <h2>17. Dispute Resolution</h2>
            <h3>17.1 Informal Resolution</h3>
            <p>
              Before filing a formal dispute, you agree to contact us to attempt informal resolution.
            </p>
            <h3>17.2 Arbitration</h3>
            <p>
              Any disputes not resolved informally will be resolved through binding arbitration
              in accordance with the American Arbitration Association rules.
            </p>
            <h3>17.3 Class Action Waiver</h3>
            <p>
              You agree to resolve disputes individually and waive any right to participate in
              class actions.
            </p>
          </section>

          <section className="mb-10">
            <h2>18. General Provisions</h2>
            <h3>18.1 Entire Agreement</h3>
            <p>
              These Terms constitute the entire agreement between you and us regarding the App.
            </p>
            <h3>18.2 Severability</h3>
            <p>
              If any provision is found unenforceable, the remaining provisions remain in effect.
            </p>
            <h3>18.3 No Waiver</h3>
            <p>Failure to enforce any right does not waive that right.</p>
            <h3>18.4 Assignment</h3>
            <p>You may not assign these Terms. We may assign them freely.</p>
          </section>

          <section className="mb-10">
            <h2>19. Contact Information</h2>
            <p>For questions about these Terms, contact us at:</p>
            <p><strong>Email:</strong> <a href="mailto:support@toonnotes.com">support@toonnotes.com</a></p>
          </section>

          <hr className="my-10" />
          <p className="text-warm-500 text-sm italic">
            By using ToonNotes, you acknowledge that you have read, understood, and agree to be
            bound by these Terms of Service.
          </p>
        </article>
      </div>
    </div>
  );
}
