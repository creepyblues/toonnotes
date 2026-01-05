import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getReleaseNotes } from '@/lib/marketing/files';
import FileViewer from '@/components/marketing/FileViewer';

interface PageProps {
  params: Promise<{ version: string }>;
}

export default async function ReleaseNotesPage({ params }: PageProps) {
  const { version } = await params;
  const notes = await getReleaseNotes(version);

  if (!notes) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm">
        <Link href="/marketing/products" className="text-gray-500 hover:text-gray-700">
          Products
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">{version}</span>
      </nav>

      <FileViewer content={notes.content} type="markdown" title={`${version} Release Notes`} />
    </div>
  );
}
