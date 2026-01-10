import Link from 'next/link';
import { listDocFiles } from '@/lib/marketing/files';

export default async function DocsIndexPage() {
  const docs = await listDocFiles();

  // Group by folder
  const rootDocs = docs.filter((d) => !d.path.includes('/'));
  const folderDocs = docs.filter((d) => d.path.includes('/'));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
        <p className="text-gray-600 mt-1">
          Reference documentation from ToonNotes_Expo
        </p>
      </div>

      {/* Root level docs */}
      {rootDocs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Root</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {rootDocs.map((doc) => (
              <Link
                key={doc.path}
                href={`/marketing/docs/${doc.path}`}
                className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-blue-500 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-gray-900">{doc.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Docs folder */}
      {folderDocs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">docs/</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {folderDocs.map((doc) => (
              <Link
                key={doc.path}
                href={`/marketing/docs/${doc.path}`}
                className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-blue-500 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-gray-900">{doc.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {docs.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No documentation files found.</p>
        </div>
      )}
    </div>
  );
}
