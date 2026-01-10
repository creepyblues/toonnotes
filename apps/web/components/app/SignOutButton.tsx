'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    const supabase = createClient();

    await supabase.auth.signOut();
    router.push('/app/auth/login');
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="w-full px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors disabled:opacity-50"
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
