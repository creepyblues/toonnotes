import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash, ArrowCounterClockwise, X } from 'phosphor-react-native';

import { useNoteStore } from '@/stores';
import { Note, NoteColor } from '@/types';
import { useTheme } from '@/src/theme';

export default function TrashScreen() {
  const router = useRouter();
  const { getDeletedNotes, restoreNote, permanentlyDeleteNote } = useNoteStore();
  const { colors, isDark } = useTheme();

  const deletedNotes = getDeletedNotes();

  const handleRestore = (noteId: string) => {
    restoreNote(noteId);
  };

  const handlePermanentDelete = (noteId: string) => {
    Alert.alert(
      'Delete Forever',
      'This note will be permanently deleted. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => permanentlyDeleteNote(noteId),
        },
      ]
    );
  };

  const handleEmptyTrash = () => {
    if (deletedNotes.length === 0) return;

    Alert.alert(
      'Empty Trash',
      `Permanently delete ${deletedNotes.length} note${deletedNotes.length > 1 ? 's' : ''}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty Trash',
          style: 'destructive',
          onPress: () => {
            deletedNotes.forEach((note) => permanentlyDeleteNote(note.id));
          },
        },
      ]
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: 'rgba(255, 59, 48, 0.1)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Trash size={40} color={colors.textSecondary} weight="regular" />
      </View>
      <Text
        className="text-xl font-semibold mb-2"
        style={{ color: colors.textPrimary }}
      >
        Trash is empty
      </Text>
      <Text
        className="text-center px-8"
        style={{ color: colors.textSecondary }}
      >
        Deleted notes will appear here for 30 days
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Note }) => {
    // For white notes in dark mode, use a dark background
    const backgroundColor = isDark && item.color === NoteColor.White
      ? colors.surfaceCard
      : item.color;
    const titleColor = isDark && item.color === NoteColor.White ? colors.textPrimary : '#1F2937';
    const contentColor = isDark && item.color === NoteColor.White ? colors.textSecondary : '#4B5563';

    const previewText = item.content.slice(0, 80);
    const deletedDate = item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : '';

    return (
      <View
        className="rounded-xl p-3 mb-2"
        style={{ backgroundColor }}
      >
        {/* Title */}
        {item.title ? (
          <Text
            className="font-semibold mb-1"
            style={{ color: titleColor }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
        ) : null}

        {/* Content preview */}
        <Text
          className="text-sm mb-2"
          style={{ color: contentColor }}
          numberOfLines={2}
        >
          {previewText || 'Empty note'}
        </Text>

        {/* Deleted date */}
        <Text className="text-xs mb-3" style={{ color: '#9CA3AF' }}>
          Deleted {deletedDate}
        </Text>

        {/* Action buttons */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleRestore(item.id)}
            className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
            style={{ backgroundColor: isDark ? colors.backgroundTertiary : 'rgba(0,0,0,0.05)' }}
          >
            <ArrowCounterClockwise size={16} color="#10B981" />
            <Text className="ml-2" style={{ color: '#10B981', fontWeight: '500' }}>
              Restore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlePermanentDelete(item.id)}
            className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
            style={{ backgroundColor: isDark ? colors.backgroundTertiary : 'rgba(0,0,0,0.05)' }}
          >
            <X size={16} color="#EF4444" />
            <Text className="ml-2" style={{ color: '#EF4444', fontWeight: '500' }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-2 py-2 border-b"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderBottomColor: colors.separator,
        }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            className="text-lg font-semibold ml-2"
            style={{ color: colors.textPrimary }}
          >
            Trash
          </Text>
        </View>

        {deletedNotes.length > 0 && (
          <TouchableOpacity
            onPress={handleEmptyTrash}
            className="px-3 py-2 mr-2"
          >
            <Text style={{ color: '#EF4444', fontWeight: '500' }}>
              Empty Trash
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Note List */}
      {deletedNotes.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={deletedNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}
