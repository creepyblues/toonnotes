'use client';

import { Palette } from '@phosphor-icons/react';
import { useDesignStore } from '@/stores';
import { DesignCard } from './DesignCard';

export function DesignGallery() {
  const getUserDesigns = useDesignStore((state) => state.getUserDesigns);
  const deleteDesign = useDesignStore((state) => state.deleteDesign);

  const designs = getUserDesigns();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this design?')) {
      deleteDesign(id);
    }
  };

  if (designs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Palette size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          No designs yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Create custom designs with AI by uploading an image. Your designs will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {designs.map((design) => (
        <DesignCard
          key={design.id}
          design={design}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
