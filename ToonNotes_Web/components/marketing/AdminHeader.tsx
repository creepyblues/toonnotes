'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  userEmail: string;
}

export default function AdminHeader({ userEmail }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/marketing/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-900">Marketing Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">{userEmail}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
