import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'ToonNotes Privacy Policy - Learn how we collect, use, and protect your data.',
};

export const dynamic = 'force-static';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <article className="prose prose-warm max-w-none">
          <h1 className="font-display text-4xl font-bold text-warm-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-warm-500 text-sm mb-10">Last Updated: January 4, 2025</p>

          <section className="mb-10">
            <h2>Overview</h2>
            <p>
              ToonNotes is a note-taking app designed for anime and webtoon fans. Your privacy
              is important to us. This policy explains what data we collect, how we use it,
              and your choices.
            </p>
          </section>

          <section className="mb-10">
            <h2>Data We Collect</h2>

            <h3>Account Information</h3>
            <p>When you create an account using Google Sign-In or Apple Sign-In, we collect:</p>
            <ul>
              <li>Your name (as provided by the sign-in provider)</li>
              <li>Your email address</li>
              <li>A unique account identifier</li>
            </ul>
            <p>This information is used to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Enable cloud sync and sharing features</li>
              <li>Provide customer support</li>
            </ul>

            <h3>Data Stored Locally</h3>
            <p>The following data is stored on your device:</p>
            <ul>
              <li><strong>Notes and content:</strong> All your notes, text, and checklists</li>
              <li><strong>App settings:</strong> Theme preferences, dark mode, and customization options</li>
              <li><strong>Designs:</strong> Custom note designs you create</li>
              <li><strong>Images:</strong> Photos you upload for designs or attach to notes</li>
            </ul>

            <h3>Data Stored in the Cloud (Optional)</h3>
            <p>If you enable cloud features, the following may be stored on Supabase servers:</p>
            <ul>
              <li>Shared notes (only notes you explicitly choose to share)</li>
              <li>Account preferences</li>
            </ul>

            <h3>Analytics Data</h3>
            <p>We use Firebase Analytics to understand how the app is used. This includes:</p>
            <ul>
              <li>App opens and screen views</li>
              <li>Feature usage (anonymized)</li>
              <li>Crash reports via Firebase Crashlytics</li>
            </ul>
            <p>You can opt out of analytics in the app settings.</p>

            <h3>Data Processed by Third Parties</h3>
            <p>
              When you use AI-powered features, the following data is sent to our servers
              (which use Google&apos;s Gemini AI):
            </p>
            <ul>
              <li>Images you upload for design generation</li>
              <li>Note text you choose to analyze for label suggestions</li>
            </ul>
            <p>This data is processed in real-time to generate designs and is not permanently stored.</p>
          </section>

          <section className="mb-10">
            <h2>Third-Party Services</h2>
            <p>ToonNotes uses the following third-party services:</p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Purpose</th>
                    <th>Privacy Policy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Google Sign-In</td>
                    <td>Authentication</td>
                    <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></td>
                  </tr>
                  <tr>
                    <td>Apple Sign-In</td>
                    <td>Authentication</td>
                    <td><a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Apple Privacy Policy</a></td>
                  </tr>
                  <tr>
                    <td>Google Gemini AI</td>
                    <td>AI-powered design generation</td>
                    <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></td>
                  </tr>
                  <tr>
                    <td>Supabase</td>
                    <td>Cloud sync and sharing</td>
                    <td><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a></td>
                  </tr>
                  <tr>
                    <td>Firebase</td>
                    <td>Analytics and crash reporting</td>
                    <td><a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Firebase Privacy Policy</a></td>
                  </tr>
                  <tr>
                    <td>RevenueCat</td>
                    <td>In-app purchase management</td>
                    <td><a href="https://www.revenuecat.com/privacy" target="_blank" rel="noopener noreferrer">RevenueCat Privacy Policy</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2>In-App Purchases</h2>
            <p>
              ToonNotes offers in-app purchases for virtual currency (&quot;Coins&quot;). Purchase
              transactions are processed by Apple App Store or Google Play Store. We receive
              confirmation of purchases but do not have access to your payment information.
            </p>
            <p>RevenueCat is used to manage purchase state across devices. They receive:</p>
            <ul>
              <li>Your anonymous user identifier</li>
              <li>Purchase history within the app</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>What We Don&apos;t Do</h2>
            <ul>
              <li>We do not sell your personal data to third parties</li>
              <li>We do not display advertisements</li>
              <li>We do not access your notes without your explicit action (sharing)</li>
              <li>We do not track your location</li>
              <li>We do not access your contacts or other personal data</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>Data Retention</h2>
            <ul>
              <li><strong>Local data:</strong> Remains on your device until you delete the app or clear data</li>
              <li><strong>Account data:</strong> Retained while your account is active; deleted upon request</li>
              <li><strong>Shared notes:</strong> Retained until you delete them or request account deletion</li>
              <li><strong>Analytics data:</strong> Retained according to Firebase&apos;s policies (typically 14 months)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>Your Rights and Choices</h2>
            <p>You can:</p>
            <ul>
              <li><strong>Opt out of analytics:</strong> Toggle off in app settings</li>
              <li><strong>Delete your account:</strong> Contact us to request complete data deletion</li>
              <li><strong>Delete shared notes:</strong> Remove from the app at any time</li>
              <li><strong>Use without an account:</strong> Core note-taking features work offline without sign-in</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>Data Security</h2>
            <p>We implement appropriate security measures including:</p>
            <ul>
              <li>Secure HTTPS connections for all data transfers</li>
              <li>Encrypted storage for sensitive data (API keys, tokens)</li>
              <li>OAuth 2.0 for secure authentication</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>Children&apos;s Privacy</h2>
            <p>
              ToonNotes is not directed at children under 13. We do not knowingly collect
              personal information from children under 13. If you believe we have collected
              data from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2>International Data Transfers</h2>
            <p>
              Your data may be processed in countries other than your own. By using ToonNotes,
              you consent to the transfer of your data to the United States and other countries
              where our service providers operate.
            </p>
          </section>

          <section className="mb-10">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of
              material changes by updating the &quot;Last Updated&quot; date and displaying a notice
              in the app.
            </p>
            <p>
              Continued use of the app after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-10">
            <h2>Contact Us</h2>
            <p>
              If you have questions about this privacy policy or want to exercise your data
              rights, please contact us at:
            </p>
            <p><strong>Email:</strong> <a href="mailto:support@toonnotes.com">support@toonnotes.com</a></p>
          </section>

          <hr className="my-10" />
          <p className="text-warm-500 text-sm italic">
            This privacy policy is effective as of January 4, 2025.
          </p>
        </article>
      </div>
    </div>
  );
}
