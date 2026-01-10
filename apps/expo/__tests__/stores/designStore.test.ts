/**
 * Unit Tests for designStore
 */

import { useDesignStore } from '@/stores/designStore';
import { NoteDesign, BorderTemplate, BorderThickness } from '@/types';

// Helper to create a mock design
const createMockDesign = (overrides?: Partial<NoteDesign>): NoteDesign => ({
  id: `design-${Date.now()}`,
  name: 'Test Design',
  background: {
    style: 'solid',
    primaryColor: '#FFFFFF',
  },
  colors: {
    titleText: '#000000',
    bodyText: '#333333',
    accent: '#0066CC',
    border: '#CCCCCC',
  },
  border: {
    template: 'panel' as BorderTemplate,
    thickness: 'medium' as BorderThickness,
  },
  createdAt: Date.now(),
  ...overrides,
});

describe('designStore', () => {
  beforeEach(() => {
    useDesignStore.setState({ designs: [] });
  });

  describe('Design CRUD Operations', () => {
    it('should add a new design', () => {
      const store = useDesignStore.getState();
      const design = createMockDesign({ name: 'New Design' });

      store.addDesign(design);

      const designs = useDesignStore.getState().designs;
      expect(designs).toHaveLength(1);
      expect(designs[0].name).toBe('New Design');
    });

    it('should get design by id', () => {
      const store = useDesignStore.getState();
      const design = createMockDesign({ id: 'design-123' });

      store.addDesign(design);

      const found = useDesignStore.getState().getDesignById('design-123');
      expect(found?.id).toBe('design-123');
    });

    it('should return undefined for non-existent design', () => {
      const found = useDesignStore.getState().getDesignById('non-existent');
      expect(found).toBeUndefined();
    });

    it('should delete a design', () => {
      const store = useDesignStore.getState();
      const design = createMockDesign({ id: 'to-delete' });

      store.addDesign(design);
      expect(useDesignStore.getState().designs).toHaveLength(1);

      store.deleteDesign('to-delete');
      expect(useDesignStore.getState().designs).toHaveLength(0);
    });

    it('should update a design', () => {
      const store = useDesignStore.getState();
      const design = createMockDesign({ id: 'to-update', name: 'Original' });

      store.addDesign(design);
      store.updateDesign('to-update', { name: 'Updated' });

      const updated = useDesignStore.getState().getDesignById('to-update');
      expect(updated?.name).toBe('Updated');
    });
  });

  describe('Border Templates', () => {
    const templates: BorderTemplate[] = [
      'panel', 'webtoon', 'sketch', 'shoujo', 'vintage_manga', 'watercolor',
      'speech_bubble', 'pop', 'sticker', 'speed_lines', 'impact', 'glow'
    ];

    templates.forEach(template => {
      it(`should accept ${template} border template`, () => {
        const store = useDesignStore.getState();
        const design = createMockDesign({
          id: `design-${template}`,
          border: { template, thickness: 'medium' },
        });

        store.addDesign(design);

        const found = useDesignStore.getState().getDesignById(`design-${template}`);
        expect(found?.border.template).toBe(template);
      });
    });
  });

  describe('Background Styles', () => {
    it('should handle solid background', () => {
      const store = useDesignStore.getState();
      const design = createMockDesign({
        background: { style: 'solid', primaryColor: '#FF0000' },
      });

      store.addDesign(design);

      const found = useDesignStore.getState().designs[0];
      expect(found.background.style).toBe('solid');
      expect(found.background.primaryColor).toBe('#FF0000');
    });

    it('should handle gradient background', () => {
      const store = useDesignStore.getState();
      const design = createMockDesign({
        background: {
          style: 'gradient',
          primaryColor: '#FF0000',
          secondaryColor: '#0000FF',
        },
      });

      store.addDesign(design);

      const found = useDesignStore.getState().designs[0];
      expect(found.background.style).toBe('gradient');
      expect(found.background.secondaryColor).toBe('#0000FF');
    });
  });
});
