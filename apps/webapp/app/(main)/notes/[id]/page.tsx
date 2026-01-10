'use client';

import { use } from 'react';
import { NoteEditor } from '@/components/editor';

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default function NotePage({ params }: NotePageProps) {
  const { id } = use(params);

  return <NoteEditor noteId={id} />;
}
