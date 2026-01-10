import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { StoreProvider } from '@/components/providers';
import { Note, Label, NoteDesign, NoteColor } from '@toonnotes/types';

interface DbNote {
  id: string;
  title: string;
  content: string;
  labels: string[];
  color: string;
  design_id?: string;
  active_design_label_id?: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

interface DbLabel {
  id: string;
  name: string;
  preset_id?: string;
  custom_design_id?: string;
  is_system_label?: boolean;
  created_at: string;
  last_used_at?: string;
}

interface DbDesign {
  id: string;
  name: string;
  source_image_uri: string;
  created_at: string;
  background: NoteDesign['background'];
  colors: NoteDesign['colors'];
  typography: NoteDesign['typography'];
  sticker: NoteDesign['sticker'];
  design_summary: string;
  vibe?: NoteDesign['vibe'];
  is_lucky?: boolean;
  label_preset_id?: string;
  is_label_preset?: boolean;
}

// Convert database note to app Note type
function dbNoteToNote(dbNote: DbNote): Note {
  return {
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content,
    labels: dbNote.labels || [],
    color: (dbNote.color as NoteColor) || NoteColor.White,
    designId: dbNote.design_id,
    activeDesignLabelId: dbNote.active_design_label_id,
    isPinned: dbNote.is_pinned,
    isArchived: dbNote.is_archived,
    isDeleted: dbNote.is_deleted,
    deletedAt: dbNote.deleted_at ? new Date(dbNote.deleted_at).getTime() : undefined,
    createdAt: new Date(dbNote.created_at).getTime(),
    updatedAt: new Date(dbNote.updated_at).getTime(),
  };
}

// Convert database label to app Label type
function dbLabelToLabel(dbLabel: DbLabel): Label {
  return {
    id: dbLabel.id,
    name: dbLabel.name,
    presetId: dbLabel.preset_id,
    customDesignId: dbLabel.custom_design_id,
    isSystemLabel: dbLabel.is_system_label,
    createdAt: new Date(dbLabel.created_at).getTime(),
    lastUsedAt: dbLabel.last_used_at ? new Date(dbLabel.last_used_at).getTime() : undefined,
  };
}

// Convert database design to app NoteDesign type
function dbDesignToDesign(dbDesign: DbDesign): NoteDesign {
  return {
    id: dbDesign.id,
    name: dbDesign.name,
    sourceImageUri: dbDesign.source_image_uri,
    createdAt: new Date(dbDesign.created_at).getTime(),
    background: dbDesign.background,
    colors: dbDesign.colors,
    typography: dbDesign.typography,
    sticker: dbDesign.sticker,
    designSummary: dbDesign.design_summary,
    vibe: dbDesign.vibe,
    isLucky: dbDesign.is_lucky,
    labelPresetId: dbDesign.label_preset_id,
    isLabelPreset: dbDesign.is_label_preset,
  };
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all user data in parallel
  console.log('[MainLayout] Fetching data for user:', user.id);

  const [notesResult, labelsResult, designsResult] = await Promise.all([
    supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('labels')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true }),
    supabase
      .from('designs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  // Log any errors
  if (notesResult.error) console.error('[MainLayout] Notes fetch error:', notesResult.error);
  if (labelsResult.error) console.error('[MainLayout] Labels fetch error:', labelsResult.error);
  if (designsResult.error) console.error('[MainLayout] Designs fetch error:', designsResult.error);

  // Convert to app types
  const notes: Note[] = (notesResult.data as DbNote[] | null)?.map(dbNoteToNote) || [];
  const labels: Label[] = (labelsResult.data as DbLabel[] | null)?.map(dbLabelToLabel) || [];
  const designs: NoteDesign[] = (designsResult.data as DbDesign[] | null)?.map(dbDesignToDesign) || [];

  console.log('[MainLayout] Fetched:', { notes: notes.length, labels: labels.length, designs: designs.length });

  return (
    <StoreProvider initialNotes={notes} initialLabels={labels} initialDesigns={designs}>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
}
