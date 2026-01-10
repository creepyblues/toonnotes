import Link from 'next/link';
import { listCampaigns } from '@/lib/marketing/files';

export default async function MarketingDashboard() {
  const activeCampaigns = await listCampaigns('active');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{activeCampaigns.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Copy Library</p>
              <p className="text-2xl font-bold text-gray-900">View</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Messaging</p>
              <p className="text-2xl font-bold text-gray-900">View</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Active Campaigns</h2>
          <Link
            href="/marketing/campaigns"
            className="text-sm text-teal-600 hover:text-teal-700"
          >
            View all
          </Link>
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
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/marketing/messaging"
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
            Messaging Framework
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Brand positioning, voice, tone, and key messages
          </p>
        </Link>

        <Link
          href="/marketing/copy"
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
            Copy Library
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            App Store copy, social templates, and more
          </p>
        </Link>
      </div>
    </div>
  );
}
