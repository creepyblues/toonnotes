import Link from 'next/link';
import { listDocFilesWithMetadata, DOC_CATEGORIES, getCategoryInfo } from '@/lib/marketing/files';
import type { DocCategory, DocWithMetadata, CategoryInfo } from '@/lib/marketing/types';
import { Scale, Lightbulb, Code, BarChart3, CheckCircle, Clock, FileText } from 'lucide-react';

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale,
  Lightbulb,
  Code,
  BarChart3,
  CheckCircle,
};

function CategoryIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = iconMap[iconName] || FileText;
  return <Icon className={className} />;
}

function DocCard({ doc }: { doc: DocWithMetadata }) {
  const categoryInfo = getCategoryInfo(doc.category);

  return (
    <Link
      href={`/marketing/docs/${doc.path}`}
      className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {doc.title}
        </h3>
        <span
          className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full border ${categoryInfo.colorClass}`}
        >
          {categoryInfo.label}
        </span>
      </div>

      {doc.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {doc.readingTime} min read
        </span>
        {doc.lastModified && (
          <span>
            Updated {doc.lastModified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </Link>
  );
}

function CategorySection({
  category,
  docs,
}: {
  category: CategoryInfo;
  docs: DocWithMetadata[];
}) {
  if (docs.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${category.colorClass.split(' ').slice(0, 1).join(' ')}`}
        >
          <CategoryIcon iconName={category.icon} className={`w-5 h-5 ${category.colorClass.split(' ')[1]}`} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {category.label}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({docs.length} {docs.length === 1 ? 'doc' : 'docs'})
            </span>
          </h2>
          <p className="text-sm text-gray-600">{category.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <DocCard key={doc.path} doc={doc} />
        ))}
      </div>
    </section>
  );
}

export default async function DocsIndexPage() {
  const allDocs = await listDocFilesWithMetadata();

  // Group docs by category
  const docsByCategory = DOC_CATEGORIES.reduce(
    (acc, category) => {
      acc[category.id] = allDocs.filter((doc) => doc.category === category.id);
      return acc;
    },
    {} as Record<DocCategory, DocWithMetadata[]>
  );

  const totalDocs = allDocs.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
        <p className="text-gray-600 mt-2">
          Reference documentation from the ToonNotes Expo app.{' '}
          <span className="text-gray-500">
            {totalDocs} documents across {DOC_CATEGORIES.length} categories.
          </span>
        </p>
      </div>

      {/* Category sections */}
      <div className="space-y-10">
        {DOC_CATEGORIES.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            docs={docsByCategory[category.id]}
          />
        ))}
      </div>

      {/* Empty state */}
      {totalDocs === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documentation found</h3>
          <p className="text-gray-500">
            Documentation files will appear here once they are added to the docs folder.
          </p>
        </div>
      )}
    </div>
  );
}
