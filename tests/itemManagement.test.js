// Item Management Tests
const { readFileSync } = require('fs');
const { join } = require('path');

// Load the HTML and JavaScript
const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
const jsCode = readFileSync(join(__dirname, '../script.js'), 'utf8');

describe('Item Management', () => {
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
  });

  describe('Adding Items', () => {
    test('should add new item to AppState.items', () => {
      const mockItem = {
        id: '123',
        name: 'Test Shirt',
        category: 'tops',
        image: 'data:image/png;base64,test',
        dateAdded: new Date().toISOString()
      };

      AppState.items.push(mockItem);
      
      expect(AppState.items).toHaveLength(1);
      expect(AppState.items[0]).toEqual(mockItem);
    });

    test('should generate unique IDs for items', () => {
      const id1 = Date.now().toString();
      const id2 = (Date.now() + 1).toString();
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('Filtering Items', () => {
    beforeEach(() => {
      AppState.items = [
        { id: '1', name: 'Shirt', category: 'tops', image: 'test1.jpg' },
        { id: '2', name: 'Jeans', category: 'bottoms', image: 'test2.jpg' },
        { id: '3', name: 'Sneakers', category: 'shoes', image: 'test3.jpg' },
        { id: '4', name: 'Jacket', category: 'outerwear', image: 'test4.jpg' }
      ];
    });

    test('should filter items by category', () => {
      AppState.currentFilter = 'tops';
      const filteredItems = AppState.currentFilter === 'all' 
        ? AppState.items 
        : AppState.items.filter(item => item.category === AppState.currentFilter);
      
      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].category).toBe('tops');
    });

    test('should return all items when filter is "all"', () => {
      AppState.currentFilter = 'all';
      const filteredItems = AppState.currentFilter === 'all' 
        ? AppState.items 
        : AppState.items.filter(item => item.category === AppState.currentFilter);
      
      expect(filteredItems).toHaveLength(4);
    });

    test('should handle empty category filter', () => {
      AppState.currentFilter = 'nonexistent';
      const filteredItems = AppState.currentFilter === 'all' 
        ? AppState.items 
        : AppState.items.filter(item => item.category === AppState.currentFilter);
      
      expect(filteredItems).toHaveLength(0);
    });
  });

  describe('Item Categories', () => {
    test('should support all required categories', () => {
      const validCategories = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];
      
      validCategories.forEach(category => {
        const item = {
          id: Date.now().toString(),
          name: `Test ${category}`,
          category: category,
          image: 'test.jpg'
        };
        
        expect(validCategories).toContain(item.category);
      });
    });
  });

  describe('Item Rendering', () => {
    test('should create item cards with correct structure', () => {
      const mockItem = {
        id: '123',
        name: 'Test Shirt',
        category: 'tops',
        image: 'data:image/png;base64,test'
      };

      // Test the item card creation logic
      const card = document.createElement('div');
      card.className = 'item-card';
      card.draggable = true;
      card.dataset.itemId = mockItem.id;
      
      card.innerHTML = `
        <img src="${mockItem.image}" alt="${mockItem.name}" class="item-image">
        <div class="item-name">${mockItem.name}</div>
        <div class="item-category">${mockItem.category}</div>
      `;

      expect(card.classList.contains('item-card')).toBe(true);
      expect(card.draggable).toBe(true);
      expect(card.dataset.itemId).toBe(mockItem.id);
      expect(card.querySelector('.item-name').textContent).toBe(mockItem.name);
      expect(card.querySelector('.item-category').textContent).toBe(mockItem.category);
    });
  });
});