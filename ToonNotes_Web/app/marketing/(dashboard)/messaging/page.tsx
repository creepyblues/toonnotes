import { getMessaging } from '@/lib/marketing/files';
import FileViewer from '@/components/marketing/FileViewer';

export default async function MessagingPage() {
  const messaging = await getMessaging();

  if (!messaging) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Messaging Framework</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
          messaging.md not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Messaging Framework</h1>
      <FileViewer content={messaging} type="markdown" />
    </div>
  );
}
