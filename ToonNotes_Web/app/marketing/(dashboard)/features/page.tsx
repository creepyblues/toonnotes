import Link from 'next/link';
import { getFeatureIndex, listFeatures } from '@/lib/marketing/files';
import FileViewer from '@/components/marketing/FileViewer';
import yaml from 'js-yaml';

interface FeatureEntry {
  name: string;
  slug: string;
  category: string;
  introduced: string;
  platforms: string[];
  tier: string;
  limits?: { free: string; pro: string };
  marketing_hook?: string;
}

interface FeatureIndex {
  features: Record<string, FeatureEntry>;
  version_features: Record<string, string[]>;
  categories: Record<string, string>;
}

export default async function FeaturesPage() {
  const [indexContent, featureFiles] = await Promise.all([
    getFeatureIndex(),
    listFeatures(),
  ]);

  let featureIndex: FeatureIndex | null = null;
  if (indexContent) {
    try {
      featureIndex = yaml.load(indexContent) as FeatureIndex;
    } catch {
      // Invalid YAML
    }
  }

  // Group features by category
  const featuresByCategory: Record<string, FeatureEntry[]> = {};
  if (featureIndex) {
    Object.values(featureIndex.features).forEach((feature) => {
      if (!featuresByCategory[feature.category]) {
        featuresByCategory[feature.category] = [];
      }
      featuresByCategory[feature.category].push(feature);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Features</h1>
        <p className="text-gray-600 mt-1">
          Feature registry with version mapping
        </p>
      </div>

      {/* Feature Cards by Category */}
      {featureIndex && Object.entries(featuresByCategory).map(([category, features]) => (
        <div key={category} className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {featureIndex.categories[category] || category}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {features.map((feature) => (
              <div key={feature.slug} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">{feature.name}</h3>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        feature.tier === 'free'
                          ? 'bg-green-100 text-green-700'
                          : feature.tier === 'pro'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {feature.tier}
                      </span>
                    </div>
                    {feature.marketing_hook && (
                      <p className="text-sm text-gray-600 mt-1">{feature.marketing_hook}</p>
                    )}
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                      <span>v{feature.introduced}</span>
                      <span className="flex items-center">
                        {feature.platforms.map((p) => (
                          <span key={p} className="mr-1 px-1.5 py-0.5 bg-gray-100 rounded">
                            {p}
                          </span>
                        ))}
                      </span>
                    </div>
                    {feature.limits && (
                      <div className="mt-2 text-xs">
                        <span className="text-gray-500">Free:</span>{' '}
                        <span className="text-gray-700">{feature.limits.free}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-purple-500">Pro:</span>{' '}
                        <span className="text-gray-700">{feature.limits.pro}</span>
                      </div>
                    )}
                  </div>
                  {featureFiles.some((f) => f.name === feature.slug) && (
                    <Link
                      href={`/marketing/features/${feature.slug}`}
                      className="text-teal-600 hover:text-teal-700 text-sm"
                    >
                      Details
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Version → Features Mapping */}
      {featureIndex?.version_features && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Version → Features</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Features Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(featureIndex.version_features)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([version, features]) => (
                    <tr key={version}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">v{version}</td>
                      <td className="px-6 py-4">
                        {features.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {features.map((f) => (
                              <span key={f} className="px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded">
                                {f}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Bug fixes only</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Index */}
      {indexContent && (
        <FileViewer content={indexContent} type="yaml" title="_index.yaml" />
      )}
    </div>
  );
}
