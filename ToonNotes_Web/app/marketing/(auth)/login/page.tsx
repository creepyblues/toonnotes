'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'unauthorized') {
      setMessage('You are not authorized to access the marketing dashboard.');
    } else if (error === 'invalid_credentials') {
      setMessage('Invalid email or password.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage('Invalid email or password.');
      setLoading(false);
      return;
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', data.user.id)
      .single();

    if (!adminCheck) {
      await supabase.auth.signOut();
      setMessage('You are not authorized to access the marketing dashboard.');
      setLoading(false);
      return;
    }

    // Success - redirect to dashboard
    router.push('/marketing');
  };

  return (
    <form onSubmit={handleLogin} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Email address"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Password"
          disabled={loading}
        />
      </div>

      {message && (
        <div className="text-sm text-center p-3 rounded-lg bg-red-50 text-red-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

export default function MarketingLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Marketing Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your admin credentials
          </p>
        </div>

        <Suspense fallback={<div className="mt-8 text-center text-gray-500">Loading...</div>}>
          <LoginForm />
        </Suspense>

        <div className="text-center text-xs text-gray-400">
          <p>Admin access only.</p>
        </div>
      </div>
    </div>
  );
}
