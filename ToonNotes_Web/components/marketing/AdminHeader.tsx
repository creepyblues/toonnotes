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
    <header className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-4">
        <h1 className="hidden md:block text-lg font-semibold text-gray-900">Marketing Dashboard</h1>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <span className="text-xs md:text-sm text-gray-600 truncate max-w-[120px] md:max-w-none">{userEmail}</span>
        <button
          onClick={handleLogout}
          className="text-xs md:text-sm text-gray-500 hover:text-gray-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
