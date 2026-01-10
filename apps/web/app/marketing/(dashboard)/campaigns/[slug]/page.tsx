import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCampaign } from '@/lib/marketing/files';
import FileViewer from '@/components/marketing/FileViewer';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function CampaignDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { status = 'active' } = await searchParams;
  const campaignStatus = status as 'active' | 'archive';

  const campaign = await getCampaign(slug, campaignStatus);

  if (!campaign) {
    notFound();
  }

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

      {/* Tabs for YAML and Copy */}
      <div className="flex space-x-4 border-b border-gray-200">
        <a
          href="#campaign"
          className="pb-2 px-1 border-b-2 border-teal-500 text-teal-600 text-sm font-medium"
        >
          Campaign Config
        </a>
        {campaign.copy && (
          <a
            href="#copy"
            className="pb-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Copy
          </a>
        )}
      </div>

      {/* Campaign YAML */}
      <div id="campaign">
        <FileViewer content={campaign.yaml} type="yaml" title="campaign.yaml" />
      </div>

      {/* Campaign Copy */}
      {campaign.copy && (
        <div id="copy">
          <FileViewer content={campaign.copy} type="markdown" title="copy.md" />
        </div>
      )}
    </div>
  );
}
