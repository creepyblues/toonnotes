'use client';

import { useEffect, useRef } from 'react';
import { useNoteStore, useDesignStore } from '@/stores';
import { useSupabaseSync } from '@/lib/hooks/useSupabaseSync';
import { Note, NoteDesign, Label } from '@toonnotes/types';

interface StoreProviderProps {
  children: React.ReactNode;
  initialNotes?: Note[];
  initialLabels?: Label[];
  initialDesigns?: NoteDesign[];
}

export function StoreProvider({
  children,
  initialNotes = [],
  initialLabels = [],
  initialDesigns = [],
}: StoreProviderProps) {
  const initialized = useRef(false);

  // Enable Supabase sync
  useSupabaseSync();

  // Log what we received from server
  console.log('[StoreProvider] Received from server:', {
    notes: initialNotes.length,
    labels: initialLabels.length,
    designs: initialDesigns.length,
  });

  useEffect(() => {
    // Only hydrate once on mount
    if (!initialized.current) {
      initialized.current = true;

      console.log('[StoreProvider] Hydrating stores...');

      // Hydrate note store - always set, even if empty (to sync with server state)
      useNoteStore.getState().setNotes(initialNotes);
      console.log('[StoreProvider] Notes hydrated:', initialNotes.length);

      useNoteStore.getState().setLabels(initialLabels);
      console.log('[StoreProvider] Labels hydrated:', initialLabels.length);

      // Hydrate design store
      useDesignStore.getState().setDesigns(initialDesigns);
      console.log('[StoreProvider] Designs hydrated:', initialDesigns.length);
    }
  }, [initialNotes, initialLabels, initialDesigns]);

  return <>{children}</>;
}
