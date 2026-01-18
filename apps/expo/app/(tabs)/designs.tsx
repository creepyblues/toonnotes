import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Sparkle } from 'phosphor-react-native';
import { useNoteStore, useDesignStore } from '@/stores';
import { NoteColor, NoteDesign } from '@/types';
import { useTheme } from '@/src/theme';
import { DesignCard } from '@/components/designs/DesignCard';
import { useDesignsTabCoachMark } from '@/hooks/useCoachMark';
import { CoachMarkTooltip } from '@/components/onboarding';

// Grid constants for consistent 2-column layout
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 16;
const GRID_GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

export default function DesignsScreen() {
  const router = useRouter();
  const { addNote } = useNoteStore();
  const { designs, deleteDesign } = useDesignStore();
  const { colors, isDark, tagColors } = useTheme();

  // Coach mark for first visit
  const { shouldShow: showCoachMark, dismiss: dismissCoachMark } = useDesignsTabCoachMark();
  const [showTooltip, setShowTooltip] = useState(false);

  // Show coach mark after a delay on first visit
  useEffect(() => {
    if (showCoachMark) {
      const timer = setTimeout(() => setShowTooltip(true), 500);
      return () => clearTimeout(timer);
    }
  }, [showCoachMark]);

  const handleDismissTooltip = () => {
    setShowTooltip(false);
    dismissCoachMark();
  };

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

  const handleDeleteDesign = (design: NoteDesign) => {
    Alert.alert(
      'Delete Design',
      'Are you sure you want to delete this design?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDesign(design.id),
        },
      ]
    );
  };

  const renderDesignCard = ({ item }: { item: NoteDesign }) => (
    <View style={{ width: ITEM_WIDTH, marginBottom: 12 }}>
      <DesignCard
        design={item}
        onPress={() => handleDesignPress(item)}
        onLongPress={() => handleDeleteDesign(item)}
        isDark={isDark}
        size="compact"
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${tagColors.purple.text}15` }]}>
        <Sparkle size={40} color={tagColors.purple.text} weight="duotone" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        No custom designs yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Create your first design from any image
      </Text>
      <TouchableOpacity
        onPress={handleCreateDesign}
        style={[styles.createButton, { backgroundColor: tagColors.purple.text }]}
        accessibilityLabel="Create new design"
        accessibilityRole="button"
      >
        <Plus size={20} color="#FFFFFF" weight="bold" />
        <Text style={styles.createButtonText}>
          Create Design
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <TouchableOpacity
      onPress={handleCreateDesign}
      style={[
        styles.headerCreateButton,
        {
          backgroundColor: `${tagColors.purple.text}${isDark ? '26' : '1A'}`,
          borderColor: `${tagColors.purple.text}${isDark ? '4D' : '33'}`,
        }
      ]}
      accessibilityLabel="Create new design"
      accessibilityRole="button"
    >
      <Plus size={22} color={tagColors.purple.text} weight="bold" />
      <Text style={[styles.headerCreateText, { color: tagColors.purple.text }]}>
        Create New Design
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Designs
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
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
          contentContainerStyle={{ padding: GRID_PADDING, paddingBottom: 40 }}
          columnWrapperStyle={{ gap: GRID_GAP }}
          ListHeaderComponent={renderHeader}
          renderItem={renderDesignCard}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Coach Mark Tooltip */}
      <CoachMarkTooltip
        title="Your first design is free!"
        description="Create a custom note theme from any image using AI"
        visible={showTooltip}
        onDismiss={handleDismissTooltip}
        accentColor={tagColors.purple.text}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  // Header create button
  headerCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  headerCreateText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  createButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
