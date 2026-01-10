import { describe, it, expect, beforeEach } from 'vitest';
import { useDesignStore } from '@/stores/designStore';
import { NoteDesign } from '@toonnotes/types';

const createMockDesign = (overrides: Partial<NoteDesign> = {}): NoteDesign => ({
  id: 'test-design-' + Math.random().toString(36).substring(7),
  name: 'Test Design',
  sourceImageUri: 'https://example.com/image.jpg',
  createdAt: Date.now(),
  background: {
    primaryColor: '#ffffff',
    style: 'solid',
  },
  colors: {
    titleText: '#000000',
    bodyText: '#333333',
    accent: '#9333ea',
  },
  typography: {
    titleStyle: 'sans-serif',
    vibe: 'modern',
  },
  sticker: {
    id: 'sticker-1',
    imageUri: 'https://example.com/sticker.png',
    description: 'A cute character',
    suggestedPosition: 'bottom-right',
    scale: 'medium',
  },
  designSummary: 'A modern minimalist design',
  ...overrides,
});

describe('DesignStore', () => {
  beforeEach(() => {
    useDesignStore.setState({
      designs: [],
      isLoading: false,
      error: null,
    });
  });

  describe('Design CRUD Operations', () => {
    it('should add a design', () => {
      const design = createMockDesign();

      useDesignStore.getState().addDesign(design);

      const designs = useDesignStore.getState().designs;
      expect(designs).toHaveLength(1);
      expect(designs[0]).toEqual(design);
    });

    it('should add new designs at the beginning', () => {
      const design1 = createMockDesign({ id: 'design-1', name: 'First' });
      const design2 = createMockDesign({ id: 'design-2', name: 'Second' });

      useDesignStore.getState().addDesign(design1);
      useDesignStore.getState().addDesign(design2);

      const designs = useDesignStore.getState().designs;
      expect(designs[0].id).toBe('design-2');
      expect(designs[1].id).toBe('design-1');
    });

    it('should update a design', () => {
      const design = createMockDesign({ name: 'Original Name' });

      useDesignStore.getState().addDesign(design);
      useDesignStore.getState().updateDesign(design.id, { name: 'Updated Name' });

      const updatedDesign = useDesignStore.getState().getDesignById(design.id);
      expect(updatedDesign?.name).toBe('Updated Name');
    });

    it('should delete a design', () => {
      const design = createMockDesign();

      useDesignStore.getState().addDesign(design);
      expect(useDesignStore.getState().designs).toHaveLength(1);

      useDesignStore.getState().deleteDesign(design.id);
      expect(useDesignStore.getState().designs).toHaveLength(0);
    });
  });

  describe('Query Operations', () => {
    beforeEach(() => {
      // Add various types of designs
      useDesignStore.getState().addDesign(
        createMockDesign({
          id: 'user-design-1',
          name: 'User Design 1',
          isLabelPreset: false,
          isSystemDefault: false,
          createdAt: 1000,
        })
      );

      useDesignStore.getState().addDesign(
        createMockDesign({
          id: 'user-design-2',
          name: 'User Design 2',
          isLabelPreset: false,
          isSystemDefault: false,
          createdAt: 2000,
        })
      );

      useDesignStore.getState().addDesign(
        createMockDesign({
          id: 'label-preset-design',
          name: 'Label Preset',
          isLabelPreset: true,
          isSystemDefault: false,
          createdAt: 1500,
        })
      );

      useDesignStore.getState().addDesign(
        createMockDesign({
          id: 'system-design',
          name: 'System Default',
          isLabelPreset: false,
          isSystemDefault: true,
          createdAt: 500,
        })
      );
    });

    it('getDesignById should return the correct design', () => {
      const design = useDesignStore.getState().getDesignById('user-design-1');
      expect(design?.name).toBe('User Design 1');
    });

    it('getDesignById should return undefined for non-existent id', () => {
      const design = useDesignStore.getState().getDesignById('non-existent');
      expect(design).toBeUndefined();
    });

    it('getDesignById should return undefined for label-preset- prefixed ids', () => {
      // These are generated on-the-fly, not stored
      const design = useDesignStore.getState().getDesignById('label-preset-anime');
      expect(design).toBeUndefined();
    });

    it('getUserDesigns should exclude label presets and system defaults', () => {
      const userDesigns = useDesignStore.getState().getUserDesigns();

      expect(userDesigns).toHaveLength(2);
      expect(userDesigns.every((d) => !d.isLabelPreset && !d.isSystemDefault)).toBe(true);
    });

    it('getUserDesigns should be sorted by createdAt descending', () => {
      const userDesigns = useDesignStore.getState().getUserDesigns();

      expect(userDesigns[0].createdAt).toBeGreaterThan(userDesigns[1].createdAt);
    });

    it('getLabelPresetDesigns should only return label presets', () => {
      const labelPresets = useDesignStore.getState().getLabelPresetDesigns();

      expect(labelPresets).toHaveLength(1);
      expect(labelPresets[0].isLabelPreset).toBe(true);
    });
  });

  describe('State Management', () => {
    it('should set designs via setDesigns', () => {
      const designs = [createMockDesign(), createMockDesign()];

      useDesignStore.getState().setDesigns(designs);

      expect(useDesignStore.getState().designs).toEqual(designs);
    });

    it('should set loading state', () => {
      expect(useDesignStore.getState().isLoading).toBe(false);

      useDesignStore.getState().setLoading(true);
      expect(useDesignStore.getState().isLoading).toBe(true);

      useDesignStore.getState().setLoading(false);
      expect(useDesignStore.getState().isLoading).toBe(false);
    });

    it('should set error state', () => {
      expect(useDesignStore.getState().error).toBeNull();

      useDesignStore.getState().setError('Something went wrong');
      expect(useDesignStore.getState().error).toBe('Something went wrong');

      useDesignStore.getState().setError(null);
      expect(useDesignStore.getState().error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle updating non-existent design gracefully', () => {
      expect(() => {
        useDesignStore.getState().updateDesign('non-existent', { name: 'New Name' });
      }).not.toThrow();
    });

    it('should handle deleting non-existent design gracefully', () => {
      expect(() => {
        useDesignStore.getState().deleteDesign('non-existent');
      }).not.toThrow();
    });

    it('should handle empty designs array', () => {
      expect(useDesignStore.getState().getUserDesigns()).toEqual([]);
      expect(useDesignStore.getState().getLabelPresetDesigns()).toEqual([]);
    });
  });
});
