import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Image,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
  Keyboard,
  Animated,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import {
  CaretLeft,
  PushPin,
  PushPinSlash,
  Archive,
  Trash,
  DotsThreeVertical,
  Sparkle,
  X,
  Plus,
  Hash,
  Check,
  ShareNetwork,
  // Label icons for note editor
  CheckSquare,
  Star,
  Archive as ArchiveIcon,
  Target,
  BookOpen,
  Television,
  ChatCircleText,
  HeartStraight,
  Lightbulb,
  Brain,
  UserCircle,
  Heart,
  PencilLine,
  NotePencil,
  Quotes,
  MagnifyingGlass,
  Notebook,
  Camera,
  Palette,
  ListBullets,
  ImageSquare,
  // Fallback for custom labels
  Tag,
  IconProps,
} from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';
import { normalizeLabel } from '@/utils/labelNormalization';

// Phosphor icon mapping for label icons
const NOTE_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  CheckSquare,
  Star,
  Archive: ArchiveIcon,
  Target,
  BookOpen,
  Television,
  ChatCircleText,
  HeartStraight,
  Lightbulb,
  Brain,
  UserCircle,
  Heart,
  PencilLine,
  NotePencil,
  Quotes,
  MagnifyingGlass,
  Notebook,
  Camera,
  Sparkle,
  Palette,
  // Fallback for custom labels
  Tag,
};

import {
  useNoteStore,
  useDesignStore,
  useUserStore,
  useLabelSuggestionStore,
  createPendingSuggestions,
  useAuthStore,
} from '@/stores';
import { createShareLink } from '@/services/shareService';
import {
  useEditorContent,
  toggleCheckboxAtLine,
  insertCheckboxAtCursor,
  insertBulletAtCursor,
} from '@/hooks/editor';
import {
  CheckboxEditor,
  BulletEditor,
  ChecklistEditor,
  parseChecklistFromContent,
  checklistToContent,
  type ChecklistItem,
} from '@/components/editor';
import { useTheme } from '@/src/theme';
import { NoteColor, NoteDesign } from '@/types';
import {
  analyzeNoteContent,
  LabelAnalysisResponse,
} from '@/services/labelingEngine';
import {
  LabelSuggestionToast,
  LabelSuggestionSheet,
  AnalysisProgressModal,
} from '@/components/labels';
import { composeStyle } from '@/services/designEngine';
import { BackgroundLayer } from '@/components/BackgroundLayer';
import { DesignCard } from '@/components/designs/DesignCard';
import { useFontsLoaded } from '@/app/_layout';
import { SYSTEM_FONT_FALLBACKS, PresetFontStyle } from '@/constants/fonts';
import { generateUUID } from '@/utils/uuid';

// Note color options for the color picker
const NOTE_COLORS = [
  { name: 'White', value: NoteColor.White },
  { name: 'Lavender', value: NoteColor.Lavender },
  { name: 'Rose', value: NoteColor.Rose },
  { name: 'Peach', value: NoteColor.Peach },
  { name: 'Mint', value: NoteColor.Mint },
  { name: 'Sky', value: NoteColor.Sky },
  { name: 'Violet', value: NoteColor.Violet },
];

// Label colors: darker grey for primary, lighter grey for rest
const LABEL_COLORS = {
  primary: {
    light: { background: 'rgba(60, 60, 67, 0.12)', text: '#3C3C43' },
    dark: { background: 'rgba(255, 255, 255, 0.16)', text: '#E5E5E7' },
  },
  secondary: {
    light: { background: 'rgba(142, 142, 147, 0.08)', text: '#8E8E93' },
    dark: { background: 'rgba(142, 142, 147, 0.12)', text: '#98989D' },
  },
};

