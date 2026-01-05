import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminNav from '@/components/marketing/AdminNav';
import AdminHeader from '@/components/marketing/AdminHeader';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to login (middleware should catch this, but double-check)
  if (!user) {
    redirect('/marketing/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminNav />
      <div className="flex-1 flex flex-col">
        <AdminHeader userEmail={user.email || 'Admin'} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
