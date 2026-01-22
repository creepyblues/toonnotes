import { MarketingHeader } from '@/components/marketing';

export const metadata = {
  title: 'Scenarios | ToonNotes',
  description: 'See how ToonNotes AI agents transform the way you use your notes',
};

export default function ScenariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <MarketingHeader variant="solid" />

      {/* Content with top padding for fixed header */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}
