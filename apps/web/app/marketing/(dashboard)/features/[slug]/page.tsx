import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFeatureFile } from '@/lib/marketing/files';
import FileViewer from '@/components/marketing/FileViewer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FeatureDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const feature = await getFeatureFile(slug);

  if (!feature) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm">
        <Link href="/marketing/features" className="text-gray-500 hover:text-gray-700">
          Features
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">{slug}</span>
      </nav>

      <FileViewer content={feature.content} type="yaml" title={feature.name} />
    </div>
  );
}
