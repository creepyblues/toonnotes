'use client';

import { TopBar } from '@/components/layout';
import { DesignGallery } from '@/components/designs';

export default function DesignsPage() {
  return (
    <>
      <TopBar
        title="Designs"
        showViewToggle={false}
        showNewButton={false}
        showSearch={false}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <DesignGallery />
      </div>
    </>
  );
}
