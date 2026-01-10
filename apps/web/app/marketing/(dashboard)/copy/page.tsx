import Link from 'next/link';
import { listCopyFiles } from '@/lib/marketing/files';

export default async function CopyLibraryPage() {
  const files = await listCopyFiles();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Copy Library</h1>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Browse Files</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {files.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No files found in copy directory
            </div>
          ) : (
            files.map((file) => (
              <Link
                key={file.path}
                href={`/marketing/copy/${file.path}`}
                className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {file.type === 'directory' ? (
                  <svg className="w-5 h-5 text-amber-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                <span className="text-gray-900">{file.name}</span>
                {file.extension && (
                  <span className="ml-2 text-xs text-gray-400">.{file.extension}</span>
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
