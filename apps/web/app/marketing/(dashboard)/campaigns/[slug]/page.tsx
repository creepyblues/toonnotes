import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCampaign, listCampaignScenarios, getScenarioFile } from '@/lib/marketing/files';
import FileViewer from '@/components/marketing/FileViewer';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; tab?: string }>;
}

export default async function CampaignDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { status = 'active', tab = 'campaign' } = await searchParams;
  const campaignStatus = status as 'active' | 'archive';

  const campaign = await getCampaign(slug, campaignStatus);

  if (!campaign) {
    notFound();
  }

  // Load scenarios if this is the MODE campaign
  const scenarios = slug === 'v2-mode-launch' ? await listCampaignScenarios(slug) : [];

  // Define available tabs
  const tabs = [
    { id: 'campaign', label: 'Campaign Config', available: true },
    { id: 'copy', label: 'Copy', available: !!campaign.copy },
    { id: 'schedule', label: 'Schedule', available: !!campaign.schedule },
    { id: 'scenarios', label: 'Scenarios', available: scenarios.length > 0 },
  ].filter((t) => t.available);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm">
        <Link href="/marketing/campaigns" className="text-gray-500 hover:text-gray-700">
          Campaigns
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">{slug}</span>
      </nav>

      {/* Campaign Header */}
      {slug === 'v2-mode-launch' && (
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🎯</span>
            <h1 className="text-2xl font-bold">MODE Framework Launch</h1>
          </div>
          <p className="text-teal-100">
            ToonNotes v2.0 - Four AI agents that understand WHY you take notes.
          </p>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
              <span className="text-blue-100">M</span>anage
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
              <span className="text-green-100">O</span>rganize
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
              <span className="text-amber-100">D</span>evelop
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
              <span className="text-purple-100">E</span>xperience
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/marketing/campaigns/${slug}?status=${status}&tab=${t.id}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'campaign' && (
        <div>
          <FileViewer content={campaign.yaml} type="yaml" title="campaign.yaml" />
        </div>
      )}

      {tab === 'copy' && campaign.copy && (
        <div>
          <FileViewer content={campaign.copy} type="markdown" title="copy.md" />
        </div>
      )}

      {tab === 'schedule' && campaign.schedule && (
        <div>
          <FileViewer content={campaign.schedule} type="yaml" title="schedule.yaml" />
        </div>
      )}

      {tab === 'scenarios' && scenarios.length > 0 && (
        <ScenariosTab scenarios={scenarios} />
      )}
    </div>
  );
}

async function ScenariosTab({ scenarios }: { scenarios: { name: string; path: string }[] }) {
  // Load all scenario content
  const scenarioContents = await Promise.all(
    scenarios.map(async (s) => {
      const file = await getScenarioFile(s.path);
      return {
        ...s,
        content: file?.content || '',
      };
    })
  );

  const modeColors: Record<string, { bg: string; text: string; border: string }> = {
    manage: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    develop: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    organize: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    experience: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {scenarioContents.map((scenario) => {
          // Extract mode from filename
          const modeMatch = scenario.path.match(/scenario-(\w+)-/);
          const mode = modeMatch?.[1] || 'manage';
          const colors = modeColors[mode] || modeColors.manage;

          // Extract title from content
          const titleMatch = scenario.content.match(/^#\s+(.+)$/m);
          const title = titleMatch?.[1] || scenario.name;

          // Extract pain point
          const painMatch = scenario.content.match(/>\s*"([^"]+)"/);
          const pain = painMatch?.[1] || '';

          return (
            <div
              key={scenario.path}
              className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-5`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white ${colors.text} font-bold text-sm`}
                >
                  {mode[0].toUpperCase()}
                </span>
                <span className={`text-xs font-medium ${colors.text} uppercase tracking-wide`}>
                  {mode} Mode
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              {pain && <p className="text-sm text-gray-600 italic">&ldquo;{pain}&rdquo;</p>}
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  View full script
                </summary>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <FileViewer content={scenario.content} type="markdown" title={scenario.path} />
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
