import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/app/SignOutButton';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/app/auth/login');
  }

  const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-warm-900 mb-8">Settings</h1>

      {/* Account section */}
      <section className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-warm-200">
          <h2 className="text-lg font-semibold text-warm-900">Account</h2>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center overflow-hidden">
              {userAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-warm-900">{user.email}</p>
              <p className="text-sm text-warm-500">
                Signed in with {user.app_metadata?.provider || 'email'}
              </p>
            </div>
          </div>

          <SignOutButton />
        </div>
      </section>

      {/* About section */}
      <section className="mt-6 bg-white rounded-2xl border border-warm-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-warm-200">
          <h2 className="text-lg font-semibold text-warm-900">About</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-warm-600">Version</span>
            <span className="text-warm-900">Web 1.0.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-warm-600">Platform</span>
            <span className="text-warm-900">Web App</span>
          </div>
        </div>
      </section>

      {/* Info section */}
      <section className="mt-6 bg-warm-50 rounded-2xl border border-warm-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-warm-900">Web App (Read-Only)</h3>
            <p className="text-warm-600 text-sm mt-1">
              The web app currently provides read-only access to your notes.
              To create or edit notes, use the ToonNotes mobile app.
              Full editing capabilities are coming soon.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
