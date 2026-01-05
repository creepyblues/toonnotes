import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listCopyFiles, getCopyFile } from '@/lib/marketing/files';
import FileViewer from '@/components/marketing/FileViewer';

interface PageProps {
  params: Promise<{ path: string[] }>;
}

export default async function CopyFilePage({ params }: PageProps) {
  const { path: pathSegments } = await params;
  const filePath = pathSegments.join('/');

  // First try to get as a file
  const file = await getCopyFile(filePath);

  if (file) {
    // It's a file - render it
    const breadcrumbs = pathSegments.slice(0, -1);

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm flex-wrap">
          <Link href="/marketing/copy" className="text-gray-500 hover:text-gray-700">
            Copy Library
          </Link>
          {breadcrumbs.map((segment, index) => (
            <span key={index} className="flex items-center space-x-2">
              <span className="text-gray-400">/</span>
              <Link
                href={`/marketing/copy/${breadcrumbs.slice(0, index + 1).join('/')}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {segment}
              </Link>
            </span>
          ))}
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{file.name}</span>
        </nav>

        <FileViewer
          content={file.content}
          type={file.type}
          title={file.name}
        />
      </div>
    );
  }

  // Not a file - try as directory
  const files = await listCopyFiles(filePath);

  if (files.length === 0) {
    notFound();
  }

  // It's a directory - show file list
  const breadcrumbs = pathSegments;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm flex-wrap">
        <Link href="/marketing/copy" className="text-gray-500 hover:text-gray-700">
          Copy Library
        </Link>
        {breadcrumbs.map((segment, index) => (
          <span key={index} className="flex items-center space-x-2">
            <span className="text-gray-400">/</span>
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900">{segment}</span>
            ) : (
              <Link
                href={`/marketing/copy/${breadcrumbs.slice(0, index + 1).join('/')}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {segment}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {pathSegments[pathSegments.length - 1]}
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {files.map((file) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
