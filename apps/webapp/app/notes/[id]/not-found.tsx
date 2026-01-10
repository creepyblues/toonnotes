import Link from 'next/link';

export default function NoteNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Note Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          This note doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Notes
        </Link>
      </div>
    </div>
  );
}
