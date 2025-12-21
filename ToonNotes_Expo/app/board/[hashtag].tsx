import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Hash } from 'lucide-react-native';

import { useNoteStore, useUserStore, useDesignStore } from '@/stores';
import { NoteCard } from '@/components/notes/NoteCard';
import { Note } from '@/types';

export default function BoardDetailScreen() {
  const router = useRouter();
  const { hashtag } = useLocalSearchParams<{ hashtag: string }>();
  const { getNotesByLabel } = useNoteStore();
  const { getDesignById } = useDesignStore();
  const { settings } = useUserStore();
  const isDark = settings.darkMode;

  // Decode hashtag from URL
  const decodedHashtag = decodeURIComponent(hashtag || '');

  // Get notes with this hashtag
  const notes = getNotesByLabel(decodedHashtag);

  const handleNotePress = (note: Note) => {
    router.push(`/note/${note.id}`);
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: isDark ? '#1E1E1E' : '#F3F4F6' }}
      >
        <Hash size={32} color="#9CA3AF" />
      </View>
      <Text
        className="text-xl font-semibold mb-2"
        style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
      >
        No notes
      </Text>
      <Text
        className="text-center px-8"
        style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
      >
        Notes with #{decodedHashtag} will appear here
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
          borderBottomColor: isDark ? '#2D2D2D' : '#F3F4F6',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#1F2937'} />
        </TouchableOpacity>
        <View className="flex-row items-center ml-2 flex-1">
          <Hash size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text
            className="text-lg font-semibold ml-1"
            style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
            numberOfLines={1}
          >
            {decodedHashtag}
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full mr-2"
          style={{ backgroundColor: isDark ? '#1E1E1E' : '#F3F4F6' }}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </Text>
        </View>
      </View>

      {/* Note Grid */}
      {notes.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 12 }}
          columnWrapperStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <View className="flex-1 mb-2">
              <NoteCard
                note={item}
                design={item.designId ? getDesignById(item.designId) : null}
                onPress={() => handleNotePress(item)}
                isDark={isDark}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
