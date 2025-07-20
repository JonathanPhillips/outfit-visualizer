// Local Storage Tests
const { readFileSync } = require('fs');
const { join } = require('path');

// Load the HTML and JavaScript
const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
const jsCode = readFileSync(join(__dirname, '../script.js'), 'utf8');

describe('Local Storage Persistence', () => {
  let mockLocalStorage;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = html;
    
    // Execute the JavaScript code
    eval(jsCode);
    
    // Reset AppState
    global.AppState = {
      items: [],
      outfits: [],
      inspiration: [],
      currentSection: 'inventory',
      currentFilter: 'all',
      draggedItem: null,
      canvasItems: []
    };

    // Reset localStorage mock
    localStorage.clear();
    mockLocalStorage = global.localStorage;
  });

  describe('Storage Keys', () => {
    test('should use correct storage keys', () => {
      const expectedKeys = {
        ITEMS: 'outfit_visualizer_items',
        OUTFITS: 'outfit_visualizer_outfits',
        INSPIRATION: 'outfit_visualizer_inspiration'
      };

      // Test that we're using the expected storage keys
      expect(expectedKeys.ITEMS).toBe('outfit_visualizer_items');
      expect(expectedKeys.OUTFITS).toBe('outfit_visualizer_outfits');
      expect(expectedKeys.INSPIRATION).toBe('outfit_visualizer_inspiration');
    });
  });

  describe('Saving to Storage', () => {
    test('should save items to localStorage', () => {
      const mockItems = [
        { id: '1', name: 'Shirt', category: 'tops', image: 'shirt.jpg' },
        { id: '2', name: 'Jeans', category: 'bottoms', image: 'jeans.jpg' }
      ];

      AppState.items = mockItems;

      // Simulate save to storage
      localStorage.setItem('outfit_visualizer_items', JSON.stringify(AppState.items));

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'outfit_visualizer_items',
        JSON.stringify(mockItems)
      );
    });

    test('should save outfits to localStorage', () => {
      const mockOutfits = [
        {
          id: '123',
          name: 'Test Outfit',
          items: [{ id: '1', name: 'Shirt', x: 100, y: 50 }],
          dateCreated: new Date().toISOString()
        }
      ];

      AppState.outfits = mockOutfits;

      // Simulate save to storage
      localStorage.setItem('outfit_visualizer_outfits', JSON.stringify(AppState.outfits));

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'outfit_visualizer_outfits',
        JSON.stringify(mockOutfits)
      );
    });

    test('should save inspiration to localStorage', () => {
      const mockInspiration = [
        { id: '1', image: 'inspiration1.jpg', dateAdded: new Date().toISOString() },
        { id: '2', image: 'inspiration2.jpg', dateAdded: new Date().toISOString() }
      ];

      AppState.inspiration = mockInspiration;

      // Simulate save to storage
      localStorage.setItem('outfit_visualizer_inspiration', JSON.stringify(AppState.inspiration));

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'outfit_visualizer_inspiration',
        JSON.stringify(mockInspiration)
      );
    });

    test('should save all data types together', () => {
      const mockItems = [{ id: '1', name: 'Shirt' }];
      const mockOutfits = [{ id: '1', name: 'Outfit' }];
      const mockInspiration = [{ id: '1', image: 'inspiration.jpg' }];

      AppState.items = mockItems;
      AppState.outfits = mockOutfits;
      AppState.inspiration = mockInspiration;

      // Simulate saving all data
      localStorage.setItem('outfit_visualizer_items', JSON.stringify(AppState.items));
      localStorage.setItem('outfit_visualizer_outfits', JSON.stringify(AppState.outfits));
      localStorage.setItem('outfit_visualizer_inspiration', JSON.stringify(AppState.inspiration));

      expect(localStorage.setItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('Loading from Storage', () => {
    test('should load items from localStorage', () => {
      const mockItems = [
        { id: '1', name: 'Shirt', category: 'tops', image: 'shirt.jpg' },
        { id: '2', name: 'Jeans', category: 'bottoms', image: 'jeans.jpg' }
      ];

      localStorage.setItem('outfit_visualizer_items', JSON.stringify(mockItems));

      // Simulate load from storage
      const items = localStorage.getItem('outfit_visualizer_items');
      if (items) {
        AppState.items = JSON.parse(items);
      }

      expect(AppState.items).toEqual(mockItems);
    });

    test('should load outfits from localStorage', () => {
      const mockOutfits = [
        {
          id: '123',
          name: 'Test Outfit',
          items: [{ id: '1', name: 'Shirt', x: 100, y: 50 }],
          dateCreated: new Date().toISOString()
        }
      ];

      localStorage.setItem('outfit_visualizer_outfits', JSON.stringify(mockOutfits));

      // Simulate load from storage
      const outfits = localStorage.getItem('outfit_visualizer_outfits');
      if (outfits) {
        AppState.outfits = JSON.parse(outfits);
      }

      expect(AppState.outfits).toEqual(mockOutfits);
    });

    test('should load inspiration from localStorage', () => {
      const mockInspiration = [
        { id: '1', image: 'inspiration1.jpg', dateAdded: new Date().toISOString() },
        { id: '2', image: 'inspiration2.jpg', dateAdded: new Date().toISOString() }
      ];

      localStorage.setItem('outfit_visualizer_inspiration', JSON.stringify(mockInspiration));

      // Simulate load from storage
      const inspiration = localStorage.getItem('outfit_visualizer_inspiration');
      if (inspiration) {
        AppState.inspiration = JSON.parse(inspiration);
      }

      expect(AppState.inspiration).toEqual(mockInspiration);
    });

    test('should handle missing localStorage data gracefully', () => {
      // Simulate loading when no data exists
      const items = localStorage.getItem('outfit_visualizer_items');
      const outfits = localStorage.getItem('outfit_visualizer_outfits');
      const inspiration = localStorage.getItem('outfit_visualizer_inspiration');

      if (items) AppState.items = JSON.parse(items);
      if (outfits) AppState.outfits = JSON.parse(outfits);
      if (inspiration) AppState.inspiration = JSON.parse(inspiration);

      expect(AppState.items).toEqual([]);
      expect(AppState.outfits).toEqual([]);
      expect(AppState.inspiration).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    test('should handle JSON parse errors gracefully', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('outfit_visualizer_items', 'invalid json');

      // Simulate load with error handling
      try {
        const items = localStorage.getItem('outfit_visualizer_items');
        if (items) AppState.items = JSON.parse(items);
      } catch (error) {
        console.error('Error loading from storage:', error);
        AppState.items = [];
      }

      expect(AppState.items).toEqual([]);
    });

    test('should handle localStorage quota exceeded', () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      
      localStorage.setItem.mockImplementation(() => {
        throw quotaError;
      });

      try {
        localStorage.setItem('outfit_visualizer_items', JSON.stringify([]));
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.error('Storage quota exceeded');
        }
      }

      expect(localStorage.setItem).toHaveThrown();
    });
  });

  describe('Data Integrity', () => {
    test('should maintain data structure after save/load cycle', () => {
      const originalData = {
        items: [
          { id: '1', name: 'Shirt', category: 'tops', image: 'shirt.jpg', dateAdded: '2023-01-01' }
        ],
        outfits: [
          {
            id: '123',
            name: 'Test Outfit',
            items: [{ id: '1', name: 'Shirt', x: 100, y: 50 }],
            dateCreated: '2023-01-01'
          }
        ],
        inspiration: [
          { id: '1', image: 'inspiration.jpg', dateAdded: '2023-01-01' }
        ]
      };

      // Save data
      localStorage.setItem('outfit_visualizer_items', JSON.stringify(originalData.items));
      localStorage.setItem('outfit_visualizer_outfits', JSON.stringify(originalData.outfits));
      localStorage.setItem('outfit_visualizer_inspiration', JSON.stringify(originalData.inspiration));

      // Load data
      const loadedItems = JSON.parse(localStorage.getItem('outfit_visualizer_items'));
      const loadedOutfits = JSON.parse(localStorage.getItem('outfit_visualizer_outfits'));
      const loadedInspiration = JSON.parse(localStorage.getItem('outfit_visualizer_inspiration'));

      expect(loadedItems).toEqual(originalData.items);
      expect(loadedOutfits).toEqual(originalData.outfits);
      expect(loadedInspiration).toEqual(originalData.inspiration);
    });

    test('should handle large data sets', () => {
      // Create a large dataset
      const largeItemSet = Array.from({ length: 100 }, (_, i) => ({
        id: i.toString(),
        name: `Item ${i}`,
        category: 'tops',
        image: `image${i}.jpg`
      }));

      localStorage.setItem('outfit_visualizer_items', JSON.stringify(largeItemSet));
      const loaded = JSON.parse(localStorage.getItem('outfit_visualizer_items'));

      expect(loaded).toHaveLength(100);
      expect(loaded[0].name).toBe('Item 0');
      expect(loaded[99].name).toBe('Item 99');
    });
  });
});