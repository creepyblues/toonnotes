import Link from 'next/link';
import { listCampaigns } from '@/lib/marketing/files';

export default async function CampaignsPage() {
  const activeCampaigns = await listCampaigns('active');
  const archivedCampaigns = await listCampaigns('archive');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>

      {/* Active Campaigns */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {activeCampaigns.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No active campaigns
            </div>
          ) : (
            activeCampaigns.map((campaign) => (
              <Link
                key={campaign.slug}
                href={`/marketing/campaigns/${campaign.slug}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">
                      {campaign.type} &middot; {campaign.status}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Archived Campaigns */}
      {archivedCampaigns.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Archived</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {archivedCampaigns.map((campaign) => (
              <Link
                key={campaign.slug}
                href={`/marketing/campaigns/${campaign.slug}?status=archive`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">
                      {campaign.type} &middot; {campaign.status}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Archived
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
