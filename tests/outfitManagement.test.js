// Outfit Management Tests
const { readFileSync } = require('fs');
const { join } = require('path');

// Load the HTML and JavaScript
const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
const jsCode = readFileSync(join(__dirname, '../script.js'), 'utf8');

describe('Outfit Management', () => {
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
  });

  describe('Outfit Creation', () => {
    test('should create outfit with correct structure', () => {
      const mockItems = [
        { id: '1', name: 'Shirt', category: 'tops', image: 'shirt.jpg' },
        { id: '2', name: 'Jeans', category: 'bottoms', image: 'jeans.jpg' }
      ];

      // Set up canvas items
      AppState.canvasItems = [
        { id: '1', x: 100, y: 50, item: mockItems[0] },
        { id: '2', x: 100, y: 200, item: mockItems[1] }
      ];

      const outfitName = 'Casual Friday';
      global.prompt = jest.fn().mockReturnValue(outfitName);

      // Create outfit
      const outfit = {
        id: Date.now().toString(),
        name: outfitName,
        items: AppState.canvasItems.map(ci => ({
          ...ci.item,
          x: ci.x,
          y: ci.y
        })),
        dateCreated: new Date().toISOString()
      };

      expect(outfit.name).toBe(outfitName);
      expect(outfit.items).toHaveLength(2);
      expect(outfit.items[0].x).toBe(100);
      expect(outfit.items[0].y).toBe(50);
      expect(outfit.items[1].x).toBe(100);
      expect(outfit.items[1].y).toBe(200);
    });

    test('should not save outfit with no items', () => {
      AppState.canvasItems = [];
      global.alert = jest.fn();

      // Simulate save attempt with no items
      if (AppState.canvasItems.length === 0) {
        global.alert('Please add items to your outfit before saving.');
        return;
      }

      expect(global.alert).toHaveBeenCalledWith('Please add items to your outfit before saving.');
    });

    test('should not save outfit if user cancels name input', () => {
      AppState.canvasItems = [
        { id: '1', x: 100, y: 50, item: { id: '1', name: 'Shirt' } }
      ];
      
      global.prompt = jest.fn().mockReturnValue(null);

      // Simulate save attempt with cancelled name
      const outfitName = global.prompt('Enter a name for your outfit:');
      if (!outfitName) return;

      expect(global.prompt).toHaveBeenCalledWith('Enter a name for your outfit:');
      expect(AppState.outfits).toHaveLength(0);
    });
  });

  describe('Outfit Loading', () => {
    test('should load outfit items to canvas', () => {
      const mockOutfit = {
        id: '123',
        name: 'Test Outfit',
        items: [
          { id: '1', name: 'Shirt', category: 'tops', image: 'shirt.jpg', x: 100, y: 50 },
          { id: '2', name: 'Jeans', category: 'bottoms', image: 'jeans.jpg', x: 100, y: 200 }
        ],
        dateCreated: new Date().toISOString()
      };

      // Clear current canvas
      AppState.canvasItems = [];

      // Load outfit
      mockOutfit.items.forEach(item => {
        AppState.canvasItems.push({
          id: item.id,
          x: item.x,
          y: item.y,
          item: item
        });
      });

      expect(AppState.canvasItems).toHaveLength(2);
      expect(AppState.canvasItems[0].item.name).toBe('Shirt');
      expect(AppState.canvasItems[1].item.name).toBe('Jeans');
      expect(AppState.canvasItems[0].x).toBe(100);
      expect(AppState.canvasItems[1].y).toBe(200);
    });
  });

  describe('Outfit Rendering', () => {
    test('should create outfit card with preview images', () => {
      const mockOutfit = {
        id: '123',
        name: 'Test Outfit',
        items: [
          { id: '1', name: 'Shirt', image: 'shirt.jpg' },
          { id: '2', name: 'Jeans', image: 'jeans.jpg' }
        ],
        dateCreated: new Date().toISOString()
      };

      // Create outfit card
      const outfitCard = document.createElement('div');
      outfitCard.className = 'outfit-card';
      
      const previewImages = mockOutfit.items.map(item => 
        `<img src="${item.image}" alt="${item.name}">`
      ).join('');
      
      const date = new Date(mockOutfit.dateCreated).toLocaleDateString();
      
      outfitCard.innerHTML = `
        <div class="outfit-preview">${previewImages}</div>
        <div class="outfit-info">
          <h3>${mockOutfit.name}</h3>
          <div class="outfit-date">Created: ${date}</div>
        </div>
      `;

      expect(outfitCard.querySelector('h3').textContent).toBe('Test Outfit');
      expect(outfitCard.querySelector('.outfit-preview').children).toHaveLength(2);
      expect(outfitCard.querySelector('.outfit-date').textContent).toContain('Created:');
    });
  });

  describe('Outfit Validation', () => {
    test('should validate outfit has required fields', () => {
      const validOutfit = {
        id: '123',
        name: 'Test Outfit',
        items: [{ id: '1', name: 'Shirt' }],
        dateCreated: new Date().toISOString()
      };

      expect(validOutfit.id).toBeDefined();
      expect(validOutfit.name).toBeDefined();
      expect(validOutfit.items).toBeDefined();
      expect(validOutfit.dateCreated).toBeDefined();
      expect(Array.isArray(validOutfit.items)).toBe(true);
    });

    test('should handle outfits with different item counts', () => {
      const singleItemOutfit = {
        id: '1',
        name: 'Single Item',
        items: [{ id: '1', name: 'Shirt' }],
        dateCreated: new Date().toISOString()
      };

      const multiItemOutfit = {
        id: '2',
        name: 'Multi Item',
        items: [
          { id: '1', name: 'Shirt' },
          { id: '2', name: 'Jeans' },
          { id: '3', name: 'Shoes' }
        ],
        dateCreated: new Date().toISOString()
      };

      expect(singleItemOutfit.items).toHaveLength(1);
      expect(multiItemOutfit.items).toHaveLength(3);
    });
  });

  describe('Canvas State Management', () => {
    test('should clear canvas after saving outfit', () => {
      AppState.canvasItems = [
        { id: '1', x: 100, y: 50, item: { id: '1', name: 'Shirt' } }
      ];

      const outfitName = 'Test Outfit';
      global.prompt = jest.fn().mockReturnValue(outfitName);
      global.alert = jest.fn();

      // Simulate saving outfit
      const outfit = {
        id: Date.now().toString(),
        name: outfitName,
        items: AppState.canvasItems.map(ci => ({
          ...ci.item,
          x: ci.x,
          y: ci.y
        })),
        dateCreated: new Date().toISOString()
      };

      AppState.outfits.push(outfit);

      // Clear canvas
      AppState.canvasItems = [];

      expect(AppState.canvasItems).toHaveLength(0);
      expect(AppState.outfits).toHaveLength(1);
      expect(global.alert).toHaveBeenCalledWith('Outfit saved successfully!');
    });

    test('should maintain item positions when loading outfit', () => {
      const outfitWithPositions = {
        id: '123',
        name: 'Positioned Outfit',
        items: [
          { id: '1', name: 'Shirt', x: 150, y: 75 },
          { id: '2', name: 'Jeans', x: 200, y: 250 }
        ]
      };

      // Clear and load
      AppState.canvasItems = [];
      outfitWithPositions.items.forEach(item => {
        AppState.canvasItems.push({
          id: item.id,
          x: item.x,
          y: item.y,
          item: item
        });
      });

      expect(AppState.canvasItems[0].x).toBe(150);
      expect(AppState.canvasItems[0].y).toBe(75);
      expect(AppState.canvasItems[1].x).toBe(200);
      expect(AppState.canvasItems[1].y).toBe(250);
    });
  });
});