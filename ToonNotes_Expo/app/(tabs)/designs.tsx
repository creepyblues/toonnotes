import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Sparkle } from 'phosphor-react-native';
import { useNoteStore, useDesignStore } from '@/stores';
import { NoteColor, NoteDesign } from '@/types';
import { useTheme } from '@/src/theme';
import { DesignCard } from '@/components/designs/DesignCard';

export default function DesignsScreen() {
  const router = useRouter();
  const { addNote } = useNoteStore();
  const { designs } = useDesignStore();
  const { colors, isDark } = useTheme();

  const handleDesignPress = (design: NoteDesign) => {
    // Create a new note with this design applied
    const newNote = addNote({
      title: '',
      content: '',
      color: NoteColor.White,
      labels: [],
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      designId: design.id,
    });
    router.push(`/note/${newNote.id}`);
  };

  const handleCreateDesign = () => {
    router.push('/design/create');
  };

  const renderDesignCard = ({ item }: { item: NoteDesign }) => (
    <View style={{ flex: 1, margin: 6, maxWidth: '50%' }}>
      <DesignCard
        design={item}
        onPress={() => handleDesignPress(item)}
        isDark={isDark}
        size="compact"
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
      <Sparkle size={48} color={isDark ? '#A78BFA' : '#8B5CF6'} weight="duotone" />
      <Text
        style={{
          textAlign: 'center',
          marginTop: 16,
          color: colors.textPrimary,
          fontSize: 18,
          fontWeight: '600',
        }}
      >
        No custom designs yet
      </Text>
      <Text
        style={{
          textAlign: 'center',
          marginTop: 8,
          color: colors.textSecondary,
          fontSize: 14,
          paddingHorizontal: 40,
        }}
      >
        Create your first design from any image
      </Text>
      <TouchableOpacity
        onPress={handleCreateDesign}
        style={{
          marginTop: 24,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 24,
          backgroundColor: isDark ? '#7C3AED' : '#8B5CF6',
          borderRadius: 12,
        }}
        accessibilityLabel="Create new design"
        accessibilityRole="button"
      >
        <Plus size={20} color="#FFFFFF" weight="bold" />
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
          Create Design
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <TouchableOpacity
      onPress={handleCreateDesign}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        marginBottom: 16,
        backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)',
        borderStyle: 'dashed',
      }}
      accessibilityLabel="Create new design"
      accessibilityRole="button"
    >
      <Plus size={22} color={isDark ? '#A78BFA' : '#7C3AED'} weight="bold" />
      <Text
        style={{
          color: isDark ? '#A78BFA' : '#7C3AED',
          fontSize: 16,
          fontWeight: '600',
          marginLeft: 8,
        }}
      >
        Create New Design
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header */}
      <View
        className="px-4 py-3"
        style={{ backgroundColor: colors.backgroundSecondary }}
      >
        <Text
          style={{
            fontSize: 34,
            fontWeight: '700',
            color: colors.textPrimary,
          }}
        >
          Designs
        </Text>
        <Text
          className="text-sm mt-1"
          style={{ color: colors.textSecondary }}
        >
          Your custom AI-generated designs
        </Text>
      </View>

      {/* Content */}
      {designs.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={designs}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 10, paddingBottom: 40 }}
          ListHeaderComponent={renderHeader}
          renderItem={renderDesignCard}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
