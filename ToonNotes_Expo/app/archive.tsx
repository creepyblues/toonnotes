import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Archive } from 'phosphor-react-native';

import { useNoteStore, useDesignStore } from '@/stores';
import { NoteCard } from '@/components/notes/NoteCard';
import { Note } from '@/types';
import { useTheme } from '@/src/theme';

export default function ArchiveScreen() {
  const router = useRouter();
  const { getArchivedNotes, unarchiveNote } = useNoteStore();
  const { getDesignById } = useDesignStore();
  const { colors, isDark } = useTheme();

  const archivedNotes = getArchivedNotes();

  const handleNotePress = (note: Note) => {
    router.push(`/note/${note.id}`);
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: `${colors.accent}15`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Archive size={40} color={colors.textSecondary} weight="regular" />
      </View>
      <Text
        className="text-xl font-semibold mb-2"
        style={{ color: colors.textPrimary }}
      >
        No archived notes
      </Text>
      <Text
        className="text-center px-8"
        style={{ color: colors.textSecondary }}
      >
        Notes you archive will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-2 py-2 border-b"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderBottomColor: colors.separator,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          className="text-lg font-semibold ml-2"
          style={{ color: colors.textPrimary }}
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
    </SafeAreaView>
  );
}
