import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/marketing/DashboardLayout';

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
    <DashboardLayout userEmail={user.email || 'Admin'}>
      {children}
    </DashboardLayout>
  );
}
