import Link from 'next/link';
import { getProductManifest, listPlatforms, listReleases } from '@/lib/marketing/files';
import FileViewer from '@/components/marketing/FileViewer';
import yaml from 'js-yaml';

interface ProductManifest {
  last_synced: string;
  products: {
    ios: { name: string; current_version: string; build_number: string; status: string };
    android: { name: string; current_version: string; version_code: number; status: string };
    web: { name: string; current_version: string; status: string };
  };
  aliases: Record<string, string>;
  upcoming: Array<{ version: string; codename: string; target_date: string }>;
}

export default async function ProductsPage() {
  const [manifestContent, platforms, releases] = await Promise.all([
    getProductManifest(),
    listPlatforms(),
    listReleases(),
  ]);

  let manifest: ProductManifest | null = null;
  if (manifestContent) {
    try {
      manifest = yaml.load(manifestContent) as ProductManifest;
    } catch {
      // Invalid YAML
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-1">
          Version tracking and release history
        </p>
      </div>

      {/* Version Overview Cards */}
      {manifest && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* iOS */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">iOS</h3>
                  <p className="text-sm text-gray-500">App Store</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                manifest.products.ios.status === 'live'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {manifest.products.ios.status}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              v{manifest.products.ios.current_version}
            </div>
            <div className="text-sm text-gray-500">
              Build {manifest.products.ios.build_number}
            </div>
          </div>

          {/* Android */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.523 15.341c.734 0 1.329-.595 1.329-1.329v-5.398h.732c.404 0 .731-.327.731-.731v-1.062c0-.404-.327-.731-.731-.731h-2.792l.671-2.013c.134-.402-.087-.838-.489-.972-.402-.134-.838.087-.972.489l-.731 2.496h-6.542l-.731-2.496c-.134-.402-.57-.623-.972-.489-.402.134-.623.57-.489.972l.671 2.013h-2.792c-.404 0-.731.327-.731.731v1.062c0 .404.327.731.731.731h.732v5.398c0 .734.595 1.329 1.329 1.329h.731v2.66c0 .734.595 1.329 1.329 1.329h.731c.734 0 1.329-.595 1.329-1.329v-2.66h2.66v2.66c0 .734.595 1.329 1.329 1.329h.731c.734 0 1.329-.595 1.329-1.329v-2.66h.731z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Android</h3>
                  <p className="text-sm text-gray-500">Google Play</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                manifest.products.android.status === 'live'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {manifest.products.android.status}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              v{manifest.products.android.current_version}
            </div>
            <div className="text-sm text-gray-500">
              Version Code {manifest.products.android.version_code}
            </div>
          </div>

          {/* Web */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Web</h3>
                  <p className="text-sm text-gray-500">toonnotes.com</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                {manifest.products.web.status}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              v{manifest.products.web.current_version}
            </div>
            <div className="text-sm text-gray-500">
              Marketing Site
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Releases */}
      {manifest?.upcoming && manifest.upcoming.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Releases</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {manifest.upcoming.map((release) => (
              <div key={release.version} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">v{release.version}</div>
                  <div className="text-sm text-gray-500">{release.codename}</div>
                </div>
                <div className="text-sm text-gray-500">{release.target_date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Release History */}
      {releases.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Release History</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {releases.map((release) => (
              <Link
                key={release.name}
                href={`/marketing/products/${release.name}`}
                className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-teal-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-gray-900">{release.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Full Manifest */}
      {manifestContent && (
        <FileViewer content={manifestContent} type="yaml" title="manifest.yaml" />
      )}

      {/* Sync Info */}
      {manifest && (
        <div className="text-center text-sm text-gray-500">
          Last synced: {new Date(manifest.last_synced).toLocaleString()}
          <span className="mx-2">|</span>
          Run <code className="bg-gray-100 px-1 rounded">/sync-versions</code> to update
        </div>
      )}
    </div>
  );
}
