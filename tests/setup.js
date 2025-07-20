// Test setup file
// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => store[key] = value.toString()),
    removeItem: jest.fn((key) => delete store[key]),
    clear: jest.fn(() => store = {}),
    store
  };
})();
global.localStorage = localStorageMock;

// Mock FileReader
global.FileReader = jest.fn(() => ({
  readAsDataURL: jest.fn(function(file) {
    // Simulate successful file read
    setTimeout(() => {
      this.result = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      this.onload({ target: { result: this.result } });
    }, 0);
  }),
  result: null,
  onload: null,
}));

// Mock URL.createObjectURL
global.URL = {
  createObjectURL: jest.fn(() => 'mock-object-url'),
  revokeObjectURL: jest.fn(),
};

// Mock alert and prompt
global.alert = jest.fn();
global.prompt = jest.fn();

// Mock DOM methods that might not be available in jsdom
HTMLElement.prototype.scrollIntoView = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  localStorageMock.store = {};
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  global.alert.mockClear();
  global.prompt.mockClear();
});