import { Hero, PainPoints, TwoPillars, Features, FinalCTA } from '@/components/marketing';

export const dynamic = 'force-static';

export default function HomePage() {
  const appStoreUrl = process.env.NEXT_PUBLIC_APP_STORE_URL || '#';
  const playStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL || '#';

  return (
    <>
      <Hero appStoreUrl={appStoreUrl} playStoreUrl={playStoreUrl} />
      <PainPoints />
      <TwoPillars />
      <Features />
      <FinalCTA appStoreUrl={appStoreUrl} playStoreUrl={playStoreUrl} />
    </>
  );
}
