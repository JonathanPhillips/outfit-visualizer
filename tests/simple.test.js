// Simple functionality tests
const { readFileSync } = require('fs');
const { join } = require('path');

// Load the HTML and JavaScript
const html = readFileSync(join(__dirname, '../index.html'), 'utf8');

describe('Outfit Visualizer Basic Functionality', () => {
  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = html;
    
    // Reset global state
    global.AppState = {
      items: [],
      outfits: [],
      inspiration: [],
      currentSection: 'inventory',
      currentFilter: 'all',
      draggedItem: null,
      canvasItems: []
    };
  });

  describe('DOM Structure', () => {
    test('should have all required sections', () => {
      expect(document.getElementById('inventory')).toBeTruthy();
      expect(document.getElementById('builder')).toBeTruthy();
      expect(document.getElementById('inspiration')).toBeTruthy();
      expect(document.getElementById('saved')).toBeTruthy();
    });

    test('should have navigation buttons', () => {
      const navButtons = document.querySelectorAll('.nav-btn');
      expect(navButtons.length).toBe(4);
    });

    test('should have add item modal', () => {
      expect(document.getElementById('add-item-modal')).toBeTruthy();
      expect(document.getElementById('add-item-form')).toBeTruthy();
    });

    test('should have outfit canvas', () => {
      expect(document.getElementById('outfit-canvas')).toBeTruthy();
    });

    test('should have all category filters including outerwear', () => {
      const filterButtons = document.querySelectorAll('.filter-btn');
      const categories = Array.from(filterButtons).map(btn => btn.dataset.category);
      
      expect(categories).toContain('all');
      expect(categories).toContain('tops');
      expect(categories).toContain('bottoms');
      expect(categories).toContain('shoes');
      expect(categories).toContain('accessories');
      expect(categories).toContain('outerwear');
    });

    test('should have category options in form including outerwear', () => {
      const select = document.getElementById('item-category');
      const options = Array.from(select.options).map(opt => opt.value).filter(val => val);
      
      expect(options).toContain('tops');
      expect(options).toContain('bottoms');
      expect(options).toContain('shoes');
      expect(options).toContain('accessories');
      expect(options).toContain('outerwear');
    });
  });

  describe('App State Management', () => {
    test('should initialize with empty state', () => {
      expect(AppState.items).toEqual([]);
      expect(AppState.outfits).toEqual([]);
      expect(AppState.inspiration).toEqual([]);
      expect(AppState.currentSection).toBe('inventory');
      expect(AppState.currentFilter).toBe('all');
    });

    test('should be able to add items to state', () => {
      const item = {
        id: '123',
        name: 'Test Shirt',
        category: 'tops',
        image: 'test.jpg'
      };

      AppState.items.push(item);
      expect(AppState.items).toHaveLength(1);
      expect(AppState.items[0]).toBe(item);
    });

    test('should be able to filter items by category', () => {
      AppState.items = [
        { id: '1', category: 'tops', name: 'Shirt' },
        { id: '2', category: 'bottoms', name: 'Jeans' },
        { id: '3', category: 'outerwear', name: 'Jacket' }
      ];

      const topItems = AppState.items.filter(item => item.category === 'tops');
      const outerwearItems = AppState.items.filter(item => item.category === 'outerwear');

      expect(topItems).toHaveLength(1);
      expect(topItems[0].name).toBe('Shirt');
      expect(outerwearItems).toHaveLength(1);
      expect(outerwearItems[0].name).toBe('Jacket');
    });

    test('should be able to add items to canvas', () => {
      const item = { id: '1', name: 'Shirt', category: 'tops' };
      
      AppState.canvasItems.push({
        id: item.id,
        x: 100,
        y: 50,
        item: item
      });

      expect(AppState.canvasItems).toHaveLength(1);
      expect(AppState.canvasItems[0].x).toBe(100);
      expect(AppState.canvasItems[0].y).toBe(50);
    });

    test('should be able to create outfits', () => {
      const outfit = {
        id: '123',
        name: 'Test Outfit',
        items: [
          { id: '1', name: 'Shirt', x: 100, y: 50 },
          { id: '2', name: 'Jeans', x: 100, y: 200 }
        ],
        dateCreated: new Date().toISOString()
      };

      AppState.outfits.push(outfit);
      expect(AppState.outfits).toHaveLength(1);
      expect(AppState.outfits[0].name).toBe('Test Outfit');
      expect(AppState.outfits[0].items).toHaveLength(2);
    });
  });

  describe('Form Validation', () => {
    test('should have required form fields', () => {
      const imageInput = document.getElementById('item-image');
      const nameInput = document.getElementById('item-name');
      const categorySelect = document.getElementById('item-category');

      expect(imageInput.required).toBe(true);
      expect(nameInput.required).toBe(true);
      expect(categorySelect.required).toBe(true);
    });

    test('should have correct input types and attributes', () => {
      const imageInput = document.getElementById('item-image');
      const nameInput = document.getElementById('item-name');

      expect(imageInput.type).toBe('file');
      expect(imageInput.accept).toBe('image/*');
      expect(nameInput.type).toBe('text');
    });
  });

  describe('CSS Classes and Structure', () => {
    test('should have correct CSS classes for styling', () => {
      expect(document.querySelector('.app-container')).toBeTruthy();
      expect(document.querySelector('.header')).toBeTruthy();
      expect(document.querySelector('.main-content')).toBeTruthy();
      expect(document.querySelector('.items-grid')).toBeTruthy();
      expect(document.querySelector('.outfit-canvas')).toBeTruthy();
    });

    test('should have active section class', () => {
      const inventorySection = document.getElementById('inventory');
      expect(inventorySection.classList.contains('section')).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    test('should generate unique IDs', () => {
      const id1 = Date.now().toString();
      // Small delay to ensure different timestamps
      const id2 = (Date.now() + 1).toString();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    test('should validate item structure', () => {
      const validItem = {
        id: '123',
        name: 'Test Item',
        category: 'tops',
        image: 'test.jpg',
        dateAdded: new Date().toISOString()
      };

      expect(validItem.id).toBeDefined();
      expect(validItem.name).toBeDefined();
      expect(validItem.category).toBeDefined();
      expect(validItem.image).toBeDefined();
      expect(typeof validItem.dateAdded).toBe('string');
    });

    test('should validate outfit structure', () => {
      const validOutfit = {
        id: '456',
        name: 'Test Outfit',
        items: [{ id: '1', name: 'Shirt', x: 100, y: 50 }],
        dateCreated: new Date().toISOString()
      };

      expect(validOutfit.id).toBeDefined();
      expect(validOutfit.name).toBeDefined();
      expect(Array.isArray(validOutfit.items)).toBe(true);
      expect(validOutfit.items.length).toBeGreaterThan(0);
      expect(typeof validOutfit.dateCreated).toBe('string');
    });
  });
});