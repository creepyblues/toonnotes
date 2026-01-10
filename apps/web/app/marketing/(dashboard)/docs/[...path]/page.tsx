import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDocFile } from '@/lib/marketing/files';
import FileViewer from '@/components/marketing/FileViewer';

interface PageProps {
  params: Promise<{ path: string[] }>;
}

export default async function DocFilePage({ params }: PageProps) {
  const { path: pathSegments } = await params;
  const filePath = pathSegments.join('/');

  const doc = await getDocFile(filePath);

  if (!doc) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm flex-wrap">
        <Link href="/marketing/docs" className="text-gray-500 hover:text-gray-700">
          Docs
        </Link>
        {pathSegments.length > 1 && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">{pathSegments.slice(0, -1).join('/')}</span>
          </>
        )}
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">{doc.name}</span>
      </nav>

      <FileViewer content={doc.content} type="markdown" title={doc.name} />
    </div>
  );
}
