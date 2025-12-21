import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, X, Pin } from 'lucide-react-native';

import { useNoteStore, useUserStore, useDesignStore } from '@/stores';
import { NoteCard } from '@/components/notes/NoteCard';
import { Note, NoteColor } from '@/types';

export default function NotesScreen() {
  const router = useRouter();
  const { notes, getActiveNotes, searchNotes, addNote } = useNoteStore();
  const { settings } = useUserStore();
  const { getDesignById } = useDesignStore();
  const isDark = settings.darkMode;

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get filtered notes
  const filteredNotes = useMemo(() => {
    if (searchQuery.trim()) {
      return searchNotes(searchQuery);
    }
    return getActiveNotes();
  }, [notes, searchQuery]);

  // Separate pinned and unpinned
  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const handleCreateNote = () => {
    const newNote = addNote({
      title: '',
      content: '',
      color: NoteColor.White,
      labels: [],
      isPinned: false,
      isArchived: false,
      isDeleted: false,
    });
    router.push(`/note/${newNote.id}`);
  };

  const handleNotePress = (note: Note) => {
    router.push(`/note/${note.id}`);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const renderHeader = () => (
    <View className="mb-4">
      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center mb-3 px-1">
            <Pin size={14} color="#9CA3AF" />
            <Text className="text-xs ml-1 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
              Pinned
            </Text>
          </View>
          <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
            {pinnedNotes.map((note) => (
              <View key={note.id} className="w-1/2 p-1 px-2 mb-2">
                <NoteCard
                  note={note}
                  design={note.designId ? getDesignById(note.designId) : null}
                  onPress={() => handleNotePress(note)}
                  isDark={isDark}
                  context="grid"
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Others Section Header */}
      {unpinnedNotes.length > 0 && pinnedNotes.length > 0 && (
        <View className="flex-row items-center mb-3 px-1">
          <Text className="text-xs uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
            Others
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-6xl mb-4">📝</Text>
      <Text
        className="text-xl font-semibold mb-2"
        style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
      >
        No notes yet
      </Text>
      <Text
        className="text-center px-8"
        style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
      >
        Tap the + button to create your first note
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
        className="px-4 py-3 border-b"
        style={{
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          borderBottomColor: isDark ? '#2D2D2D' : '#F3F4F6'
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text
            className="text-2xl font-bold"
            style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
          >
            ToonNotes
          </Text>
          <TouchableOpacity
            onPress={() => setIsSearching(!isSearching)}
            className="p-2"
          >
            {isSearching ? (
              <X size={24} color={isDark ? '#9CA3AF' : '#4B5563'} />
            ) : (
              <Search size={24} color={isDark ? '#9CA3AF' : '#4B5563'} />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {isSearching && (
          <View className="mt-3">
            <TextInput
              className="rounded-lg px-4 py-3"
              style={{
                backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6',
                color: isDark ? '#FFFFFF' : '#1F2937',
              }}
              placeholder="Search notes..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}
      </View>

      {/* Note Grid */}
      {filteredNotes.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={unpinnedNotes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 12 }}
          columnWrapperStyle={{ gap: 8 }}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View className="flex-1 mb-3 px-1">
              <NoteCard
                note={item}
                design={item.designId ? getDesignById(item.designId) : null}
                onPress={() => handleNotePress(item)}
                isDark={isDark}
                context="grid"
              />
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={handleCreateNote}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: '#0ea5e9',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
