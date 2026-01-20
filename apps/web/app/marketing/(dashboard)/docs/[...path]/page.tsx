import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDocFile, getDocMetadata, listDocFilesWithMetadata, getCategoryInfo } from '@/lib/marketing/files';
import FileViewer from '@/components/marketing/FileViewer';
import { Clock, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ path: string[] }>;
}

export default async function DocFilePage({ params }: PageProps) {
  const { path: pathSegments } = await params;
  const filePath = pathSegments.join('/');

  const [doc, metadata, allDocs] = await Promise.all([
    getDocFile(filePath),
    getDocMetadata(filePath),
    listDocFilesWithMetadata(),
  ]);

  if (!doc) {
    notFound();
  }

  // Get category info for badge
  const categoryInfo = metadata ? getCategoryInfo(metadata.category) : null;

  // Find prev/next docs in the same category
  let prevDoc = null;
  let nextDoc = null;

  if (metadata) {
    const sameCategoryDocs = allDocs
      .filter((d) => d.category === metadata.category)
      .sort((a, b) => a.name.localeCompare(b.name));

    const currentIndex = sameCategoryDocs.findIndex((d) => d.path === filePath);

    if (currentIndex > 0) {
      prevDoc = sameCategoryDocs[currentIndex - 1];
    }
    if (currentIndex < sameCategoryDocs.length - 1) {
      nextDoc = sameCategoryDocs[currentIndex + 1];
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm flex-wrap">
        <Link
          href="/marketing/docs"
          className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Docs
        </Link>
        {pathSegments.length > 1 && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">{pathSegments.slice(0, -1).join('/')}</span>
          </>
        )}
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{metadata?.title || doc.name}</span>
      </nav>

      {/* Metadata bar */}
      {metadata && (
        <div className="flex items-center gap-4 flex-wrap">
          {categoryInfo && (
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full border ${categoryInfo.colorClass}`}
            >
              {categoryInfo.label}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            {metadata.readingTime} min read
          </span>
          {metadata.lastModified && (
            <span className="text-sm text-gray-500">
              Last updated{' '}
              {metadata.lastModified.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <FileViewer content={doc.content} type="markdown" title={metadata?.title || doc.name} />

      {/* Prev/Next navigation */}
      {(prevDoc || nextDoc) && (
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="grid grid-cols-2 gap-4">
            {/* Previous */}
            <div>
              {prevDoc && (
                <Link
                  href={`/marketing/docs/${prevDoc.path}`}
                  className="group flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Previous</span>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {prevDoc.title}
                    </p>
                  </div>
                </Link>
              )}
            </div>

            {/* Next */}
            <div className="flex justify-end">
              {nextDoc && (
                <Link
                  href={`/marketing/docs/${nextDoc.path}`}
                  className="group flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-right"
                >
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Next</span>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {nextDoc.title}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 mt-0.5 shrink-0" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
