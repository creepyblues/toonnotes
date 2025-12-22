import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Sparkles } from 'lucide-react-native';

import { useDesignStore, useUserStore, useNoteStore } from '@/stores';
import { NoteDesign, NoteColor } from '@/types';
import { DesignCard } from '@/components/designs/DesignCard';

export default function DesignsScreen() {
  const router = useRouter();
  const { designs } = useDesignStore();
  const { user, getDesignCost, settings } = useUserStore();
  const { addNote } = useNoteStore();
  const isDark = settings.darkMode;

  const handleCreateDesign = () => {
    router.push({
      pathname: '/design/create',
      params: { returnTo: 'designs' },
    });
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

  const renderDesignCard = ({ item }: { item: NoteDesign }) => (
    <View className="flex-1 m-1">
      <DesignCard
        design={item}
        onPress={() => handleDesignPress(item)}
        isDark={isDark}
        size="normal"
      />
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-6xl mb-4">🎨</Text>
      <Text
        className="text-xl font-semibold mb-2"
        style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
      >
        No designs yet
      </Text>
      <Text
        className="text-center px-8 mb-6"
        style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
      >
        Create custom designs from your favorite webtoon or anime images
      </Text>
      <TouchableOpacity
        onPress={handleCreateDesign}
        className="bg-primary-500 px-6 py-3 rounded-full flex-row items-center"
      >
        <Plus size={20} color="#FFFFFF" />
        <Text className="text-white font-semibold ml-2">
          Create Your First Design
        </Text>
      </TouchableOpacity>
    </View>
  );

  const cost = getDesignCost();

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
            My Designs
          </Text>
          <View
            className="flex-row items-center px-3 py-1 rounded-full"
            style={{ backgroundColor: isDark ? '#0c4a6e' : '#f0f9ff' }}
          >
            <Sparkles size={16} color="#0ea5e9" />
            <Text
              className="font-semibold ml-1"
              style={{ color: isDark ? '#38bdf8' : '#0284c7' }}
            >
              {user.coinBalance}
            </Text>
          </View>
        </View>

        {/* Cost indicator */}
        <Text
          className="text-sm mt-1"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
        >
          {cost === 0
            ? 'Your first design is free!'
            : `Next design costs ${cost} coin`}
        </Text>
      </View>

      {/* Designs Grid */}
      {designs.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={designs}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 12 }}
          renderItem={renderDesignCard}
        />
      )}

      {/* FAB */}
      {designs.length > 0 && (
        <TouchableOpacity
          onPress={handleCreateDesign}
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
      )}
    </SafeAreaView>
  );
}
