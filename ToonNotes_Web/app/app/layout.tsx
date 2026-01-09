import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/app';

export default async function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user avatar from metadata if available
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userEmail = user?.email;

  return (
    <AppLayout userEmail={userEmail} userAvatar={userAvatar}>
      {children}
    </AppLayout>
  );
}