// Helper to get label color based on index
const getLabelColor = (index: number, isDark: boolean) => {
  const colorType = index === 0 ? 'primary' : 'secondary';
  return isDark ? LABEL_COLORS[colorType].dark : LABEL_COLORS[colorType].light;
};

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const {
    updateNote,
    deleteNote,
    archiveNote,
    pinNote,
    unpinNote,
    labels,
    addLabel,
    addLabelToNote,
    removeLabelFromNote,
    setActiveDesignLabel,
  } = useNoteStore();

  // Subscribe directly to the specific note - this ensures re-render when note.designId changes
  const note = useNoteStore((state) => state.notes.find((n) => n.id === id));

  const { designs, getDesignById } = useDesignStore();
  const { settings } = useUserStore();
  const { isDark, colors } = useTheme();

  // Label suggestion store hooks
  const setPendingSuggestions = useLabelSuggestionStore((state) => state.setPendingSuggestions);
  const showAutoApplyToast = useLabelSuggestionStore((state) => state.showAutoApplyToast);
  const getSuggestionsForNote = useLabelSuggestionStore((state) => state.getSuggestionsForNote);
  const clearSuggestions = useLabelSuggestionStore((state) => state.clearSuggestions);
  const currentDesign = note?.designId ? getDesignById(note.designId) : null;

  // Check if Google Fonts are loaded
  const fontsLoaded = useFontsLoaded();

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState<NoteColor>(note?.color || NoteColor.White);
  const [designId, setDesignId] = useState<string | undefined>(note?.designId);

  // Sync designId from note when it changes (e.g., after navigation, store hydration, or auto-apply)
  useEffect(() => {
    if (note?.designId !== designId) {
      setDesignId(note?.designId);
    }
  }, [note?.designId]);
  const [showMenu, setShowMenu] = useState(false);
  const [showDesignPicker, setShowDesignPicker] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Hashtag autocomplete state
  const [showHashtagAutocomplete, setShowHashtagAutocomplete] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hashtagInputValue, setHashtagInputValue] = useState('');

  // Label suggestion state
  const [showSuggestionSheet, setShowSuggestionSheet] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(false); // Track if we should navigate after label confirmation

  // AI-analyzed suggestions for autocomplete
  const [analyzedSuggestions, setAnalyzedSuggestions] = useState<string[]>([]);
  const [isAnalyzingForAutocomplete, setIsAnalyzingForAutocomplete] = useState(false);

  // Format menu state (checkbox, bullet, image)
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [images, setImages] = useState<string[]>(note?.images || []);

  // Editor mode state (normal, checklist, bullet)
  type EditorMode = 'normal' | 'checklist' | 'bullet';
  const [editorMode, setEditorMode] = useState<EditorMode>('normal');

  // Checklist items state (only used in checklist mode)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // Keyboard height tracking for button animation
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  // Auto-detect editor mode from existing content on mount
  useEffect(() => {
    if (note?.content) {
      const lines = note.content.split('\n');
      const hasCheckboxes = lines.some(l => l.match(/^-?\s*\[[ xX]\]/));
      const hasBullets = lines.some(l => l.match(/^[•\-\*]\s/));
      if (hasCheckboxes) {
        setEditorMode('checklist');
        setChecklistItems(parseChecklistFromContent(note.content));
      } else if (hasBullets) {
        setEditorMode('bullet');
      }
    }
  }, []); // Only run on mount

  // Animate button row above keyboard
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? 250 : 0,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 0,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [keyboardHeight]);

  // Sync checklist items to content when items change
  const handleChecklistChange = useCallback((newItems: ChecklistItem[]) => {
    setChecklistItems(newItems);
    setContent(checklistToContent(newItems));
  }, []);

  // Single TextInput cursor management (replaces per-line refs)
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>();
  const contentInputRef = useRef<TextInput | null>(null);

  // Track original content to detect changes for analysis
  const originalContentRef = useRef({ title: note?.title || '', content: note?.content || '' });

  // Track pending navigation action for beforeRemove listener
  const pendingNavigationRef = useRef<any>(null);

  // Track if analysis is complete to prevent re-triggering on subsequent navigation
  const analysisCompleteRef = useRef(false);

  // Use the editor content hook for parsing
  const { parsedLines, checkboxLines } = useEditorContent(content);

  // Get active design for styling
  const activeDesign = designId ? getDesignById(designId) : null;

  // Check if the active design is from a label preset
  const activeDesignLabelName = note?.activeDesignLabelId;

  // Compose style using DesignEngine for detail context (pass labels for icon matching)
  const style = composeStyle(activeDesign ?? null, color, 'detail', isDark, note?.labels);

  // Get font family with fallback
  const getTitleFont = () => {
    if (fontsLoaded && style.titleFontFamily) {
      return style.titleFontFamily;
    }
    // Fallback to system font based on style category
    const fontStyle = (style.fontStyle || 'sans-serif') as PresetFontStyle;
    return SYSTEM_FONT_FALLBACKS[fontStyle] || 'System';
  };

  const getBodyFont = () => {
    // Always use system font for content text
    return 'System';
  };

  // Track previous values to detect actual changes
  const prevValuesRef = useRef({ title, content, color, designId });
  const isInitialMount = useRef(true);

  // Auto-save on changes (only when content actually changes)
  useEffect(() => {
    if (!id) return;

    // Skip on initial mount to avoid unnecessary save
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const prev = prevValuesRef.current;
    const hasChanges =
      prev.title !== title ||
      prev.content !== content ||
      prev.color !== color ||
      prev.designId !== designId;

    // Only save if there are actual changes
    if (!hasChanges) return;

    const timeout = setTimeout(() => {
      updateNote(id, { title, content, color, designId });
      prevValuesRef.current = { title, content, color, designId };
    }, 500);

    return () => clearTimeout(timeout);
  }, [id, title, content, color, designId, updateNote]);

  // Analyze note content for label suggestions when editor closes
  // Returns true if suggestions popup is shown
  const analyzeForLabels = async (): Promise<boolean> => {
    if (!note || !id) return false;

    // NOTE: We no longer skip if note has labels - we want to suggest ADDITIONAL labels
    // even for notes created from boards that already have the board's label

    // Check if content has changed meaningfully
    const originalTitle = originalContentRef.current.title;
    const originalContent = originalContentRef.current.content;
    const hasContentChanges =
      title.trim() !== originalTitle.trim() ||
      content.trim() !== originalContent.trim();

    // Skip if no content changes or if content is too short
    if (!hasContentChanges && !title.trim() && !content.trim()) return false;
    if (title.trim().length < 3 && content.trim().length < 10) return false;

    setIsAnalyzing(true);

    try {
      const existingLabelNames = labels.map((l) => l.name);
      const result = await analyzeNoteContent({
        noteTitle: title,
        noteContent: content,
        existingLabels: existingLabelNames,
      });

      // Filter out labels already applied to this note
      const normalizedNoteLabels = note.labels.map((l) => normalizeLabel(l));
      const filteredAutoApply = result.autoApplyLabels.filter(
        (l) => !normalizedNoteLabels.includes(normalizeLabel(l.labelName))
      );
      const filteredSuggest = result.suggestLabels.filter(
        (l) => !normalizedNoteLabels.includes(normalizeLabel(l.labelName))
      );

      // Combine filtered matched labels (high + medium confidence)
      const allMatchedLabels = [...filteredAutoApply, ...filteredSuggest];

      // Show toast if we have any NEW label recommendations
      if (allMatchedLabels.length > 0) {
        const labelNames = allMatchedLabels.map((m) => m.labelName);
        showAutoApplyToast(id, labelNames);
        return true; // Wait for user confirmation
      }
      return false; // No new suggestions, allow navigation
    } catch (error) {
      console.warn('[NoteEditor] Label analysis failed:', error);
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle applying labels from suggestion sheet
  const handleApplyLabelSuggestions = (labelNames: string[], newLabels: string[]) => {
    if (!note) return;

    // Add existing labels to note
    labelNames.forEach((name) => {
      addLabelToNote(note.id, name);
    });

    // Create and add new labels
    newLabels.forEach((name) => {
      addLabel(name);
      addLabelToNote(note.id, name);
    });

    setShowSuggestionSheet(false);

    // Navigate back if this was triggered during back navigation
    if (pendingNavigation) {
      setPendingNavigation(false);
      router.back();
    }
  };

  // Handle skipping all suggestions
  const handleSkipSuggestions = () => {
    if (!note) return;

    // Assign uncategorized label as fallback
    const assignUncategorized = useNoteStore.getState().assignUncategorizedLabel;
    assignUncategorized(note.id);

    setShowSuggestionSheet(false);

    // Navigate back if this was triggered during back navigation
    if (pendingNavigation) {
      setPendingNavigation(false);
      router.back();
    }
  };

  // Handle closing suggestion sheet without action
  const handleCloseSuggestionSheet = () => {
    if (note) {
      clearSuggestions(note.id);
    }
    setShowSuggestionSheet(false);

    // Navigate back if this was triggered during back navigation
    if (pendingNavigation) {
      setPendingNavigation(false);
      router.back();
    }
  };

  // Analyze note content for label suggestions in autocomplete
  const analyzeForAutocomplete = useCallback(async () => {
    // Skip if already analyzing or no content
    if (isAnalyzingForAutocomplete) return;
    if (!title.trim() && !content.trim()) return;
    if (title.trim().length < 2 && content.trim().length < 5) return;

    setIsAnalyzingForAutocomplete(true);
    setAnalyzedSuggestions([]);

    try {
      const existingLabelNames = labels.map((l) => l.name);
      const result = await analyzeNoteContent({
        noteTitle: title,
        noteContent: content,
        existingLabels: existingLabelNames,
      });

      // Combine all matched labels (high + medium confidence)
      const allMatchedLabels = [...result.autoApplyLabels, ...result.suggestLabels];

      // Filter out labels already applied to this note
      const suggestions = allMatchedLabels
        .map((m) => m.labelName)
        .filter((name) => !note?.labels.includes(name));

      setAnalyzedSuggestions(suggestions);
    } catch (error) {
      console.warn('[NoteEditor] Label analysis for autocomplete failed:', error);
    } finally {
      setIsAnalyzingForAutocomplete(false);
    }
  }, [title, content, labels, note?.labels, isAnalyzingForAutocomplete]);

  // Handle "+Add label" button click - analyze and show autocomplete
  const handleAddLabelPress = useCallback(() => {
    setShowHashtagAutocomplete(true);
    // Trigger AI analysis when opening autocomplete
    analyzeForAutocomplete();
  }, [analyzeForAutocomplete]);

  // Regex to detect hashtag being typed
  const HASHTAG_TYPING_REGEX = /#(\w*)$/;

  // Filter existing labels based on hashtag query or input field
  // Show all labels when query is empty, filter when query has text
  // Sort by lastUsedAt (most recent first), then by createdAt
  const filteredLabels = useMemo(() => {
    // Use input field value if available, otherwise use inline hashtag query
    const query = (hashtagInputValue || hashtagQuery).toLowerCase();
    return labels
      .filter(
        (l) =>
          (query === '' || l.name.toLowerCase().includes(query)) &&
          !note?.labels.includes(l.name) // Exclude already applied
      )
      .sort((a, b) => {
        // Sort by lastUsedAt first (most recent first), then by createdAt
        const aTime = a.lastUsedAt || a.createdAt;
        const bTime = b.lastUsedAt || b.createdAt;
        return bTime - aTime;
      });
  }, [labels, hashtagQuery, hashtagInputValue, note?.labels]);

  // Handle content change with hashtag detection
  // Note: Auto-continue for bullets/checkboxes removed - use format menu (+) instead
  const handleContentChange = (text: string) => {
    // Detect if user pressed Enter or Space while autocomplete is showing
    // This creates the hashtag automatically
    if (showHashtagAutocomplete && hashtagQuery.length > 0) {
      const lastChar = text.slice(-1);
      const prevLastChar = content.slice(-1);

      // Check if a newline or space was just added
      if ((lastChar === '\n' || lastChar === ' ') && prevLastChar !== '\n' && prevLastChar !== ' ') {
        // Create the hashtag
        handleCreateAndInsertHashtag(hashtagQuery);
        return; // Don't update content - handleCreateAndInsertHashtag will do it
      }
    }

    // Simple: just set the content directly
    setContent(text);

    // Check if user is typing a hashtag
    const cursor = selection?.start ?? text.length;
    const textBeforeCursor = text.slice(0, cursor);
    const match = textBeforeCursor.match(HASHTAG_TYPING_REGEX);

    if (match) {
      setHashtagQuery(match[1]); // Text after #
      setShowHashtagAutocomplete(true);
    } else {
      setShowHashtagAutocomplete(false);
      setHashtagQuery('');
      setAnalyzedSuggestions([]);
    }
  };

  // Track cursor position and selection
  const handleSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    const newSelection = event.nativeEvent.selection;
    setSelection(newSelection);
    setCursorPosition(newSelection.end);
  };

  // Handle hashtag selection from autocomplete
  const handleSelectHashtag = (tagName: string) => {
    // Check if we're adding from the input field (no inline # typed)
    const isFromInputField = hashtagInputValue.length > 0 || hashtagQuery.length === 0;

    if (!isFromInputField) {
      // Replace the partial #tag with the full hashtag in content
      const textBeforeCursor = content.slice(0, cursorPosition);
      const textAfterCursor = content.slice(cursorPosition);

      // Find where # starts
      const hashIndex = textBeforeCursor.lastIndexOf('#');
      const newContent =
        textBeforeCursor.slice(0, hashIndex) + `#${tagName} ` + textAfterCursor;

      setContent(newContent);
    }

    // Add label to note using the new action (handles auto-apply design)
    if (note && !note.labels.includes(tagName.toLowerCase())) {
      addLabelToNote(note.id, tagName);
    }

    setShowHashtagAutocomplete(false);
    setHashtagQuery('');
    setHashtagInputValue('');
    setAnalyzedSuggestions([]);
  };

  // Handle creating and inserting a new hashtag
  const handleCreateAndInsertHashtag = (tagName: string) => {
    // Create the label in store if it doesn't exist
    if (!labels.find(l => l.name.toLowerCase() === tagName.toLowerCase())) {
      addLabel(tagName);
    }
    // Then insert it
    handleSelectHashtag(tagName);
  };

  if (!note) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-system-textTertiary">Note not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 bg-primary-500 rounded-lg"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // State to track if we're waiting for toast confirmation
  const [waitingForToast, setWaitingForToast] = useState(false);

  // Callback when toast is confirmed/dismissed
  const handleToastComplete = useCallback(() => {
    setWaitingForToast(false);
    // Mark analysis as complete to prevent re-triggering on subsequent navigation
    analysisCompleteRef.current = true;

    // Dispatch the pending navigation action that was stored when beforeRemove fired
    if (pendingNavigationRef.current) {
      navigation.dispatch(pendingNavigationRef.current);
      pendingNavigationRef.current = null;
    } else {
      // Fallback: if no pending action, use router.back()
      router.back();
    }
  }, [navigation, router]);

  const handleBack = () => {
    // Dismiss keyboard first, then let beforeRemove handle save, analysis, and navigation
    Keyboard.dismiss();
    router.back();
  };

  const handlePin = () => {
    if (note.isPinned) {
      unpinNote(note.id);
    } else {
      pinNote(note.id);
    }
    setShowMenu(false);
  };

  const handleArchive = () => {
    archiveNote(note.id);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'This note will be moved to trash.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteNote(note.id);
            router.back();
          },
        },
      ]
    );
  };

  // Share note handler
  const handleShare = async () => {
    // Check if user is signed in
    const { user } = useAuthStore.getState();
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to share notes.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => router.push('/auth'),
          },
        ]
      );
      return;
    }

    setShowMenu(false);
    setIsSharing(true);

    try {
      const result = await createShareLink(note, user.id);
      if (result) {
        await Share.share({
          message: `Check out my note "${note.title || 'Untitled'}": ${result.shareUrl}`,
          url: result.shareUrl, // iOS only
        });
      } else {
        Alert.alert('Error', 'Failed to create share link. Please try again.');
      }
    } catch (error) {
      if ((error as Error).message !== 'Share was dismissed') {
        Alert.alert('Error', 'Failed to share note. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Universal navigation listener for all dismissal methods (swipe-down, back button, etc.)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e: any) => {
      // Safety check - allow navigation if note doesn't exist
      if (!note) {
        return;
      }

      // Don't block if we're waiting for toast (toast will handle navigation)
      if (waitingForToast) {
        return;
      }

      // Skip if analysis already completed (prevents double-trigger after toast dismiss)
      if (analysisCompleteRef.current) {
        analysisCompleteRef.current = false; // Reset for next time
        return;
      }

      // Prevent default behavior
      e.preventDefault();

      // Dismiss keyboard first
      Keyboard.dismiss();

      // Save current state (including designId to prevent design loss)
      updateNote(note.id, { title, content, color, designId });

      // Delete empty notes
      if (!title.trim() && !content.trim()) {
        deleteNote(note.id);
        navigation.dispatch(e.data.action);
        return;
      }

      // Trigger label analysis if note has content
      if (title.trim() || content.trim()) {
        const hasSuggestions = await analyzeForLabels();
        if (hasSuggestions) {
          // Store the navigation action for later dispatch after toast
          pendingNavigationRef.current = e.data.action;
          setWaitingForToast(true);
          return;
        }
      }

      // No suggestions, proceed with navigation
      navigation.dispatch(e.data.action);
    });

    return unsubscribe;
  }, [navigation, title, content, color, designId, note, waitingForToast, updateNote, deleteNote]);

  const handleApplyDesign = (design: NoteDesign) => {
    setDesignId(design.id);
    setShowDesignPicker(false);
  };

  const handleClearDesign = () => {
    setDesignId(undefined);
    if (note) {
      setActiveDesignLabel(note.id, undefined);
    }
    setShowDesignPicker(false);
  };

  // Note: Checkbox toggling is now handled by the useEditorContent hook
  // The toggleCheckboxAtLine function is imported and can be used if needed

  // Format menu handlers - toggle editor mode
  const handleAddCheckbox = () => {
    // Toggle checklist mode
    if (editorMode === 'checklist') {
      setEditorMode('normal');
    } else {
      setEditorMode('checklist');
      // Initialize checklist items from content or start fresh
      if (content.trim()) {
        setChecklistItems(parseChecklistFromContent(content));
      } else {
        setChecklistItems([{ id: generateUUID(), text: '', checked: false }]);
      }
    }
    setShowFormatMenu(false);
  };

  const handleAddBullet = () => {
    // Toggle bullet mode
    if (editorMode === 'bullet') {
      setEditorMode('normal');
    } else {
      setEditorMode('bullet');
      // If content is empty, initialize with a bullet
      if (!content.trim()) {
        setContent('• ');
      }
    }
    setShowFormatMenu(false);
  };

  const handleAddImage = async () => {
    setShowFormatMenu(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newImages = [...images, result.assets[0].uri];
      setImages(newImages);
      if (note) {
        updateNote(note.id, { images: newImages });
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (note) {
      updateNote(note.id, { images: newImages });
    }
  };

  // Get sticker position styles
  const getStickerPositionStyle = () => {
    switch (style.stickerPosition) {
      case 'top-left':
        return { top: 80, left: 16 };
      case 'top-right':
        return { top: 80, right: 16 };
      case 'bottom-left':
        return { bottom: 40, left: 16 };
      case 'bottom-right':
      default:
        return { bottom: 40, right: 16 };
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: style.backgroundColor }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{
          borderRadius: 16,
          marginHorizontal: 0,
          // iOS-style shadow
          shadowColor: style.shadowColor,
          shadowOffset: style.shadowOffset,
          shadowOpacity: style.shadowOpacity,
          shadowRadius: style.shadowRadius,
          elevation: style.elevation,
          overflow: 'hidden', // Clip background to border radius
        }}
      >
        <BackgroundLayer style={style} context="detail">

        {/* Sticker overlay (bottom right) - priority over label icon */}
        {style.showSticker && style.stickerUri ? (
          <Image
            source={{ uri: style.stickerUri }}
            style={[
              {
                position: 'absolute',
                width: 160 * style.stickerScale,
                height: 160 * style.stickerScale,
                zIndex: 10,
              },
              getStickerPositionStyle(),
            ]}
            resizeMode="contain"
          />
        ) : style.noteIcon && NOTE_ICON_MAP[style.noteIcon] ? (
          // Label icon (Phosphor) when no sticker is available
          (() => {
            const IconComponent = NOTE_ICON_MAP[style.noteIcon];
            return (
              <View
                style={{
                  position: 'absolute',
                  bottom: 40,
                  right: 20,
                  opacity: 0.15,
                  zIndex: 10,
                }}
              >
                <IconComponent
                  size={120}
                  color={style.bodyColor}
                  weight={style.noteIcon === 'Star' || style.noteIcon === 'Heart' ? 'fill' : 'regular'}
                />
              </View>
            );
          })()
        ) : null}

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <CaretLeft size={24} color={style.titleColor} weight="regular" />
          </TouchableOpacity>

          <View className="flex-row items-center">
            {/* Pin button */}
            <TouchableOpacity
              onPress={handlePin}
              className="p-2"
              accessibilityLabel={note.isPinned ? "Unpin note" : "Pin note"}
              accessibilityRole="button"
            >
              {note.isPinned ? (
                <PushPinSlash size={22} color={style.titleColor} weight="regular" />
              ) : (
                <PushPin size={22} color={style.titleColor} weight="regular" />
              )}
            </TouchableOpacity>

            {/* Design picker button */}
            <TouchableOpacity
              onPress={() => setShowDesignPicker(true)}
              className="p-2"
              accessibilityLabel={activeDesign ? "Change design" : "Add design"}
              accessibilityHint="Opens design picker to style your note"
              accessibilityRole="button"
            >
              <Sparkle size={22} color={activeDesign ? '#F59E0B' : style.titleColor} weight={activeDesign ? 'fill' : 'regular'} />
            </TouchableOpacity>

            {/* More menu */}
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              className="p-2"
              accessibilityLabel="More options"
              accessibilityRole="button"
            >
              <DotsThreeVertical size={22} color={style.titleColor} weight="bold" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu dropdown */}
        {showMenu && (
          <View
            style={{
              position: 'absolute',
              top: 56,
              right: 16,
              backgroundColor: isDark ? '#1C1826' : '#FFFFFF',
              borderRadius: 16,
              shadowColor: '#8B5CF6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              zIndex: 10,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: isDark ? '#252136' : '#EDE9FE',
            }}
          >
            <TouchableOpacity
              onPress={handleShare}
              disabled={isSharing}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#252136' : '#EDE9FE',
                opacity: isSharing ? 0.5 : 1,
              }}
              accessibilityLabel="Share note"
              accessibilityHint="Creates a shareable link"
              accessibilityRole="button"
            >
              {isSharing ? (
                <ActivityIndicator size={18} color="#3B82F6" />
              ) : (
                <ShareNetwork size={18} color="#3B82F6" weight="regular" />
              )}
              <Text style={{ marginLeft: 12, color: '#3B82F6' }}>
                {isSharing ? 'Creating link...' : 'Share'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleArchive}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#252136' : '#EDE9FE',
              }}
              accessibilityLabel="Archive note"
              accessibilityRole="button"
            >
              <Archive size={18} color="#10B981" weight="regular" />
              <Text style={{ marginLeft: 12, color: isDark ? '#F5F3FF' : '#1A1625' }}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
              accessibilityLabel="Delete note"
              accessibilityHint="Moves note to trash"
              accessibilityRole="button"
            >
              <Trash size={18} color="#EF4444" weight="regular" />
              <Text style={{ marginLeft: 12, color: '#EF4444' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Editor */}
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <TextInput
            className="text-2xl font-bold py-3"
            style={[
              {
                color: style.titleColor,
                fontFamily: getTitleFont(),
              },
              // Additional style adjustments per font category
              style.fontStyle === 'mono' && { fontSize: 20 },
              style.fontStyle === 'display' && { letterSpacing: -0.5 },
            ]}
            placeholder="Title"
            placeholderTextColor={activeDesign ? `${style.titleColor}80` : '#9CA3AF'}
            value={title}
            onChangeText={setTitle}
            multiline
            accessibilityLabel="Note title"
            accessibilityHint="Enter the title of your note"
          />

          {/* Content - Mode-based rendering */}
          {editorMode === 'normal' && (
            <TextInput
              ref={contentInputRef}
              style={[
                {
                  color: style.bodyColor,
                  fontFamily: getBodyFont(),
                  fontSize: 16,
                  padding: 0,
                  margin: 0,
                  minHeight: 300,
                  textAlignVertical: 'top',
                },
                style.fontStyle === 'mono' && { fontSize: 14 },
              ]}
              placeholder="Start typing... Use # to add labels"
              placeholderTextColor={activeDesign ? `${style.bodyColor}80` : '#9CA3AF'}
              value={content}
              onChangeText={handleContentChange}
              onSelectionChange={handleSelectionChange}
              selection={selection}
              multiline
              scrollEnabled={false}
              textAlignVertical="top"
              accessibilityLabel="Note content"
              accessibilityHint="Enter your note content. Use # to add labels."
            />
          )}

          {editorMode === 'checklist' && (
            <ChecklistEditor
              items={checklistItems}
              onItemsChange={handleChecklistChange}
              style={style}
              isDark={isDark}
            />
          )}

          {editorMode === 'bullet' && (
            <BulletEditor
              content={content}
              onContentChange={setContent}
              style={style}
              isDark={isDark}
            />
          )}
        </ScrollView>

        {/* Labels Panel - iOS Style */}
        {showHashtagAutocomplete && (
          <View
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              borderTopWidth: 1,
              borderTopColor: colors.separator,
              maxHeight: 280,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 10,
              zIndex: 20,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.separator,
              }}
            >
              <Text style={{
                color: colors.textPrimary,
                fontSize: 16,
                fontWeight: '600',
              }}>
                Labels
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowHashtagAutocomplete(false);
                  setHashtagInputValue('');
                  setAnalyzedSuggestions([]);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={colors.textSecondary} weight="regular" />
              </TouchableOpacity>
            </View>

            {/* Input field */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 16,
                marginTop: 12,
                marginBottom: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: isDark ? colors.backgroundTertiary : '#EFEFF0',
              }}
            >
              <Hash size={16} color={colors.textSecondary} weight="regular" />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 15,
                  color: colors.textPrimary,
                  paddingVertical: 0,
                }}
                placeholder="Type label name..."
                placeholderTextColor={colors.textSecondary}
                value={hashtagInputValue}
                onChangeText={setHashtagInputValue}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={() => {
                  if (hashtagInputValue.trim()) {
                    handleCreateAndInsertHashtag(hashtagInputValue.trim());
                    setHashtagInputValue('');
                  }
                }}
                returnKeyType="done"
              />
              {hashtagInputValue.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    handleCreateAndInsertHashtag(hashtagInputValue.trim());
                    setHashtagInputValue('');
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: colors.accent,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Current labels */}
            {note && note.labels.length > 0 && (
              <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 4 }}>
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  fontWeight: '600',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Current
                </Text>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                }}>
                  {note.labels.map((label, index) => {
                    const labelColor = getLabelColor(index, isDark);

                    return (
                      <View
                        key={label}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: labelColor.background,
                          paddingLeft: 10,
                          paddingRight: 6,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: labelColor.text, fontWeight: '500' }}>
                          #{label}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeLabelFromNote(note.id, label)}
                          style={{ marginLeft: 6, padding: 2 }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <X size={14} color={colors.textSecondary} weight="bold" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Create new option */}
            {hashtagQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => handleCreateAndInsertHashtag(hashtagQuery)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginHorizontal: 16,
                  marginTop: 8,
                  marginBottom: 4,
                  borderRadius: 10,
                  backgroundColor: isDark ? colors.backgroundTertiary : '#EFEFF0',
                }}
              >
                <Plus size={16} color={colors.accent} weight="bold" />
                <Text style={{
                  color: colors.accent,
                  fontWeight: '600',
                  fontSize: 15,
                  marginLeft: 8,
                }}>
                  Create "{hashtagQuery}"
                </Text>
              </TouchableOpacity>
            )}

            {/* AI Suggestions Section */}
            {(isAnalyzingForAutocomplete || analyzedSuggestions.length > 0) && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8, marginHorizontal: 16 }}>
                  <Sparkle size={14} color={colors.accent} weight="fill" style={{ marginRight: 4 }} />
                  <Text style={{
                    fontSize: 12,
                    color: colors.accent,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    AI Suggestions
                  </Text>
                  {isAnalyzingForAutocomplete && (
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 8 }}>
                      Analyzing...
                    </Text>
                  )}
                </View>

                {analyzedSuggestions.length > 0 && (
                  <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    paddingHorizontal: 16,
                    paddingBottom: 8,
                    gap: 8,
                  }}>
                    {analyzedSuggestions.map((labelName) => {
                      const suggestionColor = getLabelColor(1, isDark); // Grey for suggestions

                      return (
                        <TouchableOpacity
                          key={labelName}
                          onPress={() => handleSelectHashtag(labelName)}
                          style={{
                            backgroundColor: suggestionColor.background,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: colors.accent,
                          }}
                        >
                          <Text style={{
                            color: suggestionColor.text,
                            fontSize: 13,
                            fontWeight: '500',
                          }}>
                            #{labelName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* All Labels Section */}
            {filteredLabels.length > 0 && (
              <Text style={{
                fontSize: 12,
                color: colors.textSecondary,
                fontWeight: '600',
                marginTop: 12,
                marginBottom: 8,
                marginHorizontal: 16,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                All Labels
              </Text>
            )}

            {/* Labels list */}
            <ScrollView
              style={{ maxHeight: 120, paddingHorizontal: 16 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingBottom: 16,
                gap: 8,
              }}>
                {filteredLabels
                  .filter((label) => !analyzedSuggestions.includes(label.name)) // Don't show duplicates
                  .map((label) => {
                    const labelColor = getLabelColor(1, isDark); // Grey for picker options

                    return (
                      <TouchableOpacity
                        key={label.id}
                        onPress={() => handleSelectHashtag(label.name)}
                        style={{
                          backgroundColor: labelColor.background,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{
                          color: labelColor.text,
                          fontSize: 13,
                          fontWeight: '500',
                        }}>
                          #{label.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>

              {/* Empty state */}
              {filteredLabels.length === 0 && labels.length === 0 && !isAnalyzingForAutocomplete && analyzedSuggestions.length === 0 && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    textAlign: 'center',
                  }}>
                    Type to create a new label
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* Images row */}
        {images.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
            {images.map((uri, index) => (
              <View key={index} style={{ position: 'relative' }}>
                <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                <TouchableOpacity
                  onPress={() => handleRemoveImage(index)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: isDark ? '#444' : '#666',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={12} color="#FFF" weight="bold" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Label pills row with + button - animated above keyboard */}
        <Animated.View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 8,
          zIndex: 100,
          transform: [{ translateY: Animated.multiply(keyboardHeight, -1) }],
        }}>
          {/* Label pills on left */}
          <TouchableOpacity
            onPress={handleAddLabelPress}
            activeOpacity={0.7}
            style={{ flex: 1 }}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 6 }}>
              {note.labels.length > 0 ? (
                note.labels.map((label, index) => {
                  const labelColor = getLabelColor(index, isDark);

                  return (
                    <View
                      key={label}
                      style={{
                        backgroundColor: labelColor.background,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: labelColor.text, fontWeight: '500' }}>
                        #{label}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <View
                  style={{
                    backgroundColor: isDark ? colors.backgroundTertiary : '#EFEFF0',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    fontWeight: '500',
                  }}>
                    + Add label
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* + button on right */}
          <View style={{ position: 'relative', zIndex: 100 }}>
            <TouchableOpacity
              onPress={() => setShowFormatMenu(!showFormatMenu)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                borderWidth: 1.5,
                borderColor: isDark ? '#555' : '#CCC',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDark ? '#2A2A2A' : '#FFF',
                marginLeft: 12,
              }}
            >
              <Plus size={18} color={isDark ? '#AAA' : '#666'} />
            </TouchableOpacity>

            {/* Format menu popup */}
            {showFormatMenu && (
              <View style={{
                position: 'absolute',
                bottom: 40,
                right: 0,
                backgroundColor: isDark ? '#333' : '#FFF',
                borderRadius: 12,
                paddingVertical: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 10,
                zIndex: 999,
                minWidth: 140,
              }}>
                <TouchableOpacity
                  onPress={handleAddCheckbox}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: editorMode === 'checklist' ? (isDark ? '#444' : '#E8E8E8') : 'transparent',
                  }}
                >
                  <CheckSquare size={20} color={editorMode === 'checklist' ? '#10B981' : (isDark ? '#AAA' : '#666')} weight={editorMode === 'checklist' ? 'fill' : 'regular'} />
                  <Text style={{ marginLeft: 12, fontSize: 14, color: editorMode === 'checklist' ? '#10B981' : (isDark ? '#EEE' : '#333') }}>
                    Checklist {editorMode === 'checklist' ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddBullet}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: editorMode === 'bullet' ? (isDark ? '#444' : '#E8E8E8') : 'transparent',
                  }}
                >
                  <ListBullets size={20} color={editorMode === 'bullet' ? '#10B981' : (isDark ? '#AAA' : '#666')} weight={editorMode === 'bullet' ? 'fill' : 'regular'} />
                  <Text style={{ marginLeft: 12, fontSize: 14, color: editorMode === 'bullet' ? '#10B981' : (isDark ? '#EEE' : '#333') }}>
                    Bullet {editorMode === 'bullet' ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddImage}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <ImageSquare size={20} color={isDark ? '#AAA' : '#666'} />
                  <Text style={{ marginLeft: 12, fontSize: 14, color: isDark ? '#EEE' : '#333' }}>
                    Image
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>

        </BackgroundLayer>
      </KeyboardAvoidingView>

      {/* Bottom Info Bar - Attached to screen bottom */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: isDark ? 'rgba(37, 33, 54, 0.8)' : 'rgba(237, 233, 254, 0.8)',
        }}
      >
        <Text
          style={{
            fontSize: 12,
            textAlign: 'center',
            color: isDark ? '#A8A8B8' : '#6B6B7B',
          }}
        >
          Edited {new Date(note.updatedAt).toLocaleString()}
        </Text>
      </View>

      {/* Design Picker Modal */}
      <Modal
        visible={showDesignPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDesignPicker(false)}
      >
        <View className="flex-1" style={{ backgroundColor: isDark ? 'rgba(15, 13, 21, 0.9)' : 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity
            className="flex-1"
            onPress={() => setShowDesignPicker(false)}
          />
          <View
            className="rounded-t-3xl"
            style={{
              backgroundColor: isDark ? '#1C1826' : '#FFFFFF',
              maxHeight: '80%',
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 pb-2">
              <Text
                className="text-lg font-semibold"
                style={{ color: isDark ? '#F5F3FF' : '#1A1625' }}
              >
                Apply Design
              </Text>
              <TouchableOpacity
                onPress={() => setShowDesignPicker(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isDark ? '#252136' : '#F5F3FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} color={isDark ? '#A8A8B8' : '#6B6B7B'} weight="regular" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            >

            {/* Create new design button */}
            <TouchableOpacity
              onPress={() => {
                setShowDesignPicker(false);
                router.push({
                  pathname: '/design/create',
                  params: { returnTo: 'note', noteId: id },
                });
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                marginBottom: 12,
                borderRadius: 9999,
                backgroundColor: '#8B5CF6',
              }}
            >
              <Plus size={18} color="#FFFFFF" weight="bold" />
              <Text style={{ marginLeft: 8, color: '#FFFFFF', fontWeight: '600' }}>
                Create New Design
              </Text>
            </TouchableOpacity>

            {/* Clear design button */}
            {activeDesign && (
              <TouchableOpacity
                onPress={handleClearDesign}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  marginBottom: 16,
                  borderRadius: 16,
                  backgroundColor: isDark ? '#252136' : '#F5F3FF',
                }}
              >
                <X size={18} color="#EF4444" weight="regular" />
                <Text style={{ marginLeft: 8, color: '#EF4444', fontWeight: '500' }}>
                  Remove Design
                </Text>
              </TouchableOpacity>
            )}

            {/* Note Color Section - disabled when a design is applied */}
            <View style={{ marginBottom: 20, opacity: activeDesign ? 0.4 : 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#10B981',
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isDark ? '#A8A8B8' : '#6B6B7B',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Note Color
                </Text>
                {activeDesign && (
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      color: isDark ? '#6B6B7B' : '#9CA3AF',
                      fontStyle: 'italic',
                    }}
                  >
                    (remove design to change)
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {NOTE_COLORS.map((c) => {
                  const isSelected = color === c.value;
                  return (
                    <TouchableOpacity
                      key={c.value}
                      onPress={() => !activeDesign && setColor(c.value)}
                      disabled={!!activeDesign}
                      style={{ alignItems: 'center' }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: c.value,
                          borderWidth: isSelected ? 3 : 2,
                          borderColor: isSelected ? '#8B5CF6' : (isDark ? '#3D3654' : '#DDD6FE'),
                          shadowColor: '#8B5CF6',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isSelected ? 0.3 : 0.1,
                          shadowRadius: 4,
                          elevation: 3,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && (
                          <Check
                            size={18}
                            color={c.value === NoteColor.White ? '#8B5CF6' : '#FFFFFF'}
                            weight="bold"
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 10,
                          marginTop: 4,
                          fontWeight: isSelected ? '600' : '400',
                          color: isSelected ? '#8B5CF6' : (isDark ? '#A8A8B8' : '#6B6B7B'),
                        }}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* My Designs Section */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#8B5CF6',
                  marginRight: 8,
                }}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isDark ? '#A8A8B8' : '#6B6B7B',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                My Designs
              </Text>
            </View>

            {designs.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Sparkle size={36} color={isDark ? '#A78BFA' : '#8B5CF6'} weight="duotone" />
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 12,
                    color: isDark ? '#A8A8B8' : '#6B6B7B',
                    fontSize: 13,
                  }}
                >
                  No custom designs yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={designs}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 20 }}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View className="flex-1 m-1">
                    <DesignCard
                      design={item}
                      onPress={() => handleApplyDesign(item)}
                      isDark={isDark}
                      isSelected={designId === item.id}
                      size="compact"
                    />
                  </View>
                )}
              />
            )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Analysis progress indicator - shows while analyzing note */}
      {isAnalyzing && <AnalysisProgressModal />}

      {/* Label suggestion toast - shows after analysis completes */}
      <LabelSuggestionToast onComplete={handleToastComplete} />

    </SafeAreaView>
  );
}
