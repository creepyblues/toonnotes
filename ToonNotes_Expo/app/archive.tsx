import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Archive } from 'lucide-react-native';

import { useNoteStore, useUserStore } from '@/stores';
import { NoteCard } from '@/components/notes/NoteCard';
import { Note } from '@/types';

export default function ArchiveScreen() {
  const router = useRouter();
  const { getArchivedNotes, unarchiveNote } = useNoteStore();
  const { settings } = useUserStore();
  const isDark = settings.darkMode;

  const archivedNotes = getArchivedNotes();

  const handleNotePress = (note: Note) => {
    router.push(`/note/${note.id}`);
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Archive size={48} color="#9CA3AF" />
      <Text
        className="text-xl font-semibold mb-2 mt-4"
        style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
      >
        No archived notes
      </Text>
      <Text
        className="text-center px-8"
        style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
      >
        Notes you archive will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? '#121212' : '#FFFFFF' }}
      edges={['top']}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-2 py-2 border-b"
        style={{
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          borderBottomColor: isDark ? '#2D2D2D' : '#F3F4F6'
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#1F2937'} />
        </TouchableOpacity>
        <Text
          className="text-lg font-semibold ml-2"
          style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
        >
          Archive
        </Text>
      </View>

      {/* Note Grid */}
      {archivedNotes.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={archivedNotes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 12 }}
          columnWrapperStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <View className="flex-1 mb-2">
              <NoteCard note={item} onPress={() => handleNotePress(item)} isDark={isDark} />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
