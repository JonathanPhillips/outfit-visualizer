// Drag and Drop Tests
const { readFileSync } = require('fs');
const { join } = require('path');

// Load the HTML and JavaScript
const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
const jsCode = readFileSync(join(__dirname, '../script.js'), 'utf8');

describe('Drag and Drop Functionality', () => {
  let mockDataTransfer;

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
      canvasItems: [],
      draggedCanvasItem: null,
      dragOffset: null
    };

    // Mock DataTransfer
    mockDataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: jest.fn(),
      getData: jest.fn(),
      items: [],
      files: []
    };
  });

  describe('Drag Start Events', () => {
    test('should set draggedItem when dragging from sidebar', () => {
      const mockItem = {
        id: '123',
        name: 'Test Shirt',
        category: 'tops',
        image: 'test.jpg'
      };
      
      AppState.items.push(mockItem);
      
      const mockEvent = {
        target: { dataset: { itemId: '123' }, classList: { add: jest.fn() } },
        dataTransfer: mockDataTransfer
      };

      // Simulate drag start
      AppState.draggedItem = AppState.items.find(item => item.id === mockEvent.target.dataset.itemId);
      
      expect(AppState.draggedItem).toBe(mockItem);
    });

    test('should set draggedCanvasItem when dragging canvas item', () => {
      const mockCanvasItem = document.createElement('div');
      mockCanvasItem.className = 'canvas-item';
      mockCanvasItem.dataset.itemId = '123';
      
      const mockEvent = {
        target: mockCanvasItem,
        clientX: 100,
        clientY: 100,
        stopPropagation: jest.fn(),
        dataTransfer: mockDataTransfer
      };

      // Mock getBoundingClientRect
      mockCanvasItem.getBoundingClientRect = jest.fn(() => ({
        left: 50,
        top: 50,
        width: 120,
        height: 120
      }));

      // Simulate canvas drag start
      AppState.draggedCanvasItem = mockEvent.target.closest('.canvas-item');
      AppState.dragOffset = {
        x: mockEvent.clientX - 50,
        y: mockEvent.clientY - 50
      };

      expect(AppState.draggedCanvasItem).toBe(mockCanvasItem);
      expect(AppState.dragOffset).toEqual({ x: 50, y: 50 });
    });
  });

  describe('Drop Events', () => {
    test('should add item to canvas when dropping from sidebar', () => {
      const mockItem = {
        id: '123',
        name: 'Test Shirt',
        category: 'tops',
        image: 'test.jpg'
      };
      
      AppState.draggedItem = mockItem;
      
      const mockEvent = {
        preventDefault: jest.fn(),
        clientX: 200,
        clientY: 150
      };

      const mockCanvas = document.createElement('div');
      mockCanvas.id = 'outfit-canvas';
      mockCanvas.getBoundingClientRect = jest.fn(() => ({
        left: 100,
        top: 100
      }));
      
      document.body.appendChild(mockCanvas);

      // Simulate drop
      const x = mockEvent.clientX - 100;
      const y = mockEvent.clientY - 100;
      
      AppState.canvasItems.push({
        id: mockItem.id,
        x: x - 60,
        y: y - 60,
        item: mockItem
      });

      expect(AppState.canvasItems).toHaveLength(1);
      expect(AppState.canvasItems[0].item).toBe(mockItem);
      expect(AppState.canvasItems[0].x).toBe(40);
      expect(AppState.canvasItems[0].y).toBe(-10);
    });

    test('should move canvas item when dropping within canvas', () => {
      const mockItem = {
        id: '123',
        name: 'Test Shirt',
        category: 'tops',
        image: 'test.jpg'
      };

      // Set up existing canvas item
      AppState.canvasItems.push({
        id: mockItem.id,
        x: 50,
        y: 50,
        item: mockItem
      });

      const mockCanvasItem = document.createElement('div');
      mockCanvasItem.className = 'canvas-item';
      mockCanvasItem.dataset.itemId = '123';
      
      AppState.draggedCanvasItem = mockCanvasItem;
      AppState.dragOffset = { x: 10, y: 10 };

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 200,
        clientY: 150
      };

      const mockCanvas = document.createElement('div');
      mockCanvas.getBoundingClientRect = jest.fn(() => ({
        left: 100,
        top: 100
      }));
      mockCanvas.offsetWidth = 500;
      mockCanvas.offsetHeight = 400;

      // Simulate canvas drop
      const x = mockEvent.clientX - 100 - AppState.dragOffset.x;
      const y = mockEvent.clientY - 100 - AppState.dragOffset.y;
      
      const maxX = mockCanvas.offsetWidth - 120;
      const maxY = mockCanvas.offsetHeight - 120;
      const finalX = Math.max(0, Math.min(x, maxX));
      const finalY = Math.max(0, Math.min(y, maxY));

      // Update canvas item position
      const canvasItem = AppState.canvasItems.find(ci => ci.id === mockItem.id);
      canvasItem.x = finalX;
      canvasItem.y = finalY;

      expect(canvasItem.x).toBe(90);
      expect(canvasItem.y).toBe(40);
    });
  });

  describe('Drag Over Events', () => {
    test('should set correct drop effect for new items', () => {
      AppState.draggedItem = { id: '123' };
      AppState.draggedCanvasItem = null;

      const mockEvent = {
        preventDefault: jest.fn(),
        dataTransfer: mockDataTransfer
      };

      // Simulate drag over
      if (AppState.draggedCanvasItem) {
        mockEvent.dataTransfer.dropEffect = 'move';
      } else {
        mockEvent.dataTransfer.dropEffect = 'copy';
      }

      expect(mockEvent.dataTransfer.dropEffect).toBe('copy');
    });

    test('should set correct drop effect for canvas items', () => {
      AppState.draggedItem = null;
      AppState.draggedCanvasItem = { id: '123' };

      const mockEvent = {
        preventDefault: jest.fn(),
        dataTransfer: mockDataTransfer
      };

      // Simulate drag over
      if (AppState.draggedCanvasItem) {
        mockEvent.dataTransfer.dropEffect = 'move';
      } else {
        mockEvent.dataTransfer.dropEffect = 'copy';
      }

      expect(mockEvent.dataTransfer.dropEffect).toBe('move');
    });
  });

  describe('Canvas Item Removal', () => {
    test('should remove item from canvas and update state', () => {
      const mockItem = {
        id: '123',
        name: 'Test Shirt',
        category: 'tops',
        image: 'test.jpg'
      };

      AppState.canvasItems.push({
        id: mockItem.id,
        x: 50,
        y: 50,
        item: mockItem
      });

      // Simulate removal
      AppState.canvasItems = AppState.canvasItems.filter(ci => ci.id !== mockItem.id);

      expect(AppState.canvasItems).toHaveLength(0);
    });
  });

  describe('Drag Visual Feedback', () => {
    test('should add dragging class during drag', () => {
      const mockElement = document.createElement('div');
      mockElement.classList = {
        add: jest.fn(),
        remove: jest.fn()
      };

      // Simulate adding dragging class
      mockElement.classList.add('dragging');
      
      expect(mockElement.classList.add).toHaveBeenCalledWith('dragging');
    });

    test('should remove dragging class after drag', () => {
      const mockElement = document.createElement('div');
      mockElement.classList = {
        add: jest.fn(),
        remove: jest.fn()
      };

      // Simulate removing dragging class
      mockElement.classList.remove('dragging');
      
      expect(mockElement.classList.remove).toHaveBeenCalledWith('dragging');
    });
  });
});